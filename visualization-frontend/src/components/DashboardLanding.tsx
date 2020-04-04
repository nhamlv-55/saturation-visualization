import * as React from 'react';
import * as d3 from 'd3';
import Dashboard from "./Dashboard";
const icons = require('../resources/icons/all.svg') as string;

class DashboardLanding extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            file: null,
            data: ""
        }
    }
    
    onFormSubmit(e) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = function(this) {
            let text = reader.result;
            this.setState({
                data: text
            });
        }.bind(this);
        reader.readAsText(this.state.file);
    }
    
    onChange(e) {
        this.setState({
            file: e.target.files[0]
        });
    }
    
    filUpload(file) {}
    
    render() {
        console.log(this.state.data);
        return (
            <div>
                {this.state.data === "" && <form onSubmit={this.onFormSubmit.bind(this)}>
                    <h1>File Upload</h1>
                    <input type="file" onChange={this.onChange.bind(this)} />
                    <button type="submit">Submit</button>
                </form>}
                {this.state.data !== "" && <Dashboard data={this.state.data}/>}
            </div>
        );
    }
}

export default DashboardLanding;
