'use strict';

(function() {

  let data = "no data";
  let svgContainer = ""; // keep SVG reference in global scope
  let menu = "";
  let tooltip = "";
  const colors = {

    "Bug": "#B0FD92",

    "Dark": "#A0CBE8",

    "Dragon": "orange",

    "Electric": "#F2FF24",

    "Fairy": "#FFA9EB",

    "Fighting": "#DE33EF",

    "Fire": "#D70000",

    "Ghost": "#A0BBE2",

    "Grass": "#6EC44D",

    "Ground": "#B78655",

    "Ice": "#8AE2E6",

    "Normal": "#F8E084",

    "Poison": "#B5A1C2",

    "Psychic": "#896ABF",

    "Rock": "#727272",

    "Steel": "#BAB0AC",

    "Water": "#296CFC"

}

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 750)
      .attr('height', 500);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("pokemon.csv")
      .then((data) => makeScatterPlot(data));
  }

  // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    data = csvData // assign data as global variable

    // get arrays of fertility rate data and life Expectancy data
    let sp_def_data = data.map((row) => parseInt(row["Sp. Def"]));
    let total_data = data.map((row) => parseInt(row["Total"]));

    // find data limits
    let axesLimits = findMinMax(sp_def_data, total_data);

    // draw axes and return scaling + mapping functions
    let mapFunctions = drawAxes(axesLimits, "Sp. Def", "Total");

    // plot data as points and add tooltip functionality
    plotData(mapFunctions);

    // draw title and axes labels
    makeLabels();

    // make drop downs and create change event
    dropDown();

    // create tooltip
    makeTooltip();
  }

    // make tooltip
    function makeTooltip() {
      tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style('display', 'flex')
      .style('align-items', 'center')
      .style('justify-content', 'center')
      .style('position', 'absolute')
      .style('width', '75px')
      .style('height', '50px')
      .style('font', '5px sans-serif')
      .style('text-align', 'center')
      .style('padding', '2px')
      .style('border', '2px solid')
      .style('border-radius', '8px')
      .style('background', '#F4F4F4')
      .style('pointer-events', 'none');
    } 

  // make drop downs
  function dropDown() {
    menu = d3.select('body').append('div').attr('id', 'menu')
            .style('width', '750px')
            .style('height', '300px')
            .style('display', 'flex')
            .style('justify-content', 'space-evenly');

      let genFilter = menu.append('select')

      genFilter.append('option')
        .attr('value', 'all')
        .text('All')

      for (let i = 1; i < 7; i++) {
          genFilter.append('option')
            .attr('value', i)
            .text(i)
      }

      let legFilter = menu.append('select')
      
      legFilter.append('option')
        .attr('value', 'all')
        .text('All')
      legFilter.append('option')
        .attr('value', 'true')
        .text('True')
      legFilter.append('option')
        .attr('value', 'false')
        .text('False')
  }

  // make title and axes labels
  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 250)
      .attr('y', 30)
      .style('font-size', '14pt')
      .text("Pokemon: Special Defense vs Total Stats");

    svgContainer.append('text')
      .attr('x', 350 )
      .attr('y', 490)
      .style('font-size', '10pt')
      .text('Sp. Def');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 275)rotate(-90)')
      .style('font-size', '10pt')
      .text('Total');
  }

  // plot all the data points on the SVG
  // and add tooltip functionality
  function plotData(map) {
    /* // get population data as array
    let pop_data = data.map((row) => +row["pop_mlns"]);
    let pop_limits = d3.extent(pop_data);
    // make size scaling function for population
    let pop_map_func = d3.scaleLinear()
      .domain([pop_limits[0], pop_limits[1]])
      .range([3, 20]); */

    // mapping functions
    let xMap = map.x;
    let yMap = map.y;


    // append data to SVG and plot as points
    svgContainer.selectAll('.circle')
      .data(data.filter(function(d) { return +d['Generation'] == 1 })
                .filter(function(d) { return d['Legendary'] == 'False' }))
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', 3)
        .attr('fill', function(d) { return colors[d['Type 1']] })
        // add tooltip functionality to points
        .on("mouseover", (d) => {
          tooltip.transition()
            .duration(200)
            .style("opacity", .9)
            .style('border-color', colors[d['Type 1']] );
          tooltip.html(d.Name + "<br/>" + d['Type 1'] + "<br/>" + d['Type 2'])
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", (d) => {
          tooltip.transition()
            .delay(250)
            .duration(500)
            .style("opacity", 0);
        });
  }

  // draw the axes and ticks
  function drawAxes(limits, x, y) {
    // return x value from a row of data
    let xValue = function(d) { return +d[x]; }

    // function to scale x value
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 5, limits.xMax + 20]) // give domain buffer room
      .range([50, 700]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 450)')
      .call(xAxis);

    // return y value from a row of data
    let yValue = function(d) { return +d[y]}

    // function to scale y
    let yScale = d3.scaleLinear()
      .domain([limits.yMax + 50, limits.yMin - 5]) // give domain buffer
      .range([50, 450]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for arrays of x and y
  function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }

})();
