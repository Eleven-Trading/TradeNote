const dashboardMixin = {
    methods: {
        totalCalendar: async function(param) {
            console.log("\nLOADING TOTAL CALENDAR")
            this.totalCalendarMounted = false
            var date
            var month
            var year
            var firstDay

            if (param == undefined) {
                console.log(" -> Getting this months calendar")
                date = new Date();
                firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                month = date.getMonth() + 1 //in month number you need to add +1
                year = date.getFullYear()
                console.log("first day " + firstDay)
                this.currentCalendarDate = firstDay
            } else {
                date = new Date(this.currentCalendarDate);
                firstDay = new Date(date.getFullYear(), date.getMonth() + param, 1);
                month = date.getMonth() + 1 + param //in month number you need to add +1
                year = date.getFullYear()
                console.log("first day " + firstDay)
                this.currentCalendarDate = firstDay
            }

            var calendarizeData = calendarize(this.currentCalendarDate, 1)
            console.log(" -> creating calendar data")
            var calendarJson = {}
            var i = 0
            calendarizeData.forEach(element => {
                calendarJson[i] = []
                element.forEach(element => {
                    var elementDate = year + "-" + month + "-" + element
                    var elementDateUnix = dayjs(elementDate).unix()
                        //console.log("dateUnix "+elementDateUnix+" type "+typeof elementDateUnix)
                        //console.log("element date "+year+"-"+month+"-"+element+" and unix "+elementDateUnix)
                    let tempData = {}
                    tempData.day = element
                    tempData.dateUnix = elementDateUnix
                    let trade
                    if (this.threeMonthsBack <= this.selectedRange.start) {
                        trade = this.threeMonthsTrades.filter(f => f.dateUnix == elementDateUnix)
                    } else {
                        trade = this.allTrades.filter(f => f.dateUnix == elementDateUnix)
                    }
                    if (trade.length) {
                        tempData.pAndL = trade[0].pAndL
                            //console.log("trade "+JSON.stringify(trade[0].pAndL))
                    } else {
                        tempData.pAndL = []
                    }
                    calendarJson[i].push(tempData)

                })
                i++
            })
            this.totalCalendarMounted = true
            this.calendarData = calendarJson
                //console.log("cal "+JSON.stringify(calendarJson))

        },

        getDailyInfos:async function() {
            return new Promise(async(resolve, reject) => {
                console.log(" -> Getting Daily Infos");
                const Object = Parse.Object.extend("dailyInfos");
                const query = new Parse.Query(Object);
                query.equalTo("user", Parse.User.current());
                query.descending("dateUnix");
                const results = await query.first();
                this.dailyInfos = JSON.parse(JSON.stringify(results))
                //console.log(" -> cash balance " + this.dailyInfos.cashBalance)
                //console.log(" -> dailyInfos " + JSON.stringify(this.dailyInfos))
                resolve()
            })
        },
    }
}