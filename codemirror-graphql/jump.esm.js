import CodeMirror from 'codemirror';
import getTypeInfo from './utils/getTypeInfo';
import { getArgumentReference, getDirectiveReference, getEnumValueReference, getFieldReference, getTypeReference, } from './utils/SchemaReference';
import './utils/jump-addon';
CodeMirror.registerHelper('jump', 'graphql', (token, options) => {
    if (!options.schema || !options.onClick || !token.state) {
        return;
    }
    const { state } = token;
    const { kind, step } = state;
    const typeInfo = getTypeInfo(options.schema, state);
    if ((kind === 'Field' && step === 0 && typeInfo.fieldDef) ||
        (kind === 'AliasedField' && step === 2 && typeInfo.fieldDef)) {
        return getFieldReference(typeInfo);
    }
    if (kind === 'Directive' && step === 1 && typeInfo.directiveDef) {
        return getDirectiveReference(typeInfo);
    }
    if (kind === 'Argument' && step === 0 && typeInfo.argDef) {
        return getArgumentReference(typeInfo);
    }
    if (kind === 'EnumValue' && typeInfo.enumValue) {
        return getEnumValueReference(typeInfo);
    }
    if (kind === 'NamedType' && typeInfo.type) {
        return getTypeReference(typeInfo);
    }
});
//# sourceMappingURL=jump.js.map