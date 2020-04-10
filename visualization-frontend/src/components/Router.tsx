import * as React from 'react';
import { HashRouter, Route} from "react-router-dom";
import { AppWrapper } from './AppWrapper'
import { Menu } from './Menu';
import { RouteComponentProps } from 'react-router';
import Dashboard from "./Dashboard";
import DashboardLanding from "./DashboardLanding";
type State = {
    problem: string,
    problemName: string,
    spacerUserOptions: string,
    hideBracketsAssoc: boolean,
    nonStrictForNegatedStrictInequalities: boolean,
    orientClauses: boolean
    varNames: string
    rawData: Object[]
}

export class AppRouter extends React.Component<{} & RouteComponentProps<{}>, State> {

    state: State = {
        problem: "",
        problemName: "",
        spacerUserOptions: "",
        hideBracketsAssoc: true,
        nonStrictForNegatedStrictInequalities: true,
        orientClauses: true,
        varNames: "",
        rawData: []
    };

    render() {
        return (
            <HashRouter>
                <Route path="/" exact render={() => 
                    <Menu 
                        problem={this.state.problem}
                                problemName={this.state.problemName}
                                spacerUserOptions={this.state.spacerUserOptions}
                                hideBracketsAssoc={this.state.hideBracketsAssoc}
                                nonStrictForNegatedStrictInequalities={this.state.nonStrictForNegatedStrictInequalities}
                                orientClauses={this.state.orientClauses}
                                onChangeProblem={this.changeProblem.bind(this)}
                                onChangeProblemName={this.changeProblemName.bind(this)}
                                onChangeSpacerUserOptions={this.changeSpacerUserOptions.bind(this)}
                                onChangeHideBracketsAssoc={this.changeHideBracketsAssoc.bind(this)}
                                onChangeNonStrictForNegatedStrictInequalities={this.changeNonStrictForNegatedStrictInequalities.bind(this)}
                                onChangeOrientClauses={this.changeOrientClauses.bind(this)}
                                onChangeVariables={this.changeVariables.bind(this)}
                    />
                }/>
                <Route path="/replay/:exp_id" render={({match}) => 
                    this.appComponent("replay", match.params.exp_id)
                }/>
                <Route path="/iterative/" render={() => 
                    this.appComponent("iterative", "")
                }/>
                <Route exact path="/dashboard/" render={() =>
                    <Dashboard />
                }/>
                <Route exact path="/dashboard/test" render={() =>
                    <DashboardLanding 
                        updateData={this.changeRawData.bind(this)}
                    />
                }/>
            </HashRouter>
        );
    }

    appComponent(mode: "replay" | "iterative", exp_path: string) {
        const spacerUserOptions = `${this.state.spacerUserOptions}`;
        return <AppWrapper
        name={this.state.problemName}
        exp_path ={exp_path}
        mode={mode}
        problem={this.state.problem!}
        spacerUserOptions={spacerUserOptions}
        hideBracketsAssoc={this.state.hideBracketsAssoc}
        nonStrictForNegatedStrictInequalities={this.state.nonStrictForNegatedStrictInequalities}
        orientClauses={this.state.orientClauses}
        varNames={this.state.varNames}
        />
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
    changeHideBracketsAssoc(newValue: boolean) {
        this.setState({hideBracketsAssoc: newValue});
    }
    changeNonStrictForNegatedStrictInequalities(newValue: boolean) {
        this.setState({nonStrictForNegatedStrictInequalities: newValue});
    }
    changeOrientClauses(newValue: boolean) {
        this.setState({orientClauses: newValue});
    }
    changeVariables(newValue: string){
        this.setState({
            varNames: newValue
        });
    }
    
    changeRawData(newValue: Object){
        let currentList = this.state.rawData;
        let newList = currentList.concat([newValue]);
        this.setState({
            rawData: newList
        });
    }
}
