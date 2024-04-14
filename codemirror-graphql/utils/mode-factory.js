"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_language_service_1 = require("graphql-language-service");
var mode_indent_1 = __importDefault(require("./mode-indent"));
var graphqlModeFactory = function (config) {
    var parser = (0, graphql_language_service_1.onlineParser)({
        eatWhitespace: function (stream) { return stream.eatWhile(graphql_language_service_1.isIgnored); },
        lexRules: graphql_language_service_1.LexRules,
        parseRules: graphql_language_service_1.ParseRules,
        editorConfig: { tabSize: config.tabSize },
    });
    return {
        config: config,
        startState: parser.startState,
        token: parser.token,
        indent: mode_indent_1.default,
        electricInput: /^\s*[})\]]/,
        fold: 'brace',
        lineComment: '#',
        closeBrackets: {
            pairs: '()[]{}""',
            explode: '()[]{}',
        },
    };
};
exports.default = graphqlModeFactory;
//# sourceMappingURL=mode-factory.js.map