import { filteredTradesTrades, blotter, pAndL, tradeExcursionId, spinnerLoadingPage, currentUser, selectedBroker, tradesData, timeZoneTrade, uploadMfePrices, executions, tradeId, existingImports, trades, gotExistingTradesArray, existingTradesArray, brokerData, selectedTradovateTier } from '../stores/globals'
import { useBrokerHeldentrader, useBrokerInteractiveBrokers, useBrokerMetaTrader5, useBrokerTdAmeritrade, useBrokerTradeStation, useBrokerTradeZero, useTradovate, useNinjaTrader, useRithmic, useFundTraders } from './brokers'
import { useChartFormat, useDateTimeFormat, useDecimalsArithmetic, useTimeFormat } from './utils'

let openPosition = false
let tradeAccounts = []
let tempExecutions = []
let tradedSymbols = []
let tradedStartDate = null
let tradedEndDate = null
let ohlcv = []
let mfePrices = []

let openPositionsFile = []
let openPositionsParse = []

let currentTradeId


/****************************
 * TRADES
 ****************************/
export async function useImportTrades(e, param2) {
    console.log("IMPORTING FILE")
    // Using Papa Parse : https://www.papaparse.com/docs
    spinnerLoadingPage.value = true
    //spinnerLoadingPageText.value = "Importing file ..."
    //console.log(" got existing " + gotExistingTradesArray.value)
    let files
    let importFileError = false
    if (param2 == "file") {
        files = e.target.files || e.dataTransfer.files;
        if (!files.length) {
            spinnerLoadingPage.value = false
            return;
        }
    }


    const readAsText = async (param) => {
        return new Promise(async (resolve, reject) => {
            var reader = new FileReader();
            var vm = this;
            reader.onload = e => {
                resolve(reader.result)
            };
            reader.readAsText(param[0]);
        })
    }

    const readAsArrayBuffer = async (param) => {
        return new Promise(async (resolve, reject) => {
            let reader = new FileReader();
            reader.onload = e => {
                resolve(reader.result);
            };
            reader.readAsArrayBuffer(param[0]);
        })
    }

    const create = async () => {
        await createTempExecutions().catch((error) => {
            alert("Error in upload file (" + error + ")")
        })

        await createExecutions()
        if ((currentUser.value.marketDataApiKey && currentUser.value.marketDataApiKey != null && currentUser.value.marketDataApiKey != '') && uploadMfePrices.value) {
            await getOHLCV()
        }
        /*await createTrades().then(async () => {
            //console.log(" -> Open posisitions: " + openPosition)
            if (openPosition) {
                //console.log("You have one or more open positions. Please close all your positions before import.")
                alert("You have one or more open positions. Please close all your positions before import.")
                return
            } else {

                await filterExisting("trades")
                await useCreateBlotter()
                await useCreatePnL()
            }

        })*/
        await getOpenPositionsParse()
        await createTrades()
        await filterExisting("trades")
        await useCreateBlotter()
        await useCreatePnL()


        await (spinnerLoadingPage.value = false)
    }

    const importFileErrorFunction = (param) => {
        importFileError = true
        spinnerLoadingPage.value = false
        const file = document.querySelector('#tradesInput');
        file.value = '';
        alert("ERROR IN UPLOAD FILE\n" + param)
    }
    /****************************
     * TRADEZERO
     ****************************/
    if (selectedBroker.value == "tradeZero" || selectedBroker.value == "template") {
        console.log(" -> TradeZero / Template")
        let fileInput = await readAsText(files)
        await useBrokerTradeZero(fileInput).catch(error => {
            importFileErrorFunction(error)
        })
    }

    /****************************
     * METATRADER 5
     ****************************/
    if (selectedBroker.value == "metaTrader5") {
        console.log(" -> MetaTrader 5")
        let fileInput = await readAsArrayBuffer(files)
        await useBrokerMetaTrader5(fileInput).catch(error => {
            importFileErrorFunction(error)
        })
    }

    /****************************
     * TD AMERITRADE
     ****************************/
    if (selectedBroker.value == "tdAmeritrade") {
        console.log(" -> TD Ameritrade")
        let fileInput = await readAsText(files)
        await useBrokerTdAmeritrade(fileInput).catch(error => {
            importFileErrorFunction(error)
        })
    }

    /****************************
     * TRADESTATION
     ****************************/
    if (selectedBroker.value == "tradeStation") {
        console.log(" -> Trade Station")
        let fileInput = brokerData.value
        //console.log("file input "+fileInput)
        await useBrokerTradeStation(fileInput).catch(error => {
            importFileErrorFunction(error)
        })
    }

    /****************************
     * INTERACTIVE BROKERS
     ****************************/
    if (selectedBroker.value == "interactiveBrokers") {
        console.log(" -> Interactive Brokers")
        let fileInput = await readAsText(files)
        await useBrokerInteractiveBrokers(fileInput).catch(error => {
            importFileErrorFunction(error)
        })
    }

    /****************************
     * TRADOVATE
     ****************************/
    if (selectedBroker.value == "tradovate") {
        console.log(" -> Tradovate")
        console.log(' -> Selected tier ' + selectedTradovateTier.value)
        if (!selectedTradovateTier.value) {
            alert("Select commision plan")
            spinnerLoadingPage.value = false
            return
        }
        let fileInput = await readAsText(files)
        await useTradovate(fileInput).catch(error => {
            importFileErrorFunction(error)
        })
    }

    /****************************
     * NINJATRADER
     ****************************/
    if (selectedBroker.value == "ninjaTrader") {
        console.log(" -> NinjaTrader")
        let fileInput = await readAsText(files)
        await useNinjaTrader(fileInput).catch(error => {
            importFileErrorFunction(error)
        })
    }

    /****************************
     * HELDENTRADER
     ****************************/
    if (selectedBroker.value == "heldentrader") {
        console.log(" -> Heldentrader")
        let fileInput = await readAsText(files)
        await useBrokerHeldentrader(fileInput).catch(error => {
            importFileErrorFunction(error)
        })
    }

     /****************************
     * RITHMIC
     ****************************/
     if (selectedBroker.value == "rithmic") {
        console.log(" -> Rithmic")
        let fileInput = await readAsText(files)
        await useRithmic(fileInput).catch(error => {
            importFileErrorFunction(error)
        })
    }

    /****************************
     * FUNDTRADERS
     ****************************/
    if (selectedBroker.value == "fundTraders") {
        console.log(" -> FundTraders")
        let fileInput = await readAsText(files)
        await useFundTraders(fileInput).catch(error => {
            importFileErrorFunction(error)
        })
    }

    const retryFunction = (callback, delay, tries) => {

        if (tries && callback() !== true) {
            setTimeout(retryFunction.bind(this, callback, delay, tries - 1), delay);
        } else {
            //if still false, send alert else create
            if (!gotExistingTradesArray.value) {
                spinnerLoadingPage.value = false
                alert("TradeNote didn't have enough time to fetch existing trades from database before parsing your file. Please refresh the page and wait a little bit longer before adding your file and thus giving TradeNote some more time to run this background job.")
                return;
            }
            if (!importFileError) {
                create()
            } else {
                return
            }
        }
    }

    const callbackFunction = () => {
        console.log(" -> Waiting for existing trades");
        return gotExistingTradesArray.value
    }

    if (gotExistingTradesArray.value) {
        if (!importFileError) {
            create()
        } else {
            return
        }
    } else {
        retryFunction(callbackFunction, 1000, 10);
    }

}

