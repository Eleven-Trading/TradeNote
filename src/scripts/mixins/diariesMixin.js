const diariesMixin = {
    data() {
        return {
            journal: {}, //this is first time or when load
            journalUpdate: {}, //when we update, we need to use another json, or else it was removing .ql-editor for some reason
            journalButton: false,
            journals: [],
            journalIdToEdit: null,
            currentDate: dayjs().format("YYYY-MM-DD"),
            scores: [{
                    value: 0,
                    label: "None"

                },
                {
                    value: 1,
                    label: "Low"

                },
                {
                    value: 2,
                    label: "Medium"

                },
                {
                    value: 3,
                    label: "Good"

                }
            ],
            diaryQueryLimit: 10,
            diaryPagination: 0
        }
    },
    watch: {

    },
    mounted() {
        if (this.currentPage.id == "diary") {
            window.addEventListener('scroll', () => {
                //console.log(window.scrollY) //scrolled from top
                //console.log(window.innerHeight) //visible part of screen
                if (window.scrollY + window.innerHeight >=
                    document.documentElement.scrollHeight) {
                    if (this.currentPage.id == "diary") {
                        console.log(" -> Load new diary entries")
                        this.getJournals()
                    }
                }
            })
        }
    },
    methods: {
        initJournalJson: async function(param) {
            return new Promise(async(resolve, reject) => {

                this.journalUpdate.journal = {}

                resolve()
            })
        },
        journalDateInput: function(param) {
            console.log(" param " + param)
            this.journalUpdate.dateUnix = dayjs.tz(param, this.tradeTimeZone).unix()
            this.journalUpdate.date = dayjs(param, this.tradeTimeZone).format("YYYY-MM-DD")
            this.journalUpdate.dateDateFormat = new Date(dayjs(param, this.tradeTimeZone).format("YYYY-MM-DD"))
                //console.log(" -> journalDateUnix " + this.journalUpdate.dateUnix + " and date " + this.journalUpdate.date)
                //console.log("journalUpdate " + JSON.stringify(this.journalUpdate))
        },
        getJournals: async function(param) {
            return new Promise(async(resolve, reject) => {
                console.log(" -> Getting journals");
                const Object = Parse.Object.extend("journals");
                const query = new Parse.Query(Object);
                query.equalTo("user", Parse.User.current());
                query.descending("dateUnix");
                //query.greaterThanOrEqualTo("dateUnix", this.selectedPeriodRange.start)
                //query.lessThanOrEqualTo("dateUnix", this.selectedPeriodRange.end)
                if (param) { // if "full" false (case for daily page), then only certain limit. Else sull
                    query.greaterThanOrEqualTo("dateUnix", this.selectedMonth.start)
                    query.lessThanOrEqualTo("dateUnix", this.selectedMonth.end)
                } else {
                    query.limit(this.diaryQueryLimit);
                    query.skip(this.diaryPagination)
                }
                const results = await query.find();

                if (this.currentPage.id == "diary") {
                    this.journals = this.journals.concat(JSON.parse(JSON.stringify(results)))
                }else{
                    this.journals = JSON.parse(JSON.stringify(results))
                }
                
                    //console.log(" -> Journals " + JSON.stringify(this.journals))
                this.diaryPagination = this.diaryPagination + this.diaryQueryLimit
                resolve()
            })
        },

        getJournalToEdit: async function(param) {
            if (!param) {
                return
            }
            this.journalIdToEdit = param
                //console.log("journal to edit " + this.journalIdToEdit)
            const Object = Parse.Object.extend("journals");
            const query = new Parse.Query(Object);
            query.equalTo("objectId", param);
            const results = await query.first();
            if (results) {
                this.journal = JSON.parse(JSON.stringify(results)) //we start by using this.journal to show html. Then, for changing, we use this.journalUpdate
                    //console.log(" Journal to edit " + JSON.stringify(this.journal))
            } else {
                alert("Query did not return any results")
            }
        },

        uploadJournal: async function() {

            const Object = Parse.Object.extend("journals");

            const pageRedirect = () => {
                if (this.currentPage.id == "daily") {
                    window.location.href = "/daily"
                }
                if (this.currentPage.id == "addDiary") {
                    window.location.href = "/diary"
                }

            }

            if (this.journalIdToEdit) {
                console.log(" -> Updating journal")
                const query = new Parse.Query(Object);
                query.equalTo("objectId", this.journalIdToEdit);
                const results = await query.first();
                if (results) {
                    results.set("journal", this.journalUpdate.journal)
                    await results.save() //very important to have await or else too quick to update
                    pageRedirect()


                } else {
                    alert("Update query did not return any results")
                }
            } else {
                const query = new Parse.Query(Object);
                query.equalTo("dateUnix", this.journalUpdate.dateUnix);
                const results = await query.first();
                if (results) {
                    alert("Journal with that date already exists")
                    return
                }

                console.log(" -> saving journal")
                const object = new Object();
                object.set("user", Parse.User.current())
                object.set("date", this.journalUpdate.dateDateFormat)
                object.set("dateUnix", this.journalUpdate.dateUnix)
                object.set("journal", this.journalUpdate.journal)
                object.setACL(new Parse.ACL(Parse.User.current()));
                object.save()
                    .then((object) => {
                        console.log(' -> Added new journal with id ' + object.id)
                        pageRedirect()

                    }, (error) => {
                        console.log('Failed to create new object, with error code: ' + error.message);
                    });
            }
        },

        deleteJournal: async function(param1, param2) {
            //console.log("selected item " + this.selectedItem)
            console.log("\nDELETING JOURNAL ENTRY")
            const Object = Parse.Object.extend("journals");
            const query = new Parse.Query(Object);
            query.equalTo("objectId", this.selectedItem);
            const results = await query.first();

            if (results) {
                await results.destroy()
                    //document.location.reload()
                await this.getJournals()
                await (this.renderData += 1)
                await this.initPopover()
                this.selectedItem = null

            } else {
                alert("There was a problem with the query")
            }
        },
    }
}