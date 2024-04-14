import { GraphQLSchema, GraphQLType, GraphQLField, GraphQLDirective, GraphQLArgument, GraphQLInputType, GraphQLEnumValue, GraphQLInputFieldMap } from 'graphql';
import type { State, Maybe } from 'graphql-language-service';
export interface TypeInfo {
    schema: GraphQLSchema;
    type?: Maybe<GraphQLType>;
    parentType?: Maybe<GraphQLType>;
    inputType?: Maybe<GraphQLInputType>;
    directiveDef?: Maybe<GraphQLDirective>;
    fieldDef?: Maybe<GraphQLField<any, any>>;
    argDef?: Maybe<GraphQLArgument>;
    argDefs?: Maybe<GraphQLArgument[]>;
    enumValue?: Maybe<GraphQLEnumValue>;
    objectFieldDefs?: Maybe<GraphQLInputFieldMap>;
}
export default function getTypeInfo(schema: GraphQLSchema, tokenState: State): TypeInfo;
//# sourceMappingURL=getTypeInfo.d.ts.map