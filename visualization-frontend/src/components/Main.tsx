import * as React from 'react';

import { Dag } from '../model/dag';
import Slider from './Slider';
import Graph from './Graph';
import ReactModal from 'react-modal';
ReactModal.setAppElement('#root');

type Props = {
    tree: any,
    onNodeSelectionChange: (selection: number[]) => void,
    nodeSelection: number[],
    historyLength: number,
    currentTime: number,
    onCurrentTimeChange: (newState: number) => void,
    layout: string,
    PobLemmasMap: any,
};
export default class Main extends React.Component<Props, {}> {

    // TODO: remove this, after supporting button clicks in Aside while the modal is active
    componentDidMount() {
    }

    render() {
        let modal;
        // if (this.props.passiveDag !== null) {
        //     modal =
        //         <ReactModal
        //     isOpen={ this.props.passiveDag !== null }
        //     contentLabel = {`Clauses currently in Passive generated by clause with id ${this.props.passiveDag!.activeNodeId!}`
        //                    }
        //     onRequestClose = {() => {
        //         this.props.onDismissPassiveDag(false);
        //     }
        //                      }
        //         >
        //         <Graph
        //     dag={ this.props.passiveDag }
        //     nodeSelection = { this.props.nodeSelection }
        //     changedNodesEvent = { this.props.changedNodesEvent }
        //     currentTime = { this.props.currentTime }
        //     onNodeSelectionChange = { this.props.onNodeSelectionChange }
        //     onUpdateNodePositions = { this.props.onUpdateNodePositions }
        //         />
        //         </ReactModal>  
        // }

        return (
                <main>
                <Graph
            tree= { this.props.tree }
            onNodeSelectionChange={this.props.onNodeSelectionChange}
            nodeSelection={this.props.nodeSelection}
            currentTime = {this.props.currentTime}
            layout = {this.props.layout}
            PobLemmasMap = {this.props.PobLemmasMap}
                />
                <Slider
            historyLength={this.props.historyLength}
            currentTime={this.props.currentTime}
            onCurrentTimeChange={this.props.onCurrentTimeChange}
            enabled={true}
                />
                </main>
        );
    }

}
