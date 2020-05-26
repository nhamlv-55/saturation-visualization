import * as React from 'react';
import {getProblemName} from "../helpers/readable";

type Props = {
    name: string
    updateRelatedExprMap: (exprMap) => void
}

type State = {
    matchingFiles: any[],
    exps: any[],
    selected: string
}

class ExprMapSelector extends React.Component<Props, State> {
    constructor(props: Props){
        super(props);
        this.state = {
            matchingFiles: [],
            exps: [],
            selected: ""
        }
    }
    
    async componentDidMount() {
        await this.fetchExps();
        this.getMatchingFiles();
        await this.getMatchingExprMap();
    }

    getMatchingFiles() {
        let data = this.state.exps.filter(exp => exp.name.includes(getProblemName(this.props.name)) && exp.name !== this.props.name);
        
        if (data.length > 0){
            this.setState({
                matchingFiles: data,
                selected: data[0].name
            });
        }
    }
    
    async getMatchingExprMap() {
        const fetchedJSON = await fetch('http://localhost:5000/spacer/get_exprs', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, body : JSON.stringify({
                exp_path: this.state.selected,
            })
        });

        try {
            const json = await fetchedJSON.json();
            this.props.updateRelatedExprMap(JSON.parse(json.expr_map));
        } catch (error) {
            if (error.name === "SatVisAssertionError") {
                throw error;
            }
            this.setState({
                exps: []
            });
        }
    }

    async fetchExps() {
        const fetchedJSON = await fetch('http://localhost:5000/spacer/fetch_exps', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, body : ""
        });

        try {
            const json = await fetchedJSON.json();
            this.setState({exps: json.exps_list})
        } catch (error) {
            if (error.name === "SatVisAssertionError") {
                throw error;
            }
            this.setState({
                exps: []
            });
        }
    }
    
    updateSelected(e) {
        this.setState({
            selected: e.target.value
        });
    } 
    
    render() {
        return (
            <section className={"component-node-details details-top-right"}>
                <select id="exps" onChange={this.updateSelected.bind(this)}>
                {this.state.matchingFiles.length > 0 && this.state.matchingFiles.map((exp, key) => (
                    <option key={key} value={exp.name}>{exp.name}</option>
                ))}
                </select>
                <button onClick={this.getMatchingExprMap.bind(this)}>Get Expr Map</button>
            </section>

        );
    }
}

export default ExprMapSelector