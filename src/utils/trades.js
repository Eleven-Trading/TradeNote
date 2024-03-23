import { pageId, spinnerLoadingPage, selectedRange, selectedDateRange, filteredTrades, filteredTradesTrades, selectedPositions, selectedAccounts, pAndL, queryLimit, blotter, totals, totalsByDate, groups, profitAnalysis, timeFrame, timeZoneTrade, hasData, satisfactionArray, satisfactionTradeArray, tags, filteredTradesDaily, dailyPagination, dailyQueryLimit, endOfList, excursions, selectedTags } from "../stores/globals"
import { useMountDashboard, useMountDaily, useMountCalendar, useDateTimeFormat } from "./utils";
import { useCreateBlotter, useCreatePnL } from "./addTrades"

let trades = []

export async function useGetFilteredTrades(param) {
    console.log("\nGETTING FILTERED TRADES")
    return new Promise(async (resolve, reject) => {

        /*============= 3 - Get data from DB =============
         ***************************************************/

        //console.log(" -> Getting trades")
        await useGetTrades()
        //console.log(" trades "+JSON.stringify(trades))


        /*============= 4 - Apply filter to trades =============
         
        * We filter by date range, position, account by looping/creating trades column
        * New variable will be called filteredTrades
        ***************************************************/

        console.log(" -> Filtering trades (" + useDateTimeFormat(selectedRange.value.start) + " - " + useDateTimeFormat(selectedRange.value.end) + ")")
        //spinnerLoadingPageText.value = "Getting trades - Filtering trades"
        //console.log("Range (Date or Call) start " + selectedRange.value.start + " Range (Date or Call) end " + selectedRange.value.end)

        filteredTrades.length = 0
        filteredTradesDaily.length = 0
        filteredTradesTrades.length = 0

        let loopTrades = (param1) => {
            //console.log("param1 "+JSON.stringify(param1))
            if (param1.length > 0) hasData.value = true //I do reverse, that is start with true so that on page load No Data does not appear
            param1.forEach(element => {
                //console.log(" -> Looping "+element.dateUnix)
                //console.log("trades "+JSON.stringify(element.trades))
                //console.log(" element " + JSON.stringify(element))
                if (element.trades) {
                    let temp = _.omit(element, ["trades", "pAndL", "blotter"]) //We recreate trades and pAndL
                    temp.trades = []

                    //we need to get date, month and year in order to compare for calendar creation
                    temp.date = dayjs.unix(element.dateUnix).tz(timeZoneTrade.value).date()
                    temp.month = dayjs.unix(element.dateUnix).tz(timeZoneTrade.value).month()
                    temp.year = dayjs.unix(element.dateUnix).tz(timeZoneTrade.value).year()

                    if (pageId.value == "daily") {

                        //Adding satisfaction for daily page
                        temp.satisfaction = null
                        for (let index = 0; index < satisfactionArray.length; index++) {
                            const el = satisfactionArray[index];
                            if (el.dateUnix == element.dateUnix) {
                                //console.log("satisfaction "+el.satisfaction)
                                temp.satisfaction = el.satisfaction
                            }
                        }
                    }

                    //console.log("element "+JSON.stringify(element))
                    element.trades.forEach(element => {
                        //console.log("element "+JSON.stringify(element))
                        if (element.side == "long") {
                            element.priceVar = element.entryPrice - element.exitPrice
                        } else {
                            element.priceVar = element.exitPrice - element.entryPrice
                        }

                        let tradeTagsSelected = false
                        let selectedTagsArray = Object.values(selectedTags.value)
                        //console.log(" tags "+JSON.stringify(tags))
                        //console.log(" element "+JSON.stringify(element))

                        //Check if trade(Id) is present in tags list
                        let index = tags.findIndex(obj => obj.tradeId == element.id)
                        if (index != -1) {
                            //console.log(" -> selected tags "+Object.values(selectedTags.value))
                            //console.log(" -> trade tags " + JSON.stringify(tags[index].tags))
                            //console.log(" includes ? "+selectedTagsArray.some(value => tags[index].tags.find(obj => obj.id === value)))
                            
                            //Case/check if tag_id is present in selectedTagsArray
                            if (selectedTagsArray.some(value => tags[index].tags.find(obj => obj === value))) {
                                tradeTagsSelected = true
                            }

                            //If its not present, there may be the case where array is null, but 'No tags' is still selected
                            if (tags[index].tags.length == 0 && selectedTagsArray.includes("t000t")) {
                                tradeTagsSelected = true
                            }
                        }

                        //If not, check if no tags is selected or not
                        else {
                            if (selectedTagsArray.includes("t000t")) {
                                tradeTagsSelected = true
                            }
                        }


                        let tradeSatisfaction = null
                        for (let index = 0; index < satisfactionTradeArray.length; index++) {
                            const el = satisfactionTradeArray[index];
                            if (el.tradeId == element.id) {
                                tradeSatisfaction = el.satisfaction
                            }
                        }

                        if ((selectedRange.value.start === 0 && selectedRange.value.end === 0 ? element.td >= selectedRange.value.start : element.td >= selectedRange.value.start && element.td < selectedRange.value.end) && selectedPositions.value.includes(element.strategy) && selectedAccounts.value.includes(element.account) && tradeTagsSelected) {

                            element.satisfaction = tradeSatisfaction


                            temp.trades.push(element)
                            filteredTradesTrades.push(element)
                            //console.log(" -> Temp trades "+JSON.stringify(temp.trades))
                        }
                    });
                    /* Just use the once that have recreated trades (or else daily was showing last 3 months and only one month with trades data) */
                    if (temp.trades.length > 0) {
                        if (pageId.value == "daily") {
                            //console.log(" temp "+JSON.stringify(temp))
                            filteredTradesDaily.push(temp)
                        } else {
                            filteredTrades.push(temp)
                        }
                    }
                }
            });
        }

        //console.log("trades "+JSON.stringify(trades))
        //console.log("filteredTrades "+JSON.stringify(filteredTrades))
        loopTrades(trades)
        //console.log(" selectedRange.value.start "+selectedRange.value.start)
        //console.log(" -> Filtered trades of trades "+JSON.stringify(filteredTradesTrades))
        await useCreateBlotter(true)
        await useCreatePnL()
        //console.log(" Blotter "+JSON.stringify(blotter))
        //console.log(" P and L "+JSON.stringify(pAndL))
        let keys = Object.keys(pAndL)
        //console.log(" keys "+keys)
        for (const key of keys) {
            let index
            if (pageId.value == "daily") {
                index = filteredTradesDaily.findIndex(obj => obj.dateUnix == key)
                filteredTradesDaily[index].pAndL = pAndL[key]
                filteredTradesDaily[index].blotter = blotter[key]
            } else {
                index = filteredTrades.findIndex(obj => obj.dateUnix == key)
                filteredTrades[index].pAndL = pAndL[key]
                filteredTrades[index].blotter = blotter[key]
            }

        }
        if (pageId.value == "daily") {
            filteredTradesDaily.sort((a, b) => {
                return b.dateUnix - a.dateUnix
            })
        } else {
            filteredTrades.sort((a, b) => {
                return b.dateUnix - a.dateUnix
            })
        }

        //console.log(" -> Filtered trades " + JSON.stringify(filteredTrades))
        //console.log(" -> Filtered trades daily " + JSON.stringify(filteredTradesDaily))
        //console.log("\nFinished getting filtered trades\n\n")
        resolve()
    })
}


