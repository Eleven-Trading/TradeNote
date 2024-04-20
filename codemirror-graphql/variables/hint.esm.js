import CodeMirror from 'codemirror';
import { getNullableType, getNamedType, GraphQLEnumType, GraphQLInputObjectType, GraphQLList, GraphQLBoolean, } from 'graphql';
import forEachState from '../utils/forEachState';
import hintList from '../utils/hintList';
CodeMirror.registerHelper('hint', 'graphql-variables', (editor, options) => {
    const cur = editor.getCursor();
    const token = editor.getTokenAt(cur);
    const results = getVariablesHint(cur, token, options);
    if ((results === null || results === void 0 ? void 0 : results.list) && results.list.length > 0) {
        results.from = CodeMirror.Pos(results.from.line, results.from.ch);
        results.to = CodeMirror.Pos(results.to.line, results.to.ch);
        CodeMirror.signal(editor, 'hasCompletion', editor, results, token);
    }
    return results;
});
function getVariablesHint(cur, token, options) {
    const state = token.state.kind === 'Invalid' ? token.state.prevState : token.state;
    const { kind, step } = state;
    if (kind === 'Document' && step === 0) {
        return hintList(cur, token, [{ text: '{' }]);
    }
    const { variableToType } = options;
    if (!variableToType) {
        return;
    }
    const typeInfo = getTypeInfo(variableToType, token.state);
    if (kind === 'Document' || (kind === 'Variable' && step === 0)) {
        const variableNames = Object.keys(variableToType);
        return hintList(cur, token, variableNames.map(name => ({
            text: `"${name}": `,
            type: variableToType[name],
        })));
    }
    if ((kind === 'ObjectValue' || (kind === 'ObjectField' && step === 0)) &&
        typeInfo.fields) {
        const inputFields = Object.keys(typeInfo.fields).map(fieldName => typeInfo.fields[fieldName]);
        return hintList(cur, token, inputFields.map(field => ({
            text: `"${field.name}": `,
            type: field.type,
            description: field.description,
        })));
    }
    if (kind === 'StringValue' ||
        kind === 'NumberValue' ||
        kind === 'BooleanValue' ||
        kind === 'NullValue' ||
        (kind === 'ListValue' && step === 1) ||
        (kind === 'ObjectField' && step === 2) ||
        (kind === 'Variable' && step === 2)) {
        const namedInputType = typeInfo.type
            ? getNamedType(typeInfo.type)
            : undefined;
        if (namedInputType instanceof GraphQLInputObjectType) {
            return hintList(cur, token, [{ text: '{' }]);
        }
        if (namedInputType instanceof GraphQLEnumType) {
            const values = namedInputType.getValues();
            return hintList(cur, token, values.map(value => ({
                text: `"${value.name}"`,
                type: namedInputType,
                description: value.description,
            })));
        }
        if (namedInputType === GraphQLBoolean) {
            return hintList(cur, token, [
                { text: 'true', type: GraphQLBoolean, description: 'Not false.' },
                { text: 'false', type: GraphQLBoolean, description: 'Not true.' },
            ]);
        }
    }
}
function getTypeInfo(variableToType, tokenState) {
    const info = {
        type: null,
        fields: null,
    };
    forEachState(tokenState, state => {
        switch (state.kind) {
            case 'Variable': {
                info.type = variableToType[state.name];
                break;
            }
            case 'ListValue': {
                const nullableType = info.type ? getNullableType(info.type) : undefined;
                info.type =
                    nullableType instanceof GraphQLList ? nullableType.ofType : null;
                break;
            }
            case 'ObjectValue': {
                const objectType = info.type ? getNamedType(info.type) : undefined;
                info.fields =
                    objectType instanceof GraphQLInputObjectType
                        ? objectType.getFields()
                        : null;
                break;
            }
            case 'ObjectField': {
                const objectField = state.name && info.fields ? info.fields[state.name] : null;
                info.type = objectField === null || objectField === void 0 ? void 0 : objectField.type;
                break;
            }
        }
    });
    return info;
}
//# sourceMappingURL=hint.js.map