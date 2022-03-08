"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyBabelLoader = exports.modifyCopyAssets = exports.modifyTypescriptAliases = exports.modifyCachePaths = exports.modifyTsConfigPaths = exports.modifyEntryPoint = exports.modifyIndexHtmlPath = void 0;
const path = require("path");
const semver = require("semver");
const utils_1 = require("./utils");
function modifyIndexHtmlPath(config, options, context) {
    config.plugin('html').tap((args) => {
        args[0].template = path.join(context.root, options.index);
        return args;
    });
}
exports.modifyIndexHtmlPath = modifyIndexHtmlPath;
function modifyEntryPoint(config, options, context) {
    config.entry('app').clear();
    config.entry('app').add(path.join(context.root, options.main));
}
exports.modifyEntryPoint = modifyEntryPoint;
function modifyTsConfigPaths(config, options, context) {
    const tsConfigPath = path.join(context.root, options.tsConfig);
    const vue = utils_1.loadModule('vue', context.root);
    const isVue3 = semver.major(vue.version) === 3;
    config.module
        .rule('ts')
        .use('ts-loader')
        .tap((loaderOptions) => {
        loaderOptions.configFile = tsConfigPath;
        return loaderOptions;
    });
    config.module
        .rule('tsx')
        .use('ts-loader')
        .tap((loaderOptions) => {
        loaderOptions.configFile = tsConfigPath;
        return loaderOptions;
    });
    config.plugin('fork-ts-checker').tap((args) => {
        if (isVue3) {
            args[0].typescript.configFile = tsConfigPath;
        }
        else {
            args[0].tsconfig = tsConfigPath;
        }
        return args;
    });
}
exports.modifyTsConfigPaths = modifyTsConfigPaths;
function modifyCachePaths(config, context) {
    const vueLoaderCachePath = path.join(context.root, 'node_modules/.cache/vue-loader');
    const tsLoaderCachePath = path.join(context.root, 'node_modules/.cache/ts-loader');
    config.module
        .rule('vue')
        .use('cache-loader')
        .tap((options) => {
        options.cacheDirectory = vueLoaderCachePath;
        return options;
    });
    config.module
        .rule('vue')
        .use('vue-loader')
        .tap((options) => {
        options.cacheDirectory = vueLoaderCachePath;
        return options;
    });
    config.module
        .rule('ts')
        .use('cache-loader')
        .tap((options) => {
        options.cacheDirectory = tsLoaderCachePath;
        return options;
    });
    config.module
        .rule('tsx')
        .use('cache-loader')
        .tap((options) => {
        options.cacheDirectory = tsLoaderCachePath;
        return options;
    });
}
exports.modifyCachePaths = modifyCachePaths;
function modifyTypescriptAliases(config, options, context) {
    const tsConfigPath = path.join(context.root, options.tsConfig);
    const extensions = [
        '.tsx',
        '.ts',
        '.mjs',
        '.js',
        '.jsx',
        '.vue',
        '.json',
        '.wasm',
    ];
    config.resolve.alias.delete('@');
    config.resolve
        .plugin('tsconfig-paths')
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .use(require('tsconfig-paths-webpack-plugin'), [
        {
            configFile: tsConfigPath,
            extensions,
        },
    ]);
}
exports.modifyTypescriptAliases = modifyTypescriptAliases;
function modifyCopyAssets(config, options, context, projectRoot) {
    const transformedAssetPatterns = ['package.json', 'README.md'].map((file) => ({
        from: path.join(projectRoot, file),
        to: path.join(context.root, options.dest),
    }));
    config
        .plugin('copy')
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        .use(require('copy-webpack-plugin'), [transformedAssetPatterns]);
}
exports.modifyCopyAssets = modifyCopyAssets;
function modifyBabelLoader(config, babelConfig, context) {
    ['js', 'ts', 'tsx'].forEach((ext) => config.module
        .rule(ext)
        .use('babel-loader')
        .tap((options) => (Object.assign(Object.assign({}, options), { configFile: babelConfig }))));
    const babelLoaderCachePath = path.join(context.root, 'node_modules/.cache/babel-loader');
    config.module
        .rule('js')
        .use('cache-loader')
        .tap((options) => {
        options.cacheDirectory = babelLoaderCachePath;
        return options;
    });
}
exports.modifyBabelLoader = modifyBabelLoader;
//# sourceMappingURL=webpack.js.map