/***************************************
 * GETTING DATA FROM PARSE DB 
 ***************************************/
export async function useGetTrades() {
    return new Promise(async (resolve, reject) => {
        console.log("\nGETTING TRADES");
        console.time("  --> Duration getting trades");
        //spinnerLoadingPageText.value = "Getting trades from ParseDB"
        let startD = selectedRange.value.start
        let endD = selectedRange.value.end
        //console.log("start D "+startD)
        //console.log("end D "+endD)
        const parseObject = Parse.Object.extend("trades");
        const query = new Parse.Query(parseObject)
        query.equalTo("user", Parse.User.current());
        query.ascending("dateUnix");
        query.exclude("executions", "blotter", "pAndL") // we omit to make it lighter
        query.greaterThanOrEqualTo("dateUnix", startD)
        query.lessThan("dateUnix", endD)
        query.limit(queryLimit.value);
        const results = await query.find();
        console.timeEnd("  --> Duration getting trades");
        //console.log("results "+JSON.stringify(results))
        if (results.length > 0) { //here results is an array so we use lenght. Sometimees results is not array then we use if results simply
            trades = []
            trades = JSON.parse(JSON.stringify(results))
        }
        //console.log("trades "+JSON.stringify(trades))
        resolve()
    })
}

export function useGetFilteredTradesForDaily() {
    for (let index = dailyPagination.value; index < (dailyPagination.value + dailyQueryLimit.value); index++) {
        const element = filteredTradesDaily[index];
        //console.log("element "+JSON.stringify(element))
        if (!element) {
            endOfList.value = true
        } else {
            filteredTrades.push(element)
        }
    }
    //console.log("filtered trade for daily " + JSON.stringify(filteredTrades))
    dailyPagination.value = dailyPagination.value + dailyQueryLimit.value
}

