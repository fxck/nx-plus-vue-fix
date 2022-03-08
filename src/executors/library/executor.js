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
    var _a;
    return tslib_1.__asyncGenerator(this, arguments, function* runExecutor_1() {
        try {
            modifyChalk(options);
            const projectRoot = utils_1.getProjectRoot(context);
            const babelConfig = yield tslib_1.__await(utils_1.getBabelConfig(projectRoot));
            const inlineOptions = {
                chainWebpack: (config) => {
                    webpack_1.modifyTsConfigPaths(config, options, context);
                    webpack_1.modifyCachePaths(config, context);
                    webpack_1.modifyTypescriptAliases(config, options, context);
                    // modifyCopyAssets(config, options, context, projectRoot);
                    if (babelConfig) {
                        webpack_1.modifyBabelLoader(config, babelConfig, context);
                    }
                },
                css: options.css,
                configureWebpack: utils_1.resolveConfigureWebpack(projectRoot),
            };
            utils_1.checkUnsupportedConfig(context, projectRoot);
            const service = new Service(projectRoot, {
                pkg: resolvePkg(context.root),
                inlineOptions,
            });
            const buildOptions = {
                mode: 'production',
                dest: path.join(context.root, options.dest),
                clean: options.clean,
                report: options.report,
                'report-json': options.reportJson,
                'skip-plugins': options.skipPlugins,
                target: 'lib',
                entry: path.join(context.root, options.entry),
                'inline-vue': options.inlineVue,
                watch: options.watch,
                formats: options.formats,
                name: (_a = options.name) !== null && _a !== void 0 ? _a : context.targetName,
                filename: options.filename,
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