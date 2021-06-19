const videosMixin = {
    methods: {
        /* ---- TOGGLE VIDEOS ---- */
        showMore: async function(param1, param2) {
            console.log("Video to load (dateUnix) " + param1 + " and index of the  " + param2)
            this.loadingSpinner = true
            this.showDashboard = false
            var x = document.getElementById(param1);
            this.videoToLoad = param1 //Video that has been clicked on
            this.videoIndex = param2 //Index from the list of videos on the videos page
            let transaction = this.indexedDB.transaction(["videos"], "readwrite");
            this.loadingSpinnerText = "Getting videos ..."


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
            objectToGet.onsuccess = (event) => {
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
                            alert(" -> Error storing video in IndexedDB with message "+event)
                        }
                    })()
                }

            }
            objectToGet.onerror = (event) => {
                console.log("there was an error getting video from indexedDB")
                this.loadingSpinner = false
                this.showDashboard = true
            }

        }
    }
}