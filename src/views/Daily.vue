<script setup>
import { onBeforeMount, onMounted, computed, reactive } from 'vue';
import Filters from '../components/Filters.vue'
import NoData from '../components/NoData.vue';
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import Calendar from '../components/Calendar.vue';
import Screenshot from '../components/Screenshot.vue'

import { spinnerLoadingPage, calendarData, filteredTrades, screenshots, diaries, modalDailyTradeOpen, amountCase, markerAreaOpen, screenshot, tradeScreenshotChanged, excursion, tradeExcursionChanged, spinnerSetups, spinnerSetupsText, tradeExcursionId, tradeExcursionDateUnix, hasData, tradeId, excursions, saveButton, itemTradeIndex, tradeIndex, tradeIndexPrevious, spinnerLoadMore, endOfList, selectedGrossNet, availableTags, tradeTagsChanged, tagInput, tags, tradeTags, showTagsList, selectedTagIndex, tradeTagsId, tradeTagsDateUnix, newTradeTags, notes, tradeNote, tradeNoteChanged, tradeNoteDateUnix, tradeNoteId, availableTagsArray, timeZoneTrade, screenshotsInfos, idCurrentType, idCurrentNumber } from '../stores/globals';

import { useCreatedDateFormat, useTwoDecCurrencyFormat, useTimeFormat, useTimeDuration, useMountDaily, useGetSelectedRange, useLoadMore, useCheckVisibleScreen, useDecimalsArithmetic, useInitTooltip, useDateCalFormat, useSwingDuration, useStartOfDay, useInitTab } from '../utils/utils';

import { useSetupImageUpload, useSaveScreenshot, useGetScreenshots } from '../utils/screenshots';

import { useGetExcursions, useGetTags, useGetAvailableTags, useUpdateAvailableTags, useUpdateTags, useFindHighestIdNumber, useFindHighestIdNumberTradeTags, useUpdateNote, useGetNotes, useGetTagInfo, useCreateAvailableTagsArray, useFilterSuggestions, useTradeTagsChange, useFilterTags, useToggleTagsDropdown, useResetTags } from '../utils/daily';

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


onBeforeMount(async () => {

})
onMounted(async () => {
    await useMountDaily()
    await useInitTooltip()
    useCreateAvailableTagsArray()

    tradesModal = new bootstrap.Modal("#tradesModal")
    window.addEventListener('scroll', async () => {
        let scrollFromTop = window.scrollY
        let visibleScreen = (window.innerHeight + 200) // adding 200 so that loads before getting to bottom
        let documentHeight = document.documentElement.scrollHeight
        let difference = documentHeight - (scrollFromTop + visibleScreen)
        /*console.log("scroll top "+scrollFromTop)
        console.log("visible screen "+visibleScreen)
        console.log("documentHeight "+documentHeight)
        //console.log("difference "+difference)*/
        if (difference <= 0) {
            //console.log("spinnerLoadMore " + spinnerLoadMore.value)
            //console.log("spinnerLoadingPage " + spinnerLoadingPage.value)
            //console.log("endOfList " + endOfList.value)
            if (!spinnerLoadMore.value && !spinnerLoadingPage.value && !endOfList.value) { //To avoid firing multiple times, make sure it's not loadin for the first time and that there is not already a loading more (spinner)
                useLoadMore()
            }
        }
    })
    useCheckVisibleScreen()

})


/**************
 * MODAL INTERACTION
 ***************/
let loadScreenshots = false

