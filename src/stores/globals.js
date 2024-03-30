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
export const latestVersion = ref()
export const windowIsScrolled = ref()

export const idCurrent = ref()
export const idPrevious = ref()
export const idCurrentType = ref()
export const idCurrentNumber = ref()
export const idPreviousType = ref()
export const idPreviousNumber = ref()


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

//Legacy 
export const legacy = reactive([])

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

export const futureContractsJson = ref(
    [
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
            "contractSize": 0,
            "contractSizeExpl": "$0.50 x DJIA Index",
            "months": "H,M,U,Z",
            "tick": 1,
            "value": 0
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
            "name": "Micro-DAX",
            "symbol": "FDXS",
            "type": "Micro E-mini Futures",
            "exchange": "Eurex",
            "unit": "EUR",
            "contractSize": 1,
            "contractSizeExpl": "€1 x Index Value",
            "months": "H,M,U,Z",
            "tick": 1,
            "value": 1
        },
        {
            "name": "Micro-EURO STOXX 50",
            "symbol": "FSXE",
            "type": "Micro E-mini Futures",
            "exchange": "Eurex",
            "unit": "EUR",
            "contractSize": 1,
            "contractSizeExpl": "€1 x Index Value",
            "months": "H,M,U,Z",
            "tick": 0.5,
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
            "name": "DAX",
            "symbol": "FDAX",
            "type": "Stock Index",
            "exchange": "Eurex",
            "unit": "EUR",
            "contractSize": 25,
            "contractSizeExpl": "€25 x Index Value",
            "months": "H,M,U,Z",
            "tick": 1,
            "value": 25
        },
        {
            "name": "Mini-DAX",
            "symbol": "FDXM",
            "type": "Stock Index",
            "exchange": "Eurex",
            "unit": "EUR",
            "contractSize": 5,
            "contractSizeExpl": "€5 x Index Value",
            "months": "H,M,U,Z",
            "tick": 1,
            "value": 5
        },
        {
            "name": "EURO STOXX 50",
            "symbol": "FESX",
            "type": "Stock Index",
            "exchange": "Eurex",
            "unit": "EUR",
            "contractSize": 20,
            "contractSizeExpl": "€10 x Index Value",
            "months": "H,M,U,Z",
            "tick": 1,
            "value": 20
        },
        {
            "name": "STOXX Europe 600",
            "symbol": "FXXP",
            "type": "Stock Index",
            "exchange": "Eurex",
            "unit": "EUR",
            "contractSize": 50,
            "contractSizeExpl": "€50 x Index Value",
            "months": "H,M,U,Z",
            "tick": 0.1,
            "value": 5
        },
        {
            "name": "EURO STOXX Banks",
            "symbol": "FESB",
            "type": "Stock Index",
            "exchange": "Eurex",
            "unit": "EUR",
            "contractSize": 50,
            "contractSizeExpl": "€50 x Index Value",
            "months": "H,M,U,Z",
            "tick": 0.05,
            "value": 2.5
        },
        {
            "name": "VSTOXX",
            "symbol": "FVS",
            "type": "Stock Index",
            "exchange": "Eurex",
            "unit": "EUR",
            "contractSize": 100,
            "contractSizeExpl": "€100 x Index Value",
            "months": "see exch.",
            "tick": 0.05,
            "value": 5
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
            "name": "British Pound",
            "symbol": "6B",
            "type": "Currencies",
            "exchange": "CME",
            "unit": "GBP",
            "contractSize": 62500,
            "contractSizeExpl": "62.5K £",
            "months": "H,M,U,Z",
            "tick": 0.0001,
            "value": 6.25
        },
        {
            "name": "Canadian Dollar",
            "symbol": "6C",
            "type": "Currencies",
            "exchange": "CME",
            "unit": "USD",
            "contractSize": 100000,
            "contractSizeExpl": "100K $",
            "months": "H,M,U,Z",
            "tick": 5E-05,
            "value": 5
        },
        {
            "name": "Euro FX",
            "symbol": "6E",
            "type": "Currencies",
            "exchange": "CME",
            "unit": "USD",
            "contractSize": 125000,
            "contractSizeExpl": "125K €",
            "months": "H,M,U,Z",
            "tick": 5E-05,
            "value": 6.25
        },
        {
            "name": "Japanese Yen",
            "symbol": "6J",
            "type": "Currencies",
            "exchange": "CME",
            "unit": "USD",
            "contractSize": 12500000,
            "contractSizeExpl": "12.5 mil ¥",
            "months": "H,M,U,Z",
            "tick": 5E-07,
            "value": 6.25
        },
        {
            "name": "New Zealand Dollar",
            "symbol": "6N",
            "type": "Currencies",
            "exchange": "CME",
            "unit": "NZD",
            "contractSize": 100000,
            "contractSizeExpl": "100K NZD",
            "months": "H,M,U,Z",
            "tick": 5E-05,
            "value": 5
        },
        {
            "name": "Swiss Franc",
            "symbol": "6S",
            "type": "Currencies",
            "exchange": "CME",
            "unit": "CHF",
            "contractSize": 125000,
            "contractSizeExpl": "125K CHF",
            "months": "H,M,U,Z",
            "tick": 0.0001,
            "value": 12.5
        },
        {
            "name": "E-mini Euro FX",
            "symbol": "E7",
            "type": "Currencies",
            "exchange": "CME",
            "unit": "EUR",
            "contractSize": 62500,
            "contractSizeExpl": "62.5K €",
            "months": "H,M,U,Z",
            "tick": 0.0001,
            "value": 6.25
        },
        {
            "name": "E-mini Japanese Yen",
            "symbol": "J7",
            "type": "Currencies",
            "exchange": "CME",
            "unit": "YEN",
            "contractSize": 62500000,
            "contractSizeExpl": "6.25 mil ¥",
            "months": "H,M,U,Z",
            "tick": 1E-06,
            "value": 62.5
        },
        {
            "name": "Micro AUD\/USD",
            "symbol": "M6A",
            "type": "Currencies",
            "exchange": "CME",
            "unit": "AUD",
            "contractSize": 10000,
            "contractSizeExpl": "10K AUD",
            "months": "H,M,U,Z",
            "tick": 0.0001,
            "value": 1
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
            "name": "Crude Oil",
            "symbol": "CL",
            "type": "Energies",
            "exchange": "NYMEX\/CME",
            "unit": "barrels",
            "contractSize": 1000,
            "contractSizeExpl": "1,000 barrels",
            "months": "All",
            "tick": 0.01,
            "value": 10
        },
        {
            "name": "E-mini Crude Light",
            "symbol": "QM",
            "type": "Energies",
            "exchange": "NYMEX\/CME",
            "unit": "barrels",
            "contractSize": 500,
            "contractSizeExpl": "500 barrels",
            "months": "All",
            "tick": 0.025,
            "value": 12.5
        },
        {
            "name": "Micro WTI Crude Oil",
            "symbol": "MCL",
            "type": "Energies",
            "exchange": "NYMEX\/CME",
            "unit": "barrels",
            "contractSize": 100,
            "contractSizeExpl": "100 barrels",
            "months": "All",
            "tick": 0.01,
            "value": 1
        },
        {
            "name": "Natural Gas",
            "symbol": "NG",
            "type": "Energies",
            "exchange": "NYMEX\/CME",
            "unit": "mmBtu",
            "contractSize": 10000,
            "contractSizeExpl": "10,000 mmBtu",
            "months": "All",
            "tick": 0.001,
            "value": 10
        },
        {
            "name": "E-mini Natural Gas",
            "symbol": "QG",
            "type": "Energies",
            "exchange": "NYMEX\/CME",
            "unit": "mmBtu",
            "contractSize": 2500,
            "contractSizeExpl": "2,500 mmBtu",
            "months": "All",
            "tick": 0.005,
            "value": 12.5
        },
        {
            "name": "RBOB Gasoline",
            "symbol": "RB",
            "type": "Energies",
            "exchange": "NYMEX\/CME",
            "unit": "gal",
            "contractSize": 42000,
            "contractSizeExpl": "42K gal",
            "months": "All",
            "tick": 0.0001,
            "value": 4.2
        },
        {
            "name": "Heating Oil",
            "symbol": "HO",
            "type": "Energies",
            "exchange": "NYMEX\/CME",
            "unit": "gal",
            "contractSize": 42000,
            "contractSizeExpl": "42K gal",
            "months": "All",
            "tick": 0.0001,
            "value": 4.2
        },
        {
            "name": "ICE Brent Crude",
            "symbol": "B",
            "type": "Energies",
            "exchange": "ICE Europe - Commodities",
            "unit": "gal",
            "contractSize": 42000,
            "contractSizeExpl": "42K gal",
            "months": "All",
            "tick": 0.01,
            "value": 420
        },
        {
            "name": "ICE WTI Crude",
            "symbol": "T",
            "type": "Energies",
            "exchange": "ICE Europe - Commodities",
            "unit": "gal",
            "contractSize": 42000,
            "contractSizeExpl": "42K gal",
            "months": "All",
            "tick": 0.01,
            "value": 420
        },
        {
            "name": "ICE Gas Oil",
            "symbol": "G",
            "type": "Energies",
            "exchange": "ICE Europe - Commodities",
            "unit": "tonnes",
            "contractSize": 100,
            "contractSizeExpl": "100 tonnes",
            "months": "H,M,U,Z",
            "tick": 0.25,
            "value": 25
        },
        {
            "name": "Gold",
            "symbol": "GC",
            "type": "Metals",
            "exchange": "COMEX\/CME",
            "unit": "oz",
            "contractSize": 100,
            "contractSizeExpl": "100 oz",
            "months": "G,J,M,Q,V,Z",
            "tick": 0.1,
            "value": 10
        },
        {
            "name": "E-mini Gold",
            "symbol": "QO",
            "type": "Metals",
            "exchange": "COMEX\/CME",
            "unit": "oz",
            "contractSize": 50,
            "contractSizeExpl": "50 oz",
            "months": "F,G,J,M,Q,V,Z",
            "tick": 0.25,
            "value": 12.5
        },
        {
            "name": "Micro Gold",
            "symbol": "MGC",
            "type": "Metals",
            "exchange": "COMEX\/CME",
            "unit": "oz",
            "contractSize": 10,
            "contractSizeExpl": "10 oz",
            "months": "G,J,M,Q,V,Z",
            "tick": 0.1,
            "value": 1
        },
        {
            "name": "Copper",
            "symbol": "HG",
            "type": "Metals",
            "exchange": "COMEX\/CME",
            "unit": "lbs",
            "contractSize": 25000,
            "contractSizeExpl": "25K lbs",
            "months": "All",
            "tick": 0.0005,
            "value": 12.5
        },
        {
            "name": "E-mini Copper",
            "symbol": "QC",
            "type": "Metals",
            "exchange": "COMEX\/CME",
            "unit": "lbs",
            "contractSize": 12500,
            "contractSizeExpl": "12,500 lbs",
            "months": "All",
            "tick": 0.002,
            "value": 25
        },
        {
            "name": "Silver",
            "symbol": "SI",
            "type": "Metals",
            "exchange": "COMEX\/CME",
            "unit": "oz",
            "contractSize": 5000,
            "contractSizeExpl": "5,000 oz",
            "months": "F,H,K,N,U,Z",
            "tick": 0.005,
            "value": 25
        },
        {
            "name": "E-mini Silver",
            "symbol": "QI",
            "type": "Metals",
            "exchange": "COMEX\/CME",
            "unit": "oz",
            "contractSize": 2500,
            "contractSizeExpl": "2,500 oz",
            "months": "F,G,H,K,N,U,Z",
            "tick": 0.0125,
            "value": 31.25
        },
        {
            "name": "E-micro Silver",
            "symbol": "SIL",
            "type": "Metals",
            "exchange": "COMEX\/CME",
            "unit": "oz",
            "contractSize": 1000,
            "contractSizeExpl": "1,000 oz",
            "months": "F,H,K,N,U,V,X,Z",
            "tick": 0.01,
            "value": 10
        },
        {
            "name": "Platinum",
            "symbol": "PL",
            "type": "Metals",
            "exchange": "NYMEX\/CME",
            "unit": "oz",
            "contractSize": 50,
            "contractSizeExpl": "50 oz",
            "months": "F,J,N,V",
            "tick": 0.1,
            "value": 5
        },
        {
            "name": "Mini Gold",
            "symbol": "YG",
            "type": "Metals",
            "exchange": "ICE Futures U.S.",
            "unit": "oz",
            "contractSize": 33,
            "contractSizeExpl": "33.15 oz",
            "months": "All",
            "tick": 0.1,
            "value": 3.3000000000000003
        },
        {
            "name": "Mini-Silver",
            "symbol": "YI",
            "type": "Metals",
            "exchange": "ICE Futures U.S.",
            "unit": "oz",
            "contractSize": 1000,
            "contractSizeExpl": "1,000 oz",
            "months": "All",
            "tick": 0.001,
            "value": 1
        },
        {
            "name": "100 oz Gold",
            "symbol": "ZG",
            "type": "Metals",
            "exchange": "ICE Futures U.S.",
            "unit": "oz",
            "contractSize": 100,
            "contractSizeExpl": "100 oz",
            "months": "G,J,M,Q,V,X,Z",
            "tick": 0.1,
            "value": 10
        },
        {
            "name": "5000 oz Silver",
            "symbol": "ZI",
            "type": "Metals",
            "exchange": "ICE Futures U.S.",
            "unit": "oz",
            "contractSize": 5000,
            "contractSizeExpl": "5,000 oz",
            "months": "F,H,K,N,U,V,X,Z",
            "tick": 0.001,
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
        },
        {
            "name": "Long-Term Euro-BTP",
            "symbol": "FBTP",
            "type": "Financials",
            "exchange": "Eurex",
            "unit": "EUR",
            "contractSize": 100000,
            "contractSizeExpl": "100K€",
            "months": "H,M,U,Z",
            "tick": 0.01,
            "value": 10
        },
        {
            "name": "Short-Term Euro-BTP",
            "symbol": "FBTS",
            "type": "Financials",
            "exchange": "Eurex",
            "unit": "EUR",
            "contractSize": 100000,
            "contractSizeExpl": "100K€",
            "months": "H,M,U,Z",
            "tick": 0.01,
            "value": 10
        },
        {
            "name": "Euro-Bund",
            "symbol": "FGBL",
            "type": "Financials",
            "exchange": "Eurex",
            "unit": "EUR",
            "contractSize": 100000,
            "contractSizeExpl": "100K €",
            "months": "H,M,U,Z",
            "tick": 0.01,
            "value": 10
        },
        {
            "name": "Euro-Bobl",
            "symbol": "FGBM",
            "type": "Financials",
            "exchange": "Eurex",
            "unit": "EUR",
            "contractSize": 100000,
            "contractSizeExpl": "100K €",
            "months": "H,M,U,Z",
            "tick": 0.01,
            "value": 10
        },
        {
            "name": "Euro-Schatz",
            "symbol": "FGBS",
            "type": "Financials",
            "exchange": "Eurex",
            "unit": "EUR",
            "contractSize": 100000,
            "contractSizeExpl": "100K €",
            "months": "H,M,U,Z",
            "tick": 0.005,
            "value": 5
        },
        {
            "name": "Euro-Buxl",
            "symbol": "FGBX",
            "type": "Financials",
            "exchange": "Eurex",
            "unit": "EUR",
            "contractSize": 100000,
            "contractSizeExpl": "100K€",
            "months": "H,M,U,Z",
            "tick": 0.02,
            "value": 20
        },
        {
            "name": "Euro-OAT",
            "symbol": "FOAT",
            "type": "Financials",
            "exchange": "Eurex",
            "unit": "EUR",
            "contractSize": 100000,
            "contractSizeExpl": "100K€",
            "months": "H,M,U,Z",
            "tick": 0.01,
            "value": 10
        }
    ]
)

