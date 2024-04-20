"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var codemirror_1 = __importDefault(require("codemirror"));
var graphql_1 = require("graphql");
var forEachState_1 = __importDefault(require("../utils/forEachState"));
var hintList_1 = __importDefault(require("../utils/hintList"));
codemirror_1.default.registerHelper('hint', 'graphql-variables', function (editor, options) {
    var cur = editor.getCursor();
    var token = editor.getTokenAt(cur);
    var results = getVariablesHint(cur, token, options);
    if ((results === null || results === void 0 ? void 0 : results.list) && results.list.length > 0) {
        results.from = codemirror_1.default.Pos(results.from.line, results.from.ch);
        results.to = codemirror_1.default.Pos(results.to.line, results.to.ch);
        codemirror_1.default.signal(editor, 'hasCompletion', editor, results, token);
    }
    return results;
});
function getVariablesHint(cur, token, options) {
    var state = token.state.kind === 'Invalid' ? token.state.prevState : token.state;
    var kind = state.kind, step = state.step;
    if (kind === 'Document' && step === 0) {
        return (0, hintList_1.default)(cur, token, [{ text: '{' }]);
    }
    var variableToType = options.variableToType;
    if (!variableToType) {
        return;
    }
    var typeInfo = getTypeInfo(variableToType, token.state);
    if (kind === 'Document' || (kind === 'Variable' && step === 0)) {
        var variableNames = Object.keys(variableToType);
        return (0, hintList_1.default)(cur, token, variableNames.map(function (name) { return ({
            text: "\"".concat(name, "\": "),
            type: variableToType[name],
        }); }));
    }
    if ((kind === 'ObjectValue' || (kind === 'ObjectField' && step === 0)) &&
        typeInfo.fields) {
        var inputFields = Object.keys(typeInfo.fields).map(function (fieldName) { return typeInfo.fields[fieldName]; });
        return (0, hintList_1.default)(cur, token, inputFields.map(function (field) { return ({
            text: "\"".concat(field.name, "\": "),
            type: field.type,
            description: field.description,
        }); }));
    }
    if (kind === 'StringValue' ||
        kind === 'NumberValue' ||
        kind === 'BooleanValue' ||
        kind === 'NullValue' ||
        (kind === 'ListValue' && step === 1) ||
        (kind === 'ObjectField' && step === 2) ||
        (kind === 'Variable' && step === 2)) {
        var namedInputType_1 = typeInfo.type
            ? (0, graphql_1.getNamedType)(typeInfo.type)
            : undefined;
        if (namedInputType_1 instanceof graphql_1.GraphQLInputObjectType) {
            return (0, hintList_1.default)(cur, token, [{ text: '{' }]);
        }
        if (namedInputType_1 instanceof graphql_1.GraphQLEnumType) {
            var values = namedInputType_1.getValues();
            return (0, hintList_1.default)(cur, token, values.map(function (value) { return ({
                text: "\"".concat(value.name, "\""),
                type: namedInputType_1,
                description: value.description,
            }); }));
        }
        if (namedInputType_1 === graphql_1.GraphQLBoolean) {
            return (0, hintList_1.default)(cur, token, [
                { text: 'true', type: graphql_1.GraphQLBoolean, description: 'Not false.' },
                { text: 'false', type: graphql_1.GraphQLBoolean, description: 'Not true.' },
            ]);
        }
    }
}
function getTypeInfo(variableToType, tokenState) {
    var info = {
        type: null,
        fields: null,
    };
    (0, forEachState_1.default)(tokenState, function (state) {
        switch (state.kind) {
            case 'Variable': {
                info.type = variableToType[state.name];
                break;
            }
            case 'ListValue': {
                var nullableType = info.type ? (0, graphql_1.getNullableType)(info.type) : undefined;
                info.type =
                    nullableType instanceof graphql_1.GraphQLList ? nullableType.ofType : null;
                break;
            }
            case 'ObjectValue': {
                var objectType = info.type ? (0, graphql_1.getNamedType)(info.type) : undefined;
                info.fields =
                    objectType instanceof graphql_1.GraphQLInputObjectType
                        ? objectType.getFields()
                        : null;
                break;
            }
            case 'ObjectField': {
                var objectField = state.name && info.fields ? info.fields[state.name] : null;
                info.type = objectField === null || objectField === void 0 ? void 0 : objectField.type;
                break;
            }
        }
    });
    return info;
}
//# sourceMappingURL=hint.js.map