"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBabel = exports.addPostInstall = exports.addEsLint = exports.addJest = exports.normalizeVueOptions = void 0;
const tslib_1 = require("tslib");
const devkit_1 = require("@nrwl/devkit");
function normalizeVueOptions(tree, schema, type) {
    const name = devkit_1.names(schema.name).fileName;
    const projectDirectory = schema.directory
        ? `${devkit_1.names(schema.directory).fileName}/${name}`
        : name;
    const dir = type === 'application' ? 'appsDir' : 'libsDir';
    const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
    const projectRoot = `${devkit_1.getWorkspaceLayout(tree)[dir]}/${projectDirectory}`;
    const parsedTags = schema.tags
        ? schema.tags.split(',').map((s) => s.trim())
        : [];
    const isVue3 = schema.vueVersion === 3;
    return Object.assign(Object.assign({}, schema), { name,
        projectName,
        projectRoot,
        projectDirectory,
        parsedTags,
        isVue3 });
}
exports.normalizeVueOptions = normalizeVueOptions;
function addJest(tree, options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { jestProjectGenerator, jestInitGenerator } = yield Promise.resolve().then(() => require('@nrwl/jest'));
        const jestInitTask = yield jestInitGenerator(tree, { babelJest: false });
        const jestTask = yield jestProjectGenerator(tree, {
            project: options.projectName,
            setupFile: 'none',
            skipSerializers: true,
            supportTsx: true,
            testEnvironment: 'jsdom',
            babelJest: false,
        });
        devkit_1.updateJson(tree, `${options.projectRoot}/tsconfig.spec.json`, (json) => {
            json.include = json.include.filter((pattern) => !/\.jsx?$/.test(pattern));
            json.compilerOptions = Object.assign(Object.assign({}, json.compilerOptions), { jsx: 'preserve', esModuleInterop: true, allowSyntheticDefaultImports: true });
            return json;
        });
        const content = `module.exports = {
  displayName: '${options.projectName}',
  preset: '${devkit_1.offsetFromRoot(options.projectRoot)}jest.preset.js',
  transform: {
    '^.+\\.vue$': '${options.isVue3 ? 'vue3-jest' : '@vue/vue2-jest'}',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ["ts", "tsx", "vue", "js", "json"],
  coverageDirectory: '${devkit_1.offsetFromRoot(options.projectRoot)}coverage/${options.projectRoot}',
  snapshotSerializers: ['jest-serializer-vue'],
  globals: {
    'ts-jest': { 
      tsconfig: '${options.projectRoot}/tsconfig.spec.json',
      ${options.babel
            ? `babelConfig: '${options.projectRoot}/babel.config.js',`
            : ''}
    },
    'vue-jest': {
      tsConfig: '${options.projectRoot}/tsconfig.spec.json',
      ${options.babel
            ? `babelConfig: '${options.projectRoot}/babel.config.js',`
            : ''}
    },
  },
};
`;
        tree.write(`${options.projectRoot}/jest.config.js`, content);
        const installTask = devkit_1.addDependenciesToPackageJson(tree, {}, {
            '@vue/test-utils': '^2.0.0-0',
            'jest-serializer-vue': '^2.0.2',
            'jest-transform-stub': '^2.0.0',
            'vue3-jest': '^27.0.0-alpha.1',
        });
        return [jestInitTask, jestTask, installTask];
    });
}
exports.addJest = addJest;
function getEslintConfig(options) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eslintConfig = {
        extends: [
            `${devkit_1.offsetFromRoot(options.projectRoot)}eslint.json`,
            `plugin:vue/${options.isVue3 ? 'vue3-' : ''}essential`,
            '@vue/typescript/recommended',
            'prettier',
        ],
        rules: {},
        env: {
            node: true,
        },
    };
    if (options.unitTestRunner === 'jest') {
        eslintConfig.overrides = [
            {
                files: ['**/*.spec.{j,t}s?(x)'],
                env: {
                    jest: true,
                },
            },
        ];
    }
    return eslintConfig;
}
function addEsLint(tree, options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const { lintProjectGenerator, Linter } = yield Promise.resolve().then(() => require('@nrwl/linter'));
        const lintTask = yield lintProjectGenerator(tree, {
            linter: Linter.EsLint,
            project: options.projectName,
            eslintFilePatterns: [`${options.projectRoot}/**/*.{ts,tsx,vue}`],
            skipFormat: true,
        });
        const content = JSON.stringify(getEslintConfig(options), null, 2);
        const configPath = `${options.projectRoot}/.eslintrc.json`;
        tree.write(configPath, content);
        const installTask = devkit_1.addDependenciesToPackageJson(tree, {}, {
            '@vue/eslint-config-prettier': '6.0.0',
            '@vue/eslint-config-typescript': '^5.0.2',
            'eslint-plugin-prettier': '^3.1.3',
            'eslint-plugin-vue': '^7.0.0-0',
        });
        return [lintTask, installTask];
    });
}
exports.addEsLint = addEsLint;
function addPostInstall(tree) {
    return devkit_1.updateJson(tree, 'package.json', (json) => {
        const vuePostInstall = 'node node_modules/@nx-plus/vue/patch-nx-dep-graph.js';
        const { postinstall } = json.scripts || {};
        if (postinstall) {
            if (postinstall !== vuePostInstall) {
                devkit_1.logger.warn("We couldn't add our postinstall script. Without it Nx's dependency graph won't support Vue files. For more information see https://github.com/ZachJW34/nx-plus/tree/master/libs/vue#nx-dependency-graph-support");
            }
            return json;
        }
        json.scripts = Object.assign(Object.assign({}, json.scripts), { postinstall: vuePostInstall });
        return json;
    });
}
exports.addPostInstall = addPostInstall;
function addBabel(tree, options) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const babelConfigPath = `${options.projectRoot}/babel.config.js`;
        tree.write(babelConfigPath, `module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"]
};`);
        const installTask = devkit_1.addDependenciesToPackageJson(tree, { 'core-js': '^3.6.5' }, { '@vue/cli-plugin-babel': '~4.5.0' });
        return [installTask];
    });
}
exports.addBabel = addBabel;
//# sourceMappingURL=shared.js.map