import CodeMirror from 'codemirror';
import { GraphQLInputType } from 'graphql';
import { IHints } from '../hint';
export declare type VariableToType = Record<string, GraphQLInputType>;
interface GraphQLVariableHintOptions {
    variableToType: VariableToType;
}
declare module 'codemirror' {
    interface ShowHintOptions {
        variableToType?: VariableToType;
    }
    interface CodeMirrorHintMap {
        'graphql-variables': (editor: CodeMirror.Editor, options: GraphQLVariableHintOptions) => IHints | undefined;
    }
}
export {};
//# sourceMappingURL=hint.d.ts.map