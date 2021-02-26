import * as React from 'react';

import '../styles/NodeMenu.css';
import NodeDetails from './NodeDetails';
import ExprMapSelector from "./ExprMapSelector";
const icons = require('../resources/icons/all.svg') as string;

type Props = {
    messages_q: string[],
    tree: any | null,
    nodeSelection: number[],
    onUpdateNodeSelection: (selection: number[]) => void,
    onPoke: () => void,
    onOpenStarModal: () => void,
    SatVisLayout: () => void,
    PobVisLayout: () => void,
    MultiSelectMode: () => void,
    SMTLayout: () => void,
    JSONLayout:() => void,
    PobLemmasMap: {},
    ExprMap: {},
    layout: string,
    expr_layout: "SMT"|"JSON",
    saveExprs: () => void,
    expName: string,
    solvingCompleted: boolean
};

type State = {
    relatedExprMap: any
}

class Aside extends React.Component<Props, State> {
    constructor(props: Props){
        super(props);
        this.state = {
            relatedExprMap: []
        }
    }

    createButton(title, onClick, svg) {
        return <button
                   title={title}
                   onClick = { onClick }
               >
            <svg viewBox="0 0 24 24" className = "icon big" >
                <use xlinkHref={ `${icons}#${svg}` } />
            </svg>
        </button>;
    }
    getNodeDetails() {
        if (this.props.nodeSelection.length >= 1  && this.props.tree != null) {
            let nodes: any[] = [];
            for (let node of this.props.nodeSelection){
                nodes.push(this.props.tree[node]);
            }
            return <NodeDetails
                       nodes={nodes}
                       expName={this.props.expName}
                       PobLemmasMap = { this.props.PobLemmasMap }
                       ExprMap = { this.props.ExprMap }
                       layout = { this.props.layout }
                       expr_layout ={this.props.expr_layout}
                       saveExprs = {this.props.saveExprs}
                       relatedExprMap = {this.state.relatedExprMap}
                       solvingCompleted = {this.props.solvingCompleted}
            />;
        } else {
            return <section className={ 'component-node-details overview' }>
                <small id="nodeInfo" > <strong>{`${this.props.nodeSelection.length} nodes`
                } </strong> selected</small >
            </section>
        }
        
    }
    
    updateRelatedExprMap(exprMap) {
        this.setState({
            relatedExprMap: exprMap 
        });
    }

    render() {
        return(
            <aside>
                <article>
                    {this.props.messages_q.map((mess, key) => (
                        <section  key={key} className="component-node-menu">{mess}</section>
                    ))}
                    <section className="component-node-menu" >
                        { this.createButton("Poke", this.props.onPoke, "graph-undo") }
                        { this.createButton("Star", this.props.onOpenStarModal, "star") }
                        { this.createButton("SatVis", this.props.SatVisLayout, "node-parents") }
                        { this.createButton("PobVis", this.props.PobVisLayout, "node-children") }
                        { this.createButton("MultiSelect", this.props.MultiSelectMode, "history-forward") }
                        {/* NHAM: Seems like new pyparser broke my ast to json parser in the backend. */}
                        <button
                            title = "SMT"
                            onClick = { this.props.SMTLayout }
                        >
                            <svg viewBox="0 0 30 30" className = "icon big" >
                                <text x="50%" alignmentBaseline="middle" textAnchor="middle" y="50%" dominantBaseline="middle" fontWeight="light" stroke="none" fill="black" fontFamily="monospace">Raw</text>
                            </svg>
                        </button>
                        <button
                            title = "JSON"
                            onClick = { this.props.JSONLayout }
                        >
                            <svg viewBox="0 0 35 35" className = "icon big" >
                                <text x="50%" alignmentBaseline="middle" textAnchor="middle" y="50%" dominantBaseline="middle" fontWeight="light" stroke="none" fill="black" fontFamily="monospace">Sort</text>
                            </svg>
                        </button>
                    </section>
                </article>
                { this.getNodeDetails() }
                {/* <ExprMapSelector
                    expName = {this.props.expName}
                    updateRelatedExprMap = {this.updateRelatedExprMap.bind(this)}
                    /> */}
            </aside>
        );
    }

}
export default Aside; 
