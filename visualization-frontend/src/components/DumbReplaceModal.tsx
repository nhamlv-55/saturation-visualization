import * as React from 'react';
import {ChangeEvent} from "react";
const icons = require('../resources/icons/all.svg') as string;


type Props = {
    dumbReplaceMap: {},
    onApplyDumbReplaceMap:(newReplaceMap: string)=>void
}
type State = {
    localReplaceMap: string
}
export default class DumbReplaceModal extends React.Component<Props, State> {
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
            <div onKeyUp={this.handleKeyUp}>
                <section className="dumb-replace-wrapper">
                    <label>Replacement map:</label>
                    <br/>
                    <textarea value={this.state.localReplaceMap} onChange={this.handleTextareaChange.bind(this)}/>
                    <br/>
                    <button onClick={this.props.onApplyDumbReplaceMap.bind(this, this.state.localReplaceMap)}>Apply</button>
                </section>
            </div>
        );
    }
}

