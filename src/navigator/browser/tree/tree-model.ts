/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { inject, injectable } from "inversify";
import { DisposableCollection, Event, Emitter, SelectionProvider } from "../../../application/common";
import { ITree, ITreeNode, ICompositeTreeNode } from "./tree";
import { ITreeSelectionService, ISelectableTreeNode } from "./tree-selection";
import { ITreeExpansionService, IExpandableTreeNode } from "./tree-expansion";
import { ITreeNodeIterator, TreeNodeIterator, BackwardTreeNodeIterator } from "./tree-iterator";

/**
 * The tree model.
 */
export interface ITreeModel extends ITree, ITreeSelectionService, ITreeExpansionService {
    /**
     * Expand a node taking into the account node selection if a given node is undefined.
     */
    expandNode(node?: Readonly<IExpandableTreeNode>): boolean;
    /**
     * Collapse a node taking into the account node selection if a given node is undefined.
     */
    collapseNode(node?: Readonly<IExpandableTreeNode>): boolean;
    /**
     * Toggle node expansion taking into the account node selection if a given node is undefined.
     */
    toggleNodeExpansion(node?: Readonly<IExpandableTreeNode>): void;
    /**
     * Select prev node relatively to the selected taking into account node expansion.
     */
    selectPrevNode(): void;
    /**
     * Select next node relatively to the selected taking into account node expansion.
     */
    selectNextNode(): void;
    /**
     * Open a given node or a selected if the given is undefined.
     */
    openNode(node?: ITreeNode  |  undefined): void;
    /**
     * Select a parent node relatively to the selected taking into account node expansion.
     */
    selectParent(): void;
}

@injectable()
export class TreeModel implements ITreeModel, SelectionProvider<Readonly<ISelectableTreeNode>> {

    protected readonly onChangedEmitter = new Emitter<void>();
    protected readonly toDispose = new DisposableCollection();

    constructor( @inject(ITree) protected readonly tree: ITree,
        @inject(ITreeSelectionService) protected readonly selection: ITreeSelectionService,
        @inject(ITreeExpansionService) protected readonly expansion: ITreeExpansionService) {
        this.toDispose.push(tree);
        this.toDispose.push(tree.onChanged(() => this.fireChanged()));

        this.toDispose.push(selection);
        this.toDispose.push(selection.onSelectionChanged(() => this.fireChanged()));

        this.toDispose.push(expansion);
        this.toDispose.push(expansion.onExpansionChanged((node) => {
            this.fireChanged();
            if (!node.expanded && ICompositeTreeNode.isAncestor(node, this.selectedNode)) {
                this.selectNode(ISelectableTreeNode.isVisible(node) ? node : undefined);
            }
        }));

        this.toDispose.push(this.onChangedEmitter);
    }

    dispose() {
        this.toDispose.dispose();
    }

    get root() {
        return this.tree.root;
    }

    set root(root: ITreeNode | undefined) {
        this.tree.root = root;
    }

    get onChanged(): Event<void> {
        return this.onChangedEmitter.event;
    }

    protected fireChanged(): void {
        this.onChangedEmitter.fire(undefined);
    }

    get onNodeRefreshed() {
        return this.tree.onNodeRefreshed;
    }

    getNode(id: string | undefined) {
        return this.tree.getNode(id);
    }

    validateNode(node: ITreeNode | undefined) {
        return this.tree.validateNode(node);
    }

    refresh(parent?: Readonly<ICompositeTreeNode>): void {
        if (parent) {
            this.tree.refresh(parent);
        } else {
            this.tree.refresh();
        }
    }

    get selectedNode() {
        return this.selection.selectedNode;
    }

    get onSelectionChanged() {
        return this.selection.onSelectionChanged;
    }

    selectNode(node: ISelectableTreeNode | undefined): void {
        this.selection.selectNode(node);
    }

    get onExpansionChanged() {
        return this.expansion.onExpansionChanged;
    }

    expandNode(raw?: Readonly<IExpandableTreeNode>): boolean {
        const node = raw || this.selectedNode;
        if (IExpandableTreeNode.is(node)) {
            return this.expansion.expandNode(node);
        }
        return false;
    }

    collapseNode(raw?: Readonly<IExpandableTreeNode>): boolean {
        const node = raw || this.selectedNode;
        if (IExpandableTreeNode.is(node)) {
            return this.expansion.collapseNode(node);
        }
        return false;
    }

    toggleNodeExpansion(raw?: Readonly<IExpandableTreeNode>): void {
        const node = raw || this.selectedNode;
        if (IExpandableTreeNode.is(node)) {
            this.expansion.toggleNodeExpansion(node);
        }
    }

    selectPrevNode(): void {
        const node = this.selectedNode;
        const iterator = this.createBackwardIterator(node);
        this.selectNextVisibleNode(iterator);
    }

    selectNextNode(): void {
        const node = this.selectedNode;
        const iterator = this.createIterator(node);
        this.selectNextVisibleNode(iterator);
    }

    protected selectNextVisibleNode(iterator: ITreeNodeIterator): void {
        let result = iterator.next();
        while (!result.done && !ISelectableTreeNode.isVisible(result.value)) {
            result = iterator.next();
        }
        const node = result.value;
        if (ISelectableTreeNode.isVisible(node)) {
            this.selectNode(node);
        }
    }

    protected createBackwardIterator(node: ITreeNode | undefined): ITreeNodeIterator {
        return new BackwardTreeNodeIterator(node, {
            pruneCollapsed: true
        });
    }

    protected createIterator(node: ITreeNode | undefined): ITreeNodeIterator {
        return new TreeNodeIterator(node, {
            pruneCollapsed: true
        });
    }

    openNode(raw?: ITreeNode | undefined): void {
        const node = raw || this.selectedNode;
        if (node) {
            this.doOpenNode(node);
        }
    }

    protected doOpenNode(node: ITreeNode): void {
        if (IExpandableTreeNode.is(node)) {
            this.toggleNodeExpansion(node);
        }
    }

    selectParent(): void {
        const node = this.selectedNode;
        const parent = ISelectableTreeNode.getVisibleParent(node);
        if (parent) {
            this.selectNode(parent);
        }
    }

}
