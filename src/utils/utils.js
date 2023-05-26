import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { pageId, timeZoneTrade, patterns, mistakes, currentUser, periodRange, selectedDashTab, renderData, patternsMistakes, indexedOpenRequest, indexedDBVersion, indexedDB, tradeSetup, tradeSetupDateUnixDay, tradeSetupId, tradeSetupDateUnix, tradeSetupChanged, indexedDBtoUpdate, spinnerSetups, spinnerSetupsText, selectedPeriodRange, selectedPositions, selectedTimeFrame, selectedRatio, selectedAccount, selectedGrossNet, selectedPlSatisfaction, selectedBroker, selectedDateRange, selectedMonth, selectedAccounts, amountCase, amountCapital, stepper, screenshotsPagination, diaryUpdate, diaryButton, selectedItem, playbookUpdate, playbookButton, sideMenuMobileOut, timeZones, spinnerLoadingPage, dashboardChartsMounted, dashboardIdMounted, hasData, renderingCharts, threeMonthsBack } from "../stores/globals"
import { useECharts, useRenderDoubleLineChart, useRenderPieChart } from './charts';
import { useDeleteDiary, useGetDiaries } from "./diary";
import { useDeleteScreenshot, useGetScreenshots } from '../utils/screenshots'
import { useDeletePlaybook } from "./playbooks";
import { useCalculateProfitAnalysis, useGetFilteredTrades, usePrepareTrades } from "./trades";
import { useLoadCalendar } from "./calendar";
import { useGetExcursions, useGetSatisfactions } from "./daily";
import { useGetPatternsMistakes } from "./patternsMistakes";

/**************************************
* INITS
**************************************/

export function useInitTab(param) {
    let idCurrent
    let idPrevious
    let hideCurrentTab = false
    let idCurrentType
    let idCurrentNumber
    let idPreviousType
    let idPreviousNumber
    let htmlIdCurrent
    let htmlIdPrevious
    let firstTimeClick

    var triggerTabList = [].slice.call(document.querySelectorAll('#nav-tab button'))
    //console.log("trigger tab list "+triggerTabList)
    var self = // is.value needed or else could not call function inside eventlistener

        console.log("\nINIT TAB for " + param)

    triggerTabList.forEach((triggerEl) => {
        //console.log("triggerEl "+triggerEl)
        /*var tabTrigger = new bootstrap.Tab(triggerEl)
        triggerEl.addEventListener('click', function(event) {
            console.log("clicking")
            //event.preventDefault()
            //tabTrigger.show()
        })*/
        if (param == "dashboard") {
            // GET TAB ID THAT IS CLICKED
            //console.log(" -> triggerTabList Dashboard")
            triggerEl.addEventListener('shown.bs.tab', async (event) => {
                //console.log("target " + event.target.getAttribute('id')) // newly activated tab
                selectedDashTab.value = event.target.getAttribute('id')
                //console.log("selected tab " + selectedDashTab.value)
                localStorage.setItem('selectedDashTab', event.target.getAttribute('id'))
                //self.getAllTrades(false)
                await (renderData.value += 1)
                await useECharts("init")
                //console.log("related" + event.relatedTarget) // previous active tab
            })
        }

        if (param == "daily") {
            // GET TAB ID THAT IS CLICKED

            //console.log(" -> triggerTabList Daily")

            triggerEl.addEventListener('click', (event) => {
                //console.log(" click")

                if (idCurrent != undefined) idPrevious = idCurrent // in case it's not on page load and we already are clicking on tabs, then inform that the previsous clicked tab (wich is for the moment current) should now become previous

                idCurrent = event.target.getAttribute('id')

                if (idPrevious == undefined) {
                    firstTimeClick = true
                    idPrevious = idCurrent //on page load, first time we click
                    hideCurrentTab = !hideCurrentTab // is.value counter intuitive but because further down we toggle hidCurrentTab, i need to toggle here if its first time click on load or else down there it would be hide true the first time. So here we set true so that further down, on first time click on page load it becomes false

                }

                //console.log(" -> id Current: " + idCurrent + " and previous: " + idPrevious)

                idCurrentType = idCurrent.split('-')[0]
                idCurrentNumber = idCurrent.split('-')[1]
                idPreviousType = idPrevious.split('-')[0]
                idPreviousNumber = idPrevious.split('-')[1]
                htmlIdCurrent = "#" + idCurrentType + "Nav-" + idCurrentNumber
                htmlIdPrevious = "#" + idPreviousType + "Nav-" + idPreviousNumber

                if (idCurrent == idPrevious) {

                    hideCurrentTab = !hideCurrentTab

                    //console.log(" hide tab ? " + hideCurrentTab)



                    if (hideCurrentTab) { //hide content

                        $(htmlIdCurrent).removeClass('show')
                        $(htmlIdCurrent).removeClass('active')
                        $("#" + idCurrent).removeClass('active')
                    } else { //show content
                        $(htmlIdCurrent).addClass('show')
                        $(htmlIdCurrent).addClass('active')
                        $("#" + idCurrent).addClass('active')
                    }



                } else {
                    hideCurrentTab = false
                    // in case.value, we have click on another tab so we need to "reset" the previsous tab 
                    $(htmlIdPrevious).removeClass('show')
                    $(htmlIdPrevious).removeClass('active')
                    $("#" + idPrevious).removeClass('active')
                }

            })
        }
    })


}

