// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 120,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);
//Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Initial Params
var chosenXAxis = "poverty";
function xScale(CenData, chosenXAxis){
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(CenData, d => d[chosenXAxis])*0.8, d3.max(CenData, d => d[chosenXAxis])*1.2])
        .range([0, width]);
    return xLinearScale;
}

//Make render axis
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition().duration(1000).call(bottomAxis);

    return xAxis;
}
//Make updating circles function
function renderCircles(circlesGroup, newXScale, chosenXAxis, stateabbr){

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    stateabbr.transition()
        .duration(1000)
        .attr('x', d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}
//Make updating tool tips function
function updateToolTip(chosenXAxis, circlesGroup) {

    var label;
    var label2="";

    if (chosenXAxis === "poverty") {
        label = "Poverty: ";
        label2 = "%";
    }
    else if (chosenXAxis === "age") {
        label = "Age: ";
    }
    else {
        label = "Household Income ($): ";
        label2 = "";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -80])
        .html(function(d) {
            return (`${d.state}<br>${label}${d[chosenXAxis]}${label2}<br>Lack Healthcare: ${d.healthcare}%`);
        });
    
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
        .on("mouseout", function(data, index){
            toolTip.hide(data, this);
        });
    
    return circlesGroup;
}
// Import Data
d3.csv("assets/data/data.csv").then(function(CenData) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    CenData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
    });
    // Step 2: Create scale functions
    // ==============================
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(CenData, d => d.healthcare)])
        .range([height, 0]);
    var xLinearScale = xScale(CenData, chosenXAxis);
    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    var xAxis = chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(CenData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", "10")
    .attr("class", "stateCircle");

    var fontsize=10;
    var stateabbr = chartGroup.selectAll(null)
        .data(CenData)
        .enter()
        .append('text')
        .text(d => d.abbr)
        .attr('x', d => xLinearScale(d[chosenXAxis]))
        .attr('y', d => yLinearScale(d.healthcare)+5)
        .attr('font-size', `${fontsize}px`)
        .attr('class', 'stateText');

    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width/2}, ${height+20})`);
    
    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (Median)");

    var houseincomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (Median)");

    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function(){
            //get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                //replace chosenXAxis with value
                chosenXAxis = value;

                //update x scale
                xLinearScale = xScale(CenData, chosenXAxis);

                //update x axis
                xAxis = renderXAxes(xLinearScale, xAxis);

                //update circles
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, stateabbr);

                //update tool tips
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                if (chosenXAxis === "poverty") {
                    povertyLabel.classed("active", true).classed("inactive", false);
                    ageLabel.classed("active", false).classed("inactive", true);
                    houseincomeLabel.classed("active", false).classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    povertyLabel.classed("active", false).classed("inactive", true);
                    ageLabel.classed("active", true).classed("inactive", false);
                    houseincomeLabel.classed("active", false).classed("inactive", true);
                }
                else {
                    povertyLabel.classed("active", false).classed("inactive", true);
                    ageLabel.classed("active", false).classed("inactive", true);
                    houseincomeLabel.classed("active", true).classed("inactive", false);
                }
            }
        })
  }).catch(function(error) {
    console.log(error);
});