async function createTempExecutions() {
    return new Promise(async (resolve, reject) => {
        console.log("\nCREATING TEMP EXECUTION")
        //spinnerLoadingPageText.value = "Creating temp executions"
        const keys = Object.keys(tradesData);
        var temp = [];
        var i = 0

        var lastId
        var x
        for (const key of keys) {
            try {
                let temp2 = {};
                temp2.account = tradesData[key].Account
                temp2.broker = selectedBroker.value
                if (!tradeAccounts.includes(tradesData[key].Account)) tradeAccounts.push(tradesData[key].Account)
                /*usDate = dayjs.tz("07/22/2021 00:00:00", 'MM/DD/YYYY 00:00:00', "UTC")
                //frDate = usDate.tz("Europe/Paris")
                console.log("date "+usDate+" and fr ")*/
                const dateArrayTD = tradesData[key]['T/D'].split('/');
                //console.log("dateArrayTD " + dateArrayTD)
                const formatedDateTD = dateArrayTD[2] + "-" + dateArrayTD[0] + "-" + dateArrayTD[1]
                //console.log("formatedDateTD " + formatedDateTD)
                temp2.td = dayjs.tz(formatedDateTD, timeZoneTrade.value).unix()

                const dateArraySD = tradesData[key]['S/D'].split('/');
                const formatedDateSD = dateArraySD[2] + "-" + dateArraySD[0] + "-" + dateArraySD[1]
                temp2.sd = dayjs.tz(formatedDateSD, timeZoneTrade.value).unix()

                temp2.currency = tradesData[key].Currency;
                temp2.type = tradesData[key].Type;
                temp2.side = tradesData[key].Side;
                if (temp2.side == "B") {
                    temp2.strategy = "long"
                }
                if (temp2.side == "S") {
                    temp2.strategy = "long"
                }
                if (temp2.side == "BC") {
                    temp2.strategy = "short"
                }
                if (temp2.side == "SS") {
                    temp2.strategy = "short"
                }

                temp2.symbol = tradesData[key].Symbol.replace(".", "_")
                temp2.quantity = parseFloat(tradesData[key].Qty);
                temp2.price = parseFloat(tradesData[key].Price);

                temp2.execTime = dayjs.tz(formatedDateTD + " " + tradesData[key]['Exec Time'], timeZoneTrade.value).unix()
                let tempId = "e" + temp2.execTime + "_" + temp2.symbol.replace(".", "_") + "_" + temp2.side;
                // It happens that two or more trades happen at the same (second) time. So we need to differentiated them
                if (tempId != lastId) {
                    x = 1
                    temp2.id = tempId + "_" + x
                    lastId = tempId
                    //console.log("last id "+lastId)
                } else {
                    x++
                    temp2.id = tempId + "_" + x
                }
                temp2.commission = parseFloat(tradesData[key].Comm);
                temp2.sec = parseFloat(tradesData[key].SEC);
                temp2.taf = parseFloat(tradesData[key].TAF);
                temp2.nscc = parseFloat(tradesData[key].NSCC);
                temp2.nasdaq = parseFloat(tradesData[key].Nasdaq);
                temp2.ecnRemove = parseFloat(tradesData[key]['ECN Remove']);
                temp2.ecnAdd = parseFloat(tradesData[key]['ECN Add']);
                temp2.grossProceeds = parseFloat(tradesData[key]['Gross Proceeds']);
                temp2.netProceeds = parseFloat(tradesData[key]['Net Proceeds']);
                temp2.clrBroker = tradesData[key]['Clr Broker'];
                temp2.liq = tradesData[key].Liq;
                temp2.note = tradesData[key].Note;
                temp2.trade = null;

                tempExecutions.push(temp2);

                if (!tradedSymbols.includes(temp2.symbol)) {
                    tradedSymbols.push(temp2.symbol)
                }

                if (tradedStartDate == null) {
                    //console.log("td type " + typeof + temp2.td)
                    tradedStartDate = temp2.td
                } else if (temp2.td < tradedStartDate) {
                    tradedStartDate = temp2.td
                }

                if (tradedEndDate == null) {
                    //console.log("td type " + typeof + temp2.td)
                    tradedEndDate = temp2.execTime
                } else if (temp2.execTime > tradedEndDate) {
                    tradedEndDate = temp2.execTime
                }

                //console.log(" -> Trade start date " + tradedStartDate)
                //console.log(" -> Trade end date " + tradedEndDate)
                //console.log("temp " + JSON.stringify(temp2))
                //console.log(" -> Created temp executions");
            } catch (error) {
                console.log("  --> ERROR " + error)
                reject(error)
            }
        }
        resolve()
    })
}

async function createExecutions() {
    return new Promise(async (resolve, reject) => {
        console.log("\nCREATING EXECUTIONS")
        //spinnerLoadingPageText.value = "Creating executions"
        var a = _
            .chain(tempExecutions)
            .orderBy(["execTime"], ["asc"])
            .groupBy("td");

        for (let key in executions) delete executions[key]
        Object.assign(executions, JSON.parse(JSON.stringify(a)))
        //console.log("length "+Object.keys(executions).length)
        //check if object already exists



        //console.log('executions ' + JSON.stringify(executions))
        console.log(" -> Created");
        resolve()
    })
}

async function getOHLCV() {
    return new Promise(async (resolve, reject) => {
        console.log("\nGETTING OHLCV")
        //spinnerLoadingPageText.value = "Getting OHLCV"
        const asyncLoop = async () => {
            for (let i = 0; i < tradedSymbols.length; i++) { // I think that async needs to be for instead of foreach
                let temp = {}
                temp.symbol = tradedSymbols[i]
                //console.log(" -> From date " + tradedStartDate)
                //console.log(" -> To " + tradedEndDate)
                let toDate = dayjs(tradedEndDate * 1000).tz(timeZoneTrade.value).endOf('day').unix()
                //console.log(" -> To date " + toDate)

                axios.interceptors.response.use(undefined, (err) => {
                    const { config, message } = err;
                    if (err) {
                        console.log(" -> Interceptors status " + err.response.status)
                        console.log(" -> Interceptors data " + JSON.stringify(err.response.data))
                        console.log(" -> Interceptors message " + message)
                        //spinnerLoadingPageText.value = "Getting OHLCV - API limit reached - Retrying 60 seconds"
                    }
                    if (!config || !config.retry) {
                        return Promise.reject(err);
                    }

                    // If there is an error and the status is not 429, we just alert (return rejection). Else we continue and retry
                    if (err.response.status != 429) {
                        alert("Error getting OHLCV with message: " + message)
                        return Promise.reject(err);
                    }

                    config.retry -= 1;

                    const delayRetryRequest = new Promise((resolve) => {
                        setTimeout(() => {
                            console.log(" -> Retrying the request ", config.url);
                            resolve();
                        }, config.retryDelay || 1000);
                    });

                    return delayRetryRequest.then(() => axios(config));
                });

                // when request, can set retry times and retry delay time

                await axios.get("https://api.polygon.io/v2/aggs/ticker/" + temp.symbol + "/range/1/minute/" + tradedStartDate * 1000 + "/" + toDate * 1000 + "?adjusted=true&sort=asc&limit=50000&apiKey=" + currentUser.value.marketDataApiKey, { retry: 5, retryDelay: 60000 })
                    .then((response) => {
                        //console.log(" -> data " + JSON.stringify(response))
                        //console.log(" -> ohlcvData " + JSON.stringify(ohlcvData))
                        temp.ohlcv = response.data.results
                        ohlcv.push(temp)
                        //console.log(" -> ohlcv " + JSON.stringify(ohlcv))
                    })
                    .catch((error) => {

                        console.log(" -> Polygon api get error " + error.status);
                    })
                    .finally(function () {
                        // always executed
                    })


            }
        }
        await asyncLoop()
        resolve()
    })
}


async function getOpenPositionsParse() {
    return new Promise(async (resolve, reject) => {
        console.log("\nGETTING OPEN TRADES PARSE")
        const parseObject = Parse.Object.extend("trades");
        const query = new Parse.Query(parseObject);
        query.descending("dateUnix");
        query.equalTo("openPositions", true);
        const results = await query.find();
        for (let i = 0; i < results.length; i++) {
            const object = results[i];
            //console.log("unix time "+ object.get('dateUnix'));
            object.get('trades').forEach(element => {
                if (element.openPosition) {
                    openPositionsParse.push(element)
                }
            });

        }
        //console.log(" -> Open positions in Parse "+JSON.stringify(openPositionsParse))
        resolve()
    })
}

