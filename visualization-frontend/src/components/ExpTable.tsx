import * as React from 'react';
import '../styles/ExpTable.css';
import {Link} from 'react-router-dom';

type Props = {
};
type State = {
    isFetching: boolean,
    exps: any[],
}

export default class ExpTable extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isFetching: false,
            exps: []
        };
    }

    async componentDidMount() {
        await this.fetchExps();
        // this.timer = setInterval(() => this.fetchUsers(), 5000);
    }

    render() {
        return (
                <div className="exp-table">
                    {this.state.exps.map((item, index) => (
                        <div className="exp" key = {item.exp_name}>
                            <h5><Link to={{pathname: `/replay/${item.exp_name}`}} >{item.exp_name}</Link></h5>
                            <button onClick={this.deleteExp.bind(this, item.exp_name)}>X</button>
                        </div>
                ))}
                <p>{this.state.isFetching ? 'Fetching experiments...' : ''}</p>
                </div>
        )
    }
    async deleteExp(expName: string) {
        this.setState({
            isFetching: true,
        });

        const fetchedJSON = await fetch('http://localhost:5000/spacer/delete_exp', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, body : JSON.stringify({"expName": expName})
        });

        try {
            const json = await fetchedJSON.json();
            console.log(json)
            this.setState({isFetching: false, exps: json.exps_list})
        } catch (error) {
            if (error.name === "SatVisAssertionError") {
                throw error;
            }
            this.setState({
                exps: []
            });
        }
    }

    async fetchExps() {
        this.setState({
            isFetching: true,
        });

        const fetchedJSON = await fetch('http://localhost:5000/spacer/fetch_exps', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, body : ""
        });

        try {
            const json = await fetchedJSON.json();
            console.log(json)
            this.setState({isFetching: false, exps: json.exps_list})
        } catch (error) {
            if (error.name === "SatVisAssertionError") {
                throw error;
            }
            this.setState({
                exps: []
            });
        }
    }


}
