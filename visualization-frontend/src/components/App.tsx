import * as React from 'react';
import { Component } from 'react';

import Main from './Main';
import Aside from './Aside';
import {StarModal} from './StarModal';
import '../styles/App.css';
import { assert } from '../model/util';
import {buildExprMap, buildPobLemmasMap} from "../helpers/network";
import TransformerMenu from "./DumbReplaceModal";
import Modal from 'react-modal';
import { inOutExample } from '../helpers/datatypes';
const _ = require("lodash");

type Props = {
    expName: string,
};

type State = {
    expName: string,
    state: "loaded" | "loaded iterative" | "waiting" | "layouting" | "error",
    tree: any,
    runCmd: string,
    messages_q: string[],
    nodeSelection: number[],
    currentTime: number,
    layout: string,
    expr_layout: "SMT" | "JSON",
    PobLemmasMap: {},
    ExprMap: {},
    multiselect: boolean,
    varNames: string,
    starModalIsOpen: boolean,
    solvingCompleted: boolean,
    dumbReplaceMap: {},
    inputOutputExamples: inOutExample[],
}

class App extends Component<Props, State> {

    state: State = {
        expName: this.props.expName,
        state: "waiting",
        tree: {},
        runCmd: "Run command:",
        messages_q: [""],
        nodeSelection: [],
        currentTime: 0,
        layout: "PobVis",
        expr_layout: "SMT",
        PobLemmasMap: {},
        ExprMap: {},
        multiselect: false,
        varNames: "",
        starModalIsOpen: false,
        solvingCompleted: false,
        dumbReplaceMap: {},
        inputOutputExamples: []
    };

    async componentDidMount() {
        await this.poke();
    }

    async poke() {
        let message_q = ["Poking Spacer..."];

        console.log("poking...")
        this.setState({
            state: "waiting",
            messages_q: message_q,
        });

        const fetchedJSON = await fetch('http://localhost:5000/spacer/poke', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, body : JSON.stringify({
                expName: this.state.expName,
            })
        });

