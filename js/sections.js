/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var isCountryAxis = false;
var scrollVis = function () {
  // constants to define the size
  // and margins of the vis area.
  var width = 600;
  var height = 520;
  var margin = { top: 30, left: 20, bottom: 40, right: 10 };

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

  // Sizing for the grid visualization
  var circleSize = 4;
  var circlePad = 4;
  var numPerRow = width / (circleSize + circlePad);

  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;

  
  // INCIDENTS BY COUNTRY
  var country_to_keep =   ['United States', 'United Kingdom', 'Japan', 'Indonesia', 'France', 'Australia', 'Brazil', 'Germany', 'Canada', 'China'];

  var barCountryColors = { 'United States': '#FFC0CB', 'United Kingdom': '#964B00','Japan': '#808080', 'Indonesia':'#000080',  'France': '#FFA500', 'Australia': '#FF0000', 'Brazil': '#30D5C8', 'Germany': '#00FF00', 'Canada':'#FFFF00', 'China':'#800080'};

  var xCountryIncidentsScale = d3.scaleBand()
  .range([0, width])
  .domain( country_to_keep)
  .padding(0.5);

  // Add Y scale
  var yCountryIncidentsScale = d3.scaleLinear()
    .domain([0, 1100])
    .range([ height, 0]);

  var xCountryIncidentsAxis = d3.axisBottom(xCountryIncidentsScale);

  var yCountryIncidentsAxis = d3.axisLeft(yCountryIncidentsScale);

  var incidentsByCountry_map = new Map();
  var incidentsByCountry_array = [incidentsByCountry_map]


  // INCIDENTS BY CARRIERS
  var carriers_to_keep = ["Delta", "American", "United", "Southwest", "Continental", "US Airways", "Northwest", "FedEx", "America West", "Alaska" ];
  var xCarrierIncidentsScale = d3.scaleBand()
  .range([ 0, width ])
  .domain(carriers_to_keep)
  .padding(0.2);

  // Add Y axis
  var yCarrierIncidentsScale = d3.scaleLinear()
    .domain([0, 100])
    .range([ height, 0]);

  var xCarrierIncidentsAxis = d3.axisBottom(xCarrierIncidentsScale);

  var yCarrierIncidentsAxis = d3.axisLeft(yCarrierIncidentsScale);

  // INCIDENTS BY MANUFACTURER
  var make_to_keep = ["Bombardier", "Boeing", "McDonnell Douglas", "Embraer", "Airbus"];
  var barMakeColors = { "Bombardier":'#FFC0CB', "Boeing":'#964B00', "McDonnell Douglas":'#808080', "Embraer":'', "Airbus":'#FF0000'};
  var xMakeIncidentsScale = d3.scaleBand()
  .range([0, width ])
  .domain(make_to_keep)
  .padding(0.2);

  // Add Y axis
  var yMakeIncidentsScale = d3.scaleLinear()
    .domain([0, 1200])
    .range([height, 0]);

    var xMakeIncidentsAxis = d3.axisBottom(xMakeIncidentsScale);

    var yMakeIncidentsAxis = d3.axisLeft(yMakeIncidentsScale);

  // INCIDENTS BY FLIGHT PHASE
  var flight_phase_keep = ["Cruise", "Landing", "Standing", "Approach", "Takeoff", "Climb", "Taxi", "Other", "Maneuvering", "Unknown", "Descent", "Go-around"];
  var xFlightPhaseIncidentsScale = d3.scaleBand()
  .range([0, width])
  .domain(flight_phase_keep)
  .padding(0.2);

  // Add Y axis
  var yFlightPhaseIncidentsScale = d3.scaleLinear()
    .domain([0, 200])
    .range([height, 0]);
  var xFlightPhaseIncidentsAxis = d3.axisBottom(xFlightPhaseIncidentsScale);

  var yFlightPhaseIncidentsAxis = d3.axisLeft(yFlightPhaseIncidentsScale);


  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.

  var updateFunctions = [];

  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function (selection) {
    selection.each(function (rawData) {
      // create svg and give it a width and height
      svg = d3.select(this).selectAll('svg').data([getIncidents]);
      var svgE = svg.enter().append('svg');
      // @v4 use merge to combine enter and existing selection
      svg = svg.merge(svgE);

      svg.attr('width', width + margin.left + margin.right);
      svg.attr('height', height + margin.top + margin.bottom);

      svg.append('g');


      // this group element will be used to contain all
      // other elements.
      g = svg.select('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      var incidentsFatalData = getIncidents(rawData);
      var countryIncidents = getCountryIncidents(rawData);
      var makeIncidents = getMakeIncidents(rawData)
      var flightPhaseIncidents = getFlightPhaseIncidents(rawData);

      // preprocess data for incidents by country
      var incidentsByCountryArray = d3.nest()
      .key(function (d) { return d.Country; })
      .rollup(function (v) { return v.length; })
      .entries(countryIncidents)
      .sort(function (a, b) {return b.value - a.value;});

      var incidentsByCountry = d3.group(rawData, d => d.Country)
      
      for (let i = 0; i < country_to_keep.length; i++) {
        num_country = incidentsByCountry.get(country_to_keep[i]).length;
        incidentsByCountry_map.set(country_to_keep[i], num_country);
      }

      //  air carrier

       // preprocess data for incidents by country
       
       var incidentsByMakeArray = d3.nest()
       .key(function (d) { return d.Make; })
       .rollup(function (v) { return v.length; })
       .entries(makeIncidents)
       .sort(function (a, b) {return b.value - a.value;});
   
      
      var incidentsByMakeArray = d3.nest()
      .key(function (d) { return d.Make; })
      .rollup(function (v) { return v.length; })
      .entries(makeIncidents)
      .sort(function (a, b) {return b.value - a.value;});
      

      var incidentsByCountry = d3.group(rawData, d => d.Country)
      
      for (let i = 0; i < country_to_keep.length; i++) {
        num_country = incidentsByCountry.get(country_to_keep[i]).length;
        incidentsByCountry_map.set(country_to_keep[i], num_country);
      }


      var incidentsByFlightPhaseArray = d3.nest()
      .key(function (d) { return d.Broad_Phase_of_Flight; })
      .rollup(function (v) { return v.length; })
      .entries(flightPhaseIncidents)
      .sort(function (a, b) {return b.value - a.value;});
      
      console.log(flightPhaseIncidents)
      var incidentsByCountry = d3.group(rawData, d => d.Country)
      
      for (let i = 0; i < country_to_keep.length; i++) {
        num_country = incidentsByCountry.get(country_to_keep[i]).length;
        incidentsByCountry_map.set(country_to_keep[i], num_country);
      }


      setupVis(incidentsFatalData, incidentsByCountryArray, incidentsByMakeArray, incidentsByFlightPhaseArray);

      setupSections();
    });
  };

  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param incidentsFatalData - data object for each word.
   * @param fillerCounts - nested data that includes
   *  element for each filler word type.
   * @param histData - binned histogram data
   */
  var setupVis = function (rawData, incidentsByCountryArray, incidentsByMakeArray, incidentsByFlightPhaseArray) {
  
    // X axis
      svg.append("g")
      .attr('class', 'x axis')
      .attr("transform", "translate(90," + (height+10) + ")")
      .style("font", "8px times")
      .call(xCountryIncidentsAxis)
      .style('opacity', 0);

      svg.append("g")
        .attr('class', 'y axis')
        .attr("transform", "translate(90,10)")
        .call(yCountryIncidentsAxis)
        .style('opacity', 0);
   
    

    

    // circle grid
    // @v4 Using .merge here to ensure
    // new and old data have same attrs applied

    var circles = g.selectAll('.circle').data(rawData, function (d) {
      return d.Accident_Number; });
    var circlesE = circles.enter()
      .append('circle')
      .classed('circle', true);

    circles = circles.merge(circlesE)
      .attr('r', circleSize)
      .attr('fill', '#fff')
      .classed('fill-circle', function (d) {  
        return d.Injury_Severity; })
      .attr('cx', function (d) { return d.cx;})
      .attr('cy', function (d) { return d.cy;})
      .attr('opacity', 1);
  
    // country bar
    
    var countrybars = g.selectAll('.countrybar').data(incidentsByCountryArray);
    var countrybarsE = countrybars.enter().append('rect')
      .attr('class', 'countrybar');
    countrybars = countrybars.merge(countrybarsE)
      .attr('x', function (d) { 
        return (xCountryIncidentsScale(d.key) + 100); })
      .attr('y', function (d) { return yCountryIncidentsScale(d.value); })
      .attr('height', function(d) { return height - yCountryIncidentsScale(d.value);})
      .attr('width',xCountryIncidentsScale.bandwidth())
      .attr('fill', "#69b3a2")
      .attr('opacity', 0);

      var makebars = g.selectAll('.makebar').data(incidentsByMakeArray);
      var makebarsE = makebars.enter().append('rect')
        .attr('class', 'makebar');
      makebars = makebars.merge(makebarsE)
        .attr('x', function (d) { 
          return (xMakeIncidentsScale(d.key) + 100); })
        .attr('y', function (d) { return yMakeIncidentsScale(d.value); })
        .attr('height', function(d) { return height - yMakeIncidentsScale(d.value);})
        .attr('width',xMakeIncidentsScale.bandwidth())
        .attr('fill', "#69b3a2")
        .attr('opacity', 0);
    
  };

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  var setupSections = function () {
    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = showBlank;
    activateFunctions[1] = showGrid;
    activateFunctions[2] = highlightFatalGrid;
    activateFunctions[3] = highlightNonFatalGrid;
    activateFunctions[4] = showBlank;
    activateFunctions[5] = showCountryBar;
    activateFunctions[6] = showCarrierBar;
    activateFunctions[7] = showMakeBar;
    activateFunctions[8] = showFlightPhaseBar;


    
    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for (var i = 0; i < 9; i++) {
      updateFunctions[i] = function () {};
    }
    
  };

  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */

  /**
   * showGrid - square grid
   *
   * hides: filler count title
   * hides: filler highlight in grid
   * shows: square grid
   *
   */
  
  function showBlank() {
    g.selectAll('.circle')
    .transition()
    .duration(800)
    .attr('opacity', 0);

    g.selectAll('.fill-circle')
      .transition()
      .duration(800)
      .duration(0)
      .attr('opacity', 0);


    g.selectAll('.countrybar')
    .transition()
    .duration(800)
    .duration(0)
    .attr('opacity', 0);
  }
  function showGrid() {
    hideAxis();
    g.selectAll('.countrybar')
        .transition()
        .duration(800)
        .duration(0)
        .attr('opacity', 0);

    g.selectAll('.circle')
      .transition()
      .duration(600)
      .delay(function (d) {
        return 5 * d.row;
      })
      .attr('opacity', 1.0)
      .attr('fill', '#ddd');
  }

  function highlightFatalGrid() {
    hideAxis();

    g.selectAll('.countrybar')
        .transition()
        .duration(800)
        .duration(0)
        .attr('opacity', 0);

    g.selectAll('.circle')
    .transition()
    .duration(0)
    .attr('opacity', 1.0)
    .attr('fill', '#ddd');

    // use named transition to ensure
    // move happens even if other
    // transitions are interrupted.
    g.selectAll('.fill-circle')
      .transition('move-fills')
      .duration(800)
      .attr('cx', function (d) {
        return d.cx;
      })
      .attr('cy', function (d) {
        return d.cy;
      });

    g.selectAll('.fill-circle')
      .transition()
      .duration(800)
      .attr('opacity', 1.0)
      .attr('fill', function (d) { 
        return (d.Injury_Severity == 1) ? '#FF0000' : '#ddd'; });
  }

  function highlightNonFatalGrid() {
    hideAxis();

    g.selectAll('.countrybar')
        .transition()
        .duration(800)
        .duration(0)
        .attr('opacity', 0);

    g.selectAll('.circle')
    .transition()
    .duration(0)
    .attr('opacity', 1.0)
    .attr('fill', '#ddd');

    

    // use named transition to ensure
    // move happens even if other
    // transitions are interrupted.
    g.selectAll('.fill-circle')
    .transition('move-fills')
    .duration(800)
    .attr('cx', function (d) {
      return d.cx;
    })
    .attr('cy', function (d) {
      return d.cy;
    });
    

    g.selectAll('.fill-circle')
    .transition()
    .duration(800)
    .attr('opacity', 1.0)
    .attr('fill', function (d) {
      if(d.Injury_Severity == 1) {
       return '#FF0000'
      } else if (d.Injury_Severity == 2) {
        return '#FFA500'
      } else {

        return '#ddd';
      }
       });
    }

    function showCountryBar() {
      showAxis(xCountryIncidentsAxis, yCountryIncidentsAxis);
      
      g.selectAll('.circle')
      .transition()
      .duration(800)
      .attr('opacity', 0);
  
      g.selectAll('.fill-circle')
        .transition()
        .duration(800)
        .duration(0)
        .attr('opacity', 0);

        g.selectAll('.makebar')
      .transition()
      .duration(800)
      .duration(0)
      .attr('opacity', 0);
        
      // switch the axis to histogram one


      
      // here we only show a bar if
      // it is before the 15 minute mark
      g.selectAll('.countrybar')
      .transition()
      .duration(600)
      .attr("x", function(d) { 
        return (xCountryIncidentsScale(d.key) + 72); })
      .attr("y", function(d) { 
        return (yCountryIncidentsScale(d.value) - 20); })
      .attr("width", xCountryIncidentsScale.bandwidth())
      .attr("height", function(d) { return height - yCountryIncidentsScale(d.value); })
      .attr('fill', function (d) { return barCountryColors[d.key]; })
      .attr('opacity', 1);
      
        /* 
        .attr('y',  function (d) { return yCountryIncidentsScale(d[1]);})
        .attr('height', function (d) { return height - yCountryIncidentsScale(d[1]);})
        .attr('opacity', 1);
        */
    }

    function showCarrierBar() {
      showAxis(xCarrierIncidentsAxis, yCarrierIncidentsAxis);
      
      g.selectAll('.circle')
      .transition()
      .duration(800)
      .attr('opacity', 0);
  
      g.selectAll('.fill-circle')
        .transition()
        .duration(800)
        .duration(0)
        .attr('opacity', 0);
        
      // switch the axis to histogram one
      g.selectAll('.countrybar')
      .transition()
      .duration(800)
      .duration(0)
      .attr('opacity', 0);

      g.selectAll('.makebar')
      .transition()
      .duration(800)
      .duration(0)
      .attr('opacity', 0);
    }

    function showMakeBar() {
      showAxis(xMakeIncidentsAxis, yMakeIncidentsAxis);
      g.selectAll('.circle')
      .transition()
      .duration(800)
      .attr('opacity', 0);
  
      g.selectAll('.fill-circle')
        .transition()
        .duration(800)
        .duration(0)
        .attr('opacity', 0);
        
      // switch the axis to histogram one
      g.selectAll('.countrybar')
      .transition()
      .duration(800)
      .duration(0)
      .attr('opacity', 0);

      g.selectAll('.makebar')
      .transition()
      .duration(600)
      .attr("x", function(d) { 
        return (xMakeIncidentsScale(d.key) + 100); })
      .attr("y", function(d) { 
        return (yMakeIncidentsScale(d.value) - 20); })
      .attr("width", xMakeIncidentsScale.bandwidth()-70)
      .attr("height", function(d) { return height - yMakeIncidentsScale(d.value); })
      .attr('fill', function (d) { return barMakeColors[d.key]; })
      .attr('opacity', 1);
    }

    function showFlightPhaseBar() {
      showAxis(xFlightPhaseIncidentsAxis , yFlightPhaseIncidentsAxis );
      
      g.selectAll('.circle')
      .transition()
      .duration(800)
      .attr('opacity', 0);
  
      g.selectAll('.fill-circle')
        .transition()
        .duration(800)
        .duration(0)
        .attr('opacity', 0);
        
      // switch the axis to histogram one
      g.selectAll('.countrybar')
      .transition()
      .duration(800)
      .duration(0)
      .attr('opacity', 0);

      g.selectAll('.flightphasebar')
      .transition()
      .duration(800)
      .duration(0)
      .attr('opacity', 0);

      g.selectAll('.makebar')
      .transition()
      .duration(800)
      .duration(0)
      .attr('opacity', 0);

    }

    function showAxis(xaxis,yaxis) {
      svg.select('.x.axis')
        .call(xaxis)
        .transition().duration(500)
        .style('opacity', 1);

        svg.select('.y.axis')
        .call(yaxis)
        .transition().duration(500)
        .style('opacity', 1);
    }

    function hideAxis() {
      svg.select('.x.axis')
        .transition().duration(500)
        .style('opacity', 0);

      svg.select('.y.axis')
        .transition().duration(500)
        .style('opacity', 0);
    }
 
  /**
   * UPDATE FUNCTIONS
   *
   * These will be called within a section
   * as the user scrolls through it.
   *
   * We use an immediate transition to
   * update visual elements based on
   * how far the user has scrolled
   *
   */


  /**
   * DATA FUNCTIONS
   *
   * Used to coerce the data into the
   * formats we need to visualize
   *
   */

  /**
   * getWords - maps raw data to
   * array of data objects. There is
   * one data object for each word in the speach
   * data.
   *
   * This function converts some attributes into
   * numbers and adds attributes used in the visualization
   *
   * @param rawData - data read in from file
   */
  function getIncidents(rawData) {
    return rawData.map(function (d, i) {
      // fatal injuries
      if(d.Injury_Severity == 'Non-Fatal') {
        d.Injury_Severity = 2
      } else if(d.Injury_Severity !='Non-Fatal' && d.Injury_Severity !='Incident' && d.Injury_Severity !='Unavailable') {
        d.Injury_Severity = 1
      }
     
      
      // non-fatal injuries
      //d.Injury_Severity = (d.Injury_Severity == 'Non-Fatal') ? true : false;

      // positioning for cicrcle visual
      // stored here to make it easier
      // to keep track of.
      d.col = i % numPerRow;
      d.cx = d.col * (circleSize + circlePad);
      d.row = Math.floor(i / numPerRow);
      d.cy = d.row * (circleSize + circlePad);
      return d;
    });
  }

  /**
   * getFatalIncidents - returns array of
   * only fatal incidents
   *
   * @param data - word data from getWords
   */
  function getFatalIncidents(data) {
    return data.filter(function (d) {return d.Total_Fatal_Injuries; });
  }

  function getNonFatalIncidents(data) {
    return data.filter(function (d) {return d.Injury_Severity; });
  }

  function getCountryIncidents(data) {
    return data.filter(function(d){ return (d.Country == "Indonesia" ||d.Country == "France" || d.Country == "China" || d.Country == "Canada" || d.Country == "Germany" || d.Country == "Brazil" || d.Country == "Australia" || d.Country == "Japan" || d.Country == "United States" || d.Country == "United Kingdom") });
  }

  function getMakeIncidents(data) {
    return data.filter(function(d){ return (d.Make == "Bombardier" ||d.Make == "Boeing" || d.Make == "McDonnell Douglas" || d.Make == "Embraer" || d.Make == "Airbus" ) });
  }

  function getFlightPhaseIncidents(data) {
    return data.filter(function(d){ return (d.Broad_Phase_of_Flight == "Cruise" ||d.Broad_Phase_of_Flight ==  "Landing" || d.Broad_Phase_of_Flight == "Standing" || d.Broad_Phase_of_Flight == "Approach" || d.Broad_Phase_of_Flight == "Takeoff"|| d.Broad_Phase_of_Flight == "Climb"|| d.Broad_Phase_of_Flight =="Taxi"|| d.Broad_Phase_of_Flight == "Other"|| d.Broad_Phase_of_Flight ==  "Maneuvering"|| d.Broad_Phase_of_Flight == "Unknown"|| d.Broad_Phase_of_Flight ==  "Descent"|| d.Broad_Phase_of_Flight == "Go-around" ) });
  }


  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function (index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function (i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function (index, progress) {
    updateFunctions[index](progress);
  };

  // return chart function
  return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(data) {
  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select('#vis')
    .datum(data)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function (index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function (index, progress) {
    plot.update(index, progress);
  });
}

// load data and display
d3.csv('data/incidents.csv', display);