export const futuresTradeStationFees = ref([
    {
        "name": "Micro E-Mini Futures",
        "symbol": "MYM",
        "fee": 0.35
    },
    {
        "name": "Mini Index",
        "symbol": "YM",
        "fee": 1.33
    },
    {
        "name": "Financial",
        "symbol": "FF",
        "fee": 0.96
    },
    {
        "name": "Financial",
        "symbol": "NI",
        "fee": 0.96
    },
    {
        "name": "Financial",
        "symbol": "RS5",
        "fee": 0.96
    },
    {
        "name": "Treasury",
        "symbol": "FV",
        "fee": 0.65
    },
    {
        "name": "Treasury",
        "symbol": "TU",
        "fee": 0.65
    },
    {
        "name": "US Treasury Note",
        "symbol": "TY",
        "fee": 0.80
    },
    {
        "name": "US Treasury Bond",
        "symbol": "TWE",
        "fee": 0.87
    },
    {
        "name": "US Treasury Bond",
        "symbol": "US",
        "fee": 0.87
    },
    {
        "name": "Ultra US Treasury Bond",
        "symbol": "UB",
        "fee": 0.95
    },
    {
        "name": "Mini Agricultural",
        "symbol": "YC",
        "fee": 1.03
    },
    {
        "name": "Mini Agricultural",
        "symbol": "YK",
        "fee": 1.03
    },
    {
        "name": "Mini Agricultural",
        "symbol": "YW",
        "fee": 1.03
    },
    {
        "name": "Agricultural",
        "symbol": "C",
        "fee": 2.10
    },
    {
        "name": "Agricultural",
        "symbol": "O",
        "fee": 2.10
    },
    {
        "name": "Agricultural",
        "symbol": "RR",
        "fee": 2.10
    },
    {
        "name": "Agricultural",
        "symbol": "W",
        "fee": 2.10
    },
    {
        "name": "Agricultural",
        "symbol": "KW",
        "fee": 2.10
    },
    {
        "name": "Agricultural",
        "symbol": "S",
        "fee": 2.10
    },
    {
        "name": "Agricultural",
        "symbol": "BO",
        "fee": 2.10
    },
    {
        "name": "Agricultural",
        "symbol": "SMC",
        "fee": 2.10
    },
    {
        "name": "Agricultural",
        "symbol": "BS",
        "fee": 2.10
    },
    {
        "name": "Agricultural",
        "symbol": "AC",
        "fee": 2.10
    },
    {
        "name": "Micro E-Mini Futures",
        "symbol": "MES",
        "fee": 0.35
    },
    {
        "name": "Micro E-Mini Futures",
        "symbol": "MNQ",
        "fee": 0.35
    },
    {
        "name": "Micro E-Mini Futures",
        "symbol": "M2K",
        "fee": 0.35
    },
    {
        "name": "CME Bitcoin Futures",
        "symbol": "BTC",
        "fee": 6.00
    },
    {
        "name": "CME Micro Bitcoin Futures",
        "symbol": "MBT",
        "fee": 2.50
    },
    {
        "name": "CME Ether Futures",
        "symbol": "ETH",
        "fee": 4.00
    },
    {
        "name": "CME Micro Ether Futures",
        "symbol": "MET",
        "fee": 0.20
    },
    {
        "name": "E-Mini Index",
        "symbol": "ES",
        "fee": 1.33
    },
    {
        "name": "E-Mini Index",
        "symbol": "NQ",
        "fee": 1.33
    },
    {
        "name": "E-Mini Index",
        "symbol": "RTY",
        "fee": 1.33
    },
    {
        "name": "E-Mini Index",
        "symbol": "R2G",
        "fee": 1.33
    },
    {
        "name": "E-Mini Index",
        "symbol": "R2V",
        "fee": 1.33
    },
    {
        "name": "E-Mini Index",
        "symbol": "EMD",
        "fee": 1.33
    },
    {
        "name": "E-Mini Index",
        "symbol": "SMC",
        "fee": 1.33
    },
    {
        "name": "E-Mini Index",
        "symbol": "XAE",
        "fee": 1.33
    },
    {
        "name": "E-Mini Index",
        "symbol": "XAF",
        "fee": 1.33
    },
    {
        "name": "E-Mini Index",
        "symbol": "XAV",
        "fee": 1.33
    },
    {
        "name": "E-Mini Index",
        "symbol": "XAI",
        "fee": 1.33
    },
    {
        "name": "E-Mini Index",
        "symbol": "XAB",
        "fee": 1.33
    },
    {
        "name": "E-Mini Index",
        "symbol": "XAK",
        "fee": 1.33
    },
    {
        "name": "E-Mini Index",
        "symbol": "XAU",
        "fee": 1.33
    },
    {
        "name": "E-Mini Index",
        "symbol": "XAP",
        "fee": 1.33
    },
    {
        "name": "E-Mini Index",
        "symbol": "XAY",
        "fee": 1.33
    },
    {
        "name": "Commodities",
        "symbol": "LC",
        "fee": 2.10
    },
    {
        "name": "Commodities",
        "symbol": "FC",
        "fee": 2.10
    },
    {
        "name": "Commodities",
        "symbol": "LH",
        "fee": 2.10
    },
    {
        "name": "Commodities",
        "symbol": "CB",
        "fee": 2.10
    },
    {
        "name": "Commodities",
        "symbol": "DA",
        "fee": 2.10
    },
    {
        "name": "Commodities",
        "symbol": "LB",
        "fee": 2.10
    },
    {
        "name": "Commodities",
        "symbol": "DY",
        "fee": 2.10
    },
    {
        "name": "E-Mini Currency",
        "symbol": "E7",
        "fee": 0.85
    },
    {
        "name": "E-Mini Currency",
        "symbol": "J7",
        "fee": 0.85
    },
    {
        "name": "Currency",
        "symbol": "AD",
        "fee": 1.60
    },
    {
        "name": "Currency",
        "symbol": "BR",
        "fee": 1.60
    },
    {
        "name": "Currency",
        "symbol": "BP",
        "fee": 1.60
    },
    {
        "name": "Currency",
        "symbol": "CD",
        "fee": 1.60
    },
    {
        "name": "Currency",
        "symbol": "EC",
        "fee": 1.60
    },
    {
        "name": "Currency",
        "symbol": "JY",
        "fee": 1.60
    },
    {
        "name": "Currency",
        "symbol": "MP1",
        "fee": 1.60
    },
    {
        "name": "Currency",
        "symbol": "NE1",
        "fee": 1.60
    },
    {
        "name": "Currency",
        "symbol": "RA",
        "fee": 1.60
    },
    {
        "name": "Currency",
        "symbol": "RF",
        "fee": 1.60
    },
    {
        "name": "Currency",
        "symbol": "RP",
        "fee": 1.60
    },
    {
        "name": "Currency",
        "symbol": "RU",
        "fee": 1.60
    },
    {
        "name": "Currency",
        "symbol": "RY",
        "fee": 1.60
    },
    {
        "name": "Currency",
        "symbol": "SF",
        "fee": 1.60
    },
    {
        "name": "Interest Rate",
        "symbol": "ED",
        "fee": 1.25
    },
    {
        "name": "Interest Rate",
        "symbol": "EM",
        "fee": 1.25
    },
    {
        "name": "Nikkei",
        "symbol": "NIY",
        "fee": 2.15
    },
    {
        "name": "Nikkei",
        "symbol": "NK",
        "fee": 2.15
    },
    {
        "name": "E-Micro Currency",
        "symbol": "M6A",
        "fee": 0.24
    },
    {
        "name": "E-Micro Currency",
        "symbol": "M6B",
        "fee": 0.24
    },
    {
        "name": "E-Micro Currency",
        "symbol": "M6C",
        "fee": 0.24
    },
    {
        "name": "E-Micro Currency",
        "symbol": "M6E",
        "fee": 0.24
    },
    {
        "name": "E-Micro Currency",
        "symbol": "M6J",
        "fee": 0.24
    },
    {
        "name": "E-Micro Currency",
        "symbol": "M6S",
        "fee": 0.24
    },
    {
        "name": "Micro Treasury Yield Futures",
        "symbol": "2YY",
        "fee": 0.30
    },
    {
        "name": "Micro Treasury Yield Futures",
        "symbol": "5YY",
        "fee": 0.30
    },
    {
        "name": "Micro Treasury Yield Futures",
        "symbol": "10Y",
        "fee": 0.30
    },
    {
        "name": "Micro Treasury Yield Futures",
        "symbol": "30Y",
        "fee": 0.30
    },
    {
        "name": "COMEX Metals",
        "symbol": "ALI",
        "fee": 2.50
    },
    {
        "name": "NYMEX Micro Crude Oil Futures",
        "symbol": "MCL",
        "fee": 0.50
    },
    {
        "name": "NYMEX e-miNY Energy",
        "symbol": "QM",
        "fee": 1.20
    },
    {
        "name": "NYMEX e-miNY Energy",
        "symbol": "QH",
        "fee": 1.20
    },
    {
        "name": "NYMEX e-miNY Energy",
        "symbol": "QU",
        "fee": 1.20
    },
    {
        "name": "NYMEX Energy Physically Delivered",
        "symbol": "CL",
        "fee": 1.50
    },
    {
        "name": "NYMEX Energy Physically Delivered",
        "symbol": "NG",
        "fee": 1.50
    },
    {
        "name": "NYMEX Energy Physically Delivered",
        "symbol": "HO",
        "fee": 1.50
    },
    {
        "name": "NYMEX Energy Physically Delivered",
        "symbol": "RB",
        "fee": 1.50
    },
    {
        "name": "NYMEX Energy Physically Delivered",
        "symbol": "MHO",
        "fee": 0.60
    },
    {
        "name": "NYMEX Energy Physically Delivered",
        "symbol": "MRB",
        "fee": 0.60
    },
    {
        "name": "NYMEX Softs",
        "symbol": "CJ",
        "fee": 1.45
    },
    {
        "name": "NYMEX Softs",
        "symbol": "KT",
        "fee": 1.45
    },
    {
        "name": "NYMEX Softs",
        "symbol": "TT",
        "fee": 1.45
    },
    {
        "name": "NYMEX Softs",
        "symbol": "YO",
        "fee": 1.45
    },
    {
        "name": "COMEX e-micro Gold",
        "symbol": "MGC",
        "fee": 0.50
    },
    {
        "name": "COMEX e-micro Silver",
        "symbol": "SIL",
        "fee": 1.00
    },
    {
        "name": "COMEX e-miNY Metals",
        "symbol": "QO",
        "fee": 0.75
    },
    {
        "name": "COMEX e-miNY Metals",
        "symbol": "QC",
        "fee": 0.75
    },
    {
        "name": "COMEX e-miNY Silver",
        "symbol": "QI",
        "fee": 0.75
    },
    {
        "name": "COMEX Metals",
        "symbol": "GC",
        "fee": 1.55
    },
    {
        "name": "COMEX Metals",
        "symbol": "SI",
        "fee": 1.55
    },
    {
        "name": "COMEX Metals",
        "symbol": "HG",
        "fee": 1.55
    },
    {
        "name": "NYMEX e-miNY Natural Gas",
        "symbol": "QN",
        "fee": 0.50
    },
    {
        "name": "NYMEX Metals",
        "symbol": "PL",
        "fee": 1.55
    },
    {
        "name": "NYMEX Metals",
        "symbol": "PA",
        "fee": 1.55
    },
    {
        "name": "NYMEX Uranium",
        "symbol": "UX",
        "fee": 1.45
    },
    {
        "name": "VIX Futures",
        "symbol": "VX",
        "fee": 1.49
    },
    {
        "name": "Mini VIX Futures",
        "symbol": "VXM",
        "fee": 0.20
    },
    {
        "name": "ICE U.S. Mini Metals",
        "symbol": "YG",
        "fee": 0.55
    },
    {
        "name": "ICE U.S. Mini Metals",
        "symbol": "YI",
        "fee": 0.55
    },
    {
        "name": "ICE U.S. MSCI Indices",
        "symbol": "MFS",
        "fee": 1.20
    },
    {
        "name": "ICE U.S. MSCI Indices",
        "symbol": "MME",
        "fee": 1.20
    },
    {
        "name": "ICE U.S. Metals",
        "symbol": "ZG",
        "fee": 0.55
    },
    {
        "name": "ICE U.S. Metals",
        "symbol": "ZI",
        "fee": 0.55
    },
    {
        "name": "ICE U.S. NYBOT Softs",
        "symbol": "CC",
        "fee": 2.10
    },
    {
        "name": "ICE U.S. NYBOT Softs",
        "symbol": "KC",
        "fee": 2.10
    },
    {
        "name": "ICE U.S. NYBOT Softs",
        "symbol": "SB",
        "fee": 2.10
    },
    {
        "name": "ICE U.S. NYBOT Softs",
        "symbol": "OJ",
        "fee": 2.10
    },
    {
        "name": "ICE U.S. NYBOT Softs",
        "symbol": "CT",
        "fee": 2.10
    },
    {
        "name": "ICE U.S. Indices",
        "symbol": "DX",
        "fee": 1.35
    },
    {
        "name": "ICE U.S. Indices",
        "symbol": "CCI",
        "fee": 1.35
    },
    {
        "name": "ICE U.S. Russell 1000 Index",
        "symbol": "RF2",
        "fee": 0.30
    },
    {
        "name": "ICE U.S. Russell 2000 Index",
        "symbol": "TF",
        "fee": 0.65
    }
])

