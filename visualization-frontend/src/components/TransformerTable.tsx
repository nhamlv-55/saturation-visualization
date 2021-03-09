import * as React from 'react';
import '../styles/NodeMenu.css';
import {Link} from 'react-router-dom';
import {replaceVarNames, toReadable} from "../helpers/readable";
import { IExprMap } from '../helpers/datatypes';
const _ = require("lodash");
type Props = {
    expName: string,
    ExprMap: IExprMap,
    onUpdateLocalExprMap: (exprMap: IExprMap) => void,
    onPushToMessageQ: (channel: string, msg: string)=>void,
    key: string
};
type State = {
    transformationFlag: boolean,
    transformationErrorFlag: boolean,
    transformationSelected: string,
    isFetching: boolean,
    progs: any[],
}

export default class TransformerTable extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            transformationFlag: false,
            transformationErrorFlag: false,
            transformationSelected: "",
            isFetching: false,
            progs: []
        };
    }


    async componentDidMount() {
        await this.fetchProgs();
    }

    render() {
        return (
            <div>
                <div>
                    <button className="ts-button-half"
                            onClick={this.multiTransformExprs.bind(this, "to_readable")}
                    >To Readable</button>
                    <button className="ts-button-half"
                            onClick={this.toRaw.bind(this)}
                    >To Raw</button>
                </div>
                    {this.state.progs.map((item, index) => (
                        <button className="ts-button"
                                key = {item.hash}
                                onClick={this.multiTransformExprs.bind(this, item.xml_ast)}
                        >
                            {item.human_readable_ast}
                        </button>
                    ))}
                <p>{this.state.isFetching ? 'Fetching transformer...' : ''}</p>
                </div>
        )
    }

    async multiTransformExprs(programs: string) {
        let tmpExprMap = _.cloneDeep(this.props.ExprMap);

        //NHAM: since I dont want to touch prose backend, and Prose expect input in the field "raw",
        //we set the field raw in here to be the same as editedRaw
        for(const key in tmpExprMap){
            tmpExprMap[key].raw = tmpExprMap[key].editedRaw;
        }

        this.setState({
            transformationFlag: false,
            transformationErrorFlag: false
        });
        const response = await fetch("http://localhost:5000/spacer/apply_multi_transformation", {
            method: 'POST',
            mode :'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, body : JSON.stringify({
                expName: this.props.expName,
                selectedProgram: programs,
                lemmas: tmpExprMap
            })
        });

        if (response.status === 200){
            tmpExprMap = null;
            let localExprMap = _.cloneDeep(this.props.ExprMap);
            let responseData = await response.json();
            let tExprMap = responseData["response"];
            console.log("tExprMap", tExprMap);
            Object.keys(tExprMap).forEach((key) => {
                localExprMap[key].editedRaw = tExprMap[key]['raw'];
                //NHAM: editedReadable is set ONLY when the user explictly click on the 'To Readable' button
                if(programs === "to_readable"){
                    localExprMap[key].editedReadable = tExprMap[key]['readable'];
                }else{
                    localExprMap[key].editedReadable = tExprMap[key]['raw'];
                }
            });

            this.setState({
                transformationFlag: true,
            });
            this.props.onUpdateLocalExprMap(localExprMap);
        }
        else {
            this.setState({
                transformationErrorFlag: true
            });
            this.props.onPushToMessageQ("Error", "Failed to apply the transformation. Possibly not supported.");
        }
    }

    async toRaw(){
        //simply overwritting editedReadable with editedRaw
        let localExprMap = _.cloneDeep(this.props.ExprMap);
        Object.keys(localExprMap).forEach((key) => {
            localExprMap[key].editedReadable = localExprMap[key].editedRaw;
        });

        this.props.onUpdateLocalExprMap(localExprMap);
    }



    async fetchProgs() {
        this.setState({
            isFetching: true,
        });

        const fetchedJSON = await fetch('http://localhost:5000/spacer/fetch_progs', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, body : JSON.stringify({
                "expName": this.props.expName
            })
        });

        try {
            const json = await fetchedJSON.json();
            console.log(json)
            this.setState({isFetching: false, progs: json.progs_list})
        } catch (error) {
            if (error.name === "SatVisAssertionError") {
                throw error;
            }
            this.setState({
                progs: []
            });
        }
    }
}
