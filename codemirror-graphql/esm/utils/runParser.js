import { CharacterStream, onlineParser, } from 'graphql-language-service';
export default function runParser(sourceText, parserOptions, callbackFn) {
    const parser = onlineParser(parserOptions);
    const state = parser.startState();
    const lines = sourceText.split('\n');
    for (const line of lines) {
        const stream = new CharacterStream(line);
        while (!stream.eol()) {
            const style = parser.token(stream, state);
            callbackFn(stream, state, style);
        }
    }
}
//# sourceMappingURL=runParser.js.map