<script setup>
import { onBeforeMount, onMounted, computed, reactive, ref } from 'vue';
import Filters from '../components/Filters.vue'
import NoData from '../components/NoData.vue';
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import Calendar from '../components/Calendar.vue';
import Screenshot from '../components/Screenshot.vue'

import { currentUser, spinnerLoadingPage, calendarData, filteredTrades, screenshots, diaries, modalDailyTradeOpen, patterns, mistakes, amountCase, markerAreaOpen, screenshot, tradeSetupChanged, tradeScreenshotChanged, excursion, tradeExcursionChanged, spinnerSetups, spinnerSetupsText, tradeExcursionId, tradeExcursionDateUnix, hasData, tradeId, excursions, saveButton, activePatterns, activeMistakes, itemTradeIndex, tradeIndex, tradeIndexPrevious, spinnerLoadMore, endOfList, selectedGrossNet, availableTags, tradeTagsChanged, tagInput, tags, tradeTags, showTagsList, selectedTagIndex, tradeTagsId, tradeTagsDateUnix } from '../stores/globals';
import { useCreatedDateFormat, useTwoDecCurrencyFormat, useTimeFormat, useHourMinuteFormat, useTimeDuration, useMountDaily, useGetSelectedRange, useLoadMore, useCheckVisibleScreen, useDecimalsArithmetic, useInitTooltip, useDateCalFormat, useSwingDuration } from '../utils/utils';
import { useSetupImageUpload, useSaveScreenshot } from '../utils/screenshots';
import { useTradeSetupChange, useUpdateSetups } from '../utils/setups'
import { useGetExcursions, useGetTags, useGetAvailableTags } from '../utils/daily';

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

const availableTagsArray = reactive([])

let newTradeTags = []

