import * as React from 'react';
import TimeChart from "./TimeChart";
import {timeDetailedItem} from "../dashboardTypes";

type State = {}

type Props = {
    data: timeDetailedItem[]
}

class TimeZoom extends React.Component<Props, State> {
    constructor(props) {
        super(props);
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
                            index={instance["index"]!}
                        />
                    );
                })}
                
            </div>
        );
    }
}

export default TimeZoom;