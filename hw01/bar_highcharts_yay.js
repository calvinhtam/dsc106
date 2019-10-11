// Data of the line chart
var series = [
  {
    name: "Fulltime Men Applied",
    data: [18147, 19838, 20566, 21590, 21725, 22332, 25097, 28758, 31992, 34618, 37009, 39779, 41583, 45636]
  },
  {
    name: "Fulltime Women Applied",
    data: [22371, 23748, 24507, 25775, 25321, 25761, 28351, 32049, 35408, 38822, 41047, 44430, 46845, 52265]
  }
]; 

// Configuration about the plot
var title = {
   text: 'Men v.s. Women Applicants'   
};
var xAxis = {
   categories: ['2005', '2006', '2007', '2008', '2009', '2010'
      ,'2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018']
};
var yAxis = {
   title: {
      text: 'Number of Applicants'
   }
};  
var legend = {
   layout: 'vertical',
   align: 'right',
   verticalAlign: 'middle',
   borderWidth: 0
};
var chart = {
    type: 'bar'
};

// Data structure to hold all the configurations together
var json = {};

// Tying all the configurations
json.title = title;
json.xAxis = xAxis;
json.yAxis = yAxis;
json.legend = legend;
json.chart = chart;

// Tying the data as the series data
json.series = series;

// We need to couple the chart data structure with the chartPlaceHolder div
var bar = document.getElementById("BarChart");
Highcharts.chart(bar, json);
