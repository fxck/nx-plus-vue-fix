import { Tree as DevkitTree } from '@nrwl/devkit';
import { VuexGeneratorSchema } from './schema';
export declare function vuexGenerator(tree: DevkitTree, schema: VuexGeneratorSchema): Promise<import("@nrwl/devkit").GeneratorCallback>;
export declare const vuexSchematic: (options: VuexGeneratorSchema) => (tree: any, context: any) => Promise<any>;
