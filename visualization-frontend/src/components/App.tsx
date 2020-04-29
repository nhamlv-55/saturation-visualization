import * as React from 'react';
import { Component } from 'react';

import Main from './Main';
import Aside from './Aside';
import '../styles/App.css';
import { assert } from '../model/util';
import {buildExprMap, buildPobLemmasMap} from "../helpers/network";
import {toReadable} from "../helpers/readable";

type Props = {
    name: string,
    exp_path: string,
    mode: "proof" | "replay" | "iterative",
    problem: string,
    spacerUserOptions: string,
    hideBracketsAssoc: boolean,
    nonStrictForNegatedStrictInequalities: boolean,
    orientClauses: boolean,
    varNames: string
};

type State = {
    exp_path: string,
    state: "loaded" | "loaded iterative" | "waiting" | "layouting" | "error",
    trees: any[],
    runCmd: string,
    message: string,
    nodeSelection: number[],
    currentTime: number,
    layout: string,
    expr_layout: "SMT" | "JSON",
    PobLemmasMap: {},
    ExprMap: {},
    multiselect: boolean,
    varNames: string
}

class App extends Component<Props, State> {

    state: State = {
        exp_path: this.props.exp_path,
        state: "waiting",
        trees: [],
        runCmd: "Run command:",
        message: "",
        nodeSelection: [],
        currentTime: 0,
        layout: "PobVis",
        expr_layout: "SMT",
        PobLemmasMap: {},
        ExprMap: {},
        multiselect: false,
        varNames: ""
    };

    async componentDidMount() {
        if(this.props.mode === "iterative"){
            // call Spacer on given input problem
            await this.runSpacer(this.props.problem, this.props.spacerUserOptions, this.props.mode);
        }
        else {
            await this.poke();
        }
    }

    async poke() {
        console.log("poking...")
        this.setState({
            state: "waiting",
            message: "Poking Spacer...",
        });

        const fetchedJSON = await fetch('http://localhost:5000/spacer/poke', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, body : JSON.stringify({
                exp_path: this.state.exp_path,
            })
        });