export function useInitParse() {
    return new Promise(async (resolve, reject) => {
        console.log("\nINITIATING PARSE")
        let path = window.location.pathname
        let parse_app_id = localStorage.getItem('parse_app_id') ? localStorage.getItem('parse_app_id') : "";
        let parse_url = "/parse"
        console.log(" -> Parse id " + parse_app_id)

        Parse.initialize(parse_app_id)
        Parse.serverURL = parse_url

        if ((parse_app_id == "") && path != "/" && path != "/register") window.location.replace("/")
        if (parse_app_id != "") await useCheckCurrentUser()
        resolve()
    })
}

export function useCheckCurrentUser() {
    console.log("\nCHECKING CURRENT USER")
    return new Promise((resolve, reject) => {
        var path = window.location.pathname
        getCurrentUser()
        //console.log(" -> parse user " + JSON.parse(JSON.stringify(Parse.User.current())))
        //console.log(" -> Current user " + JSON.stringify(currentUser.value))
        if (path != "/" && path != "/register") {
            if (currentUser.value) {
                //console.log("Your are logged in " + JSON.stringify(currentUser.value) + " and id " + Parse.User.current().id)
            } else {
                window.location.replace("/");
            }
        }
        if (path == "/" || path == "/register") {
            if (currentUser.value) {
                window.location.replace("/dashboard");
            } else {
                console.log("Your are not logged")
            }
        }
        resolve()
    })

}

export function getCurrentUser() {
    currentUser.value = JSON.parse(JSON.stringify(Parse.User.current()))
}

export function useGetTimeZone() {
    //console.log("Getting timezone")
    timeZoneTrade.value = currentUser.value.hasOwnProperty("timeZone") ? currentUser.value.timeZone : 'America/New_York'
    console.log(" -> TimeZone for Trades: " + timeZoneTrade.value)
}

