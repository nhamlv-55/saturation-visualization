import * as React from 'react';

import Slider from './Slider';
import Graph from './Graph';
import ReactModal from 'react-modal';
ReactModal.setAppElement('#root');

type Props = {
    appState: "loaded" | "loaded iterative" | "waiting" | "layouting" | "error",
    messageQ: { [channel: string]: string[] },
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
    onPushToMessageQ: (channel: string, msg: string) => void,
};
export default class Main extends React.Component<Props, {}> {
    render() {
        let messageArea: JSX.Element[] = [];
        Object.keys(this.props.messageQ).forEach((key)=>{
            messageArea.push(
                <div className="message-wrapper" key={"message-" + key}>
                    <span>{key}</span>
                    <br/>
                    {this.props.messageQ[key][this.props.messageQ[key].length - 1]}
                </div>)
        })


        return (
            <main>
                <div>{messageArea}</div>
                <input type="text" value={this.props.runCmd} readOnly></input>
                {this.props.appState ==="loaded"?
                <Graph
                    tree={this.props.tree}
                    onNodeSelectionChange={this.props.onNodeSelectionChange}
                    nodeSelection={this.props.nodeSelection}
                    currentTime={this.props.currentTime}
                    layout={this.props.layout}
                    PobLemmasMap={this.props.PobLemmasMap}
                />:""}
                {this.props.appState === "loaded"?
                <Slider
                    historyLength={this.props.historyLength}
                    currentTime={this.props.currentTime}
                    onCurrentTimeChange={this.props.onCurrentTimeChange}
                    enabled={true}
                />
                :""}
            </main>
        );
    }

}
