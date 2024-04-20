import { GraphQLList, GraphQLNonNull, } from 'graphql';
import CodeMirror from 'codemirror';
import getTypeInfo from './utils/getTypeInfo';
import { getArgumentReference, getDirectiveReference, getEnumValueReference, getFieldReference, getTypeReference, } from './utils/SchemaReference';
import './utils/info-addon';
CodeMirror.registerHelper('info', 'graphql', (token, options) => {
    if (!options.schema || !token.state) {
        return;
    }
    const { kind, step } = token.state;
    const typeInfo = getTypeInfo(options.schema, token.state);
    if ((kind === 'Field' && step === 0 && typeInfo.fieldDef) ||
        (kind === 'AliasedField' && step === 2 && typeInfo.fieldDef)) {
        const header = document.createElement('div');
        header.className = 'CodeMirror-info-header';
        renderField(header, typeInfo, options);
        const into = document.createElement('div');
        into.append(header);
        renderDescription(into, options, typeInfo.fieldDef);
        return into;
    }
    if (kind === 'Directive' && step === 1 && typeInfo.directiveDef) {
        const header = document.createElement('div');
        header.className = 'CodeMirror-info-header';
        renderDirective(header, typeInfo, options);
        const into = document.createElement('div');
        into.append(header);
        renderDescription(into, options, typeInfo.directiveDef);
        return into;
    }
    if (kind === 'Argument' && step === 0 && typeInfo.argDef) {
        const header = document.createElement('div');
        header.className = 'CodeMirror-info-header';
        renderArg(header, typeInfo, options);
        const into = document.createElement('div');
        into.append(header);
        renderDescription(into, options, typeInfo.argDef);
        return into;
    }
    if (kind === 'EnumValue' &&
        typeInfo.enumValue &&
        typeInfo.enumValue.description) {
        const header = document.createElement('div');
        header.className = 'CodeMirror-info-header';
        renderEnumValue(header, typeInfo, options);
        const into = document.createElement('div');
        into.append(header);
        renderDescription(into, options, typeInfo.enumValue);
        return into;
    }
    if (kind === 'NamedType' &&
        typeInfo.type &&
        typeInfo.type.description) {
        const header = document.createElement('div');
        header.className = 'CodeMirror-info-header';
        renderType(header, typeInfo, options, typeInfo.type);
        const into = document.createElement('div');
        into.append(header);
        renderDescription(into, options, typeInfo.type);
        return into;
    }
});
function renderField(into, typeInfo, options) {
    renderQualifiedField(into, typeInfo, options);
    renderTypeAnnotation(into, typeInfo, options, typeInfo.type);
}
function renderQualifiedField(into, typeInfo, options) {
    var _a;
    const fieldName = ((_a = typeInfo.fieldDef) === null || _a === void 0 ? void 0 : _a.name) || '';
    text(into, fieldName, 'field-name', options, getFieldReference(typeInfo));
}
function renderDirective(into, typeInfo, options) {
    var _a;
    const name = '@' + (((_a = typeInfo.directiveDef) === null || _a === void 0 ? void 0 : _a.name) || '');
    text(into, name, 'directive-name', options, getDirectiveReference(typeInfo));
}
function renderArg(into, typeInfo, options) {
    var _a;
    const name = ((_a = typeInfo.argDef) === null || _a === void 0 ? void 0 : _a.name) || '';
    text(into, name, 'arg-name', options, getArgumentReference(typeInfo));
    renderTypeAnnotation(into, typeInfo, options, typeInfo.inputType);
}
function renderEnumValue(into, typeInfo, options) {
    var _a;
    const name = ((_a = typeInfo.enumValue) === null || _a === void 0 ? void 0 : _a.name) || '';
    renderType(into, typeInfo, options, typeInfo.inputType);
    text(into, '.');
    text(into, name, 'enum-value', options, getEnumValueReference(typeInfo));
}
function renderTypeAnnotation(into, typeInfo, options, t) {
    const typeSpan = document.createElement('span');
    typeSpan.className = 'type-name-pill';
    if (t instanceof GraphQLNonNull) {
        renderType(typeSpan, typeInfo, options, t.ofType);
        text(typeSpan, '!');
    }
    else if (t instanceof GraphQLList) {
        text(typeSpan, '[');
        renderType(typeSpan, typeInfo, options, t.ofType);
        text(typeSpan, ']');
    }
    else {
        text(typeSpan, (t === null || t === void 0 ? void 0 : t.name) || '', 'type-name', options, getTypeReference(typeInfo, t));
    }
    into.append(typeSpan);
}
function renderType(into, typeInfo, options, t) {
    if (t instanceof GraphQLNonNull) {
        renderType(into, typeInfo, options, t.ofType);
        text(into, '!');
    }
    else if (t instanceof GraphQLList) {
        text(into, '[');
        renderType(into, typeInfo, options, t.ofType);
        text(into, ']');
    }
    else {
        text(into, (t === null || t === void 0 ? void 0 : t.name) || '', 'type-name', options, getTypeReference(typeInfo, t));
    }
}
function renderDescription(into, options, def) {
    const { description } = def;
    if (description) {
        const descriptionDiv = document.createElement('div');
        descriptionDiv.className = 'info-description';
        if (options.renderDescription) {
            descriptionDiv.innerHTML = options.renderDescription(description);
        }
        else {
            descriptionDiv.append(document.createTextNode(description));
        }
        into.append(descriptionDiv);
    }
    renderDeprecation(into, options, def);
}
function renderDeprecation(into, options, def) {
    const reason = def.deprecationReason;
    if (reason) {
        const deprecationDiv = document.createElement('div');
        deprecationDiv.className = 'info-deprecation';
        into.append(deprecationDiv);
        const label = document.createElement('span');
        label.className = 'info-deprecation-label';
        label.append(document.createTextNode('Deprecated'));
        deprecationDiv.append(label);
        const reasonDiv = document.createElement('div');
        reasonDiv.className = 'info-deprecation-reason';
        if (options.renderDescription) {
            reasonDiv.innerHTML = options.renderDescription(reason);
        }
        else {
            reasonDiv.append(document.createTextNode(reason));
        }
        deprecationDiv.append(reasonDiv);
    }
}
function text(into, content, className = '', options = { onClick: null }, ref = null) {
    if (className) {
        const { onClick } = options;
        let node;
        if (onClick) {
            node = document.createElement('a');
            node.href = 'javascript:void 0';
            node.addEventListener('click', (e) => {
                onClick(ref, e);
            });
        }
        else {
            node = document.createElement('span');
        }
        node.className = className;
        node.append(document.createTextNode(content));
        into.append(node);
    }
    else {
        into.append(document.createTextNode(content));
    }
}
//# sourceMappingURL=info.js.map