async function clickTradesModal(param1, param2, param3) {
    //param1 : itemTradeIndex : index inside filteredtrades. This is only defined on first click/when we open modal and not on next or previous
    //param2 : also called tradeIndex, is the index inside the trades (= index of itemTrade.trades)
    //param3 : tradeIndex back or next, so with -1 or +1. On modal open, param3 = param2
    //console.log(" param 3 "+JSON.stringify(param3))
    //console.log("param1 " + param1)
    //console.log("param2 " + param2)
    //console.log("param3 " + param3)
    //console.log(" clicking ")

    if (markerAreaOpen.value == true) {
        alert("Please save your screenshot annotation")
        return
    } else {
        await (spinnerSetups.value = true)

        if (tradeNoteChanged.value) {
            await useUpdateNote()
            await useGetNotes()
        }

        if (tradeExcursionChanged.value) {
            await updateExcursions()
        }

        if (tradeTagsChanged.value) {
            await Promise.all([useUpdateAvailableTags(), useUpdateTags()])
            await Promise.all([useGetTags(), useGetAvailableTags()])
            useCreateAvailableTagsArray()
        }

        if (tradeScreenshotChanged.value) {
            await useSaveScreenshot()
        }


        tradeNoteChanged.value = false
        tradeExcursionChanged.value = false
        tradeScreenshotChanged.value = false
        tradeTagsChanged.value = false

        showTagsList.value = false


        if (param1 === undefined && param2 === undefined && param3 === undefined) {
            //console.log(" -> Closing Modal")
            await (spinnerSetups.value = false)
            tradesModal.hide()
            await (modalDailyTradeOpen.value = false) //this is important because we use itemTradeIndex on filteredTrades and if change month, this causes problems. So only show modal content when clicked on open modal/v-if
            await useInitTab("daily")
            loadScreenshots = false
        }
        else {
            //console.log(" -> Opening Modal or clicking next/back")

            itemTradeIndex.value = param1
            tradeIndexPrevious.value = param2
            tradeIndex.value = param3

            let awaitClick = async () => {

                modalDailyTradeOpen.value = true

                if (loadScreenshots === false) {
                    let screenshotsDate = filteredTrades[param1].dateUnix

                    if (screenshots.length == 0 || (screenshots.length > 0 && screenshots[0].dateUnixDay != screenshotsDate)) {
                        console.log("  --> getting Screenshots")
                        await useGetScreenshots(true, screenshotsDate)
                    } else {
                        console.log("  --> Screenshots already stored")
                    }
                    loadScreenshots = true
                }

                let filteredTradeId = filteredTrades[itemTradeIndex.value].trades[param3].id
                await Promise.all([resetExcursion(), useResetTags()])

                //For setups I have added setups into filteredTrades. For screenshots and excursions I need to find so I create on each modal page a screenshot and excursion object
                let findScreenshot = screenshots.find(obj => obj.name == filteredTradeId)
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

                //We differentiate
                //1- tags on daily page : they are a function of available tags
                //2- tags in modal (here): they need to have id and name because if we add a new tag, we need the json with id and name
                let findTags = tags.find(obj => obj.tradeId == filteredTradeId)
                if (findTags) {
                    findTags.tags.forEach(element => {
                        for (let obj of availableTags) {
                            for (let tag of obj.tags) {
                                if (tag.id === element) {
                                    let temp = {}
                                    temp.id = tag.id
                                    temp.name = tag.name
                                    tradeTags.push(temp)
                                }
                            }
                        }
                    });
                }

                let noteIndex = notes.findIndex(obj => obj.tradeId == filteredTradeId)
                tradeNote.value = null
                if (noteIndex != -1) {
                    tradeNote.value = notes[noteIndex].note
                }

                let findExcursion = excursions.filter(obj => obj.tradeId == filteredTradeId)
                if (findExcursion.length) {
                    findExcursion[0].stopLoss != null ? excursion.stopLoss = findExcursion[0].stopLoss : null
                    findExcursion[0].maePrice != null ? excursion.maePrice = findExcursion[0].maePrice : null
                    findExcursion[0].mfePrice != null ? excursion.mfePrice = findExcursion[0].mfePrice : null
                    //console.log(" tradeExcursion "+JSON.stringify(tradeExcursion))
                }

            }
            await awaitClick()
            await (spinnerSetups.value = false)
            tagInput.value = ''
            saveButton.value = false
            await useInitTooltip()
        }

    }

}

const checkDate = ((param1, param2) => {
    //console.log("param 1 "+param1)
    //console.log("param 2 "+param2)
    let tdDateUnix = dayjs(param1 * 1000).tz(timeZoneTrade.value)
    let tradeDateUnix = dayjs(param2 * 1000).tz(timeZoneTrade.value)
    let check = tdDateUnix.isSame(tradeDateUnix, 'day')
    return check
})

/**************
 * SATISFACTION
 ***************/
