const tradesMixin = {
    methods: {
        inputDateRange(param) {
            var filterJson = this.dateRange.filter(element => element.value == param)[0]
            this.selectedDateRange = filterJson
            localStorage.setItem('selectedDateRange', JSON.stringify(this.selectedDateRange))
            this.getAllTrades(true)

        },

        inputPosition(param) {
            this.selectedPosition = param
            localStorage.setItem('selectedPosition', this.selectedPosition)
            this.getAllTrades(true)
        },
        getAllTrades: async function(param) {
            console.log("\nGETTING ALL TRADES")
            if (param) { // if true, getting all trades. Else juste the graphs
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
            }
            if (this.currentPage.id == "dashboard") {
                await (this.renderData += 1)
                await this.getPatterns()
                await (this.totalPAndLChartMounted = false)
                await this.createTotals()
                await this.pieChart("pieChart1", this.totals.probNetWins, this.totals.probNetLoss, this.currentPage.id) //chart ID, winShare, lossShare
                await this.lineBarChart()
                await this.barChart("barChart1")
                await this.barChart("barChart2")
                await this.barChartNegative("barChartNegative1")
                await this.barChartNegative("barChartNegative2")
                await this.barChartNegative("barChartNegative3")
                await this.barChartNegative("barChartNegative4")
                await this.barChartNegative("barChartNegative5")
                await this.barChartNegative("barChartNegative6")
                await this.barChartNegative("barChartNegative7")
                await this.barChartNegative("barChartNegative8")
                await this.barChartNegative("barChartNegative9")
                await this.barChartNegative("barChartNegative10")
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
            var temp2 = []
            var temp3 = {}
            this.filteredTrades.forEach((element, index) => {
                if (this.selectedPosition != "all") { //if filtering by position other than all
                    element.trades = element.trades.filter(f => f.strategy == this.selectedPosition);
                }

                /*============= RECREATING TRADES FOR GROUPING =============*/
                element.trades.forEach(el => {

                    totalQuantity += el.buyQuantity + el.sellQuantity
                    totalCommission += el.commission
                    totalOtherCommission += el.sec + el.taf + el.nscc + el.nasdaq
                    totalFees += el.commission + el.sec + el.taf + el.nscc + el.nasdaq

                    totalGrossProceeds += el.grossProceeds //Total amount of proceeds
                    totalGrossWins += el.grossWins
                    totalGrossLoss += el.grossLoss
                    totalGrossSharePL += el.grossSharePL
                    totalGrossSharePLWins += el.grossSharePLWins
                    totalGrossSharePLLoss += el.grossSharePLLoss
                        //el.highGrossSharePLWin > highGrossSharePLWin ? highGrossSharePLWin = el.highGrossSharePLWin : highGrossSharePLWin = highGrossSharePLWin
                        //el.highGrossSharePLLoss < highGrossSharePLLoss ? highGrossSharePLLoss = el.highGrossSharePLLoss : highGrossSharePLLoss = highGrossSharePLLoss

                    if (el.grossSharePL >= 0) {
                        if (el.grossSharePL > highGrossSharePLWin) {
                            highGrossSharePLWin = el.grossSharePL
                        }
                    }
                    if (el.grossSharePL < 0) {
                        if (el.grossSharePL < highGrossSharePLLoss) {
                            highGrossSharePLLoss = el.grossSharePL
                        }

                    }

                    totalNetProceeds += el.netProceeds
                    totalNetWins += el.netWins
                    totalNetLoss += el.netLoss
                    totalNetSharePL += el.netSharePL
                    totalNetSharePLWins += el.netSharePLWins
                    totalNetSharePLLoss += el.netSharePLLoss
                        //el.highNetSharePLWin > highNetSharePLWin ? highNetSharePLWin = el.highNetSharePLWin : highNetSharePLWin = highNetSharePLWin
                        //el.highNetSharePLLoss < highNetSharePLLoss ? highNetSharePLLoss = el.highNetSharePLLoss : highNetSharePLLoss = highNetSharePLLoss
                    if (el.netSharePL >= 0) {
                        if (el.netSharePL > highNetSharePLWin) {
                            highNetSharePLWin = el.netSharePL
                        }

                    }
                    if (el.netSharePL < 0) {
                        if (el.netSharePL < highNetSharePLLoss) {
                            highNetSharePLLoss = el.netSharePL
                        }

                    }



                    totalExecutions += el.executionsCount
                    totalTrades += el.tradesCount
                    totalGrossWinsQuantity += el.grossWinsQuantity
                    totalGrossLossQuantity += el.grossLossQuantity
                    totalGrossWinsCount += el.grossWinsCount //Total number/count of gross winning trades
                    totalGrossLossCount += el.grossLossCount //Total number/count of gross losing trades

                    totalNetWinsQuantity += el.netWinsQuantity
                    totalNetLossQuantity += el.netLossQuantity
                    totalNetWinsCount += el.netWinsCount //Total number/count of net winning trades
                    totalNetLossCount += el.netLossCount //Total number/count of net losing trades

                    temp1.push(el) // needed for grouping
                })

                temp2.push(element.pAndL)

                /*totalQuantity += element.pAndL.buyQuantity + element.pAndL.sellQuantity

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
                totalNetLossCount += element.pAndL.netLossCount //Total number/count of net losing trades*/


            })

            /*============= RECREATING TOTALS BY DATE =============*/
            temp3 = {}
            var tempExecs = temp1
                //console.log("tempExecs9 " + JSON.stringify(tempExecs));
            var z = _
                .chain(tempExecs)
                .orderBy(["td"], ["asc"])
                .groupBy("td")

            objectY = JSON.parse(JSON.stringify(z))
            const keys3 = Object.keys(objectY);
            for (const key3 of keys3) {
                //console.log("key 10 " + key3)
                //console.log("z "+JSON.stringify(z))
                var tempExecs = objectY[key3]
                    //console.log("tempExecs " + JSON.stringify(tempExecs));
                temp3[key3] = {};

                /*******************
                 * Info
                 *******************/
                var sumBuyQuantity = 0
                var sumSellQuantity = 0

                /*******************
                 * Commissions and fees
                 *******************/
                var sumCommission = 0
                var sumSec = 0
                var sumTaf = 0
                var sumNscc = 0
                var sumNasdaq = 0
                var sumOtherCommission = 0
                var sumFees = 0

                /*******************
                 * Gross proceeds and P&L
                 *******************/
                var sumGrossProceeds = 0
                var sumGrossWins = 0
                var sumGrossLoss = 0
                var sumGrossSharePL = 0 //On a trade level, it's Proceeds per share traded. But as we blotter and create global P&L, it is a cumulative number (like proceeds). This way we can calculate estimations. If we need and average per share, it's a different calculation
                var sumGrossSharePLWins = 0
                var sumGrossSharePLLoss = 0
                var highGrossSharePLWin = 0
                var highGrossSharePLLoss = 0


                /*******************
                 * Net proceeds and P&L
                 *******************/
                var sumNetProceeds = 0
                var sumNetWins = 0
                var sumNetLoss = 0
                var sumNetSharePL = 0
                var sumNetSharePLWins = 0
                var sumNetSharePLLoss = 0
                var highNetSharePLWin = 0
                var highNetSharePLLoss = 0

                /*******************
                 * Counts
                 *******************/
                var sumExecutions = 0
                var sumTrades = 0
                var sumGrossWinsQuantity = 0
                var sumGrossLossQuantity = 0
                var sumGrossWinsCount = 0
                var sumGrossLossCount = 0
                var sumNetWinsQuantity = 0
                var sumNetLossQuantity = 0
                var sumNetWinsCount = 0
                var sumNetLossCount = 0



                tempExecs.forEach(element => {
                    sumBuyQuantity += element.buyQuantity
                    sumSellQuantity += element.sellQuantity
                    sumCommission += element.commission
                    sumSec += element.sec
                    sumTaf += element.taf
                    sumNscc += element.nscc
                    sumNasdaq += element.nasdaq
                    sumOtherCommission += element.sec + element.taf + element.nscc + element.nasdaq
                    sumFees += element.commission + element.sec + element.taf + element.nscc + element.nasdaq

                    sumGrossProceeds += element.grossProceeds
                    sumGrossWins += element.grossWins
                    sumGrossLoss += element.grossLoss
                    sumGrossSharePL += element.grossSharePL
                    sumGrossSharePLWins += element.grossSharePLWins
                    sumGrossSharePLLoss += element.grossSharePLLoss
                    if (element.grossSharePL >= 0) {
                        if (element.grossSharePL > highGrossSharePLWin) {
                            highGrossSharePLWin = element.grossSharePL
                        }
                    }
                    if (element.grossSharePL < 0) {
                        if (element.grossSharePL < highGrossSharePLLoss) {
                            highGrossSharePLLoss = element.grossSharePL
                        }

                    }

                    sumNetProceeds += element.netProceeds
                    sumNetWins += element.netWins
                    sumNetLoss += element.netLoss
                    sumNetSharePL += element.netSharePL
                    sumNetSharePLWins += element.netSharePLWins
                    sumNetSharePLLoss += element.netSharePLLoss
                    if (element.netSharePL >= 0) {
                        if (element.netSharePL > highNetSharePLWin) {
                            highNetSharePLWin = element.netSharePL
                        }

                    }
                    if (element.netSharePL < 0) {
                        if (element.netSharePL < highNetSharePLLoss) {
                            highNetSharePLLoss = element.netSharePL
                        }

                    }

                    sumExecutions += element.executionsCount
                    sumGrossWinsQuantity += element.grossWinsQuantity
                    sumGrossLossQuantity += element.grossLossQuantity
                    sumGrossWinsCount += element.grossWinsCount

                    sumNetWinsQuantity += element.netWinsQuantity
                    sumNetLossQuantity += element.netLossQuantity
                    sumNetWinsCount += element.netWinsCount
                    sumGrossLossCount += element.grossLossCount
                    sumNetLossCount += element.netLossCount
                    sumTrades += element.tradesCount

                })

                /*******************
                 * Info
                 *******************/
                //temp3[key3].symbol = key3;
                temp3[key3].buyQuantity = sumBuyQuantity
                temp3[key3].sellQuantity = sumSellQuantity

                /*******************
                 * Commissions and fees
                 *******************/
                temp3[key3].commission = sumCommission;
                temp3[key3].sec = sumSec
                temp3[key3].taf = sumTaf
                temp3[key3].nscc = sumNscc
                temp3[key3].nasdaq = sumNasdaq
                temp3[key3].otherCommission = sumOtherCommission;
                temp3[key3].fees = sumFees;

                /*******************
                 * Gross proceeds and P&L
                 *******************/
                temp3[key3].grossProceeds = sumGrossProceeds;
                temp3[key3].grossWins = sumGrossWins;
                temp3[key3].grossLoss = sumGrossLoss;
                temp3[key3].grossSharePL = sumGrossSharePL
                    //temp3[key3].grossSharePL = sumGrossProceeds / sumBuyQuantity

                /*sumGrossWinsQuantity == 0 ? temp3[key3].grossSharePLWins = 0 : temp3[key3].grossSharePLWins = sumGrossWins / sumGrossWinsQuantity
                sumGrossLossQuantity == 0 ? temp3[key3].grossSharePLLoss = 0 : temp3[key3].grossSharePLLoss = sumGrossLoss / sumGrossLossQuantity*/
                temp3[key3].grossSharePLWins = sumGrossSharePLWins
                temp3[key3].grossSharePLLoss = sumGrossSharePLLoss
                temp3[key3].highGrossSharePLWin = highGrossSharePLWin;
                temp3[key3].highGrossSharePLLoss = highGrossSharePLLoss;

                /*******************
                 * Net proceeds and P&L
                 *******************/
                temp3[key3].netProceeds = sumNetProceeds;
                temp3[key3].netWins = sumNetWins;
                temp3[key3].netLoss = sumNetLoss;
                temp3[key3].netSharePL = sumNetSharePL
                    //temp3[key3].netSharePL = sumNetProceeds / sumBuyQuantity

                /*sumNetWinsQuantity == 0 ? temp3[key3].netSharePLWins = 0 : temp3[key3].netSharePLWins = sumNetWins / sumNetWinsQuantity
                sumNetLossQuantity == 0 ? temp3[key3].netSharePLLoss = 0 : temp3[key3].netSharePLLoss = sumNetLoss / sumNetLossQuantity*/
                temp3[key3].netSharePLWins = sumNetSharePLWins
                temp3[key3].netSharePLLoss = sumNetSharePLLoss
                temp3[key3].highNetSharePLWin = highNetSharePLWin;
                temp3[key3].highNetSharePLLoss = highNetSharePLLoss;

                /*******************
                 * Counts
                 *******************/
                temp3[key3].executions = sumExecutions;
                temp3[key3].trades = sumTrades;

                temp3[key3].grossWinsQuantity = sumGrossWinsQuantity;
                temp3[key3].grossLossQuantity = sumGrossLossQuantity;
                temp3[key3].grossWinsCount = sumGrossWinsCount;
                temp3[key3].grossLossCount = sumGrossLossCount;

                temp3[key3].netWinsQuantity = sumNetWinsQuantity;
                temp3[key3].netLossQuantity = sumNetLossQuantity;
                temp3[key3].netWinsCount = sumNetWinsCount;
                temp3[key3].netLossCount = sumNetLossCount;

                /*******************
                 * Financials
                 *******************/
                temp3[key3].financials = tempExecs[0].financials



            }
            this.totalsByDate = temp3
                //console.log(" -> TOTALS BY DATE " + JSON.stringify(this.totalsByDate))

            /*============= CREATING GENERAL TOTAL =============*/
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


            /*============= GROUPING =============*/
            /*******************
             * GROUP BY DAY OF WEEK
             *******************/

            this.groups.day = _
                .groupBy(temp1, t => dayjs.unix(t.entryTime).day()); //temp1 is json array with trades and is created during totals
            //console.log("a "+JSON.stringify(a))

            /*******************
             * GROUP BY MONTH OF YEAR
             *******************/
            var b = _
                .groupBy(temp1, t => dayjs.unix(t.entryTime).month());
            //console.log("b "+JSON.stringify(b))

            /*******************
             * GROUP BY ENTRY TIMEFRAME
             *******************/
            this.groups.timeframe = _(temp1)
                .groupBy(x => {
                    var secondTimeFrame = 30
                    var msTimeFrame = secondTimeFrame * 60 * 1000; /*ms*/
                    //console.log("entry time " + dayjs.unix(x.entryTime).format("HH:mm"))
                    var entryTimeTF = dayjs(Math.floor((+dayjs.unix(x.entryTime)) / msTimeFrame) * msTimeFrame);
                    return entryTimeTF.format("HH:mm")
                })
                .toPairs()
                .sortBy(0)
                .fromPairs()
                .value()

            //console.log("timeframe " + JSON.stringify(this.groups.timeframe))

            /* ==== Group by trade duration ==== */
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

            /*******************
             * GROUP BY ENTRYPRICE
             *******************/
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

            /*******************
             * GROUP BY NUMBER OF TRADES
             *******************/
            this.groups.trades = _(temp3)
                .groupBy(x => {
                    // under 5, 6-10, 11-15, 16-20, 21-30, above 30 trades
                    if (x.trades <= 30) {
                        var range = 5
                        ceilTrades = (Math.ceil(x.trades / range) * range);
                    }
                    if (x.trades > 30) {
                        ceilTrades = 30
                    }
                    //console.log(" -> trades " + x.trades +" and interval "+ceilTrades)

                    return ceilTrades
                })
                .value()

            //console.log("trades " + JSON.stringify(this.groups.trades))

            /*******************
             * GROUP BY NUMBER OF EXECUTIONS PER TRADE
             *******************/
            this.groups.executions = _(temp1)
                .groupBy('executionsCount')
                .value()

            //console.log("executions " + JSON.stringify(this.groups.executions))

            /*******************
             * GROUP BY PATTERN
             *******************/
            this.groups.patterns = _(temp1)
                .groupBy('setup.pattern')
                .value()
            //console.log("group by patterns " + JSON.stringify(this.groups.patterns))

        },

        getTradesFromDb: async function() {
            return new Promise((resolve, reject) => {
                (async() => {
                    console.log(" -> Getting trades from DB");
                    const Object = Parse.Object.extend("trades");
                    const query = new Parse.Query(Object);
                    query.equalTo("user", Parse.User.current());
                    query.ascending("dateUnix");
                    query.limit(1000000); // limit to at most 10 results
                    const results = await query.find();
                    this.allTrades = []
                    this.allTrades = JSON.parse(JSON.stringify(results))
                        //console.log("all trades before "+JSON.stringify(this.allTrades))
                    await this.saveAllTradesToIndexedDb()
                    resolve()
                })()
            })
        }

    }
}