<script setup>
import { onBeforeMount, onMounted } from 'vue';
import Filters from '../components/Filters.vue'
import NoData from '../components/NoData.vue';
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import Calendar from '../components/Calendar.vue';
import { spinnerLoadingPage, calendarData, filteredTrades, setups, patternsMistakes, journals, modalVideosOpen, renderData, patterns, mistakes, tradeSetup, indexedDBtoUpdate, queryLimit, amountCase, markerAreaOpen, setup, tradeSetupChanged, tradeScreenshotChanged, daily, pageId, excursion, tradeExcursionChanged, spinnerLoadingPageText, threeMonthsBack, selectedMonth, spinnerSetups, spinnerSetupsText, tradeExcursionId, tradeExcursionDateUnix, hasData } from '../stores/globals';
import { useInitIndexedDB, useInitPopover, useCreatedDateFormat, useTwoDecCurrencyFormat, useTimeFormat, useHourMinuteFormat, useInitTab, useTimeDuration } from '../utils/utils';
import { useGetAllTrades, useUpdateTrades, useGetTradesFromDb } from '../utils/trades';
import { useSetupImageUpload, useSetupMarkerArea, useSaveScreenshot } from '../utils/screenshots';
import { useTradeSetupChange, useUpdatePatternsMistakes, useDeletePatternMistake, useResetSetup } from '../utils/patternsMistakes'

const dailyTabs = [{
    id: "trades",
    label: "Trades",
    target: "#tradesNav"
},
{
    id: "blotter",
    label: "Blotter",
    target: "#blotterNav"
},
{
    id: "screenshots",
    label: "Screenshots",
    target: "#screenshotsNav"
},
{
    id: "diaries",
    label: "Diary",
    target: "#diariesNav"
},
]
let excursions = []
let tradesModal = null
let videosArrayIndex
let tradeSatisfactionId
let tradeSatisfaction
let tradeSatisfactionDateUnix
let tradeSatisfactionChanged
let tradeSatisfactionArray = []

onBeforeMount(async () => {
    await useInitIndexedDB()
    await Promise.all([useInitPopover(), getTradesSatisfaction(), getExcursions(), useGetAllTrades(true)])

    /*await (spinnerLoadingPage.value = true)
    await useInitIndexedDB()
    await useLoadCalendar(true) // no need for filtered trades just 3months back or all. And you get them either from indexedDB or from Parse DB
    await (spinnerLoadingPage.value = false)*/

    useInitTab("daily")

})
onMounted(async () => {
    tradesModal = new bootstrap.Modal("#tradesModal")
})


/**************
 * SATISFACTION
 ***************/
async function updateDailySatisfaction(param1, param2) { //param1 : daily unixDate ; param2 : true / false ; param3: dateUnixDay ; param4: tradeId
    console.log("\nUPDATING OR SAVING SATISFACTIONS IN PARSE")
    //console.log(" param 1 " + param1)
    spinnerLoadingPage.value = true
    return new Promise(async (resolve, reject) => {

        const parseObject = Parse.Object.extend("satisfactions");
        const query = new Parse.Query(parseObject);
        query.equalTo("dateUnix", param1)
        query.doesNotExist("tradeId") /// this is how we differentiate daily from trades satisfaction records
        const results = await query.first();
        if (results) {
            console.log(" -> Updating satisfaction")
            results.set("satisfaction", param2)

            results.save()
                .then(async () => {
                    console.log(' -> Updated satisfaction with id ' + results.id)
                }, (error) => {
                    console.log('Failed to create new object, with error code: ' + error.message);
                })
        } else {
            console.log(" -> Saving satisfaction")

            const object = new parseObject();
            object.set("user", Parse.User.current())
            object.set("dateUnix", param1)
            object.set("satisfaction", param2)
            object.setACL(new Parse.ACL(Parse.User.current()));
            object.save()
                .then(async (object) => {
                    console.log(' -> Added new satisfaction with id ' + object.id)
                }, (error) => {
                    console.log('Failed to create new object, with error code: ' + error.message);
                })
        }

        await updateTradesDailySatisfaction(param1, param2)
        if (pageId.value == "daily") {
            await useInitTab("daily")
        }
        resolve()


    })
}

async function updateTradesDailySatisfaction(param1, param2) {
    //console.log(" param1 " + param1 + " param2 " + param2 + " param3 " + param3)
    //spinnerSetupsText.value = "Updating trades"
    //query trade to update
    //console.log("date unix "+param1+" is type "+typeof(videoToLoad.value)+" and trade id "+param)
    return new Promise(async (resolve, reject) => {
        const parseObject = Parse.Object.extend("trades");
        const query = new Parse.Query(parseObject);
        query.equalTo("dateUnix", param1)
        const results = await query.first();
        if (results) {
            results.set("satisfaction", param2)
            results.save().then(async () => {
                console.log(' -> Updated trades with id ' + results.id)
                await updateIndexedDB()
                resolve()
            })
        } else {
            alert("Update query did not return any results")
            resolve()
        }

    })
}

async function tradeSatisfactionChange(param1, param2, param3, param4) {

    tradeSatisfactionId = param1
    tradeSatisfaction = param2
    tradeSatisfactionDateUnix = param3
    //console.log("tradesetup in change " + JSON.stringify(tradeSetup))
    tradeSatisfactionChanged = true
    indexedDBtoUpdate.value = true

    await updateTradeSatisfaction()
    await useUpdateTrades()
    await getTradesSatisfaction()
    tradeSatisfactionChanged = false

}

