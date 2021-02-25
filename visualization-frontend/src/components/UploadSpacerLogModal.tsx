import * as React from 'react';
import {ChangeEvent} from "react";
const icons = require('../resources/icons/all.svg') as string;


type Props = {
}
type State = {
    inputProblem: string,
    spacerLog: string,
    expName: string
}
export class UploadSpacerLogModal extends React.Component<Props, State> {
    private runCmd = "";
    state = {
        inputProblem: "",
        spacerLog: "",
        expName: ""
    }

    handleExpNameChange(e: ChangeEvent<HTMLInputElement>) {
        this.setState({
            expName: e.target.value
        })
    }

    uploadInputFile(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files !== null && event.target.files.length > 0) {
            const file = event.target.files[0];

            const reader = new FileReader();
            // callback which will be executed when readAsText is called
            reader.onloadend = () => {
                const text = (reader.result ? reader.result : '') as string;
                this.setState({inputProblem: text});

            };
            reader.readAsText(file);
        }
    }

    uploadSpacerLog(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files !== null && event.target.files.length > 0) {
            const file = event.target.files[0];

            const reader = new FileReader();
            // callback which will be executed when readAsText is called
            reader.onloadend = () => {
                const text = (reader.result ? reader.result : '') as string;
                this.setState({spacerLog: text});

            };
            reader.readAsText(file);
        }
    }

    async uploadFiles(){
        const fetchedJSON = await fetch("http://localhost:5000/spacer/upload_files", {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                expName: this.state.expName,
                inputProblem: this.state.inputProblem,
                spacerLog: this.state.spacerLog,
                spacerState: "uploaded"
            })
        })

        try{
            const json = await fetchedJSON.json();
            console.log("backend response:", json);
            window.location.reload(false);
        }catch(error){
            console.log(error);
        }

    }



    render() {
        return (
            <section className="upload-log-wrapper">

                <label>Upload smt2 file</label>
                <input
                    type="file"
                    onChange={this.uploadInputFile.bind(this)}
                />
                <br/>
                <label>Upload spacer.log</label>
                <input
                    type="file"
                    onChange={this.uploadSpacerLog.bind(this)}
                />
                <br/>
                <label>Exp Name:</label>
                <input type="text" onChange={this.handleExpNameChange.bind(this)}/>
                <button onClick={this.uploadFiles.bind(this)}>Submit</button>
            </section>

        );
    }
}

