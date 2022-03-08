"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vuexGenerator = exports.libraryGenerator = exports.componentGenerator = exports.applicationGenerator = void 0;
var generator_1 = require("./generators/application/generator");
Object.defineProperty(exports, "applicationGenerator", { enumerable: true, get: function () { return generator_1.applicationGenerator; } });
var generator_2 = require("./generators/component/generator");
Object.defineProperty(exports, "componentGenerator", { enumerable: true, get: function () { return generator_2.componentGenerator; } });
var generator_3 = require("./generators/library/generator");
Object.defineProperty(exports, "libraryGenerator", { enumerable: true, get: function () { return generator_3.libraryGenerator; } });
var generator_4 = require("./generators/vuex/generator");
Object.defineProperty(exports, "vuexGenerator", { enumerable: true, get: function () { return generator_4.vuexGenerator; } });
//# sourceMappingURL=index.js.map