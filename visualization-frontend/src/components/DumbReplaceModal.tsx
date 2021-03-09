import * as React from 'react';
import {ChangeEvent} from "react";
import TransformerTable from './TransformerTable';
import '../styles/TransformerMenu.css';
import { inOutExample, IExprMap } from '../helpers/datatypes';
import { uuid } from 'uuidv4';

import ExprMapSelector from "./ExprMapSelector";
type Props = {
    expName: string,
    ExprMap: IExprMap,
    dumbReplaceMap: {},
    onApplyDumbReplaceMap:(newReplaceMap: string)=>void,
    onSaveExprMap: () => void,
    onUpdateExprMap: (exprMap: IExprMap) => void,
    onPushToMessageQ: (channel: string, msg: string)=>void,
    inputOutputExamples: inOutExample[],
}
type State = {
    localReplaceMap: string,
    key: string //this is to trigger an update in TransformerTable. Whenever key is changed, TransformerTable will be updated
}
export default class TransformerMenu extends React.Component<Props, State> {
    state = {
        localReplaceMap: JSON.stringify(this.props.dumbReplaceMap, null, 2),
        key: uuid() 
    }

    handleTextareaChange(e: ChangeEvent<HTMLTextAreaElement>){
        this.setState({
            localReplaceMap: e.target.value
        })
    }

    handleKeyUp(event: React.KeyboardEvent<HTMLDivElement>) {
        event.stopPropagation();
    }

    async learnTransformationFromInputOutput() {
        let payload = {
            "inputOutputExamples": this.props.inputOutputExamples,
            "expName": this.props.expName,
        };
        console.log("payload", payload);
        const response = await fetch("http://localhost:5000/spacer/learn_transformation", {
            method: 'POST',
            mode :'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, body : JSON.stringify(payload)
        });
        if (response.status === 200){
            const responseJson = await response.json();
            let possiblePrograms = responseJson["response"];
            console.log(possiblePrograms);
            if(possiblePrograms.length > 0){
                this.setState({
                    key: uuid()
                });
            }
        }
    }


    updateRelatedExprMap(exprMap: IExprMap) {
        this.props.onPushToMessageQ("TransformerMenu", "")
        /* this.setState({
         *     relatedExprMap: exprMap 
         * }); */
    }


    render() {
        return (
            <div className ="transformer-menu" onKeyUp={this.handleKeyUp}>
                <section className="dumb-replace-wrapper">
                    <button onClick={this.props.onSaveExprMap.bind(this)}>Save</button>
                    
                    <ExprMapSelector
                        expName = {this.props.expName}
                        updateRelatedExprMap = {this.updateRelatedExprMap.bind(this)}
                    />

                    <label>Replacement map:</label>
                    <br/>
                    <textarea value={this.state.localReplaceMap} onChange={this.handleTextareaChange.bind(this)}/>
                    <br/>
                    <button onClick={this.props.onApplyDumbReplaceMap.bind(this, this.state.localReplaceMap)}>Apply Text Replacement</button>
                    <br/>
                    <label>All input output examples:</label>
                    <textarea value={JSON.stringify( this.props.inputOutputExamples, null, 2)} disabled={true} />
                    <br/>
                    <button onClick={this.learnTransformationFromInputOutput.bind(this, this.state.localReplaceMap)}>Learn new transformations</button>
                 </section>
                 <TransformerTable
                     key={this.state.key}
                     expName={this.props.expName}
                     ExprMap ={this.props.ExprMap}
                     onUpdateLocalExprMap = {this.props.onUpdateExprMap.bind(this)}
                     onPushToMessageQ ={this.props.onPushToMessageQ.bind(this)}
                 />
            </div>
        );
    }
}