export const futuresTradovateFees = ref([
    {
        "name": "Nano Bloomberg Large Cap",
        "symbol": "B5",
        "fee": {
            "free": 0.39,
            "monthly": 0.34,
            "lifetime": 0.24
        }
    },
    {
        "name": "Micro Bloomberg Large Cap",
        "symbol": "LB5",
        "fee": {
            "free": 0.42,
            "monthly": 0.37,
            "lifetime": 0.27
        }
    },
    {
        "name": "Nano SuperTech",
        "symbol": "TEC",
        "fee": {
            "free": 0.39,
            "monthly": 0.34,
            "lifetime": 0.24
        }
    },
    {
        "name": "Micro SuperTech",
        "symbol": "LTEC",
        "fee": {
            "free": 0.42,
            "monthly": 0.37,
            "lifetime": 0.27
        }
    },
    {
        "name": "Coinbase Futures Crude Oil",
        "symbol": "OIL",
        "fee": {
            "free": 0.42,
            "monthly": 0.37,
            "lifetime": 0.27
        }
    },
    {
        "name": "Nano Bitcoin",
        "symbol": "BIT",
        "fee": {
            "free": 0.47,
            "monthly": 0.42,
            "lifetime": 0.32
        }
    },
    {
        "name": "Nano Ether",
        "symbol": "ET",
        "fee": {
            "free": 0.47,
            "monthly": 0.42,
            "lifetime": 0.32
        }
    },
    {
        "name": "E-Mini Dow ($5)",
        "symbol": "YM",
        "fee": {
            "free": 2.79,
            "monthly": 2.49,
            "lifetime": 2.09,
            "Apex": 1.5,
            "Topstep": 2.09
        }
    },
    {
        "name": "E-Mini S&P 500",
        "symbol": "ES",
        "fee": {
            "free": 2.79,
            "monthly": 2.49,
            "lifetime": 2.09,
            "Apex": 1.5,
            "Topstep": 2.09
        }
    },
    {
        "name": "E-Mini NASDAQ",
        "symbol": "NQ",
        "fee": {
            "free": 2.79,
            "monthly": 2.49,
            "lifetime": 2.09,
            "Apex": 1.5,
            "Topstep": 2.09
        }
    },
    {
        "name": "E-Mini Russell",
        "symbol": "RTY",
        "fee": {
            "free": 2.79,
            "monthly": 2.49,
            "lifetime": 2.09,
            "Apex": 1.5,
            "Topstep": 2.29
        }
    },
    {
        "name": "Micro E-Mini Dow",
        "symbol": "MYM",
        "fee": {
            "free": 0.87,
            "monthly": 0.77,
            "lifetime": 0.61,
            "Apex": 0.52,
            "Topstep": 0.67
        }
    },
    {
        "name": "Micro E-Mini S&P 500",
        "symbol": "MES",
        "fee": {
            "free": 0.87,
            "monthly": 0.77,
            "lifetime": 0.61,
            "Apex": 0.52,
            "Topstep": 0.67
        }
    },
    {
        "name": "Micro E-Mini NASDAQ",
        "symbol": "MNQ",
        "fee": {
            "free": 0.87,
            "monthly": 0.77,
            "lifetime": 0.61,
            "Apex": 0.52,
            "Topstep": 0.67
        }
    },
    {
        "name": "Micro E-Mini Russell",
        "symbol": "M2K",
        "fee": {
            "free": 0.87,
            "monthly": 0.77,
            "lifetime": 0.61,
            "Apex": 0.52,
            "Topstep": 0.67
        }
    },
    {
        "name": "E-Mini S&P Midcap 400",
        "symbol": "EMD",
        "fee": {
            "free": 2.79,
            "monthly": 2.49,
            "lifetime": 2.09,
            "Apex": 1.5
        }
    },
    {
        "name": "Nikkei 225 (Yen)",
        "symbol": "NIY",
        "fee": {
            "free": 3.31,
            "monthly": 3.01,
            "lifetime": 2.61
        }
    },
    {
        "name": "Nikkei 225 (USD)",
        "symbol": "NKD",
        "fee": {
            "free": 3.61,
            "monthly": 3.31,
            "lifetime": 2.91,
            "Apex": 2.32,
            "Topstep": 2.91
        }
    },
    {
        "name": "Bitcoin",
        "symbol": "BTC",
        "fee": {
            "free": 7.46,
            "monthly": 7.16,
            "lifetime": 6.76
        }
    },
    {
        "name": "Ether",
        "symbol": "ETH",
        "fee": {
            "free": 5.46,
            "monthly": 5.16,
            "lifetime": 4.76
        }
    },
    {
        "name": "Micro Bitcoin",
        "symbol": "MBT",
        "fee": {
            "free": 3.02,
            "monthly": 2.92,
            "lifetime": 2.76,
            "Apex": 2.67,
            "Topstep": 1.32
        }
    },
    {
        "name": "Micro Ether",
        "symbol": "MET",
        "fee": {
            "free": 0.72,
            "monthly": 0.62,
            "lifetime": 0.46,
            "Apex": 0.37,
            "Topstep": 0.42
        }
    },
    {
        "name": "DAX Index",
        "symbol": "FDAX",
        "fee": {
            "free": 2.72,
            "monthly": 2.46,
            "lifetime": 2.06,
            "Apex": 1.46
        }
    },
    {
        "name": "Mini-DAX",
        "symbol": "FDXM",
        "fee": {
            "free": 1.75,
            "monthly": 1.45,
            "lifetime": 1.05,
            "Apex": 0.46
        }
    },
    {
        "name": "Euro Stoxx 50",
        "symbol": "FESX",
        "fee": {
            "free": 1.87,
            "monthly": 1.59,
            "lifetime": 1.19,
            "Apex": 0.59
        }
    },
    {
        "name": "VSTOXX",
        "symbol": "FVS",
        "fee": {
            "free": 1.96,
            "monthly": 1.68,
            "lifetime": 1.28,
            "Apex": 0.68
        }
    },
    {
        "name": "STOXX Europe 600",
        "symbol": "FXXP",
        "fee": {
            "free": 1.67,
            "monthly": 1.38,
            "lifetime": 0.98,
            "Apex": 0.39
        }
    },
    {
        "name": "Micro DAX Index",
        "symbol": "FDXS",
        "fee": {
            "free": 0.69,
            "monthly": 0.59,
            "lifetime": 0.43,
            "Apex": 0.34
        }
    },
    {
        "name": "Micro Euro Stoxx 50",
        "symbol": "FSXE",
        "fee": {
            "free": 0.65,
            "monthly": 0.55,
            "lifetime": 0.39,
            "Apex": 0.30
        }
    },
    {
        "name": "Mini-MSCI Emerging Mkt",
        "symbol": "MME",
        "fee": {
            "free": 2.62,
            "monthly": 2.32,
            "lifetime": 1.92,
            "Apex": 1.33
        }
    },
    {
        "name": "Mini-MSCI EAFE Index",
        "symbol": "MFS",
        "fee": {
            "free": 2.62,
            "monthly": 2.32,
            "lifetime": 1.92,
            "Apex": 1.33
        }
    },
    {
        "name": "SPIKES Volatility Index",
        "symbol": "SPK",
        "fee": {
            "free": 0.37,
            "monthly": 0.37,
            "lifetime": 0.37
        }
    },
    {
        "name": "5-Year Note",
        "symbol": "ZF",
        "fee": {
            "free": 2.11,
            "monthly": 1.81,
            "lifetime": 1.41,
            "Apex": 0.82,
            "Topstep": 1.41
        }
    },
    {
        "name": "2-Year Note",
        "symbol": "ZT",
        "fee": {
            "free": 2.11,
            "monthly": 1.81,
            "lifetime": 1.41,
            "Apex": 0.82,
            "Topstep": 1.41
        }
    },
    {
        "name": "Ultra US Treasury Bond",
        "symbol": "UB",
        "fee": {
            "free": 2.41,
            "monthly": 2.11,
            "lifetime": 1.71,
            "Apex": 1.12,
            "Topstep": 1.71
        }
    },
    {
        "name": "10-Year T-Note",
        "symbol": "ZN",
        "fee": {
            "free": 2.26,
            "monthly": 1.96,
            "lifetime": 1.56,
            "Apex": 0.97,
            "Topstep": 1.65
        }
    },
    {
        "name": "US Treasury Bond",
        "symbol": "ZB",
        "fee": {
            "free": 2.33,
            "monthly": 2.03,
            "lifetime": 1.63,
            "Apex": 1.04,
            "Topstep": 1.63
        }
    },
    {
        "name": "Ultra 10-Year T-Note",
        "symbol": "TN",
        "fee": {
            "free": 2.26,
            "monthly": 1.96,
            "lifetime": 1.56,
            "Topstep": 1.56
        }
    },
    {
        "name": "20yr US Treasury Bond",
        "symbol": "TWE",
        "fee": {
            "free": 2.33,
            "monthly": 2.03,
            "lifetime": 1.63
        }
    },
    {
        "name": "Eurodollar",
        "symbol": "GE",
        "fee": {
            "free": 2.71,
            "monthly": 2.41,
            "lifetime": 2.01,
            "Topstep": 2.01
        }
    },
    {
        "name": "Fed Funds 30 Day",
        "symbol": "ZQ",
        "fee": {
            "free": 2.42,
            "monthly": 2.12,
            "lifetime": 1.72
        }
    },
    {
        "name": "Micro 10-Year Yield",
        "symbol": "10Y",
        "fee": {
            "free": 0.82,
            "monthly": 0.72,
            "lifetime": 0.56,
            "Apex": 0.47
        }
    },
    {
        "name": "Micro 2-Year Yield",
        "symbol": "2YY",
        "fee": {
            "free": 0.82,
            "monthly": 0.72,
            "lifetime": 0.56
        }
    },
    {
        "name": "Micro 30-Year Yield",
        "symbol": "30Y",
        "fee": {
            "free": 0.82,
            "monthly": 0.72,
            "lifetime": 0.56
        }
    },
    {
        "name": "Micro 5-Year Yield",
        "symbol": "5YY",
        "fee": {
            "free": 0.82,
            "monthly": 0.72,
            "lifetime": 0.56
        }
    },
    {
        "name": "Euro-Buxl",
        "symbol": "FGBX",
        "fee": {
            "free": 1.74,
            "monthly": 1.44,
            "lifetime": 1.04,
            "Apex": 0.45
        }
    },
    {
        "name": "Euro-Schatz",
        "symbol": "FGBS",
        "fee": {
            "free": 1.74,
            "monthly": 1.44,
            "lifetime": 1.04,
            "Apex": 0.45
        }
    },
    {
        "name": "Euro-Bobl",
        "symbol": "FGBM",
        "fee": {
            "free": 1.74,
            "monthly": 1.44,
            "lifetime": 1.04,
            "Apex": 0.45
        }
    },
    {
        "name": "Euro-Bund",
        "symbol": "FGBL",
        "fee": {
            "free": 1.74,
            "monthly": 1.44,
            "lifetime": 1.04,
            "Apex": 0.45
        }
    },
    {
        "name": "Gold",
        "symbol": "GC",
        "fee": {
            "free": 3.01,
            "monthly": 2.71,
            "lifetime": 2.31,
            "Apex": 1.72,
            "Topstep": 2.31
        }
    },
    {
        "name": "E-Micro Gold",
        "symbol": "MGC",
        "fee": {
            "free": 1.02,
            "monthly": 0.92,
            "lifetime": 0.76,
            "Apex": 0.67,
            "Topstep": 0.82
        }
    },
    {
        "name": "Copper",
        "symbol": "HG",
        "fee": {
            "free": 3.01,
            "monthly": 2.71,
            "lifetime": 2.31,
            "Apex": 1.72,
            "Topstep": 2.31
        }
    },
    {
        "name": "Micro Copper",
        "symbol": "MHG",
        "fee": {
            "free": 1.12,
            "monthly": 1.02,
            "lifetime": 0.86
        }
    },
    {
        "name": "Silver",
        "symbol": "SI",
        "fee": {
            "free": 3.01,
            "monthly": 2.71,
            "lifetime": 2.31,
            "Apex": 1.72,
            "Topstep": 2.31
        }
    },
    {
        "name": "Micro Silver",
        "symbol": "SIL",
        "fee": {
            "free": 1.52,
            "monthly": 1.42,
            "lifetime": 1.26,
            "Topstep": 1.32
        }
    },
    {
        "name": "E-Mini Copper",
        "symbol": "QC",
        "fee": {
            "free": 2.21,
            "monthly": 1.91,
            "lifetime": 1.51
        }
    },
    {
        "name": "miNY Silver",
        "symbol": "QI",
        "fee": {
            "free": 2.21,
            "monthly": 1.91,
            "lifetime": 1.51,
            "Apex": 0.92
        }
    },
    {
        "name": "E-Mini Gold",
        "symbol": "QO",
        "fee": {
            "free": 2.21,
            "monthly": 1.91,
            "lifetime": 1.51,
            "Apex": 0.92
        }
    },
    {
        "name": "Mini-Gold",
        "symbol": "YG",
        "fee": {
            "free": 1.96,
            "monthly": 1.66,
            "lifetime": 1.26,
            "Apex": 0.67
        }
    },
    {
        "name": "Mini-Silver",
        "symbol": "YI",
        "fee": {
            "free": 1.96,
            "monthly": 1.66,
            "lifetime": 1.26,
            "Apex": 0.67
        }
    },
    {
        "name": "Platinum",
        "symbol": "PL",
        "fee": {
            "free": 3.01,
            "monthly": 2.71,
            "lifetime": 2.31,
            "Apex": 1.72,
            "Topstep": 1.81
        }
    },
    {
        "name": "Palladium",
        "symbol": "PA",
        "fee": {
            "free": 3.01,
            "monthly": 2.71,
            "lifetime": 2.31,
            "Apex": 1.72
        }
    },
    {
        "name": "E-Mini Heating Oil",
        "symbol": "QH",
        "fee": {
            "free": 2.66,
            "monthly": 2.36,
            "lifetime": 1.96
        }
    },
    {
        "name": "E-Mini Crude Oil",
        "symbol": "QM",
        "fee": {
            "free": 2.66,
            "monthly": 2.36,
            "lifetime": 1.96,
            "Apex": 1.37,
            "Topstep": 1.96
        }
    },
    {
        "name": "E-Mini Natural Gas",
        "symbol": "QG",
        "fee": {
            "free": 1.96,
            "monthly": 1.66,
            "lifetime": 1.26,
            "Apex": 0.67,
            "Topstep": 1.26
        }
    },
    {
        "name": "Brent Crude Last Day",
        "symbol": "BZ",
        "fee": {
            "free": 2.96,
            "monthly": 2.66,
            "lifetime": 2.26
        }
    },
    {
        "name": "Heating Oil",
        "symbol": "HO",
        "fee": {
            "free": 2.96,
            "monthly": 2.66,
            "lifetime": 2.26,
            "Apex": 1.67,
            "Topstep": 2.26
        }
    },
    {
        "name": "RBOB Gasoline",
        "symbol": "RB",
        "fee": {
            "free": 2.96,
            "monthly": 2.66,
            "lifetime": 2.26,
            "Apex": 1.67,
            "Topstep": 2.26
        }
    },
    {
        "name": "Crude Oil",
        "symbol": "CL",
        "fee": {
            "free": 2.96,
            "monthly": 2.66,
            "lifetime": 2.26,
            "Apex": 1.67,
            "Topstep": 2.26
        }
    },
    {
        "name": "Micro Crude Oil",
        "symbol": "MCL",
        "fee": {
            "free": 1.02,
            "monthly": 0.92,
            "lifetime": 0.76,
            "Apex": 0.67,
            "Topstep": 0.82
        }
    },
    {
        "name": "Natural Gas",
        "symbol": "NG",
        "fee": {
            "free": 2.96,
            "monthly": 2.66,
            "lifetime": 2.26,
            "Apex": 1.67,
            "Topstep": 2.26
        }
    },
    {
        "name": "Rough Rice",
        "symbol": "ZR",
        "fee": {
            "free": 3.56,
            "monthly": 3.26,
            "lifetime": 2.86,
            "Apex": 2.27
        }
    },
    {
        "name": "Mini Wheat",
        "symbol": "XW",
        "fee": {
            "free": 2.49,
            "monthly": 2.19,
            "lifetime": 1.79,
            "Apex": 1.2
        }
    },
    {
        "name": "Oats",
        "symbol": "ZO",
        "fee": {
            "free": 3.56,
            "monthly": 3.26,
            "lifetime": 2.86,
            "Apex": 2.27
        }
    },
    {
        "name": "Mini Corn",
        "symbol": "XC",
        "fee": {
            "free": 2.49,
            "monthly": 2.19,
            "lifetime": 1.79,
            "Apex": 1.2
        }
    },
    {
        "name": "Soybeans",
        "symbol": "ZS",
        "fee": {
            "free": 3.56,
            "monthly": 3.26,
            "lifetime": 2.86,
            "Apex": 2.27,
            "Topstep": 2.86
        }
    },
    {
        "name": "Soybean Oil",
        "symbol": "ZL",
        "fee": {
            "free": 3.56,
            "monthly": 3.26,
            "lifetime": 2.86,
            "Apex": 2.27,
            "Topstep": 2.86
        }
    },
    {
        "name": "Corn",
        "symbol": "ZC",
        "fee": {
            "free": 3.56,
            "monthly": 3.26,
            "lifetime": 2.86,
            "Apex": 2.27,
            "Topstep": 2.86
        }
    },
    {
        "name": "Wheat",
        "symbol": "ZW",
        "fee": {
            "free": 3.56,
            "monthly": 3.26,
            "lifetime": 2.86,
            "Apex": 2.27,
            "Topstep": 2.86
        }
    },
    {
        "name": "Soybean Meal",
        "symbol": "ZM",
        "fee": {
            "free": 3.56,
            "monthly": 3.26,
            "lifetime": 2.86,
            "Apex": 2.27,
            "Topstep": 2.86
        }
    },
    {
        "name": "Mini Soybean",
        "symbol": "XK",
        "fee": {
            "free": 2.49,
            "monthly": 2.19,
            "lifetime": 1.79,
            "Apex": 1.2
        }
    },
    {
        "name": "E-Mini Japanese Yen",
        "symbol": "J7",
        "fee": {
            "free": 2.31,
            "monthly": 2.01,
            "lifetime": 1.61,
            "Apex": 1.02
        }
    },
    {
        "name": "E-Micro Australian Dollar",
        "symbol": "M6A",
        "fee": {
            "free": 0.76,
            "monthly": 0.66,
            "lifetime": 0.5,
            "Apex": 0.41,
            "Topstep": 0.56
        }
    },
    {
        "name": "E-Micro Euro",
        "symbol": "M6E",
        "fee": {
            "free": 0.76,
            "monthly": 0.66,
            "lifetime": 0.5,
            "Apex": 0.41,
            "Topstep": 0.56
        }
    },
    {
        "name": "E-Micro Swiss Franc",
        "symbol": "MSF",
        "fee": {
            "free": 0.76,
            "monthly": 0.66,
            "lifetime": 0.5,
            "Apex": 0.41
        }
    },
    {
        "name": "E-Micro Canadian Dollar",
        "symbol": "MCD",
        "fee": {
            "free": 0.76,
            "monthly": 0.66,
            "lifetime": 0.5,
            "Apex": 0.41
        }
    },
    {
        "name": "E-Micro British Pound",
        "symbol": "M6B",
        "fee": {
            "free": 0.76,
            "monthly": 0.66,
            "lifetime": 0.5,
            "Apex": 0.41
        }
    },
    {
        "name": "E-Micro Japanese Yen",
        "symbol": "MJY",
        "fee": {
            "free": 0.76,
            "monthly": 0.66,
            "lifetime": 0.5,
            "Apex": 0.41
        }
    },
    {
        "name": "E-Mini Euro FX",
        "symbol": "E7",
        "fee": {
            "free": 2.31,
            "monthly": 2.01,
            "lifetime": 1.61,
            "Apex": 1.02,
            "Topstep": 1.61
        }
    },
    {
        "name": "Mexican Peso",
        "symbol": "6M",
        "fee": {
            "free": 3.06,
            "monthly": 2.76,
            "lifetime": 2.36,
            "Apex": 1.77,
            "Topstep": 2.36
        }
    },
    {
        "name": "Australian Dollar",
        "symbol": "6A",
        "fee": {
            "free": 3.06,
            "monthly": 2.76,
            "lifetime": 2.36,
            "Apex": 1.77,
            "Topstep": 2.36
        }
    },
    {
        "name": "British Pound",
        "symbol": "6B",
        "fee": {
            "free": 3.06,
            "monthly": 2.76,
            "lifetime": 2.36,
            "Apex": 1.77,
            "Topstep": 2.36
        }
    },
    {
        "name": "Japanese Yen",
        "symbol": "6J",
        "fee": {
            "free": 3.06,
            "monthly": 2.76,
            "lifetime": 2.36,
            "Apex": 1.77,
            "Topstep": 2.36
        }
    },
    {
        "name": "Canadian Dollar",
        "symbol": "6C",
        "fee": {
            "free": 3.06,
            "monthly": 2.76,
            "lifetime": 2.36,
            "Apex": 1.77,
            "Topstep": 2.36
        }
    },
    {
        "name": "Swiss Franc",
        "symbol": "6S",
        "fee": {
            "free": 3.06,
            "monthly": 2.76,
            "lifetime": 2.36,
            "Apex": 1.77,
            "Topstep": 2.36
        }
    },
    {
        "name": "Euro FX",
        "symbol": "6E",
        "fee": {
            "free": 3.06,
            "monthly": 2.76,
            "lifetime": 2.36,
            "Apex": 1.77,
            "Topstep": 2.36
        }
    },
    {
        "name": "New Zealand Dollar",
        "symbol": "6N",
        "fee": {
            "free": 3.06,
            "monthly": 2.76,
            "lifetime": 2.36,
            "Apex": 1.77,
            "Topstep": 2.36
        }
    },
    {
        "name": "Brazilian Real",
        "symbol": "6L",
        "fee": {
            "free": 3.06,
            "monthly": 2.76,
            "lifetime": 2.36,
            "Apex": 1.77
        }
    },
    {
        "name": "US Dollar Index",
        "symbol": "DX",
        "fee": {
            "free": 2.81,
            "monthly": 2.51,
            "lifetime": 2.11,
            "Apex": 1.52
        }
    },
    {
        "name": "Feeder Cattle",
        "symbol": "GF",
        "fee": {
            "free": 3.56,
            "monthly": 3.26,
            "lifetime": 2.86
        }
    },
    {
        "name": "Lean Hogs",
        "symbol": "HE",
        "fee": {
            "free": 3.56,
            "monthly": 3.26,
            "lifetime": 2.86,
            "Apex": 2.27,
            "Topstep": 2.86
        }
    },
    {
        "name": "Live Cattle",
        "symbol": "LE",
        "fee": {
            "free": 3.56,
            "monthly": 3.26,
            "lifetime": 2.86,
            "Apex": 2.27,
            "Topstep": 2.86
        }
    },
    {
        "name": "Sugar No. 11",
        "symbol": "SB",
        "fee": {
            "free": 3.56,
            "monthly": 3.26,
            "lifetime": 2.86,
            "Apex": 2.27
        }
    },
    {
        "name": "Coffee",
        "symbol": "KC",
        "fee": {
            "free": 3.56,
            "monthly": 3.26,
            "lifetime": 2.86,
            "Apex": 2.27
        }
    },
    {
        "name": "Cocoa",
        "symbol": "CC",
        "fee": {
            "free": 3.56,
            "monthly": 3.26,
            "lifetime": 2.86,
            "Apex": 2.27
        }
    },
    {
        "name": "Cotton",
        "symbol": "CT",
        "fee": {
            "free": 3.56,
            "monthly": 3.26,
            "lifetime": 2.86,
            "Apex": 2.27
        }
    },
    {
        "name": "Orange Juice",
        "symbol": "OJ",
        "fee": {
            "free": 3.56,
            "monthly": 3.26,
            "lifetime": 2.86,
            "Apex": 2.27
        }
    },
    {
        "name": "Random Length Lumber",
        "symbol": "LBS",
        "fee": {
            "free": 3.56,
            "monthly": 3.26,
            "lifetime": 2.86
        }
    }
]
)

