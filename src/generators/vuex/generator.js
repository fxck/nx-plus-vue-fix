"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vuexSchematic = exports.vuexGenerator = void 0;
const tslib_1 = require("tslib");
const devkit_1 = require("@nrwl/devkit");
const workspace_1 = require("@nrwl/workspace");
const run_tasks_in_serial_1 = require("@nrwl/workspace/src/utilities/run-tasks-in-serial");
const path = require("path");
const semver = require("semver");
const ts = require("typescript");
const app_root_1 = require("../../app-root");
const utils_1 = require("../../utils");
function normalizeOptions(schema) {
    const vue = utils_1.loadModule('vue', app_root_1.appRootPath);
    const isVue3 = semver.major(vue.version) === 3;
    return Object.assign(Object.assign({}, schema), { isVue3 });
}
function addStoreConfig(tree, options) {
    const { sourceRoot } = devkit_1.readProjectConfiguration(tree, options.project);
    const vue2Content = `
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {}
});
`;
    const vue3Content = `
import { createStore } from 'vuex';

export default createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {}
});
`;
    tree.write(path.join(sourceRoot, 'store/index.ts'), options.isVue3 ? vue3Content : vue2Content);
}
function getNewVueExpression(sourceFile) {
    const callExpressions = workspace_1.findNodes(sourceFile, ts.SyntaxKind.CallExpression);
    for (const callExpr of callExpressions) {
        const { expression: innerExpr } = callExpr;
        if (ts.isPropertyAccessExpression(innerExpr) &&
            /new Vue/.test(innerExpr.expression.getText())) {
            return innerExpr.expression;
        }
    }
    return null;
}
function getCreateAppCallExpression(sourceFile) {
    const callExpressions = workspace_1.findNodes(sourceFile, ts.SyntaxKind.CallExpression);
    return callExpressions.find((callExpr) => callExpr.expression.getText() === 'createApp');
}
function addStoreToMain(tree, options) {
    const { sourceRoot } = devkit_1.readProjectConfiguration(tree, options.project);
    const mainPath = path.join(sourceRoot, 'main.ts');
    const mainContent = tree.read(mainPath).toString();
    if (!tree.exists(mainPath)) {
        throw new Error(`Could not find ${mainPath}.`);
    }
    const mainSourceFile = ts.createSourceFile(mainPath, mainContent, ts.ScriptTarget.Latest, true);
    let position;
    let content;
    if (options.isVue3) {
        const createAppCallExpression = getCreateAppCallExpression(mainSourceFile);
        if (!createAppCallExpression) {
            throw new Error(`Could not find 'createApp' call in ${mainPath}.`);
        }
        position = createAppCallExpression.end;
        content = '.use(store)';
    }
    else {
        const newVueExpression = getNewVueExpression(mainSourceFile);
        if (!newVueExpression) {
            throw new Error(`Could not find Vue instantiation in ${mainPath}.`);
        }
        position = newVueExpression.arguments[0].getStart() + 1;
        content = '\n  store,';
    }
    const updatedMainContent = devkit_1.applyChangesToString(mainContent, [
        {
            type: devkit_1.ChangeType.Insert,
            index: 0,
            text: "import store from './store';\n",
        },
        {
            type: devkit_1.ChangeType.Insert,
            index: position,
            text: content,
        },
    ]);
    tree.write(mainPath, updatedMainContent);
}
function vuexGenerator(tree, schema) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const options = normalizeOptions(schema);
        addStoreConfig(tree, options);
        addStoreToMain(tree, options);
        const installTask = devkit_1.addDependenciesToPackageJson(tree, {
            vuex: options.isVue3 ? '^4.0.0-0' : '^3.4.0',
        }, {});
        if (!options.skipFormat) {
            yield devkit_1.formatFiles(tree);
        }
        return run_tasks_in_serial_1.runTasksInSerial(installTask);
    });
}
exports.vuexGenerator = vuexGenerator;
exports.vuexSchematic = devkit_1.convertNxGenerator(vuexGenerator);
//# sourceMappingURL=generator.js.map