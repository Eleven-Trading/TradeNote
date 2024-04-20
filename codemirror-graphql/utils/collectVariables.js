"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
function collectVariables(schema, documentAST) {
    var e_1, _a, e_2, _b;
    var variableToType = Object.create(null);
    try {
        for (var _c = __values(documentAST.definitions), _d = _c.next(); !_d.done; _d = _c.next()) {
            var definition = _d.value;
            if (definition.kind === 'OperationDefinition') {
                var variableDefinitions = definition.variableDefinitions;
                if (variableDefinitions) {
                    try {
                        for (var variableDefinitions_1 = (e_2 = void 0, __values(variableDefinitions)), variableDefinitions_1_1 = variableDefinitions_1.next(); !variableDefinitions_1_1.done; variableDefinitions_1_1 = variableDefinitions_1.next()) {
                            var _e = variableDefinitions_1_1.value, variable = _e.variable, type = _e.type;
                            var inputType = (0, graphql_1.typeFromAST)(schema, type);
                            if (inputType) {
                                variableToType[variable.name.value] = inputType;
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (variableDefinitions_1_1 && !variableDefinitions_1_1.done && (_b = variableDefinitions_1.return)) _b.call(variableDefinitions_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return variableToType;
}
exports.default = collectVariables;
//# sourceMappingURL=collectVariables.js.map