export function useGetPeriods() {
    let temp = [{
        value: "all",
        label: "All",
        start: 0,
        end: 0
    }, {
        value: "thisWeek",
        label: "This Week",
        start: Number(dayjs().tz(timeZoneTrade.value).startOf('week').add(1, 'day').unix()), // we need to transform as number because later it's stringified and this becomes date format and note unix format
        end: Number(dayjs().tz(timeZoneTrade.value).endOf('week').add(1, 'day').unix())
    }, {
        value: "lastWeek",
        label: "Last Week",
        start: Number(dayjs().tz(timeZoneTrade.value).subtract(1, 'week').startOf('week').add(1, 'day').unix()),
        end: Number(dayjs().tz(timeZoneTrade.value).subtract(1, 'week').endOf('week').add(1, 'day').unix())
    }, {
        value: "lastWeekTilNow",
        label: "Last Week Until Now",
        start: Number(dayjs().tz(timeZoneTrade.value).subtract(1, 'week').startOf('week').add(1, 'day').unix()),
        end: Number(dayjs().tz(timeZoneTrade.value).endOf('week').add(1, 'day').unix())
    }, {
        value: "lastTwoWeeks",
        label: "Last Two Weeks",
        start: Number(dayjs().tz(timeZoneTrade.value).subtract(2, 'week').startOf('week').add(1, 'day').unix()),
        end: Number(dayjs().tz(timeZoneTrade.value).subtract(1, 'week').endOf('week').add(1, 'day').unix())
    }, {
        value: "lastTwoWeeksTilNow",
        label: "Last Two Weeks Until Now",
        start: Number(dayjs().tz(timeZoneTrade.value).subtract(2, 'week').startOf('week').add(1, 'day').unix()),
        end: Number(dayjs().tz(timeZoneTrade.value).endOf('week').add(1, 'day').unix())
    }, {
        value: "thisMonth",
        label: "This Month",
        start: Number(dayjs().tz(timeZoneTrade.value).startOf('month').unix()),
        end: Number(dayjs().tz(timeZoneTrade.value).endOf('month').unix())
    }, {
        value: "lastMonth",
        label: "Last Month",
        start: Number(dayjs().tz(timeZoneTrade.value).subtract(1, 'month').startOf('month').unix()),
        end: Number(dayjs().tz(timeZoneTrade.value).subtract(1, 'month').endOf('month').unix())
    }, {
        value: "lastMonthTilNow",
        label: "Last Month Until Now",
        start: Number(dayjs().tz(timeZoneTrade.value).subtract(1, 'month').startOf('month').unix()),
        end: Number(dayjs().tz(timeZoneTrade.value).endOf('month').unix())
    }, {
        value: "lastTwoMonths",
        label: "Last Two Months",
        start: Number(dayjs().tz(timeZoneTrade.value).subtract(2, 'month').startOf('month').unix()),
        end: Number(dayjs().tz(timeZoneTrade.value).subtract(1, 'month').endOf('month').unix())
    }, {
        value: "lastTwoMonthsTilNow",
        label: "Last Two Months Until Now",
        start: Number(dayjs().tz(timeZoneTrade.value).subtract(2, 'month').startOf('month').unix()),
        end: Number(dayjs().tz(timeZoneTrade.value).endOf('month').unix())
    }, {
        value: "lastThreeMonths",
        label: "Last Three Months",
        start: Number(dayjs().tz(timeZoneTrade.value).subtract(3, 'month').startOf('month').unix()),
        end: Number(dayjs().tz(timeZoneTrade.value).subtract(1, 'month').endOf('month').unix())
    }, {
        value: "lastThreeMonthsTilNow",
        label: "Last Three Months Until Now",
        start: Number(dayjs().tz(timeZoneTrade.value).subtract(3, 'month').startOf('month').unix()),
        end: Number(dayjs().tz(timeZoneTrade.value).endOf('month').unix())
    }, {
        value: "thisYear",
        label: "This Year",
        start: Number(dayjs().tz(timeZoneTrade.value).startOf('year').unix()),
        end: Number(dayjs().tz(timeZoneTrade.value).endOf('year').unix())
    }, {
        value: "lastYear",

        label: "Last Year",
        start: Number(dayjs().tz(timeZoneTrade.value).subtract(1, 'year').startOf('year').unix()),
        end: Number(dayjs().tz(timeZoneTrade.value).subtract(1, 'year').endOf('year').unix())
    }, {
        value: "custom",
        label: "Custom",
        start: -1,
        end: -1
    }]
    periodRange.length = 0
    temp.forEach(element => {
        periodRange.push(element)
    });
    threeMonthsBack.value = periodRange.filter(obj => obj.value == "lastThreeMonthsTilNow")[0].start
}

