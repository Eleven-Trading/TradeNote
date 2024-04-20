"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONSyntaxError = void 0;
function jsonParse(str) {
    string = str;
    strLen = str.length;
    start = end = lastEnd = -1;
    ch();
    lex();
    var ast = parseObj();
    expect('EOF');
    return ast;
}
exports.default = jsonParse;
var string;
var strLen;
var start;
var end;
var lastEnd;
var code;
var kind;
function parseObj() {
    var nodeStart = start;
    var members = [];
    expect('{');
    if (!skip('}')) {
        do {
            members.push(parseMember());
        } while (skip(','));
        expect('}');
    }
    return {
        kind: 'Object',
        start: nodeStart,
        end: lastEnd,
        members: members,
    };
}
function parseMember() {
    var nodeStart = start;
    var key = kind === 'String' ? curToken() : null;
    expect('String');
    expect(':');
    var value = parseVal();
    return {
        kind: 'Member',
        start: nodeStart,
        end: lastEnd,
        key: key,
        value: value,
    };
}
function parseArr() {
    var nodeStart = start;
    var values = [];
    expect('[');
    if (!skip(']')) {
        do {
            values.push(parseVal());
        } while (skip(','));
        expect(']');
    }
    return {
        kind: 'Array',
        start: nodeStart,
        end: lastEnd,
        values: values,
    };
}
function parseVal() {
    switch (kind) {
        case '[':
            return parseArr();
        case '{':
            return parseObj();
        case 'String':
        case 'Number':
        case 'Boolean':
        case 'Null':
            var token = curToken();
            lex();
            return token;
    }
    expect('Value');
}
function curToken() {
    return { kind: kind, start: start, end: end, value: JSON.parse(string.slice(start, end)) };
}
function expect(str) {
    if (kind === str) {
        lex();
        return;
    }
    var found;
    if (kind === 'EOF') {
        found = '[end of file]';
    }
    else if (end - start > 1) {
        found = '`' + string.slice(start, end) + '`';
    }
    else {
        var match = string.slice(start).match(/^.+?\b/);
        found = '`' + (match ? match[0] : string[start]) + '`';
    }
    throw syntaxError("Expected ".concat(str, " but found ").concat(found, "."));
}
var JSONSyntaxError = (function (_super) {
    __extends(JSONSyntaxError, _super);
    function JSONSyntaxError(message, position) {
        var _this = _super.call(this, message) || this;
        _this.position = position;
        return _this;
    }
    return JSONSyntaxError;
}(Error));
exports.JSONSyntaxError = JSONSyntaxError;
function syntaxError(message) {
    return new JSONSyntaxError(message, { start: start, end: end });
}
function skip(k) {
    if (kind === k) {
        lex();
        return true;
    }
}
function ch() {
    if (end < strLen) {
        end++;
        code = end === strLen ? 0 : string.charCodeAt(end);
    }
    return code;
}
function lex() {
    lastEnd = end;
    while (code === 9 || code === 10 || code === 13 || code === 32) {
        ch();
    }
    if (code === 0) {
        kind = 'EOF';
        return;
    }
    start = end;
    switch (code) {
        case 34:
            kind = 'String';
            return readString();
        case 45:
        case 48:
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        case 57:
            kind = 'Number';
            return readNumber();
        case 102:
            if (string.slice(start, start + 5) !== 'false') {
                break;
            }
            end += 4;
            ch();
            kind = 'Boolean';
            return;
        case 110:
            if (string.slice(start, start + 4) !== 'null') {
                break;
            }
            end += 3;
            ch();
            kind = 'Null';
            return;
        case 116:
            if (string.slice(start, start + 4) !== 'true') {
                break;
            }
            end += 3;
            ch();
            kind = 'Boolean';
            return;
    }
    kind = string[start];
    ch();
}
function readString() {
    ch();
    while (code !== 34 && code > 31) {
        if (code === 92) {
            code = ch();
            switch (code) {
                case 34:
                case 47:
                case 92:
                case 98:
                case 102:
                case 110:
                case 114:
                case 116:
                    ch();
                    break;
                case 117:
                    ch();
                    readHex();
                    readHex();
                    readHex();
                    readHex();
                    break;
                default:
                    throw syntaxError('Bad character escape sequence.');
            }
        }
        else if (end === strLen) {
            throw syntaxError('Unterminated string.');
        }
        else {
            ch();
        }
    }
    if (code === 34) {
        ch();
        return;
    }
    throw syntaxError('Unterminated string.');
}
function readHex() {
    if ((code >= 48 && code <= 57) ||
        (code >= 65 && code <= 70) ||
        (code >= 97 && code <= 102)) {
        return ch();
    }
    throw syntaxError('Expected hexadecimal digit.');
}
function readNumber() {
    if (code === 45) {
        ch();
    }
    if (code === 48) {
        ch();
    }
    else {
        readDigits();
    }
    if (code === 46) {
        ch();
        readDigits();
    }
    if (code === 69 || code === 101) {
        code = ch();
        if (code === 43 || code === 45) {
            ch();
        }
        readDigits();
    }
}
function readDigits() {
    if (code < 48 || code > 57) {
        throw syntaxError('Expected decimal digit.');
    }
    do {
        ch();
    } while (code >= 48 && code <= 57);
}
//# sourceMappingURL=jsonParse.js.map