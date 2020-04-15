import * as React from 'react';
import TimeChart from "./TimeChart";

class TimeZoom extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
    }
    
    render() {
        return (
            <div>
                {this.props.data.map((instance, key) => {
                    return (
                        <TimeChart
                            key={key}
                            data={instance}
                            height={200}
                            width={200}
                            className={"timezoom" + key}
                            type={"timezoom"}
                            index={instance["index"]}
                        />
                    );
                })}
                
            </div>
        );
    }
}

export default TimeZoom;