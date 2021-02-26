import * as React from 'react';

import Slider from './Slider';
import Graph from './Graph';
import ReactModal from 'react-modal';
ReactModal.setAppElement('#root');

type Props = {
    tree: any,
    runCmd: string,
    onNodeSelectionChange: (selection: number[]) => void,
    nodeSelection: number[],
    historyLength: number,
    currentTime: number,
    onCurrentTimeChange: (newState: number) => void,
    layout: string,
    PobLemmasMap: any,
    solvingCompleted: boolean

};
export default class Main extends React.Component<Props, {}> {
    render() {
        return (
            <main>
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
