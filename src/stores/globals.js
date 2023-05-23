import { ref, reactive, computed } from "vue";

/**************************************
* GENERAL
**************************************/
export const parseId = ref()
export const pageId = ref()
export const currentUser = ref()
export const timeZones = ref(["America/New_York","Asia/Shanghai","Europe/Brussels","Asia/Tokyo", "Asia/Hong_Kong", "Asia/Kolkata", "Europe/London", "Asia/Riyadh"])
export const timeZoneTrade = ref()
export const queryLimit = ref(10000000)
export const endOfList = ref(false) //infinite scroll
export const noData = ref(false)
export const stepper = ref()
export const hasData = ref(true)
export const itemToEditId = ref(sessionStorage.getItem('editItemId'))
export const currentDate = ref(dayjs().format("YYYY-MM-DD"))
export const quill = ref()
export const sideMenuMobileOut = ref(false)

/**************************************
* PATTERNS, MISTAKES & SETUPS
**************************************/
export const patterns = reactive([])
export const mistakes = reactive([])
export const patternsMistakes = reactive([])
export const tradeSetup = reactive({
    pattern: null,
    mistake: null,
    note: null,
})
export const screenshot = reactive({
    "side": null,
    "type": null
})
export const tradeSetupChanged = ref(false)
export const tradeSetupDateUnixDay = ref(null)
export const tradeSetupDateUnix = ref(null)
export const tradeSetupId = ref(null)

//Used in settings
export const patternToEdit = ref(null)
export const updatePatternName = ref(null)
export const updatePatternDescription = ref(null)
export const updatePatternActive = ref(null)

export const newPatternName = ref(null)
export const newPatternDescription = ref(null)

export const mistakeToEdit = ref(null)
export const updateMistakeName = ref(null)
export const updateMistakeDescription = ref(null)
export const updateMistakeActive = ref(null)

export const newMistakeName = ref(null)
export const newMistakeDescription = ref(null)

/**************************************
* INDEXEDDB
**************************************/
export const indexedDBVersion = ref(10)
export const indexedOpenRequest = ref(null)
export const indexedDB = reactive({})
export const indexedDBtoUpdate = ref(false)


/**************************************
* LOADING AND MOUNTING
**************************************/
//General
export const spinnerLoadingPage = ref()
export const spinnerLoadingPageText = ref()
export const renderData = ref(0) //this is for updating DOM

export const spinnerLoadMore = ref(false) //infinite scroll

//Dashboard
export const dashboardChartsMounted = ref()
export const dashboardIdMounted = ref(false)

//Charts
export const renderingCharts = ref(true) // this is for spinner

//Setups
export const spinnerSetups = ref(false)
export const spinnerSetupsText = ref()


/**************************************
* MODALS
**************************************/
export const modalVideosOpen = ref(false)

/**************************************
* TRADES
**************************************/
export const selectedRange = ref()
export const threeMonthsBack = ref(dayjs().startOf('month').subtract(3, 'month').unix())
export const filteredTrades = reactive([])
export const filteredTradesTrades = reactive([])
export const allTrades = reactive([])
export const threeMonthsTrades = reactive([])
export const totals = reactive({})
export const totalsByDate = reactive({})
export const groups = reactive({})
export const profitAnalysis = reactive({})
export const timeFrame = ref(15)

/**************************************
* ADD TRADES
**************************************/
export const pAndL = reactive({})
export const executions = reactive({})
export const trades = reactive({})
export const blotter = reactive({})
export const tradesData = reactive([])
export const tradeId = ref()
export const existingImports = reactive([])
export const existingTradesArray = reactive([])
export const gotExistingTradesArray = ref(false)

/**************************************
* CHARTS
**************************************/

/**************************************
* CALENDAR
**************************************/
export const calendarData = reactive({})
export const miniCalendarsData = reactive([])
export const uploadMfePrices = ref(true)

