import * as React from 'react';
import '../styles/Menu.css';
import * as Monaco from 'monaco-editor'
import ExpTable from './ExpTable';
import { assert } from '../model/util';
import MenuOptions from "./MenuOptions";
import {UploadSpacerLogModal} from "./UploadSpacerLogModal";
import Modal from 'react-modal';
import { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router-dom';

const icons = require('../resources/icons/all.svg') as string;


type State = {
    uploadModalIsOpen: boolean,
    problem: string,
    problemName: string,
    spacerUserOptions: string,
    varNames: string,
    messagesQ: string[],
    newProblemUploaded: boolean
}

class Menu extends React.Component<{} & RouteComponentProps<{}>, State>{
    state = {
        uploadModalIsOpen: false,
        problem: "",
        problemName: "",
        spacerUserOptions: "",
        varNames: "",
        messagesQ: [],
        newProblemUploaded: false
    }
    // private isChromeOrFirefox = navigator.userAgent.indexOf('Chrome') > -1 || navigator.userAgent.indexOf('Firefox') > -1;
    private isChromeOrFirefox = true;
    private fileUpload = React.createRef<HTMLInputElement>();
    monacoDiv = React.createRef<HTMLDivElement>();
    monaco: Monaco.editor.IStandaloneCodeEditor | null = null

    componentDidMount() {
        if (!this.isChromeOrFirefox) {
            return;
        }
        // generate instance of Monaco Editor
        this.monaco = Monaco.editor.create(this.monacoDiv.current!, {
            lineNumbers: 'off',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            scrollBeyondLastColumn: 0,
            minimap: {
                enabled: false
            },
            renderLineHighlight: 'none',
            hideCursorInOverviewRuler: true,
            links: false,
            overviewRulerBorder: false,
            automaticLayout: true,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
            wordWrap: 'wordWrapColumn'
            // fontFamily: "Monaco" TODO: decide which font to use. By default, multiple fonts are loaded, which is quite slow
        });
        this.monaco.setValue(this.state.problem);
        this.monaco.getModel()!.onDidChangeContent(() => {
            this.changeProblem(this.monaco!.getModel()!.getValue());
        });
    }

    componentWillUnmount(){
        this.monaco = null;
    }


    componentDidUpdate(prevState: State) {
        assert(this.isChromeOrFirefox);
        if (this.state.newProblemUploaded) {
            this.monaco!.setValue(this.state.problem);
            this.setState({newProblemUploaded: false});
        }
    }
    openUploadModal(){
        this.setState({uploadModalIsOpen: true});
    }

    closeUploadModal(){
        this.setState({uploadModalIsOpen: false});
    }

    async runSpacer() {
        const fetchedJSON = await fetch('http://localhost:5000/spacer/start_iterative', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                expName: this.state.problemName,
                file: this.state.problem,
                spacerUserOptions: this.state.spacerUserOptions,
                varNames: this.state.varNames
            })
        });

        try {
            const json = await fetchedJSON.json();
            console.log("backend response:", json);
            if (json.status === "success") {
                //Redirect when success
                const newPath = "/replay/"+json.exp_name;
                console.log("redirect to ", newPath)
                console.log(this.props.history);
                this.props.history.push(newPath);
            } else {
                assert(json.status === "error");
                const errorMess = json.message;
                assert(errorMess !== undefined && errorMess !== null);
                this.setState({
                    messagesQ: [errorMess],
                });
            }
        } catch (error) {
            if (error.name === "SatVisAssertionError") {
                throw error;
            }
            this.setState({
                messagesQ: [`Error: ${error["message"]}`],
            });
        }
    }


    render() {
        if (!this.isChromeOrFirefox) {
            return (
                <section className="unsupported-message">
                    <svg viewBox="0 0 24 24" className="icon">
                        <use xlinkHref={`${icons}#alert-triangle`}/>
                    </svg>
                    <span>Your current browser is not supported. Please use Chrome or Firefox!</span>
                </section>
            );
        }

        return (
            <section className="component-menu">
                <h1>Spacer Visualization</h1>
                <Modal
                    isOpen={this.state.uploadModalIsOpen}
                    onRequestClose={this.closeUploadModal.bind(this)}
                    className ="upload-modal"
                    overlayClassName ="upload-modal-overlay"
                >
                    <button onClick={this.closeUploadModal.bind(this)}>Close</button>
                    <UploadSpacerLogModal/>
                </Modal>
                <section className="editor">
                    <div className="editor-spacer">
                        <main>
                            <div className="headline-wrapper">
                                <h2>Input</h2>
                                <small className="file-name">{this.state.problemName}</small>

                                <button title="Upload Spacer log " onClick={this.openUploadModal.bind(this)}>
                                    <svg viewBox="0 0 24 24" className="icon big">
                                        <use xlinkHref={`${icons}#graph-s`}/>
                                    </svg>
                                </button>
                                <button title="Pick a new file" onClick={this.chooseFile.bind(this)}>
                                    <svg viewBox="0 0 24 24" className="icon big">
                                        <use xlinkHref={`${icons}#graph-upload`}/>
                                    </svg>
                                </button>
                            </div>

                            <input
                                ref={this.fileUpload}
                                type="file"
                                onChange={this.uploadEncoding.bind(this)}
                            />
                            <div ref={this.monacoDiv} className="monaco"></div>
                        </main>

                        <aside>
                            <MenuOptions 
                                spacerUserOptions = {this.state.spacerUserOptions}
                                onChangeVariables = {this.changeVariables.bind(this)}
                                changeSpacerUserOptions={this.changeSpacerUserOptions.bind(this)}
                            />
                            <ExpTable/>
                        </aside>
                    </div>
                </section>

                <section className="run-menu">
                    <button onClick={this.runSpacer.bind(this)}>Hit and Run</button>
                </section>
            </section>
        );
    }

    chooseFile() {
        if (this.fileUpload.current) {
            this.fileUpload.current.click();
        }
    }
    changeProblem(problem: string) {
        this.setState({problem: problem});
    }
    changeProblemName(problemName: string) {
        this.setState({problemName: problemName});
    }
    changeSpacerUserOptions(spacerUserOptions: string) {
        this.setState({spacerUserOptions: spacerUserOptions});
    }
    changeVariables(e){
        this.setState({
            varNames: e.target.value
        });
    }

    uploadEncoding(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files !== null && event.target.files.length > 0) {
            const file = event.target.files[0];

            const reader = new FileReader();
            // callback which will be executed when readAsText is called
            reader.onloadend = () => {
                const text = (reader.result ? reader.result : '') as string;
                this.changeProblem(text);
                this.changeProblemName(file.name);
                this.setState({newProblemUploaded: true});
            };
            reader.readAsText(file);
        }
    }
}
export default withRouter(Menu);