export function useInitShepherd() {
    const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
            classes: 'tour-guide',
            scrollTo: true,
            useModalOverlay: true,
            /*when: {
                show() {
                    const currentStepElement = shepherd.currentStep.el;
                    const header = currentStepElement.querySelector('.shepherd-header');
                    const progress = document.createElement('span');
                    progress.style['margin-right'] = '15px';
                    progress.innerText = `${shepherd.steps.indexOf(shepherd.currentStep) + 1}/${shepherd.steps.length}`;
                    header.insertBefore(progress, currentStepElement.querySelector('.shepherd-cancel-icon'));
                }
            }*/
        }
    });

    tour.addSteps([{
        id: 'step1',
        text: 'Welcome onboard. guided.value tutorial will show you how TradeNote works.',
        buttons: [{
            text: 'Exit',
            action: tour.complete,
            classes: 'exitButton'
        }, {
            text: 'Next',
            action: tour.next
        }]
    }, {
        id: 'step2',
        text: "In the side menu, you can navigate all TradeNote pages.",
        attachTo: {
            element: '#step2',
            on: 'right-start'
        },
        buttons: [{
            text: 'Exit',
            action: tour.complete,
            classes: 'exitButton'
        },
        {
            text: 'Back',
            action: tour.back
        },
        {
            text: 'Next',
            action: tour.next
        }
        ],
        popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, 15] } }]
        }
    },
    {
        id: 'step3',
        text: 'The dashboard shows all your main metrics.',
        attachTo: {
            element: '#step3',
            on: 'right'
        },
        buttons: [{
            text: 'Exit',
            action: tour.complete,
            classes: 'exitButton'
        }, {
            text: 'Back',
            action: tour.back
        },
        {
            text: 'Next',
            action: tour.next
        }
        ]
    },
    {
        id: 'step4',
        text: 'Calendar displays a calendar view of your daily trades.',
        attachTo: {
            element: '#step4',
            on: 'right'
        },
        buttons: [{
            text: 'Exit',
            action: tour.complete,
            classes: 'exitButton'
        }, {
            text: 'Back',
            action: tour.back
        },
        {
            text: 'Next',
            action: tour.next
        }
        ]
    },
    {
        id: 'step5',
        text: '<p>Daily shows a detailed view of trades per day.</p><p>For each day, there is a tab where you can see your daily diary entry (see below), all your trades and a blotter of your trades per symbol.</p><p>For each trade, you can click on the line to add a note per trade, a pattern and a mistake. Currently, patterns and mistakes must be first added manually in the Parse Dashboard.</p>',
        attachTo: {
            element: '#step5',
            on: 'right'
        },
        buttons: [{
            text: 'Exit',
            action: tour.complete,
            classes: 'exitButton'
        }, {
            text: 'Back',
            action: tour.back
        },
        {
            text: 'Next',
            action: tour.next
        }
        ]
    },
    {
        id: 'step6',
        text: 'Diary is where you can see and edit your daily entries.',
        attachTo: {
            element: '#step6',
            on: 'right'
        },
        buttons: [{
            text: 'Exit',
            action: tour.complete,
            classes: 'exitButton'
        }, {
            text: 'Back',
            action: tour.back
        },
        {
            text: 'Next',
            action: tour.next
        }
        ],
        popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, 15] } }]
        }
    },
    {
        id: 'step7',
        text: 'Screenshots: show all your screenshots of setups and entries.',
        attachTo: {
            element: '#step7',
            on: 'right'
        },
        buttons: [{
            text: 'Exit',
            action: tour.complete,
            classes: 'exitButton'
        }, {
            text: 'Back',
            action: tour.back
        },
        {
            text: 'Next',
            action: tour.next
        }
        ]
    },
    {
        id: 'step8',
        text: 'Playbook is where you can see and edit your (yearly) playbook.',
        attachTo: {
            element: '#step8',
            on: 'right'
        },
        buttons: [{
            text: 'Exit',
            action: tour.complete,
            classes: 'exitButton'
        }, {
            text: 'Back',
            action: tour.back
        },
        {
            text: 'Next',
            action: tour.next
        }
        ]
    },
    {
        id: 'step9',
        text: 'Forecast displays your estimated P&L (experimental feature).',
        attachTo: {
            element: '#step9',
            on: 'right'
        },
        buttons: [{
            text: 'Exit',
            action: tour.complete,
            classes: 'exitButton'
        }, {
            text: 'Back',
            action: tour.back
        },
        {
            text: 'Next',
            action: tour.next
        }
        ],
        popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, 15] } }]
        }
    },
    {
        id: 'step10',
        text: "<p>You can filter your trades per date, account, gross vs net (excluding or including fees and commissions) and position (long and/or short).</p><p>You can also decide to aggregate data per day, week or year.</p><p>On certain graphs, you can decide to see data as Average Profit Per Trade (APPT), Average Profit Per Share Per Trade (APPSPT) or as profit factor.</p><p><b>In order to see you trades, please make sure you have chosen the right date range and that you have chosen at least one account and position type.</b></p>",
        attachTo: {
            element: '#step10',
            on: 'bottom'
        },
        buttons: [{
            text: 'Exit',
            action: tour.complete,
            classes: 'exitButton'
        }, {
            text: 'Back',
            action: tour.back
        },
        {
            text: 'Next',
            action: tour.next
        }
        ],
        popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, 15] } }]
        }
    },
    {
        id: 'step11',
        text: "<p>Click here to add trades, diary entries, screenshots or playbooks.</p><p>Trades is used for importing trades from your Broker's csv or excel file.</p><p>Diary is where you can write your daily thoughts and progress.</p><p>Setups lets you add a screenshot of an interesting setup or of your entry (you need to add entry time in case.value). In both cases, you can annotate the screenshot with drawings, notes and more.</p><p>Playbook is where you can write your (yearly) playbook.</p>",
        attachTo: {
            element: '#step11',
            on: 'bottom'
        },
        buttons: [{
            text: 'Exit',
            action: tour.complete,
            classes: 'exitButton'
        }, {
            text: 'Back',
            action: tour.back
        },
        {
            text: 'Next',
            action: tour.next
        }
        ],
        popperOptions: {
            modifiers: [{ name: 'offset', options: { offset: [0, 15] } }]
        }
    },
    {
        id: 'step12',
        text: "That's it. You are now ready to use TradeNote. You can come back to tutorial.value at any time by clicking 'Tutorial' in the sub-menu here.",
        attachTo: {
            element: '#step12',
            on: 'bottom'
        },
        buttons: [{
            text: 'Back',
            action: tour.back
        },
        {
            text: 'Done',
            action: tour.complete
        }
        ]
    }

    ])

    tour.start();

    Shepherd.on("complete", async () => {
        console.log("Tour complete")
        const parseObject = Parse.Object.extend("User");
        const query = new Parse.Query(parseObject);
        query.equalTo("objectId", currentUser.value.objectId);
        const results = await query.first();
        if (results) {
            await results.set("guidedTour", true)
            results.save().then(() => {
                console.log(" -> Updated user")
            })
        } else {
            console.log("  --> Could not find user. is.value a problem")
        }

    })

}

