"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const devkit_1 = require("@nrwl/devkit");
const utils_1 = require("../../utils");
const webpack_1 = require("../../webpack");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Service = require('@vue/cli-service/lib/Service');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { resolvePkg } = require('@vue/cli-shared-utils/lib/pkg');
const devServerBuilderOverriddenKeys = [
    'mode',
    'skipPlugins',
    'publicPath',
    'css',
    'stdin',
];
function modifyChalk(context) {
    // The vue-cli build command is not suitable for an nx project.
    // We spy on chalk to intercept the console output and replace
    // it with a nx command.
    // TODO: Find a better way to rewrite vue-cli console output
    const buildRegex = /([p]?npm run|yarn) build/;
    utils_1.modifyChalkOutput('cyan', (arg) => {
        if (buildRegex.test(arg)) {
            return arg.replace(buildRegex, `nx build ${context.projectName} --prod`);
        }
        return arg;
    });
}
function runExecutor(options, context) {
    return tslib_1.__asyncGenerator(this, arguments, function* runExecutor_1() {
        modifyChalk(context);
        // The `css` option must be `undefined` in order for the
        // browser builder option to serve as the default. JSON
        // Schema does not support setting a default value of
        // `undefined`.
        // TODO: Handle this less obtrusively.
        if (options.css.requireModuleExtension === undefined &&
            options.css.extract === undefined &&
            options.css.sourceMap === undefined &&
            !Object.keys(options.css.loaderOptions).length) {
            options.css = undefined;
        }
        const browserTarget = devkit_1.parseTargetString(options.browserTarget);
        const rawBrowserOptions = devkit_1.readTargetOptions(browserTarget, context);
        const overrides = Object.keys(options)
            .filter((key) => options[key] !== undefined &&
            devServerBuilderOverriddenKeys.includes(key))
            .reduce((previous, key) => (Object.assign(Object.assign({}, previous), { [key]: options[key] })), {});
        const browserOptions = Object.assign(Object.assign({}, rawBrowserOptions), overrides);
        const projectRoot = utils_1.getProjectRoot(context);
        const babelConfig = yield tslib_1.__await(utils_1.getBabelConfig(projectRoot));
        const inlineOptions = {
            chainWebpack: (config) => {
                webpack_1.modifyIndexHtmlPath(config, browserOptions, context);
                webpack_1.modifyEntryPoint(config, browserOptions, context);
                webpack_1.modifyTsConfigPaths(config, browserOptions, context);
                webpack_1.modifyCachePaths(config, context);
                webpack_1.modifyTypescriptAliases(config, browserOptions, context);
                if (babelConfig) {
                    webpack_1.modifyBabelLoader(config, babelConfig, context);
                }
                if (!options.watch) {
                    // There is no option to disable file watching in `webpack-dev-server`,
                    // but webpack's file watcher can be overriden.
                    config.plugin('vue-cli').use({
                        apply: (compiler) => {
                            compiler.hooks.afterEnvironment.tap('vue-cli', () => {
                                // eslint-disable-next-line @typescript-eslint/no-empty-function
                                compiler.watchFileSystem = { watch: () => { } };
                            });
                        },
                    });
                }
            },
            publicPath: browserOptions.publicPath,
            filenameHashing: browserOptions.filenameHashing,
            css: browserOptions.css,
            configureWebpack: utils_1.resolveConfigureWebpack(projectRoot),
            devServer: options.devServer,
            transpileDependencies: options.transpileDependencies,
        };
        utils_1.checkUnsupportedConfig(context, projectRoot);
        const service = new Service(projectRoot, {
            pkg: resolvePkg(context.root),
            inlineOptions,
        });
        const { url: baseUrl } = yield tslib_1.__await(service.run('serve', {
            open: options.open,
            copy: options.copy,
            stdin: options.stdin,
            mode: browserOptions.mode,
            host: options.host,
            port: options.port,
            https: options.https,
            public: options.public,
            transpileDependencies: options.transpileDependencies,
            'skip-plugins': browserOptions.skipPlugins,
        }, ['serve']));
        yield yield tslib_1.__await({ success: true, baseUrl });
        // This Promise intentionally never resolves, leaving the process running
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        yield tslib_1.__await(new Promise(() => { }));
    });
}
exports.default = runExecutor;
//# sourceMappingURL=executor.js.map