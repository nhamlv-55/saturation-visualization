import * as React from 'react';
import { HashRouter, Route} from "react-router-dom";
import App from './App';
import Menu from './Menu';
import { RouteComponentProps } from 'react-router';
import Dashboard from "./Dashboard";
import DashboardLanding from "./DashboardLanding";
import { EditorPage } from "./EditorPage";
import '../styles/AppWrapper.css';
type State = {
    rawData: {name: string, id: string, content: string}[]
}

export class AppRouter extends React.Component<{} & RouteComponentProps<{}>, State> {
    state: State = {
        rawData: []
    };

    render() {
        return (
            <HashRouter>
                <Route path="/" exact render={() => 
                    <Menu />
                }/>
                <Route path="/replay/:exp_id" render={({match}) => 
                    this.appComponent(match.params.exp_id)
                }/>
                <Route exact path="/dashboard/" render={() =>
                    <DashboardLanding 
                        rawData={this.state.rawData}
                        updateData={this.changeRawData.bind(this)}
                    />
                }/>
                <Route path="/dashboard/:fileId" render={({match}) => 
                    this.displayVisualization(match.params.fileId)
                }/>
                <Route exact path="/editor/" render={() =>
                    <EditorPage
                        name=""
                        input=""
                    />
                }/>
            </HashRouter>
        );
    }

    appComponent(exp_path: string) {
        return (
            <div id="appWrapper">
            <App 
            exp_path = {exp_path}
            />
        </div>
        )
    }
    
    displayVisualization(fileId: string) {
        let rawData = this.state.rawData.filter(x => x.id === fileId)[0];
        if (rawData) {
            return (
                <Dashboard
                    rawData={rawData.content}
                />
            );
        }
    }
    
    changeRawData(newValue: {name:string, id:string, content:string}){
        let currentList = this.state.rawData;
        let newList = currentList.concat([newValue]);
        this.setState({
            rawData: newList
        });
    }
}
