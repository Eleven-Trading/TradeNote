import { typeFromAST, } from 'graphql';
export default function collectVariables(schema, documentAST) {
    const variableToType = Object.create(null);
    for (const definition of documentAST.definitions) {
        if (definition.kind === 'OperationDefinition') {
            const { variableDefinitions } = definition;
            if (variableDefinitions) {
                for (const { variable, type } of variableDefinitions) {
                    const inputType = typeFromAST(schema, type);
                    if (inputType) {
                        variableToType[variable.name.value] = inputType;
                    }
                }
            }
        }
    }
    return variableToType;
}
//# sourceMappingURL=collectVariables.js.map