export const tradovateTiers = reactive([{
    value: "free",
    label: "Free"
},
{
    value: "monthly",
    label: "Monthly"
},
{
    value: "lifetime",
    label: "Lifetime"
}
])

export const selectedTradovateTier = ref()
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

export const tradesModal = ref(null)

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

export const excursions = reactive([])
export const tradeExcursionChanged = ref(false)
export const tradeExcursionId = ref()
export const tradeExcursionDateUnix = ref()

export const satisfactionTradeArray = reactive([])
export const satisfactionArray = reactive([])


//TAGS
export const tags = reactive([]) //all tags, from useGetTags
export const tradeTags = reactive([]) // on daily page, tags of a specific trade (when push modal)
export const newTradeTags = reactive([])
export const availableTags = reactive([])
export const tradeTagsChanged = ref(false)
export const tagInput = ref('');
export const selectedTagIndex = ref(-1)
export const showTagsList = ref(false)
export const tradeTagsId = ref()
export const tradeTagsDateUnix = ref()
export const availableTagsArray = reactive([])

//NOTES
export const notes = reactive([])
export const tradeNote = ref(null)
export const tradeNoteChanged = ref(false)
export const tradeNoteDateUnixDay = ref(null)
export const tradeNoteDateUnix = ref(null)
export const tradeNoteId = ref(null)

