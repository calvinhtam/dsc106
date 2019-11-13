'use strict';

const JSONFileName = 'assets/springfield_data.json';

// global data-structure to hold the energy breakup
var globalEnergyData = {
    keys: [],
    values: []
};
var globalAVData = [];
var globalCurrX = 0;
var globalPieSum = 0;

var weekday=new Array(7);
weekday[0]="Mon";
weekday[1]="Tue";
weekday[2]="Wed";
weekday[3]="Thu";
weekday[4]="Fri";
weekday[5]="Sat";
weekday[6]="Sun";

function x_to_date(x_val) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(x_val);

    var minutes = t.getMinutes();
    if (minutes < 10) minutes = '0' + minutes;
    var hours = t.getHours();
    if (hours < 12) var ampm = 'AM';
    if (hours >= 12) var ampm = 'PM';
    if (hours > 13) hours = String(Number(hours) - 12);
    if (hours < 10) hours = '0' + hours;
    return "<b>" + t.getDate() + " " + t.toLocaleString('default', { month: 'short' })
        + ", " + hours + ":" + minutes + " " + ampm;
}

/**
 * In order to synchronize tooltips and crosshairs, override the
 * built-in events with handlers defined on the parent element.
 */
['mousemove', 'touchmove', 'touchstart'].forEach(function (eventType) {
    document.getElementById('sharedGrid').addEventListener(
        eventType,
        function (e) {
            var chart,
                point,
                i,
                event;

            for (i = 0; i < 3; i = i + 1) {
                chart = Highcharts.charts[i];
                console.log(i, chart.title.textStr);
                // Find coordinates within the chart
                event = chart.pointer.normalize(e);
                // Get the hovered point

                point = chart.series[0].searchPoint(event, true);

                if (point) {
                    point.highlight(e);
                    updatePieChart((globalCurrX - 1571580000) / 30 / 60 - 1);
                    updateLegend((globalCurrX - 1571580000) / 30 / 60 - 1);
                }
            }
        }
    );
});

/**
 * Override the reset function, we don't need to hide the tooltips and
 * crosshairs.
 */
Highcharts.Pointer.prototype.reset = function () {
    Highcharts.charts[3].innerText.element.textContent = "7020 MW";
    document.getElementById('sourcesSecond').innerHTML = '1,097';
    document.getElementById('windSecond').innerHTML = '81';
    document.getElementById('hydroSecond').innerHTML = '60';
    document.getElementById('gas_ccgtSecond').innerHTML = '65';
    document.getElementById('distillateSecond').innerHTML = '0.02';
    document.getElementById('black_coalSecond').innerHTML = '891';
    document.getElementById('loadsSecond').innerHTML = '-15';
    document.getElementById('exportsSecond').innerHTML = '-2';
    document.getElementById('pumpsSecond').innerHTML = '-12';
    document.getElementById('netSecond').innerHTML = '1,083';

    document.getElementById('windThird').innerHTML = '7.5%';
    document.getElementById('hydroThird').innerHTML = '5.5%';
    document.getElementById('gas_ccgtThird').innerHTML = '6.0%';
    document.getElementById('distillateThird').innerHTML = '0.002%';
    document.getElementById('black_coalThird').innerHTML = '82.3%';
    document.getElementById('exportsThird').innerHTML = '-0.2%';
    document.getElementById('pumpsThird').innerHTML = '-1.1%';
    document.getElementById('renewablesThird').innerHTML = '13.0%';

    document.getElementById('sourcesLast').innerHTML = '$58.62';
    document.getElementById('windLast').innerHTML = '$56.43';
    document.getElementById('hydroLast').innerHTML = '$63.96';
    document.getElementById('gas_ccgtLast').innerHTML = '$60.22';
    document.getElementById('distillateLast').innerHTML = '$57.42';
    document.getElementById('black_coalLast').innerHTML = '$59.01';
    document.getElementById('exportsLast').innerHTML = '$65.36';
    document.getElementById('pumpsLast').innerHTML = '$46.49';

    return undefined;
};

/**
 * Highlight a point by showing tooltip, setting hover state and draw crosshair
 */
Highcharts.Point.prototype.highlight = function (event) {
    event = this.series.chart.pointer.normalize(event);
    this.onMouseOver(); // Show the hover marker
    globalCurrX = this.x;
    this.series.chart.tooltip.refresh([this]); // Show the tooltip
    this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
};