        try {
            const json = await fetchedJSON.json();
            console.log("backend response:", json);
            const tree = json["nodes_list"];
            
            const state = "loaded";
            const PobLemmasMap = buildPobLemmasMap(tree, json.var_names);
            // NOTE: use varNames in state, not in props. The one in state is returned by the backend.
            let ExprMap;
            if (Object.keys(json.expr_map).length === 0) {
                ExprMap = buildExprMap(tree, json.var_names);
            }
            else {
                ExprMap = json.expr_map;
            }

            this.setState({
                tree: tree,
                runCmd: json.run_cmd,
                messages_q: ["Spacer is "+json.spacer_state],
                state: state,
                PobLemmasMap: PobLemmasMap,
                ExprMap: ExprMap,
                varNames: json.var_names,
                solvingCompleted: !(json.spacer_state === "running")
            });
            console.log("state is set")
        } catch (error) {
            if (error.name === "SatVisAssertionError") {
                throw error;
            }
            this.setState({
                state: "error",
                messages_q: [`Error: ${error["message"]}`],
                solvingCompleted: false,
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
                expName: this.state.expName,
                expr_map: JSON.stringify(this.state.ExprMap)
            })
        });

        try{
            const json = await fetchedJSON.json();

            console.log(json);
        }catch(error){
            throw error;
        }

    }

    applyDumbReplaceMap(newReplaceMap: string){
        try{
            var newReplaceMapJSON: {};
            newReplaceMapJSON = JSON.parse(newReplaceMap);

            var newExprMap = _.cloneDeep(this.state.ExprMap);
            for(let key in newExprMap) {
                for (let source in newReplaceMapJSON){
                    newExprMap[key].editedReadable = newExprMap[key].editedReadable.replaceAll(source, newReplaceMapJSON[source]);
                }
            }

            this.setState({dumbReplaceMap: newReplaceMapJSON, ExprMap: newExprMap});
        }catch(error){
            this.setState({messages_q: [`Error in applyDumbReplaceMap: ${error["message"]}`]});
        }
    }
    updateExprMap(newExprMap: {}){
        console.log("newExprMap", newExprMap);
        try{
            this.setState({ExprMap: newExprMap});
        }catch(error){
            this.setState({messages_q: [`Error in updateExprMap: ${error["message"]}`]});
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
        /* assert(this.state.tree); */
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
                    messages_q: ["Hit Poke to update graph"]
                })
            }
        } else {
            this.setState({
                messages_q: ["Select Up to 2 nodes"]
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

    openStarModal(){
        this.setState({starModalIsOpen: true});
    }

    closeStarModal(){
        this.setState({starModalIsOpen: false});
    }


    addInputOutputExample(example: inOutExample){
        this.setState({inputOutputExamples: [...this.state.inputOutputExamples, example]});
    }

    render() {

        let main;
        if (this.state.state === "loaded") {
            const hL = Object.keys(this.state.tree).length;
            main = (
                <Main
                    runCmd = {this.state.runCmd}
                    tree = { this.state.tree }
                    onNodeSelectionChange = { this.updateNodeSelection.bind(this) }
                    nodeSelection = { this.state.nodeSelection }
                    historyLength = { hL }
                    currentTime = { this.state.currentTime }
                    onCurrentTimeChange = { this.updateCurrentTime.bind(this) }
                    layout = { this.state.layout }
                    PobLemmasMap = { this.state.PobLemmasMap }
                    solvingCompleted = {this.state.solvingCompleted}
                />
            );
        } else {
            main = (
                <main >
                    <section className= "slider-placeholder" />
                </main>
            );
        }
        return (
            <div className= "app" >
                <Modal
                    isOpen={this.state.starModalIsOpen}
                    onRequestClose={this.closeStarModal.bind(this)}
                    overlayClassName="star-modal-overlay"
                    className="star-modal"
                    shouldCloseOnOverlayClick={false}
                >
                    <h2>Final invariant</h2>
                    <button onClick={this.closeStarModal.bind(this)}>Close</button>
                    <StarModal
                        expName = {this.props.expName}
                        PobLemmasMap = {this.state.PobLemmasMap}
                        ExprMap = {this.state.ExprMap}
                    />
                </Modal>
                { main }
                <TransformerMenu
                    dumbReplaceMap ={this.state.dumbReplaceMap}
                    onApplyDumbReplaceMap={this.applyDumbReplaceMap.bind(this)}
                    expName={this.props.expName}
                    ExprMap ={this.state.ExprMap}
                    onUpdateExprMap={this.updateExprMap.bind(this)}
                    inputOutputExamples={this.state.inputOutputExamples}
                    onSaveExprMap={this.saveExprMap.bind(this)}
                />
                <Aside
                    messages_q = {this.state.messages_q}
                    tree = { this.state.tree }
                    nodeSelection = { this.state.nodeSelection }
                    onUpdateNodeSelection = { this.updateNodeSelection.bind(this) }
                    onPoke = {this.poke.bind(this)}
                    onOpenStarModal = {this.openStarModal.bind(this)}
                    SatVisLayout = { this.setSatVisLayout.bind(this) }
                    PobVisLayout = { this.setPobVisLayout.bind(this) }
                    MultiSelectMode= { this.setMultiSelect.bind(this) }
                    SMTLayout = { this.setSMTLayout.bind(this) }
                    JSONLayout = { this.setJSONLayout.bind(this) }
                    PobLemmasMap = { this.state.PobLemmasMap }
                    ExprMap = { this.state.ExprMap }
                    layout = { this.state.layout }
                    expr_layout ={this.state.expr_layout}
                    expName = {this.state.expName}
                    solvingCompleted = {this.state.solvingCompleted}
                    onAddInputOutputExample ={this.addInputOutputExample.bind(this)}
                />
                </div>
        );

    }

}

export default App;