async function createTrades() {
    return new Promise(async (resolve, reject) => {
        console.log("\nCREATING TRADES")
        //spinnerLoadingPageText.value = "Creating trades"
        var b = _
            .chain(tempExecutions)
            .orderBy(["execTime"], ["asc"])
            .groupBy(item => `"${item.symbol}+${item.strategy}+${item.td}"`);

        let objectB = JSON.parse(JSON.stringify(b))
        //console.log("object b "+JSON.stringify(objectB))

        // We iterate through each symbol (key2)
        const keys2 = Object.keys(objectB);

        //console.log("keys 2 (symbols) " + JSON.stringify(keys2));
        var newIds = [] //array used for finding swing trades. Keep aside for later
        var temp2 = []
        for (const key2 of keys2) {
            var tempExecs = objectB[key2]
            //Count number of wins and losses for later total number of wins and losses
            var newTrade = true
            var invertedLong = false
            var invertedShort = false
            var grossWinsCount = 0
            var netWinsCount = 0
            var grossLossCount = 0
            var netLossCount = 0
            var tradesCount = 0
            let temp7 = {}

            let initEntryTime
            let initEntryPrice
            let i
            let existingOpenPosition // common name given to existing open position found in Parse or locally
            console.log("\n ------ ITERATING SYMBOL " + key2 + " on " + useChartFormat(tempExecs[0].td) + " ------")
            for (i = 0; i < tempExecs.length; i++) {
                let tempExec = tempExecs[i];
                
                //console.log("tempExec " + JSON.stringify(tempExec));
                //console.log("doing key "+key2)


                /**
                 * 1- Get all open positions from parse => getOpenPositionsParse()
                 * 2- Check if there is an existing position amongst all open positions in Parse (existingOpenPositionParse) or amongst all open position in current upload/fil (existingOpenPositionFile)
                 * 3- Now, if it's a new trade and there is an existing open position (in Parse or File), then we give it a common name, existingOpenPosition, and we make some td and id modifications
                 * 4- It newTrade == false, the we check if we're in a classical process, in which case trde is derived from temp2, else it's
                 **/

                //checking existing open position amongst Parse open positions
                const existingOpenPositionParse = openPositionsParse.find(x => x.symbol == tempExec.symbol && x.type == tempExec.type && x.strategy == tempExec.strategy) // this will take the first/last open position (but there may be more) and that's why getOpenPositionsParse must be in descending order

                //console.log(" -> Open positions in Parse "+JSON.stringify(openPositionsParse))
                //console.log(" -> Open positions in File "+JSON.stringify(openPositionsFile))
                //console.log(" -> "+JSON.stringify(tempExec))

                //checking existing open position amongst open positions stored locally
                const existingOpenPositionFile = openPositionsFile.find(x => x.symbol == tempExec.symbol && x.type == tempExec.type && x.strategy == tempExec.strategy)

                //checking existing open positions array when importing file
                if (newTrade == true) {
                    //console.log("\n -> New trade for symbol " + key2 + " on " + useChartFormat(tempExec.td) + " at " + useTimeFormat(tempExec.execTime))
                    console.log(" -> New trade from " + useTimeFormat(tempExec.execTime))
                    existingOpenPosition = {}
                    if (existingOpenPositionParse) {
                        //console.log("  --> Open position already in Parse for symbol " + key2 + " on " + useChartFormat(tempExec.td) + " at " + useTimeFormat(tempExec.execTime))
                        console.log("  --> Open position already in Parse")
                        //existingOpenPosition = existingOpenPositionParse
                        Object.keys(existingOpenPositionParse).forEach((key) => {
                            if (key == "td") {
                                existingOpenPosition.td = tempExec.td
                            } else {
                                existingOpenPosition[key] = existingOpenPositionParse[key]
                            }
                        })
                        currentTradeId = existingOpenPosition.id //here currentTradeId is at this state because we "jump" over newTrade as we are continuing an open / swing trade
                        temp2.push(existingOpenPosition)
                        newTrade = false

                        //const existingOpenPositionParseIndex = openPositionsParse.findIndex(x => x.symbol == tempExec.symbol)
                        //openPositionsParse.splice(existingOpenPositionParseIndex, 1)
                        //console.log(" Open positions "+JSON.stringify(openPositionsFile))
                        //console.log(" Open positions length "+openPositionsFile.length)
                    }
                    else if (existingOpenPositionFile) {
                        //console.log("  --> Open position already in current file for symbol " + key2 + " on " + useChartFormat(tempExec.td) + " at " + useTimeFormat(tempExec.execTime))
                        console.log("  --> Open position already in current file")
                        //console.log(" existingOpenPositionFile "+JSON.stringify(existingOpenPositionFile))
                        Object.keys(existingOpenPositionFile).forEach((key) => {
                            if (key == "td") {
                                existingOpenPosition.td = tempExec.td
                            } else {
                                existingOpenPosition[key] = existingOpenPositionFile[key]
                            }
                        })
                        //existingOpenPosition = existingOpenPositionFile

                        //console.log(" -> existingOpenPosition "+JSON.stringify(existingOpenPosition))
                        currentTradeId = existingOpenPosition.id //here currentTradeId is at this state because we "jump" over newTrade as we are continuing an open / swing trade
                        existingOpenPosition.td = tempExec.td;
                        temp2.push(existingOpenPosition)
                        newTrade = false

                        //console.log(" existingOpenPositionFile "+JSON.stringify(existingOpenPositionFile))
                        const existingOpenPositionFileIndex = openPositionsFile.findIndex(x => x.symbol == tempExec.symbol)
                        openPositionsFile.splice(existingOpenPositionFileIndex, 1)
                        //console.log(" Open positions "+JSON.stringify(openPositionsFile))
                        //console.log(" Open positions length "+openPositionsFile.length)
                        //console.log(" temp 2 "+JSON.stringify(temp2))
                    } else{
                        console.log("  --> No existing open position (in Parse nor in current file)")
                        existingOpenPosition = undefined
                    }

                }
                //console.log(" -> existingOpenPosition "+JSON.stringify(existingOpenPosition))

                if (newTrade == true) { //= new trade
                    //If qty buy != qty sell and new cycnle, we have an open position, that we push to open positions

                    openPosition = true
                    newTrade = false
                    var invertedLong = false
                    var invertedShort = false

                    /*******************
                     * Info 
                     *******************/
                    //console.log(" -> exec id "+tempExec.id)
                    //tempExecIds.push(tempExec.id)

                    temp7.id = tempExec.side == "B" || tempExec.side == "S" ? "t" + tempExec.execTime + "_" + tempExec.symbol + "_B" : "t" + tempExec.execTime + "_" + tempExec.symbol + "_SS"
                    console.log("  --> ID " + temp7.id)
                    currentTradeId = temp7.id
                    temp7.account = tempExec.account;
                    temp7.broker = tempExec.broker
                    temp7.td = tempExec.td;
                    temp7.currency = tempExec.currency;
                    temp7.type = tempExec.type;
                    temp7.side = tempExec.side;
                    if (tempExec.side == "B") {
                        temp7.strategy = "long"
                        //console.log("  --> Symbol " + key2 + " is bought and long")
                        temp7.buyQuantity = tempExec.quantity;
                        temp7.sellQuantity = 0
                    }
                    if (tempExec.side == "S") { //occasionnaly, Tradezero inverts trades and starts by accounting the sell even though it's a long possition
                        temp7.strategy = "long"
                        //console.log("Symbol " + key2 + " is sold and long")
                        console.log("  --> Symbol " + key2 + " is accounted as sell before buy on date " + useChartFormat(tempExec.td) + " at " + useTimeFormat(tempExec.execTime))
                        invertedLong = true
                        temp7.buyQuantity = 0
                        temp7.sellQuantity = tempExec.quantity;
                    }
                    if (tempExec.side == "SS") {
                        temp7.strategy = "short"
                        //console.log("  --> Symbol " + key2 + " is sold and short")
                        temp7.buyQuantity = 0
                        temp7.sellQuantity = tempExec.quantity;
                    }
                    if (tempExec.side == "BC") { //occasionnaly, Tradezero invertes trades
                        temp7.strategy = "short"
                        console.log("  --> Symbol " + key2 + " is accounted as buy cover before short sell on date " + useChartFormat(tempExec.td) + " at " + useTimeFormat(tempExec.execTime))
                        invertedShort = true
                        temp7.buyQuantity = tempExec.quantity;
                        temp7.sellQuantity = 0
                    }
                    temp7.symbol = tempExec.symbol;
                    temp7.entryTime = tempExec.execTime;
                    initEntryTime = tempExec.execTime
                    temp7.exitTime = 0
                    temp7.entryPrice = tempExec.price
                    initEntryPrice = tempExec.price
                    temp7.exitPrice = 0
                    /*if (temp7.entryTime >= startTimeUnix.value) {
                        temp7.videoStart = temp7.entryTime - startTimeUnix.value
                    }*/

                    /*******************
                     * Commissions and fees
                     *******************/
                    temp7.commissionOpen = tempExec.commission;
                    temp7.commission = 0
                    temp7.secOpen = tempExec.sec;
                    temp7.sec = 0
                    temp7.tafOpen = tempExec.taf;
                    temp7.taf = 0
                    temp7.nsccOpen = tempExec.nscc;
                    temp7.nscc = 0
                    temp7.nasdaqOpen = tempExec.nasdaq;
                    temp7.nasdaq = 0
                    temp7.ecnRemoveOpen = tempExec.ecnRemove;
                    temp7.ecnRemove = 0
                    temp7.ecnAddOpen = tempExec.ecnAdd;
                    temp7.ecnAdd = 0

                    temp7.clrBroker = tempExec.clrBroker;
                    temp7.liq = tempExec.liq;

                    /*******************
                     * Gross proceeds and P&L
                     *******************/
                    temp7.grossEntryProceedsOpen = tempExec.grossProceeds;
                    temp7.grossEntryProceeds = 0
                    temp7.grossExitProceedsOpen = 0
                    temp7.grossExitProceeds = 0
                    temp7.grossProceedsOpen = tempExec.grossProceeds;
                    temp7.grossProceeds = 0
                    temp7.grossWins = 0 //Winning proceeds
                    temp7.grossLoss = 0 //Loosing proceeds
                    temp7.grossSharePL = 0 //Proceeds per share traded
                    temp7.grossSharePLWins = 0 //Wins among proceeds per share
                    temp7.grossSharePLLoss = 0 //Losses among proceeds per share
                    temp7.grossStatus = null

                    /*******************
                     * Net proceeds and P&L
                     *******************/
                    temp7.netEntryProceedsOpen = tempExec.netProceeds;
                    temp7.netEntryProceeds = 0
                    temp7.netExitProceedsOpen = 0
                    temp7.netExitProceeds = 0
                    temp7.netProceedsOpen = tempExec.netProceeds;
                    temp7.netProceeds = 0
                    temp7.netWins = 0
                    temp7.netLoss = 0
                    temp7.netSharePL = 0 //Less important metric than gross because fees are notre a percentage this gives.value strange results. Beside, we don't use it afterwards. But I keep it for the sake of homogeneity
                    temp7.netSharePLWins = 0
                    temp7.netSharePLLoss = 0
                    temp7.netStatus = null

                    /*******************
                     * Counts
                     *******************/
                    temp7.executionsCount = 1 //We create a count that will then be summed during the symbol blotter
                    temp7.tradesCount = 0
                    temp7.grossWinsQuantity = 0
                    temp7.grossLossQuantity = 0
                    temp7.grossWinsCount = 0
                    temp7.grossLossCount = 0
                    temp7.netWinsQuantity = 0
                    temp7.netLossQuantity = 0
                    temp7.netWinsCount = 0
                    temp7.netLossCount = 0

                    /*******************
                     * Other
                     *******************/
                    temp7.note = tempExec.note
                    temp7.executions = []
                    temp7
                        .executions
                        .push(tempExec.id)
                    temp7.openPosition = true
                    let exec = executions[tempExec.td].find(x => x.id == tempExec.id)
                    exec.trade = temp7.id;

                    console.log("  --> buy quantity " + temp7.buyQuantity + " and sell quantity " + temp7.sellQuantity)

                    temp2.push(temp7)
                    //console.log(" temp2 "+JSON.stringify(temp2))

                    //we push to openPositionsFile
                    //console.log("openPositionsFile "+JSON.stringify(openPositionsFile))
                    openPositionsFile.push(temp7)
                    //console.log("openPositionsFile after "+JSON.stringify(openPositionsFile))

                } else if (newTrade == false) { //= concatenating trade
                    console.log("  --> Concatenating trade from " + useTimeFormat(tempExec.execTime))

                    let trde
                    if (existingOpenPosition != undefined) {
                        //console.log("  --> Getting trd from existing open position")
                        trde = temp2.find(x => x.id == existingOpenPosition.id && x.td == existingOpenPosition.td)

                    } else {
                        //console.log("  --> Getting trd from temp7")
                        trde = temp2.find(x => x.id == temp7.id)
                    }

                    //console.log("trde " + JSON.stringify(trde))

                    //console.log(" -> exec id "+tempExec.id)
                    //tempExecIds.push(tempExec.id)
                    //console.log(" -> temp2 concat is " + JSON.stringify(temp2))
                    //console.log(" trd sell quantity "+trde.sellQuantity)
                    if (trde.strategy == "long") {
                        //console.log(" -> Strategy is long and "+invertedLong+" for symbol "+tempExec.symbol)
                        if (!invertedLong) {
                            if (tempExec.side == trde.side) { // adding to position
                                trde.buyQuantity = useDecimalsArithmetic(trde.buyQuantity, tempExec.quantity)
                                //console.log(" -> quantity is "+trde.buyQuantity)
                            } else { // clearing/closing position
                                trde.sellQuantity = useDecimalsArithmetic(trde.sellQuantity, tempExec.quantity)
                                //console.log(" -> quantity is "+trde.buyQuantity)
                            }
                        } else {
                            if (tempExec.side == trde.side) { // adding to position
                                trde.sellQuantity = useDecimalsArithmetic(trde.sellQuantity, tempExec.quantity)
                            } else { // clearing/closing position
                                trde.buyQuantity = useDecimalsArithmetic(trde.buyQuantity, tempExec.quantity)
                            }
                        }
                    }

                    if (trde.strategy == "short") {
                        //console.log(" -> Strategy is short and "+invertedShort+" for symbol "+tempExec.symbol)
                        if (!invertedShort) {
                            if (tempExec.side == trde.side) { // adding to position
                                trde.sellQuantity = useDecimalsArithmetic(trde.sellQuantity, tempExec.quantity)
                            } else { // clearing/closing position
                                trde.buyQuantity = useDecimalsArithmetic(trde.buyQuantity, tempExec.quantity)
                            }
                        } else {
                            if (tempExec.side == trde.side) { // adding to position
                                trde.buyQuantity = useDecimalsArithmetic(trde.buyQuantity, tempExec.quantity)
                            } else { // clearing/closing position
                                trde.sellQuantity = useDecimalsArithmetic(trde.sellQuantity, tempExec.quantity)
                            }
                        }
                    }

                    trde.commissionOpen = trde.commissionOpen + tempExec.commission;
                    trde.secOpen = trde.secOpen + tempExec.sec;
                    trde.tafOpen = trde.tafOpen + tempExec.taf;
                    trde.nsccOpen = trde.nsccOpen + tempExec.nscc;
                    trde.nasdaqOpen = trde.nasdaqOpen + tempExec.nasdaq;

                    trde.grossExitProceedsOpen = trde.grossExitProceedsOpen + tempExec.grossProceeds
                    trde.grossProceedsOpen = trde.grossProceedsOpen + tempExec.grossProceeds

                    trde.netExitProceedsOpen = trde.netExitProceedsOpen + tempExec.netProceeds
                    trde.netProceedsOpen = trde.netProceedsOpen + tempExec.netProceeds
                    trde
                        .executions
                        .push(tempExec.id)

                    //here we do += because this is.value trades so here when we are concatenating, we need to add +1 to the execution count. ANother option would be to calculate the number of executions but we would need to rely on the executions list. Too complicated.
                    trde.executionsCount += 1

                    let exec = executions[tempExec.td].find(x => x.id == tempExec.id)
                    exec.trade = trde.id;

                    console.log("  --> buy quantity " + trde.buyQuantity + " and sell quantity " + trde.sellQuantity)
                    //trde = temp2.find(x => x.id == trde.id)

                    /* 
                    * Update openPositionsFile. First remove existing trade json. Then, if buy qty != sell qty then push updated json 
                    */
                    let openPositionIndex = -1
                    if (openPositionsFile.length > 0) openPositionIndex = openPositionsFile.findIndex(x => x.id == trde.id)
                    if (openPositionIndex != -1) openPositionsFile.splice(openPositionIndex, 1)

                    /*******************
                     * If Buy Qty = Sell Qty
                     *******************/
                    if (trde.buyQuantity == trde.sellQuantity) { //When buy and sell quantities are equal means position is closed
                        //console.log("trde " + JSON.stringify(trde))
                        //console.log(" tempExec "+JSON.stringify(tempExec))
                        trde.exitPrice = tempExec.price;
                        trde.exitTime = tempExec.execTime;
                        /*if (trde.exitTime >= startTimeUnix.value) {
                            trde.videoEnd = trde.exitTime - startTimeUnix.value
                        }*/

                        /*********************** 
                        * MOVING FROM OPEN TO CLOSED
                       ************************/
                        trde.commission = trde.commissionOpen
                        trde.commissionOpen = 0
                        trde.sec = trde.secOpen
                        trde.secOpen = 0
                        trde.taf = trde.tafOpen
                        trde.tafOpen = 0
                        trde.nscc = trde.nsccOpen
                        trde.nsccOpen = 0
                        trde.nasdaq = trde.nasdaqOpen
                        trde.nasdaqOpen = 0

                        trde.grossEntryProceeds = trde.grossEntryProceedsOpen
                        trde.grossEntryProceedsOpen = 0
                        trde.grossExitProceeds = trde.grossExitProceedsOpen
                        trde.grossExitProceedsOpen = 0
                        trde.grossProceeds = trde.grossProceedsOpen
                        trde.grossProceedsOpen = 0

                        trde.netEntryProceeds = trde.netEntryProceedsOpen
                        trde.netEntryProceedsOpen = 0
                        trde.netExitProceeds = trde.netExitProceedsOpen
                        trde.netExitProceedsOpen = 0
                        trde.netProceeds = trde.netProceedsOpen
                        trde.netProceedsOpen = 0

                        /* */

                        trde.grossSharePL = trde.grossProceeds / (trde.buyQuantity) //P&L per share is in reality "per share bought (if long)". So, when trade is closed, we take the total quantity and divide by 2

                        trde.grossSharePL >= 0 ? trde.grossSharePLWins = trde.grossSharePL : trde.grossSharePLLoss = trde.grossSharePL


                        if (trde.grossProceeds >= 0) {
                            trde.grossStatus = "win"
                            trde.grossWinsQuantity = trde.buyQuantity
                            trde.grossWins = trde.grossProceeds
                            grossWinsCount = 1
                            grossLossCount = 0
                        } else {
                            trde.grossStatus = "loss"
                            trde.grossLossQuantity = trde.buyQuantity
                            trde.grossLoss = trde.grossProceeds
                            grossLossCount = 1
                            grossWinsCount = 0
                        }

                        trde.netSharePL = trde.netProceeds / (trde.buyQuantity)
                        trde.netSharePL >= 0 ? trde.netSharePLWins = trde.netSharePL : trde.netSharePLLoss = trde.netSharePL

                        if (trde.netProceeds >= 0) {
                            trde.netStatus = "win"
                            trde.netWinsQuantity = trde.buyQuantity
                            trde.netWins = trde.netProceeds
                            netWinsCount = 1
                            netLossCount = 0
                        } else {
                            trde.netStatus = "loss"
                            trde.netLossQuantity = trde.buyQuantity
                            trde.netLoss = trde.netProceeds
                            netLossCount = 1
                            netWinsCount = 0
                        }

                        tradesCount = 1
                        trde.grossWinsCount = grossWinsCount
                        trde.netWinsCount = netWinsCount
                        trde.grossLossCount = grossLossCount
                        trde.netLossCount = netLossCount
                        trde.tradesCount = tradesCount



                        /*****
                         * GETTING MFE PRICE
                         *****/

                        if ((currentUser.value.marketDataApiKey && currentUser.value.marketDataApiKey != null && currentUser.value.marketDataApiKey != '') && uploadMfePrices.value && ohlcv.findIndex(f => f.symbol == tempExec.symbol) != -1) {
                            console.log("  --> Getting MFE Price")
                            let ohlcvSymbol = ohlcv[ohlcv.findIndex(f => f.symbol == tempExec.symbol)].ohlcv
                            //todo exclude if trade in same minute timeframe

                            //console.log(" ohlcvSymbol " + JSON.stringify(ohlcvSymbol))

                            if (ohlcvSymbol != undefined) {
                                //console.log(" initEntryTime " + initEntryTime * 1000)
                                //findIndex gets the first value. So, for entry, if equal, we take next candle. For exit, if equal, we use that candle
                                let tempStartIndex = ohlcvSymbol.findIndex(n => n.t >= initEntryTime * 1000)
                                //console.log(" temp start index "+tempStartIndex)
                                let tempEndIndex = ohlcvSymbol.findIndex(n => n.t >= trde.exitTime * 1000) //findIndex returns the first element
                                let tempStartTime = ohlcvSymbol[tempStartIndex]
                                let tempEndTime = ohlcvSymbol[tempEndIndex]

                                let startIndex
                                let endIndex
                                let startTime
                                let endTime

                                if (tempStartTime == initEntryTime) {
                                    startIndex = tempStartIndex + 1
                                    startTime = ohlcvSymbol[startIndex].t
                                } else {
                                    startIndex = tempStartIndex
                                    startTime = ohlcvSymbol[tempStartIndex].t
                                }

                                if (tempEndTime == trde.exitTime) {
                                    endIndex = tempEndIndex
                                    endTime = tempEndTime
                                } else {
                                    endIndex = tempEndIndex - 1
                                    endTime = ohlcvSymbol[tempEndIndex - 1].t
                                }

                                //console.log("   ----> Temp Start index " + tempStartIndex + ", temp end index " + tempEndIndex)
                                //console.log("   ----> EntryTime " + initEntryTime + " and start time " + startTime)
                                //console.log("   ----> ExitTime " + trde.exitTime + " and end time " + endTime)

                                //Get market close index
                                //iterate from exit time and check if same day and <= 4 hour
                                let endTimeDay = dayjs(endTime).tz(timeZoneTrade.value).get("date")
                                let endTimeMonth = dayjs(endTime).tz(timeZoneTrade.value).get("month") + 1
                                let endTimeYear = dayjs(endTime).tz(timeZoneTrade.value).get("year")
                                let endTimeDate = endTimeYear + "-" + endTimeMonth + "-" + endTimeDay + " 16:00:00" //VERY IMPORTANT : if i want to apply US time, it needs to be in US format, that is YYYY-MM-DD
                                //console.log(" -> End time date "+endTimeDate)
                                //    
                                let marketCloseTime = dayjs.tz(endTimeDate, timeZoneTrade.value)

                                //console.log(" marketCloseTime "+marketCloseTime)

                                let tempEndOfDayTimeIndex = ohlcvSymbol.findIndex(f => f.t >= marketCloseTime)
                                let endOfDayTimeIndex = tempEndOfDayTimeIndex - 1
                                //console.log(" -> End of day time index "+endOfDayTimeIndex+" and values are "+JSON.stringify(ohlcvSymbol[endOfDayTimeIndex]))

                                /*let timeDayOfWeek = dayjs(endTime * 1000).tz(timeZoneTrade.value).day()
                                console.log(" timeDayOfWeek "+timeDayOfWeek)
                                let timeHour = dayjs(endTime * 1000).tz(timeZoneTrade.value).get('hour')
                                let time
                                let i = tempEndIndex - 1;
                                while (i < ohlcvSymbol.length && endTimeOfWeek == timeDayOfWeek && timeHour < 17) {
                                    time = ohlcvSymbol[i].t
                                    timeDayOfWeek = dayjs(time * 1000).tz(timeZoneTrade.value).day()
                                    timeHour = dayjs(time * 1000).tz(timeZoneTrade.value).get('hour')
                                        //console.log("time: "+time+", timeDayOfWeek "+timeDayOfWeek+" and hour "+timeHour)
                                    i++;
                                }
                                console.log(" -> Time "+time)
                                //let tempEndOfDayTimeIndex = ohlcvSymbol.findIndex(f => f.t >= time)
                                let endOfDayTimeIndex = tempEndOfDayTimeIndex - 1

                                //console.log(" -> End of day time " + endOfDayTime)
                                console.log(" -> end of day time index temp "+tempEndOfDayTimeIndex)
                                console.log(" -> end of day time index "+endOfDayTimeIndex+"+ and values are "+JSON.stringify(ohlcvSymbol[endOfDayTimeIndex]))*/

                                let tempMfe = {}
                                //check is same timeframe
                                if (endTime < startTime) { //entry and exit are in the same 1mn timeframe
                                    console.log("   ---> Trade is in same 1mn timeframe")

                                    tempMfe.tradeId = trde.id
                                    tempMfe.dateUnix = tempExec.td
                                    tempMfe.mfePrice = initEntryPrice
                                    mfePrices.push(tempMfe)

                                } else {
                                    //we get the MFE price by iterating between entry and exit and then between exit up until price hits / equals entryprice, and at the latest the endOfDayTime
                                    let priceDifference
                                    let mfePrice = initEntryPrice

                                    if (trde.strategy == "long") {
                                        priceDifference = trde.exitPrice - initEntryPrice
                                    }
                                    if (trde.strategy == "short") {
                                        priceDifference = initEntryPrice - trde.exitPrice
                                    }

                                    console.log("   ---> Iterating between entry price and exit price")
                                    //console.log("    ----> Start index "+startIndex+ " and end index "+endIndex)
                                    for (let i = startIndex; i <= endIndex; i++) {
                                        //console.log(" Symbole price "+ohlcvSymbol.h[i]+" at time "+ohlcvSymbol.t[i]+" and MFE "+mfePrice)
                                        if (trde.strategy == "long" && ohlcvSymbol[i].h > trde.exitPrice && ohlcvSymbol[i].h > mfePrice) mfePrice = ohlcvSymbol[i].h
                                        if (trde.strategy == "short" && ohlcvSymbol[i].l < trde.exitPrice && ohlcvSymbol[i].l < mfePrice) mfePrice = ohlcvSymbol[i].l

                                    }
                                    //console.log(" -> Price difference "+priceDifference)
                                    if (initEntryPrice != trde.exitPrice && priceDifference > 0) { //case where stop loss above entryprice
                                        console.log("   ---> Iterating between exit price and up until price hits / equals entry price, and at the latest until market close")
                                        let i = endIndex
                                        let ohlcvSymbolPrice
                                        trde.strategy == "long" ? ohlcvSymbolPrice = ohlcvSymbol[endIndex].h : ohlcvSymbolPrice = ohlcvSymbol[endIndex].l

                                        //console.log(" -> endOfDayTimeIndex "+endOfDayTimeIndex)
                                        while (i <= endOfDayTimeIndex && (trde.strategy == "long" ? ohlcvSymbolPrice > initEntryPrice : ohlcvSymbolPrice < initEntryPrice)) {
                                            trde.strategy == "long" ? ohlcvSymbolPrice = ohlcvSymbol[i].h : ohlcvSymbolPrice = ohlcvSymbol[i].l
                                            //console.log("  -> Symbol Price " + ohlcvSymbolPrice + " @ "+useDateTimeFormat(ohlcvSymbol[i].t/1000)+", init price " + initEntryPrice + " and mfe price " + mfePrice)
                                            if (trde.strategy == "long" && ohlcvSymbolPrice > initEntryPrice && ohlcvSymbolPrice > mfePrice) mfePrice = ohlcvSymbolPrice
                                            if (trde.strategy == "short" && ohlcvSymbolPrice < initEntryPrice && ohlcvSymbolPrice < mfePrice) mfePrice = ohlcvSymbolPrice
                                            i++

                                        }
                                    }
                                    if (trde.strategy == "long" && mfePrice < initEntryPrice) mfePrice = initEntryPrice
                                    if (trde.strategy == "short" && mfePrice > initEntryPrice) mfePrice = initEntryPrice

                                    console.log("    ----> " + trde.strategy + " stratgy with entry at " + useDateTimeFormat(initEntryTime) + " @ " + initEntryPrice + " -> exit at " + useDateTimeFormat(trde.exitTime) + " @ " + trde.exitPrice + " and MFE price " + mfePrice)
                                    //if short, MFE price = if price is lower than MFE
                                    //if long, MFE = if price is higher than MFE




                                    //add excursion to temp2
                                    trde.excursions = {}
                                    trde.excursions.stopLoss = null
                                    trde.excursions.maePrice = null
                                    trde.excursions.mfePrice = mfePrice

                                    tempMfe.tradeId = trde.id
                                    tempMfe.dateUnix = tempExec.td
                                    tempMfe.mfePrice = mfePrice
                                    mfePrices.push(tempMfe)
                                }
                            } else {
                                console.log("   ---> Cannot find symbol in market data provider")
                            }
                        } // End MFE prices
                        /*****
                         * END GETTING MFE PRICE
                         *****/

                        trde.openPosition = false

                        //Updating exit time in parse open positions. Close position is update later
                        if (openPositionsParse.length > 0) {
                            for (let index = 0; index < openPositionsParse.length; index++) {
                                const element = openPositionsParse[index];
                                if (element.symbol == trde.symbol && element.type == trde.type) {
                                    element.exitTime = tempExec.execTime;
                                }

                            }
                        }

                        //Updating exit time and closing position in existing file
                        for (let index = 0; index < temp2.length; index++) {
                            const element = temp2[index]
                            if (element.id == trde.id) {
                                element.exitTime = tempExec.execTime;
                                element.openPosition = false
                            }
                        }

                        //console.log("trde " + JSON.stringify(trde))

                        //check if other trades open of same id in 

                        newTrade = true
                        temp7 = {} // I need to reinitiate temp7 here or else when more than one trade per symbol it was adding up
                        //console.log("temp2 is " + JSON.stringify(temp2))
                        //console.log(" -> trade concat finished")
                        //console.log(tradesCount+" trades for symbol "+key2)

                        console.log("   ---> Position CLOSED")
                        openPosition = false

                    } else {
                        openPositionsFile.push(trde)
                        console.log("   ---> Position OPEN")
                        /*if ((i + 1) == tempExecs.length) {
                            console.log("   ---> Position OPEN")
                            //console.log("   ---> tempExecs " + JSON.stringify(tempExecs))
                        }*/

                    }
                } else {
                    console.log("nothing for key " + key2)
                }

                //console.log("New trade status of symbol "+key2+" is "+newTrade+". the JSON is "+JSON.stringify(temp7))
            }

        }
        //console.log(" -> Open positionsFile " + JSON.stringify(openPositionsFile))
        //console.log(" -> Open positions in Parse "+JSON.stringify(openPositionsParse))
        //console.log("temp2 " + JSON.stringify(temp2))
        var c = _
            .chain(temp2)
            .orderBy(["entryTime"], ["asc"])
            .groupBy("td");
        //console.log(" -> Trades " + JSON.stringify(c))
        for (let key in trades) delete trades[key]
        Object.assign(trades, JSON.parse(JSON.stringify(c)))
        //console.log("Trades C " + JSON.stringify(trades))
        //console.log('executions ' + JSON.stringify(executions))
        resolve()
    })
}

