import CodeMirror from 'codemirror';
import { State } from 'graphql-language-service';
export default function indent(this: CodeMirror.Mode<any> & {
    electricInput?: RegExp;
    config?: CodeMirror.EditorConfiguration;
}, state: State, textAfter: string): number;
//# sourceMappingURL=mode-indent.d.ts.map