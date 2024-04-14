import { isCompositeType, getNullableType, getNamedType, GraphQLEnumType, GraphQLInputObjectType, GraphQLList, } from 'graphql';
import { SchemaMetaFieldDef, TypeMetaFieldDef, TypeNameMetaFieldDef, } from 'graphql/type/introspection';
import forEachState from './forEachState';
export default function getTypeInfo(schema, tokenState) {
    const info = {
        schema,
        type: null,
        parentType: null,
        inputType: null,
        directiveDef: null,
        fieldDef: null,
        argDef: null,
        argDefs: null,
        objectFieldDefs: null,
    };
    forEachState(tokenState, (state) => {
        var _a, _b;
        switch (state.kind) {
            case 'Query':
            case 'ShortQuery':
                info.type = schema.getQueryType();
                break;
            case 'Mutation':
                info.type = schema.getMutationType();
                break;
            case 'Subscription':
                info.type = schema.getSubscriptionType();
                break;
            case 'InlineFragment':
            case 'FragmentDefinition':
                if (state.type) {
                    info.type = schema.getType(state.type);
                }
                break;
            case 'Field':
            case 'AliasedField':
                info.fieldDef =
                    info.type && state.name
                        ? getFieldDef(schema, info.parentType, state.name)
                        : null;
                info.type = (_a = info.fieldDef) === null || _a === void 0 ? void 0 : _a.type;
                break;
            case 'SelectionSet':
                info.parentType = info.type ? getNamedType(info.type) : null;
                break;
            case 'Directive':
                info.directiveDef = state.name ? schema.getDirective(state.name) : null;
                break;
            case 'Arguments':
                const parentDef = state.prevState
                    ? state.prevState.kind === 'Field'
                        ? info.fieldDef
                        : state.prevState.kind === 'Directive'
                            ? info.directiveDef
                            : state.prevState.kind === 'AliasedField'
                                ? state.prevState.name &&
                                    getFieldDef(schema, info.parentType, state.prevState.name)
                                : null
                    : null;
                info.argDefs = parentDef ? parentDef.args : null;
                break;
            case 'Argument':
                info.argDef = null;
                if (info.argDefs) {
                    for (let i = 0; i < info.argDefs.length; i++) {
                        if (info.argDefs[i].name === state.name) {
                            info.argDef = info.argDefs[i];
                            break;
                        }
                    }
                }
                info.inputType = (_b = info.argDef) === null || _b === void 0 ? void 0 : _b.type;
                break;
            case 'EnumValue':
                const enumType = info.inputType ? getNamedType(info.inputType) : null;
                info.enumValue =
                    enumType instanceof GraphQLEnumType
                        ? find(enumType.getValues(), val => val.value === state.name)
                        : null;
                break;
            case 'ListValue':
                const nullableType = info.inputType
                    ? getNullableType(info.inputType)
                    : null;
                info.inputType =
                    nullableType instanceof GraphQLList ? nullableType.ofType : null;
                break;
            case 'ObjectValue':
                const objectType = info.inputType ? getNamedType(info.inputType) : null;
                info.objectFieldDefs =
                    objectType instanceof GraphQLInputObjectType
                        ? objectType.getFields()
                        : null;
                break;
            case 'ObjectField':
                const objectField = state.name && info.objectFieldDefs
                    ? info.objectFieldDefs[state.name]
                    : null;
                info.inputType = objectField === null || objectField === void 0 ? void 0 : objectField.type;
                break;
            case 'NamedType':
                info.type = state.name ? schema.getType(state.name) : null;
                break;
        }
    });
    return info;
}
function getFieldDef(schema, type, fieldName) {
    if (fieldName === SchemaMetaFieldDef.name && schema.getQueryType() === type) {
        return SchemaMetaFieldDef;
    }
    if (fieldName === TypeMetaFieldDef.name && schema.getQueryType() === type) {
        return TypeMetaFieldDef;
    }
    if (fieldName === TypeNameMetaFieldDef.name && isCompositeType(type)) {
        return TypeNameMetaFieldDef;
    }
    if (type && type.getFields) {
        return type.getFields()[fieldName];
    }
}
function find(array, predicate) {
    for (let i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
            return array[i];
        }
    }
}
//# sourceMappingURL=getTypeInfo.js.map