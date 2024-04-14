import CodeMirror from 'codemirror';
import { list, t, onlineParser, opt, p, } from 'graphql-language-service';
import indent from '../utils/mode-indent';
CodeMirror.defineMode('graphql-variables', config => {
    const parser = onlineParser({
        eatWhitespace: stream => stream.eatSpace(),
        lexRules: LexRules,
        parseRules: ParseRules,
        editorConfig: { tabSize: config.tabSize },
    });
    return {
        config,
        startState: parser.startState,
        token: parser.token,
        indent,
        electricInput: /^\s*[}\]]/,
        fold: 'brace',
        closeBrackets: {
            pairs: '[]{}""',
            explode: '[]{}',
        },
    };
});
const LexRules = {
    Punctuation: /^\[|]|\{|\}|:|,/,
    Number: /^-?(?:0|(?:[1-9][0-9]*))(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?/,
    String: /^"(?:[^"\\]|\\(?:"|\/|\\|b|f|n|r|t|u[0-9a-fA-F]{4}))*"?/,
    Keyword: /^true|false|null/,
};
const ParseRules = {
    Document: [p('{'), list('Variable', opt(p(','))), p('}')],
    Variable: [namedKey('variable'), p(':'), 'Value'],
    Value(token) {
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
    NumberValue: [t('Number', 'number')],
    StringValue: [t('String', 'string')],
    BooleanValue: [t('Keyword', 'builtin')],
    NullValue: [t('Keyword', 'keyword')],
    ListValue: [p('['), list('Value', opt(p(','))), p(']')],
    ObjectValue: [p('{'), list('ObjectField', opt(p(','))), p('}')],
    ObjectField: [namedKey('attribute'), p(':'), 'Value'],
};
function namedKey(style) {
    return {
        style,
        match: (token) => token.kind === 'String',
        update(state, token) {
            state.name = token.value.slice(1, -1);
        },
    };
}
//# sourceMappingURL=mode.js.map