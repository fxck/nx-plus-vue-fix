import { Tree } from '@nrwl/devkit';
import { NormalizedVueSchema } from '../shared';
import { LibraryGeneratorSchema } from './schema';
export declare type NormalizedSchema = NormalizedVueSchema<LibraryGeneratorSchema>;
export declare function libraryGenerator(tree: Tree, schema: LibraryGeneratorSchema): Promise<import("@nrwl/devkit").GeneratorCallback>;
export declare const librarySchematic: (options: LibraryGeneratorSchema) => (tree: any, context: any) => Promise<any>;
