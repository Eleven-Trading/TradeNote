import { GraphQLSchema } from 'graphql';
import type { GraphQLArgument, GraphQLDirective, GraphQLEnumValue, GraphQLEnumType, GraphQLField, GraphQLNamedType } from 'graphql';
import { Maybe } from 'graphql/jsutils/Maybe';
import { TypeInfo } from './getTypeInfo';
export declare type SchemaReference = FieldReference | DirectiveReference | ArgumentReference | EnumValueReference | TypeReference;
export declare type FieldReference = {
    kind: 'Field';
    field: GraphQLField<any, any>;
    type: Maybe<GraphQLNamedType>;
    schema?: GraphQLSchema;
};
export declare type DirectiveReference = {
    kind: 'Directive';
    directive: GraphQLDirective;
    schema?: GraphQLSchema;
};
export declare type ArgumentReference = {
    kind: 'Argument';
    argument: GraphQLArgument;
    field?: GraphQLField<any, any>;
    type?: GraphQLNamedType;
    directive?: GraphQLDirective;
    schema?: GraphQLSchema;
};
export declare type EnumValueReference = {
    kind: 'EnumValue';
    value?: GraphQLEnumValue;
    type?: GraphQLEnumType;
    schema?: GraphQLSchema;
};
export declare type TypeReference = {
    kind: 'Type';
    type: GraphQLNamedType;
    schema?: GraphQLSchema;
};
export declare function getFieldReference(typeInfo: any): FieldReference;
export declare function getDirectiveReference(typeInfo: any): DirectiveReference;
export declare function getArgumentReference(typeInfo: any): ArgumentReference;
export declare function getEnumValueReference(typeInfo: TypeInfo): EnumValueReference;
export declare function getTypeReference(typeInfo: any, type?: Maybe<GraphQLNamedType>): TypeReference;
//# sourceMappingURL=SchemaReference.d.ts.map