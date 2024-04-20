"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var codemirror_1 = __importDefault(require("codemirror"));
var getTypeInfo_1 = __importDefault(require("./utils/getTypeInfo"));
var SchemaReference_1 = require("./utils/SchemaReference");
require("./utils/jump-addon");
codemirror_1.default.registerHelper('jump', 'graphql', function (token, options) {
    if (!options.schema || !options.onClick || !token.state) {
        return;
    }
    var state = token.state;
    var kind = state.kind, step = state.step;
    var typeInfo = (0, getTypeInfo_1.default)(options.schema, state);
    if ((kind === 'Field' && step === 0 && typeInfo.fieldDef) ||
        (kind === 'AliasedField' && step === 2 && typeInfo.fieldDef)) {
        return (0, SchemaReference_1.getFieldReference)(typeInfo);
    }
    if (kind === 'Directive' && step === 1 && typeInfo.directiveDef) {
        return (0, SchemaReference_1.getDirectiveReference)(typeInfo);
    }
    if (kind === 'Argument' && step === 0 && typeInfo.argDef) {
        return (0, SchemaReference_1.getArgumentReference)(typeInfo);
    }
    if (kind === 'EnumValue' && typeInfo.enumValue) {
        return (0, SchemaReference_1.getEnumValueReference)(typeInfo);
    }
    if (kind === 'NamedType' && typeInfo.type) {
        return (0, SchemaReference_1.getTypeReference)(typeInfo);
    }
});
//# sourceMappingURL=jump.js.map