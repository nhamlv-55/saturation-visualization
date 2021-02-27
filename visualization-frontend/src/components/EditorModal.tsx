import * as React from 'react';
import '../styles/Editor.css';
import TreeEditor from "./TreeEditor";
import { Transformer } from "../helpers/transformers";
import {inOutExample} from "../helpers/datatypes";
type Props = {
    inputList: string[],
    expName: string,
    onTransformExprs?: (t: string)=> Promise<void>,
    onAddInputOutputExample: (example: inOutExample)=>void,
}

type State = {
    selectedInput: string,
}
export class EditorModal extends React.Component<Props, State> {
    private isChromeOrFirefox = true;

    state = {selectedInput: "()"};

    openEditor(input: string){
        console.log("click Apply")

        console.log(input)
        /* getValue()!; */

        this.setState({
            selectedInput: input
        });
    }

    getFormulas(input: string): string[]{
        return input.split(/\n\s*\n/);
    }

    blast(tStack: Transformer[]){
        return;
    }
    
    render() {
        return (
            <section className="formula-editor-modal">
                <section className="editor">
                    <div id="editor-wrapper">
                        <h2>Original</h2>
                        {this.props.inputList.map((input, key) => (
                        <button key={key} onClick={this.openEditor.bind(this, input)} className="formula-button">
                                <pre>
                                    {input}
                                </pre>

                            </button>
                        ))}
                    </div>
                    <TreeEditor
                        expName ={this.props.expName}
                        input = {this.state.selectedInput}
                        onBlast = {this.blast.bind(this)}
                        isModal = {true}
                        onTransformExprs = {this.props.onTransformExprs!.bind(this)}
                        onAddInputOutputExample ={this.props.onAddInputOutputExample.bind(this)}
                    /> 
                </section>

            </section>
        );
    }
}

