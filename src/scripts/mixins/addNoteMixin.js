const addNoteMixin = {
    mounted() {

    },
    methods: {
        noteInput(e) {
            this.note = e.target.innerHTML
                //console.log("note  "+this.note)
        },
        getNoteToEdit: async function(param) {
            if (!param) {
                return
            }
            const Object = Parse.Object.extend("notes");
            const query = new Parse.Query(Object);
            query.equalTo("objectId", param);
            const results = await query.first();
            if (results) {
                this.note.id = results.id
                this.note.note = results.get('note')
                this.renderData += 1
            } else {
                alert("Query did not return any results")
            }
        },

        uploadNote: async function() {
            if (this.note == null) {
                alert("Please enter a note")
                return
            }
            const Object = Parse.Object.extend("notes");
            if (this.note.id) {
                console.log(" -> Updating note")
                const query = new Parse.Query(Object);
                query.equalTo("objectId", this.note.id);
                const results = await query.first();
                if (results) {
                    results.set("note", this.note.note)
                    results.save().then(window.location.href = "/notes")
                    //console.log(' -> Updated new note with id ' + results.id)
                } else {
                    alert("Update query did not return any results")
                }
            } else {
                console.log(" -> saving note")
                const object = new Object();
                object.set("user", Parse.User.current())
                object.set("note", this.note.note)
                object.setACL(new Parse.ACL(Parse.User.current()));
                object.save()
                    .then((object) => {
                        console.log(' -> Added new note with id ' + object.id)
                        window.location.href = "/notes"

                    }, (error) => {
                        console.log('Failed to create new object, with error code: ' + error.message);
                    });
            }
        }
    }
}