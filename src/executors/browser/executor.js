"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const utils_1 = require("../../utils");
const webpack_1 = require("../../webpack");
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Service = require('@vue/cli-service/lib/Service');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { resolvePkg } = require('@vue/cli-shared-utils/lib/pkg');
function modifyChalk(options) {
    // The compiled files output by vue-cli are not relative to the
    // root of the workspace. We can spy on chalk to intercept the
    // console output and transform any non-relative file paths.
    // TODO: Find a better way to rewrite vue-cli console output
    const chalkTransform = (arg) => {
        const normalizedArg = path.normalize(arg);
        return normalizedArg.includes(options.dest)
            ? options.dest + normalizedArg.split(options.dest)[1]
            : arg;
    };
    ['green', 'cyan', 'blue'].forEach((color) => utils_1.modifyChalkOutput(color, chalkTransform));
}
function runExecutor(options, context) {
    return tslib_1.__asyncGenerator(this, arguments, function* runExecutor_1() {
        try {
            modifyChalk(options);
            const projectRoot = yield tslib_1.__await(utils_1.getProjectRoot(context));
            const babelConfig = yield tslib_1.__await(utils_1.getBabelConfig(projectRoot));
            const inlineOptions = {
                chainWebpack: (config) => {
                    webpack_1.modifyIndexHtmlPath(config, options, context);
                    webpack_1.modifyEntryPoint(config, options, context);
                    webpack_1.modifyTsConfigPaths(config, options, context);
                    webpack_1.modifyCachePaths(config, context);
                    webpack_1.modifyTypescriptAliases(config, options, context);
                    if (babelConfig) {
                        webpack_1.modifyBabelLoader(config, babelConfig, context);
                    }
                },
                publicPath: options.publicPath,
                filenameHashing: options.filenameHashing,
                productionSourceMap: options.productionSourceMap,
                css: options.css,
                configureWebpack: utils_1.resolveConfigureWebpack(projectRoot),
                transpileDependencies: options.transpileDependencies,
            };
            utils_1.checkUnsupportedConfig(context, projectRoot);
            const service = new Service(projectRoot, {
                pkg: resolvePkg(context.root),
                inlineOptions,
            });
            const buildOptions = {
                mode: options.mode,
                dest: path.join(context.root, options.dest),
                modern: false,
                'unsafe-inline': true,
                clean: options.clean,
                report: options.report,
                'report-json': options.reportJson,
                'skip-plugins': options.skipPlugins,
                watch: options.watch,
                stdin: options.stdin,
                transpileDependencies: options.transpileDependencies,
            };
            yield tslib_1.__await(service.run('build', buildOptions, ['build']));
            yield yield tslib_1.__await({
                success: true,
            });
            if (options.watch) {
                // This Promise intentionally never resolves, leaving the process running
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                yield tslib_1.__await(new Promise(() => { }));
            }
        }
        catch (err) {
            yield yield tslib_1.__await({ success: false, error: err });
        }
    });
}
exports.default = runExecutor;
//# sourceMappingURL=executor.js.map