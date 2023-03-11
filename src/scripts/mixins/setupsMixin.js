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
            console.log("setup " + JSON.stringify(this.setup))
        }
    },
    mounted: async function() {
        window.addEventListener('scroll', () => {
            //console.log(window.scrollY) //scrolled from top
            //console.log(window.innerHeight) //visible part of screen
            if (window.scrollY + window.innerHeight >=
                document.documentElement.scrollHeight) {
                console.log(" -> Load new images")
                this.getSetupsEntries()
            }
        })
    },
    methods: {
        getSetupsEntries: async function() {
            return new Promise(async(resolve, reject) => {
                console.log(" -> Getting Setups and entries");
                console.log(" -> setupsEntriesPagination "+this.setupsEntriesPagination);
                const Object = Parse.Object.extend("setupsEntries");
                const query = new Parse.Query(Object);
                query.equalTo("user", Parse.User.current());
                query.descending("dateUnix");
                query.limit(this.setupsEntriesQueryLimit);
                query.skip(this.setupsEntriesPagination)
                //this.setups = []
                const results = await query.find();
                this.setups = this.setups.concat(JSON.parse(JSON.stringify(results)))
                    //console.log(" -> Setups " + JSON.stringify(this.setups))
                this.setupsEntriesPagination = this.setupsEntriesPagination + this.setupsEntriesQueryLimit
                console.log(" -> setupsEntriesPagination "+this.setupsEntriesPagination);
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

        setupImageUpload: async function(event) {
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
                console.log("state " + JSON.stringify(this.setup.maState))
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
            console.log("setup date (local time, i.e. New York time) " + this.setup.date)
            this.setup.dateUnix = dayjs.tz(this.setup.date, this.tradeTimeZone).unix()
            console.log("unix " + dayjs.tz(this.setup.date, this.tradeTimeZone).unix()) // we SPECIFY that it's New york time
        },

        saveSetup: async function() {
            console.log("\nSAVING SETUP IMAGE")
            if (this.markerAreaOpen == true) {
                alert("Plaese save your setup annotation")
                return
            }

            this.loadingSpinner = true
            this.loadingSpinnerText = "Uploading setup ..."

            if (!this.editingSetup || (this.editingSetup && this.dateSetupEdited)) {
                this.setup.dateUnix = dayjs.tz(this.setup.date, this.tradeTimeZone).unix()
            }
            if (this.editingSetup && !this.dateSetupEdited) {
                //we do nothing
            }

            //extension is created during setupImageUpload. So when edit, must create it here before upload
            if (this.editingSetup) {
                this.setup.extension = this.setup.originalBase64.substring(this.setup.originalBase64.indexOf('/') + 1, this.setup.originalBase64.indexOf(';base64'))
            }

            //console.log(" -> dateUnix " + this.setup.dateUnix)

            this.setup.name = this.setup.dateUnix + "_" + this.setup.symbol
            console.log("name " + this.setup.name)
            await this.uploadSetupScreenshotToParse().then()
        },

        uploadSetupScreenshotToParse: async function() {
            return new Promise(async(resolve, reject) => {
                console.log(" -> Uploading to database")
                this.loadingSpinner = true
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
                    parseOriginalFile.save().then(() => {
                        parseAnnotatedFile.save().then(() => {
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
                            }
                            results.save().then(() => {
                                console.log(' -> Updated screenshot with id ' + results.id)
                                window.location.href = "/setups"
                            })
                        })
                    })

                    this.loadingSpinner = false
                } else {
                    console.log(" -> Saving")

                    parseOriginalFile.save().then(() => {
                            parseAnnotatedFile.save().then(() => {
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

                                    object.setACL(new Parse.ACL(Parse.User.current()));

                                    object.save()
                                        .then((object) => {
                                            console.log(' -> Added new setup with id ' + object.id)
                                            this.loadingSpinner = false
                                            window.location.href = "/setups"

                                        }, (error) => {
                                            console.log('Failed to create new object, with error code: ' + error.message);
                                            //window.location.href = "/setups"
                                        });
                                })
                                .catch((error) => {
                                    console.log("parse annotated file " + error)
                                })
                        })
                        .catch((error) => {
                            console.log("parse original file " + error)
                        })
                }
                resolve()
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