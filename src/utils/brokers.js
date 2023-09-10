
//"T/D": "month/day/2022",

import { tradesData, timeZoneTrade, futureContractsUsd } from "../stores/globals"

/****************************
 * TRADEZERO
 ****************************/
export async function useBrokerTradeZero(param) {
    return new Promise(async (resolve, reject) => {
        try {
            let papaParse = Papa.parse(param, { header: true })
            //we need to recreate the JSON with proper date format + we simplify
            tradesData.length = 0
            papaParse.data.forEach(element => {
                tradesData.push(JSON.parse(JSON.stringify(element)))
            });

            //console.log("tradesData " + JSON.stringify(tradesData))
        } catch (error) {
            //console.log("  --> ERROR " + error)
            reject(error)
        }
        resolve()
    })
}

/****************************
 * METATRADER 5
 ****************************/
export async function useBrokerMetaTrader5(param) {
    return new Promise(async (resolve, reject) => {
        try {
            var workbook = XLSX.read(param);
            var result = {};
            workbook.SheetNames.forEach((sheetName) => {
                var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                if (roa.length > 0) {
                    result[sheetName] = roa;
                }
            });
            //console.log("result "+JSON.stringify(result))
            let accountKey = result[Object.keys(result)[0]].findIndex(item => item["Trade History Report"] == "Account:")
            //console.log("account key " + accountKey)
            let dealsKey = result[Object.keys(result)[0]].findIndex(item => item["Trade History Report"] == "Deals")
            //console.log("deals key " + dealsKey)

            let accountJson = result[Object.keys(result)[0]][accountKey] // doit it this way instead of naming keys in case key names change
            let account = [Object.values(accountJson)[1]][0].split(" ")[0]
            //console.log("Account "+JSON.stringify(account))

            let dealIterate = true
            tradesData.length = 0
            for (let i = dealsKey + 2; dealIterate; i++) {
                let temp = {}
                let row = result[Object.keys(result)[0]][i]
                //console.log("row "+JSON.stringify(row))
                if (!row.hasOwnProperty("Trade History Report")) {
                    dealIterate = false
                } else {
                    //console.log("row "+JSON.stringify(row))
                    //check for balance
                    let checkBalance = Object.values(row)[2]
                    if (checkBalance != "balance") {
                        temp.Account = account
                        let tempDate = Object.values(row)[0].split(" ")[0]
                        let newDate = tempDate.split(".")[1] + "/" + tempDate.split(".")[2] + "/" + tempDate.split(".")[0]
                        temp["T/D"] = newDate
                        temp["S/D"] = newDate
                        temp.Currency = "USD"
                        temp.Type = "stock"
                        if (Object.values(row)[2].length == 6 && /^[a-zA-Z]/.test(Object.values(row)[2])){
                            temp.Type = "forex"
                        }
                        console.log("  --> Type: "+temp.Type)
                        if (Object.values(row)[3] == "buy" && Object.values(row)[4] == "in") {
                            temp.Side = "B"
                        }
                        if (Object.values(row)[3] == "buy" && Object.values(row)[4] == "out") {
                            temp.Side = "BC"
                        }
                        if (Object.values(row)[3] == "sell" && Object.values(row)[4] == "in") {
                            temp.Side = "SS"
                        }
                        if (Object.values(row)[3] == "sell" && Object.values(row)[4] == "out") {
                            temp.Side = "S"
                        }
                        temp.Symbol = Object.values(row)[2].replace(/#*/, '')
                        temp.Qty = (Object.values(row)[5]).toString()
                        //console.log(" -> Qty import "+temp.Qty)
                        temp.Price = Object.values(row)[6].toString()
                        temp["Exec Time"] = Object.values(row)[0].split(" ")[1]
                        temp.Comm = (-Object.values(row)[8]).toString()
                        temp.SEC = (-Object.values(row)[9]).toString()
                        temp.TAF = (-Object.values(row)[10]).toString()
                        temp.NSCC = "0"
                        temp.Nasdaq = "0"
                        temp["ECN Remove"] = "0"
                        temp["ECN Add"] = "0"
                        temp["Gross Proceeds"] = Object.values(row)[11].toString()
                        temp["Net Proceeds"] = (Object.values(row)[11] + Object.values(row)[8] + Object.values(row)[9] + Object.values(row)[10]).toString()
                        temp["Clr Broker"] = ""
                        temp.Liq = ""
                        temp.Note = ""
                        tradesData.push(temp)
                    }
                }
            }
        } catch (error) {
            console.log("  --> ERROR " + error)
            reject(error)
        }
        //console.log("trade data " + JSON.stringify(tradesData))
        resolve()
    })
}


/****************************
 * TD AMERITRADE
 ****************************/
export async function useBrokerTdAmeritrade(param) {
    return new Promise(async (resolve, reject) => {
        try {
            let arrayLines = param.split('\n')
            let account

            let cashBalanceStart
            let cashBalanceEnd
            let accountTradeHistoryStart
            let accountTradeHistoryEnd = 0
            let cashBalanceCsv
            let accountTradeHistoryCsv


            arrayLines.forEach((element, index) => {
                if (element.includes("Account Statement")) {
                    account = element.split(" ")[3]
                    //console.log("account "+account)
                }
                if (element.includes("Cash Balance")) {
                    cashBalanceStart = (index + 1)
                    console.log("  --> Cash Balance start row " + cashBalanceStart)
                }
                if (element.includes("Futures Statements")) {
                    cashBalanceEnd = (index - 3)
                    console.log("  --> Cash Balance end row " + cashBalanceEnd)
                }
                if (element.includes("Account Trade History")) {
                    accountTradeHistoryStart = (index + 1)
                    console.log("  --> Account Trade History start row " + accountTradeHistoryStart)
                }

                if ((element.includes("Options") || element.includes("Futures") || element.includes("Equities") || element.includes("Profits and Losses")) && accountTradeHistoryEnd == 0 && (index - 2) > accountTradeHistoryStart) {
                    accountTradeHistoryEnd = (index - 2)
                    console.log("  --> Account Trade History end row " + accountTradeHistoryEnd)
                }
            });

            for (let index = cashBalanceStart; index <= cashBalanceEnd; index++) {
                const element = arrayLines[index];
                //console.log(" element "+element)
                cashBalanceCsv == undefined ? cashBalanceCsv = element + "\n" : cashBalanceCsv = cashBalanceCsv + element + "\n"

            }
            for (let index2 = accountTradeHistoryStart; index2 <= accountTradeHistoryEnd; index2++) {
                const element2 = arrayLines[index2];
                //console.log("element 2 "+element2)
                accountTradeHistoryCsv == undefined ? accountTradeHistoryCsv = element2 + "\n" : accountTradeHistoryCsv = accountTradeHistoryCsv + element2 + "\n"
            }
            //console.log("cashBalanceCsv \n" + cashBalanceCsv)
            //console.log("accountTradeHistoryCsv \n" + accountTradeHistoryCsv)

            tradesData.length = 0

            let papaParseCashBalance = Papa.parse(cashBalanceCsv, { header: true })
            let papaParseAccountTradeHistory = Papa.parse(accountTradeHistoryCsv, { header: true })

            let cashBalanceJsonArrayTemp = papaParseCashBalance.data
            let accountTradeHistoryJsonArrayTemp = papaParseAccountTradeHistory.data.reverse()
            let cashBalanceJsonArray = []
            let accountTradeHistoryJsonArray = []

            let commonJsonArray = []

            const keys = Object.keys(cashBalanceJsonArrayTemp);
            for (const key of keys) {
                console.log("key " + JSON.stringify(papaParseCashBalance.data[key]))
                if (cashBalanceJsonArrayTemp[key].TYPE === "TRD") {
                    cashBalanceJsonArray.push(cashBalanceJsonArrayTemp[key])
                }
            }

            const keys2 = Object.keys(accountTradeHistoryJsonArrayTemp);
            for (const key2 of keys2) {
                if (accountTradeHistoryJsonArrayTemp[key2].hasOwnProperty("Symbol")) {
                    accountTradeHistoryJsonArray.push(accountTradeHistoryJsonArrayTemp[key2])
                }
            }
            //console.log("cashBalanceJsonArrayTemp "+JSON.stringify(cashBalanceJsonArrayTemp))
            //console.log("accountTradeHistoryJsonArrayTemp "+JSON.stringify(accountTradeHistoryJsonArrayTemp))
            console.log("cashBalanceJsonArray "+JSON.stringify(cashBalanceJsonArray))
            console.log("accountTradeHistoryJsonArray "+JSON.stringify(accountTradeHistoryJsonArray))
            console.log("count cashBalanceJsonArray " + Object.keys(cashBalanceJsonArray).length)
            console.log("count accountTradeHistoryJsonArray " + Object.keys(accountTradeHistoryJsonArray).length)
            if (Object.keys(cashBalanceJsonArray).length != Object.keys(accountTradeHistoryJsonArray).length) {
                alert("Cash Balance Json is different from Account Trade History Json")
                return
            }
            for (let index = 0; index < Object.keys(cashBalanceJsonArray).length; index++) {
                commonJsonArray.push({ ...cashBalanceJsonArray[index], ...accountTradeHistoryJsonArray[index] })
            }
            //console.log("commonJsonArray "+JSON.stringify(commonJsonArray))
            commonJsonArray.forEach(element => {
                //console.log("element "+JSON.stringify(element))
                let temp = {}
                temp.Account = account

                let tempDate = element.DATE.split(" ")[0]
                let month = tempDate.split("/")[0]
                let day = tempDate.split("/")[1]
                let year = tempDate.split("/")[2]
                //console.log(" -> Year " + year)
                //console.log(" -> Year length " + year.length)
                if (year.length == 4) {
                    temp["T/D"] = element.DATE
                    temp["S/D"] = element.DATE
                } else if (year.length == 2) {
                    let newDate = month + "/" + day + "/20" + year
                    temp["T/D"] = newDate
                    temp["S/D"] = newDate
                } else {
                    alert("Year length issue")
                }

                temp.Currency = "USD"

                //Type
                temp.Type = "stock"
                if (element.type == "FUTURE") {
                    temp.Type = "future"
                }
                if (element.type == "CALL" || element.type == "PUT") {
                    element.type == "CALL" ? temp.Type = "call" : element.type == "put"
                }
                console.log("  --> Type " + temp.Type)

                if (element.Side == "BUY" && element["Pos Effect"] == "TO OPEN") {
                    temp.Side = "B"
                }
                if (element.Side == "BUY" && element["Pos Effect"] == "TO CLOSE") {
                    temp.Side = "BC"
                }
                if (element.Side == "SELL" && element["Pos Effect"] == "TO OPEN") {
                    temp.Side = "SS"
                }
                if (element.Side == "SELL" && element["Pos Effect"] == "TO CLOSE") {
                    temp.Side = "S"
                }
                temp.Symbol = element.Symbol

                let qtyNumber = Number(element.Qty)
                qtyNumber >= 0 ? qtyNumber = qtyNumber : qtyNumber = -qtyNumber
                temp.Qty = qtyNumber.toString()

                let priceNumber = Number(element.Price)
                temp.Price = priceNumber.toString
                
                temp["Exec Time"] = element.TIME

                let numberAmount = parseFloat(element.AMOUNT.replace(/,/g, ''))
                let numberCommissions = element["Commissions & Fees"] != "" ? parseFloat(element["Commissions & Fees"].replace(/,/g, '')) : 0
                let numberMisc = element["Misc Fees"] != "" ? parseFloat(element["Misc Fees"].replace(/,/g, '')) : 0

                temp.Comm = (-numberCommissions).toString()
                temp.SEC = (-numberMisc).toString()
                temp.TAF = "0"
                temp.NSCC = "0"
                temp.Nasdaq = "0"
                temp["ECN Remove"] = "0"
                temp["ECN Add"] = "0"
                temp["Gross Proceeds"] = numberAmount.toString()
                temp["Net Proceeds"] = (numberAmount + numberCommissions + numberMisc).toString()
                temp["Clr Broker"] = ""
                temp.Liq = ""
                temp.Note = ""
                tradesData.push(temp)
            });
        } catch (error) {
            console.log("  --> ERROR " + error)
            reject(error)
        }
        //console.log(" -> Trades Data\n" + JSON.stringify(tradesData))
        resolve()

    })
}

/****************************
 * TRADESTATION
 ****************************/
export async function useBrokerTradeStation(param) {
    return new Promise(async (resolve, reject) => {
        try {
            //console.log(" param " + param)
            let newCsv = [];
            let lines = param.split("\n");
            lines.forEach((item, i) => {
                if (i !== 0) newCsv.push(item);
            })

            newCsv = newCsv.join("\n");
            //console.log(newCsv);

            tradesData.length = 0
            let papaParse = Papa.parse(newCsv, { header: true })
            //we need to recreate the JSON with proper date format + we simplify
            //console.log("papaparse " + JSON.stringify(papaParse.data))

            /*var workbook = XLSX.read(param);
            var result = {};
            //As this is text but looks like an excel we need to take back and fourth steps
            //1 - Create array of arrays (https://docs.sheetjs.com/docs/api/utilities)
            let roa = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
            if (roa.length > 0) {
                //console.log("roa "+JSON.stringify(roa))
                result = roa;
            }

            //console.log("result " + JSON.stringify(result))

            //2 - Create an excel sheet
            let toSheet = XLSX.utils.aoa_to_sheet(result)
            //console.log("to sheet " + JSON.stringify(toSheet))
            //3 - Now that we have a proper excel sheet, we create json with correct keys
            let toJson = XLSX.utils.sheet_to_json(toSheet)
            //console.log("to sheet " + JSON.stringify(toJson))
            tradesData.length = 0
            */
            papaParse.data.forEach(element => {
                //console.log("element " + JSON.stringify(element))
                if (element["Order Status"] == "Filled") {
                    //console.log("element " + JSON.stringify(element))
                    let temp = {}
                    temp.Account = element.Account.toString()

                    let tempDate = element.Entered.split(" ")[0]
                    let newDate = tempDate.split("/")[0] + "/" + tempDate.split("/")[1] + "/20" + tempDate.split("/")[2]

                    temp["T/D"] = newDate
                    temp["S/D"] = newDate
                    temp.Currency = "USD"

                    //Type
                    temp.Type = "stock"
                    if (element["Contract Exp Date"] != "") {
                        temp.Type = "future"
                    }

                    if (element.Type.includes("to Open") || element.Type.includes("to Close")) {
                        element.Symbol.trim().split(" ")[1].charAt(6) == "C" ? temp.Type = "call" : temp.Type = "put"
                    }
                    console.log("  --> Type " + temp.Type)

                    if (element.Type == "Buy") {
                        temp.Side = "B"
                    }
                    if (element.Type == "Buy to Open") {
                        temp.Side = "B"
                    }

                    if (element.Type == "Buy to Cover") {
                        temp.Side = "BC"
                    }
                    if (element.Type == "Buy to Close") {
                        temp.Side = "BC"
                    }

                    if (element.Type == "Sell") {
                        temp.Side = "S"
                    }
                    if (element.Type == "Sell to Close") {
                        temp.Side = "S"
                    }

                    if (element.Type == "Sell Short") {
                        temp.Side = "SS"
                    }
                    if (element.Type == "Sell to Open") {
                        temp.Side = "SS"
                    }

                    temp.Symbol = element.Symbol.trim()
                    if (temp.Type == "future") {
                        temp.Symbol = temp.Symbol.slice(0, -3)
                    }
                    if (temp.Type == "call" || temp.Type == "put") {
                        temp.Symbol = temp.Symbol.split(" ")[0]
                    }

                    let qtyNumber = Number(element["Qty Filled"])
                    temp.Qty = qtyNumber.toString()

                    //Futures have big prices, comma separated
                    let priceNumber = Number(element["Filled Price"].replace(/,/g, ''))
                    //console.log("priceNumber "+priceNumber)
                    temp.Price = priceNumber.toString()

                    let tempTime = element.Entered.split(" ")[1]
                    let tempTimeAMPM = element.Entered.split(" ")[2]
                    let tempHour = Number(tempTime.split(":")[0])
                    let newTime
                    if (tempTimeAMPM == "PM" && tempHour != 12) {
                        tempHour = tempHour + 12
                        newTime = tempHour + ":" + tempTime.split(":")[1] + ":" + tempTime.split(":")[2]
                    } else {
                        newTime = tempTime
                    }

                    temp["Exec Time"] = newTime

                    let commNumber = Number(element.Commission.replace("$", ""))
                    temp.Comm = commNumber.toString()
                    
                    temp.SEC = "0"
                    temp.TAF = "0"
                    temp.NSCC = "0"
                    temp.Nasdaq = "0"
                    temp["ECN Remove"] = "0"
                    temp["ECN Add"] = "0"

                    let tick
                    let value
                    if (temp.Type == "future") {
                        let contractSpecs = futureContractsUsd.value.filter(item => item.symbol == temp.Symbol)
                        tick = contractSpecs[0].tick
                        value = contractSpecs[0].value
                    }

                    //let's prepare and calculate qty and proceeds, depending on side and type
                    let qtyNumberSide
                    let proceedsNumber

                    if (temp.Side == "B" || temp.Side == "BC") {
                        qtyNumberSide = -qtyNumber
                    } else {
                        qtyNumberSide = qtyNumber
                    }

                    if (temp.Type == "stock") {
                        proceedsNumber = (qtyNumberSide * priceNumber)
                    }
                    if (temp.Type == "future") {
                        proceedsNumber = (qtyNumberSide * priceNumber) / tick * value
                    }
                    if (temp.Type == "call" || temp.Type == "put") {
                        proceedsNumber = (qtyNumberSide * 100 * priceNumber)
                    }
                    
                    temp["Gross Proceeds"] = proceedsNumber.toString()
                    temp["Net Proceeds"] = (proceedsNumber - commNumber).toString()

                    temp["Clr Broker"] = ""
                    temp.Liq = ""
                    temp.Note = ""
                    //console.log("temp "+JSON.stringify(temp))
                    tradesData.push(temp)
                }
            });
            //console.log(" -> Trades Data\n" + JSON.stringify(tradesData))

        } catch (error) {
            console.log("  --> ERROR " + error)
            reject(error)
        }
        resolve()
    })
}

/****************************
 * INTERACTIVE BROKERS
 ****************************/
export async function useBrokerInteractiveBrokers(param) {
    return new Promise(async (resolve, reject) => {
        try {
            tradesData.length = 0
            let papaParse = Papa.parse(param, { header: true })
            //we need to recreate the JSON with proper date format + we simplify
            //console.log("papaparse " + JSON.stringify(papaParse.data))
            papaParse.data.forEach(element => {
                if (element.ClientAccountID) {
                    //console.log("element " + JSON.stringify(element))
                    let temp = {}
                    temp.Account = element.ClientAccountID
                    //console.log("element.TradeDate. " + element.TradeDate)
                    let tempYear = element.TradeDate.slice(0, 4)
                    let tempMonth = element.TradeDate.slice(4, 6)
                    let tempDay = element.TradeDate.slice(6, 8)
                    let newDate = tempMonth + "/" + tempDay + "/" + tempYear

                    temp["T/D"] = newDate
                    temp["S/D"] = newDate
                    temp.Currency = element.CurrencyPrimary
                    //Type
                    temp.Type = "stock"
                    if (element.AssetClass == "FUT") {
                        temp.Type = "future"
                    }
                    if (element.AssetClass == "OPT") {
                        element["Put/Call"] == "C" ? temp.Type = "call" : temp.Type = "put"
                    }
                    console.log("  --> Type " + temp.Type)

                    if (element["Buy/Sell"] == "BUY") {
                        temp.Side = "B"
                    }
                    if (element["Buy/Sell"] == "BUY COVER") {
                        temp.Side = "BC"
                    }
                    if (element["Buy/Sell"] == "SELL") {
                        temp.Side = "S"
                    }
                    if (element["Buy/Sell"] == "SELL SHORT") {
                        temp.Side = "SS"
                    }
                    temp.Symbol = element.Symbol.split(" ")[0]
                    temp.Qty = Number(element.Quantity) < 0 ? (-Number(element.Quantity)).toString() : element.Quantity
                    temp.Price = element.Price

                    let tempEntryHour = element.OrderTime.split(";")[1].slice(0, 2)
                    let tempEntryMinutes = element.OrderTime.split(";")[1].slice(2, 4)
                    let tempEntrySeconds = element.OrderTime.split(";")[1].slice(4, 6)

                    temp["Exec Time"] = tempEntryHour + ":" + tempEntryMinutes + ":" + tempEntrySeconds

                    temp.Comm = (-Number(element.Commission)).toString()
                    temp.SEC = "0"
                    temp.TAF = "0"
                    temp.NSCC = "0"
                    temp.Nasdaq = "0"
                    temp["ECN Remove"] = "0"
                    temp["ECN Add"] = "0"
                    temp["Gross Proceeds"] = element.Proceeds
                    temp["Net Proceeds"] = element.NetCash
                    temp["Clr Broker"] = ""
                    temp.Liq = ""
                    temp.Note = ""
                    //console.log("temp "+JSON.stringify(temp))
                    tradesData.push(temp)
                }
            });
            console.log(" -> Trades Data\n" + JSON.stringify(tradesData))
        } catch (error) {
            console.log("  --> ERROR " + error)
            reject(error)
        }
        resolve()
    })
}

/****************************
 * HELDENTRADER
 ****************************/
export async function useBrokerHeldentrader(param) {
    return new Promise(async (resolve, reject) => {
        try {
            //console.log(" param " + param)
            let newCsv = [];
            let lines = param.split("\n");
            lines.forEach((item, i) => {
                if (i !== 0) newCsv.push(item);
            })

            newCsv = newCsv.join("\n");
            //console.log(newCsv);

            tradesData.length = 0
            let papaParse = Papa.parse(newCsv, { header: true })
            //we need to recreate the JSON with proper date format + we simplify
            //console.log("papaparse " + JSON.stringify(papaParse.data))
            papaParse.data.forEach(element => {
                if (element.Account && element.Account != "Total") {
                    //console.log("element " + JSON.stringify(element))
                    let temp = {}
                    temp.Account = element.Account
                    //let tempDate = dayjs(element.Date).tz(timeZoneTrade.value).format('MM/DD/YYYYTHH:mm:ss')
                    //console.log(" tempDate "+tempDate)
                    //console.log("element.TradeDate. " + element.TradeDate)
                    let tempDate = element.Date.split(" ")[0]
                    let tempTime = element.Date.split(" ")[1]
                    let tempDD = tempDate.split(".")[0]
                    let tempMM = tempDate.split(".")[1]
                    let tempYYYY = tempDate.split(".")[2]

                    //let tempTime = element.Date.split(" ")[1]

                    let newTime = tempMM + "/" + tempDD + "/" + tempYYYY + " " + tempTime
                    //console.log(" newTime "+newTime)
                    temp["T/D"] = dayjs(newTime).tz(timeZoneTrade.value).format('MM/DD/YYYY')
                    temp["S/D"] = dayjs(newTime).tz(timeZoneTrade.value).format('MM/DD/YYYY')
                    //console.log("td "+temp["T/D"])
                    temp.Currency = "USD"
                    temp.Type = "0"
                    if (element["Client order ID"] && Number(element.Profit) == 0 && element.Operation == "Buy") {
                        temp.Side = "B"
                    }
                    if (element["Client order ID"] && Number(element.Profit) == 0 && element.Operation == "Sell") {
                        temp.Side = "SS"
                    }
                    if (!element["Client order ID"] && element.Operation == "Buy") {
                        temp.Side = "BC"
                    }
                    if (!element["Client order ID"] && element.Operation == "Sell") {
                        temp.Side = "S"
                    }

                    temp.Symbol = element.Instrument
                    temp.Qty = element.Amount
                    temp.Price = element.Price

                    temp["Exec Time"] = dayjs(newTime).tz(timeZoneTrade.value).format('HH:mm:ss')

                    temp.Comm = Number(-element["Execution fee"]).toString()
                    temp.SEC = "0"
                    temp.TAF = "0"
                    temp.NSCC = "0"
                    temp.Nasdaq = "0"
                    temp["ECN Remove"] = "0"
                    temp["ECN Add"] = "0"
                    temp["Gross Proceeds"] = element.Profit
                    temp["Net Proceeds"] = (Number(temp["Gross Proceeds"]) - Number(-element["Execution fee"])).toString()
                    temp["Clr Broker"] = ""
                    temp.Liq = ""
                    temp.Note = ""
                    //console.log("temp "+JSON.stringify(temp))*/
                    tradesData.unshift(temp)
                }
            })

            //console.log(" -> Trades Data\n" + JSON.stringify(tradesData))
        } catch (error) {
            console.log("  --> ERROR " + error)
            reject(error)
        }
        resolve()
    })
}

/****************************
 * NINJATRADER
 ****************************/
export async function useNinjaTrader(param) {
    return new Promise(async (resolve, reject) => {
        try {
            tradesData.length = 0
            let papaParse = Papa.parse(param, { header: true })
            //we need to recreate the JSON with proper date format + we simplify
            //console.log("papaparse " + JSON.stringify(papaParse.data))
            let side
            papaParse.data.forEach(element => {
                if (element.Instrument) {
                    //console.log("element " + JSON.stringify(element))
                    let temp = {}
                    temp.Account = element.Account
                    //console.log("element.TradeDate. " + element.TradeDate)
                    let date = element.Time.split(" ")[0]
                    if (element.Position.split(" ")[1] != undefined){
                        side = element.Position.split(" ")[1]
                    }
                    
                    //console.log("side "+side)
                    temp["T/D"] = date
                    temp["S/D"] = date
                    temp.Currency = "USD"
                    temp.Type = "0"
                    if (element.Action == "Buy" && side == "L") {
                        temp.Side = "B"
                    }
                    if (element.Action == "Buy" && side == "S") {
                        temp.Side = "BC"
                    }
                    if (element.Action == "Sell" && side == "L") {
                        temp.Side = "S"
                    }
                    if (element.Action == "Sell" && side == "S") {
                        temp.Side = "SS"
                    }
                    temp.Symbol = element.Instrument
                    temp.Qty = element.Quantity
                    temp.Price = element.Price

                    
                    temp["Exec Time"] = dayjs(element.Time, "hh:mm:ss A").format("HH:mm:ss")

                    temp.Comm = element.Commission.split("$")[1]
                    temp.SEC = "0"
                    temp.TAF = "0"
                    temp.NSCC = "0"
                    temp.Nasdaq = "0"
                    temp["ECN Remove"] = "0"
                    temp["ECN Add"] = "0"
                    if (temp.Side == "B" || temp.Side == "BC") {
                        temp["Gross Proceeds"] = (-element.Quantity * element.Price).toString()
                        temp["Net Proceeds"] = ((-element.Quantity * element.Price) - temp.Comm).toString()

                    } else {
                        temp["Gross Proceeds"] = (element.Quantity * element.Price).toString()
                        temp["Net Proceeds"] = ((element.Quantity * element.Price) - temp.Comm).toString()
                    }
                    temp["Clr Broker"] = ""
                    temp.Liq = ""
                    temp.Note = ""
                    //console.log("temp "+JSON.stringify(temp))
                    tradesData.push(temp)
                }
            });
            console.log(" -> Trades Data\n" + JSON.stringify(tradesData))
        } catch (error) {
            console.log("  --> ERROR " + error)
            reject(error)
        }
        resolve()
    })
}