onBeforeMount(async () => {

})
onMounted(async () => {
    await useMountDaily()
    await useInitTooltip()
    createAvailableTagsArray()

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

const checkDate = ((param1, param2) => {
    let check = dayjs(param1 * 1000).isSame(param2 * 1000, 'day')
    return check
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

/**************
 * MISC
 ***************/
function noteClicked() {
    //console.log("click")
    tradeSetupChanged.value = true
    saveButton.value = true
}

async function clickTradesModal(param1, param2, param3) {
    //param1 : itemTradeIndex : index inside filteredtrades. This is only defined on first click/when we open modal and not on next or previous
    //param2 : also called tradeIndex, is the index inside the trades (= index of itemTrade.trades)
    //param3 : tradeIndex back or next, so with -1 or +1. On modal open, param3 = param2
    //console.log(" param 3 "+JSON.stringify(param3))
    //console.log("param1 " + param1)
    //console.log("param2 " + param2)
    //console.log("param3 " + param3)

    if (markerAreaOpen.value == true) {
        alert("Please save your screenshot annotation")
        return
    } else {
        await (spinnerSetups.value = true)
        //We first update because setups rely on tradeIndex, so before tradeIndex changes to new modal page or simply use tradeIndex if we close
        if (tradeSetupChanged.value) {
            await useUpdateSetups()
        }

        if (tradeExcursionChanged.value) {
            await updateExcursions()
        }

        if (tradeScreenshotChanged.value) {
            await useSaveScreenshot()
        }

        if (tradeTagsChanged.value) {
            await Promise.all([updateAvailableTags(), updateTags()])
            await Promise.all([useGetTags(), useGetAvailableTags()])
            createAvailableTagsArray()
        }

        //Then we change indexes
        itemTradeIndex.value = param1
        tradeIndexPrevious.value = param2
        tradeIndex.value = param3


        let awaitClick = async () => {
            tradeSetupChanged.value = false //we updated setups and trades so false cause not need to do it again when we hide modal
            tradeExcursionChanged.value = false
            tradeScreenshotChanged.value = false
            tradeTagsChanged.value = false

            modalDailyTradeOpen.value = true
            let filteredTradeId = filteredTrades[itemTradeIndex.value].trades[param3].id
            await Promise.all([resetExcursion(), resetTags()])

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


            let findTags = tags.find(obj => obj.tradeId == filteredTradeId)
            if (findTags) {
                findTags.tags.forEach(element => {
                    tradeTags.push(element)
                });
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
        saveButton.value = false
        await useInitTooltip()
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
        if (tradeTagsChanged.value) {
            await Promise.all([updateAvailableTags(), updateTags()])
            await Promise.all([useGetTags(), useGetAvailableTags()])
            createAvailableTagsArray()
        }

        tradeSetupChanged.value = false
        tradeExcursionChanged.value = false
        tradeScreenshotChanged.value = false
        tradeTagsChanged.value = false

        await (spinnerSetups.value = false)
        tradesModal.hide()
        modalDailyTradeOpen.value = false //this is important because we use itemTradeIndex on filteredTrades and if change month, this causes problems. So only show modal content when clicked on open modal/v-if
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

const resetTags = () => {
    tradeTags.splice(0);
}

/**************
 * TAGS
 ***************/

const createAvailableTagsArray = () => {
    availableTagsArray.splice(0)
    for (let index = 0; index < availableTags.length; index++) {
        const element = availableTags[index];
        for (let index = 0; index < element.tags.length; index++) {
            const el = element.tags[index];
            availableTagsArray.push(el)
        }
    }
}
let filteredSuggestions = []
const filteredSuggestions2 = (param) => {
    //console.log(" availableTagsArray " + JSON.stringify(availableTagsArray))
    //console.log(" availableTagsArray " + JSON.stringify(availableTagsArray))
    //console.log(" filtered suggestion param " + param)
    let index = availableTags.findIndex(obj => obj.id == param)
    //console.log(" index " + index)
    filteredSuggestions = availableTags[index].tags.filter(tag => tag.name.toLowerCase().startsWith(tagInput.value.toLowerCase()));
    return filteredSuggestions
}

/*const filteredSuggestions = computed((param) => {
    //console.log(" availableTagsArray " + JSON.stringify(availableTagsArray))
    console.log(" filtered suggestion param " + param)
    let index = availableTags.findIndex(obj => obj.id == param)
    console.log(" index " + index)
    if (index == -1) {
        return null
    } else {
        return availableTags[index].filter(tag => tag.name.toLowerCase().startsWith(tagInput.value.toLowerCase()));
    }
});*/

const tradeTagsChange = async (param1, param2) => {
    console.log(" param 1 " + param1)
    console.log(" param 2 " + param2)
    //console.log(" tags " + JSON.stringify(tags))

    if (param1 == "add") {

        //Case when arrow select and enter button
        if (selectedTagIndex.value != -1) {
            console.log(" -> Adding on arrow down and enter " + param2)

            let tradeTagsIndex = tradeTags.findIndex(obj => obj.id == filteredSuggestions[selectedTagIndex.value].id)

            //only add if does not exist in tradeTags already
            if (tradeTagsIndex == -1) {
                tradeTags.push(filteredSuggestions[selectedTagIndex.value]);
                tagInput.value = ''; // Clear input after adding tag
            }

        } else if (param2) {

            let inputTextIndex = tradeTags.findIndex(obj => obj.name.toLowerCase() == param2.toLowerCase())
            console.log(" -> InputTextIndex " + inputTextIndex)
            //First check if input text already exists in trades tags ( = current array of tags)
            if (inputTextIndex != -1) {
                console.log("  --> Input text already exists in trades tags")
            }

            else {
                //Check if already in availableTags
                let inAvailableTagsIndex = availableTagsArray.findIndex(tag =>
                    tag.name.toLowerCase() == param2.toLowerCase())
                console.log("  --> InAvailableTagsIndex " + JSON.stringify(inAvailableTagsIndex))

                if (inAvailableTagsIndex != -1) {
                    console.log("  --> Input text already exists in availableTags")
                    tradeTags.push(availableTagsArray[inAvailableTagsIndex])
                }
                else {
                    //Else new tag
                    console.log("  --> Input is a new tag")
                    let temp = {}

                    const findHighestIdNumber = (param) => {
                        let highestId = -Infinity;
                        param.forEach(innerArray => {
                            innerArray.tags.forEach(obj => {
                                if (Number(obj.id.replace("tag_", "")) > highestId) {
                                    highestId = Number(obj.id.replace("tag_", ""))
                                }
                            });
                        });
                        return highestId;
                    }
                    const findHighestIdNumberTradeTags = (param) => {
                        let highestId = -Infinity;
                        param.forEach(obj => {
                            if (Number(obj.id.replace("tag_", "")) > highestId) {
                                highestId = Number(obj.id.replace("tag_", ""))
                            }
                        });
                        return highestId;
                    }

                    // Get the highest id number
                    const highestIdNumberAvailableTags = findHighestIdNumber(availableTags);
                    const highestIdNumberTradeTags = findHighestIdNumberTradeTags(tradeTags);

                    function chooseHighestNumber(num1, num2) {
                        return Math.max(num1, num2);
                    }

                    // Example usage:
                    const highestIdNumber = chooseHighestNumber(highestIdNumberAvailableTags, highestIdNumberTradeTags);

                    //console.log(" -> Highest tag id number " + highestIdNumber);

                    temp.id = "tag_" + (highestIdNumber + 1).toString()
                    temp.name = param2
                    tradeTags.push(temp)

                    newTradeTags.push(temp)


                    tagInput.value = ''; // Clear input after adding tag
                }

            }
        }
        selectedTagIndex.value = -1
        showTagsList.value = false
        console.log(" -> TradeTags " + JSON.stringify(tradeTags))
    }
    if (param1 == "addFromDropdownMenu") {
        let index = tradeTags.findIndex(obj => obj.id == param2.id)
        //First check if input text already exists in trades tags ( = current array of tags)
        if (index == -1) {
            console.log(" -> Adding " + param2)
            tradeTags.push(param2);
            tagInput.value = ''; // Clear input after adding tag
        }
        selectedTagIndex.value = -1
        showTagsList.value = false
        console.log(" -> TradeTags " + JSON.stringify(tradeTags))
    }

    if (param1 == "remove") {
        //param2 is index of element to remove inside tradeTags
        tradeTags.splice(param2, 1);
    }

    tradeTagsChanged.value = true
    tradeTagsDateUnix.value = filteredTrades[itemTradeIndex.value].dateUnix
    tradeTagsId.value = filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].id
    saveButton.value = true

};

const filterTags = () => {
    if (tagInput.value == '') selectedTagIndex.value = -1
    let showDropdownToReturn = tagInput.value !== '' && filteredSuggestions.length > 0
    //console.log("Filtered tags showDropdownToReturn " + showDropdownToReturn)
    showTagsList.value = showDropdownToReturn
};

const handleKeyDown = (event) => {
    if (showTagsList.value) {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            selectedTagIndex.value = Math.min(selectedTagIndex.value + 1, filteredSuggestions.length - 1);
            //console.log(" arrow down and selectedTagIndex " + selectedTagIndex.value)
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            selectedTagIndex.value = Math.max(selectedTagIndex.value - 1, 0);
        }
    }
};

const toggleTagsDropdown = () => {
    selectedTagIndex.value = -1
    showTagsList.value = !showTagsList.value
}


const getTagColor = (param) => {
    const findGroupColor = (tagId) => {
        for (let obj of availableTags) {
            for (let tag of obj.tags) {
                if (tag.id === tagId) {
                    return obj.color;
                }
            }
        }

        let color = null
        if (availableTags.length > 0) {
            color = availableTags.filter(obj => obj.id == "group_0")[0].color
        }
        return color // Return ungroupcolor if no result
    }

    const tagIdToFind = param;
    const groupColor = findGroupColor(tagIdToFind);

    return "background-color: " + groupColor + ";"
}

const getTagGroup = (param) => {
    const findGroupName = (tagId) => {
        for (let obj of availableTags) {
            for (let tag of obj.tags) {
                if (tag.id === tagId) {
                    return obj.name;
                }
            }
        }

        let name = null
        if (availableTags.length > 0) {
            name = availableTags.filter(obj => obj.id == "group_0")[0].name
        }
        return name // Return ungroupcolor if no result
    }

    const tagIdToFind = param;
    const groupName = findGroupName(tagIdToFind);

    return groupName
}

async function updateTags() {
    console.log("\nUPDATING OR SAVING TAGS IN PARSE DB")
    return new Promise(async (resolve, reject) => {
        spinnerSetups.value = true
        //tradeSetupChanged.value = true

        const parseObject = Parse.Object.extend("tags");
        const query = new Parse.Query(parseObject);
        query.equalTo("tradeId", tradeTagsId.value)
        const results = await query.first();
        if (results) {
            console.log(" -> Updating tags")

            spinnerSetupsText.value = "Updating"
            results.set("tags", tradeTags)

            results.save()
                .then(async () => {
                    console.log(' -> Updated tags with id ' + results.id)
                    //await useGetSelectedRange()
                    resolve()
                }, (error) => {
                    console.log('Failed to create new object, with error code: ' + error.message);
                })
        } else {
            console.log(" -> Saving tags")
            spinnerSetupsText.value = "Saving"
            console.log(" -> Trade tags " + JSON.stringify(tradeTags))
            const object = new parseObject();
            object.set("user", Parse.User.current())
            object.set("tags", tradeTags)
            object.set("dateUnix", tradeTagsDateUnix.value)
            object.set("tradeId", tradeTagsId.value)
            object.setACL(new Parse.ACL(Parse.User.current()));
            object.save()
                .then(async (object) => {
                    console.log(' -> Added new tags with id ' + object.id)
                    //await useGetSelectedRange()
                    resolve()
                }, (error) => {
                    console.log('Failed to create new object, with error code: ' + error.message);
                })
        }



    })
}


async function updateAvailableTags() {
    console.log("\nUPDATING OR SAVING AVAILABLE TAGS")
    return new Promise(async (resolve, reject) => {
        const parseObject = Parse.Object.extend("_User");
        const query = new Parse.Query(parseObject);
        query.equalTo("objectId", currentUser.value.objectId);
        const results = await query.first();
        if (results) {
            let parsedResults = JSON.parse(JSON.stringify(results))
            let currentTags = parsedResults.tags

            if (currentTags == undefined || currentTags.length == 0) {
                console.log(" -> Saving available tags")
                currentTags = []
                let temp = {}
                temp.id = "0"
                temp.name = "Ungrouped"
                temp.color = "#6c757d"
                temp.tags = []
                for (let index = 0; index < tradeTags.length; index++) {
                    const element = tradeTags[index];
                    temp.tags.push(element)
                }
                currentTags.push(temp)

            } else {
                console.log(" -> Updating available tags")
                let ungroupedIndex = currentTags.findIndex(obj => obj.id == "group_0")

                for (let index = 0; index < newTradeTags.length; index++) {
                    const element = newTradeTags[index];
                    currentTags[ungroupedIndex].tags.push(element)
                }
            }

            results.set("tags", currentTags)
            results.save()
                .then(async () => {
                    console.log(' -> Saved/Updated available tags with id ' + results.id)
                    resolve()
                }, (error) => {
                    console.log('Failed to save/update available tags, with error code: ' + error.message);
                    reject()
                })

        } else {
            console.log(" -> NO USER !!!")
            reject()
        }
    })
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
                                            <div class="col-12 col-lg-auto">{{ useCreatedDateFormat(itemTrade.dateUnix) }}
                                                <i v-on:click="dailySatisfactionChange(itemTrade.dateUnix, true, itemTrade)"
                                                    v-bind:class="[itemTrade.satisfaction == true ? 'greenTrade' : '', 'uil', 'uil-thumbs-up', 'ms-2', 'me-1', 'pointerClass']"></i>
                                                <i v-on:click="dailySatisfactionChange(itemTrade.dateUnix, false, itemTrade)"
                                                    v-bind:class="[itemTrade.satisfaction == false ? 'redTrade' : '', , 'uil', 'uil-thumbs-down', 'pointerClass']"></i>
                                            </div>
                                            <div class="col-12 col-lg-auto ms-auto">P&L({{ selectedGrossNet.charAt(0) }}):
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
                                                <!--<button v-for="dashTab in dailyTabs" class="nav-link"
                                                    v-bind:id="dashTab.id + '-' + index" data-bs-toggle="tab"
                                                    v-bind:data-bs-target="dashTab.target + '-' + index" type="button"
                                                    role="tab" aria-controls="nav-overview" aria-selected="true">{{
                                                        dashTab.label }}
                                                    <span
                                                        v-if="dashTab.id == 'screenshots' && screenshots.filter(obj => obj.dateUnixDay == itemTrade.dateUnix).length > 0"
                                                        class="txt-small"> ({{ screenshots.filter(obj => obj.dateUnixDay ==
                                                            itemTrade.dateUnix).length }})</span>
                                                </button>-->

                                                <button class="nav-link" v-bind:id="'trades-' + index" data-bs-toggle="tab"
                                                    v-bind:data-bs-target="'#tradesNav-' + index" type="button" role="tab"
                                                    aria-controls="nav-overview" aria-selected="true">Trades
                                                </button>

                                                <button class="nav-link" v-bind:id="'blotter-' + index" data-bs-toggle="tab"
                                                    v-bind:data-bs-target="'#blotterNav-' + index" type="button" role="tab"
                                                    aria-controls="nav-overview" aria-selected="true">Blotter
                                                </button>

                                                <button v-bind:id="'screenshots-' + index" data-bs-toggle="tab"
                                                    v-bind:data-bs-target="'#screenshotsNav-' + index" type="button"
                                                    role="tab" aria-controls="nav-overview" aria-selected="true"
                                                    v-bind:class="[screenshots.filter(obj => obj.dateUnixDay == itemTrade.dateUnix).length > 0 ? '' : 'noDataTab', 'nav-link']">Screenshots<span
                                                        v-if="screenshots.filter(obj => obj.dateUnixDay == itemTrade.dateUnix).length > 0"
                                                        class="txt-small">
                                                        ({{ screenshots.filter(obj => obj.dateUnixDay ==
                                                            itemTrade.dateUnix).length }})</span>
                                                </button>

                                                <button v-bind:id="'diaries-' + index" data-bs-toggle="tab"
                                                    v-bind:data-bs-target="'#diariesNav-' + index" type="button" role="tab"
                                                    aria-controls="nav-overview" aria-selected="true"
                                                    v-bind:class="[diaries.filter(obj => obj.dateUnix == itemTrade.dateUnix).length > 0 ? '' : 'noDataTab', 'nav-link']">Diary
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
                                                            <th scope="col">Vol</th>
                                                            <th scope="col">Position</th>
                                                            <th scope="col">Entry</th>
                                                            <!--<th scope="col">Price</th>-->
                                                            <!--<th scope="col">Duration</th>-->
                                                            <th scope="col">P&L/Vol</th>
                                                            <th scope="col">P&L(n)</th>
                                                            <!--<th scope="col">Pattern</th>
                                                            <th scope="col">Mistake</th>-->
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

                                                            <td>{{ trade.symbol }}</td>

                                                            <td>{{ trade.buyQuantity + trade.sellQuantity }}</td>

                                                            <td>{{ trade.strategy.charAt(0).toUpperCase() +
                                                                trade.strategy.slice(1) }}</td>

                                                            <!--Entry-->
                                                            <td><span v-if="trade.tradesCount == 0"><span
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

                                                            <!--Price
                                                            <td><span v-if="trade.tradesCount == 0"></span><span
                                                                    v-else-if="trade.type == 'forex'">{{
                                                                        (trade.entryPrice).toFixed(5) }}</span><span v-else>{{
                                                                            useTwoDecCurrencyFormat(trade.entryPrice) }}<span
                                                                        v-if="checkDate(trade.td, trade.entryTime) == false"><i
                                                                            class="ps-1 uil uil-info-circle"
                                                                            data-bs-toggle="tooltip" data-bs-html="true"
                                                                            v-bind:data-bs-title="'Swing trade from ' + useDateCalFormat(trade.entryTime)"></i></span></span>
                                                            </td>-->
                                                            <!--<td>{{useTimeDuration(trade.exitTime - trade.entryTime)}}</td>-->

                                                            <!--P&L/Vol-->
                                                            <td>
                                                                <span v-if="trade.tradesCount == 0"></span><span
                                                                    v-else-if="trade.type == 'forex'">-</span><span v-else
                                                                    v-bind:class="[trade.grossSharePL > 0 ? 'greenTrade' : 'redTrade']">{{
                                                                        useTwoDecCurrencyFormat(trade.grossSharePL) }}</span>
                                                            </td>

                                                            <!--P&L-->
                                                            <td>
                                                                <span v-if="trade.tradesCount == 0"></span><span v-else
                                                                    v-bind:class="[trade.netProceeds > 0 ? 'greenTrade' : 'redTrade']">
                                                                    {{ useTwoDecCurrencyFormat(trade.netProceeds) }}</span>
                                                            </td>
                                                            <!--<td>
                                                                {{ trade.patternNameShort }}
                                                            </td>
                                                            <td>
                                                                {{ trade.mistakeNameShort }}
                                                            </td>-->
                                                            <td>
                                                                <span
                                                                    v-for="tags in tags.filter(obj => obj.tradeId == trade.id)">
                                                                    <span v-for="tag in tags.tags" class="tag txt-small"
                                                                        :style="getTagColor(tag.id)">{{ tag.name
                                                                        }}
                                                                    </span>
                                                                </span>
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
                                                <div v-for="itemScreenshot in screenshots.filter(obj => obj.dateUnixDay == itemTrade.dateUnix)"
                                                    class="mb-2">
                                                    <Screenshot :screenshot-data="itemScreenshot" show-title
                                                        source="dailyTab" />
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
                                    <td>{{ filteredTrades[itemTradeIndex].trades[tradeIndex].side == 'B' ? 'Long' : 'Short'
                                    }}</td>

                                    <td>
                                        <span
                                            v-if="filteredTrades[itemTradeIndex].trades[tradeIndex].tradesCount == 0"><span
                                                v-if="filteredTrades[itemTradeIndex].trades[tradeIndex].openPosition">Open<i
                                                    class="ps-1 uil uil-info-circle" data-bs-toggle="tooltip"
                                                    data-bs-html="true"
                                                    v-bind:data-bs-title="'Swing trade opened on ' + useDateCalFormat(filteredTrades[itemTradeIndex].trades[tradeIndex].entryTime)"></i></span><span
                                                v-else>Closed<i class="ps-1 uil uil-info-circle" data-bs-toggle="tooltip"
                                                    data-bs-html="true"
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
                                                        filteredTrades[itemTradeIndex].trades[tradeIndex].entryTime) }}</span><span
                                                v-else>{{
                                                    useTimeDuration(filteredTrades[itemTradeIndex].trades[tradeIndex].exitTime -
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

                                        <!-- Patterns
                                        <div class="col-4" v-if="patterns.length > 0">
                                            <select v-on:change="useTradeSetupChange($event.target.value, 'pattern')"
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

                                        Mistakes
                                        <div class="col-4" v-if="mistakes.length > 0">
                                            <select v-on:change="useTradeSetupChange($event.target.value, 'mistake')"
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
                                        </div>-->

                                        <!-- Tags -->
                                        <div class="container-tags col-8">
                                            <div class="form-control dropdown form-select" style="height: auto;">
                                                <div style="display: flex; align-items: center; flex-wrap: wrap;">
                                                    <span v-for="(tag, index) in tradeTags" :key="index"
                                                        class="tag txt-small" :style="getTagColor(tag.id)"
                                                        @click="tradeTagsChange('remove', index)">
                                                        {{ tag.name }}<span class="remove-tag">×</span>
                                                    </span>

                                                    <input type="text" v-model="tagInput" @input="filterTags"
                                                        @keydown.enter.prevent="tradeTagsChange('add', tagInput)"
                                                        @keydown.tab.prevent="tradeTagsChange('add', tagInput)"
                                                        @keydown="handleKeyDown" class="form-control tag-input"
                                                        placeholder="Add a tag">
                                                    <div class="clickable-area" v-on:click="toggleTagsDropdown">
                                                    </div>
                                                </div>
                                            </div>
                                            <!--<div v-for="group in availableTags" class="dropdown-menu-tags">
                                                {{ group.name }}
                                                <div v-for="tags in group.tags">
                                                    {{ tags.name }}
                                                </div>
                                            </div>-->
                                            <ul class="dropdown-menu-tags">
                                                <span v-show="showTagsList" v-for="group in availableTags">
                                                    <h6 class="p-1 mb-0" :style="'background-color: ' + group.color + ';'">{{ group.name }}</h6>
                                                    <li v-for="(suggestion, index) in filteredSuggestions2(group.id)"
                                                        :key="index" :class="{ active: index === selectedTagIndex }"
                                                        @click="tradeTagsChange('addFromDropdownMenu', suggestion)"
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
                                        v-bind:value="filteredTrades[itemTradeIndex].trades[tradeIndex].note"
                                        v-on:change="useTradeSetupChange($event.target.value, 'note')"
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