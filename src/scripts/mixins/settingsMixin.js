const settingsMixin = {
    methods: {
        getPatterns: async function() {
            console.log("\nGETTING ALL PATTERNS AND ENTRYPOINTS")
            const Object = Parse.Object.extend("patterns")
            const query = new Parse.Query(Object)
            query.equalTo("user", Parse.User.current())
            query.include("entrypoints")
            query.ascending("order");
            const results = await query.find();
            const Object2 = Parse.Object.extend("mistakes")
            const query2 = new Parse.Query(Object2)
            query2.equalTo("user", Parse.User.current())
            const results2 = await query2.find();

            for (let i = 0; i < results.length; i++) {
                var temp = {}
                const object = results[i];
                temp.id = object.id
                temp.name = object.get('name')
                temp.description = object.get('description')
                temp.entrypoints = []
                object.get('entrypoints').forEach(element => {
                    var elementObject = JSON.parse(JSON.stringify(element))
                    var temp2 = {}
                    temp2.id = element.id
                    temp2.name = elementObject.name
                    temp2.description = elementObject.description
                    temp.entrypoints.push(temp2)
                });
                this.patternsEntrypoints.push(temp)
            }
            for (let i = 0; i < results2.length; i++) {
                var temp = {}
                const object = results2[i];
                temp.id = object.id
                temp.name = object.get('name')
                temp.description = object.get('description')
                this.mistakes.push(temp)
            }
            //console.log("patternsEntrypoints "+JSON.stringify(this.patternsEntrypoints))
            //console.log("mistakes "+JSON.stringify(this.mistakes))
            //this.patternsEntrypoints = JSON.parse(JSON.stringify(results))
        },

        uploadSetup: async function() {
            console.log("setup to add " + JSON.stringify(this.setup))
            const Object = Parse.Object.extend("patterns");
            const Object2 = Parse.Object.extend("entrypoints");

            const object = new Object();
            object.set("user", Parse.User.current())
            object.set("name", this.setup.patternName)
            object.set("description", this.setup.patternDescription)
            object.setACL(new Parse.ACL(Parse.User.current()));

            const object2 = new Object2();
            object2.set("user", Parse.User.current())
            object2.set("name", this.setup.entrypointName)
            object2.set("description", this.setup.entrypointDescription)
            object2.setACL(new Parse.ACL(Parse.User.current()));

            object.set("entrypoints", [object2])

            object.save()
                .then((object) => {
                    console.log(' -> Added new object ' + JSON.stringify(object))
                        //const relation = object.relation("entrypoints");
                        //relation.add(object2);

                }, (error) => {
                    console.log('Failed to create new object, with error code: ' + error.message);
                });
        },

        /*deleteNote: async function() {
            const Object = Parse.Object.extend("notes");
            const query = new Parse.Query(Object);
            query.equalTo("objectId", this.selectedItem);
            const results = await query.first();

            if (results){
                await results.destroy()
                //document.location.reload()
                await this.getNotes()
                await (this.renderData += 1)
                
            }else{
                alert("There was a problem with the query")
            }
        }*/
    }
}