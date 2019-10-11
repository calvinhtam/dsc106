// Data of the line chart
var series = [
  {
    name: "Sex",
  	data: [{
            name: 'Female',
            y: 0.53385563,
        }, {
            name: 'Male',
            y: 0.46614437
        }]
  }
]; 

// Configuration about the plot
var title = {
   text: 'Men v.s. Women Applicants in 2018'   
};
var legend = {
   layout: 'vertical',
   align: 'right',
   verticalAlign: 'middle',
   borderWidth: 0
};
var chart = {
    type: 'pie'
};

// Data structure to hold all the configurations together
var json = {};

// Tying all the configurations
json.title = title;
json.chart = chart;
json.legend = legend;

// Tying the data as the series data
json.series = series;

// We need to couple the chart data structure with the chartPlaceHolder div
var pie_boi = document.getElementById("PieChart");
Highcharts.chart(pie_boi, json);
