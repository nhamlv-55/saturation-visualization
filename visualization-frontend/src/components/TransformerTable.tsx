import * as React from 'react';
import '../styles/NodeMenu.css';
import {Link} from 'react-router-dom';

type Props = {
    exp_path: string,
    ExprMap: {},
    onUpdateLocalExprMap: ({}) => void
};
type State = {
    transformationFlag: boolean,
    transformationErrorFlag: boolean,
    transformationSelected: string,
    isFetching: boolean,
    progs: any[],
}

export default class TransformerTable extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            transformationFlag: false,
            transformationErrorFlag: false,
            transformationSelected: "",
            isFetching: false,
            progs: []
        };
    }


    async componentDidMount() {
        await this.fetchProgs();
    }

    render() {
        return (
                <div>
                {this.state.progs.map((item, index) => (
                    <button className="ts-button" key = {item.hash} onClick={this.multiTransformExprs!.bind(this, item.xml_ast)}>{item.human_readable_ast}</button>
                ))}
                <p>{this.state.isFetching ? 'Fetching transformer...' : ''}</p>
                </div>
        )
    }
    async multiTransformExprs(programs: string) {
        let localExprMap = this.props.ExprMap;
        this.setState({
            transformationFlag: false,
            transformationErrorFlag: false
        });
        const response = await fetch("http://localhost:5000/spacer/apply_multi_transformation", {
            method: 'POST',
            mode :'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, body : JSON.stringify({
                exp_path: this.props.exp_path,
                selectedProgram: programs,
                lemmas: this.props.ExprMap
            })
        });

        if (response.status === 200){
            let responseData = await response.json();
            let tExprMap = responseData["response"];
            console.log("tExprMap", tExprMap);
            Object.keys(tExprMap).forEach((key) => {
                localExprMap[key].raw = tExprMap[key]['raw'];
                localExprMap[key].readable = tExprMap[key]['readable'];
            });

            this.setState({
                transformationFlag: true,
            });
            this.props.onUpdateLocalExprMap(localExprMap);
        }
        else {
            this.setState({
                transformationErrorFlag: true
            });
        }
    }


    async fetchProgs() {
        this.setState({
            isFetching: true,
        });

        const fetchedJSON = await fetch('http://localhost:5000/spacer/fetch_progs', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, body : JSON.stringify({
                "exp_path": this.props.exp_path
            })
        });

        try {
            const json = await fetchedJSON.json();
            console.log(json)
            this.setState({isFetching: false, progs: json.progs_list})
        } catch (error) {
            if (error.name === "SatVisAssertionError") {
                throw error;
            }
            this.setState({
                progs: []
            });
        }
    }


}
