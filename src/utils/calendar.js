import { renderingCharts, pageId, threeMonthsBack, threeMonthsTrades, filteredTrades, allTrades, selectedMonth, calendarData, miniCalendarsData, tradeTimeZone } from "../stores/globals"
import { useMonthFormat, useFormatBytes } from "./utils"
import { useCheckTradesInIndexedDB, useGetTradesFromDb } from "./trades"


export async function useLoadCalendar(param, param2) {
    console.log("\nLOADING CALENDAR")
    return new Promise(async (resolve, reject) => {
        renderingCharts.value = true
        miniCalendarsData.length = 0

        console.log(" -> Creating calendar dates")
        const createCalendar = async (param1, param2) => {
            //console.log("param 1 "+param1)
            return new Promise(async (resolve, reject) => {
                let dateForCalendarize = new Date(param1 * 1000) // as per docs https://github.com/lukeed/calendarize/, calendarize casts to date so Instead of using string I have to use date or else used the node / user timezone instead of the timezone set in param 1 earlier 
                //console.log(" date for calendarize "+dateForCalendarize)
                let calendarizeData = calendarize(dateForCalendarize, 1) // this creates.value calendar date numbers needed for a table calendar
                //console.log("calendarizeData "+calendarizeData)
                let calendarJson = {}
                let month = dayjs.unix(param1).get('month') + 1 //starts at 0
                let year = dayjs.unix(param1).get('year')

                if (pageId.value == "calendar") {//If calendar page, we do not take filtered trades as created in trades mixin bu twe need to get all the data for the other months on the calendar page
                    if (threeMonthsBack.value <= param1) {
                        if (threeMonthsTrades.length > 0) {
                            filteredTrades.length = 0
                            threeMonthsTrades.forEach(element => {
                                filteredTrades.push(element)
                            });
                        } else {
                            console.log(" -> Checking tradese in IndexedDB")
                            let dataExistsInIndexedDB = await useCheckTradesInIndexedDB(6)
                            console.log(" -> Daily - threeMonthsBack size in indexedDB: " + useFormatBytes(new Blob([JSON.stringify(threeMonthsTrades)]).size))
                            if (!dataExistsInIndexedDB) {
                                await useGetTradesFromDb(6)
                            }
                            filteredTrades.length = 0
                            threeMonthsTrades.forEach(element => {
                                filteredTrades.push(element)
                            });
                        }
                    } else {
                        if (allTrades.length > 0) {
                            filteredTrades.length = 0
                            allTrades.forEach(element => {
                                filteredTrades.push(element)
                            });
                        } else {
                            let dataExistsInIndexedDB = await useCheckTradesInIndexedDB(0)
                            if (!dataExistsInIndexedDB) {
                                await useGetTradesFromDb(0)
                            }
                            filteredTrades.length = 0
                            //console.log(" all trades "+JSON.stringify(allTrades))
                            allTrades.forEach(element => {
                                filteredTrades.push(element)
                            });
                        }
                    }
                }

                calendarizeData.forEach((element, index) => {
                    //console.log("element "+element)
                    calendarJson[index] = []
                    element.forEach((element2) => {
                        // 1- Create a calendar date from each element2 (calendar number)
                        var elementDate = year + "/" + month + "/" + element2
                        var elementDateUnix = dayjs(elementDate).unix()
                        //console.log("element2  "+element2)

                        // 2- Create data for each calendar box
                        let tempData = {}
                        tempData.month = useMonthFormat(param1) // day number of the month
                        //console.log("month "+tempData.month)
                        tempData.day = element2 // day number of the month
                        tempData.dateUnix = elementDateUnix // date in unix

                        //Using allTrades and not filteredTrades because we do not want calendar to be filtered
                        //console.log("selectedRange "+param1.start)

                        let trade = filteredTrades.filter(f => dayjs.unix(f.dateUnix).isSame(dayjs.unix(elementDateUnix), 'day')) // filter by finding the same day of month between calendar date and unix date in DB
                        //console.log(" -> Trade " + JSON.stringify(trade))

                        if (trade.length && element2 != 0) { //Check also if not null because day in date cannot be 0
                            tempData.pAndL = trade[0].pAndL
                            tempData.satisfaction = trade[0].satisfaction
                        } else {
                            tempData.pAndL = []
                        }
                        //console.log("tempData "+JSON.stringify(tempData))
                        calendarJson[index].push(tempData)

                    })

                })
                if (param1 == selectedMonth.value.start) {
                    for (let key in calendarData) delete calendarData[key]
                    Object.assign(calendarData, calendarJson)
                    //console.log("calendarData "+JSON.stringify(calendarData.value))
                } else {
                    miniCalendarsData.unshift(calendarJson)
                }

                resolve()
            })
        }

        console.log(" -> Creating calendar")
        let currentMonthNumber = dayjs(selectedMonth.value.start * 1000).month()
        let i = 0
        if (pageId.value == 'calendar') {
            while (i <= currentMonthNumber) {
                let tempUnix = dayjs.tz(selectedMonth.value.start * 1000, tradeTimeZone.value).subtract(i, 'month').startOf('month').unix()
                await createCalendar(tempUnix)
                i++
            }
        } else {
            await createCalendar(selectedMonth.value.start)
        }
        /*await createCalendar("full", selectedMonth.value.start)
        await createCalendar("mini", dayjs.tz(selectedMonth.value.start * 1000, tradeTimeZone.value).subtract(1, 'month').startOf('month').unix())
        await createCalendar("mini", dayjs.tz(selectedMonth.value.start * 1000, tradeTimeZone.value).subtract(2, 'month').startOf('month').unix())*/
        //console.log(" -> Mini Cal data "+JSON.stringify(miniCalendarsData.value))

        //console.log("calendarData "+JSON.stringify(calendarData))
        //console.log("miniCalData " + JSON.stringify(miniCalendarsData))
        resolve()
    })

}