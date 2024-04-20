import './utils/jump-addon';
import { GraphQLSchema } from 'graphql';
import type { State } from 'graphql-language-service';
export interface GraphQLJumpOptions {
    schema?: GraphQLSchema;
    onClick?: () => void;
    state?: State;
}
//# sourceMappingURL=jump.d.ts.map