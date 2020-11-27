import * as React from 'react';
import {Link} from 'react-router-dom';
import '../styles/Editor.css';
import * as Monaco from 'monaco-editor'
import TransformerTable from './TransformerTable';
import { assert } from '../model/util';
import TreeEditor from "./TreeEditor";
import { AST, ASTTransformer, Transformer} from "./../helpers/transformers";
const icons = require('../resources/icons/all.svg') as string;

type Props = {
    input: string
}

type State = {
    input: string,
    output: string
}


export class Editor extends React.Component<Props, State> {
    // private isChromeOrFirefox = navigator.userAgent.indexOf('Chrome') > -1 || navigator.userAgent.indexOf('Firefox') > -1;
    private isChromeOrFirefox = true;
    private fileUpload = React.createRef<HTMLInputElement>();
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

        /* this.monaco.setValue(this.props.problem);
         * this.monaco.getModel()!.onDidChangeContent(() => {
         *     console.log(this.monaco!.getModel()!.getValue());
         *     this.props.onChangeProblem(this.monaco!.getModel()!.getValue());
         * }); */
    }
    openEditor(){
        console.log("click Apply")
        /* let current_bracket = this.monaco?.getModel()!.matchBracket(1); */

        /* console.log(current_bracket); */
        let input = this.monaco!.getModel()!.getValueInRange(this.monaco!.getSelection()!);
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
                <h1>Transformer Editor</h1>

                <section className="editor">
                    <div id="editor-wrapper">
                        <h2>Original</h2>
                        <div ref={this.monacoDiv} className="monaco" id="input"></div>
                        <button onClick={this.openEditor.bind(this)}>Open Editor</button>
                        <h2>Transformed</h2>
                        <textarea ref="output" id="output" rows={30} value={this.state.output} readOnly></textarea>
                        
                    </div>
                    {/* <TransformerTable/> */}
                    <TreeEditor
                        input = {this.state.input}
                        onBlast = {this.blast.bind(this)}
                    />
                </section>

            </section>
        );
    }

    chooseFile() {
        if (this.fileUpload.current) {
            this.fileUpload.current.click();
        }
    }

}
