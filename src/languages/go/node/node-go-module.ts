/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import { ContainerModule } from "inversify";
import { LanguageContribution } from "../../node";
import { GoContribution } from './go-contribution';

export const nodeGoModule = new ContainerModule(bind => {
    bind<LanguageContribution>(LanguageContribution).to(GoContribution).inSingletonScope();
});
