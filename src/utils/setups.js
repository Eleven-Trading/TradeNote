import { patterns, mistakes, queryLimit, setups, tradeSetupDateUnixDay, tradeSetupId, tradeSetupDateUnix, tradeSetupChanged, spinnerSetupsText, spinnerSetups, pageId, tradeId, saveButton, selectedRange, activePatterns, activeMistakes,filteredTrades, itemTradeIndex, tradeIndex, tradeIndexPrevious, screenshot, patternUpdate, mistakeUpdate, mistakeNew, patternNew } from '../stores/globals';
import { useGetSelectedRange } from './utils';



export async function useGetPatterns() {
    return new Promise(async (resolve, reject) => {
        console.log(" -> Getting Patterns");
        patterns.length = 0
        activePatterns.length = 0
        const parseObject = Parse.Object.extend("patterns");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current());
        query.ascending("order");
        query.limit(queryLimit.value); // limit to at most 10 results
        const results = await query.find();
        results.forEach(element => {
            const parsedElement = JSON.parse(JSON.stringify(element))
            if (parsedElement.active == true) {
                activePatterns.push(parsedElement)
            }
            patterns.push(parsedElement)
        });
        resolve()
    })
}

export async function useGetMistakes() {
    return new Promise(async (resolve, reject) => {
        console.log(" -> Getting Mistakes");
        mistakes.length = 0
        activeMistakes.length = 0
        const parseObject = Parse.Object.extend("mistakes");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current());
        query.ascending("order");
        query.limit(queryLimit.value); // limit to at most 10 results
        const results = await query.find();
        results.forEach(element => {
            const parsedElement = JSON.parse(JSON.stringify(element))
            if (parsedElement.active == true) {
                activeMistakes.push(parsedElement)
            }
            mistakes.push(parsedElement)
        });
        resolve()
    })
}

export async function useGetSetups(param) {
    return new Promise(async (resolve, reject) => {
        let startD = selectedRange.value.start
        let endD = selectedRange.value.end
        //console.log(" -> screenshotsPagination (start)" + screenshotsPagination.value);
        //console.log(" selected start date " + selectedMonth.start.value)
        const parseObject = Parse.Object.extend("setups");
        const query = new Parse.Query(parseObject);
        query.include("pattern")
        query.include("mistake")
        if (pageId.value == "daily") {
            query.greaterThanOrEqualTo("dateUnix", startD)
            query.lessThan("dateUnix", endD)
        }
        query.limit(queryLimit.value)
        const results = await query.find();
        setups.length = 0
        results.forEach(element => {
            setups.push(JSON.parse(JSON.stringify(element)))
        });
        //console.log("setups " + JSON.stringify(setups))
        resolve()
    })
}

export function useTradeSetupChange(param1, param2) {
    //console.log("param 1: " + param1 + " - param2: " + param2)
    if (pageId.value == "daily") {
        if (param2 == "pattern") {
            param1 == "null" ? filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].pattern = null : filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].pattern = param1
            param1 == "null" ? filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].patternName = null : filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].patternName = patterns.filter(obj => obj.objectId == param1)[0].name
            param1 == "null" ? filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].patternNameShort = null : filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].patternNameShort = patterns.filter(obj => obj.objectId == param1)[0].name.substr(0, 15) + "..."
        }
        if (param2 == "mistake") {
            param1 == "null" ? filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].mistake = null : filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].mistake = param1
            param1 == "null" ? filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].mistakeName = null : filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].mistakeName = mistakes.filter(obj => obj.objectId == param1)[0].name
            param1 == "null" ? filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].mistakeNameShort = null : filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].mistakeNameShort = mistakes.filter(obj => obj.objectId == param1)[0].name.substr(0, 15) + "..."
        }
        if (param2 == "note") {
            param1 == "" ? filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].note = null : filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].note = param1
            param1 == "" ? filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].noteShort = null : filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].noteShort = param1.substr(0, 15) + "..."
        }

        tradeSetupDateUnixDay.value = filteredTrades[itemTradeIndex.value].dateUnix
        tradeSetupId.value = filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].id
        tradeSetupDateUnix.value = filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].entryTime
    } // else in Screenhsot mixin, we define them on edit

    if (pageId.value == "addScreenshot") {
        if (param2 == "pattern") {
            screenshot.pattern = param1
        }
        if (param2 == "mistake") {
            screenshot.mistake = param1
        }
    }

    tradeSetupChanged.value = true
    saveButton.value = true

}

