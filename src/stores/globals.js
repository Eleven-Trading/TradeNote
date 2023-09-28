import { ref, reactive } from "vue";

/**************************************
* GENERAL
**************************************/
export const parseId = ref()
export const pageId = ref()
export const currentUser = ref()
export const timeZones = ref(["America/New_York", "Asia/Shanghai", "Europe/Brussels", "Asia/Tokyo", "Asia/Hong_Kong", "Asia/Kolkata", "Europe/London", "Asia/Riyadh"])
export const timeZoneTrade = ref()
export const queryLimit = ref(10000000)
export const endOfList = ref(false) //infinite scroll
export const noData = ref(false)
export const stepper = ref()
export const hasData = ref(false)
export const itemToEditId = ref(sessionStorage.getItem('editItemId'))
export const currentDate = ref()
export const quill = ref()
export const sideMenuMobileOut = ref(false)
export const screenType = ref()
export const saveButton = ref(false)

/**************************************
* PATTERNS, MISTAKES & SETUPS
**************************************/
export const patterns = reactive([])
export const mistakes = reactive([])
export const setups = reactive([])

export const screenshot = reactive({
    "side": null,
    "type": null
})
export const tradeSetupChanged = ref(false)
export const tradeSetupDateUnixDay = ref(null)
export const tradeSetupDateUnix = ref(null)
export const tradeSetupId = ref(null)

//Used in settings
export const patternUpdate = reactive({
    edit: null,
    name: null,
    description: null,
    active: null
})
export const mistakeUpdate = reactive({
    edit: null,
    name: null,
    description: null,
    active: null
})

export const patternNew = reactive({
    edit: null,
    name: null,
    description: null,
    active: null
})
export const mistakeNew = reactive({
    edit: null,
    name: null,
    description: null,
    active: null
})
export const activePatterns = reactive([])
export const activeMistakes = reactive([])



/**************************************
* LOADING AND MOUNTING
**************************************/
//General
export const spinnerLoadingPage = ref(true)
export const spinnerLoadingPageText = ref()
export const renderData = ref(0) //this is for updating DOM

export const spinnerLoadMore = ref(false) //infinite scroll

//Dashboard
export const dashboardChartsMounted = ref()
export const dashboardIdMounted = ref(false)

//Charts
export const renderingCharts = ref(true) // this is for spinner

//Setups
export const spinnerSetups = ref(true)
export const spinnerSetupsText = ref()


/**************************************
* MODALS
**************************************/
export const modalDailyTradeOpen = ref(false)

/**************************************
* TRADES
**************************************/
export const selectedRange = ref()
export const filteredTrades = reactive([])
export const filteredTradesDaily = reactive([])
export const filteredTradesTrades = reactive([])
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

