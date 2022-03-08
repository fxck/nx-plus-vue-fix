import { Tree } from '@nrwl/devkit';
import { ComponentGeneratorSchema } from './schema';
export declare function componentGenerator(tree: Tree, schema: ComponentGeneratorSchema): Promise<void>;
export declare const componentSchematic: (options: ComponentGeneratorSchema) => (tree: any, context: any) => Promise<any>;