/**
 * Synchronize zooming through the setExtremes event handler.
 */
function syncExtremes(e) {
    var thisChart = this.chart;

    if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
        Highcharts.each(Highcharts.charts, function (chart) {
            if (chart !== thisChart) {
                if (chart.xAxis[0].setExtremes) { // It is null while updating
                    chart.xAxis[0].setExtremes(
                        e.min,
                        e.max,
                        undefined,
                        false,
                        { trigger: 'syncExtremes' }
                    );
                }
            }
        });
    }
}

// function to do deep-copy on the global data structure
function updateGlobalEnergyData(data) {
    globalEnergyData['values'] = [];
    for (let idx = 0; idx < data['series'][0]['data'].length; idx ++) {
        let energyBreakup = data['series'].map(elm => {return elm['data'][idx]});
        globalEnergyData['values'].push(energyBreakup);
    }
    globalEnergyData['keys'] = data['series'].map(elm => elm['name']);
    console.log("Success at logging global energy data!", globalEnergyData);
}

// the nodeId is basically the x-axis value
// the actual breakup is retrieved from the global data-structure
function renderPieChart(nodeId) {
    let pieData = {
        chart: {
            type: 'pie',
            backgroundColor: '#ece9e6',
        },
        title: {
            text: ""
        },
        plotOptions: {
            pie: {
                borderWidth: 6,
                innerSize: '60%',
                size: '100%',
                stacking: 'normal',
                dataLabels: {
                    enabled: false,
                },
                animation: {
                    duration: 10
                },
                borderColor: '#ece9e6',
            },
            series: {
                states: {
                    inactive: {
                        opacity: 1
                    }
                }
            }
        },
        tooltip: {
            formatter: function () {
                console.log(this.point.name);
                console.log(this.y);
                return this.point.name + " " + this.y * globalPieSum;
            }
        },
        colors: ['#121212', '#F35020', '#FFCD96', '#4582B4',
            //'#88AFD0',
            '#417505',
            //'#977AB1'
        ]
    };
    let pieSeries = globalEnergyData['keys'].map(function(elm, idx) {
        if (globalEnergyData['keys'][idx] !== 'pumps' && globalEnergyData['keys'][idx] !== 'exports') {
            globalPieSum = globalPieSum + globalEnergyData['values'][nodeId][idx][1];
        }
        return {
            name: globalEnergyData['keys'][idx],
            y: globalEnergyData['values'][nodeId][idx][1]
        };
    });

    for (var i = 0; i < pieSeries.length; i = i + 1) {
        if (pieSeries[i]['name'] === 'pumps' || pieSeries[i]['name'] === 'exports'){
            pieSeries.splice(i, 1);
        }
    }

    for (let i = 0; i < pieSeries.length; i = i + 1) {
        pieSeries[i]['y'] = pieSeries[i]['y'] / globalPieSum;
    }

    console.log(pieSeries);
    pieData['series'] = [
        {
            name: "pieData",
            data: pieSeries
        }
    ];

    console.log('PIE TIME', pieData);
    var pie_boi = document.getElementById('pieGrid');
    Highcharts.chart(pie_boi, pieData,
        function(chart) { // on complete

            // Render the text
            chart.innerText = chart.renderer.text(Math.round(globalPieSum).toLocaleString() + ' MW',
                (chart.plotWidth - 200) / 2, (chart.plotHeight) / 2 + 40).css({
                color: '#473E34',
                fontSize: '50px',
                textAlign: 'center'
            }).attr({
                // why doesn't zIndex get the text in front of the chart?
                zIndex: 999
            }).add();
        });
    console.log('ACTUAL PIE', Highcharts.charts[3]);
}

