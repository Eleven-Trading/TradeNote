import { getNamedType } from 'graphql';
export function getFieldReference(typeInfo) {
    return {
        kind: 'Field',
        schema: typeInfo.schema,
        field: typeInfo.fieldDef,
        type: isMetaField(typeInfo.fieldDef) ? null : typeInfo.parentType,
    };
}
export function getDirectiveReference(typeInfo) {
    return {
        kind: 'Directive',
        schema: typeInfo.schema,
        directive: typeInfo.directiveDef,
    };
}
export function getArgumentReference(typeInfo) {
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
export function getEnumValueReference(typeInfo) {
    return {
        kind: 'EnumValue',
        value: typeInfo.enumValue || undefined,
        type: typeInfo.inputType
            ? getNamedType(typeInfo.inputType)
            : undefined,
    };
}
export function getTypeReference(typeInfo, type) {
    return {
        kind: 'Type',
        schema: typeInfo.schema,
        type: type || typeInfo.type,
    };
}
function isMetaField(fieldDef) {
    return fieldDef.name.slice(0, 2) === '__';
}
//# sourceMappingURL=SchemaReference.js.map