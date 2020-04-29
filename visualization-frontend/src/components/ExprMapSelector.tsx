import * as React from 'react';
import {getProblemName} from "../helpers/readable";

type Props = {
    name: string
}

class ExprMapSelector extends React.Component<Props, any> {
    constructor(props: Props){
        super(props);
        this.state = {
            matchingFiles: [],
            exps: [],
            selected: "",
            exprMap: []
        }
    }
    
    async componentDidMount() {
        await this.fetchExps();
        this.getMatchingFiles();
    }

    getMatchingFiles() {
        let data = this.state.exps.filter(exp => exp.name.includes(getProblemName(this.props.name)) && exp.name !== this.props.name);
        
        this.setState({
            matchingFiles: data,
            selected: data[0].name
        });
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
            this.setState({exprMap: JSON.parse(json.expr_map)})
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
        console.log(this.state.exprMap);
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