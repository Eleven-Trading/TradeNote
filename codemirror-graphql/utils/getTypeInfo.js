"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var introspection_1 = require("graphql/type/introspection");
var forEachState_1 = __importDefault(require("./forEachState"));
function getTypeInfo(schema, tokenState) {
    var info = {
        schema: schema,
        type: null,
        parentType: null,
        inputType: null,
        directiveDef: null,
        fieldDef: null,
        argDef: null,
        argDefs: null,
        objectFieldDefs: null,
    };
    (0, forEachState_1.default)(tokenState, function (state) {
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
                info.parentType = info.type ? (0, graphql_1.getNamedType)(info.type) : null;
                break;
            case 'Directive':
                info.directiveDef = state.name ? schema.getDirective(state.name) : null;
                break;
            case 'Arguments':
                var parentDef = state.prevState
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
                    for (var i = 0; i < info.argDefs.length; i++) {
                        if (info.argDefs[i].name === state.name) {
                            info.argDef = info.argDefs[i];
                            break;
                        }
                    }
                }
                info.inputType = (_b = info.argDef) === null || _b === void 0 ? void 0 : _b.type;
                break;
            case 'EnumValue':
                var enumType = info.inputType ? (0, graphql_1.getNamedType)(info.inputType) : null;
                info.enumValue =
                    enumType instanceof graphql_1.GraphQLEnumType
                        ? find(enumType.getValues(), function (val) { return val.value === state.name; })
                        : null;
                break;
            case 'ListValue':
                var nullableType = info.inputType
                    ? (0, graphql_1.getNullableType)(info.inputType)
                    : null;
                info.inputType =
                    nullableType instanceof graphql_1.GraphQLList ? nullableType.ofType : null;
                break;
            case 'ObjectValue':
                var objectType = info.inputType ? (0, graphql_1.getNamedType)(info.inputType) : null;
                info.objectFieldDefs =
                    objectType instanceof graphql_1.GraphQLInputObjectType
                        ? objectType.getFields()
                        : null;
                break;
            case 'ObjectField':
                var objectField = state.name && info.objectFieldDefs
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
exports.default = getTypeInfo;
function getFieldDef(schema, type, fieldName) {
    if (fieldName === introspection_1.SchemaMetaFieldDef.name && schema.getQueryType() === type) {
        return introspection_1.SchemaMetaFieldDef;
    }
    if (fieldName === introspection_1.TypeMetaFieldDef.name && schema.getQueryType() === type) {
        return introspection_1.TypeMetaFieldDef;
    }
    if (fieldName === introspection_1.TypeNameMetaFieldDef.name && (0, graphql_1.isCompositeType)(type)) {
        return introspection_1.TypeNameMetaFieldDef;
    }
    if (type && type.getFields) {
        return type.getFields()[fieldName];
    }
}
function find(array, predicate) {
    for (var i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
            return array[i];
        }
    }
}
//# sourceMappingURL=getTypeInfo.js.map