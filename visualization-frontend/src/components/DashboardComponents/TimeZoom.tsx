import * as React from 'react';
import * as d3 from 'd3';
import TimeChart from "./TimeChart";

class TimeZoom extends React.Component<any, any> {
    filterTimeData() {
        return Object.keys(this.props.data)
            .filter(function(d) {return d.includes("time")})
            .reduce((obj, key) => {
                obj[key] = this.props.data[key];
                return obj;
            }, {});
    }
    
    render() {
        return (
            <div>
                {this.props.data.map((instance, key) => {
                    return (
                        <TimeChart
                        data={this.props.data}
                        />
                    );
                })}
                
            </div>
        );
    }
}

export default TimeZoom;