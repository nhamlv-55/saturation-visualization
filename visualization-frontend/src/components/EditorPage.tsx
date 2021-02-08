import * as React from 'react';
import '../styles/Editor.css';
import * as Monaco from 'monaco-editor'
import TreeEditor from "./TreeEditor";
import { AST, ASTTransformer, Transformer} from "../helpers/transformers";
const icons = require('../resources/icons/all.svg') as string;

type Props = {
    input: string,
    name: string,
    onTransformExprs?: (t: string)=> Promise<void>,
    saveExprs?: ()=> void,
}

type State = {
    input: string,
    output: string
}


export class EditorPage extends React.Component<Props, State> {
    private isChromeOrFirefox = true;
    monacoDiv = React.createRef<HTMLDivElement>();
    monaco: Monaco.editor.IStandaloneCodeEditor | null = null

    state: State = {
        input: "()",
        output: ""
    };


    componentDidMount() {
        if (!this.isChromeOrFirefox) {
            return;
        }

        // generate instance of Monaco Editor
        this.monaco = Monaco.editor.create(this.monacoDiv.current!, {
            lineNumbers: 'off',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            scrollBeyondLastColumn: 0,
            minimap: {
                enabled: false
            },
            renderLineHighlight: 'none',
            hideCursorInOverviewRuler: true,
            links: false,
            overviewRulerBorder: false,
            automaticLayout: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
            wordWrap: 'wordWrapColumn'
            // fontFamily: "Monaco" TODO: decide which font to use. By default, multiple fonts are loaded, which is quite slow
        });

        this.monaco.setValue(this.props.input);

        /* this.monaco.setValue(this.props.problem);
         * this.monaco.getModel()!.onDidChangeContent(() => {
         *     console.log(this.monaco!.getModel()!.getValue());
         *     this.props.onChangeProblem(this.monaco!.getModel()!.getValue());
         * }); */
    }

    openEditor(){
        console.log("click Apply")

        let input = this.monaco!.getModel()!.getValueInRange(this.monaco!.getSelection()!);
        console.log(input)
        /* getValue()!; */

        this.setState({
            input: input
        });
    }

    getFormulas(input: string): string[]{
        return input.split(/\n\s*\n/);
    }

    blast(tStack: Transformer[]){
        let all_formulas = this.getFormulas(this.monaco?.getModel()!.getValue()!);
        let transformer = new ASTTransformer();


        console.log(all_formulas);
        console.log(tStack);
        console.log("pew pew !");

        let output=""
        for(var f of all_formulas){
            let ast = new AST(f);
            let new_ast = transformer.runStack(ast, tStack);
            let new_f = new_ast.toString(-1, new_ast.nodeList[0]);
            output+=new_f+"\n\n";
        }
        this.setState({output: output});
    }

    render() {
        if (!this.isChromeOrFirefox) {
            return (
                <section className="unsupported-message">
                    <svg viewBox="0 0 24 24" className="icon">
                        <use xlinkHref={`${icons}#alert-triangle`}/>
                    </svg>
                    <span>Your current browser is not supported. Please use Chrome or Firefox!</span>
                </section>
            );
        }

        return (
            <section className="component-menu">
                <section className="editor">
                    <div id="editor-wrapper">
                        <h2>Original</h2>
                        <div ref={this.monacoDiv} className="monaco" id="input"></div>
                        <button onClick={this.openEditor.bind(this)}>Open Editor</button>
                        <h2>Transformed</h2>
                        <textarea ref="output" id="output" rows={30} value={this.state.output} readOnly></textarea>
                    </div>
                     <TreeEditor
                         name ={this.props.name}
                         input = {this.state.input}
                         onBlast = {this.blast.bind(this)}
                         isModal = {false}
                     />
                </section>

            </section>
        );
    }
}

