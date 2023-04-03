const setupsMixin = {
    data() {
        return {
            expandedSetup: null,
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
            editingSetup: false,
            dateSetupEdited: false,
            setup: {
                "side": null,
                "type": null
            },
            setupButton: false,
            setups: [],
            setupIdToEdit: null,
            currentDate: dayjs().format("YYYY-MM-DD THH:mm:ss"),
            setupType: [{
                    value: null,
                    label: "Type"
                },
                {
                    value: "setup",
                    label: "Setup"
                },
                {
                    value: "entry",
                    label: "Entry"
                }
            ],
            setupsEntriesQueryLimit: 6,
            setupsEntriesPagination: 0
        }
    },

    watch: {
        setupUpdate: function() {
            //console.log("setup " + JSON.stringify(this.setup))
        }
    },
    mounted: async function() {
        if (this.currentPage.id == "setups") {
            window.addEventListener('scroll', () => {
                //console.log(window.scrollY) //scrolled from top
                //console.log(window.innerHeight) //visible part of screen
                if (window.scrollY + window.innerHeight >=
                    document.documentElement.scrollHeight) {
                    if (this.currentPage.id == "setups") {
                        console.log(" -> Load new images")
                        this.getSetupsEntries()
                    }
                }
            })
        }
    },
    methods: {
        getSetupsEntries: async function(param) {
            return new Promise(async(resolve, reject) => {
                console.log(" -> Getting Setups and entries");
                //console.log(" -> setupsEntriesPagination (start)" + this.setupsEntriesPagination);
                //console.log(" selected start date " + this.selectedMonth.start)
                const Object = Parse.Object.extend("setupsEntries");
                const query = new Parse.Query(Object);
                query.equalTo("user", Parse.User.current());
                query.descending("dateUnix");
                if (param) { // if "full" false (case for daily page), then only certain limit. Else sull
                    query.greaterThanOrEqualTo("dateUnix", this.selectedMonth.start)
                    query.lessThanOrEqualTo("dateUnix", this.selectedMonth.end)
                } else {
                    query.limit(this.setupsEntriesQueryLimit);
                    query.skip(this.setupsEntriesPagination)
                }
                this.setups = []
                const results = await query.find();
                this.setups = this.setups.concat(JSON.parse(JSON.stringify(results)))
                    //console.log(" -> Setups " + JSON.stringify(this.setups))
                this.setupsEntriesPagination = this.setupsEntriesPagination + this.setupsEntriesQueryLimit
                    //console.log(" -> setupsEntriesPagination (end)" + this.setupsEntriesPagination);
                this.spinnerSetups = false //spinner for trades in daily
                resolve()
            })
        },

        getSetupToEdit: async function(param) {
            if (!param) {
                return
            }
            this.editingSetup = true
            this.setupIdToEdit = param
                //console.log("setup to edit " + this.setupIdToEdit)
            const Object = Parse.Object.extend("setupsEntries");
            const query = new Parse.Query(Object);
            query.equalTo("objectId", param);
            const results = await query.first();
            if (results) {
                this.setup = JSON.parse(JSON.stringify(results))
                if (this.setup.side) {
                    this.setup.type = "entry"
                } else {
                    this.setup.type = "setup"
                }

            } else {
                alert("Query did not return any results")
            }
        },

        setupImageUpload: async function(event, param1, param2, param3) {
            if (this.currentPage.id == "daily") {
                this.tradeScreenshotChanged = true
                this.indexedDBtoUpdate = true
                this.dateSetupEdited = true

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
                this.dateSetupEdited = true

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

        setupUpdateDate(event) {
            if (this.editingSetup) {
                this.dateSetupEdited = true
            }
            this.setup.date = event
                //console.log("setup date (local time, i.e. New York time) " + this.setup.date)
            this.setup.dateUnix = dayjs.tz(this.setup.date, this.tradeTimeZone).unix()
            console.log("unix " + dayjs.tz(this.setup.date, this.tradeTimeZone).unix()) // we SPECIFY that it's New york time
        },

        saveSetup: async function() {
            console.log("\nSAVING SETUP IMAGE")
                //console.log(" -> Setup to save " + JSON.stringify(this.setup))
            return new Promise(async(resolve, reject) => {
                if (this.markerAreaOpen == true) {
                    alert("Please save your setup annotation")
                    return
                }
                if (this.currentPage.id == "addSetup") {
                    this.loadingSpinner = true
                    this.loadingSpinnerText = "Uploading setup ..."
                }

                if (this.currentPage.id == "daily") {
                    this.spinnerSetups = true
                }

                if (this.currentPage.id == "addSetup") { //if daily, we do not edit dateUnix. It's already formated
                    if (!this.editingSetup || (this.editingSetup && this.dateSetupEdited)) {
                        this.setup.dateUnix = dayjs.tz(this.setup.date, this.tradeTimeZone).unix()
                    }
                }
                if (this.editingSetup && !this.dateSetupEdited) {
                    //we do nothing
                }

                //extension is created during setupImageUpload. So when edit, must create it here before upload
                if (this.editingSetup) {
                    this.setup.extension = this.setup.originalBase64.substring(this.setup.originalBase64.indexOf('/') + 1, this.setup.originalBase64.indexOf(';base64'))
                }

                //console.log(" -> dateUnix " + this.setup.dateUnix)


                this.setup.side ? this.setup.name = "t" + this.setup.dateUnix + "_" + this.setup.symbol + "_" + this.setup.side : this.setup.dateUnix + "_" + this.setup.symbol
                    //console.log("name " + this.setup.name)

                await this.uploadSetupScreenshotToParse()

                resolve()
            })
        },

        uploadSetupScreenshotToParse: async function() {
            return new Promise(async(resolve, reject) => {
                console.log(" -> Uploading to database")

                this.loadingSpinnerText = "Uploading Screenshot ..."

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
                    if (this.dateSetupEdited) {
                        results.set("date", new Date(dayjs.tz(this.setup.dateUnix, this.tradeTimeZone).format("YYYY-MM-DDTHH:mm:ss")))
                        results.set("dateUnix", Number(this.setup.dateUnix))
                        results.set("dateUnixDay", dayjs(this.setup.dateUnix*1000).tz(this.tradeTimeZone).startOf("day").unix())
                    }
                    results.save().then(async() => {
                        console.log(' -> Updated screenshot with id ' + results.id)
                        if (this.currentPage.id == "addSetup") {
                            window.location.href = "/setups"
                        }

                        if (this.currentPage.id == "daily") {
                            await this.getSetupsEntries(true)
                            const file =
                                document.querySelector('.screenshotFile');
                            file.value = '';
                        }

                        resolve()

                    }, (error) => {
                        console.log('Failed to update new object, with error code: ' + error.message);
                        //window.location.href = "/setups"
                    })
                    this.loadingSpinner = false
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
                    object.set("dateUnixDay", dayjs(this.setup.dateUnix*1000).tz(this.tradeTimeZone).startOf("day").unix())

                    object.setACL(new Parse.ACL(Parse.User.current()));

                    object.save()
                        .then(async(object) => {
                            console.log(' -> Added new setup with id ' + object.id)
                            if (this.currentPage.id == "addSetup") {
                                window.location.href = "/setups"
                            }
                            if (this.currentPage.id == "daily") {
                                await this.getSetupsEntries(true)
                                const file =
                                    document.querySelector('.screenshotFile');
                                file.value = '';
                            }
                            resolve()


                        }, (error) => {
                            console.log('Failed to create new object, with error code: ' + error.message);
                            //window.location.href = "/setups"
                        });
                    this.loadingSpinner = false

                }
            })
        },

        deleteSetup: async function(param1, param2) {
            console.log("selected item " + this.selectedItem)
            const Object = Parse.Object.extend("setupsEntries");
            const query = new Parse.Query(Object);
            query.equalTo("objectId", this.selectedItem);
            const results = await query.first();

            if (results) {
                await results.destroy()
                    //document.location.reload()
                await this.getPatterns()
                await (this.renderData += 1)
                await this.initPopover()

            } else {
                alert("There was a problem with the query")
            }
        },

    }
}