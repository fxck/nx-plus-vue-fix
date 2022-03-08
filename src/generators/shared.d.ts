import { Tree } from '@nrwl/devkit';
import { ApplicationGeneratorSchema } from './application/schema';
import { LibraryGeneratorSchema } from './library/schema';
export declare type NormalizedVueSchema<T> = {
    name: string;
    projectName: string;
    projectRoot: string;
    projectDirectory: string;
    parsedTags: string[];
    isVue3: boolean;
} & T;
export declare function normalizeVueOptions<T extends LibraryGeneratorSchema | ApplicationGeneratorSchema>(tree: Tree, schema: T, type: 'library' | 'application'): NormalizedVueSchema<T>;
declare type Options = NormalizedVueSchema<ApplicationGeneratorSchema | LibraryGeneratorSchema>;
export declare function addJest(tree: Tree, options: Options): Promise<import("@nrwl/devkit").GeneratorCallback[]>;
export declare function addEsLint(tree: Tree, options: Options): Promise<import("@nrwl/devkit").GeneratorCallback[]>;
export declare function addPostInstall(tree: Tree): void;
export declare function addBabel(tree: Tree, options: Options): Promise<import("@nrwl/devkit").GeneratorCallback[]>;
export {};
