import * as React from 'react';
import * as d3 from 'd3';

class DepthOverview extends React.Component<any, any> {
    constructor(props) {
        super(props);
    }
    
    componentDidMount() {
        this.createDepthOverview();
    }
    createDepthOverview() {
        d3.selectAll("svg").remove();
        if (this.props.data.length === 0) {
            return;
        }
        let data = this.props.data;
        
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
            return d.depth;
        };
        let yScale = d3.scaleLinear()
            .domain([d3.min(data, yValue), d3.max(data, yValue)])
            .range([this.props.config.graphHeight - this.props.config.margin.top, this.props.config.margin.bottom]);

        let yMap = function(d) {
            return yScale(yValue(d))
        };

        let yAxis = d3.axisLeft(yScale);

        let svg = d3.select(".depth-overview")
            .append("svg")
            .attr("width", this.props.config.width)
            .attr("height", this.props.config.height);
        svg.append("text")
            .attr("x", this.props.config.width / 2)
            .attr("y", this.props.config.margin.top)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("text-decoration", "underline")
            .text("Index x Depth");
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
        g.selectAll(".bar")
            .data(data)
            .enter() 
            .append("rect")
            .attr("class", "bar")
            .attr("x", xMap)
            .attr("y", yMap)
            .attr("width", xScale.bandwidth() - 1)
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
            .attr("height", function(this,d) {return (this.props.config.graphHeight - this.props.config.margin.top - yScale(d.depth))}.bind(this));
        
        g.selectAll(".depth-text")
            .data(data)
            .enter()
            .append("text")
            .style("font-size", "18px")
            .attr("class", "label")
            .attr("x", function(d) {return xMap(d)})
            .attr("y", function(d) {return yMap(d) - 15})
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
            .text(function(d) {return d.depth});
        

    }
    render() {
        console.log(window.innerWidth);
        console.log(window.innerHeight);
        this.createDepthOverview();
        return (
            <div className="depth-overview">
            </div>
            
        );
    }
}

export default DepthOverview