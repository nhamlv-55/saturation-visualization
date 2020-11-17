import * as React from 'react';
import { assert } from '../model/util';
import { AST, ASTTransformer, Transformer} from "./../helpers/transformers";
const icons = require('../resources/icons/all.svg') as string;

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



    render() {
        console.log(this.props, this.state)
        return (
            <div>
                {`Replace: `}<input type="text" defaultValue=""onChange={(e)=> {this.setState({source: e.target.value})}} />
                {` with: `}<input type="text" defaultValue=""onChange={(e)=> {this.setState({target: e.target.value})}}/>
                {`\tRegex?`}
                <input type="checkbox"
                       defaultChecked={false}
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