async function updateTradeSatisfaction(param1, param2) { //param1 : daily unixDate ; param2 : true / false ; param3: dateUnixDay ; param4: tradeId
    console.log("\nUPDATING OR SAVING TRADES SATISFACTION IN PARSE")
    return new Promise(async (resolve, reject) => {
        const parseObject = Parse.Object.extend("satisfactions");
        const query = new Parse.Query(parseObject);
        query.equalTo("tradeId", tradeSatisfactionId)
        const results = await query.first();
        if (results) {
            console.log(" -> Updating satisfaction")
            results.set("satisfaction", tradeSatisfaction)

            results.save()
                .then(async () => {
                    console.log(' -> Updated satisfaction with id ' + results.id + " to " + tradeSatisfaction)
                    //spinnerSetupsText.value = "Updated setup"
                }, (error) => {
                    console.log('Failed to create new object, with error code: ' + error.message);
                })
        } else {
            console.log(" -> Saving satisfaction")

            const object = new parseObject();
            object.set("user", Parse.User.current())
            object.set("dateUnix", tradeSatisfactionDateUnix)
            object.set("tradeId", tradeSatisfactionId)
            object.set("satisfaction", tradeSatisfaction)
            object.setACL(new Parse.ACL(Parse.User.current()));
            object.save()
                .then(async (object) => {
                    console.log(' -> Added new satisfaction with id ' + object.id)
                    //spinnerSetupsText.value = "Added new setup"
                }, (error) => {
                    console.log('Failed to create new object, with error code: ' + error.message);
                })
        }
        resolve()


    })
}

async function getTradesSatisfaction() {
    return new Promise(async (resolve, reject) => {
        console.log("\nGETTING SATISFACTION FOR EACH TRADE");
        const parseObject = Parse.Object.extend("satisfactions");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current());
        query.exists("tradeId") /// this is how we differentiate daily from trades satisfaction records
        query.limit(queryLimit.value); // limit to at most 10 results
        tradeSatisfactionArray = []
        const results = await query.find();
        for (let i = 0; i < results.length; i++) {
            let temp = {}
            const object = results[i];
            temp.id = object.get('tradeId')
            temp.satisfaction = object.get('satisfaction')
            tradeSatisfactionArray.push(temp)
        }
        //console.log(" -> Trades satisfaction " + JSON.stringify(tradeSatisfactionArray))

        resolve()

    })
}

/**************
 * EXCURSIONS
 ***************/
async function getExcursions() {
    return new Promise(async (resolve, reject) => {
        console.log("\nGETTING EXCURSIONS")
        const parseObject = Parse.Object.extend("excursions");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current());
        query.ascending("order");
        query.limit(queryLimit.value); // limit to at most 10 results
        excursions = []
        const results = await query.find();
        excursions = JSON.parse(JSON.stringify(results))
        //console.log(" -> excursions " + JSON.stringify(excursions))
        resolve()
    })
}

function tradeExcursionChange(param1, param2, param3, param4) {
    //console.log("param 1: " + param1 + " param2: " + param2, ", param3: " + param3 + ", param4: " + param4)
    if (param2 == "stopLoss") {
        excursion.stopLoss = parseFloat(param1)
        excursion.maePrice = excursions[excursions.findIndex(f => f.tradeId == param4)] ? excursions[excursions.findIndex(f => f.tradeId == param4)].maePrice : null
        excursion.mfePrice = excursions[excursions.findIndex(f => f.tradeId == param4)] ? excursions[excursions.findIndex(f => f.tradeId == param4)].mfePrice : null
    }
    if (param2 == "maePrice") {
        excursion.stopLoss = excursions[excursions.findIndex(f => f.tradeId == param4)] ? excursions[excursions.findIndex(f => f.tradeId == param4)].stopLoss : null
        excursion.maePrice = parseFloat(param1)
        excursion.mfePrice = excursions[excursions.findIndex(f => f.tradeId == param4)] ? excursions[excursions.findIndex(f => f.tradeId == param4)].mfePrice : null
    }
    if (param2 == "mfePrice") {
        excursion.stopLoss = excursions[excursions.findIndex(f => f.tradeId == param4)] ? excursions[excursions.findIndex(f => f.tradeId == param4)].stopLoss : null
        excursion.maePrice = excursions[excursions.findIndex(f => f.tradeId == param4)] ? excursions[excursions.findIndex(f => f.tradeId == param4)].maePrice : null
        excursion.mfePrice = parseFloat(param1)
    }
    tradeExcursionDateUnix.value = param3
    tradeExcursionId.value = param4
    console.log("Excursion has changed: " + JSON.stringify(excursion))
    tradeExcursionChanged.value = true
    indexedDBtoUpdate.value = true

}

