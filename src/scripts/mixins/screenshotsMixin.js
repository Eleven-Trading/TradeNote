const screenshotsMixin = {
    data() {
        return {
            expandedScreenshot: null,
            entrySide: [{
                    value: null,
                    label: "Side"
                },
                {
                    value: "SS",
                    label: "Short"
                },
                {
                    value: "B",
                    label: "Buy"
                }
            ],
            editingScreenshot: false,
            dateScreenshotEdited: false,
            setup: {
                "side": null,
                "type": null
            },
            screenshotButton: false,
            setups: [],
            screenshotIdToEdit: null,
            //currentDate: dayjs().format("YYYY-MM-DD THH:mm:ss"),
            setupType: [{
                    value: null,
                    label: "Type"
                },
                {
                    value: "setup",
                    label: "General Setup"
                },
                {
                    value: "entry",
                    label: "Trade Entry"
                }
            ],
            screenshotsQueryLimit: 6,
            screenshotsPagination: 0,
            screenshotsNames: [],
            patternsMistakes: [],
            loadMoreSpinner: false,
            endOfList: false
        }
    },

    watch: {
        setupUpdate: function() {
            //console.log("setup " + JSON.stringify(this.setup))
        }
    },
    mounted: async function() {
        this.spinnerLoadingPage = true
        this.getScreenshotsPagination()

        if (this.currentPage.id == "screenshots" || this.currentPage.id == "diary") {
            window.addEventListener('scroll', () => {
                let scrollTop = window.scrollY
                let visibleScreen = window.innerHeight
                let documentHeight = document.documentElement.scrollHeight
                let difference = documentHeight - (scrollTop + visibleScreen)

                //console.log(" -> Scrolled from top: "+scrollTop+" | Visible part of screen: "+visibleScreen+" | Total document height: "+documentHeight+" | Top + visible: "+(scrollTop + visibleScreen)+" | Difference: "+difference)


                //console.log(" -> Scrolled from top + visible part: "+(window.scrollY + window.innerHeight))

                if (difference <= 0) {

                    if (!this.loadMoreSpinner && !this.spinnerLoadingPage && !this.endOfList) { //To avoid firing multiple times, make sure it's not loadin for the first time and that there is not already a loading more (spinner)
                        console.log("  --> Loading more screenshots")
                        if (this.currentPage.id == "screenshots") this.getScreenshots()
                        if (this.currentPage.id == "diary") this.getJournals()
                        this.loadMoreSpinner = true
                    }
                }
            })
        }
    },
    methods: {
        getScreenshotsPagination() {
            if (sessionStorage.getItem('screenshotsPagination') && this.currentPage.id == "screenshots") {
                this.screenshotsQueryLimit = Number(sessionStorage.getItem('screenshotsPagination'))
                console.log(" this.screenshotsPagination " + typeof this.screenshotsQueryLimit)
                sessionStorage.removeItem('screenshotsPagination');
            }
        },

        getScreenshots: async function(param) {
            await this.getPatternsMistakes()
                //console.log(" -> Selected patterns " + this.selectedPatterns)
            let allPatterns = []
            this.patterns.filter(obj => obj.active == true).forEach(element => {
                allPatterns.push(element.objectId)
            });

            let allMistakes = []
            this.mistakes.filter(obj => obj.active == true).forEach(element => {
                allMistakes.push(element.objectId)
            });

            //we need to reverse the logic and exclude in the query the patterns and mistakes that are unselected
            let exclPatterns = allPatterns.filter(x => !this.selectedPatterns.includes(x));
            //console.log(" -> Excluded patterns "+exclPatterns);
            let exclMistakes = allMistakes.filter(x => !this.selectedMistakes.includes(x));
            //console.log(" -> Excluded mistakes "+exclMistakes);

            let allPatternsMistakesIds = []
            let excludedIds = []

            this.patternsMistakes.forEach(element => {
                allPatternsMistakesIds.push(element.tradeId)
                    //console.log(" - element mistake "+element.mistake)

                if ((element.pattern != null && exclPatterns.includes(element.pattern.objectId)) || (element.mistake != null && exclMistakes.includes(element.mistake.objectId))) {
                    //console.log("  --> Trade id to exclude " + element.tradeId)
                    excludedIds.push(element.tradeId)
                }
            });


            return new Promise(async(resolve, reject) => {
                console.log(" -> Getting screenshots");
                //console.log(" -> selectedPatterns " + this.selectedPatterns)
                //console.log(" -> screenshotsPagination (start)" + this.screenshotsPagination);
                //console.log(" selected start date " + this.selectedMonth.start)
                const Object = Parse.Object.extend("setupsEntries");
                const query = new Parse.Query(Object);
                query.equalTo("user", Parse.User.current());
                query.descending("dateUnix");
                query.notContainedIn("name", excludedIds) // Query not including excluded ids

                if (!this.selectedPatterns.includes("void") && !this.selectedMistakes.includes("void")) { // if void has been excluded, then only query screenshots that are in Patterns Mistakes table
                    query.containedIn("name", allPatternsMistakesIds)
                }

                if (param) { // if "full" false (case for daily page), then only certain limit. Else sull
                    query.greaterThanOrEqualTo("dateUnix", this.selectedMonth.start)
                    query.lessThanOrEqualTo("dateUnix", this.selectedMonth.end)
                } else {
                    query.limit(this.screenshotsQueryLimit);
                    query.skip(this.screenshotsPagination)
                }


                await query.find().then((results) => {
                    //console.log("results " + JSON.stringify(results))
                    if (results.length > 0) {
                        let parsedResult = JSON.parse(JSON.stringify(results))
                        parsedResult.forEach(element => {
                            this.screenshotsNames.push(element.name)
                        });

                        if (this.currentPage.id == "daily") {
                            //on daily page, when need to reset setups or else after new screenshot is added, it apreaeed double. 
                            //However, on screenshots page, we need to add to setups on new image / page load on scroll
                            this.setups = parsedResult
                        } else {
                            this.setups = this.setups.concat(parsedResult)
                        }
                    }else{
                        this.endOfList = true
                    }


                    //console.log(" -> Setups/Screenshots " + JSON.stringify(this.setups))
                    this.screenshotsPagination = this.screenshotsPagination + this.screenshotsQueryLimit
                    this.spinnerSetups = false //spinner for trades in daily
                    this.loadMoreSpinner = false
                    if (this.currentPage.id != "daily") this.spinnerLoadingPage = false //we remove it later

                }).then(() => {
                    if (sessionStorage.getItem('screenshotIdToEdit') && this.currentPage.id == "screenshots") this.scrollToScreenshot()
                    resolve()
                })

            })
        },

        scrollToScreenshot() {
            let element = document.getElementById(sessionStorage.getItem('screenshotIdToEdit'))
            element.scrollIntoView()
            sessionStorage.removeItem('screenshotIdToEdit');
        },

        getScreenshotToEdit: async function(param) {
            if (!param) {
                return
            }
            this.editingScreenshot = true
            this.screenshotIdToEdit = param

            //console.log("setup to edit " + this.screenshotIdToEdit)
            const Object = Parse.Object.extend("setupsEntries");
            const query = new Parse.Query(Object);
            query.equalTo("objectId", param);
            const results = await query.first();
            if (results) {
                this.setup = JSON.parse(JSON.stringify(results))
                    //console.log(" -> Setup of screenshot to edit "+JSON.stringify(this.setup))
                if (this.setup.side) {
                    this.setup.type = "entry"
                } else {
                    this.setup.type = "setup"
                }

                let index = this.patternsMistakes.findIndex(obj => obj.tradeId == this.setup.name)

                if (index != -1) {
                    if (this.patternsMistakes[index].hasOwnProperty('pattern') && this.patternsMistakes[index].pattern != null && this.patternsMistakes[index].pattern != undefined && this.patternsMistakes[index].pattern.hasOwnProperty('objectId')) this.setup.pattern = this.patternsMistakes[index].pattern.objectId

                    if (this.patternsMistakes[index].hasOwnProperty('mistake') && this.patternsMistakes[index].mistake != null && this.patternsMistakes[index].mistake != undefined && this.patternsMistakes[index].mistake.hasOwnProperty('objectId')) this.setup.mistake = this.patternsMistakes[index].mistake.objectId

                    //updating patterns and mistakes used in dailyMixin
                    this.tradeSetup.pattern = this.setup.pattern
                    this.tradeSetup.mistake = this.setup.mistake
                }

            } else {
                alert("Query did not return any results")
            }
        },

        setupImageUpload: async function(event, param1, param2, param3) {
            if (this.currentPage.id == "daily") {
                this.tradeScreenshotChanged = true
                this.indexedDBtoUpdate = true
                this.dateScreenshotEdited = true

                this.setup.dateUnix = param1
                this.setup.symbol = param2
                this.setup.side = param3

            }
            //console.log(" day unix "+ dayjs(this.setup.dateUnix*1000).tz(this.tradeTimeZone).startOf("day").unix())
            const file = event.target.files[0];

            /* We convert to base64 so we can read src in markerArea */
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                var base64data = reader.result
                this.setup.originalBase64 = base64data
                this.setup.annotatedBase64 = base64data
                this.setup.extension = base64data.substring(base64data.indexOf('/') + 1, base64data.indexOf(';base64'))
                this.renderData += 1
                    //console.log("original " + this.setup.annotatedBase64)
            }

        },

        setupMarkerArea() {
            if (this.currentPage.id == "daily") {
                this.tradeScreenshotChanged = true
                this.indexedDBtoUpdate = true
                this.dateScreenshotEdited = true

            }
            //https://github.com/ailon/markerjs2#readme
            let markerAreaId = document.getElementById("setupDiv");

            const markerArea = new markerjs2.MarkerArea(markerAreaId);
            markerArea.availableMarkerTypes = markerArea.ALL_MARKER_TYPES;
            markerArea.renderAtNaturalSize = true;
            markerArea.renderImageQuality = 1;
            markerArea.settings.defaultFillColor = "#ffffffde" //note background
            markerArea.settings.defaultStrokeColor = "black" //font color
            markerArea.settings.defaultColorsFollowCurrentColors = true
            markerArea.settings.defaultStrokeWidth = 2
            markerArea.settings.defaultColor = "white"

            markerArea.targetRoot = markerAreaId.parentElement
            markerArea.addRenderEventListener((imgURL, state) => {
                this.setup.annotatedBase64 = imgURL
                this.setup.maState = state
                    //console.log("state " + JSON.stringify(this.setup.maState))
                this.markerAreaOpen = false
                this.renderData += 1
            })

            markerArea.show();
            if (markerArea.isOpen) {
                this.markerAreaOpen = true
            }

            if (this.setup.maState) {
                markerArea.restoreState(this.setup.maState);
            }
        },

        screenshotUpdateDate(event) {
            if (this.editingScreenshot) {
                this.dateScreenshotEdited = true
            }
            this.setup.date = event
                //console.log("setup date (local time, i.e. New York time) " + this.setup.date)
            this.setup.dateUnix = dayjs.tz(this.setup.date, this.tradeTimeZone).unix()
                //console.log("unix " + dayjs.tz(this.setup.date, this.tradeTimeZone).unix()) // we SPECIFY that it's New york time
        },

        saveScreenshot: async function() {
            console.log("\nSAVING SCREENSHOT")
                //console.log(" -> Setup to save " + JSON.stringify(this.setup))
            return new Promise(async(resolve, reject) => {
                if (this.markerAreaOpen == true) {
                    alert("Please save your setup annotation")
                    return
                }
                if (this.currentPage.id == "addScreenshot") {
                    this.spinnerLoadingPage = true
                    this.spinnerLoadingPageText = "Uploading screenshot ..."
                }

                if (this.currentPage.id == "daily") {
                    this.spinnerSetups = true
                }

                if (this.currentPage.id == "addScreenshot") { //if daily, we do not edit dateUnix. It's already formated
                    if (!this.editingScreenshot || (this.editingScreenshot && this.dateScreenshotEdited)) {
                        this.setup.dateUnix = dayjs.tz(this.setup.date, this.tradeTimeZone).unix()
                    }
                }
                if (this.editingScreenshot && !this.dateScreenshotEdited) {
                    //we do nothing
                }

                //extension is created during setupImageUpload. So when edit, must create it here before upload
                if (this.editingScreenshot) {
                    this.setup.extension = this.setup.originalBase64.substring(this.setup.originalBase64.indexOf('/') + 1, this.setup.originalBase64.indexOf(';base64'))
                }

                //console.log(" -> dateUnix " + this.setup.dateUnix)


                this.setup.side ? this.setup.name = "t" + this.setup.dateUnix + "_" + this.setup.symbol + "_" + this.setup.side : this.setup.name = this.setup.dateUnix + "_" + this.setup.symbol
                    //console.log("name " + this.setup.name)

                /*
                UPDATE PATTERNS MISTAKES
                //updating variables used in dailyMixin
                //Pattern and mistake are already updated on change/input
                */
                this.tradeSetupId = this.setup.name
                this.tradeSetupDateUnix = this.setup.dateUnix
                this.tradeSetupDateUnixDay = dayjs(this.setup.dateUnix * 1000).tz(this.tradeTimeZone).startOf("day").unix()
                if (this.currentPage.id == "addScreenshot") await this.hideTradesModal() //I reuse the function from dailyMixin, for storing patterns and mistakes. But only on add screenshot or else it creates infinity loop

                /* UPLOAD SCREENSHOT */
                await this.uploadScreenshotToParse()

                resolve()
            })
        },

        uploadScreenshotToParse: async function() {
            return new Promise(async(resolve, reject) => {
                console.log(" -> Uploading to database")

                this.spinnerLoadingPageText = "Uploading Screenshot ..."

                /* creating names, recreating files and new parse files */
                const originalName = this.setup.name + "-original." + this.setup.extension
                const annotatedName = this.setup.name + "-annotated." + this.setup.extension

                /* we convert image back from base64 to file cause base64 was making browser freez whenever image was larger (at least at 300ko) */
                const dataURLtoFile = (dataurl, filename) => {
                    var arr = dataurl.split(','),
                        mime = arr[0].match(/:(.*?);/)[1],
                        bstr = window.atob(arr[1]),
                        n = bstr.length,
                        u8arr = new Uint8Array(n);

                    while (n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                    return new File([u8arr], filename, { type: mime });
                }
                let originalFile = dataURLtoFile(this.setup.originalBase64, originalName);
                const parseOriginalFile = new Parse.File(originalName, originalFile);

                let annotatedFile = dataURLtoFile(this.setup.annotatedBase64, originalName);
                const parseAnnotatedFile = new Parse.File(annotatedName, annotatedFile);

                const Object = Parse.Object.extend("setupsEntries");
                const query = new Parse.Query(Object);
                query.equalTo("objectId", this.setup.objectId);

                const results = await query.first();
                //console.log("url orig " + this.setup.originalUrl + " annot " + this.setup.annotatedUrl)
                if (results) {
                    console.log(" -> Updating")
                    await parseOriginalFile.save() // before I was using then. In that case it's possible to catch error. I had to change it to await because in daily trades it was triggering the rest of the functinos in clickTradesModal too fast
                    await parseAnnotatedFile.save()
                    results.set("name", this.setup.name)
                    results.set("symbol", this.setup.symbol)
                    results.set("side", this.setup.side)
                    results.set("original", parseOriginalFile)
                    results.set("annotated", parseAnnotatedFile)
                    results.set("originalBase64", this.setup.originalBase64)
                    results.set("annotatedBase64", this.setup.annotatedBase64)
                    results.set("maState", this.setup.maState)
                    if (this.dateScreenshotEdited) {
                        results.set("date", new Date(dayjs.tz(this.setup.dateUnix, this.tradeTimeZone).format("YYYY-MM-DDTHH:mm:ss")))
                        results.set("dateUnix", Number(this.setup.dateUnix))
                        results.set("dateUnixDay", dayjs(this.setup.dateUnix * 1000).tz(this.tradeTimeZone).startOf("day").unix())
                    }
                    results.save().then(async() => {
                        console.log(' -> Updated screenshot with id ' + results.id)
                        if (this.currentPage.id == "addScreenshot") {
                            window.location.href = "/screenshots"
                        }

                        if (this.currentPage.id == "daily") {
                            await this.getScreenshots(true)
                            const file =
                                document.querySelector('.screenshotFile');
                            file.value = '';
                        }
                        resolve()

                    }, (error) => {
                        console.log('Failed to update new object, with error code: ' + error.message);
                        //window.location.href = "/screenshots"
                        this.spinnerLoadingPage = false
                    })

                } else {
                    console.log(" -> Saving")

                    await parseOriginalFile.save()
                    await parseAnnotatedFile.save()
                        //console.log(" -> Setup to upload " + JSON.stringify(this.setup))
                    const object = new Object();
                    object.set("user", Parse.User.current())
                    object.set("name", this.setup.name)
                    object.set("symbol", this.setup.symbol)
                    object.set("side", this.setup.side)
                    object.set("original", parseOriginalFile)
                    object.set("annotated", parseAnnotatedFile)
                    object.set("originalBase64", this.setup.originalBase64)
                    object.set("annotatedBase64", this.setup.annotatedBase64)
                    object.set("maState", this.setup.maState)
                    object.set("date", new Date(dayjs.tz(this.setup.date, this.tradeTimeZone).format("YYYY-MM-DDTHH:mm:ss")))
                    object.set("dateUnix", Number(this.setup.dateUnix))
                    object.set("dateUnixDay", dayjs(this.setup.dateUnix * 1000).tz(this.tradeTimeZone).startOf("day").unix())

                    object.setACL(new Parse.ACL(Parse.User.current()));

                    object.save()
                        .then(async(object) => {
                            console.log('  --> Added new screenshot with id ' + object.id)
                            if (this.currentPage.id == "addScreenshot") {
                                window.location.href = "/screenshots"
                            }
                            if (this.currentPage.id == "daily") {
                                await this.getScreenshots(true)
                                const file =
                                    document.querySelector('.screenshotFile');
                                file.value = '';
                            }
                            resolve()


                        }, (error) => {
                            console.log('Failed to create new object, with error code: ' + error.message);
                            //window.location.href = "/screenshots"
                            this.spinnerLoadingPage = false
                        });

                }
            })
        },

        deleteScreenshot: async function(param1, param2) {
            console.log("selected item " + this.selectedItem)
                //console.log("setup "+JSON.stringify(this.setups))

            /* First, let's delete patterns mistakes */
            let setupToDelete = this.setups.filter(obj => obj.objectId == this.selectedItem)[0]
                //console.log("setupToDelete "+JSON.stringify(setupToDelete))
                //console.log("setupToDelete date unix day "+setupToDelete.dateUnixDay+" and name "+setupToDelete.name)
            await this.deletePatternMistake(setupToDelete.dateUnixDay, setupToDelete.name)

            /* Now, let's delete screenshot */
            const Object = Parse.Object.extend("setupsEntries");
            const query = new Parse.Query(Object);
            query.equalTo("objectId", this.selectedItem);
            const results = await query.first();

            if (results) {
                await results.destroy()
                console.log('  --> Deleted screenshot with id ' + results.id)
                    //document.location.reload()
                await this.refreshScreenshot()
            } else {
                alert("There was a problem with the query")
            }
        },

        refreshScreenshot: async function() {
            return new Promise(async(resolve, reject) => {
                this.screenshotsQueryLimit = 6
                this.screenshotsPagination = 0
                this.setups = []
                await this.getScreenshots()
                await this.initPopover()
                resolve()
            })
        }

    }
}