import { LexRules, ParseRules, isIgnored, onlineParser, } from 'graphql-language-service';
import indent from './mode-indent';
const graphqlModeFactory = config => {
    const parser = onlineParser({
        eatWhitespace: stream => stream.eatWhile(isIgnored),
        lexRules: LexRules,
        parseRules: ParseRules,
        editorConfig: { tabSize: config.tabSize },
    });
    return {
        config,
        startState: parser.startState,
        token: parser.token,
        indent,
        electricInput: /^\s*[})\]]/,
        fold: 'brace',
        lineComment: '#',
        closeBrackets: {
            pairs: '()[]{}""',
            explode: '()[]{}',
        },
    };
};
export default graphqlModeFactory;
//# sourceMappingURL=mode-factory.js.map