async function dailySatisfactionChange(param1, param2, param3) {
    console.log("\nDAILY SATISFACTION CHANGE")
    //console.time("  --> Duration daily satisfaction change")
    param3.satisfaction = param2
    await updateDailySatisfaction(param1, param2)
    //await console.timeEnd("  --> Duration daily satisfaction change")
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
function tradeExcursionChange(param1, param2) {
    console.log("param 1: " + param1 + " param2: " + param2)
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
    tradeExcursionDateUnix.value = filteredTrades[itemTradeIndex.value].dateUnix
    tradeExcursionId.value = filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].id
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

function resetExcursion() {
    //console.log(" -> Resetting excursion")
    //we need to reset the setup variable each time
    for (let key in excursion) delete excursion[key]
    excursion.stopLoss = null
    excursion.maePrice = null
    excursion.mfePrice = null

}

/**************
 * TAGS
 ***************/

/**************
 * NOTES
 ***************/
function noteClicked() {
    //console.log("click")
    tradeNoteChanged.value = true
    saveButton.value = true
}

const tradeNoteChange = (param) => {
    tradeNote.value = param
    console.log(" -> New note " + tradeNote.value)
    tradeNoteDateUnix.value = filteredTrades[itemTradeIndex.value].dateUnix
    tradeNoteId.value = filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].id

}


/**************
 * SCREENSHOTS
 ***************/
const filteredScreenshots = (param1, param2) => {
    //console.log(" param1 dateUnix " + JSON.stringify(param1.dateUnix))
    //console.log(" filteredScreenshots")
    /*if (param1) {

        console.log(" param1 ")
    }
    if (param2) {
        console.log(" param2 ")
    }*/
    let screenshotArray = []
    //console.log(" screenshotsInfos "+JSON.stringify(screenshotsInfos))
    for (let index = 0; index < param1.trades.length; index++) {
        const el1 = param1.trades[index];
        let screenshotsArray = []
        if (param2) {
            screenshotsArray = screenshots
        } else {
            screenshotsArray = screenshotsInfos
        }
        for (let index2 = 0; index2 < screenshotsArray.length; index2++) {
            const el2 = screenshotsArray[index2]
            if (el2.name == el1.id && (screenshotArray.findIndex(obj => obj == el2) == -1)) {
                screenshotArray.push(el2)
            } else if (useStartOfDay(el2.dateUnix) == param1.dateUnix && (screenshotArray.findIndex(obj => obj == el2) == -1)) {
                screenshotArray.push(el2)
            }
        }

    }
    //console.log(" screenshotArray " + JSON.stringify(screenshotArray))
    return screenshotArray
}

