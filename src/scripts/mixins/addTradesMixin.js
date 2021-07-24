const addTradesMixin = {
    methods: {

        /* ---- 1: CREATE TABLES ---- */
        createTables: async function(e) {
            console.log("IMPORTING CSV")
            this.loadingSpinner = true
            this.loadingSpinnerText = "Importing CSV(s) ..."
            var files = e.target.files || e.dataTransfer.files;

            if (!files.length)
                return;

            if (files[0].type != "text/csv") {
                alert("Please upload a csv type file")
                document.getElementById('tradesInput').value = null;
                this.loadingSpinner = false
                return
            }
            await this.getExistingTradesArray()
                //console.log("existing array "+JSON.stringify(this.existingTradesArray)+" and count "+this.existingTradesArray.length)

            let promise = new Promise((resolve, reject) => {
                var reader = new FileReader();
                var vm = this;
                reader.onload = e => {
                    resolve((vm.fileinput = reader.result));
                };
                reader.readAsText(files[0]);
            });

            promise.then(result => {
                (async() => {
                    parseCsvToJson = Papa.parse(this.fileinput, { header: true })
                    parseCsvToJsonData = parseCsvToJson.data
                        //console.log("parseCsvToJsonData " + JSON.stringify(parseCsvToJsonData))

                    //we need to recreate the JSON with proper date format + we simplify
                    parseCsvToJsonParse = JSON.parse(JSON.stringify(parseCsvToJsonData))
                    const keys = Object.keys(parseCsvToJsonParse);
                    var tempExecutions = [];
                    var i = 0
                    var temp = [];


                    /* ==============================================

                    1 : IMPORTING CSV (by iterating through each execution)

                    ================================================= */

                    var lastId
                    var x
                    for (const key of keys) {
                        temp[i] = {};
                        temp[i].account = parseCsvToJsonParse[key].Account;
                        temp[i].td = dayjs(parseCsvToJsonParse[key]['T/D'], 'MM/DD/YYYY').unix();
                        temp[i].sd = dayjs(parseCsvToJsonParse[key]['S/D'], 'MM/DD/YYYY').unix();
                        temp[i].currency = parseCsvToJsonParse[key].Currency;
                        temp[i].type = parseCsvToJsonParse[key].Type;
                        temp[i].side = parseCsvToJsonParse[key].Side;
                        temp[i].symbol = parseCsvToJsonParse[key].Symbol;
                        temp[i].quantity = parseInt(parseCsvToJsonParse[key].Qty);
                        temp[i].price = parseFloat(parseCsvToJsonParse[key].Price);
                        temp[i].execTime = dayjs(parseCsvToJsonParse[key]['T/D'] + ' ' + parseCsvToJsonParse[key]['Exec Time'], 'MM/DD/YYYY HH:mm:ss').unix();
                        tempId = "e" + temp[i].execTime + "_" + temp[i].symbol + "_" + temp[i].side;
                        // It happens that two or more trades happen at the same (second) time. So we need to differentiated them
                        if (tempId != lastId) {
                            x = 1
                            temp[i].id = tempId + "_" + x
                            lastId = tempId
                                //console.log("last id "+lastId)
                        } else {
                            x++
                            temp[i].id = tempId + "_" + x
                        }
                        temp[i].commission = parseFloat(parseCsvToJsonParse[key].Comm);
                        temp[i].sec = parseFloat(parseCsvToJsonParse[key].SEC);
                        temp[i].taf = parseFloat(parseCsvToJsonParse[key].TAF);
                        temp[i].nscc = parseFloat(parseCsvToJsonParse[key].NSCC);
                        temp[i].nasdaq = parseFloat(parseCsvToJsonParse[key].Nasdaq);
                        temp[i].ecnRemove = parseFloat(parseCsvToJsonParse[key]['ECN Remove']);
                        temp[i].ecnAdd = parseFloat(parseCsvToJsonParse[key]['ECN Add']);
                        temp[i].grossProceeds = parseFloat(parseCsvToJsonParse[key]['Gross Proceeds']);
                        temp[i].netProceeds = parseFloat(parseCsvToJsonParse[key]['Net Proceeds']);
                        temp[i].clrBroker = parseCsvToJsonParse[key]['Clr Broker'];
                        temp[i].liq = parseCsvToJsonParse[key].Liq;
                        temp[i].note = parseCsvToJsonParse[key].Note;
                        temp[i].trade = null;

                        tempExecutions.push(temp[i]);
                    }
                    //console.log("tempExecutions " + JSON.stringify(tempExecutions))
                    console.log(" -> Imported successfully csv");


                    /* ==============================================
                
                    2 : CREATING EXECUTIONS

                    ================================================= */

                    console.log("\nCREATING EXECUTIONS")
                    this.loadingSpinnerText = "Creating executions ..."
                    var a = _
                        .chain(tempExecutions)
                        .orderBy(["execTime"], ["asc"])
                        .groupBy("td");

                    this.executions = JSON.parse(JSON.stringify(a))
                        //console.log("length "+Object.keys(this.executions).length)
                        //check if object already exists



                    //console.log('executions ' + JSON.stringify(this.executions))
                    console.log(" -> Created executions table successfully");

                    /* ============================================== 
                
                    3 : CREATING TRADES
                
                    ================================================= */
                    console.log("\nCREATING TRADES")
                    this.loadingSpinnerText = "Creating trades ..."
                    var b = _
                        .chain(tempExecutions)
                        .orderBy(["execTime"], ["asc"])
                        .groupBy("symbol");

                    objectB = JSON.parse(JSON.stringify(b))
                        //console.log("object b "+JSON.stringify(objectB))

                    // We iterate through each symbol (key2)
                    const keys2 = Object.keys(objectB);
                    //console.log("keys 2 (symbols) " + JSON.stringify(keys2));
                    tempPrice = null
                    var temp2 = []

                    var temp9 = {}

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

                        for (const tempExec of tempExecs) {
                            //console.log("tempExec " + JSON.stringify(tempExec));
                            //console.log("doing key "+key2)
                            if (newTrade == true) { //= new trade
                                console.log(" -> New trade for symbol " + tempExec.symbol)
                                newTrade = false
                                var invertedLong = false
                                var invertedShort = false

                                /*******************
                                 * Info 
                                 *******************/
                                temp7 = {};
                                temp7.id = tempExec.side == "B" || tempExec.side == "S" ? "t" + tempExec.execTime + "_" + tempExec.symbol + "_B" : "t" + tempExec.execTime + "_" + tempExec.symbol + "_SS"
                                console.log("   -> ID " + temp7.id)
                                temp7.account = tempExec.account;
                                temp7.td = tempExec.td;
                                temp7.currency = tempExec.currency;
                                temp7.type = tempExec.type;
                                temp7.side = tempExec.side;
                                if (tempExec.side == "B") {
                                    temp7.strategy = "long"
                                    console.log("   -> Symbol " + key2 + " is bought and long")
                                    temp7.buyQuantity = tempExec.quantity;
                                    temp7.sellQuantity = 0
                                }
                                if (tempExec.side == "S") { //occasionnaly, Tradezero inverts trades and starts by accounting the sell even though it's a long possition
                                    temp7.strategy = "long"
                                        //console.log("Symbol " + key2 + " is sold and long")
                                    console.log("   -> Symbol " + key2 + " is accounted as sell before buy on date " + this.dateFormat(tempExec.td) + " at " + this.timeFormat(tempExec.execTime))
                                    invertedLong = true
                                    temp7.buyQuantity = 0
                                    temp7.sellQuantity = tempExec.quantity;
                                }
                                if (tempExec.side == "SS") {
                                    temp7.strategy = "short"
                                    console.log("   -> Symbol " + key2 + " is sold and short")
                                    temp7.buyQuantity = 0
                                    temp7.sellQuantity = tempExec.quantity;
                                }
                                if (tempExec.side == "BC") { //occasionnaly, Tradezero invertes trades
                                    temp7.strategy = "short"
                                    console.log("   ->Symbol " + key2 + " is accounted as buy cover before short sell on date " + this.dateFormat(tempExec.td) + " at " + this.timeFormat(tempExec.execTime))
                                    invertedShort = true
                                    temp7.buyQuantity = tempExec.quantity;
                                    temp7.sellQuantity = 0
                                }
                                temp7.symbol = tempExec.symbol;
                                temp7.entryTime = tempExec.execTime;
                                temp7.exitTime = 0
                                temp7.entryPrice = tempExec.price;
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
                                temp7.setup = null
                                temp7.entryPoint = null
                                temp7.mistake = null
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

                                /*******************
                                 * Financials
                                 *******************/

                                if (this.includeFinviz == false) {
                                    temp7.financials = {}
                                } else {
                                    await new Promise((resolve, reject) => {
                                        var urlBase = this.apiBaseUrl

                                        var url = urlBase + "" +this.apiEndPointFinviz
                                        axios
                                            .post(url, {
                                                symbol: tempExec.symbol,
                                            })
                                            .then(response => {
                                                //console.log(" -> " + JSON.stringify(response.data))
                                                //Parse does not permit to upload key containing a "." so we change key name
                                                response.data["Oper Margin"] = response.data["Oper. Margin"];
                                                delete response.data["Oper. Margin"];

                                                temp7.financials = response.data
                                                resolve()
                                            }).catch(e => {
                                                console.log(" -> Error crawling Finviz " + e)
                                                this.loadingSpinner = false
                                                resolve()
                                            })
                                    })
                                }

                            } else if (newTrade == false) { //= concatenating trade
                                //console.log(" -> Concatenating trade for symbole "+tempExec.symbol+" and strategy "+temp7.strategy)
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
                                    //console.log(" -> Closing position")
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
                                        //console.log("temp 7 "+JSON.stringify(temp7))
                                        //console.log("temp not null for "+key2)


                                    temp2.push(temp7)
                                    newTrade = true
                                        //console.log("temp2 is " + JSON.stringify(temp2))
                                        //console.log(" -> trade concat finished")
                                        //console.log(tradesCount+" trades for symbol "+key2)
                                }
                            } else {
                                console.log("nothing for key " + key2)
                            }
                        }

                    }

                    //console.log("temp2 "+JSON.stringify(temp2))
                    var c = _
                        .chain(temp2)
                        .orderBy(["entryTime"], ["asc"])
                        .groupBy("td");
                    //console.log(" -> Trades " + JSON.stringify(c))
                    this.trades = JSON.parse(JSON.stringify(c))
                    //console.log("Trades C " + JSON.stringify(this.trades))

                    /* ==============================================
                
                    4 : FILTER OUT EXISTING

                    ================================================= */

                    // We can only filter at this point because trades depend on executions. So, once trades are created, we can filter out existing trades
                    this.executions = _.omit(this.executions, this.existingTradesArray)
                    this.trades = _.omit(this.trades, this.existingTradesArray)

                    /* ==============================================
                
                    5 : CREATING BLOTTER

                    ================================================= */

                    console.log("\nCREATING BLOTTER BY SYMBOL")
                    this.loadingSpinnerText = "Creating blotter by symbol ..."
                        //based on trades
                    objectZ = this.trades
                    const keys9 = Object.keys(objectZ);
                    var temp10 = {}
                    for (const key9 of keys9) {
                        temp10[key9] = {}
                        var tempExecs = objectZ[key9]
                            //console.log("tempExecs9 " + JSON.stringify(tempExecs));
                        var z = _
                            .chain(tempExecs)
                            .orderBy(["startTime"], ["asc"])
                            .groupBy("symbol");
                        objectY = JSON.parse(JSON.stringify(z))
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

                            /*******************
                             * Financials
                             *******************/
                            temp10[key9][key10].financials = tempExecs[0].financials

                        }

                    }
                    //console.log(" -> BLOTTER " + JSON.stringify(temp10))
                    this.blotter = temp10

                    /* ==============================================
                
                    6 : CREATING P&L

                    ================================================= */

                    console.log("\nCREATING P&L")
                    this.loadingSpinnerText = "Creating P&L ..."
                        //based on blotter
                    objectQ = this.blotter
                    const keys7 = Object.keys(objectQ);


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
                    this.loadingSpinner = false
                })()
            })
        },
        getExistingTradesArray: async function() {

            const Object = Parse.Object.extend("trades");
            const query = new Parse.Query(Object);
            query.equalTo("user", Parse.User.current());
            query.limit(1000000); // limit to at most 1M results
            const results = await query.find();
            for (let i = 0; i < results.length; i++) {
                const object = results[i];
                //console.log("unix time "+ object.get('dateUnix'));
                this.existingTradesArray.push(object.get('dateUnix'))
            }
        },


        /* ---- 2: UPLOAD VIDEO FROM INPUT ---- */
        videoInput(event, param) { //param is td/trad unix data
            //console.log('video input with param ' + param)
            //this.loadingSpinner = true
            this.loadingSpinnerText = "Extracting video ..."
            var videoId = "videoInput" + param
            const file = event.target.files[0];

            if (!event.target.files.length) {
                this.loadingSpinner = false
                return;
            }

            if (file.type != "video/mp4") {
                alert("Please upload a mp4 video type file")
                document.getElementById(videoId).value = null;
                this.loadingSpinner = false
                return
            }


            this.videos[param] = {}
            this.videos[param].video = file
            this.videos[param].videoUrl = URL.createObjectURL(file)
            this.inputToShow.push(param)

            //Prepare file name for upload
            var fullFileName = file.name
            var fileName = fullFileName.substring(0, fullFileName.lastIndexOf('.'))
                //console.log("file name " + fileName)

            this.videos[param].fileType = file.type
            this.videos[param].fileExtension = fullFileName.slice((fullFileName.lastIndexOf(".") - 1 >>> 0) + 2)

            var fileDate = fileName.split("-")[0].split("_")
            var fileYear = fileDate[0]
            var fileMonth = fileDate[1]
            var fileDay = fileDate[2]
                //console.log("year "+fileYear + " month "+fileMonth+" day "+fileDay)
            var fileTime = fileName.split("-")[1]
            var fileHour = fileTime.substring(0, 2)
            var fileMinutes = fileTime.substring(2, 4)
            var fileSeconds = fileTime.substring(4, 6)
            console.log("hour " + fileHour + " minutes " + fileMinutes + " seconds " + fileSeconds)
            if (dayjs(fileDate + " " + fileHour + ":" + fileMinutes + ":" + fileSeconds, "YYYY_MM_DD HH:mm:ss").isValid()) {
                console.log(" -> Date is valid")
                var fileDateFormat = dayjs(fileDate + " " + fileHour + ":" + fileMinutes + ":" + fileSeconds, "YYYY_MM_DD HH:mm:ss").format("YYYY-MM-DDTHH:mm:ss")
                this.videos[param].startTime = fileDateFormat
                var fileDateUnix = dayjs(fileDate + " " + fileHour + ":" + fileMinutes + ":" + fileSeconds, "YYYY_MM_DD HH:mm:ss").unix()
                    //console.log("day js "+dayjs(fileDate + " " + fileHour + ":" + fileMinutes + ":" + fileSeconds, "YYYY_MM_DD HH:mm:ss")+" and unix "+fileDateUnix)
                this.videos[param].startTimeUnix = fileDateUnix
                this.videos[param].name = fullFileName
                    //console.log("start time " + this.videos[param].startTime + ' and unix ' + this.videos[param].startTimeUnix)
            }


        },

        /* ---- 2: CREATE POSTER FROM CANVAS ----
        getPoster(param) {
            setTimeout(() => {
                var canvas = document.getElementById("videoPreviewCanvas" + param);
                var video = document.getElementById("videoPreview" + param);
                //console.log("ready state " + video.readyState)
                //console.log("Buffered " + video.load)
                canvas.width = video.videoWidth;

                canvas.height = video.videoHeight;

                canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

                this.videos[param].videoPosterUrl = canvas.toDataURL()
                    //console.log("videos " + JSON.stringify(this.videos))

                this.loadingSpinner = false

            }, 1000)
        },*/

        /* ---- 3: CREATE TIME AND NAME (param1 is input date and time, param2 is td/trade unix date)---- */
        videoStartTime(param1, param2) {
            var startTime = param1
            var startTimeUnix = dayjs(param1, "YYYY-MM-DD HH:mm:ss").unix()
            this.videos[param2].startTime = startTime
            this.videos[param2].startTimeUnix = startTimeUnix
            var fileDate = dayjs(param1).format('YYYY_MM_DD')
            var fileHour = dayjs(param1).format('HH')
            var fileMinutes = dayjs(param1).format('mm')
            var fileSeconds = dayjs(param1).format('ss')
            var fileName = fileDate + "-" + fileHour + "" + fileMinutes + "" + fileSeconds
            this.videos[param2].name = fileName + "." + this.videos[param2].fileExtension
            console.log("videos is " + JSON.stringify(this.videos))

            /*Update trades json with video start and video end unix times
            var i = 0
            this.trades[param2].forEach(element => {
                    if (element.entryTime >= startTimeUnix) {
                        this.trades[param2][i].videoStart = element.entryTime - startTimeUnix
                    } else {
                        this.trades[param2][i].videoStart = null
                    }

                    if (element.exitTime >= startTimeUnix) {
                        this.trades[param2][i].videoEnd = element.exitTime - startTimeUnix
                    } else {
                        this.trades[param2][i].videoEnd = null
                    }
                    i++
                })*/
            //console.log("trades "+JSON.stringify(this.trades))
        },

        /* ---- 4: UPLOAD TO PARSE TRADES  ---- */
        uploadTrades() {
            console.log("\nUPLOADING TRADES")
            this.loadingSpinner = true
            this.loadingSpinnerText = "Uploading and storing trades(s) ..."

            const keys = Object.keys(this.executions)

            uploadToBucket = (param, param2) => {
                var urlBase = this.apiBaseUrl
                var url = urlBase + this.apiEndPointTempUrl
                axios
                    .post(url, {
                        source: param2,
                        user: Parse.User.current().id,
                        fileName: this.videos[param].name,
                        fileType: this.videos[param].fileType
                    })
                    .then(response => {
                        console.log(" -> Retrieved temp " + param2 + " URL for key " + param)
                        const config = {
                                headers: {
                                    'Content-Type': this.videos[param].fileType
                                },
                                onUploadProgress: (event) => {
                                    var uploadPercentCompleted = Math.round((event.loaded * 100) / event.total)
                                    this.loadingSpinnerText = "Saving video from " + dayjs.unix(param).format("DD MMMM YYYY") + " to database (" + uploadPercentCompleted + "%)..."
                                }
                            }
                            //console.log("upload progress "+this.uploadPercentCompleted)
                        var preSignedUrl = response.data
                        console.log(" -> Presigned url " + preSignedUrl)
                        axios
                            .put(preSignedUrl, this.videos[param].video, config)
                            .then(response => {
                                //console.log(" -> " + param2 + " upload status " + JSON.stringify(response))
                                /*if (param2 == "s3") {
                                    var publicBaseUrl = this.publicBaseUrlS3
                                }*/
                                if (param2 == "b2") {
                                    var publicBaseUrl = this.publicBaseUrlB2
                                }
                                var publicUrl = publicBaseUrl + "" + Parse.User.current().id + "/videos/" + this.videos[param].name
                                console.log(" -> Public url " + publicUrl)
                                this.loadingSpinnerText = "Video from " + dayjs.unix(param).format("DD MMMM YYYY") + " saved. Now uploading rest of data to database ..."
                                if (param2 == "b2") {
                                    uploadToParse(param, publicUrl)
                                }

                            }).catch(e => {
                                console.log(" -> Error uploading video to " + param2 + " " + e)
                                this.loadingSpinner = false
                            })
                    })
                    .catch(e => {
                        console.log(" -> Error getting temp URL " + e)
                        this.loadingSpinner = false
                    })
            }


            uploadToParse = async(param, param2) => {
                console.log("in upload to parse param is " + param + " and param 2 " + param2)
                this.loadingSpinnerText = "Uploading data from " + dayjs.unix(param).format("DD MMMM YYYY") + "  to database ..."
                const Object = Parse.Object.extend("trades");
                const object = new Object();

                if (param2 != undefined) {
                    object.set("video", param2)
                    object.set("videoName", this.videos[param].name)
                    object.set("videoDate", new Date(this.videos[param].startTime))
                    object.set("videoDateUnix", this.videos[param].startTimeUnix)
                }

                object.set("user", Parse.User.current())
                object.set("date", new Date(dayjs.unix(param).format("YYYY-MM-DD")))
                object.set("dateUnix", Number(param))
                object.set("executions", this.executions[param])
                object.set("trades", this.trades[param])
                object.set("blotter", this.blotter[param])
                object.set("pAndL", this.pAndL[param])

                object.setACL(new Parse.ACL(Parse.User.current()));

                object.save()
                    .then((object) => {

                        // Execute any logic that should take place after the object is saved.
                        console.log(" -> Added new trades with id " + object.id)
                        if (param2 != undefined) {
                            this.loadingSpinnerText = "Uploading video " + this.videos[param].name + "  to database ..."
                            const Object = Parse.Object.extend("videos");
                            const object = new Object();

                            object.set("user", Parse.User.current())
                            object.setACL(new Parse.ACL(Parse.User.current()));
                            object.set("video", param2)
                            object.set("videoName", this.videos[param].name)
                            object.set("videoDate", new Date(this.videos[param].startTime))
                            object.set("videoDateUnix", this.videos[param].startTimeUnix)
                            object.set("tradeDateUnix", Number(param))
                            object.save()
                                .then((object) => {
                                    console.log(" -> Added new video with id " + object.id)
                                }, (error) => {
                                    // Execute any logic that should take place if the save fails.
                                    // error is a Parse.Error with an error code and message.
                                    console.log('Failed to create new video object, with error code: ' + error.message);
                                    this.loadingSpinner = false
                                });
                        }
                        i++
                        if (i == numberOfDates) {
                            //Refreshing all Trades
                            this.refreshTrades()
                        }

                    }, (error) => {
                        // Execute any logic that should take place if the save fails.
                        // error is a Parse.Error with an error code and message.
                        console.log('Failed to create new trade, with error code: ' + error.message);
                        this.loadingSpinner = false
                    });
                /* for error handling
                if (response.data.length > 0) {
                    console.log(" -> Uploaded video with errors")
                } else {
                }*/
            }

            let numberOfDates = Object.keys(this.executions).length
            console.log("num of dates " + numberOfDates)
            var i = 0
            for (const key of keys) {
                if (key in this.videos) {
                    this.saveVideoToIndexedDb(key)
                        //uploadToAws(key)
                        //uploadToBucket(key, "s3")
                    uploadToBucket(key, "b2")
                } else {
                    uploadToParse(key)
                }
            } //end for key
        },
        /* ---- 5: SAVING TO INDEXEDDB  ---- */
        saveVideoToIndexedDb(param) {
            console.log(" -> Saving video with key " + param + " to IndexedDB");

            // Open a transaction to the database
            let transaction = this.indexedDB.transaction(["videos"], "readwrite");

            let data = {
                id: this.videos[param].name,
                url: this.videos[param].video,
                created: new Date()
            };

            var objectToAdd = transaction.objectStore("videos").put(data)

            objectToAdd.onsuccess = (event) => {
                this.loadingSpinnerText = "Video from " + dayjs.unix(param).format('DD MMMM YYYY') + " stored. Uploading rest of data..."
            }
            objectToAdd.onserror = (event) => {
                this.loadingSpinnerText = "There was an error storing video from " + dayjs.unix(param).format('DD MMMM YYYY') + ": " + event
            }



            //Retrieve the file that was just stored
            /*transaction.objectStore("videoUrl").get(10).onsuccess = (event) => {
                var videoFile = event.target.result;
                console.log("Got Video URL " + JSON.stringify(videoFile));
                console.log("url to create " + URL.createObjectURL(videoFile.url))
                this.videoUrlStorage = URL.createObjectURL(videoFile.url)

            };*/

        },

        refreshTrades: async function() {
            console.log("refreshing")
            await this.getTradesFromDb()
            console.log("done")
            this.loadingSpinner = false
                //window.location.href = "/dashboard"
                //setTimeout(() => { window.location.href = "/dashboard" }, 5000)
        }
    } //End methods
};