export const futureContractsUsd = ref([
    {
        "name": "Micro E-mini S&P 500",
        "symbol": "MES",
        "type": "Micro E-mini Futures",
        "exchange": "CME",
        "unit": "USD",
        "contractSize": 5,
        "contractSizeExpl": "$5 x S&P Index",
        "months": "H,M,U,Z",
        "tick": 0.25,
        "value": 1.25
    },
    {
        "name": "Micro E-mini Nasdaq-100",
        "symbol": "MNQ",
        "type": "Micro E-mini Futures",
        "exchange": "CME",
        "unit": "USD",
        "contractSize": 2,
        "contractSizeExpl": "$2 x Nasdaq-100 Index",
        "months": "H,M,U,Z",
        "tick": 0.25,
        "value": 0.5
    },
    {
        "name": "Micro E-mini Dow",
        "symbol": "MYM",
        "type": "Micro E-mini Futures",
        "exchange": "CBOT\/CME",
        "unit": "USD",
        "contractSize": 0.5,
        "contractSizeExpl": "$0.50 x DJIA Index",
        "months": "H,M,U,Z",
        "tick": 1,
        "value": 0.5
    },
    {
        "name": "Micro E-mini Russell 2000",
        "symbol": "M2K",
        "type": "Micro E-mini Futures",
        "exchange": "CME",
        "unit": "USD",
        "contractSize": 5,
        "contractSizeExpl": "$5 x Russell 2000 Index",
        "months": "H,M,U,Z",
        "tick": 0.1,
        "value": 0.5
    },
    {
        "name": "E-mini S&P 500",
        "symbol": "ES",
        "type": "Stock Index",
        "exchange": "CME",
        "unit": "USD",
        "contractSize": 50,
        "contractSizeExpl": "$50 x Index Value",
        "months": "H,M,U,Z",
        "tick": 0.25,
        "value": 12.5
    },
    {
        "name": "E-mini Nasdaq-100",
        "symbol": "NQ",
        "type": "Stock Index",
        "exchange": "CME",
        "unit": "USD",
        "contractSize": 20,
        "contractSizeExpl": "$20 x Index Value",
        "months": "H,M,U,Z",
        "tick": 0.25,
        "value": 5
    },
    {
        "name": "E-mini Dow ($5)",
        "symbol": "YM",
        "type": "Stock Index",
        "exchange": "CBOT\/CME",
        "unit": "USD",
        "contractSize": 5,
        "contractSizeExpl": "$5 x Index Value",
        "months": "H,M,U,Z",
        "tick": 1,
        "value": 5
    },
    {
        "name": "E-mini Russell 2000",
        "symbol": "RTY",
        "type": "Stock Index",
        "exchange": "CME",
        "unit": "USD",
        "contractSize": 50,
        "contractSizeExpl": "$50 x Index Value",
        "months": "H,M,U,Z",
        "tick": 0.1,
        "value": 5
    },
    {
        "name": "E-mini S&P MidCap 400",
        "symbol": "EMD",
        "type": "Stock Index",
        "exchange": "CME",
        "unit": "USD",
        "contractSize": 100,
        "contractSizeExpl": "$100 x Index Value",
        "months": "H,M,U,Z",
        "tick": 0.1,
        "value": 10
    },
    {
        "name": "NIKKEI 225\/USD",
        "symbol": "NKD",
        "type": "Stock Index",
        "exchange": "CME",
        "unit": "USD",
        "contractSize": 5,
        "contractSizeExpl": "$5 x Index Value",
        "months": "H,M,U,Z",
        "tick": 5,
        "value": 25
    },
    {
        "name": "CBOE Volatility Index (VIX)",
        "symbol": "VX",
        "type": "Stock Index",
        "exchange": "CFE\/CBOE",
        "unit": "USD",
        "contractSize": 1000,
        "contractSizeExpl": "$1000 x Index Value",
        "months": "see exch.",
        "tick": 0.05,
        "value": 50
    },
    {
        "name": "Mini CBOE Volatility Index (Mini VIX)",
        "symbol": "VXM",
        "type": "Stock Index",
        "exchange": "CFE\/CBOE",
        "unit": "USD",
        "contractSize": 100,
        "contractSizeExpl": "$100 x Index Value",
        "months": "see exch.",
        "tick": 0.05,
        "value": 5
    },
    {
        "name": "SGX Nifty 50 Index",
        "symbol": "IN",
        "type": "Stock Index",
        "exchange": "Singapore Exchange (SGX)",
        "unit": "USD",
        "contractSize": 2,
        "contractSizeExpl": "$2 x Index Value",
        "months": "H,M,U,Z",
        "tick": 0.5,
        "value": 1
    },
    {
        "name": "SGX USD Nikkei 225 Index",
        "symbol": "NU",
        "type": "Stock Index",
        "exchange": "Singapore Exchange (SGX)",
        "unit": "USD",
        "contractSize": 5,
        "contractSizeExpl": "$5 x Index Value",
        "months": "H,M,U,Z",
        "tick": 5,
        "value": 25
    },
    {
        "name": "FTSE Taiwan Stock Index",
        "symbol": "TW",
        "type": "Stock Index",
        "exchange": "Singapore Exchange (SGX)",
        "unit": "USD",
        "contractSize": 100,
        "contractSizeExpl": "US$100 x SGX MSCI Taiwan Index",
        "months": "H,M,U,Z",
        "tick": 0.1,
        "value": 10
    },
    {
        "name": "ASX SPI200 Index",
        "symbol": "AP",
        "type": "Stock Index",
        "exchange": "Australian Securities Exchange (ASX)",
        "unit": "USD",
        "contractSize": 25,
        "contractSizeExpl": "$25 X Index Value",
        "months": "H,M,U,Z",
        "tick": 1,
        "value": 25
    },
    {
        "name": "Dollar Index",
        "symbol": "DX",
        "type": "Currencies",
        "exchange": "ICE Futures U.S.",
        "unit": "USD",
        "contractSize": 1000,
        "contractSizeExpl": "$1000 X Index Value",
        "months": "H,M,U,Z",
        "tick": 0.005,
        "value": 5
    },
    {
        "name": "Ultra U.S. Treasury Bond",
        "symbol": "UB",
        "type": "Financials",
        "exchange": "CBOT\/CME",
        "unit": "USD",
        "contractSize": 100000,
        "contractSizeExpl": "$100K bond",
        "months": "H,M,U,Z",
        "tick": 0.03125,
        "value": 3125
    },
    {
        "name": "Ultra 10-Year U.S. Treasury Note",
        "symbol": "TN",
        "type": "Financials",
        "exchange": "CBOT\/CME",
        "unit": "USD",
        "contractSize": 100000,
        "contractSizeExpl": "$100K Note",
        "months": "H,M,U,Z",
        "tick": 0.03125,
        "value": 3125
    },
    {
        "name": "3-Year U.S. Treasury Note",
        "symbol": "Z3N",
        "type": "Financials",
        "exchange": "CBOT\/CME",
        "unit": "USD",
        "contractSize": 300000,
        "contractSizeExpl": "$300K note",
        "months": "H,M,U,Z",
        "tick": 0.0078125,
        "value": 2343.75
    },
    {
        "name": "U.S. Treasury Bond",
        "symbol": "ZB",
        "type": "Financials",
        "exchange": "CBOT\/CME",
        "unit": "USD",
        "contractSize": 100000,
        "contractSizeExpl": "$100K bond",
        "months": "H,M,U,Z",
        "tick": 0.03125,
        "value": 3125
    },
    {
        "name": "Micro 30-Year Yield",
        "symbol": "30YY",
        "type": "Financials",
        "exchange": "CBOT\/CME",
        "unit": "USD",
        "contractSize": 10,
        "contractSizeExpl": "$10.00 DV01",
        "months": "H,M,U,Z",
        "tick": 0.1,
        "value": 1
    },
    {
        "name": "5-Year U.S. Treasury Note",
        "symbol": "ZF",
        "type": "Financials",
        "exchange": "CBOT\/CME",
        "unit": "USD",
        "contractSize": 100000,
        "contractSizeExpl": "$100K note",
        "months": "H,M,U,Z",
        "tick": 0.0078125,
        "value": 781.25
    },
    {
        "name": "Micro 5-Year Yield",
        "symbol": "5YY",
        "type": "Financials",
        "exchange": "CBOT\/CME",
        "unit": "USD",
        "contractSize": 10,
        "contractSizeExpl": "$10.00 DV01",
        "months": "H,M,U,Z",
        "tick": 0.1,
        "value": 1
    },
    {
        "name": "10-Year U.S. Treasury Note",
        "symbol": "ZN",
        "type": "Financials",
        "exchange": "CBOT\/CME",
        "unit": "USD",
        "contractSize": 100000,
        "contractSizeExpl": "$100K note",
        "months": "H,M,U,Z",
        "tick": 0.015625,
        "value": 1562.5
    },
    {
        "name": "Micro 10-Year Yield",
        "symbol": "10YY",
        "type": "Financials",
        "exchange": "CBOT\/CME",
        "unit": "USD",
        "contractSize": 10,
        "contractSizeExpl": "$10.00 DV01",
        "months": "H,M,U,Z",
        "tick": 0.1,
        "value": 1
    },
    {
        "name": "30-Day Federal Funds",
        "symbol": "ZQ",
        "type": "Financials",
        "exchange": "CBOT\/CME",
        "unit": "USD",
        "contractSize": 5000000,
        "contractSizeExpl": "$5 mil",
        "months": "All",
        "tick": 0.005,
        "value": 25000
    },
    {
        "name": "2-Year U.S. Treasury Note",
        "symbol": "ZT",
        "type": "Financials",
        "exchange": "CBOT\/CME",
        "unit": "USD",
        "contractSize": 200000,
        "contractSizeExpl": "$200K note",
        "months": "H,M,U,Z",
        "tick": 0.0078125,
        "value": 1562.5
    },
    {
        "name": "Micro 2-Year Yield",
        "symbol": "2YY",
        "type": "Financials",
        "exchange": "CBOT\/CME",
        "unit": "USD",
        "contractSize": 10,
        "contractSizeExpl": "$10.00 DV01",
        "months": "H,M,U,Z",
        "tick": 0.1,
        "value": 1
    },
    {
        "name": "Eurodollar",
        "symbol": "GE",
        "type": "Financials",
        "exchange": "CME",
        "unit": "USD",
        "contractSize": 1000000,
        "contractSizeExpl": "$1 mil",
        "months": "H,M,U,Z",
        "tick": 0.01,
        "value": 10000
    }
])