async function updateMfePrices(param) {
    return new Promise(async (resolve, reject) => {
        console.log("  --> Updating excursion DB with MFE price")
        //spinnerLoadingPageText.value = "Updating MFE prices in excursions"
        //console.log(" MFE Prices " + JSON.stringify(mfePrices))
        for (let index = 0; index < mfePrices.length; index++) {
            const element = mfePrices[index];
            const parseObject = Parse.Object.extend("excursions");
            const object = new parseObject();
            object.set("user", Parse.User.current())
            object.set("mfePrice", element.mfePrice)
            object.set("dateUnix", element.dateUnix)
            object.set("tradeId", element.tradeId)
            object.setACL(new Parse.ACL(Parse.User.current()));
            object.save()
                .then(async (object) => {
                    console.log(' -> Added new excursion with id ' + object.id)
                    //spinnerSetupsText.value = "Added new setup"
                    tradeId.value = tradeExcursionId.value // we need to do this if.value I want to manipulate the current modal straight away, like for example delete after saving. WHen You push next or back, tradeId is set back to null
                    if (index == (mfePrices.length - 1)) {
                        resolve()
                    }
                }, (error) => {
                    console.log('Failed to create new object, with error code: ' + error.message);
                    reject()
                })

        }
    })
}

async function filterExisting(param) {
    return new Promise(async (resolve, reject) => {
        console.log("\nFILTERING EXISTING")
        //spinnerLoadingPageText.value = "Filtering existing"
        // We can only filter at this point.value because trades depend on executions. So, once trades are created, we can filter out existing trades

        //await getExistingTradesArray.value(param) => Here, I no longer call it here but on page load, so it's quicker to load

        //console.log("existing array "+JSON.stringify(existingTradesArray)+" and count "+existingTradesArray.length)
        /* I have to rename and make specific caser for existingTradesArray => existingCashJournalsArray
        
        if (param == "cashJournals") {
            existingTradesArray.forEach(element => {
                if (cashJournals.value.hasOwnProperty(element)) {
                    console.log("date exists " + element)
                    existingImports.push(element)
                }
            });
            cashJournals.value = _.omit(cashJournals.value, existingTradesArray)
            console.log("cashJournal " + JSON.stringify(cashJournals.value))
        } */

        if (param == "trades") {
            //console.log(" -> ExistingTradesArray "+existingTradesArray)
            existingTradesArray.forEach(element => {
                //console.log("element "+element)
                if (executions.hasOwnProperty(element)) {
                    console.log(" -> Already imported date " + element)
                    existingImports.push(element)
                }
            });

            let tempExecutions = _.omit(executions, existingTradesArray)
            for (let key in executions) delete executions[key]
            Object.assign(executions, tempExecutions)
            //console.log(" -> executions "+JSON.stringify(executions))

            let tempTrades = _.omit(trades, existingTradesArray)
            for (let key in trades) delete trades[key]
            Object.assign(trades, tempTrades)
        }
        resolve()
    })
}

