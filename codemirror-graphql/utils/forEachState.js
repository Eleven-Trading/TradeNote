"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function forEachState(stack, fn) {
    var reverseStateStack = [];
    var state = stack;
    while (state === null || state === void 0 ? void 0 : state.kind) {
        reverseStateStack.push(state);
        state = state.prevState;
    }
    for (var i = reverseStateStack.length - 1; i >= 0; i--) {
        fn(reverseStateStack[i]);
    }
}
exports.default = forEachState;
//# sourceMappingURL=forEachState.js.map