const filterDiary = (param) => {
    //console.log(" filter diary ")
    return diaries.filter(obj => obj.dateUnix == param)
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


                                    <div class="col-12 cardFirstLine mb-2">
                                        <div class="row">
                                            <div class="col-12 col-lg-auto">{{ useCreatedDateFormat(itemTrade.dateUnix)
                                                }}
                                                <i v-on:click="dailySatisfactionChange(itemTrade.dateUnix, true, itemTrade)"
                                                    v-bind:class="[itemTrade.satisfaction == true ? 'greenTrade' : '', 'uil', 'uil-thumbs-up', 'ms-2', 'me-1', 'pointerClass']"></i>
                                                <i v-on:click="dailySatisfactionChange(itemTrade.dateUnix, false, itemTrade)"
                                                    v-bind:class="[itemTrade.satisfaction == false ? 'redTrade' : '', , 'uil', 'uil-thumbs-down', 'pointerClass']"></i>
                                            </div>
                                            <div class="col-12 col-lg-auto ms-auto">P&L({{ selectedGrossNet.charAt(0)
                                                }}):
                                                <span
                                                    v-bind:class="[itemTrade.pAndL[amountCase + 'Proceeds'] > 0 ? 'greenTrade' : 'redTrade']">{{
        useTwoDecCurrencyFormat(itemTrade.pAndL[amountCase + 'Proceeds'])
    }}</span>
                                            </div>

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
                                                            <label>Tot Fees</label>
                                                            <p>{{ useTwoDecCurrencyFormat(itemTrade.pAndL.fees) }}</p>
                                                        </div>
                                                        <div>
                                                            <label>P&L(g)</label>
                                                            <p>{{ useTwoDecCurrencyFormat(itemTrade.pAndL.grossProceeds)
                                                                }}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- end PART 1 -->

                                    <!-- ============ PART 2 ============ -->
                                    <div v-if="!modalDailyTradeOpen" class="col-12 table-responsive">
                                        <nav>
                                            <!--------------------
                                            TABS
                                            --------------------->

                                            <!--Trades-->
                                            <div class="nav nav-tabs mb-2" id="nav-tab" role="tablist">
                                                <button class="nav-link" v-bind:id="'trades-' + index"
                                                    data-bs-toggle="tab" v-bind:data-bs-target="'#tradesNav-' + index"
                                                    type="button" role="tab" aria-controls="nav-overview"
                                                    aria-selected="true">Trades
                                                </button>

                                                <!--Blotter-->
                                                <button class="nav-link" v-bind:id="'blotter-' + index"
                                                    data-bs-toggle="tab" v-bind:data-bs-target="'#blotterNav-' + index"
                                                    type="button" role="tab" aria-controls="nav-overview"
                                                    aria-selected="true">Blotter
                                                </button>

                                                <!--Screenshots-->
                                                <button v-bind:id="'screenshots-' + index" data-bs-toggle="tab"
                                                    v-bind:data-bs-target="'#screenshotsNav-' + index" type="button"
                                                    role="tab" aria-controls="nav-overview" aria-selected="true"
                                                    v-bind:class="[filteredScreenshots(itemTrade).length > 0 ? '' : 'noDataTab', 'nav-link']">Screenshots<span
                                                        v-if="filteredScreenshots(itemTrade).length > 0"
                                                        class="txt-small">
                                                        ({{ filteredScreenshots(itemTrade).length }})</span>
                                                </button>

                                                <!--Diary-->
                                                <button v-bind:id="'diaries-' + index" data-bs-toggle="tab"
                                                    v-bind:data-bs-target="'#diariesNav-' + index" type="button"
                                                    role="tab" aria-controls="nav-overview" aria-selected="true"
                                                    v-bind:class="[filterDiary(itemTrade.dateUnix).length > 0 ? '' : 'noDataTab', 'nav-link']">Diary
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
                                                            <th scope="col">Vol<i class="ps-1 uil uil-info-circle"
                                                                    data-bs-toggle="tooltip"
                                                                    data-bs-title="Total number of securities during the trade (bought + sold or shorted + covered)"></i>
                                                            </th>
                                                            <th scope="col">Position</th>
                                                            <th scope="col">Entry</th>
                                                            <th scope="col">P&L/Sec<i class="ps-1 uil uil-info-circle"
                                                                    data-bs-toggle="tooltip"
                                                                    data-bs-title="Profit&Loss per unit of security traded (baught or shorted)"></i>
                                                            </th>
                                                            <th scope="col">P&L(n)</th>
                                                            <th scope="col">Tags</th>
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

                                                            <!--Symbol-->
                                                            <td>{{ trade.symbol }}</td>

                                                            <!--Vol-->
                                                            <td>{{ trade.buyQuantity + trade.sellQuantity }}</td>

                                                            <!--Position-->
                                                            <td>
                                                                {{
        trade.strategy.charAt(0).toUpperCase() +
        trade.strategy.slice(1)
    }}
                                                            </td>

                                                            <!--Entry-->
                                                            <td>
                                                                <span v-if="trade.tradesCount == 0"><span
                                                                        v-if="trade.openPosition">Open<i
                                                                            class="ps-1 uil uil-info-circle"
                                                                            data-bs-toggle="tooltip" data-bs-html="true"
                                                                            v-bind:data-bs-title="'Swing trade opened on ' + useDateCalFormat(trade.entryTime)"></i></span><span
                                                                        v-else>Closed<i class="ps-1 uil uil-info-circle"
                                                                            data-bs-toggle="tooltip" data-bs-html="true"
                                                                            v-bind:data-bs-title="'Swing trade closed on ' + useDateCalFormat(trade.exitTime)"></i></span></span><span
                                                                    v-else>{{ useTimeFormat(trade.entryTime) }}<span
                                                                        v-if="checkDate(trade.td, trade.entryTime) == false"><i
                                                                            class="ps-1 uil uil-info-circle"
                                                                            data-bs-toggle="tooltip" data-bs-html="true"
                                                                            v-bind:data-bs-title="'Swing trade from ' + useDateCalFormat(trade.entryTime)"></i></span></span>
                                                            </td>

                                                            <!--P&L/Vol-->
                                                            <td>
                                                                <span v-if="trade.tradesCount == 0"></span><span
                                                                    v-else-if="trade.type == 'forex'">-</span><span
                                                                    v-else
                                                                    v-bind:class="[trade.grossSharePL > 0 ? 'greenTrade' : 'redTrade']">{{
        useTwoDecCurrencyFormat(trade.grossSharePL)
    }}</span>
                                                            </td>

                                                            <!--P&L-->
                                                            <td>
                                                                <span v-if="trade.tradesCount == 0"></span><span v-else
                                                                    v-bind:class="[trade.netProceeds > 0 ? 'greenTrade' : 'redTrade']">
                                                                    {{ useTwoDecCurrencyFormat(trade.netProceeds)
                                                                    }}</span>
                                                            </td>

                                                            <!--TAGS -->
                                                            <td>
                                                                <span
                                                                    v-for="tags in tags.filter(obj => obj.tradeId == trade.id)">
                                                                    <span v-for="tag in tags.tags.slice(0, 2)"
                                                                        class="tag txt-small"
                                                                        :style="{ 'background-color': useGetTagInfo(tag).groupColor }">{{
        useGetTagInfo(tag).tagName }}
                                                                    </span>
                                                                    <span v-show="tags.tags.length > 2">+{{
        tags.tags.length
        - 2 }}</span>
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span
                                                                    v-for="note in notes.filter(obj => obj.tradeId == trade.id)">
                                                                    <span v-if="note.note.length > 12">{{
        note.note.substring(0, 12) }}...</span><span
                                                                        v-else>{{ note.note }}</span>
                                                                </span>
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
                                                                    v-if="screenshotsInfos.findIndex(f => f.name == trade.id) != -1">
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
                                                            <th scope="col">Vol</th>
                                                            <th scope="col">P&L(g)</th>
                                                            <th scope="col">Tot Fees</th>
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
                                                            <td>{{ useDecimalsArithmetic(blot.buyQuantity,
        blot.sellQuantity) }}</td>
                                                            <td
                                                                v-bind:class="[blot.grossProceeds > 0 ? 'greenTrade' : 'redTrade']">
                                                                {{ useTwoDecCurrencyFormat(blot.grossProceeds) }}</td>
                                                            <td>{{ useTwoDecCurrencyFormat(blot.fees) }}</td>
                                                            <td
                                                                v-bind:class="[blot[amountCase + 'Proceeds'] > 0 ? 'greenTrade' : 'redTrade']">
                                                                {{ useTwoDecCurrencyFormat(blot.netProceeds) }}</td>
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
                                                <div v-show="screenshots.length == 0 || (screenshots.length>0 && screenshots[0].dateUnixDay != itemTrade.dateUnix)" class="text-center">
                                                    <div class="spinner-border text-blue" role="status">
                                                    </div>
                                                </div>
                                                <div v-if="idCurrentType == 'screenshots' && idCurrentNumber == index"
                                                    v-for="itemScreenshot in filteredScreenshots(itemTrade, itemTrade.dateUnix)">
                                                    <span class="mb-2">
                                                        <Screenshot :screenshot-data="itemScreenshot" show-title
                                                            source="dailyTab" />
                                                    </span>
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
                <div v-show="calendarData && !spinnerLoadingPage"
                    class="col-12 col-xl-4 text-center mt-2 align-self-start">
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
                    <Screenshot v-if="screenshot.originalBase64" :screenshot-data="screenshot" source="dailyModal" />
                    <!-- *** Table *** -->
                    <div class="mt-3 table-responsive">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th scope="col">Symbol</th>
                                    <th scope="col">Vol</th>
                                    <th scope="col">Position</th>
                                    <th scope="col">Entry</th>
                                    <th scope="col">Price</th>
                                    <th scope="col">Exit</th>
                                    <th scope="col">Price</th>
                                    <th scope="col">Duration</th>
                                    <th scope="col">P&L/Vol</th>
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
                                    <td>{{ filteredTrades[itemTradeIndex].trades[tradeIndex].side == 'B' ? 'Long' :
        'Short'
                                        }}</td>

                                    <td>
                                        <span
                                            v-if="filteredTrades[itemTradeIndex].trades[tradeIndex].tradesCount == 0"><span
                                                v-if="filteredTrades[itemTradeIndex].trades[tradeIndex].openPosition">Open<i
                                                    class="ps-1 uil uil-info-circle" data-bs-toggle="tooltip"
                                                    data-bs-html="true"
                                                    v-bind:data-bs-title="'Swing trade opened on ' + useDateCalFormat(filteredTrades[itemTradeIndex].trades[tradeIndex].entryTime)"></i></span><span
                                                v-else>Closed<i class="ps-1 uil uil-info-circle"
                                                    data-bs-toggle="tooltip" data-bs-html="true"
                                                    v-bind:data-bs-title="'Swing trade closed on ' + useDateCalFormat(filteredTrades[itemTradeIndex].trades[tradeIndex].exitTime)"></i></span></span><span
                                            v-else>{{
        useTimeFormat(filteredTrades[itemTradeIndex].trades[tradeIndex].entryTime)
    }}<span
                                                v-if="checkDate(filteredTrades[itemTradeIndex].trades[tradeIndex].td, filteredTrades[itemTradeIndex].trades[tradeIndex].entryTime) == false"><i
                                                    class="ps-1 uil uil-info-circle" data-bs-toggle="tooltip"
                                                    data-bs-html="true"
                                                    v-bind:data-bs-title="'Swing trade from ' + useDateCalFormat(filteredTrades[itemTradeIndex].trades[tradeIndex].entryTime)"></i></span></span>
                                    </td>

                                    <!--Entry Price-->
                                    <td><span
                                            v-if="filteredTrades[itemTradeIndex].trades[tradeIndex].tradesCount == 0"></span><span
                                            v-else-if="filteredTrades[itemTradeIndex].trades[tradeIndex].type == 'forex'">{{
        (filteredTrades[itemTradeIndex].trades[tradeIndex].entryPrice).toFixed(5)
    }}</span><span v-else>{{
            useTwoDecCurrencyFormat(filteredTrades[itemTradeIndex].trades[tradeIndex].entryPrice)
        }}<span
                                                v-if="checkDate(filteredTrades[itemTradeIndex].trades[tradeIndex].td, filteredTrades[itemTradeIndex].trades[tradeIndex].entryTime) == false"><i
                                                    class="ps-1 uil uil-info-circle" data-bs-toggle="tooltip"
                                                    data-bs-html="true"
                                                    v-bind:data-bs-title="'Swing trade from ' + useDateCalFormat(filteredTrades[itemTradeIndex].trades[tradeIndex].entryTime)"></i></span></span>
                                    </td>

                                    <!--Exit-->
                                    <td><span
                                            v-if="filteredTrades[itemTradeIndex].trades[tradeIndex].tradesCount == 0"></span><span
                                            v-else>{{
        useTimeFormat(filteredTrades[itemTradeIndex].trades[tradeIndex].exitTime)
    }}</span></td>


                                    <!--Exit Price-->
                                    <td><span
                                            v-if="filteredTrades[itemTradeIndex].trades[tradeIndex].tradesCount == 0"></span><span
                                            v-else-if="filteredTrades[itemTradeIndex].trades[tradeIndex].type == 'forex'">{{
        (filteredTrades[itemTradeIndex].trades[tradeIndex].exitPrice).toFixed(5)
    }}</span><span v-else>{{
            useTwoDecCurrencyFormat(filteredTrades[itemTradeIndex].trades[tradeIndex].exitPrice)
        }}</span></td>

                                    <!--Duration-->
                                    <td><span
                                            v-if="filteredTrades[itemTradeIndex].trades[tradeIndex].tradesCount == 0"></span><span
                                            v-else><span
                                                v-if="checkDate(filteredTrades[itemTradeIndex].trades[tradeIndex].td, filteredTrades[itemTradeIndex].trades[tradeIndex].entryTime) == false">{{
        useSwingDuration(filteredTrades[itemTradeIndex].trades[tradeIndex].exitTime
            -
            filteredTrades[itemTradeIndex].trades[tradeIndex].entryTime)
    }}</span><span v-else>{{
            useTimeDuration(filteredTrades[itemTradeIndex].trades[tradeIndex].exitTime
                -
                filteredTrades[itemTradeIndex].trades[tradeIndex].entryTime)
        }}</span></span>
                                    </td>

                                    <!--P&L/Vol-->
                                    <td>
                                        <span
                                            v-if="filteredTrades[itemTradeIndex].trades[tradeIndex].tradesCount == 0"></span><span
                                            v-else-if="filteredTrades[itemTradeIndex].trades[tradeIndex].type == 'forex'"></span><span
                                            v-else
                                            v-bind:class="[(filteredTrades[itemTradeIndex].trades[tradeIndex].grossSharePL) > 0 ? 'greenTrade' : 'redTrade']">{{
        useTwoDecCurrencyFormat(filteredTrades[itemTradeIndex].trades[tradeIndex].grossSharePL)
    }}</span>
                                    </td>

                                    <!--P&L-->
                                    <td><span
                                            v-if="filteredTrades[itemTradeIndex].trades[tradeIndex].tradesCount == 0"></span><span
                                            v-else
                                            v-bind:class="[filteredTrades[itemTradeIndex].trades[tradeIndex].netProceeds > 0 ? 'greenTrade' : 'redTrade']">
                                            {{
        useTwoDecCurrencyFormat(filteredTrades[itemTradeIndex].trades[tradeIndex].netProceeds)
    }}</span>
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
                                    <div class="row align-items-center">

                                        <!-- Satisfaction -->
                                        <div class="col-1">
                                            <i v-on:click="tradeSatisfactionChange(filteredTrades[itemTradeIndex].trades[tradeIndex], true)"
                                                v-bind:class="[filteredTrades[itemTradeIndex].trades[tradeIndex].satisfaction == true ? 'greenTrade' : '', 'uil', 'uil-thumbs-up', 'pointerClass', 'me-1']"></i>

                                            <i v-on:click="tradeSatisfactionChange(filteredTrades[itemTradeIndex].trades[tradeIndex], false)"
                                                v-bind:class="[filteredTrades[itemTradeIndex].trades[tradeIndex].satisfaction == false ? 'redTrade' : '', 'uil', 'uil-thumbs-down', 'pointerClass']"></i>
                                        </div>


                                        <!-- Tags -->
                                        <div class="container-tags col-8">
                                            <div class="form-control dropdown form-select" style="height: auto;">
                                                <div style="display: flex; align-items: center; flex-wrap: wrap;">
                                                    <span v-for="(tag, index) in tradeTags" :key="index"
                                                        class="tag txt-small"
                                                        :style="{ 'background-color': useGetTagInfo(tag.id).groupColor }"
                                                        @click="useTradeTagsChange('remove', index)">
                                                        {{ tag.name }}<span class="remove-tag">×</span>
                                                    </span>

                                                    <input type="text" v-model="tagInput" @input="useFilterTags"
                                                        @keydown.enter.prevent="useTradeTagsChange('add', tagInput)"
                                                        @keydown.tab.prevent="useTradeTagsChange('add', tagInput)"
                                                        class="form-control tag-input" placeholder="Add a tag">
                                                    <div class="clickable-area" v-on:click="useToggleTagsDropdown">
                                                    </div>
                                                </div>
                                            </div>

                                            <ul id="dropdown-menu-tags" class="dropdown-menu-tags"
                                                :style="[!showTagsList ? 'border: none;' : '']">
                                                <span v-show="showTagsList" v-for="group in availableTags">
                                                    <h6 class="p-1 mb-0"
                                                        :style="'background-color: ' + group.color + ';'"
                                                        v-show="useFilterSuggestions(group.id).filter(obj => obj.id == group.id)[0].tags.length > 0">
                                                        {{ group.name }}</h6>
                                                    <li v-for="(suggestion, index) in useFilterSuggestions(group.id).filter(obj => obj.id == group.id)[0].tags"
                                                        :key="index" :class="{ active: index === selectedTagIndex }"
                                                        @click="useTradeTagsChange('addFromDropdownMenu', suggestion)"
                                                        class="dropdown-item dropdown-item-tags">
                                                        <span class="ms-2">{{ suggestion.name }}</span>
                                                    </li>
                                                </span>
                                            </ul>
                                        </div>
                                        <!-- MFE -->
                                        <div class="col-3">
                                            <input type="number" class="form-control" placeholder="MFE Price"
                                                style="font-size: small;" v-bind:value="excursion.mfePrice"
                                                v-on:click="tradeExcursionClicked"
                                                v-on:change="tradeExcursionChange($event.target.value, 'mfePrice')">
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
                                        v-bind:value="tradeNote" v-on:change="tradeNoteChange($event.target.value)"
                                        v-on:click="noteClicked"></textarea>
                                </div>

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
                                                v-on:click="clickTradesModal()">Close
                                                & Save</button>
                                            <button v-else class="btn btn-outline-primary btn-sm"
                                                v-on:click="clickTradesModal()">Close</button>
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