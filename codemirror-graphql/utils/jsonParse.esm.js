export default function jsonParse(str) {
    string = str;
    strLen = str.length;
    start = end = lastEnd = -1;
    ch();
    lex();
    const ast = parseObj();
    expect('EOF');
    return ast;
}
let string;
let strLen;
let start;
let end;
let lastEnd;
let code;
let kind;
function parseObj() {
    const nodeStart = start;
    const members = [];
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
        members,
    };
}
function parseMember() {
    const nodeStart = start;
    const key = kind === 'String' ? curToken() : null;
    expect('String');
    expect(':');
    const value = parseVal();
    return {
        kind: 'Member',
        start: nodeStart,
        end: lastEnd,
        key,
        value,
    };
}
function parseArr() {
    const nodeStart = start;
    const values = [];
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
        values,
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
            const token = curToken();
            lex();
            return token;
    }
    expect('Value');
}
function curToken() {
    return { kind, start, end, value: JSON.parse(string.slice(start, end)) };
}
function expect(str) {
    if (kind === str) {
        lex();
        return;
    }
    let found;
    if (kind === 'EOF') {
        found = '[end of file]';
    }
    else if (end - start > 1) {
        found = '`' + string.slice(start, end) + '`';
    }
    else {
        const match = string.slice(start).match(/^.+?\b/);
        found = '`' + (match ? match[0] : string[start]) + '`';
    }
    throw syntaxError(`Expected ${str} but found ${found}.`);
}
export class JSONSyntaxError extends Error {
    constructor(message, position) {
        super(message);
        this.position = position;
    }
}
function syntaxError(message) {
    return new JSONSyntaxError(message, { start, end });
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