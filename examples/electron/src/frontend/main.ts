/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { Container } from "inversify";
import { FrontendApplication, browserApplicationModule } from "theia-core/lib/application/browser";
import { messagingModule } from "theia-core/lib/messaging/browser";
import { navigatorModule } from "theia-core/lib/navigator/browser";
import { fileSystemClientModule } from "theia-core/lib/filesystem/browser";
import { editorModule } from "theia-core/lib/editor/browser";
import { browserLanguagesModule } from 'theia-core/lib/languages/browser';
import { monacoModule } from 'theia-core/lib/monaco/browser';
import { electronClipboardModule } from 'theia-core/lib/application/electron-browser/clipboard/clipboard-module';
import { electronMenuModule } from 'theia-core/lib/application/electron-browser/menu/menu-module';
import "theia-core/src/application/browser/style/index.css";
import "theia-core/src/monaco/browser/style/index.css";
import "theia-core/src/navigator/browser/style/index.css";
import "theia-core/src/terminal/browser/terminal.css";

// terminal extension
import terminalFrontendModule from 'theia-core/lib/terminal/browser/terminal-frontend-module';
import "xterm/dist/xterm.css";

// java extension
import { browserJavaModule } from 'theia-core/lib/java/browser/browser-java-module';
import 'theia-core/lib/java/browser/monaco-contribution';

(() => {

    // Create the client container and load the common contributions.
    const container = new Container();
    container.load(browserApplicationModule);
    container.load(messagingModule);
    container.load(navigatorModule);
    container.load(fileSystemClientModule);
    container.load(editorModule);
    container.load(browserLanguagesModule);
    container.load(monacoModule);
    container.load(browserJavaModule);

    // Load the electron specific contributions.
    container.load(electronMenuModule);
    container.load(electronClipboardModule);

    // terminal extension
    container.load(terminalFrontendModule);

    // Obtain application and start.
    const application = container.get(FrontendApplication);
    application.start();

})();