import * as React from 'react';
import { Component } from 'react';

import Main from './Main';
import Aside from './Aside';
import { Dag, ParsedLine } from '../model/dag';
import SatNode from '../model/sat-node';
import './App.css';
import { assert } from '../model/util';
import { filterNonParents, filterNonConsequences, mergePreprocessing, passiveDagForSelection } from '../model/transformations';
import { findCommonConsequences } from '../model/find-node';
import { VizWrapper } from '../model/viz-wrapper';
import { Clause } from '../model/unit';
import { Literal } from '../model/literal';
import { computeClauseRepresentation, computeParentLiterals } from '../model/clause-orientation';

type Props = {
    problem: string,
    spacerUserOptions: string,
    mode: "proof" | "saturation" | "manualcs"
    hideBracketsAssoc: boolean,
    nonStrictForNegatedStrictInequalities: boolean,
    orientClauses: boolean,
};

/* Invariant: the state is always in one of the following phases
 *    "loaded": A dag is loaded. Clause selection is not possible. dags, nodeSelection and currentTime hold meaningful values.
 *    "loaded selected": Same as "loaded", but clause selection is possible.
 *    "waiting": Waiting for answer from Vampire server. message holds a meaningful value.
 *    "layouting": Layouting a dag. message holds a meaningful value.
 *    "error": Some error occured. message holds a meaningful value.
 */
type State = {
    state: "loaded" | "loaded select" | "waiting" | "layouting" | "error",
    trees: any[],
    message: string,
    nodeSelection: number[],
    currentTime: number,
}

class App extends Component<Props, State> {

    state: State = {
        state: "waiting",
        trees: [],
        message: "",
        nodeSelection: [],
        currentTime: 0,
    }

    render() {
        const {
            state,
            trees,
            message,
            nodeSelection,
            currentTime
        } = this.state;
        let tree;
        let main;
        if (state === "loaded" || state === "loaded select") {
            assert(trees.length > 0);
            tree = trees[trees.length - 1];
            main = (
                    <Main
                tree = {tree}
                onNodeSelectionChange={this.updateNodeSelection.bind(this)}
                nodeSelection={nodeSelection}
                historyLength={tree.length}
                currentTime={currentTime}
                onCurrentTimeChange={this.updateCurrentTime.bind(this)}
                    />
            );
        } else {
            main = (
                    <main>
                    <section className="slider-placeholder"/>
                    </main>
            );
        }

        return (
                <div className= "app" >
                { main }

                <Aside
            tree={tree}
            nodeSelection={nodeSelection}
            onUpdateNodeSelection={this.updateNodeSelection.bind(this)}
                /> 
                </div>
        );

    }

    async componentDidMount() {

        // call Vampire on given input problem
        await this.runVampire(this.props.problem, this.props.spacerUserOptions, this.props.mode);

    }


    async runVampire(problem: string, spacerUserOptions: string, mode: "proof" | "saturation" | "manualcs") {
        this.setState({
            state: "waiting",
            message: "Waiting for Vampire...",
        });

        const fetchedJSON = await fetch(mode === "manualcs" ? 'http://localhost:5000/spacer/startmanualcs' : 'http://localhost:5000/spacer/start', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                file: problem,
                spacerUserOptions: spacerUserOptions
            })
        });

        try {
            const json = await fetchedJSON.json();
            console.log("backend response:", json)
            if (json.status === "success") {
                //after this function, all nodes will have additional x,y information
                // await VizWrapper.layoutDag(dag, true);
                let tree = json.nodes_list
                const state = (mode == "manualcs" && json.spacerState === "running") ? "loaded select" : "loaded";
                this.setState({
                    trees: [tree],
                    message: "blah",
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


    //NETWORK///////////////////////////////

    updateNodeSelection(nodeSelection: number[]) {
        this.setState({nodeSelection: nodeSelection});
    }


    updateCurrentTime(currentTime: number) {
        const trees = this.state.trees
        assert(trees.length > 0);
        const tree = trees[trees.length - 1];

        // const nodesInActiveDag = dag.computeNodesInActiveDag(currentTime);
        // const nodeSelection = new Array<number>();
        // for (const nodeId of this.state.nodeSelection) {
        //     if (nodesInActiveDag.has(nodeId)) {
        //         nodeSelection.push(nodeId);
        //     }
        // }
        this.setState({
            // nodeSelection: nodeSelection,
            currentTime: currentTime
        });
    }
   
}

export default App;