export async function useInitQuill(param) {
    return new Promise((resolve, reject) => {
        //console.log("param " + param)
        let quillEditor
        if (param != undefined) {
            quillEditor = '#quillEditor' + param
        } else {
            quillEditor = '#quillEditor'
        }
        //console.log("quilEditor " + quillEditor)
        let quill = new Quill(quillEditor, {
            theme: 'snow'
        });
        quill.root.setAttribute('spellcheck', true)
        //console.log("quill " + quill)

        quill.on('text-change', () => {
            if (pageId.value == "addScreenshot") {
                setupUpdate.value.checkList = document.querySelector(".ql-editor").innerHTML
                //console.log("setup " + JSON.stringify(setupUpdate.value))
            }

            if (pageId.value == "addDiary") {
                let elements = document.querySelectorAll(".ql-editor");
                elements.forEach((input, index) => {
                    if (index == 0) {
                        diaryUpdate.journal.positive = input.innerHTML
                    }
                    if (index == 1) {
                        diaryUpdate.journal.negative = input.innerHTML
                    }
                    if (index == 2) {
                        diaryUpdate.journal.other = input.innerHTML
                    }
                })
                //console.log(" -> diaryUpdate " + JSON.stringify(diaryUpdate))
                diaryButton.value = true
            }

            if (pageId.value == "addPlaybook") {
                playbookUpdate.playbook = document.querySelector(".ql-editor").innerHTML
                playbookButton.value = true
            }
        });
        resolve()
    })
}

export function useInitStepper() {
    stepper.value = new Stepper(document.querySelector('#addStepper'), {
        animation: true
    })
}

