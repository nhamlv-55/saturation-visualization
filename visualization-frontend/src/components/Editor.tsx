import * as React from 'react';
import {Link} from 'react-router-dom';
import '../styles/Editor.css';
import * as Monaco from 'monaco-editor'
import TransformerTable from './TransformerTable';
import { assert } from '../model/util';
import TreeEditor from "./TreeEditor";
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
            automaticLayout: true,
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
        let input = this.monaco?.getModel()!.getValue()!;

        console.log(input);

        this.setState({
            input: input
        });
    }
    applyTransformation(){
        console.log("click Apply")
        let input = this.monaco?.getModel()!.getValue();

        console.log(input);

        this.setState({
            output: input+"blha blah"
        });
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
                    <div className="editor-spacer">
                        <main>
                            <h2>Original</h2>
                            <div ref={this.monacoDiv} className="monaco"></div>
                            <button onClick={this.openEditor.bind(this)}>Open Editor</button>
                            <button onClick={this.applyTransformation.bind(this)}>Apply</button>
                            <button>Learn</button>

                            <h2>Transformed</h2>
                            <textarea ref="output" id="output" rows={30} value={this.state.output}></textarea>

                        </main>
                        <div className="tree-editor">
                            <TransformerTable/>
                            <TreeEditor
                                input = {this.state.input}
                                spacerUserOptions =""
                            />
                        </div>
                    </div>
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