export async function useUpdateSetups() {
    console.log("\nUPDATING OR SAVING SETUPS IN PARSE DB")
    return new Promise(async (resolve, reject) => {
        let temp

        const upsertSetups = async () => {
            console.log("pattern " + temp.pattern)
            spinnerSetups.value = true
            //tradeSetupChanged.value = true
            const parseObject = Parse.Object.extend("setups");
            const query = new Parse.Query(parseObject);
            query.equalTo("tradeId", tradeSetupId.value)
            const results = await query.first();

            //UPDATING
            if (results) {
                console.log(" -> Updating setups")
                spinnerSetupsText.value = "Updating"
                results.set("pattern", temp.pattern == null ? null : { __type: "Pointer", className: "patterns", objectId: temp.pattern })
                results.set("mistake", temp.mistake == null ? null : { __type: "Pointer", className: "mistakes", objectId: temp.mistake })
                results.set("note", temp.note)

                results.save()
                    .then(async () => {
                        console.log(' -> Updated setups with id ' + results.id)
                        //await useGetSelectedRange()
                        //await useGetSetups()
                        //spinnerSetupsText.value = "Updated setup"
                    }, (error) => {
                        console.log('Failed to create new object, with error code: ' + error.message);
                    })
            }

            //SAVING
            else {
                console.log(" -> Saving setups")
                spinnerSetupsText.value = "Saving"

                const object = new parseObject();
                object.set("user", Parse.User.current())
                object.set("pattern", { __type: "Pointer", className: "patterns", objectId: temp.pattern })
                if (temp.mistake != null) {
                    object.set("mistake", { __type: "Pointer", className: "mistakes", objectId: temp.mistake })
                } else {
                    object.set("mistake", null)
                }
                if (temp.note != null) {
                    object.set("note", temp.note)
                } else {
                    object.set("note", null)
                }

                object.set("dateUnixDay", tradeSetupDateUnixDay.value)
                object.set("dateUnix", tradeSetupDateUnix.value)
                object.set("tradeId", tradeSetupId.value)
                object.setACL(new Parse.ACL(Parse.User.current()));
                object.save()
                    .then(async (object) => {
                        console.log('  --> Added new patterns mistake with id ' + object.id)
                        //spinnerSetupsText.value = "Added new setup"
                        tradeId.value = tradeId.value // we need to do this if I want to manipulate the current modal straight away, like for example delete after saving. WHen You push next or back, tradeId is set back to null
                    }, (error) => {
                        console.log('Failed to create new object, with error code: ' + error.message);
                    })
            }

        }

        if (pageId.value == "daily") {
            temp = filteredTrades[itemTradeIndex.value].trades[tradeIndexPrevious.value]
            if (temp.pattern != null || temp.mistake != null || temp.note != null) {
                upsertSetups()
            }
        }
        if (pageId.value == "addScreenshot") {
            temp = screenshot
            upsertSetups()
        }

        resolve()


    })
}

export async function useDeleteSetup(param1, param2) {
    console.log("\nDELETING SETUP")
    tradeSetupDateUnixDay.value = param1 // not used here but when when deleting trades (updateTrades(true))
    tradeSetupId.value = param2.id
    spinnerSetups.value = true
    tradeSetupChanged.value = true
    saveButton.value = true

    if (tradeSetupId.value != null) {
        console.log(" -> Deleting setups")
        const parseObject = Parse.Object.extend("setups");
        const query = new Parse.Query(parseObject);
        query.equalTo("tradeId", tradeSetupId.value)
        const results = await query.first();
        if (results) {
            results.destroy().then(async () => {
                console.log('  --> Deleted setups with id ' + results.id)
                param2.pattern = null
                param2.patternName = null
                param2.patternNameShort = null

                param2.mistake = null
                param2.mistakeName = null
                param2.mistakeNameShort = null

                param2.note = null
                param2.noteShort = null

                await useGetSelectedRange()
                await useGetSetups()
            }, (error) => {
                console.log('Failed to delete setup, with error code: ' + error.message);
            });
        } else {
            console.log("  --> Problem : the tradeId has setup but it is not present in paternsMistakes")
        }
    } else {
        alert("There is no existing setup")
        return
    }
    spinnerSetups.value = false
}

/******** USED IN SETTINGS ***********/