function updatePieChart(nodeId) {
    globalPieSum = 0;
    console.log(nodeId, globalEnergyData);
    var newPieSeries = globalEnergyData['keys'].map(function(elm, idx) {
        if (globalEnergyData['keys'][idx] !== 'pumps' && globalEnergyData['keys'][idx] !== 'exports') {
            globalPieSum = globalPieSum + globalEnergyData['values'][nodeId][idx][1];
        }
        return {
            name: globalEnergyData['keys'][idx],
            y: globalEnergyData['values'][nodeId][idx][1]
        };
    });

    for (var i = 0; i < newPieSeries.length; i = i + 1) {
        if (newPieSeries[i]['name'] === 'pumps' || newPieSeries[i]['name'] === 'exports'){
            newPieSeries.splice(i, 1);
        }
    }

    for (let i = 0; i < newPieSeries.length; i = i + 1) {
        newPieSeries[i]['y'] = newPieSeries[i]['y'] / globalPieSum;
    }

    console.log(newPieSeries);
    console.log(Highcharts.charts[3]);
    Highcharts.charts[3].series[0].setData(newPieSeries, true,{
        duration: 10
    }, true);
    Highcharts.charts[3].innerText.element.textContent = String(Math.round(globalPieSum).toLocaleString()) + ' MW';

    console.log('UPDATED PIE', Highcharts.charts[3]);
}

function updateLegend(nodeId) {
    var endDate = document.getElementById('endDate');
    var seconds = ((nodeId + 1) * 60 * 30) + 1571580000;
    endDate.innerHTML = x_to_date(seconds);

    var plainOrder = ['wind', 'hydro', 'gas_ccgt', 'distillate',
                        'black_coal', 'exports', 'pumps'];
    var currPower,
        currIdx,
        currContribution;
    var sourcePower = 0;
    var net = 0;
    var loads = 0;
    var renewables = 0;
    for (var i = 0; i < plainOrder.length; i = i + 1) {
        for (var j = 0; globalEnergyData['keys'].length; j = j + 1) {
            if (globalEnergyData['keys'][j] === plainOrder[i]) {
                currIdx = j;
                break;
            }
        }
        currPower = document.getElementById(plainOrder[i] + 'Second');
        currPower.innerHTML = globalEnergyData['values'][nodeId][currIdx][1];
        if (plainOrder[i] === 'exports' || plainOrder[i] === 'pumps') {
            net -= Number(currPower.innerHTML);
            loads -= Number(currPower.innerHTML);
        }
        else {
            net += Number(currPower.innerHTML);
            sourcePower += Number(currPower.innerHTML);
        }
        if (currPower.innerHTML === "0") {
            currPower.innerHTML = "-";
        }
    }
    document.getElementById('sourcesSecond').innerHTML =
        Math.round(sourcePower).toLocaleString();
    document.getElementById('netSecond').innerHTML =
        Math.round(net).toLocaleString();
    if (loads === 0) {
        document.getElementById('loadsSecond').innerHTML = "-";
    }
    else {
        document.getElementById('loadsSecond').innerHTML =
            (Math.round(loads) * -1).toLocaleString();
    }
    for (var i = 0; i < plainOrder.length; i = i + 1) {
        currPower = document.getElementById(plainOrder[i] + 'Second');
        currContribution =  document.getElementById(plainOrder[i] + 'Third');
        if (currPower.innerHTML === '-') {
            currContribution.innerHTML = '-';
            continue;
        }
        else if (plainOrder[i] === 'distillate') {
            currContribution.innerHTML = (Number(currPower.innerHTML) / net * 100).toFixed(4) + "%";
        }
        else if (plainOrder[i] === 'exports') {
            currContribution.innerHTML = (Number(currPower.innerHTML) / net * 100).toFixed(2) + "%";
        }
        else {
            if (plainOrder[i] === 'wind' || plainOrder[i] === 'hydro') {
                renewables += (Number(currPower.innerHTML) / net * 100);
            }
            currContribution.innerHTML = (Number(currPower.innerHTML) / net * 100).toFixed(1) + "%";
        }
        currPower.innerHTML = Number(currPower.innerHTML).toLocaleString();
    }
    document.getElementById('sourcesLast').innerHTML = "$" + globalAVData[nodeId].toLocaleString() + ".00";
    document.getElementById('renewablesThird').innerHTML = renewables.toFixed(1) + "%";
}

