import CodeMirror, { Hints, Hint } from 'codemirror';
import 'codemirror/addon/hint/show-hint';
import { FragmentDefinitionNode, GraphQLSchema, GraphQLType } from 'graphql';
import type { Maybe } from 'graphql-language-service';
export interface GraphQLHintOptions {
    schema?: GraphQLSchema;
    externalFragments?: string | FragmentDefinitionNode[];
}
interface IHint extends Hint {
    isDeprecated?: boolean;
    type?: Maybe<GraphQLType>;
    description?: Maybe<string>;
    deprecationReason?: Maybe<string>;
}
interface IHints extends Hints {
    list: IHint[];
}
declare module 'codemirror' {
    interface ShowHintOptions {
        schema?: GraphQLSchema;
        externalFragments?: string | FragmentDefinitionNode[];
    }
    interface CodeMirrorHintMap {
        graphql: (editor: CodeMirror.Editor, options: GraphQLHintOptions) => IHints | undefined;
    }
}
export type { IHint, IHints };
//# sourceMappingURL=hint.d.ts.map