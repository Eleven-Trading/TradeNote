"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var codemirror_1 = __importDefault(require("codemirror"));
require("codemirror/addon/hint/show-hint");
var graphql_language_service_1 = require("graphql-language-service");
codemirror_1.default.registerHelper('hint', 'graphql', function (editor, options) {
    var schema = options.schema, externalFragments = options.externalFragments;
    if (!schema) {
        return;
    }
    var cur = editor.getCursor();
    var token = editor.getTokenAt(cur);
    var tokenStart = token.type !== null && /"|\w/.test(token.string[0])
        ? token.start
        : token.end;
    var position = new graphql_language_service_1.Position(cur.line, tokenStart);
    var rawResults = (0, graphql_language_service_1.getAutocompleteSuggestions)(schema, editor.getValue(), position, token, externalFragments);
    var results = {
        list: rawResults.map(function (item) { return ({
            text: item.label,
            type: item.type,
            description: item.documentation,
            isDeprecated: item.isDeprecated,
            deprecationReason: item.deprecationReason,
        }); }),
        from: { line: cur.line, ch: tokenStart },
        to: { line: cur.line, ch: token.end },
    };
    if ((results === null || results === void 0 ? void 0 : results.list) && results.list.length > 0) {
        results.from = codemirror_1.default.Pos(results.from.line, results.from.ch);
        results.to = codemirror_1.default.Pos(results.to.line, results.to.ch);
        codemirror_1.default.signal(editor, 'hasCompletion', editor, results, token);
    }
    return results;
});
//# sourceMappingURL=hint.js.map