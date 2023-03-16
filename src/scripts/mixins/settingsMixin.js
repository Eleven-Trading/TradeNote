const settingsMixin = {
    data() {
        return {
            patternToEdit: null,
            updatePatternName: null,
            updatePatternDescription: null,
            updatePatternActive: null,

            newPatternName: null,
            newPatternDescription: null,

            mistakeToEdit: null,
            updateMistakeName: null,
            updateMistakeDescription: null,
            updateMistakeActive: null,

            newMistakeName: null,
            newMistakeDescription: null,
        }
    },
    watch: {
    },
    methods: {
        editPattern(param) {
            this.patternToEdit = param.objectId
            this.updatePatternName = param.name
            this.updatePatternDescription = param.description
            this.updatePatternActive = param.active
            
            //console.log("patternToEdit " + this.patternToEdit + ", name " + this.updatePatternName + ", desc " + this.updatePatternDescription+" and active "+this.updatePatternActive)
        },

        editMistake(param) {
            this.mistakeToEdit = param.objectId
            this.updateMistakeName = param.name
            this.updateMistakeDescription = param.description
            this.updateMistakeActive = param.active
            
            //console.log("mistakeToEdit " + this.mistakeToEdit + ", name " + this.updateMistakeName + ", desc " + this.updateMistakeDescription+" and active "+this.updateMistakeActive)
        },

        updateEditPattern: async function() {
            console.log("\nUPDATING EDITED PATTERN")
            if (this.updatePatternName == '') {
                alert("Name cannot be empty")
            } else {
                const Object = Parse.Object.extend("patterns");
                const query = new Parse.Query(Object);
                query.equalTo("objectId", this.patternToEdit)
                const results = await query.first();
                if (results) {
                    console.log(" -> Updating pattern")
                    results.set("name", this.updatePatternName)
                    results.set("description", this.updatePatternDescription)
                    results.set("active", this.updatePatternActive)

                    results.save()
                        .then(async() => {
                            console.log(' -> Updated edited pattern with id ' + results.id)
                                //this.spinnerSetupsText = "Updated setup"
                        }, (error) => {
                            alert('Failed to create new object, with error code: ' + error.message);
                        })
                } else {
                    alert("There is no corresponding pattern id")
                }
                await this.getPatterns().then(() => {
                        this.updatePatternName = null
                        this.updatePatternDescription = null
                        this.updatePatternActive = null
                        this.patternToEdit = null
                    })
                    //console.log("Patterns "+JSON.stringify(this.patterns))


            }
        },

        updateEditMistake: async function() {
            console.log("\nUPDATING EDITED MISTAKE")
            if (this.updateMistakeName == '') {
                alert("Name cannot be empty")
            } else {
                const Object = Parse.Object.extend("mistakes");
                const query = new Parse.Query(Object);
                query.equalTo("objectId", this.mistakeToEdit)
                const results = await query.first();
                if (results) {
                    console.log(" -> Updating mistake")
                    results.set("name", this.updateMistakeName)
                    results.set("description", this.updateMistakeDescription)
                    results.set("active", this.updateMistakeActive)

                    results.save()
                        .then(async() => {
                            console.log(' -> Updated edited mistake with id ' + results.id)
                                //this.spinnerSetupsText = "Updated setup"
                        }, (error) => {
                            alert('Failed to create new object, with error code: ' + error.message);
                        })
                } else {
                    alert("There is no corresponding mistake id")
                }
                await this.getMistakes().then(() => {
                        this.updateMistakeName = null
                        this.updateMistakeDescription = null
                        this.updateMistakeActive = null
                        this.mistakeToEdit = null
                    })
                    //console.log("Mistakes "+JSON.stringify(this.mistakes))


            }
        },

        saveNewPattern: async function() {
            console.log(" -> \n SAVING NEW PATTERN")
            if (this.newPatternName == '' ||  this.newPatternName == null) {
                alert("Name cannot be empty")
            } else {
                const Object = Parse.Object.extend("patterns");
                const object = new Object();
                object.set("user", Parse.User.current())
                object.set("name", this.newPatternName)
                object.set("description", this.newPatternDescription)
                object.set("active", true)
                object.setACL(new Parse.ACL(Parse.User.current()));
                object.save()
                    .then(async (object) => {
                        console.log(' -> Added new pattern with id ' + object.id)
                        await this.getPatterns()
                    }, (error) => {
                        console.log('Failed to create new object, with error code: ' + error.message);
                    });
                this.newPatternName = null
                this.newPatternDescription = null
            }
        },

        saveNewMistake: async function() {
            console.log(" -> \n SAVING NEW MISTAKE")
            if (this.newMistakeName == '' ||  this.newMistakeName == null) {
                alert("Name cannot be empty")
            } else {
                const Object = Parse.Object.extend("mistakes");
                const object = new Object();
                object.set("user", Parse.User.current())
                object.set("name", this.newMistakeName)
                object.set("description", this.newMistakeDescription)
                object.set("active", true)
                object.setACL(new Parse.ACL(Parse.User.current()));
                object.save()
                    .then(async (object) => {
                        console.log(' -> Added new mistake with id ' + object.id)
                        await this.getMistakes()
                    }, (error) => {
                        console.log('Failed to create new object, with error code: ' + error.message);
                    });
                this.newMistakeName = null
                this.newMistakeDescription = null
            }
        }
    }
}