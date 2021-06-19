const notesMixin = {
    methods: {
        getNotes: async function() {
            console.log("\nGETTING ALL NOTES")
            const Object = Parse.Object.extend("notes");
            const query = new Parse.Query(Object);
            query.equalTo("user", Parse.User.current());
            query.descending("createdAt");
            const results = await query.find();
            this.notes = []
            for (let i = 0; i < results.length; i++) {
                var temp = {}
                const object = results[i];
                temp.id = object.id
                temp.note = object.get('note')
                temp.date = object.get('createdAt')
                this.notes.push(temp)
            }
        },
        deleteNote: async function() {
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
        }
    }
}