        try {
            const json = await fetchedJSON.json();
            console.log("backend response:", json);
            if (json.status === "success") {
                let tree = json.nodes_list;
                for (let i = 0; i < Object.keys(tree).length; i++){
                    let readable = toReadable(tree[i].expr, json.var_names);
                    tree[i].expr = {
                        raw: tree[i].expr,
                        readable: readable,
                    };
                }
                const state = "loaded";
                const PobLemmasMap = buildPobLemmasMap(tree, json.var_names);
                // NOTE: use varNames in state, not in props. The one in state is returned by the backend.
                let ExprMap;
                if (json.expr_map === "") {
                    ExprMap = buildExprMap(tree, json.var_names);
                }
                else {
                    ExprMap = JSON.parse(json.expr_map);
                }
                this.setState({
                    trees: [tree],
                    runCmd: json.run_cmd,
                    message: "Spacer is "+json.spacer_state,
                    state: state,
                    PobLemmasMap: PobLemmasMap,
                    ExprMap: ExprMap,
                    varNames: json.var_names
                });
                console.log("state is set")
            } else {
                assert(json.status === "error");
                const errorMessage = json.message;
                assert(errorMessage !== undefined && errorMessage !== null);
                this.setState({
                    state: "error",
                    message: errorMessage,
                });
            }
        } catch (error) {
            if (error.name === "SatVisAssertionError") {
                throw error;
            }
            this.setState({
                state: "error",
                message: `Error: ${error["message"]}`,
            });
        }
    }
    
    async saveExprMap() {
        const fetchedJSON = await fetch('http://localhost:5000/spacer/save_exprs', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, body : JSON.stringify({
                exp_path: this.state.exp_path,
                expr_map: JSON.stringify(this.state.ExprMap)
            })
        });
    }

    async runSpacer(problem: string, spacerUserOptions: string, mode: "proof" | "replay" | "iterative") {
        this.setState({
            state: "waiting",
            message: "Waiting for Spacer...",
        });

        const fetchedJSON = await fetch('http://localhost:5000/spacer/start_iterative', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: this.props.name,
                file: problem,
                spacerUserOptions: spacerUserOptions,
                varNames: this.props.varNames
            })
        });

        try {
            const json = await fetchedJSON.json();
            console.log("backend response:", json);
            if (json.status === "success") {
                const state = (mode === "iterative" && json.spacer_state === "running") ? "loaded iterative" : "loaded";
                const message = "Hit Poke to update graph";
                this.setState({
                    exp_path: json.exp_name,
                    message: message,
                    state: state,
                });
            } else {
                assert(json.status === "error");
                const errorMessage = json.message;
                assert(errorMessage !== undefined && errorMessage !== null);
                this.setState({
                    state: "error",
                    message: errorMessage,
                });
            }
        } catch (error) {
            if (error.name === "SatVisAssertionError") {
                throw error;
            }
            this.setState({
                state: "error",
                message: `Error: ${error["message"]}`,
            });
        }
    }

    updateNodeSelection(nodeSelection: number[]) {
        if (this.state.multiselect) {
            let tempNodeSelection = this.state.nodeSelection.slice(this.state.nodeSelection.length-1).concat(nodeSelection);
            this.setState({nodeSelection: tempNodeSelection});
        } else {
            this.setState({nodeSelection: nodeSelection});
        }
    }
    
    updateCurrentTime(currentTime: number) {
        const trees = this.state.trees;
        assert(trees.length > 0);
        this.setState({
            currentTime: currentTime
        });
    }

    setPobVisLayout(){
        this.setState({ layout: "PobVis" })
    }
    setSatVisLayout(){
        this.setState({ layout: "SatVis" })
    }
    setMultiSelect() {
        if (this.state.multiselect) {
            if (this.state.nodeSelection.length > 0) {
                this.setState({
                    nodeSelection: [this.state.nodeSelection[this.state.nodeSelection.length - 1]]
                });
            }
            else {
                this.setState({
                    message: "Hit Poke to update graph"
                })
            }
        } else {
            this.setState({
                message: "Select Up to 2 nodes"
            });
        }
        this.setState({
            multiselect: !this.state.multiselect
        });
    }
    setSMTLayout(){
        this.setState({ expr_layout: "SMT" })
    }
    setJSONLayout(){
        this.setState({ expr_layout: "JSON" })
    }
    render() {
        const {
            state,
            trees,
            runCmd,
            message,
            nodeSelection,
            currentTime,
            layout,
            expr_layout,
            PobLemmasMap,
            ExprMap
        } = this.state;
        let tree;
        let main;
        if (state === "loaded") {
            assert(trees.length > 0);
            tree = trees[trees.length - 1];
            const hL = Object.keys(tree).length;
            main = (
                <Main
                    mode = { this.props.mode }
                    runCmd = {runCmd}
                    tree = { tree }
                    onNodeSelectionChange = { this.updateNodeSelection.bind(this) }
                    nodeSelection = { nodeSelection }
                    historyLength = { hL }
                    currentTime = { currentTime }
                    onCurrentTimeChange = { this.updateCurrentTime.bind(this) }
                    layout = { layout }
                    PobLemmasMap = { PobLemmasMap }
                />
            );
        } else {
            main = (
                <main>
                    <section className= "slider-placeholder" />
                </main>
            );
        }
        return (
                <div className= "app" >
                { main }
                <Aside
                    message = {message}
                    mode = { this.props.mode }
                    tree = { tree }
                    nodeSelection = { nodeSelection }
                    onUpdateNodeSelection = { this.updateNodeSelection.bind(this) }
                    onPoke = {this.poke.bind(this)}
                    SatVisLayout = { this.setSatVisLayout.bind(this) }
                    PobVisLayout = { this.setPobVisLayout.bind(this) }
                    MultiSelectMode= { this.setMultiSelect.bind(this) }
                    SMTLayout = { this.setSMTLayout.bind(this) }
                    JSONLayout = { this.setJSONLayout.bind(this) }
                    PobLemmasMap = { PobLemmasMap }
                    ExprMap = { ExprMap }
                    layout = { layout }
                    expr_layout ={expr_layout}
                    saveExprs = {this.saveExprMap.bind(this)}
                    name = {this.state.exp_path}
                />
                </div>
        );

    }

}

export default App;
