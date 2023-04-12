const forecastMixin = {
    data() {
        return {
            scenarios: [],
            forecast: [],
        }
    },
    watch: {

    },
    mounted() {

    },
    methods: {
        getScenarios: async function() {
            return new Promise(async(resolve, reject) => {
                console.log(" -> Getting scenarios");
                const Object = Parse.Object.extend("scenarios");
                const query = new Parse.Query(Object);
                query.equalTo("user", Parse.User.current());
                query.descending("dateUnix");
                query.limit(this.queryLimit); // limit to at most 10 results
                this.scenarios = []
                const results = await query.find();
                this.scenarios = JSON.parse(JSON.stringify(results))
                    //console.log(" -> Scenarios " + JSON.stringify(this.scenarios))
                resolve()
            })
        },

        createForecast: async function() {
            return new Promise(async(resolve, reject) => {
                let scenario = this.scenarios[0]
                //console.log("scenario " + JSON.stringify(scenario))
                let dates = []
                for (let index = 0; index < scenario.duration; index++) {
                    let dateUnix = dayjs(scenario.dateUnix * 1000).add(index, 'month')
                    dates.push(dayjs(dateUnix).unix())
                }
                let diffAvgWinShare = scenario.scenario.avgWinShare.end - scenario.scenario.avgWinShare.start
                let diffAvgLossShare = scenario.scenario.avgLossShare.end - scenario.scenario.avgLossShare.start
                let diffWinProb = scenario.scenario.winProb.end - scenario.scenario.winProb.start
                let diffSize = scenario.scenario.size.end - scenario.scenario.size.start
                let diffNumTrades = scenario.scenario.numTrades.end - scenario.scenario.numTrades.start
                let diffNumExecs = scenario.scenario.numExecs.end - scenario.scenario.numExecs.start

                let avgWinShare = scenario.scenario.avgWinShare.start
                let avgLossShare = scenario.scenario.avgLossShare.start
                let winProb = scenario.scenario.winProb.start
                let numTrades = scenario.scenario.numTrades.start
                let numExecs = scenario.scenario.numExecs.start
                let mult = 0
                let size = scenario.scenario.size.start

                let pAndLNetCumul = {}
                pAndLNetCumul.est = 0

                dates.forEach((element, index) => {
                    let temp = {}
                    temp.dateUnix = element
                    temp.days = 20

                    temp.avgWinShare = {}
                    avgWinShare += diffAvgWinShare / scenario.duration
                    temp.avgWinShare.est = avgWinShare

                    temp.avgLossShare = {}
                    avgLossShare += diffAvgLossShare / scenario.duration
                    temp.avgLossShare.est = avgLossShare

                    temp.winProb = {}
                    winProb += diffWinProb / scenario.duration
                    temp.winProb.est = winProb

                    temp.lossProb = {}
                    temp.lossProb.est = 1 - temp.winProb.est

                    temp.size = {}
                    //console.log("index " + index + " size " + (size + (2 * scenario.scenario.size.start)))

                    if (index === 0 && index < 3) {
                        temp.size.est = scenario.scenario.size.start
                    } if (index === 3 && index < 6 && size <= scenario.scenario.size.end) {
                        mult = 1
                    } if (index === 6 && index < 9 && size <= scenario.scenario.size.end) {
                        mult = 2
                    } if (index === 9 && index < 12 && size <= scenario.scenario.size.end) {
                        mult = 3
                    } if (index === 12 && index < 15 && size <= scenario.scenario.size.end) {
                        mult = 4
                    } if (index === 15 && index < dates.length && size <= scenario.scenario.size.end) {
                        mult = 5
                    } 
                    if (index === dates.length || size >= scenario.scenario.size.end) {
                        mult = 0
                        size = scenario.scenario.size.end
                    }

                    if (mult != 0){
                        size += (mult * scenario.scenario.size.start)
                    }
                    if (size <= scenario.scenario.size.end){
                        temp.size.est = size
                    }else{
                        temp.size.est = scenario.scenario.size.end
                    }

                    temp.numTrades = {}
                    numTrades += diffNumTrades / scenario.duration
                    temp.numTrades.est = numTrades

                    /*temp.numExecs = {}
                    numExecs += diffNumExecs / scenario.duration
                    temp.numExecs.est = numExecs

                    temp.numInnExecs = {}
                    temp.numInnExecs.est = 1

                    temp.numOutExecs = {}
                    temp.numOutExecs.est = temp.numExecs.est - temp.numInnExecs.est

                    temp.sizeTradeOut = {}
                    temp.sizeTradeOut.est = temp.size.est / temp.numOutExecs.est*/

                    temp.tradesMonth = {}
                    temp.tradesMonth.est = temp.numTrades.est * temp.days

                    temp.grossWins = {}
                    temp.grossWins.est = temp.tradesMonth.est * temp.size.est * temp.winProb.est * temp.avgWinShare.est

                    temp.grossLoss = {}
                    temp.grossLoss.est = temp.tradesMonth.est * temp.size.est * temp.lossProb.est * temp.avgLossShare.est

                    temp.commissions = {}
                    temp.commissions.est = temp.tradesMonth.est * temp.size.est * 2 * scenario.commissions.fee

                    temp.pAndLGross = {}
                    temp.pAndLGross.est = temp.grossWins.est - temp.grossLoss.est

                    temp.pAndLNet = {}
                    temp.pAndLNet.est = temp.pAndLGross.est - temp.commissions.est

                    pAndLNetCumul.est += temp.pAndLNet.est
                    temp.pAndLNetCumul = {}
                    temp.pAndLNetCumul.est = pAndLNetCumul.est

                    this.forecast.push(temp)
                });
                //console.log("forecast "+JSON.stringify(this.forecast))
                resolve()
            })
        },

        linesChartForecast(param) {
            return new Promise((resolve, reject) => {
                var myChart = echarts.init(document.getElementById("lineBarChartForecast"));
                var chartDataEst = []
                var chartXAxis = []
                var i = 1

                let objectY = JSON.parse(JSON.stringify(this.forecast))
                const keys = Object.keys(objectY);

                for (const key of keys) {
                    var element = objectY[key]
                    //console.log("element " + JSON.stringify(element.pAndLNet.est))

                    var pushingChartDataEst = () => {
                        chartDataEst.push(element.pAndLNetCumul.est)
                    }
                    chartXAxis.push(this.chartFormat(element.dateUnix))
                    pushingChartDataEst()

                    i++

                    //console.log("element "+JSON.stringify(element))
                }
                option = {
                    tooltip: {
                        trigger: 'axis',
                        backgroundColor: this.blackbg7,
                        borderColor: this.blackbg7,
                        textStyle: {
                            color: this.white87
                        },
                        formatter: (params) => {
                            var proceeds
                            var cumulProceeds
                            var date
                            params.forEach((element, index) => {
                                if (index == 0) {
                                    cumulProceeds = this.thousandCurrencyFormat(element.value)
                                    date = element.name
                                }
                                if (index == 1) {
                                    proceeds = this.thousandCurrencyFormat(element.value)
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
                        splitLine: {
                            lineStyle: {
                                type: 'solid',
                                color: this.cssColor38
                            }
                        },
                        axisLabel: {
                            formatter: (params) => {
                                return this.thousandCurrencyFormat(params)
                            }
                        },
                    },
                    series: [{
                        data: chartDataEst,
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
                    }, ]
                }
                myChart.setOption(option);
                resolve()
            })
        },
    }
}