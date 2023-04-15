const brokersMixin = {
    data() {
        return {
            brokers: [{
                    value: "template",
                    label: "Template"
                },
                {
                    value: "tradeZero",
                    label: "TradeZero"
                },
                {
                    value: "metaTrader5",
                    label: "MetaTrader 5"
                },
                {
                    value: "tdAmeritrade",
                    label: "TD Ameritrade"
                },
                {
                    value: "tradeStation",
                    label: "TradeStation"
                },
                {
                    value: "interactiveBrokers",
                    label: "Interactive Brokers"
                },
                {
                    value: "heldentrader",
                    label: "Heldentrader"
                }
            ],
            selectedBroker: localStorage.getItem('selectedBroker'),
        }
    },

    watch: {},

    methods: {
        //"T/D": "month/day/2022",

        /****************************
         * TRADEZERO
         ****************************/
        brokerTradeZero: async function(param) {
            return new Promise(async(resolve, reject) => {
                try {
                    let papaParse = Papa.parse(param, { header: true })
                        //we need to recreate the JSON with proper date format + we simplify
                    this.tradesData = JSON.parse(JSON.stringify(papaParse.data))
                    //console.log("tradesData " + JSON.stringify(this.tradesData))
                } catch (error) {
                    //console.log("  --> ERROR " + error)
                    reject(error)
                }
                resolve()
            })
        },

        /****************************
         * METATRADER 5
         ****************************/
        brokerMetaTrader5: async function(param) {
            return new Promise(async(resolve, reject) => {
                try {
                    var workbook = XLSX.read(param);
                    var result = {};
                    workbook.SheetNames.forEach((sheetName) => {
                        var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                        if (roa.length > 0) {
                            result[sheetName] = roa;
                        }
                    });
                    let accountKey = result[Object.keys(result)[0]].findIndex(item => item["Trade History Report"] == "Account:")
                        //console.log("account key " + accountKey)
                    let dealsKey = result[Object.keys(result)[0]].findIndex(item => item["Trade History Report"] == "Deals")
                        //console.log("deals key " + dealsKey)

                    let accountJson = result[Object.keys(result)[0]][accountKey] // doit it this way instead of naming keys in case key names change
                    let account = [Object.values(accountJson)[1]][0].split(" ")[0]
                        //console.log("Account "+JSON.stringify(account))

                    let dealIterate = true
                    this.tradesData = []
                    for (let i = dealsKey + 2; dealIterate; i++) {
                        let temp = {}
                        let row = result[Object.keys(result)[0]][i]
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
                                temp.type = "0"
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
                                temp.Symbol = Object.values(row)[2]
                                temp.Qty = (Object.values(row)[5] * 100000).toString()
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
                                this.tradesData.push(temp)
                            }
                        }
                    }
                } catch (error) {
                    console.log("  --> ERROR " + error)
                    reject(error)
                }
                console.log("trade data " + JSON.stringify(this.tradesData))
                resolve()
            })
        },

        /****************************
         * TD AMERITRADE
         ****************************/
        brokerTdAmeritrade: async function(param) {
            return new Promise(async(resolve, reject) => {
                try {
                    let arrayLines = param.split('\n')
                    let account

                    let cashBalanceStart
                    let cashBalanceEnd
                    let accountTradeHistoryStart
                    let accountTradeHistoryEnd
                    let cashBalanceCsv
                    let accountTradeHistoryCsv


                    arrayLines.forEach((element, index) => {
                        if (element.includes("Account Statement")) {
                            account = element.split(" ")[3]
                                //console.log("account "+account)
                        }
                        if (element.includes("Cash Balance")) {
                            cashBalanceStart = (index + 1)
                        }
                        if (element.includes("Futures Statements")) {
                            cashBalanceEnd = (index - 3)
                        }
                        if (element.includes("Account Trade History")) {
                            accountTradeHistoryStart = (index + 1)
                        }
                        if (element.includes("Equities")) {
                            accountTradeHistoryEnd = (index - 2)
                        }
                    });

                    for (let index = cashBalanceStart; index <= cashBalanceEnd; index++) {
                        const element = arrayLines[index];
                        cashBalanceCsv == undefined ? cashBalanceCsv = element + "\n" : cashBalanceCsv = cashBalanceCsv + element + "\n"

                    }
                    for (let index2 = accountTradeHistoryStart; index2 <= accountTradeHistoryEnd; index2++) {
                        const element2 = arrayLines[index2];
                        //console.log("element 2 "+element2)
                        accountTradeHistoryCsv == undefined ? accountTradeHistoryCsv = element2 + "\n" : accountTradeHistoryCsv = accountTradeHistoryCsv + element2 + "\n"
                    }
                    //console.log("cashBalanceCsv \n" + cashBalanceCsv)
                    //console.log("accountTradeHistoryCsv \n" + accountTradeHistoryCsv)

                    this.tradesData = []

                    let papaParseCashBalance = Papa.parse(cashBalanceCsv, { header: true })
                    let papaParseAccountTradeHistory = Papa.parse(accountTradeHistoryCsv, { header: true })

                    let cashBalanceJsonArrayTemp = papaParseCashBalance.data
                    let accountTradeHistoryJsonArrayTemp = papaParseAccountTradeHistory.data.reverse()
                    let cashBalanceJsonArray = []
                    let accountTradeHistoryJsonArray = []

                    let commonJsonArray = []

                    const keys = Object.keys(cashBalanceJsonArrayTemp);
                    for (const key of keys) {
                        //console.log("key "+JSON.stringify(papaParseCashBalance.data[key]))
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
                    /*console.log("cashBalanceJsonArrayTemp "+JSON.stringify(cashBalanceJsonArrayTemp))
                    console.log("accountTradeHistoryJsonArrayTemp "+JSON.stringify(accountTradeHistoryJsonArrayTemp))
                    console.log("cashBalanceJsonArray "+JSON.stringify(cashBalanceJsonArray))
                    console.log("accountTradeHistoryJsonArray "+JSON.stringify(accountTradeHistoryJsonArray))*/
                    console.log("count cashBalanceJsonArray " + Object.keys(cashBalanceJsonArray).length)
                    console.log("count accountTradeHistoryJsonArray " + Object.keys(accountTradeHistoryJsonArray).length)
                    if (Object.keys(cashBalanceJsonArray).length != Object.keys(accountTradeHistoryJsonArray).length) {
                        alert("Cash Balance Json is different from Account Trade History Json")
                        return
                    }
                    for (let index = 0; index < Object.keys(cashBalanceJsonArray).length; index++) {
                        commonJsonArray.push({...cashBalanceJsonArray[index], ...accountTradeHistoryJsonArray[index] })
                    }
                    //console.log("commonJsonArray "+JSON.stringify(commonJsonArray))
                    commonJsonArray.forEach(element => {
                        //console.log("element "+JSON.stringify(element))
                        let temp = {}
                        temp.Account = account
                        temp["T/D"] = element.DATE
                        temp["S/D"] = element.DATE
                        temp.Currency = "USD"
                        temp.Type = "0"
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
                        if (qtyNumber >= 0) {
                            temp.Qty = element.Qty
                        } else {
                            temp.Qty = (-Number(element.Qty)).toString()
                        }
                        temp.Price = element.Price
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
                        this.tradesData.push(temp)
                    });
                } catch (error) {
                    console.log("  --> ERROR " + error)
                    reject(error)
                }
                console.log(" -> Trades Data\n" + JSON.stringify(this.tradesData))
                resolve()

            })
        },

        /****************************
         * TRADESTATION
         ****************************/
        brokerTradeStation: async function(param) {
            return new Promise(async(resolve, reject) => {
                try {
                    var workbook = XLSX.read(param);
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
                    this.tradesData = []

                    toJson.forEach(element => {
                        if (element["Order Status"] == "Filled") {
                            console.log("element " + JSON.stringify(element))
                            let temp = {}
                            temp.Account = element.Account.toString()

                            let tempDate = element.Entered.split(" ")[0]
                            let newDate = tempDate.split("/")[0] + "/" + tempDate.split("/")[1] + "/20" + tempDate.split("/")[2]

                            temp["T/D"] = newDate
                            temp["S/D"] = newDate
                            temp.Currency = "USD"
                            temp.Type = "0"
                            if (element.Type == "Buy") {
                                temp.Side = "B"
                            }
                            if (element.Type == "Buy to Cover") {
                                temp.Side = "BC"
                            }
                            if (element.Type == "Sell") {
                                temp.Side = "S"
                            }
                            if (element.Type == "Sell Short") {
                                temp.Side = "SS"
                            }
                            temp.Symbol = element.Symbol.trim()
                            temp.Qty = element["Qty Filled"].toString()
                            temp.Price = element["Filled Price"].toString()

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

                            temp.Comm = element.Commission.toString()
                            temp.SEC = "0"
                            temp.TAF = "0"
                            temp.NSCC = "0"
                            temp.Nasdaq = "0"
                            temp["ECN Remove"] = "0"
                            temp["ECN Add"] = "0"
                            if (temp.Side == "B" || temp.Side == "BC") {
                                temp["Gross Proceeds"] = (-element["Qty Filled"] * element["Filled Price"]).toString()
                                temp["Net Proceeds"] = ((-element["Qty Filled"] * element["Filled Price"]) - element.Commission).toString()

                            } else {
                                temp["Gross Proceeds"] = (element["Qty Filled"] * element["Filled Price"]).toString()
                                temp["Net Proceeds"] = ((element["Qty Filled"] * element["Filled Price"]) - element.Commission).toString()
                            }

                            temp["Clr Broker"] = ""
                            temp.Liq = ""
                            temp.Note = ""
                                //console.log("temp "+JSON.stringify(temp))
                            this.tradesData.push(temp)
                        }
                    });
                    console.log(" -> Trades Data\n" + JSON.stringify(this.tradesData))
                } catch (error) {
                    console.log("  --> ERROR " + error)
                    reject(error)
                }
                resolve()
            })
        },

        /****************************
         * INTERACTIVE BROKERS
         ****************************/
        brokerInteractiveBrokers: async function(param) {
            return new Promise(async(resolve, reject) => {
                try {
                    this.tradesData = []
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
                            temp.Type = "0"
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

                            let tempEntryYear = element.OrderTime.split(";")[0].slice(0, 4)
                            let tempEntryMonth = element.OrderTime.split(";")[0].slice(4, 6)
                            let tempEntryDay = element.OrderTime.split(";")[0].slice(6, 8)
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
                            this.tradesData.push(temp)
                        }
                    });
                    console.log(" -> Trades Data\n" + JSON.stringify(this.tradesData))
                } catch (error) {
                    console.log("  --> ERROR " + error)
                    reject(error)
                }
                resolve()
            })
        },

        /****************************
         * HELDENTRADER
         ****************************/
        brokerHeldentrader: async function(param) {
            return new Promise(async(resolve, reject) => {
                    try {
                        //console.log(" param " + param)
                        let newCsv = [];
                        let lines = param.split("\n");
                        lines.forEach((item, i) => {
                            if (i !== 0) newCsv.push(item);
                        })

                        newCsv = newCsv.join("\n");
                        //console.log(newCsv);

                    this.tradesData = []
                    let papaParse = Papa.parse(newCsv, { header: true })
                        //we need to recreate the JSON with proper date format + we simplify
                    //console.log("papaparse " + JSON.stringify(papaParse.data))
                        papaParse.data.forEach(element => {
                            if (element.Account && element.Account != "Total") {
                                //console.log("element " + JSON.stringify(element))
                                let temp = {}
                                temp.Account = element.Account
                                //let tempDate = dayjs(element.Date).tz(this.tradeTimeZone).format('MM/DD/YYYYTHH:mm:ss')
                                //console.log(" tempDate "+tempDate)
                                    //console.log("element.TradeDate. " + element.TradeDate)
                                let tempDate = element.Date.split(" ")[0]
                                let tempTime = element.Date.split(" ")[1]
                                let tempDD = tempDate.split(".")[0]
                                let tempMM = tempDate.split(".")[1]
                                let tempYYYY = tempDate.split(".")[2]

                                //let tempTime = element.Date.split(" ")[1]
                                
                                let newTime = tempMM+"/"+tempDD+"/"+tempYYYY+" "+tempTime
                                //console.log(" newTime "+newTime)
                                temp["T/D"] = dayjs(newTime).tz(this.tradeTimeZone).format('MM/DD/YYYY')
                                temp["S/D"] = dayjs(newTime).tz(this.tradeTimeZone).format('MM/DD/YYYY')
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

                                temp["Exec Time"] = dayjs(newTime).tz(this.tradeTimeZone).format('HH:mm:ss')

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
                                this.tradesData.unshift(temp)
                            }
                        })
                        
                    //console.log(" -> Trades Data\n" + JSON.stringify(this.tradesData))
                } catch (error) {
                    console.log("  --> ERROR " + error)
                    reject(error)
                }
                resolve()
            })
    },
}
}