async function updateExcursions() {
    console.log("\nUPDATING OR SAVING EXCURSIONS IN PARSE DB")
    return new Promise(async (resolve, reject) => {

        if (excursion.stopLoss != null || excursion.maePrice != null || excursion.mfePrice != null) {
            //console.log("trade setup " + JSON.stringify(tradeSetup.value) + " with ID " + param2)
            spinnerSetups.value = true
            //tradeSetupChanged.value = true
            const parseObject = Parse.Object.extend("excursions");
            const query = new Parse.Query(parseObject);
            query.equalTo("tradeId", tradeExcursionId.value)
            const results = await query.first();
            if (results) {
                console.log(" -> Updating excursions")
                spinnerSetupsText.value = "Updating"
                results.set("stopLoss", excursion.stopLoss == null || excursion.stopLoss == '' ? null : excursion.stopLoss)
                results.set("maePrice", excursion.maePrice == null || excursion.maePrice == '' ? null : excursion.maePrice)
                results.set("mfePrice", excursion.mfePrice == null || excursion.mfePrice == '' ? null : excursion.mfePrice)

                results.save()
                    .then(async () => {
                        console.log(' -> Updated excursions with id ' + results.id)
                        //spinnerSetupsText.value = "Updated setup"
                    }, (error) => {
                        console.log('Failed to create new object, with error code: ' + error.message);
                    })
            } else {
                console.log(" -> Saving excursions")
                spinnerSetupsText.value = "Saving"

                const object = new parseObject();
                object.set("user", Parse.User.current())
                object.set("stopLoss", excursion.stopLoss == null || excursion.stopLoss == '' ? null : excursion.stopLoss)
                object.set("maePrice", excursion.maePrice == null || excursion.maePrice == '' ? null : excursion.maePrice)
                object.set("mfePrice", excursion.mfePrice == null || excursion.mfePrice == '' ? null : excursion.mfePrice)

                object.set("dateUnix", tradeExcursionDateUnix.value)
                object.set("tradeId", tradeExcursionId.value)
                object.setACL(new Parse.ACL(Parse.User.current()));
                object.save()
                    .then(async (object) => {
                        console.log(' -> Added new excursion with id ' + object.id)
                        //spinnerSetupsText.value = "Added new setup"
                        tradeId.value = tradeExcursionId.value // we need to do this if I want to manipulate the current modal straight away, like for example delete after saving. WHen You push next or back, tradeId is set back to null
                    }, (error) => {
                        console.log('Failed to create new object, with error code: ' + error.message);
                    })
            }

        }
        resolve()


    })
}

/**************
 * MISC
 ***************/
async function clickTradesModal(param1, param2, param3) { //When we click on the video icon to view a video. Param1 : is video true/false, Param2: index of array; Param3: daily
    //console.log(" param 3 "+JSON.stringify(param3))
    //console.log("param 2 "+param2)
    //console.log("param 1: " + param1 + " - param2: " + param2 + " - param3: "+JSON.stringify(param3))
    //console.log("param 1: " + param1 + " param2 " + param2 + " param3 " + param3 + " param 4 " + param4 + " param 5 " + param5)
    if (markerAreaOpen.value == true) {
        alert("Please save your setup annotation")
        return
    } else {

        //clicking on modal from daily page
        if (param3) {
            for (let key in daily) delete daily[key]
            Object.assign(daily, param3)
        }
        //console.log(" -> Daily "+JSON.stringify(daily))
        if (!param3 && tradeSetupChanged.value) {
            await Promise.all([useUpdatePatternsMistakes(), useUpdateTrades()])
        }

        if (!param3 && tradeExcursionChanged.value) {
            await Promise.all([updateExcursions(), useUpdateTrades()])
            await getExcursions()
        }

        if (!param3 && tradeScreenshotChanged.value) {
            await useSaveScreenshot()
        }

        videosArrayIndex = param2

        let awaitClick = async () => {
            //console.log(" index "+param2)
            //console.log("daily "+JSON.stringify(param3))
            //console.log(" trade "+JSON.stringify(param3.trades[param2]))
            //console.log(" trade id "+param3.trades[param2].id)
            //console.log(" Find " + JSON.stringify(setups.find(obj => obj.name == setups.trades[param2].id)))
            if (setups.find(obj => obj.name == daily.trades[param2].id)) {
                for (let key in setup) delete setup[key]
                let setupObj = setups.find(obj => obj.name == daily.trades[param2].id)
                for (let key in setupObj) {
                    setup[key] = setupObj[key]
                }
            } else {
                for (let key in setup) delete setup[key]
                setup.side = null
                setup.type = null
            }


            tradeSetupChanged.value = false //we updated patterns mistakes and trades so false cause not need to do it again when we hide modal
            tradeExcursionChanged.value = false
            tradeScreenshotChanged.value = false

            await useResetSetup()
            await resetExcursion()

            modalVideosOpen.value = true

            /*if (param1 == true) {
                hasVideo.value = true
            }*/

            //console.log("Has video ? "+hasVideo.value)

            //console.log("param3 trades "+JSON.stringify(param3))
            //console.log("daily trades " + JSON.stringify(daily.trades[param2]))
            /*console.log("daily trades " + JSON.stringify(daily.trades[param2]))
            if (Object.keys(daily.trades[param2].setup).length != 0) {
                console.log(" -> Trade with ID " + daily.trades[param2].id + " has setup in DB. Let's get tradeSetup names")
                tradeId.value = tradeId.value.trades[param2].id
                tradeSetup = tradeSetup.trades[param2].setup
                    //await getTradeSetupNames.value(getTradeSetupNames.value.trades[param2].setup)
            } else {
                console.log(" -> Trade has No setup in DB")
                tradeId.value = null
            }*/

            //Before going next or back, check if Satisfaction or Pattern already exists in Parse DB

            const parseObject = Parse.Object.extend("patternsMistakes");
            const query = new Parse.Query(parseObject);
            query.equalTo("tradeId", daily.trades[param2].id)
            const results = await query.first();
            if (results) {
                let resultsParse = JSON.parse(JSON.stringify(results))
                //console.log(" results "+JSON.stringify(resultsParse))
                //console.log("mistake " + resultsParse.mistake + " note " + resultsParse.note)
                resultsParse.pattern != null ? tradeSetup.pattern = resultsParse.pattern.objectId : null
                resultsParse.mistake != null ? tradeSetup.mistake = resultsParse.mistake.objectId : null
                resultsParse.note != null || resultsParse.note != 'null' ? tradeSetup.note = resultsParse.note : null
            }
        }
        await awaitClick()
    }

}

