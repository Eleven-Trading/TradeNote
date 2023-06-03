<script setup>
import { onBeforeMount, onMounted } from 'vue';
import Filters from '../components/Filters.vue'
import NoData from '../components/NoData.vue';
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import Calendar from '../components/Calendar.vue';
import { spinnerLoadingPage, calendarData, filteredTrades, screenshots, diaries, modalDailyTradeOpen, renderData, patterns, mistakes, amountCase, markerAreaOpen, screenshot, tradeSetupChanged, tradeScreenshotChanged, excursion, tradeExcursionChanged, spinnerSetups, spinnerSetupsText, tradeExcursionId, tradeExcursionDateUnix, hasData, tradeId, renderingCharts, satisfactionTradeArray, satisfactionArray, excursions, saveButton, activePatterns, activeMistakes, itemTradeIndex, tradeIndex, tradeIndexPrevious, spinnerLoadMore, endOfList } from '../stores/globals';
import { useCreatedDateFormat, useTwoDecCurrencyFormat, useTimeFormat, useHourMinuteFormat, useInitTab, useTimeDuration, useMountDaily, useGetSelectedRange, useTwoDecFormat } from '../utils/utils';
import { useSetupImageUpload, useSetupMarkerArea, useSaveScreenshot } from '../utils/screenshots';
import { useTradeSetupChange, useUpdateSetups, useDeleteSetup } from '../utils/setups'
import { useGetExcursions, useGetSatisfactions } from '../utils/daily';
import { useGetFilteredTradesForDaily } from '../utils/trades'
import { useRenderDoubleLineChart, useRenderPieChart } from '../utils/charts';

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

let tradesModal = null

let tradeSatisfactionId
let tradeSatisfaction
let tradeSatisfactionDateUnix
useMountDaily()


onBeforeMount(async () => {

})
onMounted(async () => {
    tradesModal = new bootstrap.Modal("#tradesModal")
    window.addEventListener('scroll', async () => {
        let scrollFromTop = window.scrollY
        let visibleScreen = (window.innerHeight + 200) // adding 200 so that loads before getting to bottom
        let documentHeight = document.documentElement.scrollHeight
        let difference = documentHeight - (scrollFromTop + visibleScreen)
        //console.log("scroll top "+scrollFromTop)
        //console.log("visible screen "+visibleScreen)
        //console.log("documentHeight "+documentHeight)
        if (difference <= 0) {
            if (!spinnerLoadMore.value && !spinnerLoadingPage.value && !endOfList.value) { //To avoid firing multiple times, make sure it's not loadin for the first time and that there is not already a loading more (spinner)
                console.log("  --> Loading more")
                await (spinnerLoadMore.value = true)
                await useGetFilteredTradesForDaily()
                await (spinnerLoadMore.value = false)
                await Promise.all([useRenderDoubleLineChart(), useRenderPieChart()])
                useInitTab("daily")
                await (renderingCharts.value = false)
            }
        }
    })

})


/**************
 * SATISFACTION
 ***************/
async function dailySatisfactionChange(param1, param2, param3) {
    console.log("\nDAILY SATISFACTION CHANGE")
    console.time("  --> Duration daily satisfaction change")
    param3.satisfaction = param2
    await updateDailySatisfaction(param1, param2)
    await console.timeEnd("  --> Duration daily satisfaction change")
}

async function updateDailySatisfaction(param1, param2) { //param1 : daily unixDate ; param2 : true / false ; param3: dateUnixDay ; param4: tradeId
    //console.log(" param 1 " + param1)
    console.log(" -> updating satisfactions")
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
        resolve()


    })
}


async function tradeSatisfactionChange(param1, param2) {

    tradeSatisfactionId = param1.id
    tradeSatisfactionDateUnix = param1.dateUnix
    tradeSatisfaction = param2
    param1.satisfaction = tradeSatisfaction
    await updateTradeSatisfaction()

}

