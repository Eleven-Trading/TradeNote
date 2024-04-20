export default function forEachState(stack, fn) {
    const reverseStateStack = [];
    let state = stack;
    while (state === null || state === void 0 ? void 0 : state.kind) {
        reverseStateStack.push(state);
        state = state.prevState;
    }
    for (let i = reverseStateStack.length - 1; i >= 0; i--) {
        fn(reverseStateStack[i]);
    }
}
//# sourceMappingURL=forEachState.js.map