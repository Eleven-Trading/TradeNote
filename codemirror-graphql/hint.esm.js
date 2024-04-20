import CodeMirror from 'codemirror';
import 'codemirror/addon/hint/show-hint';
import { getAutocompleteSuggestions, Position } from 'graphql-language-service';
CodeMirror.registerHelper('hint', 'graphql', (editor, options) => {
    const { schema, externalFragments } = options;
    if (!schema) {
        return;
    }
    const cur = editor.getCursor();
    const token = editor.getTokenAt(cur);
    const tokenStart = token.type !== null && /"|\w/.test(token.string[0])
        ? token.start
        : token.end;
    const position = new Position(cur.line, tokenStart);
    const rawResults = getAutocompleteSuggestions(schema, editor.getValue(), position, token, externalFragments);
    const results = {
        list: rawResults.map(item => ({
            text: item.label,
            type: item.type,
            description: item.documentation,
            isDeprecated: item.isDeprecated,
            deprecationReason: item.deprecationReason,
        })),
        from: { line: cur.line, ch: tokenStart },
        to: { line: cur.line, ch: token.end },
    };
    if ((results === null || results === void 0 ? void 0 : results.list) && results.list.length > 0) {
        results.from = CodeMirror.Pos(results.from.line, results.from.ch);
        results.to = CodeMirror.Pos(results.to.line, results.to.ch);
        CodeMirror.signal(editor, 'hasCompletion', editor, results, token);
    }
    return results;
});
//# sourceMappingURL=hint.js.map