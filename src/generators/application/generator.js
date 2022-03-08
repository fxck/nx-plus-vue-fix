"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationSchematic = exports.applicationGenerator = void 0;
const tslib_1 = require("tslib");
const devkit_1 = require("@nrwl/devkit");
const run_tasks_in_serial_1 = require("@nrwl/workspace/src/utilities/run-tasks-in-serial");
const path = require("path");
const utils_1 = require("../../utils");
const shared_1 = require("../shared");
function addFiles(tree, options) {
    const templateOptions = Object.assign(Object.assign(Object.assign({}, options), devkit_1.names(options.name)), { offsetFromRoot: devkit_1.offsetFromRoot(options.projectRoot), dot: '.', baseUrl: '<%= BASE_URL %>', htmlWebpackPluginTitle: '<%= htmlWebpackPlugin.options.title %>' });
    devkit_1.generateFiles(tree, path.join(__dirname, 'files'), options.projectRoot, templateOptions);
    const fileChanges = tree.listChanges();
    if (options.unitTestRunner === 'none') {
        const { path } = fileChanges.find(({ path }) => path.includes('example.spec.ts'));
        tree.delete(path);
    }
    if (!options.routing) {
        const routerFiles = [
            '/src/router/index.ts',
            '/src/views/About.vue',
            '/src/views/Home.vue',
        ];
        fileChanges
            .filter(({ path }) => routerFiles.some((file) => path.includes(file)))
            .forEach(({ path }) => tree.delete(path));
    }
    if (options.isVue3) {
        const { path } = fileChanges.find(({ path }) => path.includes('/src/shims-tsx.d.ts'));
        tree.delete(path);
    }
}
function addCypress(tree, options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { cypressInitGenerator, cypressProjectGenerator } = yield Promise.resolve().then(() => require('@nrwl/cypress'));
        const { Linter } = yield Promise.resolve().then(() => require('@nrwl/linter'));
        const cypressInitTask = yield cypressInitGenerator(tree);
        const cypressTask = yield cypressProjectGenerator(tree, {
            project: options.projectName,
            name: options.name + '-e2e',
            directory: options.directory,
            linter: Linter.EsLint,
            js: false,
        });
        const appSpecPath = options.projectRoot + '-e2e/src/integration/app.spec.ts';
        tree.write(appSpecPath, tree
            .read(appSpecPath)
            .toString('utf-8')
            .replace(`Welcome to ${options.projectName}!`, 'Welcome to Your Vue.js + TypeScript App'));
        return [cypressInitTask, cypressTask];
    });
}
function applicationGenerator(tree, schema) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        utils_1.checkPeerDeps(schema);
        const options = shared_1.normalizeVueOptions(tree, schema, 'application');
        devkit_1.addProjectConfiguration(tree, options.projectName, {
            root: options.projectRoot,
            projectType: 'application',
            sourceRoot: `${options.projectRoot}/src`,
            targets: {
                build: {
                    executor: '@nx-plus/vue:browser',
                    options: {
                        dest: `dist/${options.projectRoot}`,
                        index: `${options.projectRoot}/public/index.html`,
                        main: `${options.projectRoot}/src/main.ts`,
                        tsConfig: `${options.projectRoot}/tsconfig.app.json`,
                    },
                    configurations: {
                        production: {
                            mode: 'production',
                            filenameHashing: true,
                            productionSourceMap: true,
                            css: {
                                extract: true,
                                sourceMap: false,
                            },
                        },
                    },
                },
                serve: {
                    executor: '@nx-plus/vue:dev-server',
                    options: {
                        browserTarget: `${options.projectName}:build`,
                    },
                    configurations: {
                        production: {
                            browserTarget: `${options.projectName}:build:production`,
                        },
                    },
                },
            },
            tags: options.parsedTags,
        });
        addFiles(tree, options);
        const lintTasks = yield shared_1.addEsLint(tree, options);
        const cypressTasks = options.e2eTestRunner === 'cypress' ? yield addCypress(tree, options) : [];
        const jestTasks = options.unitTestRunner === 'jest' ? yield shared_1.addJest(tree, options) : [];
        const babelTasks = options.babel ? yield shared_1.addBabel(tree, options) : [];
        const installTask = devkit_1.addDependenciesToPackageJson(tree, Object.assign({ vue: options.isVue3 ? '^3.0.0' : '^2.6.11' }, (options.routing
            ? { 'vue-router': options.isVue3 ? '^4.0.0-0' : '^3.2.0' }
            : {})), Object.assign(Object.assign(Object.assign({ '@vue/cli-plugin-typescript': '~4.5.0', '@vue/cli-service': '~4.5.0' }, (options.isVue3 ? { '@vue/compiler-sfc': '^3.0.0' } : {})), { '@vue/eslint-config-typescript': '^5.0.2', 'eslint-plugin-vue': '^7.8.0' }), (!options.isVue3 ? { 'vue-template-compiler': '^2.6.11' } : {})));
        shared_1.addPostInstall(tree);
        if (!options.skipFormat) {
            yield devkit_1.formatFiles(tree);
        }
        return run_tasks_in_serial_1.runTasksInSerial(...lintTasks, ...cypressTasks, ...jestTasks, ...babelTasks, installTask);
    });
}
exports.applicationGenerator = applicationGenerator;
exports.applicationSchematic = devkit_1.convertNxGenerator(applicationGenerator);
//# sourceMappingURL=generator.js.map