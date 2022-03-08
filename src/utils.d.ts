import { ExecutorContext } from '@nrwl/devkit';
import { ApplicationGeneratorSchema } from './generators/application/schema';
export declare function getProjectRoot(context: ExecutorContext): string;
export declare function modifyChalkOutput(method: string, transform: (arg: string) => string): void;
export declare function checkUnsupportedConfig(context: ExecutorContext, projectRoot: string): Promise<void>;
export declare function resolveConfigureWebpack(projectRoot: string): Promise<any>;
export declare function loadModule(request: any, context: any, force?: boolean): any;
export declare function checkPeerDeps(options: ApplicationGeneratorSchema): void;
export declare function getBabelConfig(projectRoot: string): Promise<string | null>;
