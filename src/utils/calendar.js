import { renderingCharts, pageId, threeMonthsBack, threeMonthsTrades, filteredTrades, allTrades, selectedMonth, calendarData, miniCalendarsData, timeZoneTrade } from "../stores/globals"
import { useMonthFormat, useFormatBytes } from "./utils"
import { useCheckTradesInIndexedDB, useGetTradesFromDb } from "./trades"


export async function useLoadCalendar(param, param2) {
    console.log("\nLOADING CALENDAR")
    return new Promise(async (resolve, reject) => {
        renderingCharts.value = true
        miniCalendarsData.length = 0
        let currentMonthNumber = dayjs(selectedMonth.value.start * 1000).tz(timeZoneTrade.value).month()
        let maxTempUnix = dayjs(selectedMonth.value.start * 1000).tz(timeZoneTrade.value).subtract(currentMonthNumber, 'month').startOf('month').unix()

        if (pageId.value == "calendar") {
            if (!filteredTrades.length > 0) {
                let dataExistsInIndexedDB = await useCheckTradesInIndexedDB(0)
                if (!dataExistsInIndexedDB) {
                    await useGetTradesFromDb(0)
                }
                filteredTrades.length = 0
                //console.log(" all trades "+JSON.stringify(allTrades))
                console.log("    ----> foreach trades")
                allTrades.forEach(element => {
                    if (element.dateUnix >= maxTempUnix) {
                        let temp = {}
                        temp.dateUnix = element.dateUnix
                        temp.pAndL = element.pAndL
                        temp.satisfaction = element.satisfaction
                        filteredTrades.push(temp)
                    }
                });
            }
            console.log(" -> filteredTrades "+JSON.stringify(filteredTrades))
        }
        console.log(" -> Creating calendar")
        const createCalendar = async (param1, param2) => {
            console.log("param 1 " + param1)


                /*if (pageId.value == "calendar") {//If calendar page, we do not take filtered trades as created in trades mixin bu twe need to get all the data for the other months on the calendar page
                    console.log("  --> Getting filtered trades for calendar page")
                    //console.log("threeMonthsTrades "+JSON.stringify(threeMonthsTrades))
                    //console.log("threeMonthsBack "+threeMonthsBack.value)
                    if (threeMonthsBack.value <= param1) {
                        console.log("   ---> threeMonths getting filtereed trades")
                        if (threeMonthsTrades.length > 0) {
                            console.log("    ----> foreach trades")
                            filteredTrades.length = 0
                            threeMonthsTrades.forEach(element => {
                                filteredTrades.push(element)
                            });
                        } else {
                            console.log(" -> Need to check trades in IndexedDB")
                            let dataExistsInIndexedDB = await useCheckTradesInIndexedDB(6)
                            console.log(" -> Daily - threeMonthsBack size in indexedDB: " + useFormatBytes(new Blob([JSON.stringify(threeMonthsTrades)]).size))
                            if (!dataExistsInIndexedDB) {
                                await useGetTradesFromDb(6)
                            }
                            filteredTrades.length = 0
                            console.log("    ----> foreach trades")
                            threeMonthsTrades.forEach(element => {
                                filteredTrades.push(element)
                            });
                        }
                    } else { // getting rest of trades
                        console.log("   ---> All getting filtereed trades")
                        if (allTrades.length > 0) {
                            filteredTrades.length = 0
                            console.log("    ----> foreach trades")
                            allTrades.forEach(element => {
                                if (element.dateUnix >= maxTempUnix && element.dateUnix < threeTempUnix) {
                                    filteredTrades.push(element)
                                }
                            });
                        } else {
                            let dataExistsInIndexedDB = await useCheckTradesInIndexedDB(0)
                            if (!dataExistsInIndexedDB) {
                                await useGetTradesFromDb(0)
                            }
                            filteredTrades.length = 0
                            //console.log(" all trades "+JSON.stringify(allTrades))
                            console.log("    ----> foreach trades")
                            allTrades.forEach(element => {
                                if (element.dateUnix >= maxTempUnix && element.dateUnix < threeTempUnix) {
                                    filteredTrades.push(element)
                                }
                            });
                        }
                    }
                }*/
                //console.log("filtered trades "+JSON.stringify(filteredTrades))
                /*
                 * https://github.com/lukeed/calendarize/
                 * calendarize / calendarizeData is where you get the date number for a given month (so 31 days for May for example and if May starts on monday that given year then 1 or if starts on tuesday then 0, 1). the month must be in date format.It does not work with just convert in to timezonetrade. I need a date. And if the local computer is in another timezone it did not work. So i convert with format
                 */
                console.log("  --> Getting days and position of day for given month")
                let dateForCalendarize = new Date(dayjs.unix(param1).tz(timeZoneTrade.value).format("YYYY MM DD"))
                //console.log(" date for calendarize "+dateForCalendarize)
                let calendarizeData = calendarize(dateForCalendarize, 1) // this creates.value calendar date numbers needed for a table calendar
                console.log("calendarizeData "+calendarizeData)

                console.log("  --> Getting trade and creating json for each day of given month")
                let calendarJson = {}
                //let month = dayjs.unix(param1).get('month') + 1 //starts at 0
                let month = dayjs(param1 * 1000).tz(timeZoneTrade.value).get('month') + 1 //starts at 0 so here we add 1 to get the 'real' month number
                let year = dayjs.unix(param1).get('year')
                console.log(" -> start")
                for (let index1 = 0; index1 < calendarizeData.length; index1++) {
                    console.log("element "+calendarizeData[index1])
                    calendarJson[index1] = []
                    for (let index = 0; index < calendarizeData[index1].length; index++) {
                        const element2 = calendarizeData[index1][index];
                         //console.log(" -> start")
                        console.log("element 2 "+element2)
                        // 1- Create a calendar date from each element2 (calendar number)
                        let elementDate = year + "/" + month + "/" + element2

                        // 2- Create data for each calendar box
                        let tempData = {}
                        tempData.month = useMonthFormat(param1) // day number of the month
                        tempData.day = element2 // day number of the month

                        //Getting trade that is from the same day
                        //console.log("filtering")
                        //console.log("length "+filteredTrades.length)
                        let trade
                        for (let i = 0; i < filteredTrades.length; i++) {
                            if (dayjs.unix(filteredTrades[i].dateUnix).tz(timeZoneTrade.value).isSame(dayjs.tz(elementDate, timeZoneTrade.value), 'day')){
                                //console.log("same")
                                trade = filteredTrades[i]
                            }
                            
                        }
                        //console.log(" -> trade "+JSON.stringify(trade))
                        //let trade = filteredTrades.filter(f => dayjs.unix(f.dateUnix).tz(timeZoneTrade.value).isSame(dayjs.tz(elementDate, timeZoneTrade.value), 'day')) // filter by finding the same day of month between calendar date and unix date in DB
                        //console.log("filtering")
                        //console.log(" trade lenght "+Object.keys(trade).length)
                        if (trade != undefined && Object.keys(trade).length != 0 && element2 != 0) { //Check also if not null because day in date cannot be 0
                            tempData.pAndL = trade.pAndL
                            tempData.satisfaction = trade.satisfaction
                        } else {
                            tempData.pAndL = []
                        }
                        //console.log("tempData "+JSON.stringify(tempData))
                        calendarJson[index1].push(tempData)
                        //console.log(" -> finish")
                    }
                    
                }
                if (param1 == selectedMonth.value.start) {
                    for (let key in calendarData) delete calendarData[key]
                    Object.assign(calendarData, calendarJson)
                    //console.log("calendarData "+JSON.stringify(calendarData.value))
                } else {
                    miniCalendarsData.unshift(calendarJson)
                }
                console.log("resolve")
              
        }

        
        //let currentMonthNumber = dayjs(selectedMonth.value.start * 1000).month()
        //console.log("currentMonthNumber "+currentMonthNumber)
        let i = 0
        
        let threeTempUnix = dayjs(selectedMonth.value.start * 1000).tz(timeZoneTrade.value).subtract(2, 'month').startOf('month').unix()

        if (pageId.value == 'calendar') {
            for (let index = 0; index <= currentMonthNumber; index++) {
                let tempUnix = dayjs(selectedMonth.value.start * 1000).tz(timeZoneTrade.value).subtract(index, 'month').startOf('month').unix()
                createCalendar(tempUnix)
                
            }
        } else {
            createCalendar(selectedMonth.value.start)
        }
        //console.log(" -> Mini Cal data "+JSON.stringify(miniCalendarsData.value))

        //console.log("calendarData "+JSON.stringify(calendarData))
        //console.log("miniCalData " + JSON.stringify(miniCalendarsData))
        //console.log("resolve")
        resolve()
    })

}