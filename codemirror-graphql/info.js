"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var codemirror_1 = __importDefault(require("codemirror"));
var getTypeInfo_1 = __importDefault(require("./utils/getTypeInfo"));
var SchemaReference_1 = require("./utils/SchemaReference");
require("./utils/info-addon");
codemirror_1.default.registerHelper('info', 'graphql', function (token, options) {
    if (!options.schema || !token.state) {
        return;
    }
    var _a = token.state, kind = _a.kind, step = _a.step;
    var typeInfo = (0, getTypeInfo_1.default)(options.schema, token.state);
    if ((kind === 'Field' && step === 0 && typeInfo.fieldDef) ||
        (kind === 'AliasedField' && step === 2 && typeInfo.fieldDef)) {
        var header = document.createElement('div');
        header.className = 'CodeMirror-info-header';
        renderField(header, typeInfo, options);
        var into = document.createElement('div');
        into.append(header);
        renderDescription(into, options, typeInfo.fieldDef);
        return into;
    }
    if (kind === 'Directive' && step === 1 && typeInfo.directiveDef) {
        var header = document.createElement('div');
        header.className = 'CodeMirror-info-header';
        renderDirective(header, typeInfo, options);
        var into = document.createElement('div');
        into.append(header);
        renderDescription(into, options, typeInfo.directiveDef);
        return into;
    }
    if (kind === 'Argument' && step === 0 && typeInfo.argDef) {
        var header = document.createElement('div');
        header.className = 'CodeMirror-info-header';
        renderArg(header, typeInfo, options);
        var into = document.createElement('div');
        into.append(header);
        renderDescription(into, options, typeInfo.argDef);
        return into;
    }
    if (kind === 'EnumValue' &&
        typeInfo.enumValue &&
        typeInfo.enumValue.description) {
        var header = document.createElement('div');
        header.className = 'CodeMirror-info-header';
        renderEnumValue(header, typeInfo, options);
        var into = document.createElement('div');
        into.append(header);
        renderDescription(into, options, typeInfo.enumValue);
        return into;
    }
    if (kind === 'NamedType' &&
        typeInfo.type &&
        typeInfo.type.description) {
        var header = document.createElement('div');
        header.className = 'CodeMirror-info-header';
        renderType(header, typeInfo, options, typeInfo.type);
        var into = document.createElement('div');
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
    var fieldName = ((_a = typeInfo.fieldDef) === null || _a === void 0 ? void 0 : _a.name) || '';
    text(into, fieldName, 'field-name', options, (0, SchemaReference_1.getFieldReference)(typeInfo));
}
function renderDirective(into, typeInfo, options) {
    var _a;
    var name = '@' + (((_a = typeInfo.directiveDef) === null || _a === void 0 ? void 0 : _a.name) || '');
    text(into, name, 'directive-name', options, (0, SchemaReference_1.getDirectiveReference)(typeInfo));
}
function renderArg(into, typeInfo, options) {
    var _a;
    var name = ((_a = typeInfo.argDef) === null || _a === void 0 ? void 0 : _a.name) || '';
    text(into, name, 'arg-name', options, (0, SchemaReference_1.getArgumentReference)(typeInfo));
    renderTypeAnnotation(into, typeInfo, options, typeInfo.inputType);
}
function renderEnumValue(into, typeInfo, options) {
    var _a;
    var name = ((_a = typeInfo.enumValue) === null || _a === void 0 ? void 0 : _a.name) || '';
    renderType(into, typeInfo, options, typeInfo.inputType);
    text(into, '.');
    text(into, name, 'enum-value', options, (0, SchemaReference_1.getEnumValueReference)(typeInfo));
}
function renderTypeAnnotation(into, typeInfo, options, t) {
    var typeSpan = document.createElement('span');
    typeSpan.className = 'type-name-pill';
    if (t instanceof graphql_1.GraphQLNonNull) {
        renderType(typeSpan, typeInfo, options, t.ofType);
        text(typeSpan, '!');
    }
    else if (t instanceof graphql_1.GraphQLList) {
        text(typeSpan, '[');
        renderType(typeSpan, typeInfo, options, t.ofType);
        text(typeSpan, ']');
    }
    else {
        text(typeSpan, (t === null || t === void 0 ? void 0 : t.name) || '', 'type-name', options, (0, SchemaReference_1.getTypeReference)(typeInfo, t));
    }
    into.append(typeSpan);
}
function renderType(into, typeInfo, options, t) {
    if (t instanceof graphql_1.GraphQLNonNull) {
        renderType(into, typeInfo, options, t.ofType);
        text(into, '!');
    }
    else if (t instanceof graphql_1.GraphQLList) {
        text(into, '[');
        renderType(into, typeInfo, options, t.ofType);
        text(into, ']');
    }
    else {
        text(into, (t === null || t === void 0 ? void 0 : t.name) || '', 'type-name', options, (0, SchemaReference_1.getTypeReference)(typeInfo, t));
    }
}
function renderDescription(into, options, def) {
    var description = def.description;
    if (description) {
        var descriptionDiv = document.createElement('div');
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
    var reason = def.deprecationReason;
    if (reason) {
        var deprecationDiv = document.createElement('div');
        deprecationDiv.className = 'info-deprecation';
        into.append(deprecationDiv);
        var label = document.createElement('span');
        label.className = 'info-deprecation-label';
        label.append(document.createTextNode('Deprecated'));
        deprecationDiv.append(label);
        var reasonDiv = document.createElement('div');
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
function text(into, content, className, options, ref) {
    if (className === void 0) { className = ''; }
    if (options === void 0) { options = { onClick: null }; }
    if (ref === void 0) { ref = null; }
    if (className) {
        var onClick_1 = options.onClick;
        var node = void 0;
        if (onClick_1) {
            node = document.createElement('a');
            node.href = 'javascript:void 0';
            node.addEventListener('click', function (e) {
                onClick_1(ref, e);
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