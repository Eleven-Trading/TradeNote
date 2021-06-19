const playbookMixin = {
    methods: {

        getPlaybook: async function() {
            console.log("GETTING PLAYBOOK")
            this.loadingSpinner = true
            this.loadingSpinnerText = "Getting Playbook ..."

            const Object = Parse.Object.extend("playbooks");
            const query = new Parse.Query(Object);
            query.equalTo("user", Parse.User.current());
            const results = await query.find();
            //console.log("results " + JSON.stringify(results))
            if (results.length == 0) {
                console.log(" -> No playbook")
                this.playbookImg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSIxcHgiIGhlaWdodD0iMXB4IiB2aWV3Qm94PSItMC41IC0wLjUgMSAxIiBjb250ZW50PSImbHQ7bXhmaWxlIGV0YWc9JnF1b3Q7eWRSQ21fLXhIbGNYZTZqSk9qcTAmcXVvdDsgYWdlbnQ9JnF1b3Q7NS4wIChNYWNpbnRvc2g7IEludGVsIE1hYyBPUyBYIDEwXzE1XzcpIEFwcGxlV2ViS2l0LzUzNy4zNiAoS0hUTUwsIGxpa2UgR2Vja28pIENocm9tZS85MC4wLjQ0MzAuNzIgU2FmYXJpLzUzNy4zNiZxdW90OyBtb2RpZmllZD0mcXVvdDsyMDIxLTA0LTI1VDEzOjQ2OjU4LjQ1N1omcXVvdDsgaG9zdD0mcXVvdDtlbWJlZC5kaWFncmFtcy5uZXQmcXVvdDsgdmVyc2lvbj0mcXVvdDsxNC42LjYmcXVvdDsgdHlwZT0mcXVvdDtlbWJlZCZxdW90OyZndDsmbHQ7ZGlhZ3JhbSBpZD0mcXVvdDtyVXV4dm1hbWROWjF6ckxYT2xfNiZxdW90OyBuYW1lPSZxdW90O1BhZ2UtMSZxdW90OyZndDtsZEc5RG9Jd0VBRGdwK2xvMGg4MHJBWlJGNDJSd2NTdG9iVTBLUndwTmFCUEw0WWlOaXc2OWZyMWV0Y2Z4Skt5MjFsZUZ3Y1EwaUNLUllmWUJsRktDSW43NFMwUEwxRzhHa1JaTGJ4TmtPbW45SWk5M3JXUVRaRG9BSXpUZFlnNVZKWE1YV0RjV21qRHRCdVlzR3ZObFp4QmxuTXoxNHNXcmhnMFh1TEo5MUtyWXV4TXNGOHArWmpzb1NtNGdQYUxXSXBZWWdIY0VKVmRJczM3OWNaM09aTFRKcUxzdktpdU9GZDBuVjZWWGd6RnR2OXMrVnpCeXNyOVdyb1BwcVAxaytDSFdmb0MmbHQ7L2RpYWdyYW0mZ3Q7Jmx0Oy9teGZpbGUmZ3Q7Ij48ZGVmcy8+PGcvPjwvc3ZnPg=="
                this.loadingSpinner = false
            }
            for (let i = 0; i < results.length; i++) {
                const object = results[i];
                var svgURL = object.get('playbook')
                console.log(" -> Converting to base64")
                const getBase64FromUrl = async(url) => {
                    const data = await fetch(url);
                    const blob = await data.blob();
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(blob);
                        reader.onloadend = () => {
                            const base64data = reader.result;
                            resolve(base64data);
                        }
                    });
                }
                getBase64FromUrl(svgURL).then((value) => {
                    this.playbookImg = value
                    this.loadingSpinner = false
                })
            }
        },

        /* Listen to src changes */
        playbookImgChange: async function() {
            $('#playbookImg').on('load', async() => {
                var imgSrc = $('#playbookImg').attr('src')
                    //console.log("before " + this.playbookImg)
                if (imgSrc != this.playbookImg) {
                    this.playbookImg = imgSrc
                    this.savePlaybookImg()
                }
            });
        },

        savePlaybookImg: async function() {
            console.log("\nSAVING PLAYBOOK IMAGE")
            this.loadingSpinner = true
            this.loadingSpinnerText = "Uploading playbook ..."

            await this.uploadToBucket()
            await this.uploadToParse()
                //await this.saveToIndexedDb

        },

        uploadToBucket: async function() {
            return new Promise((resolve, reject) => {
                console.log(" -> Uploading to bucket")
                this.loadingSpinnerText = "Uploading to bucket ..."

                var urlBase = this.apiBaseUrl
                var url = urlBase + this.apiEndPoint
                var fileName = Parse.User.current().id + ".svg"
                axios
                    .post(url, {
                        source: "playbook",
                        subFolder: "tradenote/" + Parse.User.current().id + "/playbook",
                        user: Parse.User.current().id,
                        fileName: fileName,
                        fileType: "image/svg+xml"
                    })
                    .then(async(response) => {
                        console.log(" -> Retrieved temp URL")
                        const config = {
                            headers: {
                                'Content-Type': "image/svg+xml"
                            },
                            onUploadProgress: (event) => {
                                var uploadPercentCompleted = Math.round((event.loaded * 100) / event.total)
                                this.loadingSpinnerText = "Uploading to bucket (" + uploadPercentCompleted + "%)..."
                            }
                        }
                        var preSignedUrl = response.data
                        console.log(" -> Converting to blob")
                        const base64Response = await fetch(this.playbookImg)
                        const blob = await base64Response.blob();
                        axios
                            .put(preSignedUrl, blob, config)
                            .then(response => {
                                console.log(" -> Upload status " + response.status)
                                var publicBaseUrl = this.publicBaseUrlB2
                                this.playbookImgB2Url = publicBaseUrl + "" + Parse.User.current().id + "/playbook/" + fileName
                                    //console.log(" -> Public url " + this.playbookImgB2Url)
                                this.loadingSpinnerText = "Playbook saved. Now uploading rest of data to database ..."
                                resolve()
                            }).catch(e => {
                                console.log(" -> Error uploading video to " + e)
                                this.loadingSpinner = false
                            })
                    })
                    .catch(e => {
                        console.log(" -> Error getting temp URL " + e)
                        this.loadingSpinner = false
                    })
            })
        },

        uploadToParse: async function() {
            console.log(" -> Uploading to database")
            this.loadingSpinner = true
            this.loadingSpinnerText = "Uploading Playbook ..."

            const Object = Parse.Object.extend("playbooks");
            const query = new Parse.Query(Object);
            query.equalTo("user", Parse.User.current());

            const results = await query.first();
            if (results) {
                console.log(" -> Updating")
                results.set("user", Parse.User.current())
                results.set("playbook", this.playbookImgB2Url)

                results.setACL(new Parse.ACL(Parse.User.current()));
                results.save()
                console.log(' -> Updated playbook with id ' + results.id)
                this.loadingSpinner = false
            } else {
                console.log(" -> Saving")
                const object = new Object();
                object.set("user", Parse.User.current())
                object.set("playbook", this.playbookImgB2Url)

                object.setACL(new Parse.ACL(Parse.User.current()));

                object.save()
                    .then((object) => {
                        console.log(' -> Added new playbook with id ' + object.id)
                        this.loadingSpinner = false

                    }, (error) => {
                        console.log('Failed to create new object, with error code: ' + error.message);
                    });
            }
        }

    }
}