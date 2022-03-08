"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.componentSchematic = exports.componentGenerator = void 0;
const tslib_1 = require("tslib");
const devkit_1 = require("@nrwl/devkit");
const path = require("path");
function normalizeOptions(host, schema) {
    var _a, _b;
    const name = devkit_1.names(schema.name).className;
    const { projectType, sourceRoot } = devkit_1.readProjectConfiguration(host, schema.project);
    // depending on projectType build destination path of component
    const componentPath = projectType === 'application'
        ? `${sourceRoot}/${devkit_1.names((_a = schema.directory) !== null && _a !== void 0 ? _a : '').fileName}`
        : `${sourceRoot}/lib/${devkit_1.names((_b = schema.directory) !== null && _b !== void 0 ? _b : '').fileName}`;
    return Object.assign(Object.assign({}, schema), { name,
        componentPath });
}
function createComponent(tree, options) {
    const templateOptions = Object.assign(Object.assign({}, devkit_1.names(options.name)), options);
    devkit_1.generateFiles(tree, path.join(__dirname, 'files'), options.componentPath, templateOptions);
}
function componentGenerator(tree, schema) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const options = normalizeOptions(tree, schema);
        createComponent(tree, options);
        yield devkit_1.formatFiles(tree);
    });
}
exports.componentGenerator = componentGenerator;
exports.componentSchematic = devkit_1.convertNxGenerator(componentGenerator);
//# sourceMappingURL=generator.js.map