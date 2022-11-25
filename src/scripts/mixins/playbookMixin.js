const playbookMixin = {
    data() {
        return {
            playbook: {}, //this is first time or when load
            playbookUpdate: {}, //when we update, we need to use another json, or else it was removing .ql-editor for some reason
            playbookButton: false,
            playbooks: [],
            playbookIdToEdit: null,
            currentDate: dayjs().format("YYYY-MM-DD"),
        }
    },
    watch: {

    },
    mounted() {
    },
    methods: {
        playbookDateInput: function(param) {
            //console.log(" param "+param)
            this.playbookUpdate.dateUnix = dayjs.tz(param, this.tradeTimeZone).unix()
            this.playbookUpdate.date = dayjs(param, this.tradeTimeZone).format("YYYY-MM-DD")
            this.playbookUpdate.dateDateFormat = new Date(dayjs(param, this.tradeTimeZone).format("YYYY-MM-DD"))
            console.log(" -> playbookDateUnix " + this.playbookUpdate.dateUnix+" and date "+this.playbookUpdate.date)
        },
        getPlaybooks: async function(param) {
            return new Promise(async(resolve, reject) => {
                console.log(" -> Getting playbooks");
                const Object = Parse.Object.extend("playbooks");
                const query = new Parse.Query(Object);
                query.equalTo("user", Parse.User.current());
                query.descending("dateUnix");
                query.limit(param ? param : 10000); // limit to at most 10 results
                this.playbooks = []
                const results = await query.find();
                this.playbooks = JSON.parse(JSON.stringify(results))
                //console.log(" -> Playbooks " + JSON.stringify(this.playbooks))
                resolve()
            })
        },

        getPlaybookToEdit: async function(param) {
            if (!param) {
                return
            }
            this.playbookIdToEdit = param
            console.log("playbook to edit " + this.playbookIdToEdit)
            const Object = Parse.Object.extend("playbooks");
            const query = new Parse.Query(Object);
            query.equalTo("objectId", param);
            const results = await query.first();
            if (results) {
                this.playbook = JSON.parse(JSON.stringify(results)) //we start by using this.playbook to show html. Then, for changing, we use this.playbookUpdate
                //console.log(" Playbook to edit "+JSON.stringify(this.playbook))
            } else {
                alert("Query did not return any results")
            }
        },

        uploadPlaybook: async function() {
            const Object = Parse.Object.extend("playbooks");

            const pageRedirect = () => {
                if (this.currentPage.id == "addPlaybook") {
                    window.location.href = "/playbook"
                }

            }

            if (this.playbookIdToEdit) {
                console.log(" -> Updating playbook")
                const query = new Parse.Query(Object);
                query.equalTo("objectId", this.playbookIdToEdit);
                const results = await query.first();
                if (results) {
                    results.set("playbook", this.playbookUpdate.playbook)
                    await results.save() //very important to have await or else too quick to update
                    pageRedirect()


                } else {
                    alert("Update query did not return any results")
                }
            } else {
                console.log(" -> Check if playbook already exists")

                const query = new Parse.Query(Object);
                query.equalTo("dateUnix", this.playbookUpdate.dateUnix);
                const results = await query.first();
                if (results) {
                    alert("Playbook with that date already exists")
                    return
                }

                console.log(" -> saving playbook")
                const object = new Object();
                object.set("user", Parse.User.current())
                object.set("date", this.playbookUpdate.dateDateFormat)
                object.set("dateUnix", this.playbookUpdate.dateUnix)
                object.set("playbook", this.playbookUpdate.playbook)
                object.setACL(new Parse.ACL(Parse.User.current()));
                object.save()
                    .then((object) => {
                        console.log(' -> Added new playbook with id ' + object.id)
                        pageRedirect()

                    }, (error) => {
                        console.log('Failed to create new object, with error code: ' + error.message);
                    });
            }
        }
    }
}