async function hideTradesModal() {
    //console.log(" clicked on hide trades modal")
    if (markerAreaOpen.value == true) {
        alert("Please save your setup annotation")
        return
    } else {

        if (pageId.value == "daily") tradesModal.hide()

        //console.log(" -> Trades modal hidden with indexDBUpdate " + indexedDBtoUpdate.value + " and setup changed " + tradeSetupChanged.value)
        if (indexedDBtoUpdate.value) {
            spinnerLoadingPage.value = true

            if (tradeSetupChanged.value) { //in the case setup changed but did not click on next 
                //console.log(" Setup type " + setup.type)

                //We're also using hideTradesModal in addScreenshot, so we need to distinguish two cases
                //Case for daily page (null) or add screenshot entry => Update trades
                if (setup.type == null || setup.type == "entry") {
                    await Promise.all([useUpdatePatternsMistakes(), useUpdateTrades()])
                }

                //Case add screenshot is setup => do not update trades
                if (setup.type == "setup") {
                    await useUpdatePatternsMistakes()
                }
            }
            if (tradeExcursionChanged.value) { //in the case excursion changed but did not click on next 
                await Promise.all([updateExcursions(), useUpdateTrades()])
                await getExcursions()
            }

            if (tradeScreenshotChanged.value) {
                await useSaveScreenshot()
            }
            await updateIndexedDB()

        }
        indexedDBtoUpdate.value = false
        if (pageId.value == "daily") {
            await useInitTab("daily")
        }
    }
}

function resetExcursion() {
    //console.log(" -> Resetting excursion")
    //we need to reset the setup variable each time
    for (let key in excursion) delete excursion[key]
    excursion.stopLoss = null
    excursion.maePrice = null
    excursion.mfePrice = null

}


async function updateIndexedDB(param1) {
    console.log("\nUPDATING INDEXEDDB")
    return new Promise(async (resolve, reject) => {
        await (spinnerLoadingPageText.value = "Updating trades in IndexedDB")
        //console.log("threeMonthsBack.value "+threeMonthsBack.value+" ; selectedMonth.value.start "+selectedMonth.value.start)
        if (threeMonthsBack.value <= selectedMonth.value.start) {
            console.log("3 months")
            await useGetTradesFromDb(6)
        } else {
            console.log(">6 months")
            await useGetTradesFromDb(0)
        }
        await (spinnerLoadingPageText.value = "Getting all trades")
        await useGetAllTrades(true)
        await (spinnerLoadingPage.value = false)
        resolve()
    })
}
</script>