let i = 1
export async function useInitIndexedDB() {
    return new Promise((resolve, reject) => {
        console.log("\nINITIATING INDEXEDDB")
        /*window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
            IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction*/

        // Create/open database
        indexedOpenRequest.value = window.indexedDB.open("tradeNote", indexedDBVersion.value);

        indexedOpenRequest.value.onupgradeneeded = () => {
            //console.log("onupgradeneeded")
            // triggers if the client had no database
            // ...perform initialization...
            indexedDB.value = indexedOpenRequest.value.result;
            if (!indexedDB.value.objectStoreNames.contains('videos')) {
                console.log("creating videos object store in tradeNote")
                indexedDB.value.createObjectStore('videos', { keyPath: 'id' })
            }
            if (!indexedDB.value.objectStoreNames.contains('trades')) {
                console.log("creating trades object store in tradeNote")
                indexedDB.value.createObjectStore('trades', { keyPath: 'id' })
            }
        };

        indexedOpenRequest.value.onerror = () => {
            console.error("Error", indexedOpenRequest.value.error);
            resolve()
        };

        indexedOpenRequest.value.onsuccess = () => {
            indexedDB.value = indexedOpenRequest.value.result;
            //console.log(" -> indexedDB "+JSON.stringify(indexedDB.value))
            resolve()

        };
    })
}

export function useInitWheelEvent() {
    var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
    var mouseDirection
    if (document.attachEvent) //if IE (and Opera depending on user setting)
        document.attachEvent("on" + mousewheelevt, e => {
            //console.log('IE Case wheel  ' + e.wheelDelta)
            if (e.wheelDelta > 0) {
                mouseDirection = "forward"
            } else {
                mouseDirection = "backward"
            }
            videoSkip.value(mouseDirection)
        })
    else if (document.addEventListener) //WC3 browsers
        document.addEventListener(mousewheelevt, e => {
            //console.log('WC3 case Mouse ' + e.wheelDelta)
            if (e.wheelDelta > 0) {
                mouseDirection = "forward"
                //console.log('Moving wheel ' + mouseDirection)
            } else {
                mouseDirection = "backward"
                //console.log('Moving wheel ' + mouseDirection)
            }
            videoSkip.value(mouseDirection)
        }, false)
}

export function useInitPopover() {
    console.log(" -> Init Popover")
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl)
    })
    var popDel
    $(document).on('click', '.popoverDelete', (e) => {
        popDel = $(e.currentTarget);
        $('.popoverDelete').not(popDel.popover('hide'));
        //console.log(""+JSON.stringify($)
    });

    $(document).on('click', '.popoverYes', (e) => {
        $('.popoverDelete').not(popDel.popover('hide'));
        if (pageId.value == "notes") {
            deleteNote.value()
        }
        if (pageId.value == "screenshots") {
            useDeleteScreenshot()
        }
        if (pageId.value == "diary") {
            useDeleteDiary(true)
        }
        if (pageId.value == "playbook") {
            useDeletePlaybook()
        }
    });

    $(document).on('click', '.popoverNo', (e) => {
        $('.popoverDelete').not(popDel.popover('hide'));
        selectedItem.value = null
    });

}

/**************************************
* MOUNT 
**************************************/
export async function useMountDashboard() {
    console.log("\MOUNTING DASHBOARD")
    console.time("  --> Duration mount dashboard");
    await useInitIndexedDB()

    spinnerLoadingPage.value = true
    dashboardChartsMounted.value = false
    dashboardIdMounted.value = false
    await useGetPatternsMistakes()
    await useGetFilteredTrades()
    await usePrepareTrades()
    await useCalculateProfitAnalysis()
    await (spinnerLoadingPage.value = false)
    await (dashboardIdMounted.value = true)
    useInitTab("dashboard")
    console.timeEnd("  --> Duration mount dashboard");

    if (hasData.value) {
        console.log("\nBUILDING CHARTS")
        await (renderData.value += 1)
        await useECharts("init")
        await (dashboardChartsMounted.value = true)
    }

}

export async function useMountDaily() {
    console.log("\MOUNTING DAILY")
    await console.time("  --> Duration mount daily");
    await useInitIndexedDB()
    spinnerLoadingPage.value = true
    useInitPopover()
    await Promise.all([useGetPatternsMistakes(), useGetSatisfactions(), useGetFilteredTrades()])
    await useLoadCalendar()
    await (spinnerLoadingPage.value = false)
    useInitTab("daily")
    console.timeEnd("  --> Duration mount daily")


    await Promise.all([useRenderDoubleLineChart(), useRenderPieChart()])
    await (renderingCharts.value = false)

    await Promise.all([useGetExcursions(), useGetDiaries(false), useGetScreenshots(true)])
}

