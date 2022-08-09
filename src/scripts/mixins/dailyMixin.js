const dailyMixin = {
    data() {
        return {

            //SETUPS
            spinnerSetups: false,
            spinnerSetupsText: null,
            spinnerSetupsUpdate: false,
            spinnerSetupsUpdateText: null,
            setups: [],
            mistakes: [],
            tradeSetup: {
                pattern: null,
                mistake: null,
            },
            tradeSetupChanged: false
        }
    },
    watch: {
        tradeSetup: function() {
            //console.log("Watch tradeSetup " + JSON.stringify(this.tradeSetup))
        }
    },
    methods: {
        getSetups: async function() {
            return new Promise(async(resolve, reject) => {
                console.log(" -> Getting Setups");
                const Object = Parse.Object.extend("patterns");
                const query = new Parse.Query(Object);
                query.equalTo("user", Parse.User.current());
                query.ascending("order");
                //query.lessThanOrEqualTo("dateUnix", this.selectedDateRange.end)
                query.limit(1000000); // limit to at most 10 results
                this.setups = []
                const results = await query.find();
                this.setups = JSON.parse(JSON.stringify(results))
                    //console.log(" -> Setups " + JSON.stringify(this.setups))
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
                    //console.log(" -> Setups " + JSON.stringify(this.setups))
                resolve()
            })
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
            //console.log("param 1: "+param1+" param2 "+param2+" param3 "+param3)
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
                if (param3.video){
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

            const Object = Parse.Object.extend("setups");
            const query = new Parse.Query(Object);
            query.equalTo("tradeId", this.daily.trades[param2].id)
            const results = await query.first();
            if (results) {
                let resultsParse = JSON.parse(JSON.stringify(results))
                    //console.log(" results "+JSON.parse(JSON.stringify(results)).pattern.objectId)
                resultsParse.pattern != null ? this.tradeSetup.pattern = resultsParse.pattern.objectId : null
                resultsParse.mistake != null ? this.tradeSetup.mistake = resultsParse.mistake.objectId : null
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
                            console.log("spinner setup update "+this.spinnerSetupsUpdate)
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
                                console.log("spinner setup update "+this.spinnerSetupsUpdate)
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



        dailyModal() {
            let myModalEl = document.getElementById('videoModal')
            myModalEl.addEventListener('hide.bs.modal', (event) => {
                //console.log("daily hidden")
                if (this.tradeSetupChanged) {
                    this.updateIndexedDB()
                }
                this.tradeSetupChanged = false
            })
        },

        resetSetup() {
            console.log(" -> Resetting setup")
                //we need to reset the setup variable each time
            this.tradeSetup = {
                pattern: null,
                mistake: null,
            }
        },


        updateSetup: async function(param1, param2, param3, param4) { //param1 : trade unixDate ; param2 : trade id inside trade array (gotten from daily.trades[videosArrayIndex].id and then later as this.tradeId), param3: value; param4: pattern or mistake
            console.log("\nUPDATING OR SAVING SETUPS IN PARSE")
            this.spinnerSetups = true
            this.tradeSetupChanged = true
            console.log("param 3 " + param3)
            if (param4 == "pattern") {
                this.tradeSetup.pattern = param3
            }
            if (param4 == "mistake") {
                this.tradeSetup.mistake = param3
            }
            console.log("trade setup " + JSON.stringify(this.tradeSetup) + " with ID " + this.tradeId)
            if (this.tradeSetup.pattern == null &&  (this.tradeSetup.pattern == null && this.tradeSetup.mistake == null)) {
                alert("Please enter setup")
                return
            }


            const Object = Parse.Object.extend("setups");
            const query = new Parse.Query(Object);
            query.equalTo("tradeId", param2)
            const results = await query.first();
            if (results) {
                console.log(" -> Updating setups")
                this.spinnerSetupsText = "Updating"
                results.set("pattern", { __type: "Pointer", className: "patterns", objectId: this.tradeSetup.pattern })
                results.set("mistake", { __type: "Pointer", className: "mistakes", objectId: this.tradeSetup.mistake })

                results.save()
                    .then(async() => {
                        console.log(' -> Updated setup with id ' + results.id)
                            //this.spinnerSetupsText = "Updated setup"
                        this.updateTrades(param1, param2)
                    }, (error) => {
                        console.log('Failed to create new object, with error code: ' + error.message);
                    })
            } else {
                console.log(" -> Saving setups")
                this.spinnerSetupsText = "Saving"

                const object = new Object();
                object.set("user", Parse.User.current())
                object.set("pattern", { __type: "Pointer", className: "patterns", objectId: this.tradeSetup.pattern })
                if (this.tradeSetup.mistake != null) {
                    object.set("mistake", { __type: "Pointer", className: "mistakes", objectId: this.tradeSetup.mistake })
                } else {
                    object.set("mistake", null)
                }
                object.set("tradeUnixDate", param1)
                object.set("tradeId", param2)
                object.setACL(new Parse.ACL(Parse.User.current()));
                object.save()
                    .then(async(object) => {
                        console.log(' -> Added new setup with id ' + object.id)
                            //this.spinnerSetupsText = "Added new setup"
                        this.tradeId = param2 // we need to do this if I want to manipulate the current modal straight away, like for example delete after saving. WHen You push next or back, tradeId is set back to null
                        this.updateTrades(param1, param2)
                    }, (error) => {
                        console.log('Failed to create new object, with error code: ' + error.message);
                    })
            }
        },

        /*deleteSetup: async function(param1, param2) {
            console.log("\nDELETING TRADE SETUP")
            this.tradeSetupChanged = true
            console.log("trade setup " + JSON.stringify(this.tradeSetup) + " with ID " + param2)

            if (param2 != null) {
                console.log(" -> Deleting setup")
                const Object = Parse.Object.extend("setups");
                const query = new Parse.Query(Object);
                query.equalTo("tradeId", param2)
                const results = await query.first();
                if (results) {
                    results.destroy().then(() => {
                        console.log(' -> Deleted setup with id ' + results.id)
                        this.resetSetup()
                    }, (error) => {
                        console.log('Failed to delete setup, with error code: ' + error.message);
                    });
                } else {
                    console.log(" -> Problem : the tradeId has setup but it is not present in setups")
                }
                this.updateTrades(param1, param2, true)
            } else {
                alert("There is no existing setup")
                return
            }
        },*/

        updateTrades: async function(param1, param2, param3) {
            //console.log(" param1 " + param1 + " param2 " + param2 + " param3 " + param3)
            //this.spinnerSetupsText = "Updating trades"
            //query trade to update
            //console.log("date unix "+param1+" is type "+typeof(this.videoToLoad)+" and trade id "+param)
            const Object = Parse.Object.extend("trades");
            const query = new Parse.Query(Object);
            query.equalTo("dateUnix", param1)
            const results = await query.first();
            if (results) {
                //console.log("result from query " + JSON.stringify(results))
                var objectResults = JSON.parse(JSON.stringify(results))
                var arrayTrades = objectResults.trades
                var tradeIndex = arrayTrades.findIndex(f => f.id == param2)
                console.log(" -> Updating trade with id " + param2)
                if (param3 == true) { //Delete == true
                    arrayTrades[tradeIndex].setup = {}
                } else {
                    arrayTrades[tradeIndex].setup = {
                        pattern: this.tradeSetup.pattern,
                        mistake: this.tradeSetup.mistake
                    }
                }
                //console.log("result after " + JSON.stringify(arrayTrades)+" type "+typeof(arrayTrades))
                results.set("trades", arrayTrades)
                results.save().then(async() => {
                    console.log(' -> Updated trades with id ' + results.id)
                        //await (this.spinnerSetupsText = "Updated trade")
                    this.spinnerSetups = false

                })
            } else {
                alert("Update query did not return any results")
                this.spinnerSetups = false
            }
        },

        updateIndexedDB: async function(param1) {
            console.log("\nUPDATING INDEXEDDB")
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
        }

    }
}