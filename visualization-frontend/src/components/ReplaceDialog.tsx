import * as React from 'react';
import {ChangeEvent} from "react";

type Props = {
    onApply: (action: string, params: {})=>void,
}

type State = {
    source: string,
    target: string,
    regex: boolean
}


class ReplaceDialog extends React.Component<Props, State> {
    state = {
        source: "",
        target: "",
        regex: false,
    };
    
    handleSourceChange(e: ChangeEvent<HTMLInputElement>) {
        this.setState({
            source: e.target.value
        })
    }
    handleTargetChange(e: ChangeEvent<HTMLInputElement>) {
        this.setState({
            target: e.target.value
        })
    }

    handleRegexChange(e: ChangeEvent<HTMLInputElement>) {
        this.setState({
            regex: e.target.checked
        })
    }

    handleKeyUp(event) {
        event.stopPropagation();
    }
    render() {
        return (
            <div onKeyUp={this.handleKeyUp}>
                {`Replace: `}<input type="text" defaultValue="" onChange={this.handleSourceChange.bind(this)} />
                {` with: `}<input type="text" defaultValue="" onChange={this.handleTargetChange.bind(this)}/>
                {`\tRegex?`}
                <input type="checkbox"
                       defaultChecked={false}
                       onChange={this.handleRegexChange.bind(this)} 
                />
                <button onClick={this.props.onApply.bind(this, "replace",
                                                         {"source": this.state.source,
                                                          "target": this.state.target,
                                                          "regex": this.state.regex
                })}>Replace</button>
                </div>
        );
    }


}

export default ReplaceDialog;