/**************************************
* SCREENSHOTS
**************************************/
export const screenshots = reactive([])
export const screenshotsInfos = reactive([])
export const screenshot = reactive({
    "side": null,
    "type": null
})
export const tradeScreenshotChanged = ref(false)
export const markerAreaOpen = ref(false)
export const dateScreenshotEdited = ref(false)
export const screenshotsPagination = ref(0)
export const screenshotsQueryLimit = ref(4)
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
    value: "interactiveBrokers",
    label: "Interactive Brokers",
    assetTypes: ["stocks", "options", "futures"]
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
    value: "tradovate",
    label: "Tradovate",
    assetTypes: ["futures"]
},
{
    value: "metaTrader5",
    label: "MetaTrader 5",
    assetTypes: ["forex"]
},
{
    value: "heldentrader",
    label: "Heldentrader",
    assetTypes: ["stocks"]
},
{
    value: "rithmic",
    label: "Rithmic",
    assetTypes: ["futures"]
},
{
    value: "fundTraders",
    label: "FundTraders",
    assetTypes: ["stocks"]
},
{
    value: "ninjaTrader",
    label: "NinjaTrader",
    assetTypes: ["futures"]
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
    value: "apps",
    label: "APPS"
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

export const selectedTags = localStorage.getItem('selectedTags') ? ref(localStorage.getItem('selectedTags').split(",")) : ref([])

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