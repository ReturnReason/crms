import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import './Visual.css'


class Visual extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dataset: []
        }
    }

    getVisualData() {

    }



    drawChart() {

        var width = parseInt(window.getComputedStyle(document.querySelector("#root > div > main > div.Content > svg")).width),
            height = parseInt(window.getComputedStyle(document.querySelector("#root > div > main > div.Content > svg")).height) - 200;


        var cloud = this.state.dataset.filter(item => item.type.toLowerCase().includes("aws"))
        var vpc = this.state.dataset.filter(item => item.type.toLowerCase().includes("vpc"));
        var sgs = this.state.dataset.filter(item => item.type.toLowerCase().includes("securitygroups"));
        var sg = this.state.dataset.filter(item => item.type.toLowerCase().includes("securitygroup"));
        var subnets = this.state.dataset.filter(item => item.type.toLowerCase().includes("subnets"));
        var subnet = this.state.dataset.filter(item => item.type.toLowerCase().includes("subnet"));
        var ec2 = this.state.dataset.filter(item => item.type.toLowerCase().includes("ec2"));
        var ebs = this.state.dataset.filter(item => item.type.toLowerCase().includes("ebs"));

        for (let tmp of cloud) {
            tmp.children = [];
            for (let tmp_vpc of vpc) {
                tmp_vpc.children = [];
                if (tmp.id == tmp_vpc.link[0]) {
                    for (let tmp_subs of subnets) {
                        tmp_subs.children = [];
                        if (tmp_vpc.id == tmp_subs.link[0]) {
                            for (let tmp_sub of subnet) {
                                if(tmp_sub.type=="subnet"){
                                    tmp_sub.children = [];
                                }
                                if (tmp_subs.id == tmp_sub.link[0]) {
                                    for(let tmp_ec2 of ec2){
                                        for(var i=0;i<tmp_ec2.link.length;i++){
                                            if(tmp_ec2.link[i]==tmp_sub.id){
                                                for(let tmp_ebs of ebs){
                                                    for(var j=0;j<tmp_ebs.link.length;j++){
                                                        if(tmp_ebs.link[j]==tmp_ec2.id){
                                                            tmp_ec2.children=[];
                                                            tmp_ec2.children.push(tmp_ebs);
                                                        }
                                                    }
                                                }
                                                tmp_sub.children.push(tmp_ec2);
                                            }
                                        }
                                    }
                                    tmp_subs.children.push(tmp_sub);
                                }
                            }
                            
                            tmp_vpc.children.push(tmp_subs);
                        }
                    }
                    for (let tmp_sgs of sgs) {
                        tmp_sgs.children = [];
                        if (tmp_vpc.id == tmp_sgs.link[0]) {
                            for (let tmp_sg of sg) {
                                if (tmp_sgs.id == tmp_sg.link[0]) {
                                    tmp_sgs.children.push(tmp_sg);
                                }
                            }
                            tmp_vpc.children.push(tmp_sgs);
                        }
                    }
                    tmp.children.push(tmp_vpc);
                }
            }
            this.state.dataset.push(tmp);
        }

        //initialising hierarchical data
        var root = d3.hierarchy(this.state.dataset[0]);

        var i = 0;

        var transform = d3.zoomIdentity;

        var nodeSvg, linkSvg, simulation, nodeEnter, linkEnter;

        var tooltip = d3.select(".tooltip")
            .attr("class", "tooltip")
            .style("display", "none")
            .on("contextmenu", function (d) {
                d3.event.preventDefault();
            });

        var svg = d3.select("svg")
            .call(d3.zoom().scaleExtent([1 / 100, 8]).on("zoom", zoomed))
            .style("background-color", "#27262b")
            .on("dblclick.zoom", null)
            .on("contextmenu", function (d, i) {
                d3.event.preventDefault();
            })
            .append("g")
            .attr("transform", "translate(40,0)")

        svg.append("svg:defs").selectAll("marker")
            .data(["end"])      // Different link/path types can be defined here
            .enter().append("svg:marker")    // This section adds in the arrows
            .attr("id", String)
            .style("stroke", "#ffc14d")
            .style("fill", "#ffc14d")
            .attr("viewBox", "0 -5 10 10")
            .attr("markerWidth", 10)
            .attr("markerHeight", 10)
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");

        function zoomed() {
            tooltip.style("display", "none")
            svg.attr("transform", d3.event.transform);
        }

        simulation = d3.forceSimulation()
            .force("link", d3.forceLink(linkSvg).distance(300))
            .alphaDecay(0)
            .force("charge", d3.forceManyBody().strength(-1500))
            .force("center", d3.forceCenter(width / 2, height / 2 + 100))
            .force("colide", d3.forceCollide().radius(d => d.r * 500))
            .on("tick", ticked);

        update();

        function update() {

            var nodes = flatten(root);
            var links = root.links();

            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].data.link.length > 0) {
                    for (var j = 0; j < nodes[i].data.link.length; j++) {
                        for (var h = 0; h < nodes.length; h++) {
                            if (nodes[i].data.link[j] == nodes[h].data.id) {
                                links.push({ source: i, target: h })
                            }

                        }
                    }
                }
            }

            linkSvg = svg.selectAll(".link")
                .data(links, function (d) {
                    return d.target.id;
                })


            linkSvg.exit().remove();

            var linkEnter = linkSvg.enter()
                .append("line")
                .attr("class", "link")
                .style("stroke", "#ffc14d")
                .attr("marker-end", "url(#end)");

            linkSvg = linkEnter.merge(linkSvg)

            nodeSvg = svg.selectAll(".node")
                .data(nodes, function (d) {
                    return d.id;
                })

            nodeSvg.exit().remove();

            var nodeEnter = nodeSvg.enter()
                .append("g")
                .attr("class", "node")
                .on("mouseover", function (d) {
                    var thisNode = d.id
                    var thislink = d
                    d3.selectAll(".link").attr("opacity", function (d) {
                        return (d.source.id == thisNode || d.target.id == thisNode) ? 1 : 0.2
                    });
                    d3.selectAll(".node").attr("opacity", function (d) {
                        if (d.data.link.length > 0) {
                            for (var i = 0; i < d.data.link.length; i++) {
                                if (d.data.link[i] == thislink.data.id)
                                    return "1";
                            }
                        }
                        if (d.id == thislink.data.link || d.id == thisNode)
                            return "1";
                        else
                            return "0.2";
                    });
                })
                .on("mouseout", function (d) {
                    d3.selectAll(".link").attr("opacity", "1");
                    d3.selectAll(".node").attr("opacity", "1");
                })
                .on("contextmenu", function (d) {
                    d3.event.preventDefault();
                    var tmp = [];
                    if (d.data.children.length > 0) {
                        for (var i = 0; i < d.data.children.length; i++) {
                            tmp.push(d.data.children[i].name)
                        }
                    }
                    tooltip.transition()
                        .duration(300)
                        .style("opacity", 1)
                        .style("display", "block")
                        .style('pointer-events', 'visiblePainted')
                    tooltip.html(
                        "<div class='toolbut'>" +
                        "<button class='hide' onClick={document.getElementsByClassName('tooltip')[0].style.display='none';}> X </button>" +
                        "</div>" +
                        "<hr/>" +
                        "Name : " + d.data.name + "<hr/>" +
                        "Type : " + d.data.type + "<hr/>" +
                        "Parent : " + d.data.parent + "<hr/>" +
                        "Children : " + tmp + "<hr/>" +
                        "Link : " + d.data.link + "<hr/>" +
                        "<div class='toolbut'>" +
                        "<button> Detail </button>" +
                        "<button> Delete </button>" +
                        "</div>"
                    )
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY + 10) + "px");
                })
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))

            nodeEnter.append("circle")
                .attr("stroke", "#ffc14d")
                .attr("stroke-width", "3")
                .attr("fill", "none")
                .attr("r", function(d){
                    if(d.data.type=="aws"){
                        return 100;
                    }
                    else if(d.data.type=="vpc")
                        return 80;
                    else if(d.data.type=="subnets"||d.data.type=="securitygroups")
                        return 70;
                    else if(d.data.type=="subnet"||d.data.type=="securitygroup")
                        return 60;   
                    else{
                        return 50;
                    }
                })

            nodeEnter.append("svg:image")
                .attr("xlink:href", function (d) {
                    if (d.data.type == "ec2")
                        return "./../../../images/compute.svg";
                    if (d.data.type == "securitygroup")
                        return "./../../../images/security_group.svg";
                    if (d.data.type == "subnet")
                        return "./../../../images/ec2-container-registry.svg";
                    if (d.data.type == "vpc")
                        return "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/AWS_Simple_Icons_Virtual_Private_Cloud.svg/640px-AWS_Simple_Icons_Virtual_Private_Cloud.svg.png";
                    if (d.data.type == "aws")
                        return "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/AWS_Simple_Icons_AWS_Cloud.svg/1200px-AWS_Simple_Icons_AWS_Cloud.svg.png";
                    if (d.data.type == "ebs")
                        return "/images/ebs.svg";
                })
                .attr("x", function (d) { return -30; })
                .attr("y", function (d) { return -35; })
                .attr("height", 60)
                .attr("width", 60)
                .on("click", click);

            nodeEnter.append("text")
                .attr("dy", 33)
                .style("fill", "#ffc14d")
                .style("font-family", "NanumSquare")
                .style("font-weight", "bold")
                .style("font-size", "14px")
                .style("text-anchor", "middle")
                .text(function (d) {
                    return d.data.name;
                });

            nodeSvg = nodeEnter.merge(nodeSvg);

            var addresshow = d3.select(".add_res");
            var resnoshow = addresshow.select("#cancel");
            resnoshow.on("click", function () {
                addresshow.style("display", "none");
            })

            simulation
                .nodes(nodes)

            simulation.force("link")
                .links(links);

        }

        function ticked() {

            linkSvg
                .attr("x1", function (d) {
                    var angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
                    var length = 60 * Math.cos(angle);
                    return d.source.x + length;
                })
                .attr("y1", function (d) {
                    var angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
                    var length = 60 * Math.sin(angle);
                    return d.source.y + length;
                })
                .attr("x2", function (d) {
                    var angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
                    var length = 70 * Math.cos(angle);
                    return d.target.x - length;
                })
                .attr("y2", function (d) {
                    var angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
                    var length = 70 * Math.sin(angle);
                    return d.target.y - length;
                });

            nodeSvg
                .attr("transform", function (d) {
                    return "translate(" + d.x + ", " + d.y + ")";
                });
        }

        function click(d) {
            if (d.children) {
                var check=0;
                if(d.data.type=="subnet"){
                    for(var i=0;i<d.children.length;i++){
                        for(var j=0;j<d.children[i].data.link.length;j++){
                            if(d.children[i].data.link[j].includes(":securitygroup:")){
                                d.data.link.push(d.children[i].data.link[j]);
                                check++;
                            }
                        }
                    }
                }
                d._children = d.children;
                d.children = null;
                update();
                simulation.restart();
                if(check!=0){
                    for(var i=0;i<check;i++){
                        d.data.link.pop();
                    }
                }
            } else {
                d.children = d._children;
                d._children = null;
                update();
                simulation.restart();
            }
        }

        function dragstarted(d) {
            tooltip.style("display", "none")
                .style('pointer-events', 'visiblePainted')
            if (!d3.event.active) simulation.alphaTarget(0.3).restart()
            simulation.fix(d);
        }

        function dragged(d) {
            simulation.fix(d, d3.event.x, d3.event.y);
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            simulation.unfix(d);
        }

        function flatten(root) {
            // hierarchical data to flat data for force layout
            var nodes = [];

            function recurse(node) {
                if (node.children) node.children.forEach(recurse);
                if (!node.id) node.id = node.data.name;
                else ++i;
                nodes.push(node);
            }
            recurse(root);
            return nodes;
        }

    }

    componentDidMount() {
        this.drawChart();
        this.setState({dataset: this.getVisualData()})
    }

    render() {
        return (
            <>
                <div className="tooltip">
                </div>
                <svg className="Visual">
                </svg>
            </>
        );
    }
}

export default Visual;