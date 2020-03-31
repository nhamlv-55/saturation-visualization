import * as React from 'react';
import './../styles/Dashboard.css';
import * as d3 from 'd3';
import IndividualBenchmark from "./DashboardComponents/IndividualBenchmark";
import DepthOverview from "./DashboardComponents/DepthOverview";
import MemoryOverview from "./DashboardComponents/MemoryOverview";
import ResultsOverview from "./DashboardComponents/ResultsOverview";
import TimeOverview from "./DashboardComponents/TimeOverview";
import arrow from './../resources/icons/singles/angle-arrow-down.svg'

class Dashboard extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            data: "",
            selectedBenchmark: "",
            graphMin: 0,
            graphMax: 10
        };
    }
    componentDidMount() {
        this.loadData();
        document.addEventListener("keydown", this.handleGraphTranslation.bind(this));
    }

    loadData() {
        let file = require("./../resources/files/benchmark-summary.csv");
        d3.csv(file, function (d) {
            d.SPACER_cluster_out_of_gas = +d.SPACER_cluster_out_of_gas;
            d.SPACER_expand_pob_undef = +d.SPACER_expand_pob_undef;
            d.SPACER_inductive_level = +d.SPACER_inductive_level;
            d.SPACER_max_cluster_size = +d.SPACER_max_cluster_size;
            d.SPACER_max_cvx_reduced_dim = +d.SPACER_max_cvx_reduced_dim;
            d.depth = +d.depth;
            d.SPACER_max_query_lvl = +d.SPACER_max_query_lvl;
            d.SPACER_need_sage = +d.SPACER_need_sage;
            d.SPACER_num_abstractions = +d.SPACER_num_abstractions;
            d.SPACER_num_abstractions_failed = +d.SPACER_num_abstractions_failed;
            d.SPACER_num_abstractions_success = +d.SPACER_num_abstractions_success;
            d.SPACER_num_active_lemmas = +d.SPACER_num_active_lemmas;
            d.SPACER_num_cant_abstract = +d.SPACER_num_cant_abstract;
            d.SPACER_num_ctp_blocked = +d.SPACER_num_ctp_blocked;
            d.SPACER_num_dim_reduction_success = +d.SPACER_num_dim_reduction_success;
            d.SPACER_num_invariants = +d.SPACER_num_invariants;
            d.SPACER_num_is_invariant = +d.SPACER_num_is_invariant;
            d.SPACER_num_lemma_jumped = +d.SPACER_num_lemma_jumped;
            d.SPACER_num_lemmas = +d.SPACER_num_lemmas;
            d.SPACER_num_mbp_failed = +d.SPACER_num_mbp_failed;
            d.SPACER_num_merge_gen = +d.SPACER_num_merge_gen;
            d.SPACER_num_merge_gen_failed = +d.SPACER_num_merge_gen_failed;
            d.SPACER_num_merge_gen_success = +d.SPACER_num_merge_gen_success;
            d.SPACER_num_no_over_approximate = +d.SPACER_num_no_over_approximate;
            d.SPACER_num_non_lin = +d.SPACER_num_non_lin;
            d.SPACER_num_pobs = +d.SPACER_num_pobs;
            d.SPACER_num_propagations = +d.SPACER_num_propagations;
            d.SPACER_num_queries = +d.SPACER_num_queries;
            d.SPACER_num_reach_queries = +d.SPACER_num_reach_queries;
            d.SPACER_num_refinements = +d.SPACER_num_refinements;
            d.SPACER_num_reuse_reach_facts = +d.SPACER_num_reuse_reach_facts;
            d.SPACER_num_sync_cvx_cls = +d.SPACER_num_sync_cvx_cls;
            d.SPACER_num_under_approximations = +d.SPACER_num_under_approximations;
            d.SPACER_pob_out_of_gas = +d.SPACER_pob_out_of_gas;
            d.SPACER_wide_attmpts = +d.SPACER_wide_attmpts;
            d.SPACER_wide_success = +d.SPACER_wide_success;
            d.max_memory = +d.max_memory;
            d.memory = +d.memory;
            d.time = +d.time;
            d.time_iuc_solver_get_iuc = +d.time_iuc_solver_get_iuc;
            d.time_iuc_solver_get_iuc_hyp_reduce1 = +d.time_iuc_solver_get_iuc_hyp_reduce1;
            d.time_iuc_solver_get_iuc_hyp_reduce2 = +d.time_iuc_solver_get_iuc_hyp_reduce2;
            d.time_iuc_solver_get_iuc_learn_core = +d.time_iuc_solver_get_iuc_learn_core;
            d.time_pool_solver_proof = +d.time_pool_solver_proof;
            d.time_pool_solver_smt_total = +d.time_pool_solver_smt_total;
            d.time_pool_solver_smt_total_sat = +d.time_pool_solver_smt_total_sat;
            d.time_pool_solver_smt_total_undef = +d.time_pool_solver_smt_total_undef;
            d.time_spacer_ctp = +d.time_spacer_ctp;
            d.time_spacer_init_rules = +d.time_spacer_init_rules;
            d.time_spacer_init_rules_pt_init = +d.time_spacer_init_rules_pt_init;
            d.time_spacer_mbp = +d.time_spacer_mbp;
            d.time_spacer_solve = +d.time_spacer_solve;
            d.time_spacer_solve_propagate = +d.time_spacer_solve_propagate;
            d.time_spacer_solve_pt_must_reachable = +d.time_spacer_solve_pt_must_reachable;
            d.time_spacer_solve_reach = +d.time_spacer_solve_reach;
            d.time_spacer_solve_reach_children = +d.time_spacer_solve_reach_children;
            d.time_spacer_solve_reach_cluster = +d.time_spacer_solve_reach_cluster;
            d.time_spacer_solve_reach_gen_bool_ind = +d.time_spacer_solve_reach_gen_bool_ind;
            d.time_spacer_solve_reach_gen_merge = +d.time_spacer_solve_reach_gen_merge;
            d.time_spacer_solve_reach_gen_merge_cvx_cls = +d.time_spacer_solve_reach_gen_merge_cvx_cls;
            d.time_spacer_solve_reach_gen_wide = +d.time_spacer_solve_reach_gen_wide;
            d.time_spacer_solve_reach_is_reach = +d.time_spacer_solve_reach_is_reach;
            return d;
        }).then(function(this, data)
        {
            this.setState({
                data: data
            });
        }.bind(this));
    }
    
    handleSidebarClick(origin, e) {
        console.log(e);
        console.log(origin);
        console.log(origin === "sidebar");
        if (origin === "sidebar"){
            this.setState({
                selectedBenchmark: e.target.innerText
            });
        }
        else if (origin === "dot"){
            this.setState({
                selectedBenchmark: e.index
            });
        }
        
    }
    
    handleHomeClick() {
        this.setState({
            selectedBenchmark: ""
        });
    }
    
    handleGraphTranslation(e) {
        if (e.target.alt === "left-arrow" || e.keyCode === 37){
            if (this.state.graphMin > 0){
                this.setState({
                    graphMin: this.state.graphMin - 1,
                    graphMax: this.state.graphMax - 1
                });
            }
        }
        else if (e.target.alt === "right-arrow" || e.keyCode === 39) {
            if (this.state.graphMax < this.state.data.length - 1 ){
                this.setState({
                    graphMin: this.state.graphMin + 1,
                    graphMax: this.state.graphMax + 1
                });
            }
        }
        else if (e.keyCode === 38) {
            if (this.state.graphMax + 10 < this.state.data.length){
                this.setState({
                    graphMin: this.state.graphMin + 10,
                    graphMax: this.state.graphMax + 10
                });
            }
        }
        else if (e.keyCode === 40) {
            if (this.state.graphMin - 10 >= 0 ){
                this.setState({
                    graphMin: this.state.graphMin - 10,
                    graphMax: this.state.graphMax - 10
                });
            }
        }
        
    }

    filterDictionary(keys){
        let data = this.state.data.slice(this.state.graphMin, this.state.graphMax);
        let result:Object[] = [];
        for (let i = 0; i < data.length; i++){
            result.push({});
            for (let j = 0; j < keys.length; j ++){
                result[i][keys[j]] = data[i][keys[j]];
            }
        }
        return result;
    }
    
    render() {
        console.log(this.state.selectedBenchmark);
        let benchmarks = d3.map(this.state.data, function(d) {return d.index;}).keys();
        let selectedBenchmark = this.state.selectedBenchmark;
        let depthData = this.filterDictionary(["index", "depth"]);
        let resultsData = this.filterDictionary(["index", "result", "SPACER_num_invariants"]);
        let memoryData = this.filterDictionary(["index", "memory"]);
        let timeData = this.filterDictionary(["index", "time"]);
        return (
          <div className="page">
              <div className="sidebar" id="sidebar">
                  {benchmarks.map((name, key ) => {
                      if (key >= this.state.graphMin && key < this.state.graphMax){
                          return (<li className="selected" key={key} onClick={this.handleSidebarClick.bind(this, "sidebar")}>{name}</li>);
                      }
                      return (<li key={key} onClick={this.handleSidebarClick.bind(this, "sidebar")}>{name}</li>);
                  })}
              </div>
              <div className="visual">
                  {this.state.selectedBenchmark !== "" &&
                  <IndividualBenchmark 
                      data={this.state.data.filter(function(d) {return d.index === selectedBenchmark})[0]}
                  />}
                  {this.state.selectedBenchmark === "" &&
                      <div className="dashboard">
                      <DepthOverview
                          data={depthData}
                      />
                      <ResultsOverview
                          data={resultsData}
                          selectBenchmark={this.handleSidebarClick.bind(this, "dot")}
                      />
                      <MemoryOverview
                          data={memoryData}
                      />
                      <TimeOverview
                          data={timeData}
                      />
                      <img className="left-arrow" src={arrow} alt="left-arrow" onClick={this.handleGraphTranslation.bind(this)}/>
                      <img className="right-arrow" src={arrow} alt="right-arrow" onClick={this.handleGraphTranslation.bind(this)}/>
                      <div className="overview-tooltip">
                      </div>
                  </div>}
              </div>
              
              <button className="home-button" onClick={this.handleHomeClick.bind(this)}>Home</button>
              
          </div>  
        );
    }
}

export default Dashboard;
