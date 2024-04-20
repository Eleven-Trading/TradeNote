import CodeMirror from 'codemirror';
import { getDiagnostics } from 'graphql-language-service';
const SEVERITY = ['error', 'warning', 'information', 'hint'];
const TYPE = {
    'GraphQL: Validation': 'validation',
    'GraphQL: Deprecation': 'deprecation',
    'GraphQL: Syntax': 'syntax',
};
CodeMirror.registerHelper('lint', 'graphql', (text, options) => {
    const { schema, validationRules, externalFragments } = options;
    const rawResults = getDiagnostics(text, schema, validationRules, undefined, externalFragments);
    const results = rawResults.map(error => ({
        message: error.message,
        severity: error.severity ? SEVERITY[error.severity - 1] : SEVERITY[0],
        type: error.source ? TYPE[error.source] : undefined,
        from: CodeMirror.Pos(error.range.start.line, error.range.start.character),
        to: CodeMirror.Pos(error.range.end.line, error.range.end.character),
    }));
    return results;
});
//# sourceMappingURL=lint.js.map