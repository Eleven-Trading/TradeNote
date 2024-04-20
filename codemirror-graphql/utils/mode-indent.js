"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function indent(state, textAfter) {
    var _a, _b;
    var levels = state.levels, indentLevel = state.indentLevel;
    var level = !levels || levels.length === 0
        ? indentLevel
        : levels.at(-1) - (((_a = this.electricInput) === null || _a === void 0 ? void 0 : _a.test(textAfter)) ? 1 : 0);
    return (level || 0) * (((_b = this.config) === null || _b === void 0 ? void 0 : _b.indentUnit) || 0);
}
exports.default = indent;
//# sourceMappingURL=mode-indent.js.map