async function updateTradeSatisfaction() { //param1 : daily unixDate ; param2 : true / false ; param3: dateUnixDay ; param4: tradeId
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



/**************
 * EXCURSIONS
 ***************/

function tradeExcursionClicked() {
    //console.log("click")
    tradeExcursionChanged.value = true
    saveButton.value = true
}
function tradeExcursionChange(param1, param2, param3, param4) {
    console.log("param 1: " + param1 + " param2: " + param2, ", param3: " + param3 + ", param4: " + param4)
    if (param2 == "stopLoss") {
        if (param1) {
            excursion.stopLoss = parseFloat(param1)
        } else {
            excursion.stopLoss = null
        }

    }
    if (param2 == "maePrice") {
        excursion.maePrice = parseFloat(param1)
    }
    if (param2 == "mfePrice") {
        excursion.mfePrice = parseFloat(param1)
    }
    tradeExcursionDateUnix.value = param3
    tradeExcursionId.value = param4
    //console.log("Excursion has changed: " + JSON.stringify(excursion))

}

async function updateExcursions() {
    console.log("\nUPDATING OR SAVING EXCURSIONS IN PARSE DB")
    return new Promise(async (resolve, reject) => {

        if (excursion.stopLoss != null || excursion.maePrice != null || excursion.mfePrice != null) {
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
                        await useGetSelectedRange()
                        await useGetExcursions()
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
                        await useGetSelectedRange()
                        await useGetExcursions()
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
async function clickTradesModal(param1, param2, param3) {
    //param1 : itemTradeIndex : index inside filteredtrades. This is only defined on first click/when we open modal and not on next or previous
    //param2 : also called tradeIndex, is the index inside the trades (= index of itemTrade.trades)
    //param3 : tradeIndex back or next, so with -1 or +1. On modal open, param3 = param2
    //console.log(" param 3 "+JSON.stringify(param3))
    //console.log("param1 "+param1)
    //console.log("param2 "+param2)
    //console.log("param3 "+param3)
    if (markerAreaOpen.value == true) {
        alert("Please save your screenshot annotation")
        return
    } else {
        await (spinnerSetups.value = true)
        itemTradeIndex.value = param1
        tradeIndexPrevious.value = param2
        tradeIndex.value = param3

        if (tradeSetupChanged.value) {
            await useUpdateSetups()
        }

        if (tradeExcursionChanged.value) {
            await updateExcursions()
        }

        if (tradeScreenshotChanged.value) {
            await useSaveScreenshot()
        }

        let awaitClick = async () => {
            tradeSetupChanged.value = false //we updated setups and trades so false cause not need to do it again when we hide modal
            tradeExcursionChanged.value = false
            tradeScreenshotChanged.value = false
            modalDailyTradeOpen.value = true

            await resetExcursion()

            let findScreenshot = screenshots.find(obj => obj.name == filteredTrades[itemTradeIndex.value].trades[param3].id)
            if (findScreenshot) {
                for (let key in screenshot) delete screenshot[key]
                for (let key in findScreenshot) {
                    screenshot[key] = findScreenshot[key]
                }
            } else {
                for (let key in screenshot) delete screenshot[key]
                screenshot.side = null
                screenshot.type = null
            }


            let findExcursion = excursions.filter(obj => obj.tradeId == filteredTrades[itemTradeIndex.value].trades[param3].id)
            if (findExcursion.length) {
                findExcursion[0].stopLoss != null ? excursion.stopLoss = findExcursion[0].stopLoss : null
                findExcursion[0].maePrice != null ? excursion.maePrice = findExcursion[0].maePrice : null
                findExcursion[0].mfePrice != null ? excursion.mfePrice = findExcursion[0].mfePrice : null
                //console.log(" tradeExcursion "+JSON.stringify(tradeExcursion))
            }

        }
        await awaitClick()
        await (spinnerSetups.value = false)
        saveButton.value = false
    }

}

async function hideTradesModal() {
    if (markerAreaOpen.value == true) {
        alert("Please save your screenshot annotation")
        return
    } else {
        await (spinnerSetups.value = true)
        if (tradeScreenshotChanged.value) {
            await useSaveScreenshot()
        }
        if (tradeSetupChanged.value) {
            await useUpdateSetups()
        }
        if (tradeExcursionChanged.value) { //in the case excursion changed but did not click on next 
            await updateExcursions()
        }
        await (spinnerSetups.value = false)
        tradesModal.hide()
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

</script>

<template>
    <SpinnerLoadingPage />
    <div v-if="!spinnerLoadingPage && filteredTrades" class="row mt-2 mb-2">
        <Filters />
        <div v-if="!hasData">
            <NoData />
        </div>
        <div v-show="hasData">
            <!-- added v-if instead v-show because need to wait for patterns to load -->
            <div class="row">
                <!-- ============ CARD ============ -->
                <div class="col-12 col-xl-8">
                    <!-- v-show insead of v-if or else init tab does not work cause div is not created until spinner is false-->
                    <div v-for="(itemTrade, index) in filteredTrades" class="row mt-2">
                        <div class="col-12">
                            <div class="dailyCard">
                                <div class="row">
                                    <!-- ============ PART 1 ============ -->
                                    <!-- Line 1 : Date and P&L -->
                                    <!--<input id="providers" type="text" class="form-control" placeholder="Fournisseur*" autocomplete="off"/>-->

                                    <div class="col-12 cardFirstLine d-flex align-items-center fw-bold">
                                        <div class="col-auto">{{ useCreatedDateFormat(itemTrade.dateUnix) }}
                                            <i v-on:click="dailySatisfactionChange(itemTrade.dateUnix, true, itemTrade)"
                                                v-bind:class="[itemTrade.satisfaction == true ? 'greenTrade' : '', 'uil', 'uil-thumbs-up', 'ms-2', 'me-1', 'pointerClass']"></i>
                                            <i v-on:click="dailySatisfactionChange(itemTrade.dateUnix, false, itemTrade)"
                                                v-bind:class="[itemTrade.satisfaction == false ? 'redTrade' : '', , 'uil', 'uil-thumbs-down', 'pointerClass']"></i>
                                        </div>
                                        <div class="col-auto ms-auto">P&L: <span
                                                v-bind:class="[itemTrade.pAndL[amountCase + 'Proceeds'] > 0 ? 'greenTrade' : 'redTrade']">{{
                                                    useTwoDecCurrencyFormat(itemTrade.pAndL[amountCase + 'Proceeds']) }}</span>
                                        </div>

                                    </div>

                                    <!-- Line 2 : Charts and total data -->
                                    <div class="col-12 d-flex align-items-center text-center">
                                        <div class="row">

                                            <!--  -> Win Loss Chart -->
                                            <div class="col-12 col-lg-6">
                                                <div class="row">
                                                    <div class="col-4">
                                                        <div v-bind:id="'pieChart' + itemTrade.dateUnix"
                                                            class="chartIdDailyClass">
                                                        </div>
                                                    </div>
                                                    <!--  -> Win Loss evolution Chart -->
                                                    <div class="col-8 chartCard">
                                                        <div v-bind:id="'doubleLineChart' + itemTrade.dateUnix"
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
                                                            <p>{{ itemTrade.pAndL.executions }}</p>
                                                        </div>
                                                        <div>
                                                            <label>Trades</label>
                                                            <p>{{ itemTrade.pAndL.trades }}</p>
                                                        </div>
                                                    </div>

                                                    <!--  -> Tot Wins and losses -->
                                                    <div class="col row">
                                                        <div>
                                                            <label>Wins</label>
                                                            <p>{{ itemTrade.pAndL.grossWinsCount }}</p>
                                                        </div>
                                                        <div>
                                                            <label>Losses</label>
                                                            <p>{{ itemTrade.pAndL.grossLossCount }}</p>
                                                        </div>
                                                    </div>

                                                    <!--  -> Tot commission and gross p&l -->
                                                    <div class="col row">
                                                        <div>
                                                            <label>Fees</label>
                                                            <p>{{ useTwoDecCurrencyFormat(itemTrade.pAndL.fees) }}</p>
                                                        </div>
                                                        <div>
                                                            <label>P&L(g)</label>
                                                            <p>{{ useTwoDecCurrencyFormat(itemTrade.pAndL.grossProceeds) }}
                                                            </p>
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
                                                        v-if="dashTab.id == 'screenshots' && screenshots.filter(obj => obj.dateUnixDay == itemTrade.dateUnix).length > 0"
                                                        class="txt-small"> ({{ screenshots.filter(obj => obj.dateUnixDay ==
                                                            itemTrade.dateUnix).length }})</span>
                                                    <!--({{itemTrade[dashTab.id].length}})-->
                                                </button>
                                            </div>
                                        </nav>
                                        <div class="tab-content" id="nav-tabContent">
                                            <!-- TRADES TAB -->
                                            <div class="tab-pane fade txt-small" v-bind:id="'tradesNav-' + index"
                                                role="tabpanel" aria-labelledby="nav-overview-tab">
                                                <table class="table">
                                                    <thead>
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
                                                            <th scope="col"></th>
                                                            <th scope="col"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>

                                                        <!-- the page loads faster than the video blob => check if blob, that is after slash, is not null, and then load -->
                                                        <!--<tr v-if="/[^/]*$/.exec(videoBlob)[0]!='null'&&trade.videoStart&&trade.videoEnd">-->

                                                        <tr v-for="(trade, index2) in itemTrade.trades"
                                                            data-bs-toggle="modal" data-bs-target="#tradesModal"
                                                            v-on:click="clickTradesModal(index, index2, index2)"
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
                                                            <td>
                                                                {{ trade.patternNameShort }}
                                                            </td>
                                                            <td>
                                                                {{ trade.mistakeNameShort }}
                                                            </td>
                                                            <td>
                                                                {{ trade.noteShort }}
                                                            </td>
                                                            <td>
                                                                <span v-if="trade.satisfaction == true">
                                                                    <i class="greenTrade uil uil-thumbs-up"></i>
                                                                </span>
                                                                <span v-if="trade.satisfaction == false">
                                                                    <i class="redTrade uil uil-thumbs-down"></i>
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <span
                                                                    v-if="screenshots.findIndex(f => f.name == trade.id) != -1">
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
                                                    <thead>
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
                                                        <tr v-for="blot in itemTrade.blotter">

                                                            <td>{{ blot.symbol }}</td>
                                                            <td>{{ blot.buyQuantity + blot.sellQuantity }}</td>
                                                            <td
                                                                v-bind:class="[blot.grossProceeds > 0 ? 'greenTrade' : 'redTrade']">
                                                                {{ (blot.grossProceeds).toFixed(2) }}</td>
                                                            <td>{{ (blot.fees).toFixed(2) }}</td>
                                                            <td
                                                                v-bind:class="[blot[amountCase + 'Proceeds'] > 0 ? 'greenTrade' : 'redTrade']">
                                                                {{ (blot.netProceeds).toFixed(2) }}</td>
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
                                                <div v-for="screenshot in screenshots.filter(obj => obj.dateUnixDay == itemTrade.dateUnix)"
                                                    class="mb-2">
                                                    <span>{{ screenshot.symbol }}</span><span v-if="screenshot.side"
                                                        class="col mt-1">
                                                        | {{ screenshot.side == 'SS' || screenshot.side == 'BC' ? 'Short' :
                                                            'Long' }}
                                                        | {{ useTimeFormat(screenshot.dateUnix) }}</span>
                                                    <span v-else class="col mb-2"> | {{
                                                        useHourMinuteFormat(screenshot.dateUnix)
                                                    }}</span>

                                                    <span>{{ screenshot.patternName }}</span>

                                                    <span>{{ screenshot.mistakeName }}</span>

                                                    <img v-bind:id="screenshot.objectId"
                                                        class="setupEntryImg mt-1 img-fluid"
                                                        v-bind:src="screenshot.annotatedBase64" />
                                                </div>
                                            </div>

                                            <!-- DIARY TAB -->
                                            <div class="tab-pane fade" v-bind:id="'diariesNav-' + index" role="tabpanel"
                                                aria-labelledby="nav-overview-tab">
                                                <div
                                                    v-for="itemDiary in diaries.filter(obj => obj.dateUnix == itemTrade.dateUnix)">
                                                    <p v-if="itemDiary.journal.positive != '<p><br></p>'">
                                                        <span class="dashInfoTitle col mb-2">Positive aspect</span>
                                                        <span v-html="itemDiary.journal.positive"></span>
                                                    </p>
                                                    <p v-if="itemDiary.journal.negative != '<p><br></p>'">
                                                        <span class="dashInfoTitle">Negative aspect</span>
                                                        <span v-html="itemDiary.journal.negative"></span>
                                                    </p>
                                                    <p v-if="itemDiary.journal.other != '<p><br></p>'">
                                                        <span class="dashInfoTitle">Observations</span>
                                                        <span v-html="itemDiary.journal.other"></span>
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
            </div>

            <!-- Load more spinner -->
            <div v-if="spinnerLoadMore" class="d-flex justify-content-center mt-3">
                <div class="spinner-border text-blue" role="status"></div>
            </div>

        </div>
    </div>
    <!-- ============ TRADES MODAL ============ -->
    <div class="modal fade" id="tradesModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div v-if="modalDailyTradeOpen">

                    <div v-if="screenshot.annotatedBase64" class="mt-3" id="imagePreview"
                        style="position: relative; display: flex; flex-direction: column; align-items: center; padding-top: 40px;">
                        <img id="setupDiv" v-bind:src="screenshot.originalBase64" style="position: relative;"
                            v-bind:key="renderData" crossorigin="anonymous" />
                        <img v-bind:src="screenshot.annotatedBase64" style="position: absolute;"
                            v-on:click="useSetupMarkerArea()" />
                    </div>

                    <!-- *** Table *** -->
                    <div class="mt-3 table-responsive">
                        <table class="table">
                            <thead>
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
                                    <td>{{ filteredTrades[itemTradeIndex].trades[tradeIndex].symbol }}</td>
                                    <td>{{ filteredTrades[itemTradeIndex].trades[tradeIndex].buyQuantity +
                                        filteredTrades[itemTradeIndex].trades[tradeIndex].sellQuantity }}
                                    </td>
                                    <td>{{ filteredTrades[itemTradeIndex].trades[tradeIndex].side == 'B' ? 'Long' : 'Short'
                                    }}</td>
                                    <td>{{ useTimeFormat(filteredTrades[itemTradeIndex].trades[tradeIndex].entryTime) }}
                                    </td>
                                    <td>{{ useTimeFormat(filteredTrades[itemTradeIndex].trades[tradeIndex].exitTime) }}</td>
                                    <td>{{ useTimeDuration(filteredTrades[itemTradeIndex].trades[tradeIndex].exitTime -
                                        filteredTrades[itemTradeIndex].trades[tradeIndex].entryTime) }}</td>
                                    <td>{{ (filteredTrades[itemTradeIndex].trades[tradeIndex].entryPrice).toFixed(2) }}</td>
                                    <td>{{ (filteredTrades[itemTradeIndex].trades[tradeIndex].exitPrice).toFixed(2) }}</td>
                                    <td
                                        v-bind:class="[(filteredTrades[itemTradeIndex].trades[tradeIndex].grossSharePL) > 0 ? 'greenTrade' : 'redTrade']">
                                        {{ (filteredTrades[itemTradeIndex].trades[tradeIndex].grossSharePL).toFixed(2) }}
                                    </td>
                                    <td
                                        v-bind:class="[filteredTrades[itemTradeIndex].trades[tradeIndex].netProceeds > 0 ? 'greenTrade' : 'redTrade']">
                                        {{ (filteredTrades[itemTradeIndex].trades[tradeIndex].netProceeds).toFixed(2) }}
                                    </td>
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
                                            <i v-on:click="tradeSatisfactionChange(filteredTrades[itemTradeIndex].trades[tradeIndex], true)"
                                                v-bind:class="[filteredTrades[itemTradeIndex].trades[tradeIndex].satisfaction == true ? 'greenTrade' : '', 'uil', 'uil-thumbs-up', 'pointerClass', 'me-1']"></i>

                                            <i v-on:click="tradeSatisfactionChange(filteredTrades[itemTradeIndex].trades[tradeIndex], false)"
                                                v-bind:class="[filteredTrades[itemTradeIndex].trades[tradeIndex].satisfaction == false ? 'redTrade' : '', 'uil', 'uil-thumbs-down', 'pointerClass']"></i>
                                        </div>

                                        <!-- Patterns -->
                                        <div class="col-4" v-if="patterns.length > 0">
                                            <select
                                                v-on:change="useTradeSetupChange($event.target.value, 'pattern', filteredTrades[itemTradeIndex].dateUnix, filteredTrades[itemTradeIndex].trades[tradeIndex].id, filteredTrades[itemTradeIndex].trades[tradeIndex].entryTime)"
                                                class="form-select">
                                                <option value='null' selected>Pattern</option>
                                                <option v-for="itemActivePattern in activePatterns"
                                                    v-bind:value="itemActivePattern.objectId"
                                                    v-bind:selected="itemActivePattern.objectId == filteredTrades[itemTradeIndex].trades[tradeIndex].pattern">
                                                    {{ itemActivePattern.name }}</option>
                                            </select>
                                        </div>
                                        <div class="col-4" v-else>
                                            <span class="form-control">Add pattern tags in <a
                                                    href="/settings">settings</a></span>
                                        </div>

                                        <!-- Mistakes -->
                                        <div class="col-4" v-if="mistakes.length > 0">
                                            <select
                                                v-on:change="useTradeSetupChange($event.target.value, 'mistake', filteredTrades[itemTradeIndex].dateUnix, filteredTrades[itemTradeIndex].trades[tradeIndex].id, filteredTrades[itemTradeIndex].trades[tradeIndex].entryTime)"
                                                class="form-select">
                                                <option value='null' selected>Mistake</option>
                                                <option v-for="item in activeMistakes" v-bind:value="item.objectId"
                                                    v-bind:selected="item.objectId == filteredTrades[itemTradeIndex].trades[tradeIndex].mistake">
                                                    {{ item.name }}</option>
                                            </select>
                                        </div>
                                        <div class="col-4" v-else>
                                            <span class="form-control">Add mistake tags in <a
                                                    href="/settings">settings</a></span>
                                        </div>
                                        <div class="col-3">
                                            <input type="number" class="form-control" placeholder="MFE Price" style="font-size: small;"
                                                v-bind:value="excursion.mfePrice"
                                                v-on:change="tradeExcursionChange($event.target.value, 'mfePrice', filteredTrades[itemTradeIndex].dateUnix, filteredTrades[itemTradeIndex].trades[tradeIndex].id)">
                                        </div>
                                        <!-- Delete
                                        <div class="col-1">
                                            <i v-on:click="useDeleteSetup(filteredTrades[itemTradeIndex].dateUnix, filteredTrades[itemTradeIndex].trades[tradeIndex])"
                                                class="ps-2 uil uil-trash-alt pointerClass"></i>
                                        </div> -->
                                    </div>
                                </div>

                                <!-- Second line -->
                                <div class="col-12 mt-2" v-show="!spinnerSetups">
                                    <textarea class="form-control" placeholder="note" id="floatingTextarea"
                                        v-bind:value="filteredTrades[itemTradeIndex].trades[tradeIndex].note"
                                        v-on:change="useTradeSetupChange($event.target.value, 'note', filteredTrades[itemTradeIndex].dateUnix, filteredTrades[itemTradeIndex].trades[tradeIndex].id, filteredTrades[itemTradeIndex].trades[tradeIndex].entryTime)"></textarea>
                                </div>

                                <!-- Third line
                                <div class="col-12 mt-2" v-show="!spinnerSetups">
                                    <div class="row">
                                        <div class="col-6">
                                            <input type="number" class="form-control" placeholder="Stop Loss"
                                                v-bind:value="excursion.stopLoss"
                                                v-on:change="tradeExcursionChange($event.target.value, 'stopLoss', filteredTrades[itemTradeIndex].dateUnix, filteredTrades[itemTradeIndex].trades[tradeIndex].id)"
                                                v-on:click="tradeExcursionClicked">
                                        </div>
                                        <div class="col-6">
                                            <input type="number" class="form-control" placeholder="MFE Price"
                                                v-bind:value="excursion.mfePrice"
                                                v-on:change="tradeExcursionChange($event.target.value, 'mfePrice', filteredTrades[itemTradeIndex].dateUnix, filteredTrades[itemTradeIndex].trades[tradeIndex].id)">
                                        </div>
                                    </div>
                                </div>-->

                                <!-- Forth line -->
                                <div class="col-12 mt-3" v-show="!spinnerSetups">
                                    <input class="screenshotFile" type="file"
                                        @change="useSetupImageUpload($event, filteredTrades[itemTradeIndex].trades[tradeIndex].entryTime, filteredTrades[itemTradeIndex].trades[tradeIndex].symbol, filteredTrades[itemTradeIndex].trades[tradeIndex].side)" />
                                </div>


                                <!-- Fifth line -->
                                <div class="col-12 mt-3" v-show="!spinnerSetups">
                                    <div class="row">
                                        <div class="col-4 text-start">
                                            <button
                                                v-if="filteredTrades[itemTradeIndex].trades.hasOwnProperty(tradeIndex - 1)"
                                                class="btn btn-outline-primary btn-sm ms-3 mb-2"
                                                v-on:click="clickTradesModal(itemTradeIndex, tradeIndex, tradeIndex - 1)"
                                                v-bind:disabled="spinnerSetups == true">
                                                <i class="fa fa-chevron-left me-2"></i></button>
                                        </div>
                                        <div class="col-4 text-center">
                                            <button v-if="saveButton" class="btn btn-outline-success btn-sm"
                                                v-on:click="hideTradesModal()">Close
                                                & Save</button>
                                            <button v-else class="btn btn-outline-primary btn-sm"
                                                v-on:click="hideTradesModal()">Close</button>
                                        </div>
                                        <div v-if="filteredTrades[itemTradeIndex].trades.hasOwnProperty(tradeIndex + 1)"
                                            class="ms-auto col-4 text-end">
                                            <button class="btn btn-outline-primary btn-sm me-3 mb-2"
                                                v-on:click="clickTradesModal(itemTradeIndex, tradeIndex, tradeIndex + 1)"
                                                v-bind:disabled="spinnerSetups == true"><i
                                                    class="fa fa-chevron-right ms-2"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Spinner -->
                                <div v-show="spinnerSetups" class="col-12">
                                    <div class="d-flex justify-content-center">
                                        <div class="spinner-border spinner-border-sm text-blue" role="status"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr>
                </div>
            </div>
        </div>
    </div>
</template>