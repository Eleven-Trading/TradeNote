"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var codemirror_1 = __importDefault(require("codemirror"));
var graphql_language_service_1 = require("graphql-language-service");
var SEVERITY = ['error', 'warning', 'information', 'hint'];
var TYPE = {
    'GraphQL: Validation': 'validation',
    'GraphQL: Deprecation': 'deprecation',
    'GraphQL: Syntax': 'syntax',
};
codemirror_1.default.registerHelper('lint', 'graphql', function (text, options) {
    var schema = options.schema, validationRules = options.validationRules, externalFragments = options.externalFragments;
    var rawResults = (0, graphql_language_service_1.getDiagnostics)(text, schema, validationRules, undefined, externalFragments);
    var results = rawResults.map(function (error) { return ({
        message: error.message,
        severity: error.severity ? SEVERITY[error.severity - 1] : SEVERITY[0],
        type: error.source ? TYPE[error.source] : undefined,
        from: codemirror_1.default.Pos(error.range.start.line, error.range.start.character),
        to: codemirror_1.default.Pos(error.range.end.line, error.range.end.character),
    }); });
    return results;
});
//# sourceMappingURL=lint.js.map