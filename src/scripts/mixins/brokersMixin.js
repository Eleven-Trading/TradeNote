const brokersMixin = {
    data() {
        return {
            brokers: [{
                    value: "csvTemplate",
                    label: "CSV Template"
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
                /*{
                    value: "tradeStation",
                    label: "TradeStation"
                }*/
            ],
            selectedBroker: localStorage.getItem('selectedBroker'),
        }
    },

    watch: {},

    methods: {
        /****************************
         * TRADEZERO
         ****************************/
        brokerTradeZero: async function(param) {
            return new Promise(async(resolve, reject) => {
                let papaParse = Papa.parse(param, { header: true })
                    //we need to recreate the JSON with proper date format + we simplify
                this.tradesData = JSON.parse(JSON.stringify(papaParse.data))
                console.log("tradesData " + JSON.stringify(this.tradesData))
                resolve()
            })
        },

        /****************************
         * METATRADER 5
         ****************************/
        brokerMetaTrader5: async function(param) {
            return new Promise(async(resolve, reject) => {
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
                console.log("trade data " + JSON.stringify(this.tradesData))
                resolve()
            })
        },

        /****************************
         * TD AMERITRADE
         ****************************/
        brokerTdAmeritrade: async function(param) {
            return new Promise(async(resolve, reject) => {
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
                //console.log("count cashBalanceJsonArray " +Object.keys(cashBalanceJsonArray).length)
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
                console.log(" -> Trades Data\n" + JSON.stringify(this.tradesData))
                resolve()
            })
        },

        /****************************
         * TRADESTATION
         ****************************/
        brokerTradeStation: async function(param) {
            return new Promise(async(resolve, reject) => {
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
                console.log("to sheet " + JSON.stringify(toJson))
                    //console.log("csv "+csv)
                    /*let papaParse = Papa.parse(csv, { header: true })
                        //we need to recreate the JSON with proper date format + we simplify
                    this.tradesData = JSON.parse(JSON.stringify(papaParse.data))
                    console.log("tradesData " + JSON.stringify(this.tradesData))*/
                resolve()
            })
        },
    }
}