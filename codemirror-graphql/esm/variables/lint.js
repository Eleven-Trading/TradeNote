import CodeMirror from 'codemirror';
import { GraphQLEnumType, GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLScalarType, } from 'graphql';
import jsonParse, { JSONSyntaxError, } from '../utils/jsonParse';
CodeMirror.registerHelper('lint', 'graphql-variables', (text, options, editor) => {
    if (!text) {
        return [];
    }
    let ast;
    try {
        ast = jsonParse(text);
    }
    catch (error) {
        if (error instanceof JSONSyntaxError) {
            return [lintError(editor, error.position, error.message)];
        }
        throw error;
    }
    const { variableToType } = options;
    if (!variableToType) {
        return [];
    }
    return validateVariables(editor, variableToType, ast);
});
function validateVariables(editor, variableToType, variablesAST) {
    var _a;
    const errors = [];
    for (const member of variablesAST.members) {
        if (member) {
            const variableName = (_a = member.key) === null || _a === void 0 ? void 0 : _a.value;
            const type = variableToType[variableName];
            if (type) {
                for (const [node, message] of validateValue(type, member.value)) {
                    errors.push(lintError(editor, node, message));
                }
            }
            else {
                errors.push(lintError(editor, member.key, `Variable "$${variableName}" does not appear in any GraphQL query.`));
            }
        }
    }
    return errors;
}
function validateValue(type, valueAST) {
    if (!type || !valueAST) {
        return [];
    }
    if (type instanceof GraphQLNonNull) {
        if (valueAST.kind === 'Null') {
            return [[valueAST, `Type "${type}" is non-nullable and cannot be null.`]];
        }
        return validateValue(type.ofType, valueAST);
    }
    if (valueAST.kind === 'Null') {
        return [];
    }
    if (type instanceof GraphQLList) {
        const itemType = type.ofType;
        if (valueAST.kind === 'Array') {
            const values = valueAST.values || [];
            return mapCat(values, item => validateValue(itemType, item));
        }
        return validateValue(itemType, valueAST);
    }
    if (type instanceof GraphQLInputObjectType) {
        if (valueAST.kind !== 'Object') {
            return [[valueAST, `Type "${type}" must be an Object.`]];
        }
        const providedFields = Object.create(null);
        const fieldErrors = mapCat(valueAST.members, member => {
            var _a;
            const fieldName = (_a = member === null || member === void 0 ? void 0 : member.key) === null || _a === void 0 ? void 0 : _a.value;
            providedFields[fieldName] = true;
            const inputField = type.getFields()[fieldName];
            if (!inputField) {
                return [
                    [
                        member.key,
                        `Type "${type}" does not have a field "${fieldName}".`,
                    ],
                ];
            }
            const fieldType = inputField ? inputField.type : undefined;
            return validateValue(fieldType, member.value);
        });
        for (const fieldName of Object.keys(type.getFields())) {
            const field = type.getFields()[fieldName];
            if (!providedFields[fieldName] &&
                field.type instanceof GraphQLNonNull &&
                !field.defaultValue) {
                fieldErrors.push([
                    valueAST,
                    `Object of type "${type}" is missing required field "${fieldName}".`,
                ]);
            }
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
        return [[valueAST, `Expected value of type "${type}".`]];
    }
    if ((type instanceof GraphQLEnumType || type instanceof GraphQLScalarType) &&
        ((valueAST.kind !== 'String' &&
            valueAST.kind !== 'Number' &&
            valueAST.kind !== 'Boolean' &&
            valueAST.kind !== 'Null') ||
            isNullish(type.parseValue(valueAST.value)))) {
        return [[valueAST, `Expected value of type "${type}".`]];
    }
    return [];
}
function lintError(editor, node, message) {
    return {
        message,
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