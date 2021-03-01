// @ts-nocheck
import * as React from 'react';

type Props = {
    rawData: {name: string, id: string, content: string}[],
    updateData: (newValue: {name:string, id:string, content:string}) => void
}

type State = {
    rawData: [],
    file: File | null
}

class DashboardLanding extends React.Component<Props, State> {
    private fileReader: FileReader | undefined;
    constructor(props) {
        super(props);
        this.state = {
            rawData: [],
            file: null
        }
    }
    
    handleFileRead(file: File) {
        const content = this.fileReader!.result!.toString();
        let returnObject = {
            name: file.name,
            id: Date.now().toString(),
            content: content!
        };
        
        this.props.updateData(returnObject);
    }
    
    handleFileChosen(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        let file = this.state.file;
        this.fileReader = new FileReader();
        this.fileReader.onloadend = this.handleFileRead.bind(this, file!);
        this.fileReader.readAsText(file!);
    }
    
    updateFile(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            file: e.target.files![0]
        });
    }
    
    render() {
        return (
            <div className="dashboard-menu">
                <h1>Spacer Dashboard</h1>
                <form>
                <input type="file" accept=".csv" onChange={this.updateFile.bind(this)}/>
                <button type="submit" className="fake-button" onClick={this.handleFileChosen.bind(this)}>Upload</button>
                </form>
                <div className="file-list">
                    <h2>Uploaded Files</h2>
                    {this.props.rawData.length > 0 && this.props.rawData.map((dataItem, key) => (
                        <li key={key}>
                            <span>{dataItem.name}</span><a href={"#/dashboard/" + dataItem.id}>Analysis</a>
                        </li>
                    ))}
                </div>
            </div>
        );
    }
}

export default DashboardLanding;
