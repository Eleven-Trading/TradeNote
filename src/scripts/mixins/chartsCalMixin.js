const chartsCalMixin = {
    methods: {

        loadCalendar: async function(param) {
            console.log("\nLOADING CALENDAR")
            this.renderingCharts = true
            this.totalCalendarMounted = false
            var month
            var year

            var calCumulatedParam
            if (this.currentPage.id == "daily" ||  this.currentPage.id == 'calendar') {
                calCumulatedParam = parseInt(localStorage.getItem('calCumulatedParamDaily'))
            }
            if (this.currentPage.id == "videos") {
                calCumulatedParam = parseInt(localStorage.getItem('calCumulatedParamVideos'))
            }

            /* ---- 1: GET CALENDAR DATES ---- */
            await new Promise((resolve, reject) => {

                if (param == undefined) {
                    param = 0
                }
                this.selectedCalRange.start = dayjs.unix(this.selectedCalRange.start).add(param, 'month').startOf('month').unix()
                this.selectedCalRange.end = dayjs.unix(this.selectedCalRange.end).add(param, 'month').endOf('month').unix()

                month = dayjs.unix(this.selectedCalRange.start).get('month') + 1 //starts at 0
                year = dayjs.unix(this.selectedCalRange.start).get('year')
                localStorage.setItem('selectedCalRange', JSON.stringify(this.selectedCalRange))
                resolve()

            })

            /* ---- 2: CREATE CALENDAR ---- */
            var calendarizeData = calendarize(dayjs.unix(this.selectedCalRange.start).format("YYYY-MM-DD"), 1)
            console.log(" -> creating calendar data")
            var calendarJson = {}
            var i = 0
            calendarizeData.forEach(element => {
                calendarJson[i] = []
                element.forEach(element => {
                    // 1- Create a calendar date from each element (calendar number)
                    var elementDate = year + "/" + month + "/" + element
                    var elementDateUnix = dayjs(elementDate).unix()

                    // 2- Create data for each calendar box
                    tempData = {}
                    tempData.day = element // day number of the month
                    tempData.dateUnix = elementDateUnix // date in unix

                    //Using allTrades and not filteredTrades because we do not want calendar to be filtered
                    var trade = this.allTrades.filter(f => dayjs.unix(f.dateUnix).isSame(dayjs.unix(elementDateUnix), 'day')) // filter by finding the same day of month between calendar date and unix date in DB
                    if (trade.length && element != 0) { //Check also if not null because day in date cannot be 0
                        tempData.pAndL = trade[0].pAndL
                    } else {
                        tempData.pAndL = []
                    }
                    calendarJson[i].push(tempData)

                })
                i++
            })
            this.calendarData = calendarJson
            this.totalCalendarMounted = true
                //console.log("cal "+JSON.stringify(calendarJson))

            /* ---- 3: GET TRADES AND LOAD CHARTS ---- */

            //In dashboard, filter is dependant on the filter input on top of page
            //In daily, filter is dependant on the calendar

            //await 1 : create filtered trades
            await new Promise((resolve, reject) => {
                //console.log("all " + JSON.stringify(this.allTrades))
                if (param != 0) {
                    this.filteredTrades = this.allTrades.filter(f => f.dateUnix >= this.selectedCalRange.start && f.dateUnix < this.selectedCalRange.end);

                }
                this.filteredTrades.sort(function(a, b) {
                    return b.dateUnix - a.dateUnix
                })
                resolve()
            })
            if (this.currentPage.id == "videos") {
                await this.checkVideo()
            }

            // If you want await, you then need a promise. Await can only be placed inside async function

            //await 2 : re-render DOM in order to create new charts
            //await (this.renderData += 1)
            await (this.renderData += 1)
            if (this.currentPage.id == "daily") {

                //Rendering double line chart
                await this.filteredTrades.forEach(el => {
                    var chartId = 'doubleLineChart' + el.dateUnix
                    var chartDataGross = []
                    var chartDataNet = []
                    var chartCategories = []
                    el.trades.forEach(element => {
                        var proceeds = Number((element.grossProceeds).toFixed(2))
                        var proceedsNet = Number((element[this.amountCase + 'Proceeds']).toFixed(2))
                        if (chartDataGross.length == 0) {
                            chartDataGross.push(proceeds)
                        } else {
                            chartDataGross.push(chartDataGross.slice(-1).pop() + proceeds)
                        }

                        if (chartDataNet.length == 0) {
                            chartDataNet.push(proceedsNet)
                        } else {
                            chartDataNet.push(chartDataNet.slice(-1).pop() + proceedsNet)
                        }
                        chartCategories.push(this.hourMinuteFormat(element.exitTime))
                        this.doubleLineChart(chartId, chartDataGross, chartDataNet, chartCategories)
                    });
                })

                //Rendering pie chart
                await this.filteredTrades.forEach(el => {
                    var chartId = "pieChart" + el.dateUnix
                    var probWins = (el.pAndL[this.amountCase + 'WinsCount'] / el.pAndL.trades)
                    var probLoss = (el.pAndL[this.amountCase + 'LossCount'] / el.pAndL.trades)
                        //var probNetWins = (el.pAndL.netWinsCount / el.pAndL.trades)
                        //var probNetLoss = (el.pAndL.netLossCount / el.pAndL.trades)
                        //console.log("prob net win " + probNetWins + " and loss " + probNetLoss)
                    this.pieChart(chartId, probWins, probLoss, this.currentPage.id)
                })
            }

            await (this.renderingCharts = false)

        },


        doubleLineChart(param1, param2, param3, param4) { //chartID, chartDataGross, chartDataNet, chartCategories
            return new Promise((resolve, reject) => {
                var myChart = echarts.init(document.getElementById(param1));
                option = {
                        tooltip: {
                            trigger: 'axis',
                            formatter: (params) => {
                                var gross
                                var net
                                var time
                                params.forEach((element, index) => {
                                    if (index == 0) {
                                        gross = element.value.toFixed(0) + "$"
                                        time = element.name
                                    }
                                    if (index == 1) {
                                        net = element.value.toFixed(0) + "$"
                                    }
                                });
                                //console.log("params "+JSON.stringify(params[0][0]))
                                return time + "<br>Gross: " + gross + "<br>Net: " + net

                            }
                        },
                        axisLabel: {

                        },
                        xAxis: {
                            data: param4,
                            name: '0',
                            nameLocation: 'start',
                        },
                        yAxis: {
                            type: 'value',
                            /*scale: true,
                            max: function(value) {
                                return value.max;
                            },
                            min: function(value) {
                                return value.min;
                            },*/
                            axisLabel: {
                                show: false,
                                formatter: function(params) {
                                    return params.toFixed(0) + "$"
                                }
                            },
                            splitLine: {
                                show: false
                            },
                        },
                        series: [{
                                data: param2,
                                showSymbol: false, //removes dot on line
                                type: 'line',
                                smooth: true,
                                itemStyle: {
                                    color: '#35C4FE',
                                },
                                emphasis: {
                                    itemStyle: {
                                        color: '#01B4FF'
                                    }
                                },
                            },
                            {
                                data: param3,
                                showSymbol: false, //removes dot on line
                                type: 'line',
                                smooth: true,
                                itemStyle: {
                                    color: '#9AE3FD',
                                },
                                emphasis: {
                                    itemStyle: {
                                        color: '#9AE3FD'
                                    }
                                },
                            }
                        ],
                    },
                    myChart.setOption(option);
                resolve()
            })
        },

        lineBarChart() {
            return new Promise((resolve, reject) => {
                var myChart = echarts.init(document.getElementById('lineBarChart1'));
                var chartData = []
                var chartBarData = []
                var chartXAxis = []
                objectY = JSON.parse(JSON.stringify(this.totalsByDate))
                const keys = Object.keys(objectY);
                for (const key of keys) {
                    var element = objectY[key]

                    var proceeds = element[this.amountCase + 'Proceeds']

                    if (keys.length <= this.maxChartValues) {
                        var temp = {}
                        temp.value = proceeds
                        temp.label = {}
                        temp.label.show = true
                        if (proceeds >= 0) {
                            temp.label.position = 'top'
                        } else {
                            temp.label.position = 'bottom'
                        }
                        temp.label.formatter = function(params) {
                            return (params.value).toFixed(0) + "$"
                        }
                        chartBarData.push(temp)
                    } else {
                        chartBarData.push(proceeds)
                    }


                    if (chartData.length == 0) {
                        chartData.push(proceeds)
                    } else {
                        chartData.push(chartData.slice(-1).pop() + proceeds)
                    }
                    chartXAxis.push(this.chartFormat(key))
                        //chartXAxis = _.takeRight(chartXAxis, this.maxChartValues);
                        //chartData = _.takeRight(chartData, this.maxChartValues);
                        //chartBarData = _.takeRight(chartBarData, this.maxChartValues);

                }
                option = {
                    tooltip: {
                        trigger: 'axis',
                        formatter: (params) => {
                            var proceeds
                            var cumulProceeds
                            var date
                            params.forEach((element, index) => {
                                if (index == 0) {
                                    cumulProceeds = element.value.toFixed(0) + "$"
                                    date = element.name
                                }
                                if (index == 1) {
                                    proceeds = element.value.toFixed(0) + "$"
                                }
                            });
                            //console.log("params "+JSON.stringify(params[0][0]))
                            return date + "<br>Proceeds: " + proceeds + "<br>Cumulated: " + cumulProceeds

                        }
                    },
                    axisLabel: {
                        interval: 1000,
                    },
                    xAxis: {
                        type: 'category',
                        data: chartXAxis,
                    },
                    yAxis: {
                        type: 'value',
                        axisLabel: {
                            formatter: function(params) {
                                return params.toFixed(0) + "$"
                            }
                        },
                    },
                    series: [{
                            data: chartData,
                            type: 'line',
                            smooth: true,
                            itemStyle: {
                                color: '#35C4FE',
                            },
                            emphasis: {
                                itemStyle: {
                                    color: '#01B4FF'
                                }
                            },
                        },
                        {
                            data: chartBarData,
                            type: 'bar',
                            smooth: true,
                            itemStyle: {
                                color: '#35C4FE',
                            },
                            emphasis: {
                                itemStyle: {
                                    color: '#01B4FF'
                                }
                            },
                        }
                    ]
                }
                myChart.setOption(option);
                resolve()
            })
        },

        pieChart(param1, param2, param3, param4) { //chart ID, winShare, lossShare, page
            return new Promise((resolve, reject) => {
                //console.log("params " + param1 + ", " + param2 + ", " + param3)
                var myChart = echarts.init(document.getElementById(param1));
                var winShare = param2
                var lossShare = param3
                option = {
                    series: [{
                            type: 'pie',
                            radius: ['70%', '100%'],
                            avoidLabelOverlap: false,
                            data: [
                                { value: winShare, name: "Win Share" },
                                { value: lossShare, name: "Loss Share" },
                            ],
                            itemStyle: {
                                color: function(params) {
                                    if (params.dataIndex == 0) {
                                        return '#00CA73'
                                    }
                                    if (params.dataIndex == 1) {
                                        return '#f2f2f4'
                                    }
                                }
                            },
                            label: {
                                show: true,
                                position: 'center',
                                formatter: function(params) {
                                    if (param4 == "dashboard") {
                                        return (winShare * 100).toFixed(1) + "%\nWin rate(n)"
                                    }
                                    if (param4 == "daily") {
                                        return (winShare * 100).toFixed(1) + "%"
                                    }
                                }
                            }
                        },

                    ]
                };
                myChart.setOption(option);
                resolve()
            })
        },

        barChart(param1) {
            console.log("\nBAR CHART")
            return new Promise((resolve, reject) => {
                var chartData = []
                var chartXAxis = []
                    //console.log("totals " + JSON.stringify(this.totalsByDate))
                objectY = JSON.parse(JSON.stringify(this.totalsByDate))
                const keys = Object.keys(objectY);
                for (const key of keys) {
                    var element = objectY[key]

                    var probNetWins = (element.netWinsCount / element.trades)
                    var probNetLoss = (element.netLossCount / element.trades)

                    var avgNetWins = element.netWinsCount == 0 ? 0 : (element.netWins / element.netWinsCount)
                    var avgNetLoss = element.netLossCount == 0 ? 0 : -(element.netLoss / element.netLossCount)

                    var appt = (probNetWins * avgNetWins) - (probNetLoss * avgNetLoss)
                        //console.log("appt "+appt+" probNetWins "+probNetWins+" avgNetWins "+avgNetWins+" probNetLoss "+probNetLoss+" avgNetLoss "+avgNetLoss+ " element.netWinsCount "+element.netWinsCount+" element.netLossCount "+element.netLossCount)

                    if (param1 == "barChart1") {
                        if (keys.length <= this.maxChartValues) {
                            var temp = {}
                            temp.value = appt
                            temp.label = {}
                            temp.label.show = true
                            if (appt >= 0) {
                                temp.label.position = 'top'
                            } else {
                                temp.label.position = 'bottom'
                            }
                            temp.label.formatter = function(params) {
                                return (params.value).toFixed(1) + "$"
                            }
                            chartData.push(temp)
                        } else {
                            chartData.push(appt)
                        }
                    }
                    if (param1 == "barChart2") {
                        if (keys.length <= this.maxChartValues) {
                            var temp = {}
                            temp.value = probNetWins
                            temp.label = {}
                            temp.label.show = true
                            temp.label.position = 'top'
                            temp.label.formatter = function(params) {
                                return (params.value * 100).toFixed(1) + "%"
                            }
                            chartData.push(temp)
                        } else {
                            chartData.push(probNetWins)
                        }

                    }

                    chartXAxis.push(this.chartFormat(key))
                }
                var myChart = echarts.init(document.getElementById(param1));
                option = {
                    xAxis: {
                        type: 'category',
                        data: chartXAxis
                    },
                    yAxis: {
                        type: 'value',
                        axisLabel: {
                            formatter: function(params) {
                                if (param1 == "barChart2") {
                                    return (params * 100).toFixed(0) + "%"
                                }
                                if (param1 == "barChart1") {
                                    return (params).toFixed(0) + "$"
                                }
                            }
                        },
                    },
                    series: [{
                        data: chartData,
                        type: 'bar',
                        itemStyle: {
                            color: '#35C4FE',
                        },
                        emphasis: {
                            itemStyle: {
                                color: '#01B4FF'
                            }
                        },
                    }],
                    tooltip: {
                        trigger: 'axis',
                        formatter: function(params) {
                            if (param1 == "barChart2") {
                                return params[0].name + ": " + (params[0].value * 100).toFixed(1) + "%"
                            }
                            if (param1 == "barChart1") {
                                return params[0].name + ": " + (params[0].value).toFixed(1) + "$"
                            }
                        }
                    },
                };
                myChart.setOption(option);
                resolve()
            })
        },

        barChartNegative(param1) {
            console.log("\nBAR CHART NEGATIVE (" + param1 + ")")
            return new Promise((resolve, reject) => {
                var yAxis = []
                var series = []
                if (param1 == "barChartNegative1" || param1 == "barChartNegative2" || param1 == "barChartNegative3") {
                    var keyObject = this.groups.timeframe
                }
                if (param1 == "barChartNegative4" || param1 == "barChartNegative5" || param1 == "barChartNegative6") {
                    var keyObject = this.groups.trades
                }
                if (param1 == "barChartNegative7" || param1 == "barChartNegative8" || param1 == "barChartNegative9") {
                    var keyObject = this.groups.executions
                }
                if (param1 == "barChartNegative10") {
                    const toRemove = ['null', 'undefined'];
                    var keyObject = _.omit(this.groups.patterns, toRemove)
                        //console.log("filtered "+JSON.stringify(keyObject))
                }
                if (param1 == "barChartNegative11") {
                    const toRemove = ['null', 'undefined'];
                    var keyObject = _.omit(this.groups.entrypoints, toRemove)
                        //console.log("filtered "+JSON.stringify(filteredObj))
                }

                if (param1 == "barChartNegative12") {
                    var keyObject = this.groups.shareFloat
                }

                if (param1 == "barChartNegative13") {
                    var keyObject = this.groups.entryPrice
                }

                if (param1 == "barChartNegative14") {
                    var keyObject = this.groups.mktCap
                }

                const keys = Object.keys(keyObject);

                //console.log("object " + JSON.stringify(keyObject))
                //console.log("keys " + JSON.stringify(keys))
                for (const key of keys) {
                    //console.log("key " + JSON.stringify(key))
                    if (param1 == "barChartNegative10") {
                        var patterns = this.patterns.find(item => item.id === key)
                            //console.log("pattern name " + JSON.stringify(patterns))
                        yAxis.push(patterns.name) // unshift because I'm only able to sort timeframe ascending

                    } else if (param1 == "barChartNegative11") {
                        var entrypoint = this.entrypoints.find(item => item.id === key)
                            //console.log("entrypoint" + JSON.stringify(entrypoint))
                        yAxis.push(entrypoint.name)

                    } else {
                        yAxis.unshift(key) // unshift because I'm only able to sort timeframe ascending
                    }
                    //console.log("yaxis "+JSON.stringify(yAxis))

                    var winsCount = 0
                    var lossCount = 0
                    var wins = 0
                    var loss = 0
                    var trades = 0
                    var numElements = keyObject[key].length
                        //console.log("num elemnets " + numElements)
                    keyObject[key].forEach((element, index) => {
                        //console.log("index " + index)
                        //console.log("element " + JSON.stringify(element))
                        winsCount += element[this.amountCase + 'WinsCount']
                        lossCount += element[this.amountCase + 'LossCount']
                        wins += element[this.amountCase + 'Wins']
                        loss += element[this.amountCase + 'Loss']
                        if (param1 == "barChartNegative4") {
                            trades += element.trades
                        } else {
                            trades += element.tradesCount
                        }
                        //console.log("wins count "+element.winsCount+", loss count "+element.lossCount+", wins "+element.wins+", loss "+element.netLoss+", trades "+element.tradesCount)
                        if (numElements == (index + 1)) {
                            if (trades > 0) {
                                var probWins = (winsCount / trades)
                                var probLoss = (lossCount / trades)
                            } else {
                                var probWins = 0
                                var probLoss = 0
                            }

                            if (winsCount > 0) {
                                var avgWins = (wins / winsCount)
                            } else {
                                var avgWins = 0
                            }

                            if (lossCount > 0) {
                                var avgLoss = -(loss / lossCount)
                            } else {
                                var avgLoss = 0
                            }

                            var appt = (probWins * avgWins) - (probLoss * avgLoss)
                                //console.log("APPT " + appt)
                            if (param1 == "barChartNegative1" || param1 == "barChartNegative4" || param1 == "barChartNegative7" || param1 == "barChartNegative12" || param1 == "barChartNegative13" || param1 == "barChartNegative14") {
                                series.unshift(appt)
                            }
                            if (param1 == "barChartNegative2" || param1 == "barChartNegative5" || param1 == "barChartNegative8") {
                                series.unshift(avgWins)
                            }
                            if (param1 == "barChartNegative3" || param1 == "barChartNegative6" || param1 == "barChartNegative9") {
                                series.unshift(avgLoss)
                            }
                            if (param1 == "barChartNegative10" || param1 == "barChartNegative11") {
                                series.push(appt)
                            }
                        }
                    })
                }
                if (param1 == "barChartNegative10" || param1 == "barChartNegative11") {
                    //1) combine the arrays:
                    var list = [];
                    for (var j = 0; j < series.length; j++)
                        list.push({ 'appt': series[j], 'name': yAxis[j] });

                    //2) sort:
                    list.sort(function(a, b) {
                        return ((a.appt < b.appt) ? -1 : ((a.appt == b.appt) ? 0 : 1));
                        //Sort could be modified to, for example, sort on the age 
                        // if the name is the same.
                    });

                    //3) separate them back out:
                    for (var k = 0; k < list.length; k++) {
                        series[k] = list[k].appt;
                        yAxis[k] = list[k].name;
                    }


                    /*var indices = Array.from(series.keys()).sort((a, b) => series[a] > series[b])

                    var sortedAPPT = indices.map(i => series[i])
                    var sortedName = indices.map(i => yAxis[i])*/


                    //console.log("Sorted APPT " + JSON.stringify(series)+" and names "+JSON.stringify(yAxis))

                }

                var myChart = echarts.init(document.getElementById(param1));
                option = {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        },
                        formatter: (params) => {
                            //console.log("params "+JSON.stringify(params[0].value))
                            if (param1 == "barChartNegative12" || param1 == "barChartNegative13" || param1 == "barChartNegative14"){
                                return "APPT: "+(params[0].value).toFixed(2)+"$"
                            }
                            

                        }
                    },
                    grid: {
                        top: 80,
                        bottom: 30,
                        containLabel: true // or else the yaxis labels are cutout
                    },
                    xAxis: {
                        type: 'value',
                        position: 'bottom',
                        splitLine: {
                            lineStyle: {
                                type: 'dashed'
                            }
                        },
                    },
                    yAxis: {
                        type: 'category',
                        axisLine: { show: false },
                        axisLabel: { show: true },
                        axisTick: { show: false },
                        splitLine: { show: false },
                        data: yAxis,
                        axisLabel: {
                            formatter: function(params) {
                                if (param1 == "barChartNegative4" || param1 == "barChartNegative5" || param1 == "barChartNegative6") {
                                    if (params <= 30) {
                                        var range
                                        if (params <= 5) {
                                            range = 5
                                        } else {
                                            range = 4
                                        }
                                        return (params - range) + "-" + params
                                    }
                                    if (params > 30) {
                                        return "+30"
                                    }
                                } else if (param1 == "barChartNegative13") {
                                    //console.log("params "+params)
                                    if (params < 30) {
                                        if (params < 5) {
                                            return "0-4.99$"
                                        } else {
                                            return params + "-" + (Number(params) + 4.99).toFixed(2) +"$"
                                        }
                                    }
                                    if (params >= 30) {
                                        return "+30$"
                                    }
                                }
                                
                                else if (param1 == "barChartNegative12") {
                                    params = params / 1000000
                                    if (params < 50) {
                                        var range = 10
                                        if (params <= 10) {
                                            return (params - range) + "-" + params + "M"
                                        } else {
                                            return (params - range) + "M-" + params + "M"
                                        }
                                    }
                                    if (params >= 50) {
                                        return "+50M"
                                    }
                                } else if (param1 == "barChartNegative14") {
                                    params = params / 1000000
                                    if (params <= 50) {
                                        return "Nano-cap (0-" + params + "M)"
                                    }
                                    if (params > 50 && params <= 300) {
                                        return "Micro-cap (50M-" + params + "M)"
                                    }
                                    if (params > 300 && params <= 2000) {
                                        return "Small-cap (300M-" + params/1000 + "B)"
                                    }
                                    if (params > 2000 && params <= 10000) {
                                        return "Mid-cap (2B-" + params/1000 + "B)"
                                    }else{
                                        return "Big-cap (+10B)"
                                    }
                                } else {
                                    return params
                                }
                            }
                        },
                    },
                    series: [{
                        type: 'bar',
                        itemStyle: {
                            color: '#35C4FE',
                        },
                        label: {
                            show: false,
                            formatter: '{b}'
                        },
                        data: series
                    }]
                };
                myChart.setOption(option);
                resolve()
            })
        },

        boxPlotChart() {
            console.log("\nBOXPLOT CHART")
            return new Promise((resolve, reject) => {
                //console.log("totals "+JSON.stringify(this.filteredTrades))
                var myChart = echarts.init(document.getElementById('boxPlotChart1'));
                var dateArray = []
                var dataArray = []
                this.filteredTrades.forEach(element => {
                    temp = {}
                    var listGrossSharePL = []
                    element.trades.forEach(element => {
                        listGrossSharePL.push(element.grossSharePL)
                    });
                    //console.log("gross list " + listGrossSharePL)

                    //Sorting list



                    //Getting date
                    var date = this.chartFormat(element.dateUnix)
                        //console.log("data "+listGrossSharePL)
                    dateArray.push(date)
                    dataArray.push(listGrossSharePL)
                });
                // specify chart configuration item and data
                option = {
                    dataset: [{
                        source: dataArray
                    }, {
                        transform: {
                            type: 'boxplot',
                            config: {
                                itemNameFormatter: function(params) {
                                    return dateArray[params.value];
                                }
                            }
                        }
                    }, {
                        fromDatasetIndex: 1,
                        fromTransformResult: 1
                    }],
                    tooltip: {
                        trigger: 'item',
                        axisPointer: {
                            type: 'shadow'
                        },
                        formatter: function(params) {
                            if (params.componentIndex == 0) {
                                return 'Maximum: ' + params.value[5].toFixed(2) + '$<br/>' +
                                    'Upper quartile: ' + params.value[4].toFixed(2) + '$<br/>' +
                                    'Median: ' + params.value[3].toFixed(2) + '$<br/>' +
                                    'Lower quartile: ' + params.value[2].toFixed(2) + '$<br/>' +
                                    'Minimum: ' + params.value[1].toFixed(2) + '$<br/>'
                            }
                            if (params.componentIndex == 1) {
                                return 'Outlier: ' + params.value[1].toFixed(2) + '$'
                            }
                        }
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: true,
                        nameGap: 30,
                        splitArea: {
                            show: false
                        },
                        splitLine: {
                            show: false
                        }
                    },
                    yAxis: {
                        type: 'value',
                        splitArea: {
                            show: true
                        },
                        axisLabel: {
                            formatter: function(params) {
                                return params.toFixed(2) + "$"
                            }
                        },
                    },

                    series: [{
                            name: 'boxplot',
                            type: 'boxplot',
                            datasetIndex: 1,
                            itemStyle: {
                                borderColor: "#01B4FF"
                            },
                            emphasis: {
                                label: {
                                    show: true
                                }
                            },
                        },
                        {
                            name: 'outlier',
                            type: 'scatter',
                            datasetIndex: 2,
                            itemStyle: {
                                color: '#6c757d',
                            }
                        }
                    ]
                };
                myChart.setOption(option);
                resolve()
            })
        },
    }
}