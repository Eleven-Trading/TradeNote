const dailyMixin = {
    data() {
        return {

            //SETUPS
            spinnerSetups: false,
            spinnerSetupsText: null,
            spinnerSetupsUpdate: false,
            spinnerSetupsUpdateText: null,
            patterns: [],
            mistakes: [],
            tradeSetup: {
                pattern: null,
                mistake: null,
                note: null,
            },
            tradeSetupChanged: false,
            indexedDBtoUpdate: false,
            tradeSetupDateUnix: null,
            tradeSetupId: null
        }
    },
    watch: {
        tradeSetup: function() {
            //console.log("Watch tradeSetup " + JSON.stringify(this.tradeSetup))
        },
    },
    methods: {
        getPatterns: async function() {
            return new Promise(async(resolve, reject) => {
                console.log(" -> Getting Patterns");
                const Object = Parse.Object.extend("patterns");
                const query = new Parse.Query(Object);
                query.equalTo("user", Parse.User.current());
                query.ascending("order");
                //query.lessThanOrEqualTo("dateUnix", this.selectedDateRange.end)
                query.limit(1000000); // limit to at most 10 results
                this.patterns = []
                const results = await query.find();
                this.patterns = JSON.parse(JSON.stringify(results))
                    //console.log(" -> Patterns " + JSON.stringify(this.patterns))
                resolve()
            })
        },
        getMistakes: async function() {
            return new Promise(async(resolve, reject) => {
                console.log(" -> Getting Mistakes");
                const Object = Parse.Object.extend("mistakes");
                const query = new Parse.Query(Object);
                query.equalTo("user", Parse.User.current());
                query.ascending("order");
                //query.lessThanOrEqualTo("dateUnix", this.selectedDateRange.end)
                query.limit(1000000); // limit to at most 10 results
                this.mistakes = []
                const results = await query.find();
                this.mistakes = JSON.parse(JSON.stringify(results))
                    //console.log(" -> Setups " + JSON.stringify(this.patterns))
                resolve()
            })
        },

        tradeSetupChange(param1, param2, param3, param4) {
            //console.log("param 1 " + param1 + " param2 " + param2)
            if (param2 == "pattern") {
                this.tradeSetup.pattern = param1
            }
            if (param2 == "mistake") {
                this.tradeSetup.mistake = param1
            }
            if (param2 == "note") {
                this.tradeSetup.note = param1
            }
            this.tradeSetupDateUnix = param3
            this.tradeSetupId = param4
                //console.log("tradesetup in change " + JSON.stringify(this.tradeSetup))
            this.tradeSetupChanged = true
            this.indexedDBtoUpdate = true

        },

        addVideoStartEnd: async function() {
            return new Promise((resolve, reject) => {
                this.filteredTrades.forEach((el, idx) => {
                    if (el.video) {
                        el.trades.forEach((element, index) => {
                            if (element.entryTime >= el.videoDateUnix) {
                                element.videoStart = element.entryTime - el.videoDateUnix
                            } else {
                                element.videoStart = null
                            }

                            if (element.exitTime >= el.videoDateUnix) {
                                element.videoEnd = element.exitTime - el.videoDateUnix
                            } else {
                                element.videoEnd = null
                            }
                        })
                    }
                })
                resolve()
            })
        },

        viewModalVideosDaily: async function(param1, param2, param3) { //When we click on the video icon to view a video. Param1 : is video true/false, Param2: index of array; Param3: daily
            //console.log("param 1: " + param1 + " param2 " + param2 + " param3 " + param3 + " param 4 " + param4 + " param 5 " + param5)
            if (!param3 && this.tradeSetupChanged) {
                await this.updatePatternsMistakes()
                await this.updateTrades()
            }
            this.tradeSetupChanged = false
            await (this.hasVideo = false)
            await (this.resetSetup())
            this.modalVideosOpen = false
            this.modalVideosOpen = true
            this.videosArrayIndex = param2 //VideoToLoad = the full video to get/load. videosArrayIndex = part, determined by start and end time, of the video (to load)

            if (param1 == true) {
                this.hasVideo = true
            }

            if (param3) {
                this.daily = param3
                if (param3.video) {
                    await this.getVideo(param3.dateUnix, param2)
                }
            }
            //console.log("Has video ? "+this.hasVideo)

            //console.log("video array "+this.videosArrayIndex)
            //console.log("param3 trades "+JSON.stringify(param3))
            //console.log("daily trades " + JSON.stringify(this.daily.trades[param2]))
            /*console.log("daily trades " + JSON.stringify(this.daily.trades[param2]))
            if (Object.keys(this.daily.trades[param2].setup).length != 0) {
                console.log(" -> Trade with ID " + this.daily.trades[param2].id + " has setup in DB. Let's get tradeSetup names")
                this.tradeId = this.daily.trades[param2].id
                this.tradeSetup = this.daily.trades[param2].setup
                    //await this.getTradeSetupNames(this.daily.trades[param2].setup)
            } else {
                console.log(" -> Trade has No setup in DB")
                this.tradeId = null
            }*/

            const Object = Parse.Object.extend("patternsMistakes");
            const query = new Parse.Query(Object);
            query.equalTo("tradeId", this.daily.trades[param2].id)
            const results = await query.first();
            if (results) {
                let resultsParse = JSON.parse(JSON.stringify(results))
                    //console.log(" results "+JSON.stringify(resultsParse))
                    //console.log("mistake " + resultsParse.mistake + " note " + resultsParse.note)
                resultsParse.pattern != null ? this.tradeSetup.pattern = resultsParse.pattern.objectId : null
                resultsParse.mistake != null ? this.tradeSetup.mistake = resultsParse.mistake.objectId : null
                resultsParse.note != null || resultsParse.note != 'null' ? this.tradeSetup.note = resultsParse.note : null
            }
        },

        getVideo: async function(param1, param2) {
            return new Promise((resolve, reject) => {
                console.log("\nGETTTING VIDEO URL FROM LOCAL OR REMOTE DB")
                    //console.log("Video to load (dateUnix) " + param1 + " and index of the video " + param2)
                    //this.loadingSpinner = true
                this.showDashboard = false
                var x = document.getElementById(param1);
                this.videoToLoad = param1 //Video that has been clicked on
                this.videoIndex = param2 //Index from the list of videos on the videos page
                let transaction = this.indexedDB.transaction(["videos"], "readwrite");
                //this.loadingSpinnerText = "Getting videos ..."

                var filterTradeByVideo = []
                this.tradeToShow = []
                    /* ---- 1: GET THE INFOS OF THE SELECTED VIDEO (TO LOAD) AND SAVE TO SPECIFIC VAR ---- */
                filterTradeByVideo = this.filteredTrades.filter(f => f.dateUnix == this.videoToLoad)

                /* ---- 2: UPDATE TRADES TO SHOW WITH VIDEO START AND END TIME ----
                this.tradeToShow = filterTradeByVideo
                this.tradeToShow[0].trades.forEach((element, index) => {
                        if (element.entryTime >= this.tradeToShow[0].videoDateUnix) {
                            this.tradeToShow[0].trades[index].videoStart = element.entryTime - this.tradeToShow[0].videoDateUnix
                        } else {
                            this.tradeToShow[0].trades[index].videoStart = null
                        }

                        if (element.exitTime >= this.tradeToShow[0].videoDateUnix) {
                            this.tradeToShow[0].trades[index].videoEnd = element.exitTime - this.tradeToShow[0].videoDateUnix
                        } else {
                            this.tradeToShow[0].trades[index].videoEnd = null
                        }
                    })
                    //console.log("trades "+JSON.stringify(this.tradeToShow))


                /* ---- 3: GET VIDEO URL FROM INDEXEDDB OR DB ---- */
                var videoURL = filterTradeByVideo[0].video
                this.videoName = filterTradeByVideo[0].videoName
                    //console.log("video "+videoURL)

                //Check if video (name/id) exists in IndexedDB
                var objectToGet = transaction.objectStore("videos").get(this.videoName)
                objectToGet.onsuccess = async(event) => {
                    if (event.target.result != undefined) {
                        console.log(" -> Video exists in IndexedDB. Retreiving video")

                        this.showMoreVideos = true
                        var videoFile = event.target.result;
                        //console.log("Got Video URL " + JSON.stringify(videoFile));
                        //console.log("url to create " + URL.createObjectURL(videoFile.url))
                        this.videoBlob = URL.createObjectURL(videoFile.url)
                            //console.log("blob " + this.videoBlob)
                            //this.loadingSpinner = false
                    } else {
                        console.log(" -> Video does not exist in IndexedDB. Storing it")
                        this.spinnerSetupsUpdate = true
                        this.spinnerSetupsUpdateText = "First time getting this video, please wait ...";

                        (async() => {
                            //console.log("Creating video file")
                            let response = await fetch(videoURL);
                            let data = await response.blob();
                            let metadata = {
                                type: 'video/mp4',
                                lastModified: new Date().getTime()
                            };

                            this.videoFile = new File([data], this.videoName, metadata);
                            //console.log("Got Video URL " + this.videoFile);
                            //console.log("url to create " + URL.createObjectURL(this.videoFile))
                            this.videoBlob = await URL.createObjectURL(this.videoFile)
                                //console.log("video file "+this.videoFile+ " and blob "+this.videoBlob)

                            this.showMoreVideos = true
                                //this.loadingSpinner = false
                            this.spinnerSetupsUpdate = false
                            console.log("spinner setup update " + this.spinnerSetupsUpdate)
                                // Open a transaction to the database

                            let transaction = this.indexedDB.transaction(["videos"], "readwrite");

                            let videoData = {
                                id: this.videoName,
                                url: this.videoFile,
                                created: new Date()
                            };

                            var objectToAdd = transaction.objectStore("videos").put(videoData)

                            objectToAdd.onsuccess = (event) => {
                                console.log(" -> Stored video in IndexedDB")
                                console.log("spinner setup update " + this.spinnerSetupsUpdate)
                            }
                            objectToAdd.onserror = (event) => {
                                alert(" -> Error storing video in IndexedDB with message " + event)
                            }
                        })()
                    }

                }

                objectToGet.onerror = (event) => {
                    console.log("there was an error getting video from indexedDB")
                        //this.loadingSpinner = false
                    this.showDashboard = true
                }
                resolve()
            })

        },



        dailyModal: async function() {
            let myModalEl = document.getElementById('videoModal')
            myModalEl.addEventListener('hide.bs.modal', async(event) => {
                console.log("daily hidden")

                if (this.indexedDBtoUpdate) {
                    if (this.tradeSetupChanged) {
                        await this.updatePatternsMistakes()
                        await this.updateTrades()
                    }
                    await this.updateIndexedDB()

                }
                this.indexedDBtoUpdate = false
            }, {once: true})//it was firing multiple times here... don't know why
        },

        resetSetup() {
            console.log(" -> Resetting setup")
                //we need to reset the setup variable each time
            this.tradeSetup = {
                pattern: null,
                mistake: null,
                note: null,
            }
        },


        updatePatternsMistakes: async function(param1, param2, param3, param4) { //param1 : trade unixDate ; param2 : trade id inside trade array (gotten from daily.trades[videosArrayIndex].id and then later as this.tradeId), param3: value; param4: pattern or mistake
            console.log("\nUPDATING OR SAVING SETUPS IN PARSE")
            return new Promise(async(resolve, reject) => {

                if (this.tradeSetup.pattern != null || this.tradeSetup.mistake != null || this.tradeSetup.note != null) {
                    //console.log("trade setup " + JSON.stringify(this.tradeSetup) + " with ID " + param2)
                    this.spinnerSetups = true
                        //this.tradeSetupChanged = true
                    const Object = Parse.Object.extend("patternsMistakes");
                    const query = new Parse.Query(Object);
                    query.equalTo("tradeId", this.tradeSetupId)
                    const results = await query.first();
                    if (results) {
                        console.log(" -> Updating patterns mistakes")
                        this.spinnerSetupsText = "Updating"
                        results.set("pattern", this.tradeSetup.pattern == null ? null : { __type: "Pointer", className: "patterns", objectId: this.tradeSetup.pattern })
                        results.set("mistake", this.tradeSetup.mistake == null ? null : { __type: "Pointer", className: "mistakes", objectId: this.tradeSetup.mistake })
                        results.set("note", this.tradeSetup.note)

                        results.save()
                            .then(async() => {
                                console.log(' -> Updated setup with id ' + results.id)
                                    //this.spinnerSetupsText = "Updated setup"
                            }, (error) => {
                                console.log('Failed to create new object, with error code: ' + error.message);
                            })
                    } else {
                        console.log(" -> Saving patterns mistakes")
                        this.spinnerSetupsText = "Saving"

                        const object = new Object();
                        object.set("user", Parse.User.current())
                        object.set("pattern", { __type: "Pointer", className: "patterns", objectId: this.tradeSetup.pattern })
                        if (this.tradeSetup.mistake != null) {
                            object.set("mistake", { __type: "Pointer", className: "mistakes", objectId: this.tradeSetup.mistake })
                        } else {
                            object.set("mistake", null)
                        }
                        if (this.tradeSetup.note != null) {
                            object.set("note", this.tradeSetup.note)
                        } else {
                            object.set("note", null)
                        }

                        object.set("tradeUnixDate", this.tradeSetupDateUnix)
                        object.set("tradeId", this.tradeSetupId)
                        object.setACL(new Parse.ACL(Parse.User.current()));
                        object.save()
                            .then(async(object) => {
                                console.log(' -> Added new setup with id ' + object.id)
                                    //this.spinnerSetupsText = "Added new setup"
                                this.tradeId = this.tradeSetupId // we need to do this if I want to manipulate the current modal straight away, like for example delete after saving. WHen You push next or back, tradeId is set back to null
                            }, (error) => {
                                console.log('Failed to create new object, with error code: ' + error.message);
                            })
                    }
                    
                }
                resolve()
                

            })
        },

        deletePatternMistake: async function(param1, param2) {
            console.log("\nDELETING PATTERN MISTAKE")
            this.tradeSetupDateUnix = param1
            this.tradeSetupId = param2
            this.spinnerSetups = true
            this.tradeSetupChanged = true
            this.indexedDBtoUpdate = true
            console.log("trade setup " + JSON.stringify(this.tradeSetup) + " with ID " + this.tradeSetupId)

            if (this.tradeSetupId != null) {
                console.log(" -> Deleting patterns mistakes")
                const Object = Parse.Object.extend("patternsMistakes");
                const query = new Parse.Query(Object);
                query.equalTo("tradeId", this.tradeSetupId)
                const results = await query.first();
                if (results) {
                    results.destroy().then(() => {
                        console.log(' -> Deleted setup with id ' + results.id)
                        this.resetSetup()
                    }, (error) => {
                        console.log('Failed to delete setup, with error code: ' + error.message);
                    });
                } else {
                    console.log(" -> Problem : the tradeId has setup but it is not present in paternsMistakes")
                }
                this.updateTrades(true)
            } else {
                alert("There is no existing setup")
                return
            }
            this.spinnerSetups = false
        },

        updateTrades: async function(param3) {
            //console.log(" param1 " + param1 + " param2 " + param2 + " param3 " + param3)
            //this.spinnerSetupsText = "Updating trades"
            //query trade to update
            //console.log("date unix "+param1+" is type "+typeof(this.videoToLoad)+" and trade id "+param)
            return new Promise(async(resolve, reject) => {
                const Object = Parse.Object.extend("trades");
                const query = new Parse.Query(Object);
                query.equalTo("dateUnix", this.tradeSetupDateUnix)
                const results = await query.first();
                if (results) {
                    //console.log("result from query " + JSON.stringify(results))
                    var objectResults = JSON.parse(JSON.stringify(results))
                    var arrayTrades = objectResults.trades
                    var tradeIndex = arrayTrades.findIndex(f => f.id == this.tradeSetupId)
                    console.log(" -> Updating trade with id " + this.tradeSetupId)
                    if (param3 == true) { //Delete == true
                        arrayTrades[tradeIndex].setup = {}
                    } else {
                        arrayTrades[tradeIndex].setup = {
                            pattern: this.tradeSetup.pattern,
                            mistake: this.tradeSetup.mistake,
                            note: this.tradeSetup.note
                        }
                    }
                    //console.log("result after " + JSON.stringify(arrayTrades)+" type "+typeof(arrayTrades))
                    results.set("trades", arrayTrades)
                    results.save().then(async() => {
                        console.log(' -> Updated trades with id ' + results.id)
                            //await (this.spinnerSetupsText = "Updated trade")
                        this.spinnerSetups = false
                        resolve()

                    })
                } else {
                    alert("Update query did not return any results")
                    this.spinnerSetups = false
                    resolve()
                }
                
            })
        },

        updateIndexedDB: async function(param1) {
            console.log("\nUPDATING INDEXEDDB")
            return new Promise(async(resolve, reject) => {
                await (this.spinnerSetupsUpdate = true)
                await (this.spinnerSetupsUpdateText = "Updating trades in IndexedDB")
                //console.log("this.threeMonthsBack "+this.threeMonthsBack+" ; this.selectedCalRange.start "+this.selectedCalRange.start)
                if (this.threeMonthsBack <= this.selectedCalRange.start) {
                    console.log("3 months")
                    await this.getTradesFromDb(6)
                } else {
                    console.log(">6 months")
                    await this.getTradesFromDb(0)
                }
                await (this.spinnerSetupsUpdateText = "Getting all trades")
                await this.getAllTrades(true)
                    //Once we get all trades, we need to update the filtered trades so it reflects on the page we are looking at
                    /*await (() => {
                        this.spinnerSetupsText = "Updating filtered trade"
                        var filterTrades = []
                        this.tradeToShow = []

                        // ---- 1: GET THE INFOS OF THE SELECTED VIDEO (TO LOAD) AND SAVE TO SPECIFIC VAR ----
                        var filterTrades = this.filteredTrades.filter(f => f.dateUnix == param1)
                        this.tradeToShow = filterTrades
                            //console.log("tradeToShow " + JSON.stringify(this.tradeToShow) + " and month " + typeof this.curMonthTrades)

                        // ---- 2: UPDATE TRADES TO SHOW WITH VIDEO START AND END TIME ----
                        this.tradeToShow[0].trades.forEach((element, index) => {
                            if (element.entryTime >= this.tradeToShow[0].videoDateUnix) {
                                this.tradeToShow[0].trades[index].videoStart = element.entryTime - this.tradeToShow[0].videoDateUnix
                            } else {
                                this.tradeToShow[0].trades[index].videoStart = null
                            }

                            if (element.exitTime >= this.tradeToShow[0].videoDateUnix) {
                                this.tradeToShow[0].trades[index].videoEnd = element.exitTime - this.tradeToShow[0].videoDateUnix
                            } else {
                                this.tradeToShow[0].trades[index].videoEnd = null
                            }
                        })
                        console.log(" -> Updated filtered trade")
                    })()*/
                await (this.spinnerSetupsUpdate = false)
                resolve()
            })
        }


    }
}