<template>
    <DashboardLayout>
        <SpinnerLoadingPage />
        <div class="row mt-2 mb-2">
            <div v-if="!hasData">
                <NoData />
            </div>
            <div v-show="hasData">
                <Filters />

                <!-- added v-if instead v-show because need to wait for patterns to load -->

                <!-- ============ CARD ============ -->
                <div v-if="!spinnerLoadingPage && filteredTrades" class="col-12 col-xl-8">
                    <!-- v-show insead of v-if or else init tab does not work cause div is not created until spinner is false-->
                    <div v-for="(daily, index) in filteredTrades" class="row mt-2">
                        <div class="col-12">
                            <div class="dailyCard">
                                <div class="row">
                                    <!-- ============ PART 1 ============ -->
                                    <!-- Line 1 : Date and P&L -->
                                    <!--<input id="providers" type="text" class="form-control" placeholder="Fournisseur*" autocomplete="off"/>-->

                                    <div class="col-12 cardFirstLine d-flex align-items-center fw-bold">
                                        <div class="col-auto">{{ useCreatedDateFormat(daily.dateUnix) }}<i
                                                v-on:click="updateDailySatisfaction(daily.dateUnix, true)"
                                                v-bind:class="[daily.satisfaction == true ? 'greenTrade' : '', 'uil', 'uil-thumbs-up', 'ms-2', 'me-1', 'pointerClass']"></i>
                                            <i v-on:click="updateDailySatisfaction(daily.dateUnix, false)"
                                                v-bind:class="[daily.satisfaction == false ? 'redTrade' : '', , 'uil', 'uil-thumbs-down', 'pointerClass']"></i>
                                        </div>

                                        <div class="col-auto ms-auto">P&L: <span
                                                v-bind:class="[daily.pAndL[amountCase + 'Proceeds'] > 0 ? 'greenTrade' : 'redTrade']">{{
                                                    useTwoDecCurrencyFormat(daily.pAndL[amountCase + 'Proceeds']) }}</span>
                                        </div>

                                    </div>

                                    <!-- Line 2 : Charts and total data -->
                                    <div class="col-12 d-flex align-items-center text-center">
                                        <div class="row">

                                            <!--  -> Win Loss Chart -->
                                            <div class="col-12 col-lg-6">
                                                <div class="row">
                                                    <div class="col-4">
                                                        <div v-bind:id="'pieChart' + daily.dateUnix"
                                                            class="chartIdDailyClass">
                                                        </div>
                                                    </div>
                                                    <!--  -> Win Loss evolution Chart -->
                                                    <div class="col-8 chartCard">
                                                        <div v-bind:id="'doubleLineChart' + daily.dateUnix"
                                                            class="chartIdDailyClass"></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!--  -> Tot trades and total executions -->
                                            <div class="col-12 col-lg-6">
                                                <div class="row">
                                                    <div class="col row">
                                                        <div>
                                                            <label>Executions</label>
                                                            <p>{{ daily.pAndL.executions }}</p>
                                                        </div>
                                                        <div>
                                                            <label>Trades</label>
                                                            <p>{{ daily.pAndL.trades }}</p>
                                                        </div>
                                                    </div>

                                                    <!--  -> Tot Wins and losses -->
                                                    <div class="col row">
                                                        <div>
                                                            <label>Wins</label>
                                                            <p>{{ daily.pAndL.grossWinsCount }}</p>
                                                        </div>
                                                        <div>
                                                            <label>Losses</label>
                                                            <p>{{ daily.pAndL.grossLossCount }}</p>
                                                        </div>
                                                    </div>

                                                    <!--  -> Tot commission and gross p&l -->
                                                    <div class="col row">
                                                        <div>
                                                            <label>Fees</label>
                                                            <p>{{ useTwoDecCurrencyFormat(daily.pAndL.fees) }}</p>
                                                        </div>
                                                        <div>
                                                            <label>P&L(g)</label>
                                                            <p>{{ useTwoDecCurrencyFormat(daily.pAndL.grossProceeds) }}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- end PART 1 -->

                                    <!-- ============ PART 2 ============ -->
                                    <div class="col-12 table-responsive">
                                        <nav>
                                            <div class="nav nav-tabs mb-2" id="nav-tab" role="tablist">
                                                <button v-for="dashTab in dailyTabs" class="nav-link"
                                                    v-bind:id="dashTab.id + '-' + index" data-bs-toggle="tab"
                                                    v-bind:data-bs-target="dashTab.target + '-' + index" type="button"
                                                    role="tab" aria-controls="nav-overview" aria-selected="true">{{
                                                        dashTab.label }}
                                                    <span
                                                        v-if="dashTab.id == 'screenshots' && setups.filter(obj => obj.dateUnixDay == daily.dateUnix).length > 0"
                                                        class="txt-small"> ({{ setups.filter(obj => obj.dateUnixDay ==
                                                            daily.dateUnix).length }})</span>
                                                    <!--({{daily[dashTab.id].length}})-->
                                                </button>
                                            </div>
                                        </nav>
                                        <div class="tab-content" id="nav-tabContent">
                                            <!-- TRADES TAB -->
                                            <div class="tab-pane fade txt-small" v-bind:id="'tradesNav-' + index"
                                                role="tabpanel" aria-labelledby="nav-overview-tab">
                                                <table class="table">
                                                    <thead class="thead-dark">
                                                        <tr>
                                                            <th scope="col">Symbol</th>
                                                            <th scope="col">Qty</th>
                                                            <th scope="col">Entry</th>
                                                            <th scope="col">Time</th>
                                                            <th scope="col">Price</th>
                                                            <!--<th scope="col">Duration</th>-->
                                                            <th scope="col">P&L/Sh(g)</th>
                                                            <th scope="col">P&L(n)</th>
                                                            <th scope="col">Pattern</th>
                                                            <th scope="col">Mistake</th>
                                                            <th scope="col">Note</th>
                                                            <!--<th scope="col">Video</th>-->
                                                            <th scope="col"></th>
                                                            <th scope="col"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>

                                                        <!-- the page loads faster than the video blob => check if blob, that is after slash, is not null, and then load -->
                                                        <!--<tr v-if="/[^/]*$/.exec(videoBlob)[0]!='null'&&trade.videoStart&&trade.videoEnd">-->

                                                        <tr v-for="(trade, index2) in daily.trades" data-bs-toggle="modal"
                                                            data-bs-target="#tradesModal"
                                                            v-on:click="clickTradesModal(trade.videoStart && trade.videoEnd ? true : false, index2, daily)"
                                                            class="pointerClass">
                                                            <td>{{ trade.symbol }}</td>
                                                            <td>{{ trade.buyQuantity + trade.sellQuantity }}</td>
                                                            <td>{{ trade.strategy.charAt(0).toUpperCase() +
                                                                trade.strategy.slice(1) }}</td>
                                                            <td>{{ useTimeFormat(trade.entryTime) }}</td>
                                                            <td>{{ (trade.entryPrice).toFixed(2) }}</td>
                                                            <!--<td>{{useTimeDuration(trade.exitTime - trade.entryTime)}}</td>-->
                                                            <td
                                                                v-bind:class="[trade.grossSharePL > 0 ? 'greenTrade' : 'redTrade']">
                                                                {{ (trade.grossSharePL).toFixed(2) }}</td>
                                                            <td
                                                                v-bind:class="[trade.netProceeds > 0 ? 'greenTrade' : 'redTrade']">
                                                                {{ (trade.netProceeds).toFixed(2) }}</td>
                                                            <td
                                                                v-if="trade.hasOwnProperty('setup') && trade.setup.hasOwnProperty('pattern') && trade.setup.pattern != null && patterns.filter(x => x.objectId == trade.setup.pattern)[0] != undefined">
                                                                {{ (JSON.parse(JSON.stringify(patterns.filter(x =>
                                                                    x.objectId ==
                                                                    trade.setup.pattern)[0])).name).substr(0, 15) + "..." }}
                                                            </td>
                                                            <td v-else>
                                                                <!--<i class="uil uil-times-square"></i>-->
                                                            </td>
                                                            <td
                                                                v-if="trade.hasOwnProperty('setup') && trade.setup.hasOwnProperty('mistake') && trade.setup.mistake != null && mistakes.filter(x => x.objectId == trade.setup.mistake)[0] != undefined">
                                                                {{ (JSON.parse(JSON.stringify(mistakes.filter(x =>
                                                                    x.objectId ==
                                                                    trade.setup.mistake)[0])).name).substr(0, 15) + "..." }}
                                                            </td>
                                                            <td v-else>
                                                                <!--<i class="uil uil-times-square"></i>-->
                                                            </td>
                                                            <td
                                                                v-if="trade.hasOwnProperty('setup') && trade.setup.hasOwnProperty('note') && trade.setup.note != null">
                                                                {{ (trade.setup.note).substr(0, 15) + "..." }}
                                                            </td>
                                                            <td v-else>

                                                            </td>
                                                            <td>
                                                                <span
                                                                    v-if="tradeSatisfactionArray.findIndex(f => f.id == trade.id) != -1 && tradeSatisfactionArray[tradeSatisfactionArray.findIndex(f => f.id == trade.id)].satisfaction == true">
                                                                    <i class="greenTrade uil uil-thumbs-up"></i>
                                                                </span>
                                                                <span
                                                                    v-if="tradeSatisfactionArray.findIndex(f => f.id == trade.id) != -1 && tradeSatisfactionArray[tradeSatisfactionArray.findIndex(f => f.id == trade.id)].satisfaction == false">
                                                                    <i class="redTrade uil uil-thumbs-down"></i>
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <span
                                                                    v-if="setups.findIndex(f => f.name == trade.id) != -1">
                                                                    <i class="uil uil-image-v"></i>
                                                                </span>
                                                            </td>

                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <!-- BLOTTER TAB -->
                                            <div class="tab-pane fade txt-small" v-bind:id="'blotterNav-' + index"
                                                role="tabpanel" aria-labelledby="nav-overview-tab">
                                                <table v-bind:id="'table' + index" class="table">
                                                    <thead class="thead-dark">
                                                        <tr>
                                                            <th scope="col">Symbol</th>
                                                            <th scope="col">Quantity</th>
                                                            <th scope="col">P&L(g)</th>
                                                            <th scope="col">Fees</th>
                                                            <th scope="col">P&L(n)</th>
                                                            <th scope="col">Wins</th>
                                                            <th scope="col">Losses</th>
                                                            <th scope="col">Trades</th>
                                                            <th scope="col">Executions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr v-for="blot in daily.blotter">

                                                            <td>{{ blot.symbol }}</td>
                                                            <td>{{ blot.buyQuantity + blot.sellQuantity }}</td>
                                                            <td
                                                                v-bind:class="[blot.grossProceeds > 0 ? 'greenTrade' : 'redTrade']">
                                                                {{ (blot.grossProceeds).toFixed(2) }}</td>
                                                            <td>{{ (blot.fees).toFixed(2) }}</td>
                                                            <td
                                                                v-bind:class="[blot[amountCase + 'Proceeds'] > 0 ? 'greenTrade' : 'redTrade']">
                                                                {{ (blot[amountCase + 'Proceeds']).toFixed(2) }}</td>
                                                            <td>{{ blot.grossWinsCount }}</td>
                                                            <td>{{ blot.grossLossCount }}</td>
                                                            <td>{{ blot.trades }}</td>
                                                            <td>{{ blot.executions }}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <!-- SCREENSHOTS TAB -->
                                            <div class="tab-pane fade txt-small" v-bind:id="'screenshotsNav-' + index"
                                                role="tabpanel" aria-labelledby="nav-overview-tab">
                                                <div v-for="setup in setups.filter(obj => obj.dateUnixDay == daily.dateUnix)"
                                                    class="mb-2">
                                                    <span>{{ setup.symbol }}</span><span v-if="setup.side" class="col mt-1">
                                                        | {{ setup.side == 'SS' || setup.side == 'BC' ? 'Short' : 'Long' }}
                                                        | {{ useTimeFormat(setup.dateUnix) }}</span>
                                                    <span v-else class="col mb-2"> | {{ useHourMinuteFormat(setup.dateUnix)
                                                    }}</span>
                                                    <span
                                                        v-if="patternsMistakes.findIndex(obj => obj.tradeId == setup.name) != -1">

                                                        <span
                                                            v-if="patternsMistakes[patternsMistakes.findIndex(obj => obj.tradeId == setup.name)].hasOwnProperty('pattern') && patternsMistakes[patternsMistakes.findIndex(obj => obj.tradeId == setup.name)].pattern != null && patternsMistakes[patternsMistakes.findIndex(obj => obj.tradeId == setup.name)].pattern.hasOwnProperty('name')">
                                                            | {{ patternsMistakes[patternsMistakes.findIndex(obj =>
                                                                obj.tradeId == setup.name)].pattern.name }}</span>

                                                        <span
                                                            v-if="patternsMistakes[patternsMistakes.findIndex(obj => obj.tradeId == setup.name)].hasOwnProperty('mistake') && patternsMistakes[patternsMistakes.findIndex(obj => obj.tradeId == setup.name)].mistake != null && patternsMistakes[patternsMistakes.findIndex(obj => obj.tradeId == setup.name)].mistake.hasOwnProperty('name')">
                                                            | {{ patternsMistakes[patternsMistakes.findIndex(obj =>
                                                                obj.tradeId == setup.name)].mistake.name }}</span></span>

                                                    <img v-bind:id="setup.objectId" class="setupEntryImg mt-1 img-fluid"
                                                        v-bind:src="setup.annotatedBase64" />
                                                </div>
                                            </div>

                                            <!-- DIARY TAB -->
                                            <div class="tab-pane fade" v-bind:id="'diariesNav-' + index" role="tabpanel"
                                                aria-labelledby="nav-overview-tab">
                                                <div v-if="journals.findIndex(obj => obj.dateUnix == daily.dateUnix) != -1">
                                                    <p
                                                        v-if="journals[journals.findIndex(obj => obj.dateUnix == daily.dateUnix)].journal.positive != '<p><br></p>'">
                                                        <span class="dashInfoTitle col mb-2">Positive aspect</span>
                                                        <span
                                                            v-html="journals[journals.findIndex(obj => obj.dateUnix == daily.dateUnix)].journal.positive"></span>
                                                    </p>
                                                    <p
                                                        v-if="journals[journals.findIndex(obj => obj.dateUnix == daily.dateUnix)].journal.negative != '<p><br></p>'">
                                                        <span class="dashInfoTitle">Negative aspect</span>
                                                        <span
                                                            v-html="journals[journals.findIndex(obj => obj.dateUnix == daily.dateUnix)].journal.negative"></span>
                                                    </p>
                                                    <p
                                                        v-if="journals[journals.findIndex(obj => obj.dateUnix == daily.dateUnix)].journal.other != '<p><br></p>'">
                                                        <span class="dashInfoTitle">Observations</span>
                                                        <span
                                                            v-html="journals[journals.findIndex(obj => obj.dateUnix == daily.dateUnix)].journal.other"></span>
                                                    </p>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                    <!-- end PART 2 -->

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- end card-->

                <!-- ============ CALENDAR ============ -->
                <div v-show="calendarData && !spinnerLoadingPage" class="col-12 col-xl-4 text-center mt-2 align-self-start">
                    <div class="dailyCard calCard">
                        <div class="row">
                            <Calendar />
                        </div>
                    </div>
                </div>

                <!-- ============ TRADES MODAL ============ -->
                <div class="modal fade" id="tradesModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
                    aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-xl">
                        <div class="modal-content">
                            <div v-if="modalVideosOpen">

                                <div v-if="setup.annotatedBase64" class="mt-3" id="imagePreview"
                                    style="position: relative; display: flex; flex-direction: column; align-items: center; padding-top: 40px;">
                                    <img id="setupDiv" v-bind:src="setup.originalBase64" style="position: relative;"
                                        v-bind:key="renderData" crossorigin="anonymous" />
                                    <img v-bind:src="setup.annotatedBase64" style="position: absolute;"
                                        v-on:click="useSetupMarkerArea()" />
                                </div>

                                <!-- *** Table *** -->
                                <div v-bind:class="[!hasVideo ? 'mt-3' : '']">
                                    <table class="table">
                                        <thead class="thead-dark">
                                            <tr>
                                                <th scope="col">Symbol</th>
                                                <th scope="col">Qty</th>
                                                <th scope="col">Side</th>
                                                <th scope="col">Time(i)</th>
                                                <th scope="col">Time(o)</th>
                                                <th scope="col">Duration</th>
                                                <th scope="col">Price(i)</th>
                                                <th scope="col">Price(o)</th>
                                                <th scope="col">P&L/Sh(g)</th>
                                                <th scope="col">P/L(n)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <!-- the page loads faster than the video blob => check if blob, that is after slash, is not null, and then load -->
                                            <tr>
                                                <td>{{ daily.trades[videosArrayIndex].symbol }}</td>
                                                <td>{{ daily.trades[videosArrayIndex].buyQuantity +
                                                    daily.trades[videosArrayIndex].sellQuantity }}
                                                </td>
                                                <td>{{ daily.trades[videosArrayIndex].side == 'B' ? 'Long' : 'Short' }}</td>
                                                <td>{{ useTimeFormat(daily.trades[videosArrayIndex].entryTime) }}</td>
                                                <td>{{ useTimeFormat(daily.trades[videosArrayIndex].exitTime) }}</td>
                                                <td>{{ useTimeDuration(daily.trades[videosArrayIndex].exitTime -
                                                    daily.trades[videosArrayIndex].entryTime) }}</td>
                                                <td>{{ (daily.trades[videosArrayIndex].entryPrice).toFixed(2) }}</td>
                                                <td>{{ (daily.trades[videosArrayIndex].exitPrice).toFixed(2) }}</td>
                                                <td
                                                    v-bind:class="[(daily.trades[videosArrayIndex].grossSharePL) > 0 ? 'greenTrade' : 'redTrade']">
                                                    {{ (daily.trades[videosArrayIndex].grossSharePL).toFixed(2) }}</td>
                                                <td
                                                    v-bind:class="[daily.trades[videosArrayIndex].netProceeds > 0 ? 'greenTrade' : 'redTrade']">
                                                    {{ (daily.trades[videosArrayIndex].netProceeds).toFixed(2) }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <!-- *** VARIABLES *** -->
                                <div class="mt-1 mb-2 row align-items-center ms-1 me-1 tradeSetup">
                                    <div class="col-12">
                                        <div class="row">
                                            <!-- First line -->
                                            <div class="col-12" v-show="!spinnerSetups">
                                                <div class="row">

                                                    <!-- Satisfaction -->
                                                    <div class="col-1">
                                                        <i v-on:click="tradeSatisfactionChange(daily.trades[videosArrayIndex].id, true, daily.dateUnix)"
                                                            v-bind:class="[tradeSatisfactionArray.findIndex(f => f.id == daily.trades[videosArrayIndex].id) != -1 ? tradeSatisfactionArray[tradeSatisfactionArray.findIndex(f => f.id == daily.trades[videosArrayIndex].id)].satisfaction == true ? 'greenTrade' : '' : '', 'uil', 'uil-thumbs-up', 'pointerClass', 'me-1']"></i>

                                                        <i v-on:click="tradeSatisfactionChange(daily.trades[videosArrayIndex].id, false, daily.dateUnix)"
                                                            v-bind:class="[tradeSatisfactionArray.findIndex(f => f.id == daily.trades[videosArrayIndex].id) != -1 ? tradeSatisfactionArray[tradeSatisfactionArray.findIndex(f => f.id == daily.trades[videosArrayIndex].id)].satisfaction == false ? 'redTrade' : '' : '', 'uil', 'uil-thumbs-down', 'pointerClass']"></i>
                                                    </div>

                                                    <!-- Patterns -->
                                                    <div class="col-5">
                                                        <select
                                                            v-on:change="useTradeSetupChange($event.target.value, 'pattern', daily.dateUnix, daily.trades[videosArrayIndex].id, daily.trades[videosArrayIndex].entryTime)"
                                                            class="form-select">
                                                            <option value='null' selected>Pattern</option>
                                                            <option v-for="item in patterns.filter(r => r.active == true)"
                                                                v-bind:value="item.objectId"
                                                                v-bind:selected="item.objectId == (tradeSetup.pattern != null ? tradeSetup.pattern : '')">
                                                                {{ item.name }}</option>
                                                        </select>
                                                    </div>

                                                    <!-- Mistakes -->
                                                    <div class="col-5">
                                                        <select
                                                            v-on:change="useTradeSetupChange($event.target.value, 'mistake', daily.dateUnix, daily.trades[videosArrayIndex].id, daily.trades[videosArrayIndex].entryTime)"
                                                            class="form-select">
                                                            <option value='null' selected>Mistake</option>
                                                            <option v-for="item in mistakes.filter(r => r.active == true)"
                                                                v-bind:value="item.objectId"
                                                                v-bind:selected="item.objectId == (tradeSetup.mistake != null ? tradeSetup.mistake : '')">
                                                                {{ item.name }}</option>
                                                        </select>
                                                    </div>

                                                    <!-- Delete -->
                                                    <div class="col-1">
                                                        <i v-on:click="useDeletePatternMistake(daily.dateUnix, daily.trades[videosArrayIndex].id)"
                                                            class="ps-2 uil uil-trash-alt pointerClass"></i>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Second line -->
                                            <div class="col-12 mt-2" v-show="!spinnerSetups">
                                                <div class="row">
                                                    <div class="col-4">
                                                        <input type="number" class="form-control" placeholder="Stop Loss"
                                                            v-bind:value="excursions.findIndex(f => f.tradeId == daily.trades[videosArrayIndex].id) != -1 ? excursions[excursions.findIndex(f => f.tradeId == daily.trades[videosArrayIndex].id)].stopLoss : ''"
                                                            v-on:input="tradeExcursionChange($event.target.value, 'stopLoss', daily.dateUnix, daily.trades[videosArrayIndex].id)">
                                                    </div>
                                                    <div class="col-4">
                                                        <input type="number" class="form-control" placeholder="MAE Price"
                                                            v-bind:value="excursions.findIndex(f => f.tradeId == daily.trades[videosArrayIndex].id) != -1 ? excursions[excursions.findIndex(f => f.tradeId == daily.trades[videosArrayIndex].id)].maePrice : ''"
                                                            v-on:input="tradeExcursionChange($event.target.value, 'maePrice', daily.dateUnix, daily.trades[videosArrayIndex].id)">
                                                    </div>
                                                    <div class="col-4">
                                                        <input type="number" class="form-control" placeholder="MFE Price"
                                                            v-bind:value="excursions.findIndex(f => f.tradeId == daily.trades[videosArrayIndex].id) != -1 ? excursions[excursions.findIndex(f => f.tradeId == daily.trades[videosArrayIndex].id)].mfePrice : ''"
                                                            v-on:input="tradeExcursionChange($event.target.value, 'mfePrice', daily.dateUnix, daily.trades[videosArrayIndex].id)">
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Third line -->
                                            <div class="col-12 mt-2" v-show="!spinnerSetups">
                                                <textarea class="form-control" placeholder="note" id="floatingTextarea"
                                                    v-bind:value="tradeSetup.note != null ? tradeSetup.note : ''"
                                                    v-on:input="useTradeSetupChange($event.target.value, 'note', daily.dateUnix, daily.trades[videosArrayIndex].id, daily.trades[videosArrayIndex].entryTime)"></textarea>
                                            </div>

                                            <div class="col-12 mt-2" v-show="!spinnerSetups">
                                                <input class="screenshotFile" type="file"
                                                    @change="useSetupImageUpload($event, daily.trades[videosArrayIndex].entryTime, daily.trades[videosArrayIndex].symbol, daily.trades[videosArrayIndex].side)" />
                                            </div>

                                            <!-- Fifth line -->
                                            <div class="col-12 mt-2" v-show="!spinnerSetups">
                                                <div class="row">
                                                    <div class="col-4 text-start">
                                                        <button v-if="daily.trades.hasOwnProperty(videosArrayIndex - 1)"
                                                            class="btn btn-outline-primary btn-sm ms-3 mb-2"
                                                            v-on:click="clickTradesModal(daily.trades[videosArrayIndex - 1].videoStart && daily.trades[videosArrayIndex - 1].videoEnd ? true : false, videosArrayIndex - 1, '')"
                                                            v-bind:disabled="spinnerSetups == true">
                                                            <i class="fa fa-chevron-left me-2"></i>Back</button>
                                                    </div>
                                                    <div class="col-4 text-center">
                                                        <button v-if="indexedDBtoUpdate"
                                                            class="btn btn-outline-success btn-sm"
                                                            v-on:click="hideTradesModal">Close & Save</button>
                                                        <button v-else class="btn btn-outline-primary btn-sm"
                                                            v-on:click="hideTradesModal">Close</button>
                                                    </div>
                                                    <div v-if="daily.trades.hasOwnProperty(videosArrayIndex + 1)"
                                                        class="ms-auto col-2 text-end">
                                                        <button class="btn btn-outline-primary btn-sm me-3 mb-2"
                                                            v-on:click="clickTradesModal(daily.trades[videosArrayIndex + 1].videoStart && daily.trades[videosArrayIndex + 1].videoEnd ? true : false, videosArrayIndex + 1, '')"
                                                            v-bind:disabled="spinnerSetups == true">Next<i
                                                                class="fa fa-chevron-right ms-2"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Spinner -->
                                            <div v-show="spinnerSetups" class="col-12">
                                                <div class="spinner-border spinner-border-sm text-blue" role="status"></div>
                                                <span>{{ spinnerSetupsText }}</span>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                <hr>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </DashboardLayout>
</template>