"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var codemirror_1 = __importDefault(require("codemirror"));
var graphql_language_service_1 = require("graphql-language-service");
var mode_indent_1 = __importDefault(require("../utils/mode-indent"));
codemirror_1.default.defineMode('graphql-results', function (config) {
    var parser = (0, graphql_language_service_1.onlineParser)({
        eatWhitespace: function (stream) { return stream.eatSpace(); },
        lexRules: LexRules,
        parseRules: ParseRules,
        editorConfig: { tabSize: config.tabSize },
    });
    return {
        config: config,
        startState: parser.startState,
        token: parser.token,
        indent: mode_indent_1.default,
        electricInput: /^\s*[}\]]/,
        fold: 'brace',
        closeBrackets: {
            pairs: '[]{}""',
            explode: '[]{}',
        },
    };
});
var LexRules = {
    Punctuation: /^\[|]|\{|\}|:|,/,
    Number: /^-?(?:0|(?:[1-9][0-9]*))(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?/,
    String: /^"(?:[^"\\]|\\(?:"|\/|\\|b|f|n|r|t|u[0-9a-fA-F]{4}))*"?/,
    Keyword: /^true|false|null/,
};
var ParseRules = {
    Document: [(0, graphql_language_service_1.p)('{'), (0, graphql_language_service_1.list)('Entry', (0, graphql_language_service_1.p)(',')), (0, graphql_language_service_1.p)('}')],
    Entry: [(0, graphql_language_service_1.t)('String', 'def'), (0, graphql_language_service_1.p)(':'), 'Value'],
    Value: function (token) {
        switch (token.kind) {
            case 'Number':
                return 'NumberValue';
            case 'String':
                return 'StringValue';
            case 'Punctuation':
                switch (token.value) {
                    case '[':
                        return 'ListValue';
                    case '{':
                        return 'ObjectValue';
                }
                return null;
            case 'Keyword':
                switch (token.value) {
                    case 'true':
                    case 'false':
                        return 'BooleanValue';
                    case 'null':
                        return 'NullValue';
                }
                return null;
        }
    },
    NumberValue: [(0, graphql_language_service_1.t)('Number', 'number')],
    StringValue: [(0, graphql_language_service_1.t)('String', 'string')],
    BooleanValue: [(0, graphql_language_service_1.t)('Keyword', 'builtin')],
    NullValue: [(0, graphql_language_service_1.t)('Keyword', 'keyword')],
    ListValue: [(0, graphql_language_service_1.p)('['), (0, graphql_language_service_1.list)('Value', (0, graphql_language_service_1.p)(',')), (0, graphql_language_service_1.p)(']')],
    ObjectValue: [(0, graphql_language_service_1.p)('{'), (0, graphql_language_service_1.list)('ObjectField', (0, graphql_language_service_1.p)(',')), (0, graphql_language_service_1.p)('}')],
    ObjectField: [(0, graphql_language_service_1.t)('String', 'property'), (0, graphql_language_service_1.p)(':'), 'Value'],
};
//# sourceMappingURL=mode.js.map