export async function useMountCalendar(param) {
    await (spinnerLoadingPage.value = true)
    await useInitIndexedDB()
    await useLoadCalendar(param) // if param (true), then its coming from next or filter so we need to get filteredTrades (again)
    await (spinnerLoadingPage.value = false)
}
/**************************************
* MISC
**************************************/
export function usePageId() {
    const route = useRoute()
    pageId.value = route.name
    console.log("\n======== " + pageId.value.charAt(0).toUpperCase() + pageId.value.slice(1) + " Page/View ========\n")
    return pageId.value
}

export function useScreenType() {
    let screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width
    let screenType = (screenWidth >= 992) ? 'computer' : 'mobile'
    return screenType
}

export async function useSetSelectedLocalStorage() {
    return new Promise(async (resolve, reject) => {
        console.log(" -> Setting selected local storage")
        //console.log("Period Range "+JSON.stringify(periodRange))
        //console.log("now "+dayjs().tz(timeZoneTrade.value).startOf('month').unix())
        if (!localStorage.getItem('selectedDashTab')) localStorage.setItem('selectedDashTab', 'overviewTab')
        selectedDashTab.value = localStorage.getItem('selectedDashTab')

        if (Object.is(localStorage.getItem('selectedPositions'), null)) localStorage.setItem('selectedPositions', ["long", "short"])
        selectedPositions.value = localStorage.getItem('selectedPositions').split(",")

        if (!localStorage.getItem('selectedTimeFrame')) localStorage.setItem('selectedTimeFrame', "daily")
        selectedTimeFrame.value = localStorage.getItem('selectedTimeFrame')

        if (!localStorage.getItem('selectedRatio')) localStorage.setItem('selectedRatio', "appt")
        selectedRatio.value = localStorage.getItem('selectedRatio')

        if (!localStorage.getItem('selectedAccount')) localStorage.setItem('selectedAccount', "all")
        selectedAccount.value = localStorage.getItem('selectedAccount')

        if (!localStorage.getItem('selectedGrossNet')) localStorage.setItem('selectedGrossNet', "gross")
        selectedGrossNet.value = localStorage.getItem('selectedGrossNet')

        if (!localStorage.getItem('selectedPlSatisfaction')) localStorage.setItem('selectedPlSatisfaction', "pl")
        selectedPlSatisfaction.value = localStorage.getItem('selectedPlSatisfaction')

        if (!localStorage.getItem('selectedBroker')) localStorage.setItem('selectedBroker', "tradeZero")
        selectedBroker.value = localStorage.getItem('selectedBroker')

        if (!localStorage.getItem('selectedDateRange')) localStorage.setItem('selectedDateRange', JSON.stringify({ start: periodRange.filter(element => element.value == 'thisMonth')[0].start, end: periodRange.filter(element => element.value == 'thisMonth')[0].end }))
        selectedDateRange.value = JSON.parse(localStorage.getItem('selectedDateRange'))

        if (!localStorage.getItem('selectedPeriodRange')) {
            let tempFilter = periodRange.filter(element => element.start == selectedDateRange.value.start && element.end == selectedDateRange.value.end)
            //console.log("selectedDateRange.value "+JSON.stringify(selectedDateRange.value))
            //console.log("tempFilter  "+tempFilter)
            if (tempFilter.length > 0) {
                localStorage.setItem('selectedPeriodRange', JSON.stringify(tempFilter[0]))
            } else {
                console.log(" -> Custom range in vue")
                localStorage.setItem('selectedPeriodRange', JSON.stringify(periodRange.filter(element => element.start == -1)[0]))
            }
        }
        selectedPeriodRange.value = JSON.parse(localStorage.getItem('selectedPeriodRange'))

        if (!localStorage.getItem('selectedMonth')) localStorage.setItem('selectedMonth', JSON.stringify({ start: periodRange.filter(element => element.value == 'thisMonth')[0].start, end: periodRange.filter(element => element.value == 'thisMonth')[0].end }))
        selectedMonth.value = JSON.parse(localStorage.getItem('selectedMonth'))

        if (Object.is(localStorage.getItem('selectedAccounts'), null) && currentUser.value && currentUser.value.hasOwnProperty("accounts") && currentUser.value.accounts.length > 0) {
            currentUser.value.accounts.forEach(element => {
                selectedAccounts.value.push(element.value)
            });
            console.log("selected accounts " + JSON.stringify(selectedAccounts))
            localStorage.setItem('selectedAccounts', selectedAccounts.value)
            selectedAccounts.value = localStorage.getItem('selectedAccounts').split(",")
        }

        amountCase.value = localStorage.getItem('selectedGrossNet')
        //console.log('amount case '+amountCase.value)
        amountCapital.value = amountCase.value ? amountCase.value.charAt(0).toUpperCase() + amountCase.value.slice(1) : ''
        resolve()
    })
}

