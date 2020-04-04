import * as React from 'react';
import * as d3 from 'd3';
import TimeChart from "./TimeChart";

class TimeZoom extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
    }
    componentDidMount() {
    }
    
    render() {
        return (
            <div>
                {this.props.data.map((instance, key) => {
                    console.log(instance);
                    return (
                        <TimeChart
                            key={key}
                            data={instance}
                            height={200}
                            width={200}
                            className={"timezoom" + key}
                            type={"timezoom"}
                        />
                    );
                })}
                
            </div>
        );
    }
}

export default TimeZoom;