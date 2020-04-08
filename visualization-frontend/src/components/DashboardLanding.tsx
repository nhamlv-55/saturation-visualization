import * as React from 'react';

class DashboardLanding extends React.Component<any, any> {
    private fileReader: any;
    constructor(props) {
        super(props);
        
    }
    handleFileRead(file) {
        const content = this.fileReader.result;
        let returnObject = {
            name: file.name,
            content: content
        };
        
        this.props.updateData(returnObject);
    }
    
    handleFileChosen(e) {
        let file = e.target.files[0];
        this.fileReader = new FileReader();
        this.fileReader.onloadend = this.handleFileRead.bind(this, file);
        this.fileReader.readAsText(file);
    }
    
    render() {
        return (
            <div>
                <input type="file" accept=".csv" onChange={this.handleFileChosen.bind(this)}/>
            </div>
        );
    }
}

export default DashboardLanding;
