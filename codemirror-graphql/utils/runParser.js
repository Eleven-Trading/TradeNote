"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_language_service_1 = require("graphql-language-service");
function runParser(sourceText, parserOptions, callbackFn) {
    var e_1, _a;
    var parser = (0, graphql_language_service_1.onlineParser)(parserOptions);
    var state = parser.startState();
    var lines = sourceText.split('\n');
    try {
        for (var lines_1 = __values(lines), lines_1_1 = lines_1.next(); !lines_1_1.done; lines_1_1 = lines_1.next()) {
            var line = lines_1_1.value;
            var stream = new graphql_language_service_1.CharacterStream(line);
            while (!stream.eol()) {
                var style = parser.token(stream, state);
                callbackFn(stream, state, style);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (lines_1_1 && !lines_1_1.done && (_a = lines_1.return)) _a.call(lines_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
exports.default = runParser;
//# sourceMappingURL=runParser.js.map