const entriesMixin = {
    data() {
        return {
            entrySide: [{
                    value: "SS",
                    label: "Short"
                },
                {
                    value: "B",
                    label: "Buy"
                }
            ],
            editingEntry: false,
            dateEntryEdited: false,
            entry: {}, //this is first time or when load
            entryButton: false,
            entries: [],
            entryIdToEdit: null,
            currentDate: dayjs().format("YYYY-MM-DD THH:mm:ss"),
            entry: {},

        }
    },

    watch: {
        entry: function() {
            //console.log("entry " + JSON.stringify(this.entry))
        }
    },

    methods: {
        getEntries: async function(param) {
            return new Promise(async(resolve, reject) => {
                console.log(" -> Getting entries");
                const Object = Parse.Object.extend("entries");
                const query = new Parse.Query(Object);
                query.equalTo("user", Parse.User.current());
                query.descending("dateUnix");
                query.limit(param ? param : 10000); // limit to at most 10 results
                this.entries = []
                const results = await query.find();
                this.entries = JSON.parse(JSON.stringify(results))
                    //console.log(" -> Entries " + JSON.stringify(this.entries))
                resolve()
            })
        },
        getEntryToEdit: async function(param) {
            if (!param) {
                return
            }
            this.editingEntry = true
            this.entryIdToEdit = param
                //console.log("entry to edit " + this.entryIdToEdit)
            const Object = Parse.Object.extend("entries");
            const query = new Parse.Query(Object);
            query.equalTo("objectId", param);
            const results = await query.first();
            if (results) {
                this.entry = JSON.parse(JSON.stringify(results))

            } else {
                alert("Query did not return any results")
            }
        },

        entryImageUpload(event) {
            console.log("event "+event)
            const file = event.target.files[0];

            /* We convert to base64 so we can read src in markerArea */
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                var base64data = reader.result
                this.entry.originalBase64 = base64data
                this.entry.annotatedBase64 = base64data
                this.entry.extension = base64data.substring(base64data.indexOf('/') + 1, base64data.indexOf(';base64'))
                this.renderData += 1
                //console.log("entry " + JSON.stringify(this.entry))
            }

        },

        entryMarkerArea() {
            //https://github.com/ailon/markerjs2#readme
            let markerAreaId = document.getElementById("entryDiv");

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
                this.entry.annotatedBase64 = imgURL
                this.entry.maState = state
                console.log("state " + JSON.stringify(this.entry.maState))
                this.markerAreaOpen = false
                this.renderData += 1
            })

            markerArea.show();
            if (markerArea.isOpen) {
                this.markerAreaOpen = true
            }

            if (this.entry.maState) {
                markerArea.restoreState(this.entry.maState);
            }
        },

        entryUpdateDate(event) {
            if (this.editingEntry) {
                this.dateEntryEdited = true
            }
            this.entry.date = event
            console.log("entry date (local time, i.e. New York time) " + this.entry.date)
            this.entry.dateUnix = dayjs.tz(this.entry.date, this.tradeTimeZone).unix()
            console.log("unix " + dayjs.tz(this.entry.date, this.tradeTimeZone).unix()) // we SPECIFY that it's New york time
        },

        saveEntry: async function() {
            console.log("\nSAVING ENTRY IMAGE")
            if (this.markerAreaOpen == true) {
                alert("Plaese save your entry annotation")
                return
            }

            this.loadingSpinner = true
            this.loadingSpinnerText = "Uploading entry ..."
            if (!this.editingEntry || (this.editingEntry && this.dateEntryEdited)) {
                this.entry.dateUnix = dayjs.tz(this.entry.date, this.tradeTimeZone).unix() // we SPECIFY that it's New york time
            }
            if (this.editingEntry && !this.dateEntryEdited) {
                //we do nothing
            }

            this.entry.name = "t" + this.entry.dateUnix + "_" + this.entry.symbol + "_" + this.entry.side
            console.log("name " + this.entry.name)
            await this.uploadEntryScreenshotToParse().then()
        },

        uploadEntryScreenshotToParse: async function() {
            return new Promise(async(resolve, reject) => {
                console.log(" -> Uploading to database")
                this.loadingSpinner = true
                this.loadingSpinnerText = "Uploading Screenshot ..."

                /* creating names, recreating files and new parse files */
                const originalName = this.entry.name + "." + this.entry.extension
                const annotatedName = this.entry.name + "." + this.entry.extension

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
                let originalFile = dataURLtoFile(this.entry.originalBase64, originalName);
                const parseOriginalFile = new Parse.File(originalName, originalFile);

                let annotatedFile = dataURLtoFile(this.entry.annotatedBase64, originalName);
                const parseAnnotatedFile = new Parse.File(annotatedName, annotatedFile);

                const Object = Parse.Object.extend("entries");
                const query = new Parse.Query(Object);
                query.equalTo("objectId", this.entry.objectId);

                const results = await query.first();
                //console.log("url orig " + this.entry.originalUrl + " annot " + this.entry.annotatedUrl)
                if (results) {
                    console.log(" -> Updating")
                    parseOriginalFile.save().then(() => {
                        parseAnnotatedFile.save().then(() => {
                            results.set("name", this.entry.name)
                            results.set("symbol", this.entry.symbol)
                            results.set("side", this.entry.side)
                            results.set("original", parseOriginalFile)
                            results.set("annotated", parseAnnotatedFile)
                            results.set("originalBase64", this.entry.originalBase64)
                            results.set("annotatedBase64", this.entry.annotatedBase64)
                            results.set("maState", this.entry.maState)
                            if (this.dateEntryEdited) {
                                results.set("date", new Date(dayjs.tz(this.entry.date, this.tradeTimeZone).format("YYYY-MM-DDTHH:mm:ss")))
                                results.set("dateUnix", Number(this.entry.dateUnix))
                            }
                            results.save().then(() => {
                                console.log(' -> Updated screenshot with id ' + results.id)
                                window.location.href = "/entries"
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
                                    object.set("name", this.entry.name)
                                    object.set("symbol", this.entry.symbol)
                                    object.set("side", this.entry.side)
                                    object.set("original", parseOriginalFile)
                                    object.set("annotated", parseAnnotatedFile)
                                    object.set("originalBase64", this.entry.originalBase64)
                                    object.set("annotatedBase64", this.entry.annotatedBase64)
                                    object.set("maState", this.entry.maState)
                                    object.set("date", new Date(dayjs.tz(this.entry.date, this.tradeTimeZone).format("YYYY-MM-DDTHH:mm:ss")))
                                    object.set("dateUnix", Number(this.entry.dateUnix))

                                    object.setACL(new Parse.ACL(Parse.User.current()));

                                    object.save()
                                        .then((object) => {
                                            console.log(' -> Added new entry with id ' + object.id)
                                            this.loadingSpinner = false
                                            window.location.href = "/entries"

                                        }, (error) => {
                                            console.log('Failed to create new object, with error code: ' + error.message);
                                            //window.location.href = "/entries"
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

        deleteEntry: async function(param1, param2) {
            console.log("selected item "+this.selectedItem)
            const Object = Parse.Object.extend("entries");
            const query = new Parse.Query(Object);
            query.equalTo("objectId", this.selectedItem);
            const results = await query.first();

            if (results){
                await results.destroy()
                //document.location.reload()
                await this.getEntries()
                await (this.renderData += 1)
                await this.initPopover()

            }else{
                alert("There was a problem with the query")
            }
        },


    }
}