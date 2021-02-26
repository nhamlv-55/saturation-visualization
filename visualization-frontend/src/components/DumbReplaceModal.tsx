import * as React from 'react';
import {ChangeEvent} from "react";
import TransformerTable from './TransformerTable';
import '../styles/TransformerMenu.css';
import {ExprItem} from "../helpers/network";


type Props = {
    expName: string,
    ExprMap: {}
    dumbReplaceMap: {},
    onApplyDumbReplaceMap:(newReplaceMap: string)=>void
    onUpdateExprMap: ({}) => void
}
type State = {
    localReplaceMap: string
}
export default class TransformerMenu extends React.Component<Props, State> {
    state = {
        localReplaceMap: JSON.stringify(this.props.dumbReplaceMap, null, 2)
    }

    handleTextareaChange(e: ChangeEvent<HTMLTextAreaElement>){
        this.setState({
            localReplaceMap: e.target.value
        })
    }
    handleKeyUp(event) {
        event.stopPropagation();
    }
    render() {
        return (
            <div className ="transformer-menu" onKeyUp={this.handleKeyUp}>
                <section className="dumb-replace-wrapper">
                    <label>Replacement map:</label>
                    <br/>
                    <textarea value={this.state.localReplaceMap} onChange={this.handleTextareaChange.bind(this)}/>
                    <br/>
                    <button onClick={this.props.onApplyDumbReplaceMap.bind(this, this.state.localReplaceMap)}>Apply Text Replacement</button>
                </section>
                    <TransformerTable
                        expName={this.props.expName}
                        ExprMap ={this.props.ExprMap}
                        onUpdateLocalExprMap = {this.props.onUpdateExprMap.bind(this)}
                    />
            </div>
        );
    }
}

