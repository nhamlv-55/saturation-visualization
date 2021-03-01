import * as React from 'react';

import Slider from './Slider';
import Graph from './Graph';
import ReactModal from 'react-modal';
ReactModal.setAppElement('#root');

type Props = {
    messageQ: {string: string[]},
    tree: any,
    runCmd: string,
    onNodeSelectionChange: (selection: number[]) => void,
    nodeSelection: number[],
    historyLength: number,
    currentTime: number,
    onCurrentTimeChange: (newState: number) => void,
    layout: string,
    PobLemmasMap: any,
    solvingCompleted: boolean,
    onPushToMessageQ: (channel: string, msg: string)=>void,
};
export default class Main extends React.Component<Props, {}> {
    render() {
        return (
            <main>
                <div>{JSON.stringify( this.props.messageQ)}</div>
                    <input type="text" value = {this.props.runCmd} readOnly></input>
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
