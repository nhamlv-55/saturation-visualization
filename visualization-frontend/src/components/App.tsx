import * as React from 'react';
import { Component } from 'react';

import Main from './Main';
import Aside from './Aside';
import {StarModal} from './StarModal';
import '../styles/App.css';
import { assert } from '../helpers/util';
import {buildExprMap, buildPobLemmasMap} from "../helpers/network";
import TransformerMenu from "./DumbReplaceModal";
import Modal from 'react-modal';
import { inOutExample, ITreeNode, IExprItem, IExprMap, ITree } from '../helpers/datatypes';
const _ = require("lodash");

type Props = {
    expName: string,
};

type State = {
    expName: string,
    state: "loaded" | "loaded iterative" | "waiting" | "layouting" | "error",
    tree: ITree,
    runCmd: string,
    messageQ: {string: string[]},
    nodeSelection: number[],
    currentTime: number,
    layout: string,
    expr_layout: "SMT" | "JSON",
    PobLemmasMap: {},
    ExprMap: IExprMap,
    multiselect: boolean,
    varNames: string,
    starModalIsOpen: boolean,
    solvingCompleted: boolean,
    dumbReplaceMap: {[source: string]: string},
    inputOutputExamples: inOutExample[],
}

class App extends Component<Props, State> {

    state: State = {
        expName: this.props.expName,
        state: "waiting",
        tree: {} as ITree,
        runCmd: "Run command:",
        messageQ: {} as {string: string[]},
        nodeSelection: [],
        currentTime: 0,
        layout: "PobVis",
        expr_layout: "SMT",
        PobLemmasMap: {},
        ExprMap: {} as IExprMap,
        multiselect: false,
        varNames: "",
        starModalIsOpen: false,
        solvingCompleted: false,
        dumbReplaceMap: {} as {string: string},
        inputOutputExamples: []
    };

    async componentDidMount() {
        await this.poke();
    }

    pushToMessageQ(channel: string, msg: string){
        let current_messageQ = _.cloneDeep(this.state.messageQ);
        if(channel in current_messageQ){
            current_messageQ[channel].push(msg);
        }else{
            current_messageQ[channel] = [msg];
        }
        this.setState({messageQ: current_messageQ});
    }



    async poke() {
        this.pushToMessageQ("App", "Poking Spacer...");
        this.setState({
            state: "waiting",
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
            let ExprMap:IExprMap;
            if (Object.keys(json.expr_map).length === 0) {
                ExprMap = buildExprMap(tree, json.var_names);
            }
            else {
                ExprMap = json.expr_map;
            }

            this.setState({
                tree: tree,
                runCmd: json.run_cmd,
                state: state,
                PobLemmasMap: PobLemmasMap,
                ExprMap: ExprMap,
                varNames: json.var_names,
                solvingCompleted: !(json.spacer_state === "running")
            });
            console.log("state is set")
            this.pushToMessageQ("SpacerStatus", json.spacer_state);
            this.pushToMessageQ("App", "Poking is done");
        } catch (error) {
            if (error.name === "SatVisAssertionError") {
                throw error;
            }
            this.setState({
                state: "error",
                solvingCompleted: false,
            });
            this.pushToMessageQ("App", `Error: ${error["message"]}`);
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
            var newReplaceMapJSON: {[source: string]: string};
            newReplaceMapJSON = JSON.parse(newReplaceMap);

            var newExprMap = _.cloneDeep(this.state.ExprMap);
            for(let key in newExprMap) {
                for (const source of Object.keys(newReplaceMapJSON)){
                    const target:string = newReplaceMapJSON[source];
                    newExprMap[key].editedReadable = newExprMap[key].editedReadable.replaceAll(source,
                                                                                               target);
                }
            }

            this.setState({dumbReplaceMap: newReplaceMapJSON, ExprMap: newExprMap});
        }catch(error){
            this.pushToMessageQ("App", `Error in applyDumbReplaceMap: ${error["message"]}`);
        }
    }
    updateExprMap(newExprMap: IExprMap){
        console.log("newExprMap", newExprMap);
        try{
            this.setState({ExprMap: newExprMap});
        }catch(error){
            this.pushToMessageQ("App", `Error in updateExprMap: ${error["message"]}`);
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
        this.pushToMessageQ("App", "Example added to inputOutputExamples");
    }

    render() {

        const hL = Object.keys(this.state.tree).length;
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
                        onPushToMessageQ={this.pushToMessageQ.bind(this)}
                    />
                </Modal>
                <Main
                    appState = {this.state.state}
                    messageQ = {this.state.messageQ}
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
                    onPushToMessageQ={this.pushToMessageQ.bind(this)}
                />
                <TransformerMenu
                    dumbReplaceMap ={this.state.dumbReplaceMap}
                    onApplyDumbReplaceMap={this.applyDumbReplaceMap.bind(this)}
                    expName={this.props.expName}
                    ExprMap ={this.state.ExprMap}
                    onUpdateExprMap={this.updateExprMap.bind(this)}
                    inputOutputExamples={this.state.inputOutputExamples}
                    onSaveExprMap={this.saveExprMap.bind(this)}
                    onPushToMessageQ={this.pushToMessageQ.bind(this)}
                />
                <Aside
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
                    onPushToMessageQ={this.pushToMessageQ.bind(this)}
                />
                </div>
        );

    }

}

export default App;
