"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBabelConfig = exports.checkPeerDeps = exports.loadModule = exports.resolveConfigureWebpack = exports.checkUnsupportedConfig = exports.modifyChalkOutput = exports.getProjectRoot = void 0;
const tslib_1 = require("tslib");
const devkit_1 = require("@nrwl/devkit");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path = require("path");
const semver = require("semver");
const app_root_1 = require("./app-root");
const readFileToString = (path) => promises_1.readFile(path).then((res) => res.toString());
const exists = (path) => promises_1.access(path, fs_1.constants.F_OK)
    .then(() => true)
    .catch(() => false);
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { chalk } = require('@vue/cli-shared-utils');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Module = require('module');
function getProjectRoot(context) {
    return path.join(context.root, context.workspace.projects[context.projectName].root);
}
exports.getProjectRoot = getProjectRoot;
function modifyChalkOutput(method, transform) {
    const originalChalkFn = chalk[method];
    Object.defineProperty(chalk, method, {
        get() {
            const newChalkFn = (...args) => originalChalkFn(...args.map(transform));
            Object.setPrototypeOf(newChalkFn, originalChalkFn);
            return newChalkFn;
        },
    });
}
exports.modifyChalkOutput = modifyChalkOutput;
function checkUnsupportedConfig(context, projectRoot) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const packageJson = JSON.parse(yield readFileToString(path.join(context.root, 'package.json')));
        const vueConfigExists = (yield exists(path.join(projectRoot, 'vue.config.js'))) ||
            (yield exists(path.join(projectRoot, 'vue.config.cjs')));
        const workspaceFileName = (yield exists(path.join(context.root, 'workspace.json')))
            ? 'workspace.json'
            : 'angular.json';
        if (packageJson.vue || vueConfigExists) {
            throw new Error(`You must specify vue-cli config options in '${workspaceFileName}'.`);
        }
    });
}
exports.checkUnsupportedConfig = checkUnsupportedConfig;
function resolveConfigureWebpack(projectRoot) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const configureWebpackPath = path.join(projectRoot, 'configure-webpack.js');
        return (yield exists(configureWebpackPath))
            ? require(configureWebpackPath)
            : undefined;
    });
}
exports.resolveConfigureWebpack = resolveConfigureWebpack;
function loadModule(request, context, force = false) {
    try {
        return createRequire(path.resolve(context, 'package.json'))(request);
    }
    catch (e) {
        const resolvedPath = require.resolve(request, { paths: [context] });
        if (resolvedPath) {
            if (force) {
                clearRequireCache(resolvedPath);
            }
            return require(resolvedPath);
        }
    }
}
exports.loadModule = loadModule;
// https://github.com/benmosher/eslint-plugin-import/pull/1591
// https://github.com/benmosher/eslint-plugin-import/pull/1602
// Polyfill Node's `Module.createRequireFromPath` if not present (added in Node v10.12.0)
// Use `Module.createRequire` if available (added in Node v12.2.0)
const createRequire = Module.createRequire ||
    Module.createRequireFromPath ||
    function (filename) {
        const mod = new Module(filename, null);
        mod.filename = filename;
        mod.paths = Module._nodeModulePaths(path.dirname(filename));
        mod._compile(`module.exports = require;`, filename);
        return mod.exports;
    };
function clearRequireCache(id, map = new Map()) {
    const module = require.cache[id];
    if (module) {
        map.set(id, true);
        // Clear children modules
        module.children.forEach((child) => {
            if (!map.get(child.id))
                clearRequireCache(child.id, map);
        });
        delete require.cache[id];
    }
}
function checkPeerDeps(options) {
    const expectedVersion = '^12.0.0';
    const unmetPeerDeps = [
        ...(options.e2eTestRunner === 'cypress' ? ['@nrwl/cypress'] : []),
        ...(options.unitTestRunner === 'jest' ? ['@nrwl/jest'] : []),
        '@nrwl/linter',
        '@nrwl/workspace',
    ].filter((dep) => {
        try {
            const { version } = loadModule(`${dep}/package.json`, app_root_1.appRootPath, true);
            return !semver.satisfies(version, expectedVersion);
        }
        catch (err) {
            return true;
        }
    });
    if (unmetPeerDeps.length) {
        devkit_1.logger.warn(`
You have the following unmet peer dependencies:

${unmetPeerDeps
            .map((dep) => `${dep}@${expectedVersion}\n`)
            .join()
            .split(',')
            .join('')}
@nx-plus/vite may not work as expected.
    `);
    }
}
exports.checkPeerDeps = checkPeerDeps;
function getBabelConfig(projectRoot) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const babelConfig = path.join(projectRoot, 'babel.config.js');
        return (yield exists(babelConfig)) ? babelConfig : null;
    });
}
exports.getBabelConfig = getBabelConfig;
//# sourceMappingURL=utils.js.map