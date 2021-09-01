const videosMixin = {
    computed: {
        /*filteredEntrypoints() {
            if (this.tradeSetup.pattern.id != null) {
                var filtered = JSON.parse(JSON.stringify(this.patternsEntrypoints.filter((item) => item.id == this.tradeSetup.pattern.id)))[0]
                return filtered.entrypoints
            }
        }*/
        filteredPattern() {
            if (this.tradeSetup.pattern.id != null) {
                var filtered = JSON.parse(JSON.stringify(this.patterns.filter((item) => item.id == this.tradeSetup.pattern.id)))[0]
                this.imageUrl = filtered.imageUrl
                console.log("Filtered " + this.imageUrl)
                    //return filtered.imageUrl
            }
        }
    },
    watch: {
        /*tradeSetup: function() {
            if (this.tradeSetup.pattern.id != null) {
                var filtered = JSON.parse(JSON.stringify(this.patterns.filter((item) => item.id == this.tradeSetup.pattern.id)))[0]
                console.log("Filtered " + filtered)
                return filtered.imageUrl
            }
        },*/
    },
    mounted() {

    },
    methods: {
        /* ---- CHECK IF VIDEO DOWNLOADED TO INDEXEDDB ---- */
        checkVideo: async function() {
            console.log("CHECKING IF VIDEO EXISTS IN INDEXEDDB")
                //console.log("param "+param)
            let promise = new Promise((resolve, reject) => {
                let transaction = this.indexedDB.transaction(["videos"], "readwrite");
                this.filteredTrades.forEach(element => {
                    //console.log("element " + JSON.stringify(element))
                    if (element.hasOwnProperty('videoName')) {
                        var objectToGet = transaction.objectStore("videos").get(element.videoName)
                        objectToGet.onsuccess = (event) => {
                            if (event.target.result != undefined) {
                                //console.log(" -> Video " + element.videoName + " exists in IndexedDB")
                                this.videosInIndexedDB.push(element.videoName)
                            }
                        }
                    }
                });
                resolve()
            })
        },

        /* ---- TOGGLE VIDEOS ---- */
        showMore: async function(param1, param2) {
            console.log("Video to load (dateUnix) " + param1 + " and index of the video " + param2)
            this.loadingSpinner = true
            this.showDashboard = false
            var x = document.getElementById(param1);
            this.videoToLoad = param1 //Video that has been clicked on
            this.videoIndex = param2 //Index from the list of videos on the videos page
            let transaction = this.indexedDB.transaction(["videos"], "readwrite");
            this.loadingSpinnerText = "Getting videos ..."

            var filterTrades = []
            this.tradeToShow = []
                /* ---- 1: GET THE INFOS OF THE SELECTED VIDEO (TO LOAD) AND SAVE TO SPECIFIC VAR ---- */
            var filterTrades = this.filteredTrades.filter(f => f.dateUnix == this.videoToLoad)
            this.tradeToShow = filterTrades
                //console.log("tradeToShow " + JSON.stringify(this.tradeToShow) + " and month " + typeof this.curMonthTrades)

            /* ---- 2: UPDATE TRADES TO SHOW WITH VIDEO START AND END TIME ---- */
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
            console.log("GETTTING VIDEO URL FROM LOCAL OR REMOTE DB")
            var videoURL = filterTrades[0].video
            this.videoName = filterTrades[0].videoName
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
                    this.loadingSpinner = false
                } else {
                    console.log(" -> Video does not exist in IndexedDB. Storing it")
                    this.loadingSpinnerText = "First time getting this video. Process will be faster next time. Please wait ...";

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
                        this.loadingSpinner = false

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
                        }
                        objectToAdd.onserror = (event) => {
                            alert(" -> Error storing video in IndexedDB with message " + event)
                        }
                    })()
                }

            }
            objectToGet.onerror = (event) => {
                console.log("there was an error getting video from indexedDB")
                this.loadingSpinner = false
                this.showDashboard = true
            }

        },

        viewModalVideos: async function(param1, param2) { //When we click on the video icon to view a video. Param1 : is video true/false, Param2: index of array
            await (this.hasVideo = false)
            await (this.resetSetup())
            this.modalVideosOpen = false
            if (param1 == true) {
                this.hasVideo = true
            }
            //console.log("Has video ? "+this.hasVideo)
            this.modalVideosOpen = true
            this.videosArrayIndex = param2 //VideoToLoad = the full video to get/load. videosArrayIndex = part, determined by start and end time, of the video (to load)
            if (Object.keys(this.tradeToShow[0].trades[param2].setup).length != 0) {
                console.log(" -> Trade with ID " + this.tradeToShow[0].trades[param2].id + " has setup in DB. Let's get tradeSetup names")
                this.tradeId = this.tradeToShow[0].trades[param2].id
                await this.getTradeSetupNames(this.tradeToShow[0].trades[param2].setup)
            } else {
                console.log(" -> Trade has No setup in DB")
                this.tradeId = null
            }
        },

        resetSetup() {
            console.log("resetting setup")
            //we need to reset the setup variable each time
            this.tradeSetup = {
                pattern: {
                    id: null,
                    name: null,
                    timeInterval: null,
                    winStrategy: null,
                },
                entrypoint: {
                    id: null,
                    name: null,
                },
                mistake: {
                    id: null,
                    name: null,
                },
            }
        },

        selectedPattern: async function(param) { //param = pattern id
            //Initiate and create popover
            await (this.initPopover())
            this.tradeSetup.pattern.id = param
            var filtered = JSON.parse(JSON.stringify(this.patterns.filter((item) => item.id == this.tradeSetup.pattern.id)))[0]
            this.imageUrl = filtered.imageUrl
            //console.log("Filtered " + this.imageUrl)
            var exampleEl = document.getElementById('videoImgUrl')
            var options = {
                placement: 'right',
                container: 'body',
                html: true,
                selector: '[rel="popover"]', //Sepcify the selector here
                content: '<img class="img-thumbnail" src=' + this.imageUrl + ' />'
            }
            return new bootstrap.Popover(exampleEl, options)
        },
        inputPattern(param) {
            console.log("pattern input " + param)
        },

        checkEmptyObject(param) {
            return Object.keys(param).length === 0 ? true : false
        },

        getTradeSetupNames: async function(param) {
            console.log("Trade setup in DB (param) " + JSON.stringify(param))
            if (param.pattern != null) {
                var filteredPattern = JSON.parse(JSON.stringify(this.patterns.filter((item) => item.id == param.pattern.id)))[0]

                this.tradeSetup.pattern.id = filteredPattern.id
                this.tradeSetup.pattern.name = filteredPattern.name
            } else {
                this.tradeSetup.pattern.id = null
                this.tradeSetup.pattern.name = null
            }

            this.tradeSetup.pattern.timeInterval = param.pattern.timeInterval
            this.tradeSetup.pattern.winStrategy = param.pattern.winStrategy

            if (param.entrypoint != null) {
                var filteredEntrypoint = JSON.parse(JSON.stringify(this.entrypoints.filter((item) => item.id == param.entrypoint)))[0]

                this.tradeSetup.entrypoint.id = filteredEntrypoint.id
                this.tradeSetup.entrypoint.name = filteredEntrypoint.name
            } else {
                this.tradeSetup.entrypoint.id = null
                this.tradeSetup.entrypoint.name = null
            }

            if (param.mistake != null) {
                var filteredMistake = JSON.parse(JSON.stringify(this.mistakes.filter((item) => item.id == param.mistake)))[0]
                    //console.log("filteredPattern" + JSON.stringify(filteredPattern) + "and entrypoint " + JSON.stringify(filteredEntrypoint))
                this.tradeSetup.mistake.id = filteredMistake.id
                this.tradeSetup.mistake.name = filteredMistake.name
            } else {
                this.tradeSetup.mistake.id = null
                this.tradeSetup.mistake.name = null
            }
            console.log("tradeSetup " + JSON.stringify(this.tradeSetup))
                //this.tradeSetup.pattern = filtered.name
                //this.tradeSetup.entrypoint = filtered 
                //return filtered.name
        },

        updateSetup: async function(param) { //param1 : trade unixDate ; param2 : trade id inside trade array
            console.log("\nUPDATING TRADE SETUP")
            this.spinnerSetups = true
            console.log("trade setup " + JSON.stringify(this.tradeSetup) + " with ID " + this.tradeId)
            if (this.tradeSetup.pattern.id == null || (this.tradeSetup.pattern.id == null && this.tradeSetup.entrypoint.id == null && this.tradeSetup.mistake.id == null)) {
                alert("Please enter setup")
                return
            }

            if (this.tradeId != null) {
                console.log(" -> Updating setups")
                this.spinnerSetupsText = "Updating setups"
                const Object = Parse.Object.extend("setups");
                const query = new Parse.Query(Object);
                query.equalTo("tradeId", this.tradeId)
                const results = await query.first();
                if (results) {
                    results.set("pattern", { __type: "Pointer", className: "patterns", objectId: this.tradeSetup.pattern.id })
                    results.set("patternTimeInterval", this.tradeSetup.pattern.timeInterval)
                    results.set("patternWinStrategy", this.tradeSetup.pattern.winStrategy)
                    results.set("entrypoint", { __type: "Pointer", className: "entrypoints", objectId: this.tradeSetup.entrypoint.id })
                    results.set("mistake", { __type: "Pointer", className: "mistakes", objectId: this.tradeSetup.mistake.id })

                    results.save()
                        .then(async() => {
                            console.log(' -> Updated setup with id ' + results.id)
                            this.spinnerSetupsText = "Updated setup"
                            this.updateTrade(param)
                        }, (error) => {
                            console.log('Failed to create new object, with error code: ' + error.message);
                        })
                } else {
                    console.log(" -> Problem : the tradeId has setup but it is not present in setups")
                }
            } else {
                console.log(" -> Saving setups")
                this.spinnerSetupsText = "Saving setups"
                const Object = Parse.Object.extend("setups");
                const object = new Object();
                object.set("user", Parse.User.current())
                object.set("pattern", { __type: "Pointer", className: "patterns", objectId: this.tradeSetup.pattern.id })
                object.set("patternTimeInterval", this.tradeSetup.pattern.timeInterval)
                object.set("patternWinStrategy", this.tradeSetup.pattern.winStrategy)
                object.set("entrypoint", { __type: "Pointer", className: "entrypoints", objectId: this.tradeSetup.entrypoint.id })
                if (this.tradeSetup.mistake.id != null) {
                    object.set("mistake", { __type: "Pointer", className: "mistakes", objectId: this.tradeSetup.mistake.id })
                } else {
                    object.set("mistake", null)
                }
                object.set("tradeUnixDate", this.videoToLoad)
                object.set("tradeId", param)
                object.setACL(new Parse.ACL(Parse.User.current()));
                object.save()
                    .then(async(object) => {
                        console.log(' -> Added new setup with id ' + object.id)
                        this.spinnerSetupsText = "Added new setup"
                        this.updateTrade(param)
                    }, (error) => {
                        console.log('Failed to create new object, with error code: ' + error.message);
                    })
            }
        },

        deleteSetup: async function(param) {
            console.log("\nDELETING TRADE SETUP")
            console.log("trade setup " + JSON.stringify(this.tradeSetup) + " with ID " + this.tradeId)

            if (this.tradeId != null) {
                console.log(" -> Deleting setup")
                const Object = Parse.Object.extend("setups");
                const query = new Parse.Query(Object);
                query.equalTo("tradeId", this.tradeId)
                const results = await query.first();
                if (results) {
                    results.destroy().then(() => {
                        console.log(' -> Deleted setup with id ' + results.id)
                    }, (error) => {
                        console.log('Failed to delete setup, with error code: ' + error.message);
                    });
                } else {
                    console.log(" -> Problem : the tradeId has setup but it is not present in setups")
                }
                this.updateTrade(param, true)
            } else {
                alert("There is no existing setup")
                return
            }
        },

        updateTrade: async function(param, param2) {
            this.spinnerSetupsText = "Updating trades"
            //query trade to update
            //console.log("date unix "+this.videoToLoad+" is type "+typeof(this.videoToLoad)+" and trade id "+param)
            const Object = Parse.Object.extend("trades");
            const query = new Parse.Query(Object);
            query.equalTo("dateUnix", this.videoToLoad)
            const results = await query.first();
            if (results) {
                //console.log("result from query " + JSON.stringify(results))
                var objectResults = JSON.parse(JSON.stringify(results))
                var arrayTrades = objectResults.trades
                var tradeIndex = arrayTrades.findIndex(f => f.id == param)
                console.log(" -> Updating trade with id " + param)
                if (param2 == true) { //Delete == true
                    arrayTrades[tradeIndex].setup = {}
                } else {
                    arrayTrades[tradeIndex].setup = {
                        pattern: {
                            id: this.tradeSetup.pattern.id,
                            timeInterval: this.tradeSetup.pattern.timeInterval,
                            winStrategy: this.tradeSetup.pattern.winStrategy
                        },
                        entrypoint: this.tradeSetup.entrypoint.id,
                        mistake: this.tradeSetup.mistake.id
                    }
                }
                //console.log("result after " + JSON.stringify(arrayTrades)+" type "+typeof(arrayTrades))
                results.set("trades", arrayTrades)
                results.save().then(async() => {
                    console.log(' -> Updated trades with id ' + results.id)
                    await (this.spinnerSetupsText = "Updated trade")
                    await (this.spinnerSetupsText = "Getting trades from DB")
                    await this.getTradesFromDb() //update indexedDB
                    await (this.spinnerSetupsText = "Getting all trades")
                    await this.getAllTrades(true)                    
                        //await this.showMore(this.videoToLoad, this.videoIndex)
                    await (() => {
                        this.spinnerSetupsText = "Updating filtered trade"
                        var filterTrades = []
                        this.tradeToShow = []
                            /* ---- 1: GET THE INFOS OF THE SELECTED VIDEO (TO LOAD) AND SAVE TO SPECIFIC VAR ---- */
                        var filterTrades = this.filteredTrades.filter(f => f.dateUnix == this.videoToLoad)
                        this.tradeToShow = filterTrades
                            //console.log("tradeToShow " + JSON.stringify(this.tradeToShow) + " and month " + typeof this.curMonthTrades)

                        /* ---- 2: UPDATE TRADES TO SHOW WITH VIDEO START AND END TIME ---- */
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
                        this.spinnerSetups = false
                    })()

                })
            } else {
                alert("Update query did not return any results")
            }
        }

    }
}