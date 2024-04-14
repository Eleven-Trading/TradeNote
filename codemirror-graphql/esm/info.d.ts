import { GraphQLSchema } from 'graphql';
import { SchemaReference } from './utils/SchemaReference';
import './utils/info-addon';
import type { Maybe } from 'graphql-language-service';
export interface GraphQLInfoOptions {
    schema?: GraphQLSchema;
    onClick?: Maybe<(ref: Maybe<SchemaReference>, e: MouseEvent) => void>;
    renderDescription?: (str: string) => string;
    render?: () => string;
}
//# sourceMappingURL=info.d.ts.map