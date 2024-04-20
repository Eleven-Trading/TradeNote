"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var codemirror_1 = __importDefault(require("codemirror"));
var mode_factory_1 = __importDefault(require("./utils/mode-factory"));
codemirror_1.default.defineMode('graphql', mode_factory_1.default);
//# sourceMappingURL=mode.js.map