export const futuresTradeStationFees = ref([
    {
        "name": "Micro E-mini S&P 500",
        "symbol": "MES",
        "fee": 0.35
    },
    {
        "name": "Micro E-mini Nasdaq-100",
        "symbol": "MNQ",
        "fee": 0.35
    },
    {
        "name": "Micro E-mini Dow",
        "symbol": "MYM",
        "fee": 0.35
    },
    {
        "name": "Micro E-mini Russell 2000",
        "symbol": "M2K",
        "fee": 0.35
    },
    {
        "name": "E-mini S&P 500",
        "symbol": "ES",
        "fee": 0.35
    },
    {
        "name": "E-mini Nasdaq-100",
        "symbol": "NQ",
        "fee": 0.35
    },
    {
        "name": "E-mini Dow ($5)",
        "symbol": "YM",
        "fee": 0.35
    },
    {
        "name": "E-mini Russell 2000",
        "symbol": "RTY",
        "fee": 0.35
    },
    {
        "name": "E-mini S&P MidCap 400",
        "symbol": "EMD",
        "fee": 0.35
    },
    {
        "name": "NIKKEI 225\/USD",
        "symbol": "NKD",
        "fee": 0.35
    },
    {
        "name": "CBOE Volatility Index (VIX)",
        "fee": 0.35
    },
    {
        "name": "Mini CBOE Volatility Index (Mini VIX)",
        "symbol": "VXM",
        "fee": 0.35
    },
    {
        "name": "SGX Nifty 50 Index",
        "symbol": "IN",
        "fee": 0.35
    },
    {
        "name": "SGX USD Nikkei 225 Index",
        "symbol": "NU",
        "fee": 0.35
    },
    {
        "name": "FTSE Taiwan Stock Index",
        "symbol": "TW",
        "fee": 0.35
    },
    {
        "name": "ASX SPI200 Index",
        "symbol": "AP",
        "fee": 0.35
    },
    {
        "name": "Dollar Index",
        "symbol": "DX",
        "fee": 0.35
    },
    {
        "name": "Ultra U.S. Treasury Bond",
        "symbol": "UB",
        "fee": 0.35
    },
    {
        "name": "Ultra 10-Year U.S. Treasury Note",
        "symbol": "TN",
        "fee": 0.35
    },
    {
        "name": "3-Year U.S. Treasury Note",
        "symbol": "Z3N",
        "fee": 0.35
    },
    {
        "name": "U.S. Treasury Bond",
        "symbol": "ZB",
        "fee": 0.35
    },
    {
        "name": "Micro 30-Year Yield",
        "symbol": "30YY",
        "fee": 0.35
    },
    {
        "name": "5-Year U.S. Treasury Note",
        "symbol": "ZF",
        "fee": 0.35
    },
    {
        "name": "Micro 5-Year Yield",
        "symbol": "5YY",
        "fee": 0.35
    },
    {
        "name": "10-Year U.S. Treasury Note",
        "symbol": "ZN",
        "fee": 0.35
    },
    {
        "name": "Micro 10-Year Yield",
        "symbol": "10YY",
        "fee": 0.35
    },
    {
        "name": "30-Day Federal Funds",
        "symbol": "ZQ",
        "fee": 0.35
    },
    {
        "name": "2-Year U.S. Treasury Note",
        "symbol": "ZT",
        "fee": 0.35
    },
    {
        "name": "Micro 2-Year Yield",
        "symbol": "2YY",
        "fee": 0.35
    },
    {
        "name": "Eurodollar",
        "symbol": "GE",
        "fee": 0.35
    }
])

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
export const dailyPagination = ref(0)
export const dailyQueryLimit = ref(3)