/*============= Prepare Trades (#4) =============

* Here we are going to create general totals
* Create a list of all trades needed for grouping by date but also by strategy, price, etc.
* Create totals per date needed for grouping monthly, weekly and daily
***************************************/

/* List of all trades inside trades column (needed for grouping) */
let temp1 = []
/* 1b - Create a json that we push to totals */
let temp2 = {}
/* Totals per date */
let temp3 = {}

export async function useTotalTrades() {
    console.log("\nCREATING TOTAL TRADES")
    return new Promise(async (resolve, reject) => {
        /* Variables */
        temp1 = []
        temp2 = {}
        temp3 = {}

        var totalQuantity = 0

        var totalCommission = 0
        var totalOtherCommission = 0
        var totalFees = 0
        var totalLocateFees = 0
        var totalSoftwareFees = 0
        var totalBankingFees = 0

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
        var financials = {}

        //console.log("filtered trades "+JSON.stringify(filteredTrades[0].trades))



        /*============= 1- CREATING GENERAL TOTALS =============
    
        * needed for dashboard
        * we start by iterating trades to created totals
        * Note: during iteration, we will also push to create a list of trades needed for grouping
        * Then we prepare a json that we push to totals
        */

        /* 1a - In each filtered trade, we will iterate trade to create totals */
        filteredTrades.forEach((element, index) => {
            // Other fees
            if (element.cashJournal != undefined) {
                //console.log("cash journal " + JSON.stringify(element.cashJournal))
                totalLocateFees += element.cashJournal.locate
                totalSoftwareFees += element.cashJournal.software
                totalBankingFees += element.cashJournal.banking.fee
                //console.log("totalLocateFees" + totalLocateFees)
            }

            element.trades.forEach(el => {
                /*============= NOTE - Creating list of trades =============
    
                * at the same time, we will push each trade inside trades
                * way.value we have a list of trades that we can group 
                * according to grouping need (per date but also entry, strategy, etc.)
                */
                temp1.push(el)

                /******************** */

                totalQuantity += el.buyQuantity + el.sellQuantity
                totalCommission += el.commission
                totalOtherCommission += el.sec + el.taf + el.nscc + el.nasdaq
                totalFees += el.commission + el.sec + el.taf + el.nscc + el.nasdaq

                totalGrossProceeds += el.grossProceeds //Total amount of proceeds
                totalGrossWins += el.grossWins
                totalGrossLoss += el.grossLoss
                totalGrossSharePL += el.grossSharePL
                //console.log(" totalGrossProceeds "+totalGrossProceeds)

                totalGrossSharePLWins += el.grossSharePLWins
                totalGrossSharePLLoss += el.grossSharePLLoss

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
                financials += el.financials //Total number/count of net losing trades

            })


        })

        /* 1b - Create a json that we push to totals */

        /*******************
         * Info
         *******************/
        temp2.quantity = totalQuantity

        /*******************
         * Commissions and fees
         *******************/
        temp2.commission = totalCommission
        temp2.otherCommission = totalOtherCommission
        temp2.fees = totalFees
        temp2.locateFees = totalLocateFees
        temp2.softwareFees = totalSoftwareFees
        temp2.bankingFees = totalBankingFees
        temp2.otherFees = totalLocateFees + totalSoftwareFees + totalBankingFees

        /*******************
         * Gross proceeds and P&L
         *******************/
        temp2.grossProceeds = totalGrossProceeds
        temp2.grossWins = totalGrossWins
        temp2.grossLoss = totalGrossLoss
        temp2.grossSharePL = totalGrossSharePL
        /*totalGrossWinsQuantity == 0 ? temp2.grossSharePLWins = 0 : temp2.grossSharePLWins = (totalGrossWins / totalGrossWinsQuantity)
        totalGrossLossQuantity == 0 ? temp2.grossSharePLLoss = 0 : temp2.grossSharePLLoss = totalGrossLoss / totalGrossLossQuantity*/
        temp2.grossSharePLWins = totalGrossSharePLWins
        temp2.grossSharePLLoss = totalGrossSharePLLoss
        temp2.highGrossSharePLWin = highGrossSharePLWin
        temp2.highGrossSharePLLoss = highGrossSharePLLoss


        /*******************
         * Net proceeds and P&L
         *******************/
        temp2.netProceeds = totalNetProceeds
        temp2.netFeesProceeds = totalNetProceeds - temp2.otherFees
        temp2.netWins = totalNetWins
        temp2.netLoss = totalNetLoss
        temp2.netSharePL = totalNetSharePL
        /*totalNetWinsQuantity == 0 ? temp2.netSharePLWins = 0 : temp2.netSharePLWins = totalNetWins / totalNetWinsQuantity
        totalNetLossQuantity == 0 ? temp2.netSharePLLoss = 0 : temp2.netSharePLLoss = totalNetLoss / totalNetLossQuantity*/
        temp2.netSharePLWins = totalNetSharePLWins
        temp2.netSharePLLoss = totalNetSharePLLoss
        temp2.highNetSharePLWin = highNetSharePLWin
        temp2.highNetSharePLLoss = highNetSharePLLoss
        temp2.netProceedsEstimations = temp2.grossProceedsEstimations - temp2.feesEstimations
        temp2.netWinsEstimations = temp2.grossWinsEstimations - temp2.feesEstimations
        temp2.netLossEstimations = temp2.grossLossEstimations - temp2.feesEstimations


        /*******************
         * Counts
         *******************/
        temp2.executions = totalExecutions
        temp2.trades = totalTrades

        temp2.grossWinsQuantity = totalGrossWinsQuantity
        temp2.grossLossQuantity = totalGrossLossQuantity
        temp2.grossWinsCount = totalGrossWinsCount
        temp2.grossLossCount = totalGrossLossCount

        temp2.netWinsQuantity = totalNetWinsQuantity
        temp2.netLossQuantity = totalNetLossQuantity
        temp2.netWinsCount = totalNetWinsCount
        temp2.netLossCount = totalNetLossCount

        //temp2.netSharePLWins = totalNetSharePLWins
        //temp2.netSharePLLoss = totalNetSharePLLoss

        //Needed for Dashboard
        temp2.probGrossWins = (totalGrossWinsCount / totalTrades)
        temp2.probGrossLoss = (totalGrossLossCount / totalTrades)
        temp2.probNetWins = (totalNetWinsCount / totalTrades)
        temp2.probNetLoss = (totalNetLossCount / totalTrades)
        //console.log("prob net win "+temp2.probNetWins+" and loss "+temp2.probNetLoss)

        temp2.avgGrossWins = (totalGrossWins / totalGrossWinsCount)
        temp2.avgGrossLoss = -(totalGrossLoss / totalGrossLossCount)
        temp2.avgNetWins = (totalNetWins / totalNetWinsCount)
        temp2.avgNetLoss = -(totalNetLoss / totalNetLossCount)

        temp2.avgGrossSharePLWins = (totalGrossSharePLWins / totalGrossWinsCount)
        temp2.avgGrossSharePLLoss = -(totalGrossSharePLLoss / totalGrossLossCount)
        temp2.avgNetSharePLWins = (totalNetSharePLWins / totalNetWinsCount)
        temp2.avgNetSharePLLoss = -(totalNetSharePLLoss / totalNetLossCount)
        for (let key in totals) delete totals[key]
        Object.assign(totals, temp2)
        //console.log(" -> TOTALS " + JSON.stringify(totals))



        /*============= 2- RECREATING TOTALS BY DATE =============
         *
         * Create totals per date needed for grouping monthly, weekly and daily
         */

        //console.log("temp2 "+JSON.stringify(temp2))
        var z = _
            .chain(temp1)
            .orderBy(["td"], ["asc"])
            .groupBy("td")

        let objectY = JSON.parse(JSON.stringify(z))
        const keys3 = Object.keys(objectY);
        //console.log(" keys 3 "+keys3)
        for (const key3 of keys3) {
            //console.log("key 3 " + key3)
            //console.log("z "+JSON.stringify(z))
            var tempTrades = objectY[key3]
            //console.log("tempTrades " + JSON.stringify(tempTrades));
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
            var sumGrossSharePL = 0 //On a trade level, it's Proceeds per share traded. But as we blotter and create global P&L, it is a cumulative number (like proceeds). way.value we can calculate estimations. If we need and average per share, it's a different calculation
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



            tempTrades.forEach(element => {
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
            //console.log("totalLocateFees" + JSON.stringify(temp2))

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
            temp3[key3].financials = tempTrades[0].financials



        }
        //console.log(" temp 3 " + JSON.stringify(temp3))
        for (let key in totalsByDate) delete totalsByDate[key]
        Object.assign(totalsByDate, temp3)
        //console.log(" -> TOTALS BY DATE " + JSON.stringify(totalsByDate))
        //console.log(" -> TOTALS BY DATE (length) " + Object.keys(totalsByDate).length)
        resolve()
    })
}

export async function useGroupTrades() {
    console.log("\nGROUPING TRADES")
    return new Promise(async (resolve, reject) => {
        /*============= 3- MISC GROUPING =============
        
        * Miscelanious grouping of trades by entry, price, etc.
        */
        var thousand = 1000
        var million = 1000000

        /*******************
         * GROUP BY DAY OF WEEK
         *******************/

        groups.day = _
            .groupBy(temp1, t => dayjs.unix(t.entryTime).day()); //temp1 is json array with trades and is created during totals
        //console.log("day  "+JSON.stringify(groups.day))

        /*******************
         * GROUP BY MONTH OF YEAR
         *******************/
        var b = _
            .groupBy(temp1, t => dayjs.unix(t.entryTime).month());
        //console.log("b "+JSON.stringify(b))

        /*******************
         * GROUP BY ENTRY TIMEFRAME
         *******************/
        groups.timeframe = _(temp1)
            .groupBy(x => {
                var secondTimeFrame = timeFrame.value
                var msTimeFrame = secondTimeFrame * 60 * 1000; /*ms*/

                //console.log("entry time " + dayjs.unix(x.entryTime).format("HH:mm"))
                //console.log(" -> Entrytime "+x.entryTime)
                let entryTF = Math.floor(x.entryTime / secondTimeFrame) * secondTimeFrame
                //console.log("  --> entryTF "+entryTF)
                var entryTimeTF = dayjs(Math.floor((+dayjs.unix(x.entryTime)) / msTimeFrame) * msTimeFrame);
                //console.log("  --> entryTimeTF "+entryTimeTF)
                return entryTimeTF.tz(timeZoneTrade.value).format("HH:mm")
            })
            .toPairs()
            .sortBy(0)
            .fromPairs()
            .value()

        //console.log("timeframe " + JSON.stringify(groups.timeframe))

        /* ==== Group by trade duration ==== */
        groups.duration = _(temp1)
            .orderBy(x => x.exitTime - x.entryTime)
            .groupBy(t => {
                // under 1mn, 1mn-2mn, 2-5mn, 5-10mn, 10-20mn, 20-40mn, 40-60mn, above 60mn
                var tradeDuration = t.exitTime - t.entryTime // in seconds  
                var tradeDurationDiv = tradeDuration / 60

                var floorDurationSeconds
                if (tradeDurationDiv < 1) {
                    floorDurationSeconds = 0 // 0-1mn
                }
                if (tradeDurationDiv >= 1 && tradeDurationDiv < 2) {
                    floorDurationSeconds = 1 // 1-2mn
                }
                if (tradeDurationDiv >= 2 && tradeDurationDiv < 5) {
                    floorDurationSeconds = 2 // 2-5mn
                }
                if (tradeDurationDiv >= 5 && tradeDurationDiv < 10) {
                    floorDurationSeconds = 5 // 5-10mn
                }
                if (tradeDurationDiv >= 10 && tradeDurationDiv < 20) {
                    floorDurationSeconds = 10 // 10-20mn
                }
                if (tradeDurationDiv >= 20 && tradeDurationDiv < 40) {
                    floorDurationSeconds = 20 // 20-40mn
                }
                if (tradeDurationDiv >= 40 && tradeDurationDiv < 60) {
                    floorDurationSeconds = 40 // 40-60mn
                }
                if (tradeDurationDiv >= 60) {
                    floorDurationSeconds = 60 // >60mn
                }
                //console.log(" -> duration " + dayjs.duration(tradeDuration * 1000).format('HH:mm:ss') + " - interval in seconds " + floorDurationSeconds + " - formated interval " + dayjs.duration(floorDurationSeconds * 1000).format('HH:mm:ss'))

                return floorDurationSeconds
            })
            .toPairs()
            .sortBy(0)
            .fromPairs()
            .value()
        //console.log("d "+JSON.stringify(groups.duration))



        /*******************
         * GROUP BY NUMBER OF TRADES
         *******************/
        groups.trades = _(temp3)
            .groupBy(x => {
                let ceilTrades
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

        //console.log("trades " + JSON.stringify(groups.trades))

        /*******************
         * GROUP BY NUMBER OF EXECUTIONS PER TRADE
         *******************/
        groups.executions = _(temp1)
            .groupBy('executionsCount')
            .value()

        //console.log("executions " + JSON.stringify(groups.executions))

        /*******************
        * GROUP BY POSITION
        *******************/
        groups.position = _(temp1)
            .groupBy('strategy')
            .value()
        //console.log("group by position " + JSON.stringify(groups.position))


        /*******************
         * GROUP BY SYMBOL
         *******************/
        groups.symbols = _(temp1)
            .groupBy('symbol')
            .value()
        //console.log("symbols " + JSON.stringify(groups.symbols))

        /*******************
         * GROUP BY PUBLIC FLOAT
         *******************/
        let path = "financials.publicFloat";
        groups.shareFloat = _(temp1)
            .filter(object => _.has(object, path))
            .groupBy(x => {
                let ceilFloor
                var publicFloatFinviz = x.financials.publicFloat.finviz
                if (publicFloatFinviz != "-") {
                    //console.log("public float (finviz) " + JSON.stringify(publicFloatFinviz))

                    // under 10M, 10-20M, 20-30, 30-50, above 50M float
                    if (publicFloatFinviz < 20 * million) {
                        var range = 5 * 1000000
                        ceilFloor = (Math.floor(publicFloatFinviz / range) * range);
                    }
                    if ((publicFloatFinviz >= 20 * million) && (publicFloatFinviz < 50 * million)) {
                        var range = 10 * 1000000
                        ceilFloor = (Math.floor(publicFloatFinviz / range) * range);
                    }
                    if (publicFloatFinviz >= 50 * million) {
                        ceilFloor = 50 * million
                    }
                    //console.log(" -> trades " + x.trades +" and interval "+ceilFloor)

                    return ceilFloor
                }
            })
            .value()

        //console.log("group by share float " + JSON.stringify(groups.shareFloat))

        /*******************
         * GROUP BY MARKET CAP
         *******************/
        groups.mktCap = _(temp1)
            .filter(object => _.has(object, path))
            .groupBy(x => {
                let ceilTrades
                var mktCap = x.financials.mktCap
                if (mktCap != null) {
                    //console.log("mktCap " + mktCap)
                    //Mega-cap: Market cap of $200 billion and greater
                    //Big-cap: $10 billion and greater
                    //Mid-cap: $2 billion to $10 billion
                    //Small-cap: $300 million to $2 billion
                    //Micro-cap: $50 million to $300 million
                    //Nano-cap: Under $50 million
                    if (mktCap <= 50 * 1000000) {
                        ceilTrades = 50 * 1000000
                    }
                    if (mktCap > 50 * 1000000 && mktCap <= 300 * 1000000) {
                        ceilTrades = 300 * 1000000
                    }
                    if (mktCap > 300 * 1000000 && mktCap <= 2000 * 1000000) {
                        ceilTrades = 2000 * 1000000
                    }
                    if (mktCap > 2000 * 1000000 && mktCap <= 10000 * 1000000) {
                        ceilTrades = 10000 * 1000000
                    }
                    if (mktCap > 10000 * 1000000) {
                        ceilTrades = 10001 * 1000000
                    }
                    //console.log(" -> interval "+ceilTrades)

                    return ceilTrades
                }
            })
            .value()

        //console.log("group by mktCap " + JSON.stringify(groups.mktCap))


        /*******************
         * GROUP BY ENTRYPRICE
         *******************/
        groups.entryPrice = _(temp1)
            .groupBy(x => {
                // under 5, 5-9.99, 10-14.99, 15-19.99, 20-29.99, above 30 trades
                let floorNum
                if (x.entryPrice < 30) {
                    var range = 5
                    floorNum = (Math.floor(x.entryPrice / range) * range);
                }
                if (x.entryPrice >= 30) {
                    floorNum = 30
                }
                //console.log(" -> Entry price "+x.entryPrice+" and interval "+floor)

                return floorNum
            })
            .value()
        //console.log("group by entryprice " + JSON.stringify(groups.entryPrice))
        resolve()
    })
}

/***************************************
         * GETTING AND CALCULATING MFE
         ***************************************/
//get data from excursions db
export async function useCalculateProfitAnalysis(param) {
    console.log("\nCALCULATING PROFIT ANALYSIS")
    return new Promise(async (resolve, reject) => {
        //console.log(" -> Getting MFE Prices")
        let mfePricesArray = []
        for (let key in profitAnalysis) delete profitAnalysis[key]
        mfePricesArray = excursions
        //console.log("  --> MFE prices array "+JSON.stringify(mfePricesArray))
        /*console.log(" -> Getting average quantity")
        let averageQuantity = totals.quantity / 2 / totals.trades
        console.log("  --> Average quantity "+averageQuantity)*/
        //console.log(" totals "+JSON.stringify(totals))
        if (JSON.stringify(totals) != '{}') {
            //console.log(" -> Calculating profit loss ratio risk&reward and MFE")
            //console.log(" -> Calculating gross and net Average Win Per Share")
            profitAnalysis.grossAvWinPerShare = (totals.grossSharePLWins / totals.grossWinsCount)
            profitAnalysis.netAvWinPerShare = (totals.netSharePLWins / totals.netWinsCount)
            //console.log("  --> Gross average win per share "+grossAvWinPerShare+" and net "+netAvWinPerShare)

            //console.log(" -> Calculating gross and net Average Loss Per Share")
            profitAnalysis.grossAvLossPerShare = (-totals.grossSharePLLoss / totals.grossLossCount)
            profitAnalysis.netAvLossPerShare = (-totals.netSharePLLoss / totals.netLossCount)
            //console.log("  --> Gross Average Loss Per Share "+grossAvLossPerShare+" and net "+netAvLossPerShare)

            //console.log(" -> Calculating gross and net Highest Win Per Share")
            profitAnalysis.grossHighWinPerShare = totals.highGrossSharePLWin
            profitAnalysis.netHighWinPerShare = totals.highNetSharePLWin
            //console.log("  --> Gross Highest Win Per Share "+grossHighWinPerShare+" and net stop loss "+netHighWinPerShare)

            //console.log(" -> Calculating gross and net Highest Loss Per Share")
            profitAnalysis.grossHighLossPerShare = -totals.highGrossSharePLLoss
            profitAnalysis.netHighLossPerShare = -totals.highNetSharePLLoss
            //console.log("  --> Gross Highest Loss Per Share "+grossHighLossPerShare+" and net stop loss "+netHighLossPerShare)

            //console.log(" -> Calculating gross and net R")
            profitAnalysis.grossR = profitAnalysis.grossAvWinPerShare / profitAnalysis.grossAvLossPerShare
            profitAnalysis.netR = profitAnalysis.netAvWinPerShare / profitAnalysis.netAvLossPerShare
            //console.log("  --> Gross R " + profitAnalysis.grossR + " and net R " + profitAnalysis.netR)

            //console.log(" -> Calculating gross and net mfe R")
            //console.log(" -> Filtered trades "+JSON.stringify(filteredTrades.trades))
            let grossMfeRArray = []
            let netMfeRArray = []

            mfePricesArray.forEach(element => {

                //console.log(" -> Filtered trades "+JSON.stringify(filteredTrades))
                if (filteredTrades.length > 0) {
                    //console.log(" filteredTrades "+JSON.stringify(filteredTrades))
                    //console.log(" date unix "+element.dateUnix)
                    let tradeFilter = filteredTrades.find(x => x.dateUnix == element.dateUnix)
                    //console.log(" tradeFilter "+JSON.stringify(tradeFilter))
                    if (tradeFilter != undefined) {
                        //console.log(" tradeFilter " + JSON.stringify(tradeFilter))
                        let trade = tradeFilter.trades.find(x => x.id == element.tradeId)
                        if (trade != undefined) {
                            //console.log(" -> Trade " + JSON.stringify(trade))
                            let tradeEntryPrice = trade.entryPrice
                            //console.log(" Entry price " + tradeEntryPrice + " | MFE Price " + element.mfePrice)
                            let entryMfeDiff
                            trade.strategy == "long" ? entryMfeDiff = (element.mfePrice - tradeEntryPrice) : entryMfeDiff = (tradeEntryPrice - element.mfePrice)
                            let grossMfeR = entryMfeDiff / profitAnalysis.grossAvLossPerShare
                            //console.log("  --> Strategy "+trade.strategy+", entry price : "+tradeEntryPrice+", mfe price "+element.mfePrice+", diff "+entryMfeDiff+" and grosmfe R "+grossMfeR)
                            grossMfeRArray.push(grossMfeR)
                            let netMfeR = entryMfeDiff / profitAnalysis.netAvLossPerShare
                            netMfeRArray.push(netMfeR)
                        }
                    }
                }
            })
            //console.log("  --> Gross mfeArray " + grossMfeRArray + " and net " + netMfeRArray)

            //console.log(" -> Getting gross and net win rate")
            let grossWin = totals.probGrossWins
            let netWin = totals.probNetWins
            //console.log("  --> Gross win "+grossWin+" and net win "+netWin)

            //console.log(" -> Calculating gross and net current expected return")
            let grossCurrExpectReturn = profitAnalysis.grossR * grossWin
            let netCurrExpectReturn = profitAnalysis.netR * netWin
            //console.log("  --> Gross current expected return "+grossCurrExpectReturn+" and net "+netCurrExpectReturn)

            //console.log(" -> Calculating mfe expected return")
            const takeProfitRLevels = []
            for (let index = 1; index <= 20; index += 0.5) {
                takeProfitRLevels.push(index)

            }

            let profitTakingAnalysis = []
            let grossMfeRArrayLength = grossMfeRArray.length
            let netMfeRArrayLength = netMfeRArray.length
            let previousGrossExpectReturn = 0
            let previousNetExpectReturn = 0
            let tempGrossMfeR
            let tempGrossExpectedReturn = 0
            let tempNetMfeR
            let tempNetExpectedReturn = 0
            takeProfitRLevels.forEach(element => {
                let temp = {}
                let occurenceGross = grossMfeRArray.filter(x => x >= element).length
                let occurenceNet = netMfeRArray.filter(x => x >= element).length
                temp.rLevel = element
                temp.winRateGross = occurenceGross / grossMfeRArrayLength
                temp.grossExpectReturn = temp.winRateGross * element
                temp.winRateNet = occurenceNet / netMfeRArrayLength
                temp.netExpectReturn = temp.winRateNet * element
                if (temp.grossExpectReturn > previousGrossExpectReturn) {
                    previousGrossExpectReturn = temp.grossExpectReturn
                    tempGrossMfeR = element
                    tempGrossExpectedReturn = temp.grossExpectReturn
                }
                if (temp.netExpectReturn > previousNetExpectReturn) {
                    previousNetExpectReturn = temp.netExpectReturn
                    tempNetMfeR = element
                    tempNetExpectedReturn = temp.netExpectReturn
                }
                profitTakingAnalysis.push(temp)
            });
            //console.log("  --> Profit Taking Analysis "+JSON.stringify(profitTakingAnalysis))
            //console.table(profitTakingAnalysis)
            profitAnalysis.grossMfeR = null
            profitAnalysis.netMfeR = null
            if (tempGrossExpectedReturn > grossCurrExpectReturn) profitAnalysis.grossMfeR = tempGrossMfeR
            if (tempNetExpectedReturn > netCurrExpectReturn) profitAnalysis.netMfeR = tempNetMfeR

            //console.log("  --> Gross MFE " + profitAnalysis.grossMfeR + " and net " + profitAnalysis.netMfeR)
            //console.log("  --> Profit analysis " + JSON.stringify(profitAnalysis))
        }

        resolve()
    })
}

async function calculateSatisfaction(param) {
    console.log("\nCALCULATING SATISFACTION")
    return new Promise(async (resolve, reject) => {
        console.log(" -> Getting Satisfactions")
        const parseObject = Parse.Object.extend("satisfactions");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current())
        query.greaterThanOrEqualTo("dateUnix", selectedDateRange.value.start)
        query.lessThanOrEqualTo("dateUnix", selectedDateRange.value.end)
        query.ascending("order");
        query.limit(queryLimit.value); // limit to at most 10 results
        mfePricesArray = []
        const results = await query.find();
        mfePricesArray = JSON.parse(JSON.stringify(results))
        //console.log("  --> MFE prices "+mfePricesArray)
        resolve()
    })
}

export async function useRefreshTrades() {
    console.log("\nREFRESHING INFO")
    await (spinnerLoadingPage.value = true)
    if (pageId.value == "dashboard") {
        useMountDashboard()
    } else if (pageId.value == "daily") {
        useMountDaily()
    } else if (pageId.value == "calendar") {
        useMountCalendar()
    } else {
        window.location.href = "/dashboard"
    }
}
