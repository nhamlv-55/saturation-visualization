import * as React from 'react';
import '../styles/Editor.css';
import TreeEditor from "./TreeEditor";
import { AST, ASTTransformer, Transformer} from "../helpers/transformers";
const icons = require('../resources/icons/all.svg') as string;

type Props = {
    inputList: string[],
    expName: string,
    onTransformExprs?: (t: string)=> Promise<void>,
    saveExprs?: ()=> void,
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
        /* let transformer = new ASTTransformer();


         * console.log(all_formulas);
         * console.log(tStack);
         * console.log("pew pew !");

         * let output=""
         * for(var f of all_formulas){
         *     let ast = new AST(f);
         *     let new_ast = transformer.runStack(ast, tStack);
         *     let new_f = new_ast.toString(-1, new_ast.nodeList[0]);
         *     output+=new_f+"\n\n";
         * }
         * this.setState({output: output}); */
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
                        saveExprs = {this.props.saveExprs!.bind(this)}
                    /> 
                </section>

            </section>
        );
    }
}

