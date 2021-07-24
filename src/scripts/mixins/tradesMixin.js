const tradesMixin = {
    methods: {
        inputDateRange(param) {
            var filterJson = this.dateRange.filter(element => element.value == param)[0]
            this.selectedDateRange = filterJson
            localStorage.setItem('selectedDateRange', JSON.stringify(this.selectedDateRange))
            this.getAllTrades()

        },
        getAllTrades: async function() {
            console.log("\nGETTING ALL TRADES")
            var selectedRange
            if (!localStorage.getItem('selectedDateRange')) {
                localStorage.setItem('selectedDateRange', JSON.stringify(this.selectedDateRange))
            }
            if (!localStorage.getItem('selectedCalRange')) {
                localStorage.setItem('selectedCalRange', JSON.stringify(this.selectedCalRange))
            }
            if (this.currentPage.id == "dashboard") {
                selectedRange = this.selectedDateRange
            } else {
                selectedRange = this.selectedCalRange
            }

            filterTrades = () => {
                console.log(" -> Filtering trades")
                    //console.log("trades "+JSON.stringify(this.allTrades))
                this.filteredTrades = this.allTrades.filter(f => f.dateUnix >= selectedRange.start && f.dateUnix < selectedRange.end);
            }

            //Check if if data exists in IndexedDB
            let dataExistsInIndexedDB = await this.checkTradesInIndexedDB()
            if (!dataExistsInIndexedDB) {
                await this.getTradesFromDb()
            }

            console.log(" -> Getting trades from " + dayjs.unix(selectedRange.start).format("DD/MM/YY") + " to " + dayjs.unix(selectedRange.end).format("DD/MM/YY"))
            if (selectedRange.start == 0 && selectedRange.end == 0) {
                this.filteredTrades = this.allTrades
            } else {
                filterTrades()
            }

            if (this.currentPage.id == "dashboard") {
                await (this.renderData += 1)
                await (this.totalPAndLChartMounted = false)
                await this.createTotals()
                await this.pieChart("pieChart1", this.totals.probNetWins, this.totals.probNetLoss, this.currentPage.id) //chart ID, winShare, lossShare
                await this.lineBarChart()
                await this.barChart("barChart1")
                await this.barChart("barChart2")
                await this.boxPlotChart()
                await (this.totalPAndLChartMounted = true)
            }
            if (this.currentPage.id == "daily" || this.currentPage.id == "videos" ||  this.currentPage.id == "calendar") {
                //In dashboard, filter is dependant on the filter input on top of page
                //In daily, filter is dependant on the calendar -> charts are loaded after and inside calendar in this case
                this.loadCalendar()

            }


        },
        checkTradesInIndexedDB: async function() {
            return new Promise((resolve, reject) => {
                let transaction = this.indexedDB.transaction(["trades"], "readwrite");
                var objectToGet = transaction.objectStore("trades").get("1")

                objectToGet.onsuccess = (event) => {
                    if (event.target.result != undefined) {
                        console.log(" -> Data exists in IndexedDB. Retreiving trades")
                        this.allTrades = event.target.result.data;
                        //console.log("all trades " + JSON.stringify(this.allTrades))
                        resolve(true)
                    } else {
                        console.log(" -> Data does not exist in IndexedDB. Retreiving from DB")
                        resolve(false)
                    }

                }
                objectToGet.onerror = (event) => {
                    console.log(" -> There was an error getting trades from IndexedDB")
                    return
                }
            })
        },
        saveAllTradesToIndexedDb(param) {
            return new Promise((resolve, reject) => {
                console.log(" -> Saving trades to IndexedDB");

                // Open a transaction to the database
                let transaction = this.indexedDB.transaction(["trades"], "readwrite");
                //console.log("all trades after "+JSON.stringify(this.allTrades))
                let data = {
                    id: "1",
                    data: this.allTrades
                };

                var objectToAdd = transaction.objectStore("trades").put(data)

                objectToAdd.onsuccess = (event) => {
                    console.log(" -> Success saving to IndexedDB")

                }
                objectToAdd.onserror = (event) => {
                    console.log(" -> Error saving to IndexedDB")
                    return
                }

                //Resolve on transaction complete because when adding the page redirects to dashboard and the indexeddb object did not have time to update when I was putting resolve in onsuccess
                transaction.oncomplete = function(event) {
                    resolve()
                };
            })
        },
        createTotals() {
            console.log(" -> Creating totals")
            var totalQuantity = 0

            var totalCommission = 0
            var totalOtherCommission = 0
            var totalFees = 0

            var totalGrossProceeds = 0
            var totalGrossWins = 0
            var totalGrossLoss = 0
            var totalGrossSharePL = 0
            var totalGrossSharePLWins = 0
            var totalGrossSharePLLoss = 0
            var highGrossSharePLWin = 0
            var highGrossSharePLLoss = 0

            var totalNetProceeds = 0
            var totalNetWins = 0
            var totalNetLoss = 0
            var totalNetSharePL = 0
            var totalNetSharePLWins = 0
            var totalNetSharePLLoss = 0
            var highNetSharePLWin = 0
            var highNetSharePLLoss = 0

            var totalExecutions = 0
            var totalTrades = 0

            var totalGrossWinsQuantity = 0
            var totalGrossLossQuantity = 0
            var totalGrossWinsCount = 0
            var totalGrossLossCount = 0

            var totalNetWinsQuantity = 0
            var totalNetLossQuantity = 0
            var totalNetWinsCount = 0
            var totalNetLossCount = 0



            //console.log("filtered trades "+JSON.stringify(this.filteredTrades[0].trades))
            var temp1 = []
            this.filteredTrades.forEach((element, index) => {
                //console.log("element "+JSON.stringify(element))
                //console.log("entry time " + element.trades[0].entryTime + " and formated " + dayjs.unix(element.trades[0].entryTime).format("HH:mm"))
                element.trades.forEach(el => {
                    temp1.push(el)
                })

                totalQuantity += element.pAndL.buyQuantity + element.pAndL.sellQuantity

                totalCommission += element.pAndL.commission
                totalOtherCommission += element.pAndL.otherCommission
                totalFees += element.pAndL.fees

                totalGrossProceeds += element.pAndL.grossProceeds //Total amount of proceeds
                totalGrossWins += element.pAndL.grossWins
                totalGrossLoss += element.pAndL.grossLoss
                totalGrossSharePL += element.pAndL.grossSharePL
                totalGrossSharePLWins += element.pAndL.grossSharePLWins
                totalGrossSharePLLoss += element.pAndL.grossSharePLLoss
                element.pAndL.highGrossSharePLWin > highGrossSharePLWin ? highGrossSharePLWin = element.pAndL.highGrossSharePLWin : highGrossSharePLWin = highGrossSharePLWin
                element.pAndL.highGrossSharePLLoss < highGrossSharePLLoss ? highGrossSharePLLoss = element.pAndL.highGrossSharePLLoss : highGrossSharePLLoss = highGrossSharePLLoss

                totalNetProceeds += element.pAndL.netProceeds
                totalNetWins += element.pAndL.netWins
                totalNetLoss += element.pAndL.netLoss
                totalNetSharePL += element.pAndL.netSharePL
                totalNetSharePLWins += element.pAndL.netSharePLWins
                totalNetSharePLLoss += element.pAndL.netSharePLLoss
                element.pAndL.highNetSharePLWin > highNetSharePLWin ? highNetSharePLWin = element.pAndL.highNetSharePLWin : highNetSharePLWin = highNetSharePLWin
                element.pAndL.highNetSharePLLoss < highNetSharePLLoss ? highNetSharePLLoss = element.pAndL.highNetSharePLLoss : highNetSharePLLoss = highNetSharePLLoss

                totalExecutions += element.pAndL.executions
                totalTrades += element.pAndL.trades
                totalGrossWinsQuantity += element.pAndL.grossWinsQuantity
                totalGrossLossQuantity += element.pAndL.grossLossQuantity
                totalGrossWinsCount += element.pAndL.grossWinsCount //Total number/count of gross winning trades
                totalGrossLossCount += element.pAndL.grossLossCount //Total number/count of gross losing trades

                totalNetWinsQuantity += element.pAndL.netWinsQuantity
                totalNetLossQuantity += element.pAndL.netLossQuantity
                totalNetWinsCount += element.pAndL.netWinsCount //Total number/count of net winning trades
                totalNetLossCount += element.pAndL.netLossCount //Total number/count of net losing trades


            })

            temp = {}

            /*******************
             * Estimations var
             *******************/
            var grossWinsQuantityEstimations = this.estimations.quantity * (totalGrossWinsQuantity / (totalGrossWinsQuantity + totalGrossLossQuantity))
            var grossLossQuantityEstimations = this.estimations.quantity - grossWinsQuantityEstimations
                //console.log(" wins " + grossWinsQuantityEstimations + " and loss " + grossLossQuantityEstimations)

            /*******************
             * Info
             *******************/
            temp.quantity = totalQuantity

            /*******************
             * Commissions and fees
             *******************/
            temp.commission = totalCommission
            temp.otherCommission = totalOtherCommission
            temp.fees = totalFees
            temp.feesEstimations = (totalTrades * 2 * this.estimations.quantity * this.estimations.fees)

            /*******************
             * Gross proceeds and P&L
             *******************/
            temp.grossProceeds = totalGrossProceeds
            temp.grossWins = totalGrossWins
            temp.grossLoss = totalGrossLoss
            temp.grossSharePL = totalGrossSharePL
                /*totalGrossWinsQuantity == 0 ? temp.grossSharePLWins = 0 : temp.grossSharePLWins = (totalGrossWins / totalGrossWinsQuantity)
                totalGrossLossQuantity == 0 ? temp.grossSharePLLoss = 0 : temp.grossSharePLLoss = totalGrossLoss / totalGrossLossQuantity*/
            temp.grossSharePLWins = totalGrossSharePLWins
            temp.grossSharePLLoss = totalGrossSharePLLoss
            temp.highGrossSharePLWin = highGrossSharePLWin
            temp.highGrossSharePLLoss = highGrossSharePLLoss
            temp.grossProceedsEstimations = totalGrossSharePL * this.estimations.quantity
            temp.grossWinsEstimations = totalGrossSharePLWins * this.estimations.quantity
            temp.grossLossEstimations = totalGrossSharePLLoss * this.estimations.quantity

            /*******************
             * Net proceeds and P&L
             *******************/
            temp.netProceeds = totalNetProceeds
            temp.netWins = totalNetWins
            temp.netLoss = totalNetLoss
            temp.netSharePL = totalNetSharePL
                /*totalNetWinsQuantity == 0 ? temp.netSharePLWins = 0 : temp.netSharePLWins = totalNetWins / totalNetWinsQuantity
                totalNetLossQuantity == 0 ? temp.netSharePLLoss = 0 : temp.netSharePLLoss = totalNetLoss / totalNetLossQuantity*/
            temp.netSharePLWins = totalNetSharePLWins
            temp.netSharePLLoss = totalNetSharePLLoss
            temp.highNetSharePLWin = highNetSharePLWin
            temp.highNetSharePLLoss = highNetSharePLLoss
            temp.netProceedsEstimations = temp.grossProceedsEstimations - temp.feesEstimations
            temp.netWinsEstimations = temp.grossWinsEstimations - temp.feesEstimations
            temp.netLossEstimations = temp.grossLossEstimations - temp.feesEstimations


            /*******************
             * Counts
             *******************/
            temp.executions = totalExecutions
            temp.trades = totalTrades

            temp.grossWinsQuantity = totalGrossWinsQuantity
            temp.grossLossQuantity = totalGrossLossQuantity
            temp.grossWinsCount = totalGrossWinsCount
            temp.grossLossCount = totalGrossLossCount

            temp.netWinsQuantity = totalNetWinsQuantity
            temp.netLossQuantity = totalNetLossQuantity
            temp.netWinsCount = totalNetWinsCount
            temp.netLossCount = totalNetLossCount

            //temp.netSharePLWins = totalNetSharePLWins
            //temp.netSharePLLoss = totalNetSharePLLoss




            //Needed for Dashboard
            var numPL = this.filteredTrades.length
            temp.probGrossWins = (totalGrossWinsCount / totalTrades)
            temp.probGrossLoss = (totalGrossLossCount / totalTrades)
            temp.probNetWins = (totalNetWinsCount / totalTrades)
            temp.probNetLoss = (totalNetLossCount / totalTrades)
                //console.log("prob net win "+temp.probNetWins+" and loss "+temp.probNetLoss)

            temp.avgGrossWins = (totalGrossWins / totalGrossWinsCount)
            temp.avgGrossLoss = -(totalGrossLoss / totalGrossLossCount)
            temp.avgNetWins = (totalNetWins / totalNetWinsCount)
            temp.avgNetLoss = -(totalNetLoss / totalNetLossCount)
            temp.avgNetWinsEstimations = (temp.netWinsEstimations / totalGrossWinsCount)
            temp.avgNetLossEstimations = -(temp.netLossEstimations / totalGrossLossCount)

            /*Average P&L per stock
            temp.grossSharePLWins = (totalGrossSharePLWins / numPL) // here we do an average of P&L per share so it's not divided by the count, as in blotter, but by the number of P&L shares in the array (the number of numbers in the array)
            temp.grossSharePLLoss = (totalGrossSharePLLoss / numPL)*/
            //temp.riskReward = temp.grossSharePLWins / (-temp.grossSharePLLoss)


            /*listGrossMargins.sort(function(a, b) {
                    return a - b
                })
                //console.log("list "+listGrossMargins)
            temp.listGrossMargins = listGrossMargins*/
            this.totals = temp
                //console.log(" -> TOTALS " + JSON.stringify(this.totals))


            /*******************
             * GROUP BY
             *******************/

            /*** Group by day of week ***/
            var a = _
                .groupBy(temp1, t => dayjs.unix(t.entryTime).day()); //temp1 is json array with trades and is created during totals
            //console.log("a "+JSON.stringify(a))

            /*** Group by month of year ***/
            var b = _
                .groupBy(temp1, t => dayjs.unix(t.entryTime).month());
            //console.log("b "+JSON.stringify(b))

            /*** Group by entry time by xxx second timeframe ***/
            var c = _
                .groupBy(temp1, t => {
                    var secondTimeFrame = 30
                    var msTimeFrame = secondTimeFrame * 60 * 1000; /*ms*/
                    var entryTimeTF = dayjs(Math.floor((+dayjs.unix(t.entryTime)) / msTimeFrame) * msTimeFrame);
                    return entryTimeTF.format("hh:mm:ss")
                })
                //console.log("c " + JSON.stringify(c))

            /*** Group by trade duration ***/
            var d = _(temp1)
                .orderBy(x => x.exitTime - x.entryTime)
                .groupBy(t => {
                    // under 1mn, 1mn-2mn, 2-5mn, 5-10mn, 10-20mn, 20-40mn, 40-60mn, above 60mn
                    var tradeDuration = t.exitTime - t.entryTime // in seconds  
                    var tradeDurationDiv = tradeDuration / 60

                    var floorDurationSeconds
                    if (tradeDurationDiv < 1) {
                        floorDurationSeconds = 0 * 60 // 0-1mn
                    }
                    if (tradeDurationDiv >= 1 && tradeDurationDiv < 2) {
                        floorDurationSeconds = 1 * 60 // 1-2mn
                    }
                    if (tradeDurationDiv >= 2 && tradeDurationDiv < 5) {
                        floorDurationSeconds = 2 * 60 // 2-5mn
                    }
                    if (tradeDurationDiv >= 5 && tradeDurationDiv < 10) {
                        floorDurationSeconds = 5 * 60 // 5-10mn
                    }
                    if (tradeDurationDiv >= 10 && tradeDurationDiv < 20) {
                        floorDurationSeconds = 10 * 60 // 10-20mn
                    }
                    if (tradeDurationDiv >= 20 && tradeDurationDiv < 40) {
                        floorDurationSeconds = 20 * 60 // 20-40mn
                    }
                    if (tradeDurationDiv >= 40 && tradeDurationDiv < 60) {
                        floorDurationSeconds = 40 * 60 // 40-60mn
                    }
                    if (tradeDurationDiv >= 60) {
                        floorDurationSeconds = 60 * 60 // >60mn
                    }
                    //console.log(" -> duration " + dayjs.duration(tradeDuration * 1000).format('HH:mm:ss') + " - interval in seconds " + floorDurationSeconds + " - formated interval " + dayjs.duration(floorDurationSeconds * 1000).format('HH:mm:ss'))

                    return dayjs.duration(floorDurationSeconds * 1000).format('HH:mm:ss')
                })
                //console.log("d "+JSON.stringify(d))

            /*** Group by stock price range ***/

            var e = _(temp1)
                .orderBy(x => x.entryPrice)
                .groupBy(x => {
                        // under 5$, 5-10$, 10-15$, 15-20$, 20-25$mn, 25-30$, above 30$
                        if (x.entryPrice < 30) {
                            var priceRange = 5
                            floorPrice = (Math.floor(x.entryPrice / priceRange) * priceRange);
                        }
                        if (x.entryPrice > 30) {
                            floorPrice = 30
                        }
                    
                    //console.log(" -> entry price " + x.entryPrice +" and floor/interval "+floorPrice)

                    return floorPrice
                })
        //console.log("e "+JSON.stringify(e))

    },

    getTradesFromDb: async function() {
        return new Promise((resolve, reject) => {
            (async() => {
                const Object = Parse.Object.extend("trades");
                const query = new Parse.Query(Object);
                query.equalTo("user", Parse.User.current());
                query.ascending("dateUnix");
                query.limit(1000000); // limit to at most 10 results
                const results = await query.find();
                this.allTrades = JSON.parse(JSON.stringify(results))
                    //console.log("all trades before "+JSON.stringify(this.allTrades))
                await this.saveAllTradesToIndexedDb()
                resolve()
            })()
        })
    }

}
}