export function useEditItem(param) {
    sessionStorage.setItem('editItemId', param);
    if (pageId.value == "daily" || pageId.value == "diary") {
        window.location.href = "/addDiary"
    }
    if (pageId.value == "entries") {
        window.location.href = "/addEntry"
    }
    if (pageId.value == "screenshots") {
        sessionStorage.setItem('screenshotsPagination', screenshotsPagination.value);
        sessionStorage.setItem('screenshotIdToEdit', param) //We use this to scroll to watched id on screenshots page. We e rase it in scrollToScreenshot

        window.location.href = "/addScreenshot"
    }
    if (pageId.value == "playbook") {
        window.location.href = "/addPlaybook"
    }
}

export function usePageRedirect() {
    if (pageId.value == "daily") {
        window.location.href = "/daily"
    }
    if (pageId.value == "addDiary") {
        window.location.href = "/diary"
    }
    if (pageId.value == "addPlaybook") {
        window.location.href = "/playbook"
    }

}

export function useToggleMobileMenu() {
    let element = document.getElementById("sideMenu");
    element.classList.toggle("toggleSideMenu");
    sideMenuMobileOut.value = !sideMenuMobileOut.value
    console.log("sideMenuMobileOut " + sideMenuMobileOut.value)
}

/**************************************
* DATE FORMATS
**************************************/
export function useDateNumberFormat(param) {
    return Number(Math.trunc(param)) //we have to use /1000 and not unix because or else does not take into account tz
}

export function useDateCalFormat(param) {
    return dayjs.unix(param).tz(timeZoneTrade.value).format("YYYY-MM-DD")
}

export function useDateCalFormatMonth(param) {
    return dayjs.unix(param).tz(timeZoneTrade.value).format("YYYY-MM")
}

export function useTimeFormat(param) {
    return dayjs.unix(param).tz(timeZoneTrade.value).format("HH:mm:ss")
}

export function useTimeDuration(param) {
    return dayjs.duration(param * 1000).format("HH:mm:ss")
}

export function useHourMinuteFormat(param) {
    return dayjs.unix(param).tz(timeZoneTrade.value).format("HH:mm")
}

export function useDateTimeFormat(param) {
    return dayjs.unix(param).tz(timeZoneTrade.value).format("YYYY-MM-DD HH:mm:ss")
}

export function useChartFormat(param) {
    return dayjs.unix(param).tz(timeZoneTrade.value).format("l")
}

export function useMonthFormat(param) {
    return dayjs.unix(param).tz(timeZoneTrade.value).format("MMMM YYYY")
}

export function useMonthFormatShort(param) {
    return dayjs.unix(param).tz(timeZoneTrade.value).format("MMM YY")
}

export function useCreatedDateFormat(param) {
    return dayjs.unix(param).tz(timeZoneTrade.value).format("ddd DD MMMM YYYY")
}

export function useDatetimeLocalFormat(param) {
    return dayjs.tz(param * 1000, timeZoneTrade.value).format("YYYY-MM-DDTHH:mm:ss") //here we ne
}

/**************************************
* NUMBER FORMATS
**************************************/
export function useThousandCurrencyFormat(param) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0, style: 'currency', currency: 'USD' }).format(param)
}

export function useThousandFormat(param) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(param)
}

export function useTwoDecCurrencyFormat(param) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, style: 'currency', currency: 'USD' }).format(param)
}

export function useOneDecPercentFormat(param) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1, style: 'percent' }).format(param)
}

export function useTwoDecPercentFormat(param) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, style: 'percent' }).format(param)
}

export function useFormatBytes(param, decimals = 2) {
    if (param === 0) return '0 bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['param', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(param) / Math.log(k));
    return parseFloat((param / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
