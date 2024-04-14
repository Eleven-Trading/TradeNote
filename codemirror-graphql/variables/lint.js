"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var codemirror_1 = __importDefault(require("codemirror"));
var graphql_1 = require("graphql");
var jsonParse_1 = __importStar(require("../utils/jsonParse"));
codemirror_1.default.registerHelper('lint', 'graphql-variables', function (text, options, editor) {
    if (!text) {
        return [];
    }
    var ast;
    try {
        ast = (0, jsonParse_1.default)(text);
    }
    catch (error) {
        if (error instanceof jsonParse_1.JSONSyntaxError) {
            return [lintError(editor, error.position, error.message)];
        }
        throw error;
    }
    var variableToType = options.variableToType;
    if (!variableToType) {
        return [];
    }
    return validateVariables(editor, variableToType, ast);
});
function validateVariables(editor, variableToType, variablesAST) {
    var e_1, _a, e_2, _b;
    var _c;
    var errors = [];
    try {
        for (var _d = __values(variablesAST.members), _e = _d.next(); !_e.done; _e = _d.next()) {
            var member = _e.value;
            if (member) {
                var variableName = (_c = member.key) === null || _c === void 0 ? void 0 : _c.value;
                var type = variableToType[variableName];
                if (type) {
                    try {
                        for (var _f = (e_2 = void 0, __values(validateValue(type, member.value))), _g = _f.next(); !_g.done; _g = _f.next()) {
                            var _h = __read(_g.value, 2), node = _h[0], message = _h[1];
                            errors.push(lintError(editor, node, message));
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
                else {
                    errors.push(lintError(editor, member.key, "Variable \"$".concat(variableName, "\" does not appear in any GraphQL query.")));
                }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return errors;
}
function validateValue(type, valueAST) {
    var e_3, _a;
    if (!type || !valueAST) {
        return [];
    }
    if (type instanceof graphql_1.GraphQLNonNull) {
        if (valueAST.kind === 'Null') {
            return [[valueAST, "Type \"".concat(type, "\" is non-nullable and cannot be null.")]];
        }
        return validateValue(type.ofType, valueAST);
    }
    if (valueAST.kind === 'Null') {
        return [];
    }
    if (type instanceof graphql_1.GraphQLList) {
        var itemType_1 = type.ofType;
        if (valueAST.kind === 'Array') {
            var values = valueAST.values || [];
            return mapCat(values, function (item) { return validateValue(itemType_1, item); });
        }
        return validateValue(itemType_1, valueAST);
    }
    if (type instanceof graphql_1.GraphQLInputObjectType) {
        if (valueAST.kind !== 'Object') {
            return [[valueAST, "Type \"".concat(type, "\" must be an Object.")]];
        }
        var providedFields_1 = Object.create(null);
        var fieldErrors = mapCat(valueAST.members, function (member) {
            var _a;
            var fieldName = (_a = member === null || member === void 0 ? void 0 : member.key) === null || _a === void 0 ? void 0 : _a.value;
            providedFields_1[fieldName] = true;
            var inputField = type.getFields()[fieldName];
            if (!inputField) {
                return [
                    [
                        member.key,
                        "Type \"".concat(type, "\" does not have a field \"").concat(fieldName, "\"."),
                    ],
                ];
            }
            var fieldType = inputField ? inputField.type : undefined;
            return validateValue(fieldType, member.value);
        });
        try {
            for (var _b = __values(Object.keys(type.getFields())), _c = _b.next(); !_c.done; _c = _b.next()) {
                var fieldName = _c.value;
                var field = type.getFields()[fieldName];
                if (!providedFields_1[fieldName] &&
                    field.type instanceof graphql_1.GraphQLNonNull &&
                    !field.defaultValue) {
                    fieldErrors.push([
                        valueAST,
                        "Object of type \"".concat(type, "\" is missing required field \"").concat(fieldName, "\"."),
                    ]);
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return fieldErrors;
    }
    if ((type.name === 'Boolean' && valueAST.kind !== 'Boolean') ||
        (type.name === 'String' && valueAST.kind !== 'String') ||
        (type.name === 'ID' &&
            valueAST.kind !== 'Number' &&
            valueAST.kind !== 'String') ||
        (type.name === 'Float' && valueAST.kind !== 'Number') ||
        (type.name === 'Int' &&
            (valueAST.kind !== 'Number' || (valueAST.value | 0) !== valueAST.value))) {
        return [[valueAST, "Expected value of type \"".concat(type, "\".")]];
    }
    if ((type instanceof graphql_1.GraphQLEnumType || type instanceof graphql_1.GraphQLScalarType) &&
        ((valueAST.kind !== 'String' &&
            valueAST.kind !== 'Number' &&
            valueAST.kind !== 'Boolean' &&
            valueAST.kind !== 'Null') ||
            isNullish(type.parseValue(valueAST.value)))) {
        return [[valueAST, "Expected value of type \"".concat(type, "\".")]];
    }
    return [];
}
function lintError(editor, node, message) {
    return {
        message: message,
        severity: 'error',
        type: 'validation',
        from: editor.posFromIndex(node.start),
        to: editor.posFromIndex(node.end),
    };
}
function isNullish(value) {
    return value === null || value === undefined || value !== value;
}
function mapCat(array, mapper) {
    return Array.prototype.concat.apply([], array.map(mapper));
}
//# sourceMappingURL=lint.js.map