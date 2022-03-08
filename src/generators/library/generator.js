"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.librarySchematic = exports.libraryGenerator = void 0;
const tslib_1 = require("tslib");
const devkit_1 = require("@nrwl/devkit");
const project_configuration_1 = require("@nrwl/devkit/src/generators/project-configuration");
const run_tasks_in_serial_1 = require("@nrwl/workspace/src/utilities/run-tasks-in-serial");
const shared_1 = require("../shared");
const path = require("path");
function addFiles(tree, options) {
    const templateOptions = Object.assign(Object.assign(Object.assign({}, options), devkit_1.names(options.name)), { offsetFromRoot: devkit_1.offsetFromRoot(options.projectRoot) });
    devkit_1.generateFiles(tree, path.join(__dirname, 'files'), options.projectRoot, templateOptions);
    const fileChanges = tree.listChanges();
    fileChanges.forEach(({ path }) => {
        const shouldDelete = (options.unitTestRunner === 'none' &&
            path.includes('/tests/unit/example.spec.ts')) ||
            (!options.publishable && path.includes('/configure-webpack.js')) ||
            (options.isVue3 && path.includes('/src/shims-tsx.d.ts'));
        if (shouldDelete) {
            tree.delete(path);
        }
    });
}
function addPublishable(tree, options) {
    const npmScope = project_configuration_1.readNxJson(tree).npmScope;
    tree.write(`${options.projectRoot}/package.json`, JSON.stringify({
        name: `@${npmScope}/${options.name}`,
        version: '0.0.0',
    }));
}
function updateTsConfig(tree, options) {
    const nxJson = project_configuration_1.readNxJson(tree);
    devkit_1.updateJson(tree, 'tsconfig.base.json', (json) => {
        const c = json.compilerOptions;
        c.paths = c.paths || {};
        delete c.paths[options.name];
        c.paths[`@${nxJson.npmScope}/${options.projectDirectory}`] = [
            `${options.projectRoot}/src/index.ts`,
        ];
        return json;
    });
}
function libraryGenerator(tree, schema) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const options = shared_1.normalizeVueOptions(tree, schema, 'library');
        devkit_1.addProjectConfiguration(tree, options.projectName, {
            root: options.projectRoot,
            projectType: 'library',
            sourceRoot: `${options.projectRoot}/src`,
            targets: options.publishable
                ? {
                    build: {
                        executor: '@nx-plus/vue:library',
                        options: {
                            dest: `dist/${options.projectRoot}`,
                            entry: `${options.projectRoot}/src/index.ts`,
                            tsConfig: `${options.projectRoot}/tsconfig.lib.json`,
                        },
                    },
                }
                : {},
            tags: options.parsedTags,
        });
        addFiles(tree, options);
        shared_1.addPostInstall(tree);
        if (!options.skipTsConfig) {
            updateTsConfig(tree, options);
        }
        if (options.publishable) {
            addPublishable(tree, options);
        }
        const lintTasks = yield shared_1.addEsLint(tree, options);
        const jestTasks = options.unitTestRunner === 'jest' ? yield shared_1.addJest(tree, options) : [];
        const babelTasks = options.babel ? yield shared_1.addBabel(tree, options) : [];
        const installTask = devkit_1.addDependenciesToPackageJson(tree, {
            vue: options.isVue3 ? '^3.0.0' : '^2.6.11',
        }, Object.assign(Object.assign(Object.assign({ '@vue/cli-plugin-typescript': '~4.5.0', '@vue/cli-service': '~4.5.0' }, (options.isVue3 ? { '@vue/compiler-sfc': '^3.0.0' } : {})), { '@vue/eslint-config-typescript': '^5.0.2', 'eslint-plugin-vue': '^7.8.0' }), (!options.isVue3 ? { 'vue-template-compiler': '^2.6.11' } : {})));
        if (!options.skipFormat) {
            yield devkit_1.formatFiles(tree);
        }
        return run_tasks_in_serial_1.runTasksInSerial(...lintTasks, ...jestTasks, ...babelTasks, installTask);
    });
}
exports.libraryGenerator = libraryGenerator;
exports.librarySchematic = devkit_1.convertNxGenerator(libraryGenerator);
//# sourceMappingURL=generator.js.map