export const itemTradeIndex = ref()
export const tradeIndex = ref()
export const tradeIndexPrevious = ref()

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

export const satisfactionTradeArray = reactive([])
export const satisfactionArray = reactive([])
export const excursions = reactive([])
/**************************************
* SCREENSHOTS
**************************************/
export const screenshots = reactive([])
export const tradeScreenshotChanged = ref(false)
export const markerAreaOpen = ref(false)
export const screenshotsNames = reactive([])
export const dateScreenshotEdited = ref(false)
export const screenshotsPagination = ref(0)
export const resizeCompressImg = ref(false)
export const resizeCompressMaxWidth = ref(1000)
export const resizeCompressMaxHeight = ref(1000)
export const resizeCompressQuality = ref(0.8)
export const expandedScreenshot = ref(null)
export const expandedId = ref(null)
export const expandedSource = ref(null)
export const selectedScreenshot = reactive({})
export const selectedScreenshotIndex = ref(null)
export const selectedScreenshotSource = ref(null)
export const getMore = ref(false)

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
    label: "Template",
    assetTypes: ["stocks"]
},
{
    value: "tradeZero",
    label: "TradeZero",
    assetTypes: ["stocks"]
},
{
    value: "metaTrader5",
    label: "MetaTrader 5",
    assetTypes: ["forex"]
},
{
    value: "tdAmeritrade",
    label: "TD Ameritrade",
    assetTypes: ["stocks", "options", "futures"]
},
{
    value: "tradeStation",
    label: "TradeStation",
    assetTypes: ["stocks", "options", "futures"]
},
{
    value: "interactiveBrokers",
    label: "Interactive Brokers",
    assetTypes: ["stocks", "options", "futures"]
},
/*{
    value: "ninjaTrader",
    label: "NinjaTrader"
},*/
{
    value: "heldentrader",
    label: "Heldentrader",
    assetTypes: ["stocks"]
}
])

export const brokerData = ref()

/**************************************
* SETTINGS
**************************************/
export const renderProfile = ref(0)

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