/**************************************
* DAILY
**************************************/
export const daily = reactive({})
export const excursion = reactive({
    stopLoss: null,
    maePrice: null,
    mfePrice: null
})
export const tradeSatisfactionChanged = ref(false)
export const tradeSatisfactionDateUnix = ref()
export const tradeSatisfactionId = ref()
export const editingScreenshot = ref(false)
export const tradeExcursionChanged = ref(false)
export const tradeExcursionId = ref()
export const tradeExcursionDateUnix = ref()

/**************************************
* SCREENSHOTS
**************************************/
export const screenshots = reactive([])
export const tradeScreenshotChanged = ref(false)
export const markerAreaOpen = ref(false)
export const screenshotsNames = reactive([])
export const dateScreenshotEdited = ref(false)
export const screenshotsPagination = ref(0)

/**************************************
* DIARY
**************************************/
export const diaries = reactive([])
export const diaryUpdate = reactive({})
export const diaryIdToEdit = ref()
export const diaryButton = ref(false)

/**************************************
* PLAYBOOKS
**************************************/
export const playbooks = reactive([])
export const playbookUpdate = reactive({}) //when we update, we need to use another json, or else it was removing .ql-editor for some reason
export const playbookIdToEdit = ref()
export const playbookButton = ref(false)

/**************************************
* BROKERS
**************************************/
export const brokers = reactive([{
    value: "template",
    label: "Template"
},
{
    value: "tradeZero",
    label: "TradeZero"
},
{
    value: "metaTrader5",
    label: "MetaTrader 5"
},
{
    value: "tdAmeritrade",
    label: "TD Ameritrade"
},
{
    value: "tradeStation",
    label: "TradeStation"
},
{
    value: "interactiveBrokers",
    label: "Interactive Brokers"
},
{
    value: "heldentrader",
    label: "Heldentrader"
}
])

/**************************************
* SELECTED & FILTERS
**************************************/
export const selectedItem = ref()

export const tempSelectedPlSatisfaction = ref(null)

export const periodRange = reactive([])

export const positions = ref([{
    value: "long",
    label: "Long"
},
{
    value: "short",
    label: "Short"
}
])

export const timeFrames = ref([{
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
])

export const ratios = ref([{
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
])

export const grossNet = ref([{
    value: "gross",
    label: "Gross"
},
{
    value: "net",
    label: "Net"
}
])

export const plSatisfaction = ref([{
    value: "pl",
    label: "P&L"
},
{
    value: "satisfaction",
    label: "Satisfaction"
}
])

export const selectedPatterns = localStorage.getItem('selectedPatterns') ? ref(localStorage.getItem('selectedPatterns').split(",")) : ref([])
export const selectedMistakes = localStorage.getItem('selectedMistakes') ? ref(localStorage.getItem('selectedMistakes').split(",")) : ref([])


export const selectedPositions = localStorage.getItem('selectedPositions') ? ref(localStorage.getItem('selectedPositions').split(",")) : ref([])
export const selectedTimeFrame = ref(localStorage.getItem('selectedTimeFrame'))
export const selectedRatio = ref(localStorage.getItem('selectedRatio'))
export const selectedAccount = ref(localStorage.getItem('selectedAccount'))
export const selectedAccounts = localStorage.getItem('selectedAccounts') ? ref(localStorage.getItem('selectedAccounts').split(",")) : ref([])
export const selectedGrossNet = ref(localStorage.getItem('selectedGrossNet'))
export const selectedPlSatisfaction = ref(localStorage.getItem('selectedPlSatisfaction'))
export const selectedBroker = ref(localStorage.getItem('selectedBroker'))
export const selectedDateRange = ref(JSON.parse(localStorage.getItem('selectedDateRange')))
export const selectedMonth = ref(JSON.parse(localStorage.getItem('selectedMonth')))
export const selectedPeriodRange = ref(JSON.parse(localStorage.getItem('selectedPeriodRange')))
export const selectedDashTab = ref(localStorage.getItem('selectedDashTab'))

export const amountCase = ref(localStorage.getItem('selectedGrossNet'))
export const amountCapital = ref()