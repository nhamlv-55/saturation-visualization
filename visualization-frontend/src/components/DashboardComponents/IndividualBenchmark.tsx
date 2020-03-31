import * as React from 'react';
import TimeChart from "./TimeChart";

class IndividualBenchmark extends React.Component<any, any> {
    componentDidMount() {
    }
    
    filterTimeData() {
        return Object.keys(this.props.data)
            .filter(function(d) {return d.includes("time")})
            .reduce((obj, key) => {
                obj[key] = this.props.data[key];
                return obj;
            }, {});
    }
    render() {
        let timeData = this.filterTimeData();
        return (
          <div className="overview">
              <h1>{this.props.data.index}</h1>
              <TimeChart data={timeData}/>
          </div>  
        );
    }
}

export default IndividualBenchmark;