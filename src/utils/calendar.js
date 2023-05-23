import { renderingCharts, pageId, threeMonthsBack, threeMonthsTrades, filteredTrades, allTrades, selectedMonth, calendarData, miniCalendarsData, timeZoneTrade } from "../stores/globals"
import { useMonthFormat, useFormatBytes } from "./utils"
import { useCheckTradesInIndexedDB, useGetTradesFromDb } from "./trades"


export async function useLoadCalendar(param, param2) {
    console.log("\nLOADING CALENDAR")
    return new Promise(async (resolve, reject) => {
        renderingCharts.value = true
        miniCalendarsData.length = 0

        console.log(" -> Creating calendar")
        const createCalendar = async (param1, param2) => {
            //console.log("param 1 "+param1)
            return new Promise(async (resolve, reject) => {

                if (pageId.value == "calendar") {//If calendar page, we do not take filtered trades as created in trades mixin bu twe need to get all the data for the other months on the calendar page
                console.log("  --> Getting filtered trades for calendar page")
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

                /*
                 * https://github.com/lukeed/calendarize/
                 * calendarize / calendarizeData is where you get the date number for a given month (so 31 days for May for example and if May starts on monday that given year then 1 or if starts on tuesday then 0, 1). the month must be in date format.It does not work with just convert in to timezonetrade. I need a date. And if the local computer is in another timezone it did not work. So i convert with format
                 */
                console.log("  --> Getting days and position of day for given month")
                let dateForCalendarize = new Date(dayjs.unix(param1).tz(timeZoneTrade.value).format("YYYY MM DD"))
                //console.log(" date for calendarize "+dateForCalendarize)
                let calendarizeData = calendarize(dateForCalendarize, 1) // this creates.value calendar date numbers needed for a table calendar
                //console.log("calendarizeData "+calendarizeData)
                
                console.log("  --> Getting trade and creating json for each day of given month")
                let calendarJson = {}
                //let month = dayjs.unix(param1).get('month') + 1 //starts at 0
                let month = dayjs(param1*1000).tz(timeZoneTrade.value).get('month') + 1 //starts at 0 so here we add 1 to get the 'real' month number
                let year = dayjs.unix(param1).get('year')

                calendarizeData.forEach((element, index) => {
                    //console.log("element "+element)
                    calendarJson[index] = []
                    element.forEach((element2) => {
                        // 1- Create a calendar date from each element2 (calendar number)
                        let elementDate = year + "/" + month + "/" + element2
                        //var elementDateUnix = dayjs(elementDate).unix()
                        //console.log("elementDateUnix  "+elementDateUnix)

                        // 2- Create data for each calendar box
                        let tempData = {}
                        tempData.month = useMonthFormat(param1) // day number of the month
                        //console.log("month "+tempData.month)
                        tempData.day = element2 // day number of the month
                        //tempData.dateUnix = elementDateUnix // date in unix

                        //Getting trade that is from the same day
                        let trade = filteredTrades.filter(f => dayjs.unix(f.dateUnix).tz(timeZoneTrade.value).isSame(dayjs.tz(elementDate, timeZoneTrade.value), 'day')) // filter by finding the same day of month between calendar date and unix date in DB
                        console.log(" element 2 "+element2)
                        console.log(" -> Trade " + JSON.stringify(trade))

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

        let currentMonthNumber = dayjs(selectedMonth.value.start * 1000).tz(timeZoneTrade.value).month()
        //let currentMonthNumber = dayjs(selectedMonth.value.start * 1000).month()
        //console.log("currentMonthNumber "+currentMonthNumber)
        let i = 0
        if (pageId.value == 'calendar') {
            while (i <= currentMonthNumber) {
                let tempUnix = dayjs(selectedMonth.value.start * 1000).tz(timeZoneTrade.value).subtract(i, 'month').startOf('month').unix()
                await createCalendar(tempUnix)
                i++
            }
        } else {
            await createCalendar(selectedMonth.value.start)
        }
        //console.log(" -> Mini Cal data "+JSON.stringify(miniCalendarsData.value))

        //console.log("calendarData "+JSON.stringify(calendarData))
        //console.log("miniCalData " + JSON.stringify(miniCalendarsData))
        resolve()
    })

}