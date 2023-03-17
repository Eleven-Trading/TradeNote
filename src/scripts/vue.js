const vueApp = new Vue({

    components: {},
    el: '#vapp',
    mixins: [tradesMixin, chartsCalMixin, addTradesMixin, entriesMixin, dailyMixin, videosMixin, notesMixin, dashboardMixin, addNoteMixin, playbookMixin, settingsMixin, journalslMixin, setupsMixin, forecastMixin, brokersMixin],
    data() {
        return {
            cssTheme: "dark",
            cssColor87: "#333",
            cssColor60: "#333",
            blackbg0: "hsl(0, 0%, 0%)",
            blackbg5: "hsl(0, 0%, 5%)",
            blackbg7: "hsl(0, 0%, 7%)",
            white87: "hsla(0, 0%, 100%, 0.87)",
            white60: "hsla(0, 0%, 100%, 0.6)",
            white38: "hsla(0, 0%, 100%, 0.38)",
            fromFirstFeature: "",
            fromSecondFeature: "",
            sideMenuMobileOut: false,
            //IndexDB
            indexedDBVersion: 10,
            indexedDBOpenRequest: null,
            indexedDb: null,
            threeMonthsBack: dayjs().startOf('month').subtract(3, 'month').unix(),
            screenType: null,

            //Login/Register
            signingUp: false,
            registerForm: { username: null, password: null },
            loginForm: { username: null, password: null },
            requiredClasses: [{
                    className: "_User",
                    fields: {
                        avatar: {
                            type: "File"
                        },
                        accounts: {
                            type: "Array"
                        }
                    }
                },
                {
                    className: "notes",
                    fields: {
                        note: {
                            type: "String"
                        },
                        user: {
                            type: "Pointer",
                            targetClass: "_User"
                        },
                        dateUnix: {
                            type: "Number"
                        },
                        date: {
                            type: "Date"
                        }
                    }
                },
                {
                    className: "trades",
                    fields: {
                        video: {
                            type: "String"
                        },
                        videoName: {
                            type: "String"
                        },
                        videoPoster: {
                            type: "File"
                        },
                        blotter: {
                            type: "Object"
                        },
                        pAndL: {
                            type: "Object"
                        },
                        date: {
                            type: "Date"
                        },
                        executions: {
                            type: "Array"
                        },
                        trades: {
                            type: "Array"
                        },
                        dateUnix: {
                            type: "Number"
                        },
                        videoDate: {
                            type: "Date"
                        },
                        videoDateUnix: {
                            type: "Number"
                        },
                        cashJournal: {
                            type: "Object"
                        },
                        satisfaction: {
                            type: "Boolean"
                        }
                    }
                },
                {
                    className: "playbooks",
                    fields: {
                        user: {
                            type: "Pointer",
                            targetClass: "_User"
                        },
                        playbook: {
                            type: "String"
                        },
                        dateUnix: {
                            type: "Number"
                        },
                        date: {
                            type: "Date"
                        }
                    }
                },
                {
                    className: "patterns",
                    fields: {
                        name: {
                            type: "String"
                        },
                        dateUnix: {
                            type: "Number"
                        },
                        date: {
                            type: "Date"
                        },
                        description: {
                            type: "String"
                        },
                        order: {
                            type: "Number"
                        },
                        active: {
                            type: "Boolean"
                        }
                    }
                },
                {
                    className: "mistakes",
                    fields: {
                        user: {
                            type: "Pointer",
                            targetClass: "_User"
                        },
                        name: {
                            type: "String"
                        },
                        description: {
                            type: "String"
                        },
                        order: {
                            type: "Number"
                        },
                        active: {
                            type: "Boolean"
                        }
                    }
                },
                {
                    className: "cashJournals",
                    fields: {
                        dateUnix: {
                            type: "Number"
                        },
                        cashJournal: {
                            type: "Object"
                        },
                        user: {
                            type: "Pointer",
                            targetClass: "_User"
                        },
                        date: {
                            type: "Date"
                        }
                    }
                },
                {
                    className: "dailyInfos",
                    fields: {
                        user: {
                            type: "Pointer",
                            targetClass: "_User"
                        },
                        dateUnix: {
                            type: "Number"
                        },
                        date: {
                            type: "Date"
                        },
                        cashBalance: {
                            type: "Number"
                        },
                        buyingPower: {
                            type: "Number"
                        }
                    }
                },
                {
                    className: "journals",
                    fields: {
                        dateUnix: {
                            type: "Number"
                        },
                        date: {
                            type: "Date"
                        },
                        user: {
                            type: "Pointer",
                            targetClass: "_User"
                        },
                        journal: {
                            type: "Object"
                        }
                    }
                },
                {
                    className: "setupsEntries",
                    fields: {
                        user: {
                            type: "Pointer",
                            targetClass: "_User"
                        },
                        side: {
                            type: "String"
                        },
                        name: {
                            type: "String"
                        },
                        original: {
                            type: "File"
                        },
                        annotated: {
                            type: "File"
                        },
                        originalBase64: {
                            type: "String"
                        },
                        annotatedBase64: {
                            type: "String"
                        },
                        maState: {
                            type: "Object"
                        },
                        symbol: {
                            type: "String"
                        },
                        date: {
                            type: "Date"
                        },
                        dateUnix: {
                            type: "Number"
                        }
                    }
                },
                {
                    className: "patternsMistakes",
                    fields: {
                        user: {
                            type: "Pointer",
                            targetClass: "_User"
                        },
                        pattern: {
                            type: "Pointer",
                            targetClass: "patterns"
                        },
                        mistake: {
                            type: "Pointer",
                            targetClass: "mistakes"
                        },
                        tradeUnixDate: {
                            type: "Number"
                        },
                        tradeId: {
                            type: "String"
                        },
                        note: {
                            type: "String"
                        }
                    }
                },
                {
                    className: "satisfactions",
                    fields: {
                        user: {
                            type: "Pointer",
                            targetClass: "_User"
                        },
                        dateUnix: {
                            type: "Number"
                        },
                        tradeId: {
                            type: "String"
                        },
                        satisfaction: {
                            type: "Boolean"
                        }
                    }
                },
                {
                    className: "excursions",
                    fields: {
                        user: {
                            type: "Pointer",
                            targetClass: "_User"
                        },
                        tradeId: {
                            type: "String"
                        },
                        dateUnix: {
                            type: "Number"
                        },
                        stopLoss: {
                            type: "Number"
                        },
                        maePrice: {
                            type: "Number"
                        },
                        mfePrice: {
                            type: "Number"
                        }
                    }
                }
            ],

            //General
            currentUser: null,
            pages: [{
                    id: "registerSignup",
                    name: "Login",
                    icon: "uil uil-apps"
                },
                {
                    id: "dashboard",
                    name: "Dashboard",
                    icon: "uil uil-apps"
                },
                {
                    id: "daily",
                    name: "Daily",
                    icon: "uil uil-signal-alt-3"
                },
                {
                    id: "calendar",
                    name: "Calendar",
                    icon: "uil uil-calendar-alt"
                },
                {
                    id: "screenshots",
                    name: "Screenshots",
                    icon: "uil uil-image-v"
                },
                {
                    id: "videos",
                    name: "Videos",
                    icon: "uil uil-clapper-board"
                },
                {
                    id: "journal",
                    name: "Journal",
                    icon: "uil uil-diary"
                },
                {
                    id: "notes",
                    name: "Notes",
                    icon: "uil uil-diary"
                },
                {
                    id: "playbook",
                    name: "Playbook",
                    icon: "uil uil-compass"
                },
                {
                    id: "addPlaybook",
                    name: "Add Playbook",
                    icon: "uil uil-compass"
                },
                {
                    id: "addTrades",
                    name: "Add Trades",
                    icon: "uil uil-plus-circle"
                },
                {
                    id: "addEntry",
                    name: "Add Entry",
                    icon: "uil uil-signin"
                },
                {
                    id: "addNote",
                    name: "Add Note",
                    icon: "uil uil-plus-circle"
                },
                {
                    id: "addJournal",
                    name: "Add Journal",
                    icon: "uil uil-plus-circle"
                },
                {
                    id: "settings",
                    name: "Settings",
                    icon: "uil uil-sliders-v-alt"
                },
                {
                    id: "setups",
                    name: "Setups",
                    icon: "uil uil-layer-group"
                },
                {
                    id: "addSetup",
                    name: "Add Setup",
                    icon: "uil uil-layer-group"
                },
                {
                    id: "entries",
                    name: "Entries",
                    icon: "uil uil-signin"
                },
                {
                    id: "forecast",
                    name: "Forecast",
                    icon: "uil uil-cloud-sun"
                }
            ],
            currentPage: null,
            stepper: null,
            activeNav: 1,
            dailyChartHeight: 150,
            maxChartValues: 20,
            estimations: {
                quantity: 10000,
                fees: 0.005
            },
            isNet: JSON.parse(localStorage.getItem('isNet')), //JSON parse because localstorage stores in string and not bool
            amountCase: localStorage.getItem('selectedGrossNet'),
            amountCapital: localStorage.getItem('selectedGrossNet').charAt(0).toUpperCase() + localStorage.getItem('selectedGrossNet').slice(1),
            tradeTimeZone: "America/New_York",
            logCharts: [],

            //Show/Hide page
            showDashboard: true,
            showAdd: false,
            showMoreVideos: false,
            loadingSpinner: false,
            loadingSpinnerText: null,
            popover: null,
            selectedItem: null,

            //DASHBOARD
            allTrades: [],
            threeMonthsTrades: [],
            filteredTrades: [],
            dashboardChartsMounted: false,
            dashboardIdMounted: false,
            totalCalendarMounted: false,
            totalPAndLChartHeight: 400,
            totals: null,
            cashBalance: null,
            buyingPower: null,
            totalsByDate: null,
            filteredTotalsByDate: [],
            groups: {},
            totalWinLossChartHeight: 200,
            selectedDashTab: localStorage.getItem('selectedDashTab'),
            dashTabs: [{
                    id: "overviewTab",
                    label: "Overview",
                    target: "#overviewNav"
                },
                {
                    id: "timeTab",
                    label: "Time&Date",
                    target: "#timeNav"
                },
                {
                    id: "tradesTab",
                    label: "Trades&Executions",
                    target: "#tradesNav"
                },
                {
                    id: "setupsTab",
                    label: "Setups",
                    target: "#setupsNav"
                },
                {
                    id: "financialsTab",
                    label: "Financials",
                    target: "#financialsNav"
                }
            ],
            toggleAP: localStorage.getItem('toggleAP'),
            dailyInfos: {},

            //Filter
            filtersOpen: false,
            dateRange: [{
                    value: "all",
                    label: "All",
                    start: 0,
                    end: 0
                },
                {
                    value: "thisWeek",
                    label: "This Week",
                    start: Number(dayjs().tz(this.tradeTimeZone).startOf('week').add(1, 'day').unix()), // we need to transform as number because later it's stringified and this becomes date format and note unix format
                    end: Number(dayjs().tz(this.tradeTimeZone).endOf('week').add(1, 'day').unix())
                },
                {
                    value: "lastWeek",
                    label: "Last Week",
                    start: Number(dayjs().tz(this.tradeTimeZone).startOf('week').add(1, 'day').subtract(1, 'week').unix()),
                    end: Number(dayjs().tz(this.tradeTimeZone).endOf('week').add(1, 'day').subtract(1, 'week').unix())
                },
                {
                    value: "lastWeekTilNow",
                    label: "Last Week Until Now",
                    start: Number(dayjs().tz(this.tradeTimeZone).startOf('week').add(1, 'day').subtract(1, 'week').unix()),
                    end: Number(dayjs().tz(this.tradeTimeZone).endOf('week').add(1, 'day').unix())
                },
                {
                    value: "lastTwoWeeks",
                    label: "Last Two Weeks",
                    start: Number(dayjs().tz(this.tradeTimeZone).startOf('week').add(1, 'day').subtract(2, 'week').unix()),
                    end: Number(dayjs().tz(this.tradeTimeZone).endOf('week').add(1, 'day').subtract(1, 'week').unix())
                },
                {
                    value: "lastTwoWeeksTilNow",
                    label: "Last Two Weeks Until Now",
                    start: Number(dayjs().tz(this.tradeTimeZone).startOf('week').add(1, 'day').subtract(2, 'week').unix()),
                    end: Number(dayjs().tz(this.tradeTimeZone).endOf('week').add(1, 'day').unix())
                },
                {
                    value: "thisMonth",
                    label: "This Month",
                    start: Number(dayjs().tz(this.tradeTimeZone).startOf('month').unix()),
                    end: Number(dayjs().tz(this.tradeTimeZone).endOf('month').unix())
                },
                {
                    value: "lastMonth",
                    label: "Last Month",
                    start: Number(dayjs().tz(this.tradeTimeZone).startOf('month').subtract(1, 'month').unix()),
                    end: Number(dayjs().tz(this.tradeTimeZone).endOf('month').subtract(1, 'month').unix())
                },
                {
                    value: "lastMonthTilNow",
                    label: "Last Month Until Now",
                    start: Number(dayjs().tz(this.tradeTimeZone).startOf('month').subtract(1, 'month').unix()),
                    end: Number(dayjs().tz(this.tradeTimeZone).endOf('month').unix())
                },
                {
                    value: "lastTwoMonths",
                    label: "Last Two Months",
                    start: Number(dayjs().tz(this.tradeTimeZone).startOf('month').subtract(2, 'month').unix()),
                    end: Number(dayjs().tz(this.tradeTimeZone).endOf('month').subtract(1, 'month').unix())
                },
                {
                    value: "lastTwoMonthsTilNow",
                    label: "Last Two Months Until Now",
                    start: Number(dayjs().tz(this.tradeTimeZone).startOf('month').subtract(2, 'month').unix()),
                    end: Number(dayjs().tz(this.tradeTimeZone).endOf('month').unix())
                },
                {
                    value: "lastThreeMonths",
                    label: "Last Three Months",
                    start: Number(dayjs().tz(this.tradeTimeZone).startOf('month').subtract(3, 'month').unix()),
                    end: Number(dayjs().tz(this.tradeTimeZone).endOf('month').subtract(1, 'month').unix())
                },
                {
                    value: "lastThreeMonthsTilNow",
                    label: "Last Three Months Until Now",
                    start: Number(dayjs().tz(this.tradeTimeZone).startOf('month').subtract(3, 'month').unix()),
                    end: Number(dayjs().tz(this.tradeTimeZone).endOf('month').unix())
                },
                {
                    value: "thisYear",
                    label: "This Year",
                    start: Number(dayjs().tz(this.tradeTimeZone).startOf('year').unix()),
                    end: Number(dayjs().tz(this.tradeTimeZone).endOf('year').unix())
                },
                {
                    value: "lastYear",
                    label: "Last Year",
                    start: Number(dayjs().tz(this.tradeTimeZone).startOf('year').subtract(1, 'year').unix()),
                    end: Number(dayjs().tz(this.tradeTimeZone).endOf('year').subtract(1, 'year').unix())
                },
                {
                    value: "custom",
                    label: "Custom",
                    start: -1,
                    end: -1
                },
            ],
            selectedDateRange: {},
            selectedDateRangeCal: {},
            selectedCalRange: {},
            positions: [{
                    value: "long",
                    label: "Long"
                },
                {
                    value: "short",
                    label: "Short"
                }
            ],
            timeFrames: [{
                    value: "daily",
                    label: "Daily"
                },
                {
                    value: "weekly",
                    label: "Weekly"
                },
                {
                    value: "monthly",
                    label: "Monthly"
                }
            ],
            ratios: [{
                    value: "appt",
                    label: "APPT"
                },
                {
                    value: "appspt",
                    label: "APPSPT"
                },
                {
                    value: "profitFactor",
                    label: "Profit Factor"
                }
            ],
            grossNet: [{
                    value: "gross",
                    label: "Gross"
                },
                {
                    value: "net",
                    label: "Net"
                },
                {
                    value: "netFees",
                    label: "Net Fees"
                }
            ],
            selectedPosition: localStorage.getItem('selectedPosition'),
            selectedPositions: localStorage.getItem('selectedPositions') ? localStorage.getItem('selectedPositions').split(",") : localStorage.getItem('selectedPositions') === null ? ["long", "short"] : [],
            selectedTimeFrame: localStorage.getItem('selectedTimeFrame'),
            selectedRatio: localStorage.getItem('selectedRatio'),
            selectedAccount: localStorage.getItem('selectedAccount'),
            selectedAccounts: localStorage.getItem('selectedAccounts') ? localStorage.getItem('selectedAccounts').split(",") : [],
            selectedGrossNet: localStorage.getItem('selectedGrossNet'),
            renderData: 0, //this is for updating DOM
            renderData0: 0,
            renderData1: 0, //this is for updating DOM
            renderData2: 0,
            renderingCharts: true, // this is for spinner

            //DAILY
            curMonthTrades: [],
            curWeekTrades: [],
            winLossChartToLoad: null,
            calendarData: null,
            miniCalendarsData: null,
            calendarMonths: [],
            days: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
            currentCalendarDate: null,
            todayDate: null,
            todayMonth: null,
            todayYear: null,
            dailyTabs: [{
                    id: "journals",
                    label: "Journal",
                    target: "#journalsNav"
                },
                {
                    id: "trades",
                    label: "Trades",
                    target: "#tradesNav"
                },
                {
                    id: "blotter",
                    label: "Blotter",
                    target: "#blotterNav"
                }
            ],
            daily: null,

            //Screenshots
            screenshots: [],
            screenshot: {
                id: null,
                imageUrl: null,
                imageRoot: null,
                comment: null,
                tags: []
            },
            maState: null,
            markerAreaOpen: false,

            //Videos
            videoFile: null,
            videoUrl: null,
            videoPosterUrl: null,
            videoName: null,
            awsFileType: null,
            fileExtension: null,
            tradeVideos: [],
            videoToLoad: null,
            videoIndex: null,
            videoBlob: null,
            videoUrlStorage: null,
            tradeToShow: [],
            uploadPercentCompleted: null,
            videosInIndexedDB: [],
            imageUrl: null,
            timeIntervals: [{
                    value: 1,
                    label: '1mn',
                },
                {
                    value: 3,
                    label: '3mn',
                },
                {
                    value: 5,
                    label: '5mn',
                },
                {
                    value: 15,
                    label: '15mn',
                },
                {
                    value: 30,
                    label: '30mn',
                },
                {
                    value: 60,
                    label: '1h',
                },
                {
                    value: 120,
                    label: '2h',
                },
                {
                    value: 180,
                    label: '3h',
                },
                {
                    value: 240,
                    label: '4h',
                },
                {
                    value: 1440,
                    label: '1D',
                },
            ],
            winStrategies: [{
                    value: "long",
                    label: "Long"
                },
                {
                    value: "short",
                    label: "Short"
                },
            ],
            tradeId: null,
            hasVideo: false,
            modalVideosOpen: false,

            //ADDTRADES
            apiBaseUrl: "API_BASE_URL",
            apiEndPointTempUrl: "API_END_POINT_TEMP_URL",

            screenshotIndex: 0,
            posterImg: null,
            videoCurrentlyPlaying: null,
            videosArrayIndex: null,
            forwBackSpeed: 0.5,
            forwBackSpeedArray: [0.1, 0.2, 0.3, 0.5, 1, 1.5, 2, 3],
            videoBuffer: 2,
            videoBufferArray: [0, 1, 2, 3, 4],

            //Notes
            notes: [],
            note: {},

            //Settings
            patterns: [],
            entrypoints: [],
            mistakes: [],
        }
    },
    beforeCreate: async function() {

        //SET DEFAULT LOCAL STORAGE VARIABLES
        !localStorage.getItem('isNet') ? localStorage.setItem('isNet', true) : '';
        !localStorage.getItem('selectedDashTab') ? localStorage.setItem('selectedDashTab', 'overviewTab') : '';
        !localStorage.getItem('toggleAP') ? localStorage.setItem('toggleAP', "appt") : '';
        !localStorage.getItem('selectedTimeFrame') ? localStorage.setItem('selectedTimeFrame', "daily") : '';
        !localStorage.getItem('selectedRatio') ? localStorage.setItem('selectedRatio', "appt") : '';
        !localStorage.getItem('selectedAccount') ? localStorage.setItem('selectedAccount', "all") : '';
        !localStorage.getItem('selectedGrossNet') ? localStorage.setItem('selectedGrossNet', "gross") : '';
        !localStorage.getItem('selectedBroker') ? localStorage.setItem('selectedBroker', "tradeZero") : '';

        let date = dayjs().tz(this.tradeTimeZone).startOf("day").unix()
            //console.log("date "+date)
            //the hours is not correct. UTC time ?

    },
    created: async function() {
        this.initParse()
        this.initPostHog()
        if (this.currentUser && !this.currentUser.guidedTour) {
            //console.log(" this.currentUser.guidedTour " + this.currentUser.guidedTour)
            this.initShepherd()
        }

        /* With selectedAccounts we are doing differently than with local storage variables in beforeCreate because we need to get the variable from currentUser. And checkCurrentUser cannot be done in beforeCreate */
        if (this.currentUser && this.currentUser.hasOwnProperty("accounts") && this.currentUser.accounts.length > 0) {
            !localStorage.getItem('selectedAccounts') ? this.selectedAccounts.push(this.currentUser.accounts[0].value) && localStorage.setItem('selectedAccounts', this.currentUser.accounts[0].value) : ''
        }

        this.cssTheme == "dark" ? this.cssColor87 = "rgba(255, 255, 255, 0.87)" : this.cssColor = "#333333"
        this.cssTheme == "dark" ? this.cssColor60 = "rgba(255, 255, 255, 0.60)" : this.cssColor = "#333333"
        this.cssTheme == "dark" ? this.cssColor38 = "rgba(255, 255, 255, 0.38)" : this.cssColor = "#333333"
            //we create the selectedDate and Calendar range
            /*this.selectedDateRange = localStorage.getItem('selectedDateRange') ? JSON.parse(localStorage.getItem('selectedDateRange')) : this.dateRange.filter(element => element.value == 'thisMonth')[0]*/

        this.selectedDateRangeCal = localStorage.getItem('selectedDateRangeCal') ? JSON.parse(localStorage.getItem('selectedDateRangeCal')) : { "start": this.dateRange.filter(element => element.value == 'thisMonth')[0].start, "end": this.dateRange.filter(element => element.value == 'thisMonth')[0].end }

        /* we set the initial selectedDateRange based on selectedDateRangeCal */
        if (localStorage.getItem('selectedDateRangeCal')) {
            let tempFilter = this.dateRange.filter(element => element.start == this.selectedDateRangeCal.start && element.end == this.selectedDateRangeCal.end)
            if (tempFilter.length > 0) {
                this.selectedDateRange = tempFilter[0]
            } else {
                this.selectedDateRange = this.dateRange.filter(element => element.start == -1)[0]
            }
        }

        this.selectedCalRange = localStorage.getItem('selectedCalRange') ? JSON.parse(localStorage.getItem('selectedCalRange')) : { start: this.dateRange.filter(element => element.value == 'thisMonth')[0].start, end: this.dateRange.filter(element => element.value == 'thisMonth')[0].end }

        this.currentPage = this.pages.filter(item => item.id == document.getElementsByTagName("main")[0].id)[0];
        //this.currentPage = document.getElementsByTagName("main")[0].id

        await this.initIndexedDB()

        if (this.currentPage.id == "dashboard" || this.currentPage.id == "calendar") {
            await this.getAllTrades(true)
            await this.initTab("dashboard")
        }

        if (this.currentPage.id == "daily" || this.currentPage.id == "videos") {
            await this.getAllTrades(true)
            await this.initPopover()
            await this.initTab("daily")
            await this.getTradesSatisfaction()
            await this.getExcursions()
        }

        if (this.currentPage.id == "journal") {
            await this.getJournals(30)
        }

        if (this.currentPage.id == "entries") {
            await this.getEntries(30)
            await this.initPopover()
        }

        if (this.currentPage.id == "screenshots") {
            await this.getScreenshots()
            await this.initPopover()
        }

        if (this.currentPage.id == "notes") {
            await this.getNotes()
            await this.initPopover()
        }

        if (this.currentPage.id == "setups") {
            await this.getSetupsEntries()
            await this.initPopover()
        }

        if (this.currentPage.id == "playbook") {
            this.getPlaybooks()
        }
        let itemToEditId = sessionStorage.getItem('editItemId')

        if (this.currentPage.id == "addNote") {
            await this.getNoteToEdit(itemToEditId)
            await this.initQuill()
            await sessionStorage.removeItem('editItemId');
        }

        if (this.currentPage.id == "addJournal") {
            await this.getJournalToEdit(itemToEditId)
            await this.initJournalJson()
            await Promise.all([this.initQuill(0), this.initQuill(1), this.initQuill(2)])
            await sessionStorage.removeItem('editItemId');
            await this.journalDateInput(this.currentDate)
        }

        if (this.currentPage.id == "addPlaybook") {
            await this.getPlaybookToEdit(itemToEditId)
            await this.initQuill('Playbook')
            await sessionStorage.removeItem('editItemId');
            await this.playbookDateInput(this.currentDate)
        }

        if (this.currentPage.id == "addSetup") {
            await this.getSetupToEdit(itemToEditId)
            await sessionStorage.removeItem('editItemId');
        }

        if (this.currentPage.id == "addEntry") {
            await this.getEntryToEdit(itemToEditId)
            await sessionStorage.removeItem('editItemId');
        }

        if (this.currentPage.id == "settings" || this.currentPage.id == "videos") {
            await this.getPatterns()
            await this.getMistakes()
        }

        if (this.currentPage.id == "forecast") {
            await this.getScenarios()
            await this.createForecast()
            await this.linesChartForecast()
        }

    },

    mounted: async function() {
        /*console.log("\nDATE EXPLORATION")
        console.log(" -> Guessing timezone "+dayjs.tz.guess())
        //console.log(" -> Current date "+dayjs())
        let currentDateUnix = dayjs.unix()
        console.log(" -> Current date unix "+currentDateUnix)
        console.log(" -> Current date "+dayjs().format())
        //console.log(" -> Current date w/ guess timezone "+dayjs().tz(dayjs.tz.guess()))
        console.log(" -> Current date unix w/ guess tz "+dayjs().tz(dayjs.tz.guess()).unix())
        console.log(" -> Current date unix w/ tz "+dayjs().tz(this.tradeTimeZone).unix())
        console.log(" -> Current date w/ tz "+dayjs().tz(this.tradeTimeZone).format())
        console.log(" -> Start of day "+dayjs().startOf("day"))
        console.log(" -> Start of day unix "+dayjs().startOf("day").unix())
        console.log(" -> Start of day unix tz "+dayjs().tz(this.tradeTimeZone).startOf("day").unix())
        console.log(" -> Start of week " + dayjs().startOf('week').add(1, 'day').unix())
        console.log(" -> Start of week tz " + dayjs().tz(this.tradeTimeZone).startOf('week').add(1, 'day').unix())
        console.log(" -> entryTime "+dayjs.unix(1656682798).format())
        console.log(" -> entryTime w/ tz "+dayjs.unix(1656682798).tz(this.tradeTimeZone).format())
        console.log(" -> entryTime unix w/ tz "+dayjs.unix(1656682798).tz(this.tradeTimeZone).unix())*/

        /* DAYJS Rules
         * Setting timezone to dayjs and showing in unix shows in local unix
         * setting timezone to dayjs and formatting shows in tz date
         * Manipulating with startOf shows in tz date even in unix
         * Inside dayjs(xxx) it must be in miliseconds. If you have a timestamp in seconds, use dayjs.unix(xxx)
         * .unix in most cases (excempt for example startOf ) seems to convert to local time. so dayjs.unix(1656682798).tz(this.tradeTimeZone).format() shows in tz time. dayjs.unix(1656682798).tz(this.tradeTimeZone).unix() show unix in local time
         */

        console.log("END DATE EXPLORATION")
        console.log("\n")
        let screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width
        this.screenType = (screenWidth >= 992) ? 'computer' : 'mobile'
            //console.log(" Width : " + screenWidth + " and screen type " + this.screenType)
            //this.getDailyInfos()
        var itemToEditId = sessionStorage.getItem('editItemId')
        if (this.currentPage.id == "addTrades") {
            this.initStepper()
            await this.getExistingTradesArray()
        }

        this.tagArray()
        this.initWheelEvent()


        /*var fileDate = fileName.split("-")[0].split("_")
        var fileYear = fileDate[0]
        var fileMonth = fileDate[1]
        var fileDay = fileDate[2]
            //console.log("year "+fileYear + " month "+fileMonth+" day "+fileDay)
        var fileTime = fileName.split("-")[1]
        var fileHour = fileTime.substring(0, 2)
        var fileMinutes = fileTime.substring(2, 4)
        var fileSeconds = fileTime.substring(4, 6)
            //console.log("hour "+fileHour + " minutes "+fileMinutes+" seconds "+fileSeconds)
        var fileDateUnix = dayjs(fileDate + " " + fileHour + ":" + fileMinutes + ":" + fileSeconds, "YYYY_MM_DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss")
        console.log("unix " + fileDateUnix)*/

    },
    watch: {
        activeNav: function() {
            //console.log("nav " + this.activeNav + ' and type ' + typeof this.activeNav)
        },
        includeFinancials: function() {
            //console.log("watch finviz "+this.includeFinancials)
        },

        selectedAccounts: function() {
            console.log("selectedAccounts " + this.selectedAccounts + " type " + typeof(JSON.stringify(this.selectedAccounts)))
            localStorage.setItem('selectedAccounts', this.selectedAccounts)
            this.inputAccounts()
                //console.log("local storage "+localStorage.getItem('selectedAccounts')+" type "+typeof (localStorage.getItem('selectedAccounts'))+" split "+localStorage.getItem('selectedAccounts').split(",")+" type split "+typeof (localStorage.getItem('selectedAccounts').split(",")))
        },

        selectedPositions: function() {
            localStorage.setItem('selectedPositions', this.selectedPositions)
            this.inputPositions()
                //console.log("local storage "+localStorage.getItem('selectedAccounts')+" type "+typeof (localStorage.getItem('selectedAccounts'))+" split "+localStorage.getItem('selectedAccounts').split(",")+" type split "+typeof (localStorage.getItem('selectedAccounts').split(",")))
        },

    },
    methods: {
        // =================================================================================
        // GLOBALS
        // =================================================================================

        grossNetToggle() {
            this.dashboardChartsMounted = false
            this.eCharts("clear")
            this.getAllTrades(true)
            currentState = JSON.parse(localStorage.getItem('isNet'))
                //console.log("state " + currentState)
            localStorage.setItem('isNet', !currentState);
            !currentState == true ? this.amountCase = "net" : this.amountCase = "gross";
            !currentState == true ? this.amountCapital = "Net" : this.amountCapital = "Gross"
        },

        /* ---- INITS ---- */
        initPostHog() {
            return new Promise((resolve, reject) => {
                axios.post('/posthog')
                    .then((response) => {
                        //console.log(response);
                        if (response.data != "off") {
                            ! function(t, e) {
                                var o,
                                    n,
                                    p,
                                    r;
                                e.__SV || (window.posthog = e, e._i = [], e.init = function(i, s, a) {
                                    function g(t, e) {
                                        var o = e.split(".");
                                        2 == o.length && (t = t[o[0]], e = o[1]),
                                            t[e] = function() {
                                                t.push([e].concat(Array.prototype.slice.call(arguments, 0)))
                                            }
                                    }(p = t.createElement("script")).type = "text/javascript",
                                        p.async = !0,
                                        p.src = s.api_host + "/static/array.js",
                                        (r = t.getElementsByTagName("script")[0])
                                        .parentNode
                                        .insertBefore(p, r);
                                    var u = e;
                                    for (
                                        void 0 !== a ?
                                        u = e[a] = [] :
                                        a = "posthog",
                                        u.people = u.people || [],
                                        u.toString = function(t) {
                                            var e = "posthog";
                                            return "posthog" !== a && (e += "." + a),
                                                t || (e += " (stub)"),
                                                e
                                        },
                                        u.people.toString = function() {
                                            return u.toString(1) + ".people (stub)"
                                        },
                                        o = "capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags".split(" "),
                                        n = 0; n < o.length; n++)
                                        g(u, o[n]);
                                    e
                                        ._i
                                        .push([i, s, a])
                                }, e.__SV = 1)
                            }(document, window.posthog || []);
                            posthog.init(response.data, { api_host: 'https://eu.posthog.com' })
                        } else {
                            console.log(" -> Analytics Off")
                        }
                        resolve()
                    })
                    .catch((error) => {
                        console.log(" -> Error PostHog id " + error)
                        reject(error)
                    });
            })
        },

        initTab(param) {
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
            var self = this // this is needed or else could not call function inside eventlistener

            console.log("INIT TAB for " + param)

            triggerTabList.forEach((triggerEl) => {
                /*var tabTrigger = new bootstrap.Tab(triggerEl)
                triggerEl.addEventListener('click', function(event) {
                    console.log("clicking")
                    //event.preventDefault()
                    //tabTrigger.show()
                })*/
                if (param == "dashboard") {
                    // GET TAB ID THAT IS CLICKED
                    console.log(" -> triggerTabList Dashboard")
                    triggerEl.addEventListener('shown.bs.tab', (event) => {
                        //console.log("target " + event.target.getAttribute('id')) // newly activated tab
                        this.selectedDashTab = event.target.getAttribute('id')
                        console.log("selected tab " + this.selectedDashTab)
                        localStorage.setItem('selectedDashTab', event.target.getAttribute('id'))
                        self.getAllTrades(false)
                            //console.log("related" + event.relatedTarget) // previous active tab
                    })
                }

                if (param == "daily") {
                    // GET TAB ID THAT IS CLICKED

                    //console.log(" -> triggerTabList Daily")

                    triggerEl.addEventListener('click', (event) => {


                        if (idCurrent != undefined) idPrevious = idCurrent // in case it's not on page load and we already are clicking on tabs, then inform that the previsous clicked tab (wich is for the moment current) should now become previous
                        
                        idCurrent = event.target.getAttribute('id')
                        
                        if (idPrevious == undefined) {
                            firstTimeClick = true
                            idPrevious = idCurrent //on page load, first time we click
                            hideCurrentTab = !hideCurrentTab // this is counter intuitive but because further down we toggle hidCurrentTab, i need to toggle here if its first time click on load or else down there it would be hide true the first time. So here we set true so that further down, on first time click on page load it becomes false

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
                            // in this case, we have click on another tab so we need to "reset" the previsous tab 
                            $(htmlIdPrevious).removeClass('show')
                            $(htmlIdPrevious).removeClass('active')
                            $("#" + idPrevious).removeClass('active')
                        }

                    })
                }
            })


        },

        initParse: async function(param1) {
            return new Promise((resolve, reject) => {
                console.log("\nINITIATING PARSE")
                let path = window.location.pathname
                let parse_app_id = localStorage.getItem('parse_app_id') ? localStorage.getItem('parse_app_id') : "";
                let parse_url = "/parse"
                console.log(" -> Parse id " + parse_app_id)

                Parse.initialize(parse_app_id)
                Parse.serverURL = parse_url

                if ((parse_app_id == "") && path != "/" && path != "/register") window.location.replace("/")
                if (parse_app_id != "") this.checkCurrentUser()
                resolve()
            })
        },
        initShepherd() {
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
                    text: 'Welcome onboard. This guided tutorial will show you how TradeNote works.',
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
                    text: '<p>Daily shows a detailed view of trades per day.</p><p>For each day, there is a tab where you can see your daily journal entry (see below), all your trades and a blotter of your trades per symbol.</p><p>For each trade, you can click on the line to add a note per trade, a pattern and a mistake. Currently, patterns and mistakes must be first added manually in the Parse Dashboard.</p>',
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
                    text: 'Journal is where you can see and edit your daily journals.',
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
                    text: 'Setups show all your screenshots of setups and entries.',
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
                    text: "<p>Click here to add trades, journal entries, setups or playbooks.</p><p>Trades is used for importing trades from your Broker's csv or excel file.</p><p>Journal is where you can write your daily thoughts and progress.</p><p>Setups lets you add a screenshot of an interesting setup or of your entry (you need to add entry time in this case). In both cases, you can annotate the screenshot with drawings, notes and more.</p><p>Playbook is where you can write your (yearly) playbook.</p>",
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
                    text: "That's it. You are now ready to use TradeNote. You can come back to this tutorial at any time by clicking 'Tutorial' in the sub-menu here.",
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

            Shepherd.on("complete", async() => {
                console.log("Tour complete")
                const Object = Parse.Object.extend("User");
                const query = new Parse.Query(Object);
                query.equalTo("objectId", this.currentUser.objectId);
                const results = await query.first();
                if (results) {
                    await results.set("guidedTour", true)
                    results.save().then(() => {
                        console.log(" -> Updated user")
                    })
                } else {
                    console.log("  --> Could not find user. This is a problem")
                }

            })

        },
        initQuill(param) {
            console.log("param " + param)
            let quillEditor
            if (param != undefined) {
                quillEditor = '#quillEditor' + param
            } else {
                quillEditor = '#quillEditor'
            }
            console.log("quilEditor " + quillEditor)
            let quill = new Quill(quillEditor, {
                theme: 'snow'
            });
            quill.root.setAttribute('spellcheck', true)

            quill.on('text-change', () => {
                if (this.currentPage.id == "addNote") {
                    this.note.note = document.querySelector(".ql-editor").innerHTML
                    console.log("note " + this.note.note)
                }

                if (this.currentPage.id == "addSetup") {
                    this.setupUpdate.checkList = document.querySelector(".ql-editor").innerHTML
                        //console.log("setup " + JSON.stringify(this.setupUpdate))
                }

                if (this.currentPage.id == "addJournal") {

                    let elements = document.querySelectorAll(".ql-editor");
                    elements.forEach((input, index) => {
                            if (index == 0) {
                                this.journalUpdate.journal.positive = input.innerHTML
                            }
                            if (index == 1) {
                                this.journalUpdate.journal.negative = input.innerHTML
                            }
                            if (index == 2) {
                                this.journalUpdate.journal.other = input.innerHTML
                            }
                        })
                        //console.log(" -> journalUpdate " + JSON.stringify(this.journalUpdate))
                    this.journalButton = true
                }

                if (this.currentPage.id == "addPlaybook") {
                    this.playbookUpdate.playbook = document.querySelector(".ql-editor").innerHTML
                    this.playbookButton = true
                }
            });
        },
        initStepper() {
            this.stepper = new Stepper(document.querySelector('#addStepper'), {
                animation: true
            })
        },
        initIndexedDB: async function() {
            return new Promise((resolve, reject) => {
                console.log("\nINITIATING INDEXEDDB")
                window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
                    IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction

                // Create/open database
                this.indexedOpenRequest = indexedDB.open("tradeNote", this.indexedDBVersion);

                this.indexedOpenRequest.onupgradeneeded = () => {
                    //console.log("onupgradeneeded")
                    // triggers if the client had no database
                    // ...perform initialization...
                    this.indexedDB = this.indexedOpenRequest.result;
                    if (!this.indexedDB.objectStoreNames.contains('videos')) {
                        console.log("creating videos object store in tradeNote")
                        this.indexedDB.createObjectStore('videos', { keyPath: 'id' })
                    }
                    if (!this.indexedDB.objectStoreNames.contains('trades')) {
                        console.log("creating trades object store in tradeNote")
                        this.indexedDB.createObjectStore('trades', { keyPath: 'id' })
                    }
                };

                this.indexedOpenRequest.onerror = () => {
                    console.error("Error", this.indexedOpenRequest.error);
                    resolve()
                };

                this.indexedOpenRequest.onsuccess = () => {
                    this.indexedDB = this.indexedOpenRequest.result;
                    resolve()

                };
            })
        },
        initWheelEvent() {
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
                this.videoSkip(mouseDirection)
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
                this.videoSkip(mouseDirection)
            }, false)
        },

        initPopover() {
            var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
            popoverTriggerList.map(function(popoverTriggerEl) {
                return new bootstrap.Popover(popoverTriggerEl)
            })

            $(document).on('click', '.popoverDelete', (e) => {
                var $this = $(e.currentTarget);
                $('.popoverDelete').not($this).popover('hide');
                //console.log("this "+JSON.stringify($this))
            });

            $(document).on('click', '.popoverYes', (e) => {
                var $this = $(e.currentTarget);
                $('.popoverDelete').not($this).popover('hide');
                if (this.currentPage.id == "notes") {
                    this.deleteNote()
                }
                if (this.currentPage.id == "setups") {
                    this.deleteSetup()
                }
                if (this.currentPage.id == "entries") {
                    this.deleteEntry()
                }
            });

            $(document).on('click', '.popoverNo', (e) => {
                var $this = $(e.currentTarget);
                $('.popoverDelete').not($this).popover('hide');
                this.selectedItem = null
            });

        },

        /* ---- INPUTS ---- */
        getComment(e) {
            this.screenshot.comment = e.target.innerHTML
                //console.log("comment "+this.screenshot.comment)
        },

        /* ---- LOGIN/REGISTER ---- */
        checkCurrentUser() {
            var path = window.location.pathname
            this.currentUser = JSON.parse(JSON.stringify(Parse.User.current()));
            //console.log("Current user "+JSON.stringify(this.currentUser))
            if (path != "/" && path != "/register") {
                if (this.currentUser) {
                    //console.log("Your are logged in " + JSON.stringify(this.currentUser) + " and id " + Parse.User.current().id)
                } else {
                    window.location.replace("/");
                }
            }
            if (path == "/" || path == "/register") {
                if (this.currentUser) {
                    window.location.replace("/dashboard");
                } else {
                    //console.log("Your are not logged")
                }
            }

        },
        getParseId: async function() {
            return new Promise((resolve, reject) => {
                console.log(" -> Getting App ID")
                axios.post('/parseAppId')
                    .then((response) => {
                        //console.log(response);
                        localStorage.setItem('parse_app_id', response.data)
                        resolve(response)
                    })
                    .catch((error) => {
                        console.log(" -> Error getting app id " + error)
                        reject(error)
                    });


            })
        },

        updateSchema: async function() {
            return new Promise((resolve, reject) => {
                console.log(" -> Updating schema")
                axios.post('/updateSchemas').then((response) => {
                        console.log(response);
                        resolve(response)
                    })
                    .catch((error) => {
                        console.log("Error get app id " + error);
                        reject(error)
                    });
            })
        },
        login: async function() {
            console.log("\nLOGIN")
            this.signingUp = true
            let parseId = await this.getParseId()
            if (!parseId.data) {
                alert("Missing App ID. Please make sure you entered correct App ID during runtime.")
                return
            }
            let updateSchema = await this.updateSchema()
            console.log("status " + updateSchema.status)
            if (updateSchema.status == 200) {
                await this.initParse()

                try {
                    await Parse.User.logIn(this.loginForm.username, this.loginForm.password)
                    console.log("Hooray! You are logged in")
                    this.signingUp = false
                    window.location.replace("/dashboard");
                } catch (error) {
                    // Show the error message somewhere and let the user try again.
                    this.signingUp = false
                    alert("Error: " + error.code + " " + error.message);
                }
            } else {
                this.signingUp = false
                alert("Error updating schema " + updateSchema)
            }
        },
        register: async function() {
            console.log("\nREGISTER")
            this.signingUp = true
            let parseId = await this.getParseId()
            if (!parseId.data) {
                alert("Missing App ID. Please make sure you entered correct App ID during runtime.")
                return
            }
            let updateSchema = await this.updateSchema()
            console.log("status " + updateSchema.status)
            if (updateSchema.status == 200) {
                await this.initParse()

                const user = new Parse.User();
                user.set("username", this.registerForm.username);
                user.set("password", this.registerForm.password);
                user.set("email", this.registerForm.username);

                try {
                    await user.signUp();
                    console.log("Hooray! Let them use the app now")
                    window.location.replace("/");
                } catch (error) {
                    // Show the error message somewhere and let the user try again.
                    alert("Error: " + error.code + " " + error.message);
                }
            } else {
                this.signingUp = false
                alert("Error updating schema " + updateSchema)
            }
            /*
             */
        },
        logout() {
            Parse.User.logOut().then(() => {
                Parse.User.current(); // this will now be null
                localStorage.clear()
                this.indexedOpenRequest = indexedDB.open("tradeNote", this.indexedDBVersion);
                this.indexedOpenRequest.onsuccess = () => {

                    // Clear all the data from the object store
                    clearData();
                };
                const clearData = () => {
                    // open a read/write db transaction, ready for clearing the data
                    const transaction = this.indexedDB.transaction(["trades"], "readwrite");

                    // report on the success of the transaction completing, when everything is done
                    transaction.oncomplete = (event) => {
                        console.log("Transaction completed")
                    };

                    transaction.onerror = (event) => {
                        console.log("Transaction not opened due to error: " + transaction.error)
                    };

                    // create an object store on the transaction
                    const objectStore = transaction.objectStore("trades");

                    // Make a request to clear all the data out of the object store
                    const objectStoreRequest = objectStore.clear();

                    objectStoreRequest.onsuccess = (event) => {
                        // report the success of our request
                        console.log("Data clear successful")
                    }
                }
                console.log("Logging out")
                window.location.replace("/");
            });
        },

        /* ---- DATE FORMATS ---- */
        dateNumberFormat(param) {
            return Number(Math.trunc(param)) //we have to use /1000 and not unix because or else does not take into account tz
        },
        dateCalFormat(param) {
            return dayjs.unix(param).tz(this.tradeTimeZone).format("YYYY-MM-DD")
        },
        dateCalFormatMonth(param) {
            return dayjs.unix(param).tz(this.tradeTimeZone).format("YYYY-MM")
        },
        timeFormat(param) {
            return dayjs.unix(param).tz(this.tradeTimeZone).format("HH:mm:ss")
        },
        timeDuration(param) {
            return dayjs.duration(param * 1000).format("HH:mm:ss")
        },
        hourMinuteFormat(param) {
            return dayjs.unix(param).tz(this.tradeTimeZone).format("HH:mm")
        },
        chartFormat(param) {
            return dayjs.unix(param).tz(this.tradeTimeZone).format("DD/MM/YY")
        },
        monthFormat(param) {
            return dayjs.unix(param).tz(this.tradeTimeZone).format("MMMM YYYY")
        },
        monthFormatShort(param) {
            return dayjs.unix(param).tz(this.tradeTimeZone).format("MMM YY")
        },
        createdDateFormat(param) {
            return dayjs.unix(param).tz(this.tradeTimeZone).format("ddd DD MMMM YYYY")
        },
        datetimeLocalFormat(param) {
            return dayjs.tz(param * 1000, this.tradeTimeZone).format("YYYY-MM-DDTHH:mm:ss") //here we ne
        },

        /* ---- NUMBER FORMATS ---- */
        thousandCurrencyFormat(param) {
            return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0, style: 'currency', currency: 'USD' }).format(param)
        },

        thousandFormat(param) {
            return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(param)
        },

        twoDecCurrencyFormat(param) {
            return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, style: 'currency', currency: 'USD' }).format(param)
        },

        oneDecPercentFormat(param) {
            return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1, style: 'percent' }).format(param)
        },

        twoDecPercentFormat(param) {
            return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, style: 'percent' }).format(param)
        },

        formatBytes(param, decimals = 2) {
            if (param === 0) return '0 bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['param', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            const i = Math.floor(Math.log(param) / Math.log(k));
            return parseFloat((param / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        },

        /* ---- STEPPER---- */
        stepperNext() {
            this.stepper.next()
            this.existingImports = []
        },

        stepperPrevious() {
            this.stepper.previous()
            this.existingImports = []
        },

        /* ---- VIDEO PLAYER ---- */
        videoPlaying(param) {
            this.videoCurrentlyPlaying = "video" + param
        },
        playVideo() {
            console.log("click")
                //this.videosArrayIndex = param
        },
        videoSkip(param) {
            if (this.videoCurrentlyPlaying) {
                var video = document.getElementById(this.videoCurrentlyPlaying)
                if (param == "forward") {
                    video.currentTime += this.forwBackSpeed;
                }
                if (param == "backward") {
                    video.currentTime -= this.forwBackSpeed;
                }
            }
        },

        tagArray() {
            $('#tags').on('itemAdded', (event) => {
                console.log("Tag added " + event.item)
                this
                    .screenshot.tags
                    .push(event.item)
                console.log("Items in tags " + this.screenshot.tags)
            });
            $('#tags').on('itemRemoved', (event) => {
                console.log("Item to remove from tags " + event.item)
                this.screenshot.tags = this
                    .screenshot.tags
                    .filter(item => item !== event.item)
                console.log("Items left in tags " + this.screenshot.tags)
            });
        },

        editItem(param) {
            sessionStorage.setItem('editItemId', param);
            if (this.currentPage.id == "daily" || this.currentPage.id == "journal") {
                window.location.href = "/addJournal"
            }
            if (this.currentPage.id == "entries") {
                window.location.href = "/addEntry"
            }
            if (this.currentPage.id == "setups") {
                window.location.href = "/addSetup"
            }
            if (this.currentPage.id == "playbook") {
                window.location.href = "/addPlaybook"
            }
        },

        toggleMobileMenu() {
            let element = document.getElementById("sideMenu");
            element.classList.toggle("toggleSideMenu");
            this.sideMenuMobileOut = !this.sideMenuMobileOut
            con
            sole.log("sideMenuMobileOut " + this.sideMenuMobileOut)
        },

        /* ---- IMAGES ---- */
        enlargeImg(param) {
            // Get the img object using its Id
            img = document.getElementById(param);
            // Function to increase image size

            // Set image size to 1.5 times original
            img.style.transform = "scale(1.5)";
            // Animation effect
            img.style.transition = "transform 0.25s ease";

            // Function to reset image size
            function resetImg() {
                // Set image size to original
                img.style.transform = "scale(1)";
                img.style.transition = "transform 0.25s ease";
            }
        },


    }
})