export function useEditPatternMistake(param, param2) {
    let itemUpdate
    if (param2 == "pattern") {
        itemUpdate = patternUpdate
    } else {
        itemUpdate = mistakeUpdate
    }
    itemUpdate.edit = param.objectId
    itemUpdate.name = param.name
    itemUpdate.description = param.description
    itemUpdate.active = param.active
    //console.log("itemUpdate.edit " + itemUpdate.edit + ", name " + updatePatternName.value + ", desc " + updatePatternDescription.value+" and active "+updatePatternActive.value)
}

function updateSelectedPatternsMistakes(param, param2, param3) {
    let selectedItems = param

    let selectedItemsArray = []
    if (localStorage.getItem(selectedItems)) {
        if (localStorage.getItem(selectedItems).includes(",")) {
            selectedItemsArray = localStorage.getItem(selectedItems).split(",")
        } else {
            selectedItemsArray = []
            selectedItemsArray.push(localStorage.getItem(selectedItems))
        }
    } else {
        selectedItemsArray = []
    }
    console.log(" selected items value " + JSON.stringify(selectedItemsArray))
    if (param3 == false) {
        for (var i = 0; i < selectedItemsArray.length; i++) {
            if (selectedItemsArray[i] === param2) {
                selectedItemsArray.splice(i, 1);
            }
        }
    } else {
        //only push in case active has changed. Indeed, if active and does not change any thing, we should not push again
        if (!selectedItemsArray.includes(param2)) selectedItemsArray.push(param2)
    }

    localStorage.setItem(selectedItems, selectedItemsArray)
    console.log(" -> Updated selectedItems / localstorage " + selectedItemsArray)
}

export async function useUpdateEditPatternMistake(param, param2) {
    console.log("\nUPDATING EDITED " + param2)
    let itemUpdate
    let selectedItems
    if (param2 == "pattern") {
        itemUpdate = patternUpdate
        selectedItems = "selectedPatterns"
    } else {
        itemUpdate = mistakeUpdate
        selectedItems = "selectedMistakes"
    }

    if (itemUpdate.name == '') {
        alert("Name cannot be empty")
    } else {

        updateSelectedPatternsMistakes(selectedItems, param.objectId, itemUpdate.active)

        const parseObject = Parse.Object.extend(param2 + "s");
        const query = new Parse.Query(parseObject);
        query.equalTo("objectId", param.objectId)
        const results = await query.first();
        if (results) {
            console.log(" -> Updating " + param2)
            results.set("name", itemUpdate.name)
            results.set("description", itemUpdate.description)
            results.set("active", itemUpdate.active)

            results.save()
                .then(async () => {
                    console.log(' -> Updated edited ' + param2 + ' with id ' + results.id)
                    //spinnerSetupsText.value = "Updated setup"
                }, (error) => {
                    alert('Failed to create new object, with error code: ' + error.message);
                })
        } else {
            alert("There is no corresponding id " + param2)
        }
        if (param2 == "pattern") {
            await useGetPatterns()
        } else {
            await useGetMistakes()
        }

        itemUpdate.name = null
        itemUpdate.description = null
        itemUpdate.active = null
        itemUpdate.edit = null


        //console.log("Patterns "+JSON.stringify(patterns.value))

    }
}

export async function useSaveNewPatternMistake(param) {
    console.log(" -> \n SAVING NEW PATTERN")
    let itemNew
    if (param == "pattern") {
        itemNew = patternNew
    } else {
        itemNew = mistakeNew
    }
    console.log(" newItem " + itemNew.name)
    if (itemNew.name == '' || itemNew.name == null) {
        alert("Name cannot be empty")
    } else {
        const parseObject = Parse.Object.extend(param + "s");
        const object = new parseObject();
        object.set("user", Parse.User.current())
        object.set("name", itemNew.name)
        object.set("description", itemNew.description)
        object.set("active", true)
        object.setACL(new Parse.ACL(Parse.User.current()));
        object.save()
            .then(async (object) => {
                console.log(' -> Added new +' + param + ' with id ' + object.id)
                let selectedItems
                if (param == "pattern") {
                    selectedItems = "selectedPatterns"
                } else {
                    selectedItems = "selectedMistakes"
                }
                
                updateSelectedPatternsMistakes(selectedItems,object.id)
                if (param == "pattern") {
                    await useGetPatterns()
                } else {
                    await useGetMistakes()
                }
            }, (error) => {
                console.log('Failed to create new object, with error code: ' + error.message);
            });
        itemNew.name = null
        itemNew.description = null
    }
}