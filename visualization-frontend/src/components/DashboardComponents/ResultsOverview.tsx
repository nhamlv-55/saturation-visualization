import * as React from 'react';
import * as d3 from 'd3';

class ResultsOverview extends React.Component<any, any> {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.createResultsOverview();
    }

    createResultsOverview() {
        let data = this.props.data;
        
        let results = d3.map(data, function(d) {return d.result;}).keys();
        
        let colour = d3.scaleOrdinal()
            .domain(results)
            .range(d3.schemeCategory10);
        
        let xValue = function(d) {
            return d.index;
        };
        let index = d3.map(data,function(d) {return d.index;}).keys();
        let xScale = d3.scaleBand()
            .domain(index)
            .range([this.props.config.margin.left, this.props.config.width - this.props.config.margin.right]);

        let xMap = function(d) {
            return xScale(xValue(d))
        };

        let xAxis = d3.axisBottom(xScale).tickValues([]);

        let yValue = function(d) {
            return d.SPACER_num_invariants;
        };
        let yScale = d3.scaleLinear()
            .domain([d3.min(data, yValue), d3.max(data, yValue)])
            .range([this.props.config.graphHeight - this.props.config.margin.top, this.props.config.margin.bottom]);

        let yMap = function(d) {
            return yScale(yValue(d))
        };

        let yAxis = d3.axisLeft(yScale);

        let svg = d3.select(".results-overview")
            .append("svg")
            .attr("width", this.props.config.width)
            .attr("height", this.props.config.height);
        svg.append("text")
            .attr("x", this.props.config.width / 2)
            .attr("y", this.props.config.margin.top)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("text-decoration", "underline")
            .text("Index x Result x Num of Invariants");
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + (this.props.config.graphHeight - this.props.config.margin.top) + ")")
            .call(xAxis);
        svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(" + this.props.config.margin.left + ",0)")
            .style("font-size", "20px")
            .call(yAxis);
        let g = svg.append("g");
        g.selectAll(".dot")
            .data(data)
            .enter()
            .append('circle')
            .attr('r', 10)
            .attr('cx', function(d) {return xMap(d) + xScale.bandwidth() /2})
            .attr('cy', yMap)
            .on("mouseenter", function(d) {
                d3.select(".overview-tooltip")
                    .append("text")
                    .text(d.index);
            })
            .on("mouseout", function(d) {
                d3.select(".overview-tooltip")
                    .select("text")
                    .remove();
            })
            .on("click", this.props.selectBenchmark)
            .style("fill", function(d) {return colour(d.result)});
        g.selectAll(".result-text")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "label")
            .style("font-size", "18px")
            .attr("x", function(d) {return xMap(d) + (xScale.bandwidth() / 4)})
            .attr("y", function(d) {return yMap(d) - 25})
            .attr("dy", ".75em")
            .on("mouseenter", function(d) {
                d3.select(".overview-tooltip")
                    .append("text")
                    .text(d.index);
            })
            .on("mouseout", function(d) {
                d3.select(".overview-tooltip")
                    .select("text")
                    .remove();
            })
            .text(function(d) {return d.SPACER_num_invariants});
        g.selectAll("legendDots")
            .data(results)
            .enter()
            .append("circle")
            .attr("cx", function(this,d,i) {return this.props.config.margin.left + i*100}.bind(this))
            .attr("cy", this.props.config.graphHeight + 15)
            .attr("r", 5)
            .style("fill", function(d){return colour(d)});
        g.selectAll("legendText")
            .data(results)
            .enter()
            .append("text")
            .attr("x", function(this,d,i){return this.props.config.margin.left + 10 + i*100}.bind(this))
            .attr("y", this.props.config.graphHeight + 20)
            .text(function(d){return d})



    }

    render() {
        this.createResultsOverview();
        return (
            <div className="results-overview">

            </div>

        );
    }
}

export default ResultsOverview