export async function useCreateBlotter(param) {
    return new Promise(async (resolve, reject) => {
        console.log("\nCREATING BLOTTER BY SYMBOL")
        //spinnerLoadingPageText.value = "Creating blotter"
        //based on trades
        let objectZ
        if (param) { // case when creating blotter for filteredTrades
            //console.log("param " + param)
            let temp = _
                .chain(filteredTradesTrades)
                .orderBy(["entryTime"], ["asc"])
                .groupBy("td")
            objectZ = JSON.parse(JSON.stringify(temp))
            //console.log(" temp "+JSON.stringify(temp))
        } else {
            objectZ = trades
            //console.log(" this trades "+JSON.stringify(trades))
        }

        const keys9 = Object.keys(objectZ);
        var temp10 = {}
        for (const key9 of keys9) {
            //console.log(" Key9 "+key9)
            temp10[key9] = {}
            var tempExecs = objectZ[key9]
            //console.log("tempExecs9 " + JSON.stringify(tempExecs));
            var z = _
                .chain(tempExecs)
                .orderBy(["entryTime"], ["asc"])
                .groupBy("symbol")
            let objectY = JSON.parse(JSON.stringify(z))
            //console.log("objectY "+JSON.stringify(objectY))
            const keys10 = Object.keys(objectY);
            for (const key10 of keys10) {
                //console.log("key 10 " + key10)
                //console.log("z "+JSON.stringify(z))
                var tempExecs = objectY[key10]
                //console.log("tempExecs " + JSON.stringify(tempExecs));
                temp10[key9][key10] = {};

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
                var sumGrossSharePL = 0 //On a trade level, it's Proceeds per share traded. But as we blotter and create global P&L, it is a cumulative number (like proceeds). This way.value we can calculate estimations. If we need and average per share, it's a different calculation
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
                temp10[key9][key10].symbol = key10;
                temp10[key9][key10].type = tempExecs[0].type;
                temp10[key9][key10].buyQuantity = sumBuyQuantity
                temp10[key9][key10].sellQuantity = sumSellQuantity

                /*******************
                 * Commissions and fees
                 *******************/
                temp10[key9][key10].commission = sumCommission;
                temp10[key9][key10].sec = sumSec
                temp10[key9][key10].taf = sumTaf
                temp10[key9][key10].nscc = sumNscc
                temp10[key9][key10].nasdaq = sumNasdaq
                temp10[key9][key10].otherCommission = sumOtherCommission;
                temp10[key9][key10].fees = sumFees;

                /*******************
                 * Gross proceeds and P&L
                 *******************/
                temp10[key9][key10].grossProceeds = sumGrossProceeds;
                temp10[key9][key10].grossWins = sumGrossWins;
                temp10[key9][key10].grossLoss = sumGrossLoss;
                temp10[key9][key10].grossSharePL = sumGrossSharePL
                //temp10[key9][key10].grossSharePL = sumGrossProceeds / sumBuyQuantity

                /*sumGrossWinsQuantity == 0 ? temp10[key9][key10].grossSharePLWins = 0 : temp10[key9][key10].grossSharePLWins = sumGrossWins / sumGrossWinsQuantity
                sumGrossLossQuantity == 0 ? temp10[key9][key10].grossSharePLLoss = 0 : temp10[key9][key10].grossSharePLLoss = sumGrossLoss / sumGrossLossQuantity*/
                temp10[key9][key10].grossSharePLWins = sumGrossSharePLWins
                temp10[key9][key10].grossSharePLLoss = sumGrossSharePLLoss
                temp10[key9][key10].highGrossSharePLWin = highGrossSharePLWin;
                temp10[key9][key10].highGrossSharePLLoss = highGrossSharePLLoss;

                /*******************
                 * Net proceeds and P&L
                 *******************/
                temp10[key9][key10].netProceeds = sumNetProceeds;
                temp10[key9][key10].netWins = sumNetWins;
                temp10[key9][key10].netLoss = sumNetLoss;
                temp10[key9][key10].netSharePL = sumNetSharePL
                //temp10[key9][key10].netSharePL = sumNetProceeds / sumBuyQuantity

                /*sumNetWinsQuantity == 0 ? temp10[key9][key10].netSharePLWins = 0 : temp10[key9][key10].netSharePLWins = sumNetWins / sumNetWinsQuantity
                sumNetLossQuantity == 0 ? temp10[key9][key10].netSharePLLoss = 0 : temp10[key9][key10].netSharePLLoss = sumNetLoss / sumNetLossQuantity*/
                temp10[key9][key10].netSharePLWins = sumNetSharePLWins
                temp10[key9][key10].netSharePLLoss = sumNetSharePLLoss
                temp10[key9][key10].highNetSharePLWin = highNetSharePLWin;
                temp10[key9][key10].highNetSharePLLoss = highNetSharePLLoss;

                /*******************
                 * Counts
                 *******************/
                temp10[key9][key10].executions = sumExecutions;
                temp10[key9][key10].trades = sumTrades;

                temp10[key9][key10].grossWinsQuantity = sumGrossWinsQuantity;
                temp10[key9][key10].grossLossQuantity = sumGrossLossQuantity;
                temp10[key9][key10].grossWinsCount = sumGrossWinsCount;
                temp10[key9][key10].grossLossCount = sumGrossLossCount;

                temp10[key9][key10].netWinsQuantity = sumNetWinsQuantity;
                temp10[key9][key10].netLossQuantity = sumNetLossQuantity;
                temp10[key9][key10].netWinsCount = sumNetWinsCount;
                temp10[key9][key10].netLossCount = sumNetLossCount;

            }

        }
        for (let key in blotter) delete blotter[key]
        Object.assign(blotter, temp10)
        //console.log(" -> BLOTTER " + JSON.stringify(blotter))
        resolve()
    })
}

