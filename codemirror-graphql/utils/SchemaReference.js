"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypeReference = exports.getEnumValueReference = exports.getArgumentReference = exports.getDirectiveReference = exports.getFieldReference = void 0;
var graphql_1 = require("graphql");
function getFieldReference(typeInfo) {
    return {
        kind: 'Field',
        schema: typeInfo.schema,
        field: typeInfo.fieldDef,
        type: isMetaField(typeInfo.fieldDef) ? null : typeInfo.parentType,
    };
}
exports.getFieldReference = getFieldReference;
function getDirectiveReference(typeInfo) {
    return {
        kind: 'Directive',
        schema: typeInfo.schema,
        directive: typeInfo.directiveDef,
    };
}
exports.getDirectiveReference = getDirectiveReference;
function getArgumentReference(typeInfo) {
    return typeInfo.directiveDef
        ? {
            kind: 'Argument',
            schema: typeInfo.schema,
            argument: typeInfo.argDef,
            directive: typeInfo.directiveDef,
        }
        : {
            kind: 'Argument',
            schema: typeInfo.schema,
            argument: typeInfo.argDef,
            field: typeInfo.fieldDef,
            type: isMetaField(typeInfo.fieldDef) ? null : typeInfo.parentType,
        };
}
exports.getArgumentReference = getArgumentReference;
function getEnumValueReference(typeInfo) {
    return {
        kind: 'EnumValue',
        value: typeInfo.enumValue || undefined,
        type: typeInfo.inputType
            ? (0, graphql_1.getNamedType)(typeInfo.inputType)
            : undefined,
    };
}
exports.getEnumValueReference = getEnumValueReference;
function getTypeReference(typeInfo, type) {
    return {
        kind: 'Type',
        schema: typeInfo.schema,
        type: type || typeInfo.type,
    };
}
exports.getTypeReference = getTypeReference;
function isMetaField(fieldDef) {
    return fieldDef.name.slice(0, 2) === '__';
}
//# sourceMappingURL=SchemaReference.js.map