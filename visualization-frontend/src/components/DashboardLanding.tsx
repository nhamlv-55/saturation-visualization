import * as React from 'react';

class DashboardLanding extends React.Component<any, any> {
    private fileReader: any;
    constructor(props) {
        super(props);
        this.state = {
            rawData: [],
            file: null
        }
    }
    
    handleFileRead(file) {
        const content = this.fileReader.result;
        let returnObject = {
            name: file.name,
            id: Date.now().toString(),
            content: content
        };
        
        this.props.updateData(returnObject);
    }
    
    handleFileChosen(e) {
        let file = this.state.file;
        this.fileReader = new FileReader();
        this.fileReader.onloadend = this.handleFileRead.bind(this, file);
        this.fileReader.readAsText(file);
    }
    
    updateFile(e) {
        this.setState({
            file: e.target.files[0]
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