export async function useCreatePnL() {
    return new Promise(async (resolve, reject) => {
        console.log("\nCREATING P&L")
        //spinnerLoadingPageText.value = "Creating P&L"
        //based on blotter
        let objectQ = blotter
        const keys7 = Object.keys(objectQ);
        var temp9 = {}

        for (const key7 of keys7) {
            //console.log(" key 7 "+key7)
            temp9[key7] = {};
            var tempExecs = objectQ[key7]
            //console.log("temp p&l " + JSON.stringify(tempExecs));
            var sumBuyQuantity = 0
            var sumSellQuantity = 0

            var sumCommission = 0
            var sumSec = 0
            var sumTaf = 0
            var sumNscc = 0
            var sumNasdaq = 0
            var sumOtherCommission = 0
            var sumFees = 0

            var sumGrossProceeds = 0
            var sumGrossWins = 0
            var sumGrossLoss = 0
            var sumGrossSharePL = 0
            var sumGrossSharePLWins = 0
            var sumGrossSharePLLoss = 0
            var highGrossSharePLWin = 0
            var highGrossSharePLLoss = 0

            var sumNetProceeds = 0
            var sumNetWins = 0
            var sumNetLoss = 0
            var sumNetSharePL = 0
            var sumNetSharePLWins = 0
            var sumNetSharePLLoss = 0
            var highNetSharePLWin = 0
            var highNetSharePLLoss = 0

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


            const keys8 = Object.keys(tempExecs);
            for (const key8 of keys8) {
                //console.log("key 8 "+key8)
                sumBuyQuantity += tempExecs[key8].buyQuantity
                sumSellQuantity += tempExecs[key8].sellQuantity

                sumCommission += tempExecs[key8].commission
                sumSec += tempExecs[key8].sec
                sumTaf += tempExecs[key8].taf
                sumNscc += tempExecs[key8].nscc
                sumNasdaq += tempExecs[key8].nasdaq
                sumOtherCommission += tempExecs[key8].otherCommission
                sumFees += tempExecs[key8].fees

                sumGrossProceeds += tempExecs[key8].grossProceeds
                sumGrossWins += tempExecs[key8].grossWins
                sumGrossLoss += tempExecs[key8].grossLoss
                sumGrossSharePL += tempExecs[key8].grossSharePL
                sumGrossSharePLWins += tempExecs[key8].grossSharePLWins
                sumGrossSharePLLoss += tempExecs[key8].grossSharePLLoss
                if (tempExecs[key8].highGrossSharePLWin >= highGrossSharePLWin) {
                    highGrossSharePLWin = tempExecs[key8].highGrossSharePLWin
                }
                if (tempExecs[key8].highGrossSharePLLoss < highGrossSharePLLoss) {
                    highGrossSharePLLoss = tempExecs[key8].highGrossSharePLLoss
                }

                sumNetProceeds += tempExecs[key8].netProceeds
                sumNetWins += tempExecs[key8].netWins
                sumNetLoss += tempExecs[key8].netLoss
                sumNetSharePL += tempExecs[key8].netSharePL
                sumNetSharePLWins += tempExecs[key8].netSharePLWins
                sumNetSharePLLoss += tempExecs[key8].netSharePLLoss
                if (tempExecs[key8].highNetSharePLWin >= highNetSharePLWin) {
                    highNetSharePLWin = tempExecs[key8].highNetSharePLWin
                }

                if (tempExecs[key8].highNetSharePLLoss < highNetSharePLLoss) {
                    highNetSharePLLoss = tempExecs[key8].highNetSharePLLoss
                }

                sumExecutions += tempExecs[key8].executions
                sumTrades += tempExecs[key8].trades

                sumGrossWinsQuantity += tempExecs[key8].grossWinsQuantity
                sumGrossLossQuantity += tempExecs[key8].grossLossQuantity
                sumGrossWinsCount += tempExecs[key8].grossWinsCount
                sumGrossLossCount += tempExecs[key8].grossLossCount

                sumNetWinsQuantity += tempExecs[key8].netWinsQuantity
                sumNetLossQuantity += tempExecs[key8].netLossQuantity
                sumNetWinsCount += tempExecs[key8].netWinsCount
                sumNetLossCount += tempExecs[key8].netLossCount


            }
            /*******************
             * Info
             *******************/
            temp9[key7].buyQuantity = sumBuyQuantity;
            temp9[key7].sellQuantity = sumSellQuantity;

            /*******************
             * Commissions and fees
             *******************/
            temp9[key7].commission = sumCommission;
            temp9[key7].sec = sumSec
            temp9[key7].taf = sumTaf
            temp9[key7].nscc = sumNscc
            temp9[key7].nasdaq = sumNasdaq
            temp9[key7].otherCommission = sumOtherCommission;
            temp9[key7].fees = sumFees;

            /*******************
             * Gross proceeds and P&L
             *******************/
            temp9[key7].grossProceeds = sumGrossProceeds;
            temp9[key7].grossWins = sumGrossWins;
            temp9[key7].grossLoss = sumGrossLoss;
            temp9[key7].grossSharePL = sumGrossSharePL
            //temp9[key7].grossSharePL = sumGrossProceeds / sumBuyQuantity

            /*sumGrossWinsQuantity == 0 ? temp9[key7].grossSharePLWins = 0 : temp9[key7].grossSharePLWins = sumGrossWins / sumGrossWinsQuantity
            sumGrossLossQuantity == 0 ? temp9[key7].grossSharePLLoss = 0 : temp9[key7].grossSharePLLoss = sumGrossLoss / sumGrossLossQuantity*/
            temp9[key7].grossSharePLWins = sumGrossSharePLWins
            temp9[key7].grossSharePLLoss = sumGrossSharePLLoss
            temp9[key7].highGrossSharePLWin = highGrossSharePLWin;
            temp9[key7].highGrossSharePLLoss = highGrossSharePLLoss;

            /*******************
             * Net proceeds and P&L
             *******************/
            temp9[key7].netProceeds = sumNetProceeds;
            temp9[key7].netWins = sumNetWins;
            temp9[key7].netLoss = sumNetLoss;
            temp9[key7].netSharePL = sumNetSharePL
            //temp9[key7].netSharePL = sumNetProceeds / sumBuyQuantity

            /*sumNetWinsQuantity == 0 ? temp9[key7].netSharePLWins = 0 : temp9[key7].netSharePLWins = sumNetWins / sumNetWinsQuantity
            sumNetLossQuantity == 0 ? temp9[key7].netSharePLLoss = 0 : temp9[key7].netSharePLLoss = sumNetLoss / sumNetLossQuantity*/
            temp9[key7].netSharePLWins = sumNetSharePLWins
            temp9[key7].netSharePLLoss = sumNetSharePLLoss
            temp9[key7].highNetSharePLWin = highNetSharePLWin;
            temp9[key7].highNetSharePLLoss = highNetSharePLLoss;

            /*******************
             * Counts
             *******************/
            temp9[key7].executions = sumExecutions
            temp9[key7].trades = sumTrades

            temp9[key7].grossWinsQuantity = sumGrossWinsQuantity
            temp9[key7].grossLossQuantity = sumGrossLossQuantity
            temp9[key7].grossWinsCount = sumGrossWinsCount
            temp9[key7].grossLossCount = sumGrossLossCount

            temp9[key7].netWinsQuantity = sumNetWinsQuantity
            temp9[key7].netLossQuantity = sumNetLossQuantity
            temp9[key7].netWinsCount = sumNetWinsCount
            temp9[key7].netLossCount = sumNetLossCount


        }
        for (let key in pAndL) delete pAndL[key]
        Object.assign(pAndL, temp9)
        //console.log(" -> P&L: " + JSON.stringify(pAndL))


        //console.log(" -> Created trades table successfully");
        resolve()
    })
}

