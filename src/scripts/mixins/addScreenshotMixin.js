const addScreenshotMixin = {
    methods: {
        getScreenshots: async function() {
            const Object = Parse.Object.extend("screenshots");
            const query = new Parse.Query(Object);
            query.equalTo("user", Parse.User.current());
            query.descending("createdAt");
            query.limit(1000000); // limit to at most 10 results
            const results = await query.find();
            // Do something with the returned Parse.Object values
            for (let i = 0; i < results.length; i++) {
                var temp = {}
                const object = results[i];
                temp.annotated = object.get('annotated')
                temp.comment = object.get('comment')
                temp.tags = object.get('tags')
                this.screenshots.push(temp)
            }
        },

        imageUpload(event) {
            const file = event.target.files[0];

            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                var base64data = reader.result
                this.screenshot.original = base64data
                this.screenshot.annotated = base64data
                this.screenshot.extension = base64data.substring(base64data.indexOf('/') + 1, base64data.indexOf(';base64'))
                this.renderData += 1
                    //console.log("original "+this.screenshot.original)
            }

        },

        markerArea() {
            //https://github.com/ailon/markerjs2#readme
            let markerAreaId = document.getElementById("screenshotDiv");

            const markerArea = new markerjs2.MarkerArea(markerAreaId);
            markerArea.availableMarkerTypes = markerArea.ALL_MARKER_TYPES;
            markerArea.renderAtNaturalSize = true;
            markerArea.renderImageQuality = 1;
            markerArea.settings.defaultColor = "white"

            markerArea.targetRoot = markerAreaId.parentElement
            markerArea.addRenderEventListener((imgURL, state) => {
                console.log("state "+JSON.stringify(state))
                this.screenshot.annotated = imgURL
                this.maState = state
                this.markerAreaOpen = false
                this.renderData += 1
            })

            markerArea.show();
            if (markerArea.isOpen){
                this.markerAreaOpen = true
            }

            if (this.maState) {
                markerArea.restoreState(this.maState);
            }
        },

        saveScreenshot: async function() {
            console.log("\nSAVING SCREENSHOT IMAGE")            
            if (this.markerAreaOpen == true){
                alert("Plaese save your screenshot annotation")
                return
            }
            
            this.loadingSpinner = true
            this.loadingSpinnerText = "Uploading screenshot ..."
            var unix = dayjs().unix()
            this.screenshot.name = Parse.User.current().id + "-" + unix //the is the generic screenshot name
            await this.uploadScreenshotToBucket({
                image: this.screenshot.original,
                version: "original",
            })
            await this.uploadScreenshotToBucket({
                image: this.screenshot.annotated,
                version: "annotated"
            })
            await this.uploadScreenshotToParse()
        },

        uploadScreenshotToBucket: async function(param) {
            return new Promise((resolve, reject) => {
                console.log(" -> Uploading to bucket")
                this.loadingSpinnerText = "Uploading to bucket ..."
                var urlBase = this.apiBaseUrl
                var url = urlBase + this.apiEndPoint
                var subFolderCat = "screenshots"
                var subFolder = "tradenote/" + Parse.User.current().id + "/" + subFolderCat

                console.log(" -> Saving " + param.version + " image")
                var fileName = this.screenshot.name + "-" + param.version + "." + this.screenshot.extension // Name of the file/image, composed of generic screenshot name + other params
                //console.log("file name " + fileName)
                axios
                    .post(url, {
                        source: "playbook",
                        subFolder: subFolder,
                        user: Parse.User.current().id,
                        fileName: fileName
                    })
                    .then(async(response) => {
                        console.log(" -> Retrieved temp URL")
                        const config = {
                            headers: {
                                'Content-Type': "image/" + this.screenshot.extension
                            },
                            onUploadProgress: (event) => {
                                var uploadPercentCompleted = Math.round((event.loaded * 100) / event.total)
                                this.loadingSpinnerText = "Uploading to bucket (" + uploadPercentCompleted + "%)..."
                            }
                        }
                        var preSignedUrl = response.data
                        //console.log("presigned url " + preSignedUrl)

                        console.log(" -> Converting to blob")
                        const base64Response = await fetch(param.image)
                        const blob = await base64Response.blob();
                        console.log(" -> Uploading image")
                        await axios
                            .put(preSignedUrl, blob, config)
                            .then(response => {
                                console.log(" -> Upload status " + response.status)
                                var publicBaseUrl = this.publicBaseUrlB2
                                var publicUrl = publicBaseUrl + "" + Parse.User.current().id + "/screenshots/" + fileName
                                //console.log("public url " + publicUrl)
                                if (param.version == "original") {
                                    this.screenshot.originalUrl = publicUrl
                                    console.log("url or " + this.screenshot.originalUrl + " annot " + this.screenshot.annotatedUrl)

                                }
                                if (param.version == "annotated") {
                                    this.screenshot.annotatedUrl = publicUrl
                                    //console.log("url or " + this.screenshot.originalUrl + " annot " + this.screenshot.annotatedUrl)
                                }
                                //console.log(" -> Public url " + this.playbookImgB2Url)
                                this.loadingSpinnerText = "Screenshot " + param.version + " saved"
                                resolve()
                            }).catch(e => {
                                console.log(" -> Error uploading screenshot to bucket " + e)
                                this.loadingSpinner = false
                            })
                    })
                    .catch(e => {
                        console.log(" -> Error getting temp aws URL " + e)
                        this.loadingSpinner = false
                    })
            })
        },

        uploadScreenshotToParse: async function() {
            console.log(" -> Uploading to database")
            this.loadingSpinner = true
            this.loadingSpinnerText = "Uploading Screenshot ..."

            const Object = Parse.Object.extend("screenshots");
            const query = new Parse.Query(Object);
            query.equalTo("screenshotName", this.screenshot.name);

            const results = await query.first();
            console.log("url or " + this.screenshot.originalUrl + " annot " + this.screenshot.annotatedUrl)
            if (results) {
                console.log(" -> Updating")
                results.set("original", this.screenshot.originalUrl)
                results.set("annotated", this.screenshot.annotatedUrl)
                results.set("comment", this.screenshot.comment)
                results.set("tags", this.screenshot.tags)

                results.save()
                console.log(' -> Updated screenshot with id ' + results.id)
                this.loadingSpinner = false
            } else {
                console.log(" -> Saving")
                const object = new Object();
                object.set("user", Parse.User.current())
                object.set("name", this.screenshot.name)
                object.set("original", this.screenshot.originalUrl)
                object.set("annotated", this.screenshot.annotatedUrl)
                object.set("comment", this.screenshot.comment)
                object.set("tags", this.screenshot.tags)

                object.setACL(new Parse.ACL(Parse.User.current()));

                object.save()
                    .then((object) => {
                        console.log(' -> Added new screenshot with id ' + object.id)
                        this.loadingSpinner = false
                            //window.location.href = "/screenshots"

                    }, (error) => {
                        console.log('Failed to create new object, with error code: ' + error.message);
                    });
            }
            window.location.href = "/screenshots"
        }

        /* const Object = Parse.Object.extend("screenshots");

            var parseFile = new Parse.File("screenshot", { base64: this.screenshot.annotated })
            const object = new Object();

            object.set("user", Parse.User.current())
            object.set("image", parseFile)
            object.set("comment", this.screenshot.comment)
            object.set("tags", this.screenshot.tags)

            object.setACL(new Parse.ACL(Parse.User.current()));

            object.save()
                .then((object) => {

                    // Execute any logic that should take place after the object is saved.
                    console.log(' -> Added new screenshot with id ' + object.id)
                    window.location.href = "/screenshots"

                }, (error) => {
                    // Execute any logic that should take place if the save fails.
                    // error is a Parse.Error with an error code and message.
                    console.log('Failed to create new object, with error code: ' + error.message);
                });
                
        }*/
    }
}