function onSuccessCb(jsonData) {
    var energyData = {
        chart: {
            type: 'areaspline',
            backgroundColor: '#ece9e6',
            height: '800px'
        },
        title: {
            text: 'Generation MW',
            align: 'left',
            style: {
                fontSize: "40px"
            }
        },
        tooltip: {
            animation: false,
            shared: true,
            positioner: function () {
                return {
                    // right aligned
                    x: this.chart.chartWidth - this.label.width,
                    y: 10 // align to title
                };
            },
            borderWidth: 0,
            pointFormatter: function () {
                var t = new Date(1970, 0, 1); // Epoch
                t.setSeconds(this.x);

                var minutes = t.getMinutes();
                if (minutes < 10) minutes = '0' + minutes;
                var hours = t.getHours();
                if (hours < 12) var ampm = 'AM';
                if (hours >= 12) var ampm = 'PM';
                if (hours > 13) hours = String(Number(hours) - 12);
                if (hours < 10) hours = '0' + hours;
                console.log("SERIES NAME", this.series.name);
                return "<b>" + t.getDate() + " " + t.toLocaleString('default', { month: 'short' })
                    + ", " + hours + ":" + minutes + " " + ampm + "</b> Total <b>"
                    + Math.round(globalPieSum) + " BW</b>";
            },
            headerFormat: '',
            shadow: false,
            style: {
                fontSize: '24px'
            }
        },
        plotOptions: {
            series: {
                states: {
                    inactive: {
                        opacity: 1
                    }
                },
                stickyTracking: false
            }
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        xAxis: {
            crosshair: {
                color: '#F35020',
                width: 3
            },
            events: {
                setExtremes: syncExtremes
            },
            labels: {
                formatter: function () {
                    var t = new Date(1970, 0, 1); // Epoch
                    t.setSeconds(this.value);

                    var minutes = t.getMinutes();
                    if (minutes < 10) minutes = '0' + minutes;
                    var hours = t.getHours();
                    if (hours < 10) hours = '0' + hours;
                    if (hours < 12) var ampm = 'AM';
                    if (hours >= 12) var ampm = 'PM';
                    if (hours > 13) hours = String(Number(hours) - 12);
                    return weekday[t.getDay()] + "<br>" + t.getDate() + " "
                        + t.toLocaleString('default', { month: 'short' });
                },
                padding: 10,
                step: 3
            },
            alternateGridColor: '#E4E1DF',
            min: 1571580000,
            gridLineDashStyle: 'longdash',
            gridLineColor: '#DBDBDB'
        },
        yAxis: {
            title: {
                text: null
            },
            gridLineDashStyle: 'longdash',
            gridLineColor: '#DBDBDB',
            softMin: -1000
        },
        colors: ['#417505', '#4582B4', '#FFCD96', '#F35020', '#121212',
            '#121212',
            '#121212'
        ],
    };
    var energySeries = jsonData.filter(function(elm) {
        return elm['type'] === 'power' &&
            elm['id'] !== 'Springfield.fuel_tech.rooftop_solar.power';
    }).map(function(elm) {
        var new_interval_data = [];
        var currName = elm['id'].split('.')[elm['id'].split('.').length - 2];
        for (var i = 1; i < elm['history']['data'].length; i=i+6) {
            if (currName === 'pumps' || currName === 'exports') {
                new_interval_data.push([elm['history']['start'] + i * 60 * 5, -1 * elm['history']['data'][i]]);
            }
            else {
                new_interval_data.push([elm['history']['start'] + i * 60 * 5, elm['history']['data'][i]]);

            }
        }
        new_interval_data.pop();
        return {
                data: new_interval_data,
                stacking: 'normal',
                name: currName
            };
    });

    energyData['series'] = energySeries;

    console.log('energyData', energyData);
    updateGlobalEnergyData(energyData);

    var lastSeries = [];
    for (var i = 0; i < energyData.series.length; i = i + 1) {
        if (energyData.series[i].name === 'pumps' || energyData.series[i].name === 'exports'){
            lastSeries.push(energyData.series[i]);
            energyData.series.splice(i, 1);
        }
    }
    energyData['series'] = energyData['series'].reverse().concat(lastSeries);

    console.log('energyData', energyData);

    var priceData = jsonData.filter(function(elm) {
        return elm['type'] === 'price';
    }).map(function(elm) {
        var new_interval_data = [];
        for (var i = 1; i < elm['history']['data'].length; i=i+1) {
            new_interval_data.push([elm['history']['start'] + i * 60 * 30, elm['history']['data'][i]]);
            globalAVData.push(elm['history']['data'][i]);
        }
        return {
            chart: {
                type: 'line',
                backgroundColor: '#ece9e6',
                height: '400px'
            },
            title: {
                text: 'Price $/MWh',
                align: 'left',
                style: {
                    fontSize: "40px"
                }
            },
            tooltip: {
                animation: false,
                shared: true,
                positioner: function () {
                    return {
                        // right aligned
                        x: this.chart.chartWidth - this.label.width,
                        y: 10 // align to title
                    };
                },
                borderWidth: 0,
                pointFormat: '<b>${point.y}.00</b>',
                headerFormat: '',
                shadow: false,
                style: {
                    fontSize: '24px'
                }
            },
            plotOptions: {
                series: {
                    states: {
                        inactive: {
                            opacity: 1
                        }
                    }
                },
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            xAxis: {
                crosshair: {
                    color: '#F35020',
                    width: 3
                },
                alternateGridColor: '#E4E1DF',
                min: 1571580000,
                labels: false,
                gridLineDashStyle: 'longdash',
                gridLineColor: '#DBDBDB'
            },
            yAxis: {
                title: {
                    text: null
                },
                softMax: 500,
                gridLineDashStyle: 'longdash',
                gridLineColor: '#DBDBDB'
            },
            series: [{
                data: new_interval_data,
                step: 'right',
                stacking: 'normal',
                name: elm['id'].split('.')[elm['id'].split('.').length - 1]
            }],
            colors: ["#F35020"]
        };
    })[0];
    console.log('priceData', priceData);

    var tempData = jsonData.filter(function(elm) {
        return elm['type'] === 'temperature';
    }).map(function(elm) {
        var new_interval_data = [];
        for (var i = 1; i < elm['history']['data'].length; i=i+1) {
            new_interval_data.push([elm['history']['start'] + i * 60 * 30, elm['history']['data'][i]]);
        }
        return {
            chart: {
                type: 'spline',
                backgroundColor: '#ece9e6',
                height: '400px'
            },
            title: {
                text: 'Temperature \u00B0F',
                align: 'left',
                style: {
                    fontSize: "40px"
                }
            },
            tooltip: {
                animation: false,
                shared: true,
                positioner: function () {
                    return {
                        // right aligned
                        x: this.chart.chartWidth - this.label.width,
                        y: 10 // align to title
                    };
                },
                borderWidth: 0,
                pointFormat: 'Av <b>{point.y}\u00B0F</b>',
                headerFormat: '',
                shadow: false,
                style: {
                    fontSize: '24px'
                }
            },
            plotOptions: {
                series: {
                    states: {
                        inactive: {
                            opacity: 1
                        }
                    }
                }
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            xAxis: {
                crosshair: {
                    color: '#F35020',
                    width: 3
                },
                alternateGridColor: '#E4E1DF',
                min: 1571580000,
                labels: false,
                gridLineDashStyle: 'longdash',
                gridLineColor: '#DBDBDB'
            },
            yAxis: {
                title: {
                    text: null
                },
                softMin: 0,
                gridLineDashStyle: 'longdash',
                gridLineColor: '#DBDBDB'
            },
            series: [{
                data: new_interval_data,
                stacking: 'normal',
                name: elm['id'].split('.')[elm['id'].split('.').length - 1]
            }],
            colors: ["#F35020"]
        };
    })[0];
    console.log('tempData', tempData);

    var energyChartDiv = document.createElement('div');
    energyChartDiv.className = 'chart';
    document.getElementById('sharedGrid').appendChild(energyChartDiv);
    Highcharts.chart(energyChartDiv, energyData);

    var priceChartDiv = document.createElement('div');
    priceChartDiv.className = 'chart';
    document.getElementById('sharedGrid').appendChild(priceChartDiv);
    Highcharts.chart(priceChartDiv, priceData);

    var tempChartDiv = document.createElement('div');
    tempChartDiv.className = 'chart';
    document.getElementById('sharedGrid').appendChild(tempChartDiv);
    Highcharts.chart(tempChartDiv, tempData);
    renderPieChart(0);
    updateLegend(0);
}

// Utility function to fetch any file from the server
function fetchJSONFile(filePath, callbackFunc) {
    console.debug("Fetching file:", filePath);
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200 || httpRequest.status === 0) {
                console.info("Loaded file:", filePath);
                var data = JSON.parse(httpRequest.responseText);
                console.debug("Data parsed into valid JSON!");
                console.debug(data);
                if (callbackFunc) callbackFunc(data);
            } else {
                console.error("Error while fetching file", filePath,
                    "with error:", httpRequest.statusText);
            }
        }
    };
    httpRequest.open('GET', filePath);
    httpRequest.send();
}

fetchJSONFile('assets/springfield.json', onSuccessCb);