/* ---- 4: UPLOAD TO PARSE TRADES  ---- */
export async function useUploadTrades() {

    console.log("\nUPLOADING TRADES")
    spinnerLoadingPage.value = true
    //spinnerLoadingPageText.value = "Uploading and storing trades(s) ..."

    let numberOfDates = 0
    let i = 0
    //Function uplaod trades to parse
    const uploadToParse = async (param1, param2, param3) => {
        return new Promise(async (resolve, reject) => {
            //console.log(" -> Parse param2 is " + param2)
            //spinnerLoadingPageText.value = "Uploading data from " + dayjs.unix(param1).format("DD MMMM YYYY") + "  to database ..."
            const parseObject = Parse.Object.extend(param2);
            const object = new parseObject();

            object.set("user", Parse.User.current())
            object.set("date", new Date(dayjs.unix(param1).format("YYYY-MM-DD")))
            object.set("dateUnix", Number(param1))
            object.set("openPositions", param3)
            if (param2 == "trades") {
                object.set("executions", executions[param1])
                object.set("trades", trades[param1])
                object.set("blotter", blotter[param1])
                object.set("pAndL", pAndL[param1])
            }
            if (param2 == "cashJournals") {
                object.set("cashJournal", cashJournals.value[param1])
            }

            object.setACL(new Parse.ACL(Parse.User.current()));

            object.save()
                .then((object) => {

                    console.log(" -> Added new " + param2 + " with id " + object.id)
                    i++
                    if (i == numberOfDates) {
                        //console.log("resolve")
                        resolve("resolve")
                    } else {
                        resolve()
                    }

                }, (error) => {
                    console.log('Failed to create new trade, with error code: ' + error.message);
                    spinnerLoadingPage.value = false
                });
        })
    }


    const uploadFunction = async (param) => {
        //console.log(" -> Upload function for "+param)
        return new Promise(async (resolve, reject) => {
            let keys
            i = 0
            numberOfDates = 0

            if (param == "trades") {
                keys = Object.keys(executions)
                numberOfDates = Object.keys(executions).length
            }
            if (param == "cashJournals") {
                keys = Object.keys(cashJournals.value)
                numberOfDates = Object.keys(cashJournals.value).length
            }
            console.log("num of dates " + numberOfDates)
            for (const key of keys) {
                //console.log(" key "+key)
                //console.log(" trades "+JSON.stringify(trades[key]))
                let checkIfOpenPositions = trades[key].findIndex(x => x.openPosition == true)
                //console.log(" checkIfOpenPositions "+checkIfOpenPositions)

                checkIfOpenPositions != -1 ? checkIfOpenPositions = true : checkIfOpenPositions = false
                const promise = await uploadToParse(key, param, checkIfOpenPositions)
                //console.log("promise " + JSON.stringify(promise))
                if (promise == "resolve") resolve()
            }
        })
    }

    const checkTradeAccounts = async () => {
        return new Promise(async (resolve, reject) => {
            //console.log("trade Accounts " + tradeAccounts)
            //console.log("current accounts " + JSON.stringify(currentUser.value.accounts))

            const updateTradeAccounts = async (param, param2) => {
                const parseObject = Parse.Object.extend("_User");
                const query = new Parse.Query(parseObject);
                query.equalTo("objectId", currentUser.value.objectId);
                const results = await query.first();
                if (results) {
                    results.set("accounts", param)
                    //console.log("param 2" + JSON.stringify(param2))
                    await results.save() //very important to have await or else too quick to update
                    //console.log("current accounts " + JSON.stringify(currentUser.value.accounts))
                    let selectedItems = "selectedAccounts"

                    let selectedItemsArray = []
                    if (localStorage.getItem(selectedItems)) {
                        if (localStorage.getItem(selectedItems).includes(",")) {
                            selectedItemsArray = localStorage.getItem(selectedItems).split(",")
                        } else {
                            selectedItemsArray = []
                            selectedItemsArray.push(localStorage.getItem(selectedItems))
                        }
                    } else {
                        selectedItemsArray = []
                    }
                    //console.log(" selected items value " + JSON.stringify(selectedItemsArray))
                    selectedItemsArray.push(param2)
                    localStorage.setItem(selectedItems, selectedItemsArray)
                    //console.log(" -> Updated selectedItems / localstorage " + selectedItemsArray)

                } else {
                    alert("Update query did not return any results")
                }
            }

            if (currentUser.value.accounts) {
                tradeAccounts.forEach(element => {
                    let check = currentUser.value.accounts.find(x => x.value == element)
                    //console.log("check "+JSON.stringify(check))
                    if (!check) {
                        let tempArray = currentUser.value.accounts
                        let temp = {}
                        temp.value = tradeAccounts[0]
                        temp.label = tradeAccounts[0]
                        tempArray.push(temp)
                        updateTradeAccounts(tempArray, temp.value)
                    }
                });
            } else {
                let tempArray = []
                tradeAccounts.forEach(element => {
                    let temp = {}
                    temp.value = element
                    temp.label = element
                    tempArray.push(temp)
                    updateTradeAccounts(tempArray, temp.value)
                })
            }
        })
    }

    const updateOpenPositions = async (param1, param2, param3) => {
        //console.log(" -> Upload function for "+param)
        return new Promise(async (resolve, reject) => {
            console.log(" -> Updating open position " + param1 + " from " + param2)
            const parseObject = Parse.Object.extend("trades");
            const query = new Parse.Query(parseObject);
            query.equalTo("dateUnix", param2);
            const results = await query.first();
            //console.log(' results '+JSON.stringify(results))
            if (results) {
                let parsedRes = JSON.parse(JSON.stringify(results))

                let openPositions = false

                //console.log("unix time "+ object.get('dateUnix'));
                let tempTrades = parsedRes.trades
                //console.log("tempTrades "+JSON.stringify(tempTrades))
                let openPositionIndex = tempTrades.findIndex(x => x.id == param1)
                //console.log(" openPositionIndex " + openPositionIndex)
                if (openPositionIndex != -1) {
                    tempTrades[openPositionIndex].openPosition = false
                    tempTrades[openPositionIndex].exitTime = param3
                }
                for (let index = 0; index < tempTrades.length; index++) {
                    const element = tempTrades[index];
                    if (element.openPosition) {
                        openPositions = true
                    }
                }
                //console.log(" openPositions "+JSON.stringify(openPositions))
                results.set("openPositions", openPositions)
                results.set("trades", tempTrades)

                await results.save().then(resolve()) //very important to have await or else too quick to update

            } else {
                alert("Update query did not return any results")
            }
        })
    }

    checkTradeAccounts()


    const loopOpenPositionsParse = async (param1, param2) => {
        return new Promise(async (resolve, reject) => {
            for (let index = 0; index < openPositionsParse.length; index++) {
                const element = openPositionsParse[index];
                //console.log(" element "+JSON.stringify(element))
                let opIndex = openPositionsFile.findIndex(x => x.id == element.id)
                if (opIndex == -1) {
                    //open positions parse element not anymore in openPositionsFile = trade is now closed
                    await updateOpenPositions(element.id, element.td, element.exitTime)
                }
                if ((index + 1) == openPositionsParse.length) {
                    resolve()
                }
            }
        })
    }

    if (Object.keys(executions).length > 0) await uploadFunction("trades")
    if (Object.keys(mfePrices).length > 0) await updateMfePrices()
    if (openPositionsParse.length > 0) {
        await loopOpenPositionsParse()
    }

    window.location.href = "/dashboard"

}
