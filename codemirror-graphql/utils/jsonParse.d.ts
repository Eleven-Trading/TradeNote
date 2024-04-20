export default function jsonParse(str: string): ParseObjectOutput;
interface BaseParseOutput {
    kind: string;
    start: number;
    end: number;
}
export interface ParseTokenOutput extends BaseParseOutput {
    value: any;
}
export interface ParseObjectOutput extends BaseParseOutput {
    kind: 'Object';
    members: ParseMemberOutput[];
}
export interface ParseArrayOutput extends BaseParseOutput {
    kind: 'Array';
    values?: ParseValueOutput[];
}
export interface ParseMemberOutput extends BaseParseOutput {
    key: ParseTokenOutput | null;
    value?: ParseValueOutput;
}
export declare type ParseValueOutput = ParseTokenOutput | ParseObjectOutput | ParseArrayOutput | undefined;
declare type SyntaxErrorPosition = {
    start: number;
    end: number;
};
export declare class JSONSyntaxError extends Error {
    readonly position: SyntaxErrorPosition;
    constructor(message: string, position: SyntaxErrorPosition);
}
export {};
//# sourceMappingURL=jsonParse.d.ts.map