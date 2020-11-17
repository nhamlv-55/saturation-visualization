import * as React from 'react';
import { assert } from '../model/util';
import { AST, ASTTransformer, Transformer} from "./../helpers/transformers";
const icons = require('../resources/icons/all.svg') as string;

type Props = {
    source: string,
    target: string,
    regex: boolean,
    onApply: (action: string, params: {})=>void,
}

type State = {
    source: string,
    target: string,
    regex: boolean
}


class ReplaceDialog extends React.Component<Props, State> {
    state: State = {
        source: this.props.source,
        target: this.props.target,
        regex: this.props.regex
    };



    render() {
        console.log(this.state)
        return (
            <div>
                {`Replace: `}<input type="text" defaultValue={this.props.source} onChange={(e)=> {this.setState({source: e.target.value})}} />
                {` with: `}<input type="text" defaultValue={this.props.target} onChange={(e)=> {this.setState({target: e.target.value})}}/>
                {`\tRegex?`}
                <input type="checkbox"
                       defaultChecked={this.props.regex}
                       onChange={(e)=> {this.setState({regex: e.target.checked})} }
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
