import { renderingCharts, pageId, filteredTrades, selectedMonth, calendarData, miniCalendarsData, timeZoneTrade, filteredTradesDaily } from "../stores/globals.js"
import { useMonthFormat } from "./utils.js"
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
dayjs.extend(utc)
import isoWeek from 'dayjs/plugin/isoWeek.js'
dayjs.extend(isoWeek)
import timezone from 'dayjs/plugin/timezone.js'
dayjs.extend(timezone)
import duration from 'dayjs/plugin/duration.js'
dayjs.extend(duration)
import updateLocale from 'dayjs/plugin/updateLocale.js'
dayjs.extend(updateLocale)
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
dayjs.extend(localizedFormat)
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
dayjs.extend(customParseFormat)
import calendarize from 'calendarize';

export async function useLoadCalendar() {
    console.log("\nLOADING CALENDAR")
    return new Promise(async (resolve, reject) => {
        renderingCharts.value = true
        miniCalendarsData.length = 0
        let currentMonthNumber = dayjs(selectedMonth.value.start * 1000).tz(timeZoneTrade.value).month()
        let tradesArray = []
        if(pageId.value == "daily"){
            tradesArray = filteredTradesDaily
        }else{
            tradesArray = filteredTrades
        }

        const createCalendar = async (param1, param2) => {
            //console.log(" -> Creating calendar for "+useMonthFormat(param1))
            //console.log("param 1 " + param1)

             /* https://github.com/lukeed/calendarize/
             * calendarize / calendarizeData is where you get the date number for a given month (so 31 days for May for example and if May starts on monday that given year then 1 or if starts on tuesday then 0, 1). the month must be in date format.It does not work with just convert in to timezonetrade. I need a date. And if the local computer is in another timezone it did not work. So i convert with format
             */
            //console.log("  --> Getting days and position of day for given month")
            //console.log("date "+dayJsDate)
            let dateForCalendarize = new Date(dayjs.unix(param1)).toLocaleString("en-US", {timeZone: timeZoneTrade.value})
            //console.log(" date for calendarize "+dateForCalendarize)
            let calendarizeData = calendarize(dateForCalendarize, 1) // this creates.value calendar date numbers needed for a table calendar
            //console.log("calendarizeData "+calendarizeData)

            //console.log("  --> Getting trade and creating json for each day of given month")
            let calendarJson = {}
            //let month = dayjs.unix(param1).get('month') + 1 //starts at 0
            let month = dayjs(param1 * 1000).tz(timeZoneTrade.value).get('month') + 1 //starts at 0 so here we add 1 to get the 'real' month number
            let year = dayjs(param1 * 1000).tz(timeZoneTrade.value).get('year')
            //console.log("month "+month)
            //console.log("Yerar  "+year)
            for (let index1 = 0; index1 < calendarizeData.length; index1++) {
                let element = calendarizeData[index1]
                //console.log("element "+element)
                calendarJson[index1] = []
                for (let index = 0; index < element.length; index++) {
                    const element2 = calendarizeData[index1][index];
                    //console.log(" -> start")
                    //console.log("element 2 "+element2)
                    // 1- Create a calendar date from each element2 (calendar number)
                    let elementDate = year + "/" + month + "/" + element2

                    // 2- Create data for each calendar box
                    let tempData = {}
                    tempData.month = useMonthFormat(param1) // day number of the month
                    tempData.day = element2 // day number of the month

                    //Getting trade that is from the same day
                    //console.log("filtering")
                    //console.log("length "+tradesArray.length)
                    //console.log("filteredTrade "+JSON.stringify(tradesArray))
                    let trade
                    for (let i = 0; i < tradesArray.length; i++) {
                        let element = tradesArray[i]
                        if (Number(element.date) == Number(element2) && (Number(element.month) + 1 == Number(month)) && Number(element.year) == Number(year)) {
                            trade = element
                        }
                    }
                    //console.log("trade "+JSON.stringify(trade))

                    if (trade != undefined && Object.keys(trade).length != 0 && element2 != 0) { //Check also if not null because day in date cannot be 0
                        //console.log("pAndL "+JSON.stringify(trade.pAndL))
                        tempData.pAndL = trade.pAndL
                        tempData.satisfaction = trade.satisfaction
                    } else {
                        tempData.pAndL = []
                    }
                    //console.log("tempData "+JSON.stringify(tempData))
                    calendarJson[index1].push(tempData)

                }

            }
            //console.log("param1 "+param1+" and selected month "+selectedMonth.value.start)
            if (param1 == selectedMonth.value.start) {
                for (let key in calendarData) delete calendarData[key]
                Object.assign(calendarData, calendarJson)
                //console.log("calendarData "+JSON.stringify(calendarData))
            } else {
                miniCalendarsData.unshift(calendarJson)
            }


        }


        //let currentMonthNumber = dayjs(selectedMonth.value.start * 1000).month()
        //console.log("currentMonthNumber "+currentMonthNumber)

        if (pageId.value == 'calendar') {
            let i = 0
            if (pageId.value == 'calendar') {
                while (i <= currentMonthNumber) {
                    let tempUnix = dayjs(selectedMonth.value.start * 1000).tz(timeZoneTrade.value).subtract(i, 'month').startOf('month').unix()
                    //this.calendarMonths.push(this.monthFormat(tempUnix))
                    //console.log("tempUnix "+tempUnix)
                    createCalendar(tempUnix)
                    i++
                }
            }
        } else {
            //console.log(" creating from selected month "+selectedMonth.value.start)
            createCalendar(selectedMonth.value.start)
        }
        //console.log(" -> Mini Cal data "+JSON.stringify(miniCalendarsData.value))

        //console.log("calendarData "+JSON.stringify(calendarData))
        //console.log("miniCalData " + JSON.stringify(miniCalendarsData))
        //console.log("resolve")
        resolve()
    })

}