"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function hintList(cursor, token, list) {
    var hints = filterAndSortList(list, normalizeText(token.string));
    if (!hints) {
        return;
    }
    var tokenStart = token.type !== null && /"|\w/.test(token.string[0])
        ? token.start
        : token.end;
    return {
        list: hints,
        from: { line: cursor.line, ch: tokenStart },
        to: { line: cursor.line, ch: token.end },
    };
}
exports.default = hintList;
function filterAndSortList(list, text) {
    if (!text) {
        return filterNonEmpty(list, function (entry) { return !entry.isDeprecated; });
    }
    var byProximity = list.map(function (entry) { return ({
        proximity: getProximity(normalizeText(entry.text), text),
        entry: entry,
    }); });
    var conciseMatches = filterNonEmpty(filterNonEmpty(byProximity, function (pair) { return pair.proximity <= 2; }), function (pair) { return !pair.entry.isDeprecated; });
    var sortedMatches = conciseMatches.sort(function (a, b) {
        return (a.entry.isDeprecated ? 1 : 0) - (b.entry.isDeprecated ? 1 : 0) ||
            a.proximity - b.proximity ||
            a.entry.text.length - b.entry.text.length;
    });
    return sortedMatches.map(function (pair) { return pair.entry; });
}
function filterNonEmpty(array, predicate) {
    var filtered = array.filter(predicate);
    return filtered.length === 0 ? array : filtered;
}
function normalizeText(text) {
    return text.toLowerCase().replaceAll(/\W/g, '');
}
function getProximity(suggestion, text) {
    var proximity = lexicalDistance(text, suggestion);
    if (suggestion.length > text.length) {
        proximity -= suggestion.length - text.length - 1;
        proximity += suggestion.indexOf(text) === 0 ? 0 : 0.5;
    }
    return proximity;
}
function lexicalDistance(a, b) {
    var i;
    var j;
    var d = [];
    var aLength = a.length;
    var bLength = b.length;
    for (i = 0; i <= aLength; i++) {
        d[i] = [i];
    }
    for (j = 1; j <= bLength; j++) {
        d[0][j] = j;
    }
    for (i = 1; i <= aLength; i++) {
        for (j = 1; j <= bLength; j++) {
            var cost = a[i - 1] === b[j - 1] ? 0 : 1;
            d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
            }
        }
    }
    return d[aLength][bLength];
}
//# sourceMappingURL=hintList.js.map