const addTradesMixin = {
    data() {
        return {
            gotExistingTradesArray: false, ///CHANGE before prod
            cashJournalsData: null,
            tradesData: null,
            tempExecutions: [],
            existingImports: [],
            includeFinancials: true,
            existingTradesArray: [],
            tradeAccounts: [],

            cashJournals: {},
            executions: {},
            trades: {},
            blotter: {},
            pAndL: {},
            videos: {},
            inputToShow: [],

            tradedSymbols: [],
            tradedStartDate: null,
            tradedEndDate: null,
            ohlcv: [],
            mfePrices: [],
            uploadMfePrices: true,
            openPosition: false
        }
    },

    methods: {

        inputChooseBroker(param) {
            localStorage.setItem('selectedBroker', param)
            this.selectedBroker = param
        },

        /****************************
         * CASH JOURNALS
         ****************************/
        importCashJournals: async function(e) {
            console.log("IMPORTING CASH JOURNALS")
                // Using Papa Parse : https://www.papaparse.com/docs
            this.spinnerLoadingPage = true
            this.spinnerLoadingPageText = "Importing CSV(s) ..."
            var files = e.target.files || e.dataTransfer.files;

            if (!files.length)
                return;

            if (files[0].type != "text/csv") {
                alert("Please upload a csv type file")
                document.getElementById('tradesInput').value = null;
                this.spinnerLoadingPage = false
                return
            }
            //await this.getExistingTradesArray()
            //console.log("existing array "+JSON.stringify(this.existingTradesArray)+" and count "+this.existingTradesArray.length)

            let promise = new Promise((resolve, reject) => {
                console.log(" -> Getting File")
                var reader = new FileReader();
                var vm = this;
                reader.onload = e => {
                    resolve((vm.fileinput = reader.result));
                };
                reader.readAsText(files[0]);
            });

            promise.then(async() => {
                console.log(" -> Creating CSV")
                let papaParse = Papa.parse(this.fileinput, { header: true })

                //we need to recreate the JSON with proper date format + we simplify
                this.cashJournalsData = JSON.parse(JSON.stringify(papaParse.data))

                await this.createJournal()
                await this.filterExisting("cashJournals")
                this.spinnerLoadingPage = false
            })
        },

        createJournal: async function() {
            return new Promise(async(resolve, reject) => {
                    console.log("\nCREATING JOURNAL")
                    this.spinnerLoadingPageText = "Creating journal"
                    const keys = Object.keys(this.cashJournalsData);
                    let temp = [];

                    for (const key of keys) {
                        console.log("key " + key)
                        let temp2 = {};
                        temp2.account = this.cashJournalsData[key].Account
                        temp2.broker = this.selectedBroker
                        temp2.name = this.cashJournalsData[key].Name
                        temp2.currency = this.cashJournalsData[key].Currency

                        /*usDate = dayjs.tz("07/22/2021 00:00:00", 'MM/DD/YYYY 00:00:00', "UTC")
                        //frDate = usDate.tz("Europe/Paris")
                        console.log("date "+usDate+" and fr ")*/
                        //We need to format the date in dayjs format ourself
                        //or else, by dayjs(this.cashJournalsData[key]['E/D']).tz it was formating incorectly in tz
                        const dateArray = this.cashJournalsData[key]['E/D'].split('/');
                        const formatedDate = dateArray[2] + "-" + dateArray[0] + "-" + dateArray[1]
                        temp2.ed = dayjs.tz(formatedDate, this.tradeTimeZone).unix()
                        temp2.deposit = this.cashJournalsData[key].Deposit
                        temp2.withdraw = this.cashJournalsData[key].Withdraw
                        temp2.note = this.cashJournalsData[key].Note

                        temp.push(temp2);
                    }
                    //console.log("temp " + JSON.stringify(temp))
                    console.log(" -> Imported successfully csv");

                    /* GROUPING BY DATE */

                    console.log("\nGROUPING BY DATE")
                    this.spinnerLoadingPageText = "Grouping by date ..."
                    var a = _
                        .chain(temp)
                        .orderBy(["ed"], ["asc"])
                        .groupBy("ed");

                    //console.log(" -> Grouped by date : " + JSON.stringify(JSON.parse(JSON.stringify(a))))

                    console.log(" -> Grouped by date successfully");

                    /* CREATING BLOTTER */

                    console.log("\nCREATING BLOTTER BY COST")
                    this.spinnerLoadingPageText = "Creating blotter by cost ..."
                        //based on trades
                    let objectZ = JSON.parse(JSON.stringify(a))
                        //console.log("objectZ "+JSON.stringify(objectZ))
                    const keys9 = Object.keys(objectZ);
                    var temp10 = {}

                    // Iterating each date/ED
                    for (const key9 of keys9) {
                        console.log("key9 " + JSON.stringify(key9))
                        temp10[key9] = {}
                        var keys10 = objectZ[key9]
                        console.log("Cost for given date " + JSON.stringify(keys10));
                        temp10[key9].locates = []
                        temp10[key9].locate = 0
                        temp10[key9].software = 0
                        temp10[key9].banking = {
                                inn: 0,
                                out: 0,
                                fee: 0
                            }
                            //Iterating each cost
                        for (const key10 of keys10) {
                            var tempLocate = {}
                            var note = key10.note
                            var deposit = parseFloat(key10.deposit)
                            var withdraw = parseFloat(key10.withdraw)

                            //console.log("key10 "+JSON.stringify(key10))
                            if (note.includes("Locate")) {
                                var firstPart = note.split(' @')[0];
                                var symbol = firstPart.split(" ").pop();
                                //Check if symbol already in array in order to add or create
                                var index = _.findIndex(temp10[key9].locates, { symbol: symbol })
                                if (index != -1) {
                                    //console.log("existing fee " + temp10[key9].locates[index].fee)
                                    temp10[key9].locates.splice(index, 1, { symbol: symbol, fee: temp10[key9].locates[index].fee + (withdraw - deposit) })
                                } else {
                                    tempLocate.symbol = symbol
                                    tempLocate.fee = (withdraw - deposit)
                                    temp10[key9].locates.push(tempLocate)
                                }
                                temp10[key9].locate = temp10[key9].locate + (withdraw - deposit)
                            } else if (note.includes("Wire")) {
                                if (note.includes("Fee")) {
                                    temp10[key9].banking.fee = temp10[key9].banking.fee + (withdraw - deposit)
                                }
                                if (!note.includes("Fee") && note.includes("In")) {
                                    temp10[key9].banking.inn = temp10[key9].banking.inn + (deposit - withdraw)
                                }
                                if (!note.includes("Fee") && note.includes("Out")) {
                                    temp10[key9].banking.out = temp10[key9].banking.out + (withdraw - deposit)
                                }
                            } else {
                                temp10[key9].software = temp10[key9].software + (withdraw - deposit)
                            }
                            //console.log(JSON.stringify(temp10[key9]));
                        }

                    }
                    this.cashJournals = temp10
                        //console.log(" -> CASH JOURNAL " + JSON.stringify(this.cashJournals))
                    resolve()
                })
                //this.blotter = temp10
        },

        /****************************
         * TRADES
         ****************************/
        importTrades: async function(e) {
            console.log("IMPORTING FILE")
                // Using Papa Parse : https://www.papaparse.com/docs
            this.spinnerLoadingPage = true
            this.spinnerLoadingPageText = "Importing file ..."
            let files = e.target.files || e.dataTransfer.files;
            console.log(" got existing " + this.gotExistingTradesArray)
            if (!files.length) {
                this.spinnerLoadingPage = false
                return;
            }

            const readAsText = async(param) => {
                return new Promise(async(resolve, reject) => {
                    var reader = new FileReader();
                    var vm = this;
                    reader.onload = e => {
                        resolve(reader.result)
                    };
                    reader.readAsText(param[0]);
                })
            }

            const readAsArrayBuffer = async(param) => {
                return new Promise(async(resolve, reject) => {
                    let reader = new FileReader();
                    reader.onload = e => {
                        resolve(reader.result);
                    };
                    reader.readAsArrayBuffer(param[0]);
                })
            }

            const create = async() => {
                await this.createTempExecutions().catch((error) => {
                    alert("Error in upload file (" + error + ")")
                })

                await this.createExecutions()
                if (this.currentUser.marketDataApiKey &&  this.currentUser.marketDataApiKey != null &&  this.currentUser.marketDataApiKey != '') {
                    await this.getOHLCV()
                }
                await this.createTrades().then(async() => {
                    console.log(" -> Open posisitions: " + this.openPosition)
                    if (this.openPosition) {
                        //console.log("You have one or more open positions. Please close all your positions before import.")
                        alert("You have one or more open positions. Please close all your positions before import.")
                        return
                    } else {
                        await this.createBlotter()
                        await this.filterExisting("trades")
                        await this.createPnL()
                    }
                })

                await (this.spinnerLoadingPage = false)
            }

            /****************************
             * TRADEZERO
             ****************************/
            if (this.selectedBroker == "tradeZero" || this.selectedBroker == "template") {
                console.log(" -> TradeZero / Template")
                let fileInput = await readAsText(files)
                await this.brokerTradeZero(fileInput).catch(error => alert("Error in upload file (" + error + ")"))
            }

            /****************************
             * METATRADER 5
             ****************************/
            if (this.selectedBroker == "metaTrader5") {
                console.log(" -> MetaTrader 5")
                let fileInput = await readAsArrayBuffer(files)
                await this.brokerMetaTrader5(fileInput).catch(error => alert("Error in upload file (" + error + ")"))
            }

            /****************************
             * TD AMERITRADE
             ****************************/
            if (this.selectedBroker == "tdAmeritrade") {
                console.log(" -> TD Ameritrade")
                let fileInput = await readAsText(files)
                await this.brokerTdAmeritrade(fileInput).catch(error => alert("Error in upload file (" + error + ")"))
            }

            /****************************
             * TRADESTATION
             ****************************/
            if (this.selectedBroker == "tradeStation") {
                console.log(" -> Trade Station")
                let fileInput = await readAsArrayBuffer(files)
                await this.brokerTradeStation(fileInput).catch(error => alert("Error in upload file (" + error + ")"))
            }

            /****************************
             * INTERACTIVE BROKERS
             ****************************/
            if (this.selectedBroker == "interactiveBrokers") {
                console.log(" -> Interactive Brokers")
                let fileInput = await readAsText(files)
                await this.brokerInteractiveBrokers(fileInput).catch(error => alert("Error in upload file (" + error + ")"))
            }

            /****************************
             * HELDENTRADER
             ****************************/
            if (this.selectedBroker == "heldentrader") {
                console.log(" -> Heldentrader")
                let fileInput = await readAsText(files)
                await this.brokerHeldentrader(fileInput).catch(error => alert("Error in upload file (" + error + ")"))
            }

            const retryFunction = (callback, delay, tries) => {

                if (tries && callback() !== true) {
                    setTimeout(retryFunction.bind(this, callback, delay, tries - 1), delay);
                } else {
                    //if still false, send alert else create
                    if (!this.gotExistingTradesArray) {
                        this.spinnerLoadingPage = false
                        alert("You loaded your file too quickly. Please refresh page, allow couple of seconds for background job to run and try again.")
                        return;
                    }
                    create()
                }
            }

            const callbackFunction = () => {
                console.log(" -> Waiting for existing trades");
                return this.gotExistingTradesArray
            }

            if (this.gotExistingTradesArray) {
                create()
            } else {
                retryFunction(callbackFunction, 1000, 10);
            }

        },

        createTempExecutions: async function() {
            return new Promise(async(resolve, reject) => {
                console.log("\nCREATING TEMP EXECUTION")
                this.spinnerLoadingPageText = "Creating temp executions"
                const keys = Object.keys(this.tradesData);
                var temp = [];
                var i = 0

                var lastId
                var x
                for (const key of keys) {
                    try {
                        let temp2 = {};
                        temp2.account = this.tradesData[key].Account
                        temp2.broker = this.selectedBroker
                        if (!this.tradeAccounts.includes(this.tradesData[key].Account)) this.tradeAccounts.push(this.tradesData[key].Account)
                            /*usDate = dayjs.tz("07/22/2021 00:00:00", 'MM/DD/YYYY 00:00:00', "UTC")
                            //frDate = usDate.tz("Europe/Paris")
                            console.log("date "+usDate+" and fr ")*/
                        const dateArrayTD = this.tradesData[key]['T/D'].split('/');
                        const formatedDateTD = dateArrayTD[2] + "-" + dateArrayTD[0] + "-" + dateArrayTD[1]
                        temp2.td = dayjs.tz(formatedDateTD, this.tradeTimeZone).unix()

                        const dateArraySD = this.tradesData[key]['S/D'].split('/');
                        const formatedDateSD = dateArraySD[2] + "-" + dateArraySD[0] + "-" + dateArraySD[1]
                        temp2.sd = dayjs.tz(formatedDateSD, this.tradeTimeZone).unix()

                        temp2.currency = this.tradesData[key].Currency;
                        temp2.type = this.tradesData[key].Type;
                        temp2.side = this.tradesData[key].Side;
                        temp2.symbol = this.tradesData[key].Symbol.replace(".", "_")
                        temp2.quantity = parseFloat(this.tradesData[key].Qty);
                        temp2.price = parseFloat(this.tradesData[key].Price);
                        temp2.execTime = dayjs.tz(formatedDateTD + " " + this.tradesData[key]['Exec Time'], this.tradeTimeZone).unix()
                        tempId = "e" + temp2.execTime + "_" + temp2.symbol.replace(".", "_") + "_" + temp2.side;
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
                        temp2.commission = parseFloat(this.tradesData[key].Comm);
                        temp2.sec = parseFloat(this.tradesData[key].SEC);
                        temp2.taf = parseFloat(this.tradesData[key].TAF);
                        temp2.nscc = parseFloat(this.tradesData[key].NSCC);
                        temp2.nasdaq = parseFloat(this.tradesData[key].Nasdaq);
                        temp2.ecnRemove = parseFloat(this.tradesData[key]['ECN Remove']);
                        temp2.ecnAdd = parseFloat(this.tradesData[key]['ECN Add']);
                        temp2.grossProceeds = parseFloat(this.tradesData[key]['Gross Proceeds']);
                        temp2.netProceeds = parseFloat(this.tradesData[key]['Net Proceeds']);
                        temp2.clrBroker = this.tradesData[key]['Clr Broker'];
                        temp2.liq = this.tradesData[key].Liq;
                        temp2.note = this.tradesData[key].Note;
                        temp2.trade = null;

                        this.tempExecutions.push(temp2);

                        if (!this.tradedSymbols.includes(temp2.symbol)) {
                            this.tradedSymbols.push(temp2.symbol)
                        }

                        if (this.tradedStartDate == null) {
                            //console.log("td type " + typeof + temp2.td)
                            this.tradedStartDate = temp2.td
                        } else if (temp2.td < this.tradedStartDate) {
                            this.tradedStartDate = temp2.td
                        }

                        if (this.tradedEndDate == null) {
                            //console.log("td type " + typeof + temp2.td)
                            this.tradedEndDate = temp2.execTime
                        } else if (temp2.execTime > this.tradedEndDate) {
                            this.tradedEndDate = temp2.execTime
                        }

                        //console.log(" -> Trade start date " + this.tradedStartDate)
                        //console.log(" -> Trade end date " + this.tradedEndDate)
                        //console.log("temp " + JSON.stringify(temp))
                        //console.log(" -> Created temp executions");
                    } catch (error) {
                        console.log("  --> ERROR " + error)
                        reject(error)
                    }
                }
                resolve()
            })
        },

        createExecutions: async function() {
            return new Promise(async(resolve, reject) => {
                console.log("\nCREATING EXECUTIONS")
                this.spinnerLoadingPageText = "Creating executions"
                var a = _
                    .chain(this.tempExecutions)
                    .orderBy(["execTime"], ["asc"])
                    .groupBy("td");

                this.executions = JSON.parse(JSON.stringify(a))
                    //console.log("length "+Object.keys(this.executions).length)
                    //check if object already exists



                //console.log('executions ' + JSON.stringify(this.executions))
                console.log(" -> Created");
                resolve()
            })
        },

        getOHLCV: async function() {
            return new Promise(async(resolve, reject) => {
                console.log("\nGETTING OHLCV")
                this.spinnerLoadingPageText = "Getting OHLCV"
                const asyncLoop = async() => {
                    for (let i = 0; i < this.tradedSymbols.length; i++) { // I think that async needs to be for instead of foreach
                        let temp = {}
                        temp.symbol = this.tradedSymbols[i]
                            //console.log(" -> From date " + this.tradedStartDate)
                            //console.log(" -> To " + this.tradedEndDate)
                        let toDate = dayjs(this.tradedEndDate * 1000).tz(this.tradeTimeZone).endOf('day').unix()
                            //console.log(" -> To date " + toDate)

                        axios.interceptors.response.use(undefined, (err) => {
                            const { config, message } = err;
                            if (err) {
                                console.log(" -> Interceptors status " + err.response.status)
                                console.log(" -> Interceptors data " + JSON.stringify(err.response.data))
                                console.log(" -> Interceptors message " + message)
                                this.spinnerLoadingPageText = "Getting OHLCV - API limit reached - Retrying 60 seconds"
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

                        await axios.get("https://api.polygon.io/v2/aggs/ticker/" + temp.symbol + "/range/1/minute/" + this.tradedStartDate * 1000 + "/" + toDate * 1000 + "?adjusted=true&sort=asc&limit=50000&apiKey=" + this.currentUser.marketDataApiKey, { retry: 5, retryDelay: 60000 })
                            .then((response) => {
                                //console.log(" -> data " + JSON.stringify(response))
                                //console.log(" -> ohlcvData " + JSON.stringify(ohlcvData))
                                temp.ohlcv = response.data.results
                                this.ohlcv.push(temp)
                                    //console.log(" -> ohlcv " + JSON.stringify(this.ohlcv))
                            })
                            .catch((error) => {

                                console.log(" -> Polygon api get error " + error.status);
                            })
                            .finally(function() {
                                // always executed
                            })


                    }
                }
                await asyncLoop()
                resolve()
            })
        },

        createTrades: async function() {
            return new Promise(async(resolve, reject) => {
                console.log("\nCREATING TRADES")
                this.spinnerLoadingPageText = "Creating trades"
                var b = _
                    .chain(this.tempExecutions)
                    .orderBy(["execTime"], ["asc"])
                    .groupBy("symbol");

                objectB = JSON.parse(JSON.stringify(b))
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

                    for (const tempExec of tempExecs) {
                        //console.log("tempExec " + JSON.stringify(tempExec));
                        //console.log("doing key "+key2)
                        if (newTrade == true) { //= new trade
                            console.log("\n -> New trade for symbol " + tempExec.symbol)
                            newTrade = false
                            var invertedLong = false
                            var invertedShort = false

                            /*******************
                             * Info 
                             *******************/

                            temp7.id = tempExec.side == "B" || tempExec.side == "S" ? "t" + tempExec.execTime + "_" + tempExec.symbol + "_B" : "t" + tempExec.execTime + "_" + tempExec.symbol + "_SS"
                                //console.log("   -> ID " + temp7.id)
                            newIds.push(temp7.id)
                            temp7.account = tempExec.account;
                            temp7.broker = tempExec.broker
                            temp7.td = tempExec.td;
                            temp7.currency = tempExec.currency;
                            temp7.type = tempExec.type;
                            temp7.side = tempExec.side;
                            if (tempExec.side == "B") {
                                temp7.strategy = "long"
                                console.log("  --> Symbol " + key2 + " is bought and long")
                                temp7.buyQuantity = tempExec.quantity;
                                temp7.sellQuantity = 0
                            }
                            if (tempExec.side == "S") { //occasionnaly, Tradezero inverts trades and starts by accounting the sell even though it's a long possition
                                temp7.strategy = "long"
                                    //console.log("Symbol " + key2 + " is sold and long")
                                console.log("  --> Symbol " + key2 + " is accounted as sell before buy on date " + this.chartFormat(tempExec.td) + " at " + this.timeFormat(tempExec.execTime))
                                invertedLong = true
                                temp7.buyQuantity = 0
                                temp7.sellQuantity = tempExec.quantity;
                            }
                            if (tempExec.side == "SS") {
                                temp7.strategy = "short"
                                console.log("  --> Symbol " + key2 + " is sold and short")
                                temp7.buyQuantity = 0
                                temp7.sellQuantity = tempExec.quantity;
                            }
                            if (tempExec.side == "BC") { //occasionnaly, Tradezero invertes trades
                                temp7.strategy = "short"
                                console.log("  --> Symbol " + key2 + " is accounted as buy cover before short sell on date " + this.chartFormat(tempExec.td) + " at " + this.timeFormat(tempExec.execTime))
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
                                /*if (temp7.entryTime >= this.startTimeUnix) {
                                    temp7.videoStart = temp7.entryTime - this.startTimeUnix
                                }*/

                            /*******************
                             * Commissions and fees
                             *******************/
                            temp7.commission = tempExec.commission;
                            temp7.sec = tempExec.sec;
                            temp7.taf = tempExec.taf;
                            temp7.nscc = tempExec.nscc;
                            temp7.nasdaq = tempExec.nasdaq;
                            temp7.ecnRemove = tempExec.ecnRemove;
                            temp7.ecnAdd = tempExec.ecnAdd;
                            temp7.clrBroker = tempExec.clrBroker;
                            temp7.liq = tempExec.liq;

                            /*******************
                             * Gross proceeds and P&L
                             *******************/
                            temp7.grossEntryProceeds = tempExec.grossProceeds;
                            temp7.grossExitProceeds = 0
                            temp7.grossProceeds = tempExec.grossProceeds;
                            temp7.grossWins = 0 //Winning proceeds
                            temp7.grossLoss = 0 //Loosing proceeds
                            temp7.grossSharePL = 0 //Proceeds per share traded
                            temp7.grossSharePLWins = 0 //Wins among proceeds per share
                            temp7.grossSharePLLoss = 0 //Losses among proceeds per share
                            temp7.grossStatus = null

                            /*******************
                             * Net proceeds and P&L
                             *******************/
                            temp7.netEntryProceeds = tempExec.netProceeds;
                            temp7.netExitProceeds = 0
                            temp7.netProceeds = tempExec.netProceeds;
                            temp7.netWins = 0
                            temp7.netLoss = 0
                            temp7.netSharePL = 0 //Less important metric than gross because fees are notre a percentage this gives strange results. Beside, we don't use it afterwards. But I keep it for the sake of homogeneity
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
                            temp7.setup = {}
                            let existingPatternsMistakes = this.patternsMistakes.filter(obj => obj.tradeId == temp7.id)
                                //console.log(" -> Existing patterns mistakes "+JSON.stringify(existingPatternsMistakes))
                            if (existingPatternsMistakes.length > 0) {
                                console.log("  --> Pattern or mistake exist already")
                                if (existingPatternsMistakes[0].hasOwnProperty('pattern') && existingPatternsMistakes[0].pattern != null && existingPatternsMistakes[0].pattern != undefined && existingPatternsMistakes[0].pattern.hasOwnProperty('objectId')) temp7.setup.pattern = existingPatternsMistakes[0].pattern.objectId

                                if (existingPatternsMistakes[0].hasOwnProperty('mistake') && existingPatternsMistakes[0].mistake != null && existingPatternsMistakes[0].mistake != undefined && existingPatternsMistakes[0].mistake.hasOwnProperty('objectId')) temp7.setup.mistake = existingPatternsMistakes[0].mistake.objectId
                            }
                            //console.log("   ---> Setup "+JSON.stringify(temp7.setup))
                            temp7.note = tempExec.note
                            temp7.executions = []
                            temp7
                                .executions
                                .push(tempExec.id)
                            this
                                .executions[tempExec.td]
                                .find(x => x.id == tempExec.id)
                                .trade = temp7
                                .id;

                        } else if (newTrade == false) { //= concatenating trade
                            console.log("  --> Concatenating trade for symbol " + tempExec.symbol + " and strategy " + temp7.strategy)
                                //console.log(" -> temp2 concat is " + JSON.stringify(temp2))

                            if (temp7.strategy == "long") {
                                //console.log(" -> Strategy is long and "+invertedLong+" for symbol "+tempExec.symbol)
                                if (!invertedLong) {
                                    if (tempExec.side == temp7.side) { // adding to position
                                        temp7.buyQuantity = temp7.buyQuantity + tempExec.quantity
                                            //console.log(" -> quantity is "+temp7.buyQuantity)
                                    } else { // clearing/closing position
                                        temp7.sellQuantity = temp7.sellQuantity + tempExec.quantity
                                            //console.log(" -> quantity is "+temp7.buyQuantity)
                                    }
                                } else {
                                    if (tempExec.side == temp7.side) { // adding to position
                                        temp7.sellQuantity = temp7.sellQuantity + tempExec.quantity
                                    } else { // clearing/closing position
                                        temp7.buyQuantity = temp7.buyQuantity + tempExec.quantity
                                    }
                                }
                            }

                            if (temp7.strategy == "short") {
                                //console.log(" -> Strategy is short and "+invertedShort+" for symbol "+tempExec.symbol)
                                if (!invertedShort) {
                                    if (tempExec.side == temp7.side) { // adding to position
                                        temp7.sellQuantity = temp7.sellQuantity + tempExec.quantity
                                    } else { // clearing/closing position
                                        temp7.buyQuantity = temp7.buyQuantity + tempExec.quantity
                                    }
                                } else {
                                    if (tempExec.side == temp7.side) { // adding to position
                                        temp7.buyQuantity = temp7.buyQuantity + tempExec.quantity
                                    } else { // clearing/closing position
                                        temp7.sellQuantity = temp7.sellQuantity + tempExec.quantity
                                    }
                                }
                            }

                            temp7.commission = temp7.commission + tempExec.commission;
                            temp7.sec = temp7.sec + tempExec.sec;
                            temp7.taf = temp7.taf + tempExec.taf;
                            temp7.nscc = temp7.nscc + tempExec.nscc;
                            temp7.nasdaq = temp7.nasdaq + tempExec.nasdaq;

                            temp7.grossExitProceeds = temp7.grossExitProceeds + tempExec.grossProceeds;
                            temp7.grossProceeds = temp7.grossProceeds + tempExec.grossProceeds;

                            temp7.netExitProceeds = temp7.netExitProceeds + tempExec.netProceeds;
                            temp7.netProceeds = temp7.netProceeds + tempExec.netProceeds;
                            temp7
                                .executions
                                .push(tempExec.id)

                            //here we do += because this is trades so here when we are concatenating, we need to add +1 to the execution count. ANother option would be to calculate the number of executions but we would need to rely on the executions list. Too complicated.
                            temp7.executionsCount += 1
                            this
                                .executions[tempExec.td]
                                .find(x => x.id == tempExec.id)
                                .trade = temp7.id

                            if (temp7.buyQuantity == temp7.sellQuantity) { //When buy and sell quantities are equal means position is closed
                                temp7.exitPrice = tempExec.price;
                                temp7.exitTime = tempExec.execTime;
                                /*if (temp7.exitTime >= this.startTimeUnix) {
                                    temp7.videoEnd = temp7.exitTime - this.startTimeUnix
                                }*/

                                temp7.grossSharePL = temp7.grossProceeds / (temp7.buyQuantity) //P&L per share is in reality "per share bought (if long)". So, when trade is closed, we take the total quantity and divide by 2

                                temp7.grossSharePL >= 0 ? temp7.grossSharePLWins = temp7.grossSharePL : temp7.grossSharePLLoss = temp7.grossSharePL


                                if (temp7.grossProceeds >= 0) {
                                    temp7.grossStatus = "win"
                                    temp7.grossWinsQuantity = temp7.buyQuantity
                                    temp7.grossWins = temp7.grossProceeds
                                    grossWinsCount = 1
                                    grossLossCount = 0
                                } else {
                                    temp7.grossStatus = "loss"
                                    temp7.grossLossQuantity = temp7.buyQuantity
                                    temp7.grossLoss = temp7.grossProceeds
                                    grossLossCount = 1
                                    grossWinsCount = 0
                                }

                                temp7.netSharePL = temp7.netProceeds / (temp7.buyQuantity)
                                temp7.netSharePL >= 0 ? temp7.netSharePLWins = temp7.netSharePL : temp7.netSharePLLoss = temp7.netSharePL

                                if (temp7.netProceeds >= 0) {
                                    temp7.netStatus = "win"
                                    temp7.netWinsQuantity = temp7.buyQuantity
                                    temp7.netWins = temp7.netProceeds
                                    netWinsCount = 1
                                    netLossCount = 0
                                } else {
                                    temp7.netStatus = "loss"
                                    temp7.netLossQuantity = temp7.buyQuantity
                                    temp7.netLoss = temp7.netProceeds
                                    netLossCount = 1
                                    netWinsCount = 0
                                }

                                tradesCount = 1
                                temp7.grossWinsCount = grossWinsCount
                                temp7.netWinsCount = netWinsCount
                                temp7.grossLossCount = grossLossCount
                                temp7.netLossCount = netLossCount
                                temp7.tradesCount = tradesCount
                                    //console.log("temp 7 " + JSON.stringify(temp7))
                                    //console.log("temp not null for "+key2)



                                /*****
                                 * GETTING MFE PRICE
                                 *****/

                                if ((this.currentUser.marketDataApiKey &&  this.currentUser.marketDataApiKey != null &&  this.currentUser.marketDataApiKey != '') && this.uploadMfePrices && this.ohlcv.findIndex(f => f.symbol == tempExec.symbol) != -1) {
                                    console.log("  --> Getting MFE Price")
                                    let ohlcvSymbol = this.ohlcv[this.ohlcv.findIndex(f => f.symbol == tempExec.symbol)].ohlcv
                                        //todo exclude if trade in same minute timeframe

                                    //console.log(" ohlcvSymbol " + JSON.stringify(ohlcvSymbol))

                                    if (ohlcvSymbol != undefined) {
                                        //console.log(" initEntryTime " + initEntryTime * 1000)
                                        //findIndex gets the first value. So, for entry, if equal, we take next candle. For exit, if equal, we use that candle
                                        let tempStartIndex = ohlcvSymbol.findIndex(n => n.t >= initEntryTime * 1000)
                                            //console.log(" temp start index "+tempStartIndex)
                                        let tempEndIndex = ohlcvSymbol.findIndex(n => n.t >= temp7.exitTime * 1000) //findIndex returns the first element
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

                                        if (tempEndTime == temp7.exitTime) {
                                            endIndex = tempEndIndex
                                            endTime = tempEndTime
                                        } else {
                                            endIndex = tempEndIndex - 1
                                            endTime = ohlcvSymbol[tempEndIndex - 1].t
                                        }

                                        //console.log("   ----> Temp Start index " + tempStartIndex + ", temp end index " + tempEndIndex)
                                        //console.log("   ----> EntryTime " + initEntryTime + " and start time " + startTime)
                                        //console.log("   ----> ExitTime " + temp7.exitTime + " and end time " + endTime)

                                        //Get market close index
                                        //iterate from exit time and check if same day and <= 4 hour
                                        let endTimeDay = dayjs(endTime).tz(this.tradeTimeZone).get("date")
                                        let endTimeMonth = dayjs(endTime).tz(this.tradeTimeZone).get("month") + 1
                                        let endTimeYear = dayjs(endTime).tz(this.tradeTimeZone).get("year")
                                        let endTimeDate = endTimeYear + "-" + endTimeMonth + "-" + endTimeDay + " 16:00:00" //VERY IMPORTANT : if i want to apply US time, it needs to be in US format, that is YYYY-MM-DD
                                            //console.log(" -> End time date "+endTimeDate)
                                            //    
                                        let marketCloseTime = dayjs.tz(endTimeDate, this.tradeTimeZone)

                                        //console.log(" marketCloseTime "+marketCloseTime)

                                        let tempEndOfDayTimeIndex = ohlcvSymbol.findIndex(f => f.t >= marketCloseTime)
                                        let endOfDayTimeIndex = tempEndOfDayTimeIndex - 1
                                            //console.log(" -> End of day time index "+endOfDayTimeIndex+" and values are "+JSON.stringify(ohlcvSymbol[endOfDayTimeIndex]))

                                        /*let timeDayOfWeek = dayjs(endTime * 1000).tz(this.tradeTimeZone).day()
                                        console.log(" timeDayOfWeek "+timeDayOfWeek)
                                        let timeHour = dayjs(endTime * 1000).tz(this.tradeTimeZone).get('hour')
                                        let time
                                        let i = tempEndIndex - 1;
                                        while (i < ohlcvSymbol.length && endTimeOfWeek == timeDayOfWeek && timeHour < 17) {
                                            time = ohlcvSymbol[i].t
                                            timeDayOfWeek = dayjs(time * 1000).tz(this.tradeTimeZone).day()
                                            timeHour = dayjs(time * 1000).tz(this.tradeTimeZone).get('hour')
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

                                            tempMfe.tradeId = temp7.id
                                            tempMfe.dateUnix = tempExec.td
                                            tempMfe.mfePrice = initEntryPrice
                                            this.mfePrices.push(tempMfe)

                                        } else {
                                            //we get the MFE price by iterating between entry and exit and then between exit up until price hits / equals entryprice, and at the latest the endOfDayTime
                                            let priceDifference
                                            let mfePrice = initEntryPrice

                                            if (temp7.strategy == "long") {
                                                priceDifference = temp7.exitPrice - initEntryPrice
                                            }
                                            if (temp7.strategy == "short") {
                                                priceDifference = initEntryPrice - temp7.exitPrice
                                            }

                                            console.log("   ---> Iterating between entry price and exit price")
                                                //console.log("    ----> Start index "+startIndex+ " and end index "+endIndex)
                                            for (let i = startIndex; i <= endIndex; i++) {
                                                //console.log(" Symbole price "+ohlcvSymbol.h[i]+" at time "+ohlcvSymbol.t[i]+" and MFE "+mfePrice)
                                                if (temp7.strategy == "long" && ohlcvSymbol[i].h > temp7.exitPrice && ohlcvSymbol[i].h > mfePrice) mfePrice = ohlcvSymbol[i].h
                                                if (temp7.strategy == "short" && ohlcvSymbol[i].l < temp7.exitPrice && ohlcvSymbol[i].l < mfePrice) mfePrice = ohlcvSymbol[i].l

                                            }
                                            //console.log(" -> Price difference "+priceDifference)
                                            if (initEntryPrice != temp7.exitPrice && priceDifference > 0) { //case where stop loss above entryprice
                                                console.log("   ---> Iterating between exit price and up until price hits / equals entry price, and at the latest until market close")
                                                let i = endIndex
                                                let ohlcvSymbolPrice
                                                temp7.strategy == "long" ? ohlcvSymbolPrice = ohlcvSymbol[endIndex].h : ohlcvSymbolPrice = ohlcvSymbol[endIndex].l

                                                //console.log(" -> endOfDayTimeIndex "+endOfDayTimeIndex)
                                                while (i <= endOfDayTimeIndex && (temp7.strategy == "long" ? ohlcvSymbolPrice > initEntryPrice : ohlcvSymbolPrice < initEntryPrice)) {
                                                    temp7.strategy == "long" ? ohlcvSymbolPrice = ohlcvSymbol[i].h : ohlcvSymbolPrice = ohlcvSymbol[i].l
                                                        //console.log("  -> Symbol Price " + ohlcvSymbolPrice + " @ "+this.dateTimeFormat(ohlcvSymbol[i].t/1000)+", init price " + initEntryPrice + " and mfe price " + mfePrice)
                                                    if (temp7.strategy == "long" && ohlcvSymbolPrice > initEntryPrice && ohlcvSymbolPrice > mfePrice) mfePrice = ohlcvSymbolPrice
                                                    if (temp7.strategy == "short" && ohlcvSymbolPrice < initEntryPrice && ohlcvSymbolPrice < mfePrice) mfePrice = ohlcvSymbolPrice
                                                    i++

                                                }
                                            }
                                            if (temp7.strategy == "long" && mfePrice < initEntryPrice) mfePrice = initEntryPrice
                                            if (temp7.strategy == "short" && mfePrice > initEntryPrice) mfePrice = initEntryPrice

                                            console.log("    ----> " + temp7.strategy + " stratgy with entry at " + this.dateTimeFormat(initEntryTime) + " @ " + initEntryPrice + " -> exit at " + this.dateTimeFormat(temp7.exitTime) + " @ " + temp7.exitPrice + " and MFE price " + mfePrice)
                                                //if short, MFE price = if price is lower than MFE
                                                //if long, MFE = if price is higher than MFE




                                            //add excursion to temp2
                                            temp7.excursions = {}
                                            temp7.excursions.stopLoss = null
                                            temp7.excursions.maePrice = null
                                            temp7.excursions.mfePrice = mfePrice

                                            tempMfe.tradeId = temp7.id
                                            tempMfe.dateUnix = tempExec.td
                                            tempMfe.mfePrice = mfePrice
                                            this.mfePrices.push(tempMfe)
                                        }
                                    } else {
                                        console.log("   ---> Cannot find symbol in market data provider")
                                    }
                                } // End MFE prices

                                temp2.push(temp7)


                                /*****
                                 * END GETTING MFE PRICE
                                 *****/

                                newTrade = true
                                temp7 = {} // I need to reinitiate temp7 here or else when more than one trade per symbol it was adding up
                                    //console.log("temp2 is " + JSON.stringify(temp2))
                                    //console.log(" -> trade concat finished")
                                    //console.log(tradesCount+" trades for symbol "+key2)

                                console.log("   ---> Position CLOSED")
                                this.openPosition = false

                            } else {
                                console.log("   ---> Position OPEN")
                                this.openPosition = true
                            }
                        } else {
                            console.log("nothing for key " + key2)
                        }

                        //console.log("New trade status of symbol "+key2+" is "+newTrade+". the JSON is "+JSON.stringify(temp7))
                    }
                    /* For later, when doing swing trades
                    newIds.forEach(element => {
                        swingCheck = temp2.filter(x => x.id == element)
                        //console.log("swing check "+JSON.stringify(swingCheck))
                        if (swingCheck.length > 0){
                            console.log("Id "+element+" is day trade")
                        }else{
                            console.log("Id "+element+" is swing trade")
                        }
                    });*/

                }

                //console.log("temp2 "+JSON.stringify(temp2))
                var c = _
                    .chain(temp2)
                    .orderBy(["entryTime"], ["asc"])
                    .groupBy("td");
                //console.log(" -> Trades " + JSON.stringify(c))
                this.trades = JSON.parse(JSON.stringify(c))
                    //console.log("Trades C " + JSON.stringify(this.trades))
                resolve()
            })
        },

        updateMfePrices: async function(param) {
            return new Promise(async(resolve, reject) => {
                console.log("  --> Updating excursion DB with MFE price")
                this.spinnerLoadingPageText = "Updating MFE prices in excursions"
                    //console.log(" MFE Prices " + JSON.stringify(this.mfePrices))
                this.mfePrices.forEach(element => {
                    //console.log(" element " + element)
                    const Object = Parse.Object.extend("excursions");
                    const object = new Object();
                    object.set("user", Parse.User.current())
                    object.set("mfePrice", element.mfePrice)
                    object.set("dateUnix", element.dateUnix)
                    object.set("tradeId", element.tradeId)
                    object.setACL(new Parse.ACL(Parse.User.current()));
                    object.save()
                        .then(async(object) => {
                            console.log(' -> Added new excursion with id ' + object.id)
                                //this.spinnerSetupsText = "Added new setup"
                            this.tradeId = this.tradeExcursionId // we need to do this if I want to manipulate the current modal straight away, like for example delete after saving. WHen You push next or back, tradeId is set back to null
                        }, (error) => {
                            console.log('Failed to create new object, with error code: ' + error.message);
                        })
                });
                resolve()
            })
        },

        filterExisting: async function(param) {
            return new Promise(async(resolve, reject) => {
                console.log("\nFILTERING EXISTING")
                this.spinnerLoadingPageText = "Filtering existing"
                    // We can only filter at this point because trades depend on executions. So, once trades are created, we can filter out existing trades

                //await this.getExistingTradesArray(param) => Here, I no longer call it here but on page load, so it's quicker to load

                //console.log("existing array "+JSON.stringify(this.existingTradesArray)+" and count "+this.existingTradesArray.length)
                /* I have to rename and make specific caser for existingTradesArray => existingCashJournalsArray
                
                if (param == "cashJournals") {
                    this.existingTradesArray.forEach(element => {
                        if (this.cashJournals.hasOwnProperty(element)) {
                            console.log("date exists " + element)
                            this.existingImports.push(element)
                        }
                    });
                    this.cashJournals = _.omit(this.cashJournals, this.existingTradesArray)
                    console.log("cashJournal " + JSON.stringify(this.cashJournals))
                } */

                if (param == "trades") {
                    this.existingTradesArray.forEach(element => {
                        if (this.executions.hasOwnProperty(element)) {
                            console.log("date exists " + element)
                            this.existingImports.push(element)
                        }
                    });
                    this.executions = _.omit(this.executions, this.existingTradesArray)
                    this.trades = _.omit(this.trades, this.existingTradesArray)
                }
                resolve()
            })
        },

        createBlotter: async function(param) {
            return new Promise(async(resolve, reject) => {
                console.log("\nCREATING BLOTTER BY SYMBOL")
                this.spinnerLoadingPageText = "Creating blotter"
                    //based on trades
                let objectZ
                if (param) {
                    //console.log("param " + param)
                    let temp = _
                        .chain(this.filteredTradesTrades)
                        .orderBy(["entryTime"], ["asc"])
                        .groupBy("td")
                    objectZ = JSON.parse(JSON.stringify(temp))
                        //console.log(" temp "+JSON.stringify(temp))
                } else {
                    objectZ = this.trades
                        //console.log(" this trades "+JSON.stringify(this.trades))
                }

                const keys9 = Object.keys(objectZ);
                var temp10 = {}
                for (const key9 of keys9) {
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
                        temp10[key9][key10].symbol = key10;
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
                //console.log(" -> BLOTTER " + JSON.stringify(temp10))
                this.blotter = temp10
                resolve()
            })
        },

        createPnL: async function() {
            return new Promise(async(resolve, reject) => {
                console.log("\nCREATING P&L")
                this.spinnerLoadingPageText = "Creating P&L"
                    //based on blotter
                objectQ = this.blotter
                const keys7 = Object.keys(objectQ);
                var temp9 = {}

                for (const key7 of keys7) {
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
                //console.log(" -> P&L: " + JSON.stringify(temp9))
                this.pAndL = temp9


                //console.log(" -> Created trades table successfully");
                resolve()
            })
        },

        getExistingTradesArray: async function() {
            console.log(" -> Getting existing trades for filter")
            return new Promise(async(resolve, reject) => {
                const Object = Parse.Object.extend("trades");
                const query = new Parse.Query(Object);
                query.equalTo("user", Parse.User.current());
                query.limit(this.queryLimit); // limit to at most 1M results
                const results = await query.find();
                for (let i = 0; i < results.length; i++) {
                    const object = results[i];
                    //console.log("unix time "+ object.get('dateUnix'));
                    this.existingTradesArray.push(object.get('dateUnix'))
                }
                this.gotExistingTradesArray = true
                console.log(" -> Finished getting existing trades for filter")
                resolve()
            })
        },

        /* ---- 4: UPLOAD TO PARSE TRADES  ---- */
        uploadTrades: async function() {

            console.log("\nUPLOADING TRADES")
            this.spinnerLoadingPage = true
            this.spinnerLoadingPageText = "Uploading and storing trades(s) ..."

            let numberOfDates = 0
            let i = 0
                //Function uplaod trades to parse
            uploadToParse = async(param1, param2) => {
                return new Promise(async(resolve, reject) => {
                    //console.log(" -> Parse param2 is " + param2)
                    this.spinnerLoadingPageText = "Uploading data from " + dayjs.unix(param1).format("DD MMMM YYYY") + "  to database ..."
                    const Object = Parse.Object.extend(param2);
                    const object = new Object();

                    object.set("user", Parse.User.current())
                    object.set("date", new Date(dayjs.unix(param1).format("YYYY-MM-DD")))
                    object.set("dateUnix", Number(param1))
                    if (param2 == "trades") {
                        object.set("executions", this.executions[param1])
                        object.set("trades", this.trades[param1])
                        object.set("blotter", this.blotter[param1])
                        object.set("pAndL", this.pAndL[param1])
                    }
                    if (param2 == "cashJournals") {
                        object.set("cashJournal", this.cashJournals[param1])
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
                            this.spinnerLoadingPage = false
                        });
                })
            }


            uploadFunction = async(param) => {
                //console.log(" -> Upload function for "+param)
                return new Promise(async(resolve, reject) => {
                    let keys
                    i = 0
                    numberOfDates = 0

                    if (param == "trades") {
                        keys = Object.keys(this.executions)
                        numberOfDates = Object.keys(this.executions).length
                    }
                    if (param == "cashJournals") {
                        keys = Object.keys(this.cashJournals)
                        numberOfDates = Object.keys(this.cashJournals).length
                    }
                    console.log("num of dates " + numberOfDates)
                    for (const key of keys) {
                        const promise = await uploadToParse(key, param)
                            //console.log("promise " + JSON.stringify(promise))
                        if (promise == "resolve") resolve()
                    }
                })
            }

            checkTradeAccounts = async(param) => {
                return new Promise(async(resolve, reject) => {
                    //console.log("trade Accounts " + this.tradeAccounts)
                    //console.log("current accounts " + JSON.stringify(this.currentUser.accounts))

                    let updateTradeAccounts = async(param) => {
                        const Object = Parse.Object.extend("_User");
                        const query = new Parse.Query(Object);
                        query.equalTo("objectId", this.currentUser.objectId);
                        const results = await query.first();
                        if (results) {
                            results.set("accounts", param)
                            await results.save() //very important to have await or else too quick to update
                                //console.log("current accounts " + JSON.stringify(this.currentUser.accounts))

                        } else {
                            alert("Update query did not return any results")
                        }
                    }

                    if (this.currentUser.accounts) {
                        this.tradeAccounts.forEach(element => {
                            let check = this.currentUser.accounts.find(x => x.value == element)
                                //console.log("check "+JSON.stringify(check))
                            if (!check) {
                                let tempArray = this.currentUser.accounts
                                let temp = {}
                                temp.value = this.tradeAccounts[0]
                                temp.label = this.tradeAccounts[0]
                                tempArray.push(temp)
                                updateTradeAccounts(tempArray)
                            }
                        });
                    } else {
                        let tempArray = []
                        let temp = {}
                        temp.value = this.tradeAccounts[0]
                        temp.label = this.tradeAccounts[0]
                        tempArray.push(temp)
                        updateTradeAccounts(tempArray)
                    }
                })
            }
            checkTradeAccounts()
            if (Object.keys(this.cashJournals).length > 0) await uploadFunction("cashJournals")
            if (Object.keys(this.executions).length > 0) await uploadFunction("trades")
            if (Object.keys(this.mfePrices).length > 0) await this.updateMfePrices()
            this.refreshTrades()

        },

        refreshTrades: async function() {
            console.log("\nREFRESHING INFO")
            await (this.spinnerLoadingPage = true)
            this.dashboardIdMounted = false
            this.renderingCharts = true //for daily
            this.spinnerLoadingPageText = "Refreshing info"
            this.renderData += 1
            this.dashboardChartsMounted = false
            await this.getTradesFromDb()
            console.log("done")
                //this.spinnerLoadingPage = false
            if (this.currentPage.id == "dashboard" || this.currentPage.id == "calendar" ||  this.currentPage.id == "daily") {
                await this.getAllTrades(true)
                await this.initTab()
            }

            if (this.currentPage.id == "addTrades") { //this will redirect if we refresh data but is need when we upload trades
                window.location.href = "/dashboard"
            }

            await (this.spinnerLoadingPage = false)

            //setTimeout(() => { window.location.href = "/dashboard" }, 5000)
        }
    }
};