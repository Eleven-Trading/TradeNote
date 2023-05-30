import { currentUser, patternToEdit, updatePatternName, updatePatternDescription, updatePatternActive, newPatternName, newPatternDescription, mistakeToEdit, updateMistakeName, updateMistakeDescription, updateMistakeActive, newMistakeName, newMistakeDescription, patterns, mistakes, queryLimit, setups, tradeSetup, tradeSetupDateUnixDay, tradeSetupId, tradeSetupDateUnix, tradeSetupChanged, spinnerSetupsText, spinnerSetups, pageId, tradeId, saveButton, selectedRange } from '../stores/globals';
import { useUpdateTrades } from './trades'
import { useGetSelectedRange } from './utils';



export async function useGetPatterns() {
    return new Promise(async (resolve, reject) => {
        console.log(" -> Getting Patterns");
        const parseObject = Parse.Object.extend("patterns");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current());
        query.ascending("order");
        query.limit(queryLimit.value); // limit to at most 10 results
        patterns.length = 0
        const results = await query.find();
        results.forEach(element => {
            patterns.push(JSON.parse(JSON.stringify(element)))
        });

        resolve()
    })
}

export async function useGetMistakes() {
    return new Promise(async (resolve, reject) => {
        console.log(" -> Getting Mistakes");
        const parseObject = Parse.Object.extend("mistakes");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current());
        query.ascending("order");
        query.limit(queryLimit.value); // limit to at most 10 results
        mistakes.length = 0
        const results = await query.find();
        results.forEach(element => {
            mistakes.push(JSON.parse(JSON.stringify(element)))
        });
        resolve()
    })
}

export async function useGetSetups(param) {
    return new Promise(async (resolve, reject) => {
        console.log(" -> Getting setups");
        let startD = selectedRange.value.start
        let endD = selectedRange.value.end
        //console.log(" -> screenshotsPagination (start)" + screenshotsPagination.value);
        //console.log(" selected start date " + selectedMonth.start.value)
        const parseObject = Parse.Object.extend("setups");
        const query = new Parse.Query(parseObject);
        //if (pageId.value == "screenshots" ||  pageId.value == "addScreenshot") query.containedIn("tradeId", screenshotsNames.value);
        query.include("pattern")
        query.include("mistake")
        query.greaterThanOrEqualTo("dateUnix", startD)
        query.lessThan("dateUnix", endD)
        query.limit(queryLimit.value)
        const results = await query.find();
        setups.length = 0
        results.forEach(element => {
            setups.push(JSON.parse(JSON.stringify(element)))
        });
        //console.log("setups "+JSON.stringify(setups))
        resolve()
    })
}

export function useTradeSetupChange(param1, param2, param3, param4, param5) {
    //console.log("param 1: " + param1 + " - param2: " + param2 + " - param3: " + param3 + " - param4: " + param4 + " - param5: " + param5)
    if (param2 == "pattern") {
        tradeSetup.pattern = param1
    }
    if (param2 == "mistake") {
        tradeSetup.mistake = param1
    }
    if (param2 == "note") {
        tradeSetup.note = param1
    }
    if (pageId.value == "daily") {
        tradeSetupDateUnixDay.value = param3
        tradeSetupId.value = param4
        tradeSetupDateUnix.value = param5
    } // else in Screenhsot mixin, we define them on edit

    //console.log("tradesetup in change " + JSON.stringify(tradeSetup))
    tradeSetupChanged.value = true
    saveButton.value = true

}

export async function useUpdateSetups(param) {
    console.log("\nUPDATING OR SAVING SETUPS IN PARSE DB")
    return new Promise(async (resolve, reject) => {

        if (tradeSetup.pattern != null || tradeSetup.mistake != null || tradeSetup.note != null) {
            //console.log("trade setup " + JSON.stringify(tradeSetup) + " with ID " + param2)
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
                results.set("pattern", tradeSetup.pattern == null ? null : { __type: "Pointer", className: "patterns", objectId: tradeSetup.pattern })
                results.set("mistake", tradeSetup.mistake == null ? null : { __type: "Pointer", className: "mistakes", objectId: tradeSetup.mistake })
                results.set("note", tradeSetup.note)

                results.save()
                    .then(async () => {
                        console.log(' -> Updated setups with id ' + results.id)
                        await useGetSelectedRange()
                        await useGetSetups()
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
                object.set("pattern", { __type: "Pointer", className: "patterns", objectId: tradeSetup.pattern })
                if (tradeSetup.mistake != null) {
                    object.set("mistake", { __type: "Pointer", className: "mistakes", objectId: tradeSetup.mistake })
                } else {
                    object.set("mistake", null)
                }
                if (tradeSetup.note != null) {
                    object.set("note", tradeSetup.note)
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
                        if (param) {
                            await useGetSelectedRange()
                            await useGetSetups()
                        }
                        //spinnerSetupsText.value = "Added new setup"
                        tradeId.value = tradeId.value // we need to do this if I want to manipulate the current modal straight away, like for example delete after saving. WHen You push next or back, tradeId is set back to null
                    }, (error) => {
                        console.log('Failed to create new object, with error code: ' + error.message);
                    })
            }

        }
        resolve()


    })
}

export async function useDeleteSetup(param1, param2) {
    console.log("\nDELETING SETUP")
    tradeSetupDateUnixDay.value = param1 // not used here but when when deleting trades (updateTrades(true))
    tradeSetupId.value = param2
    spinnerSetups.value = true
    tradeSetupChanged.value = true
    saveButton.value = true
    //console.log("trade setup " + JSON.stringify(tradeSetup) + " with ID " + tradeSetup)

    if (tradeSetupId.value != null) {
        console.log(" -> Deleting setups")
        const parseObject = Parse.Object.extend("setups");
        const query = new Parse.Query(parseObject);
        query.equalTo("tradeId", tradeSetupId.value)
        const results = await query.first();
        if (results) {
            results.destroy().then(async () => {
                console.log('  --> Deleted setups with id ' + results.id)
                useResetSetup()
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

export function useResetSetup() {
    //console.log(" -> Resetting tradeSetup")
    //we need to reset the setup variable each time
    for (let key in tradeSetup) delete tradeSetup[key]
    tradeSetup.pattern = null
    tradeSetup.mistake = null
    tradeSetup.note = null
}

export function useEditPattern(param) {
    patternToEdit.value = param.objectId
    updatePatternName.value = param.name
    updatePatternDescription.value = param.description
    updatePatternActive.value = param.active

    //console.log("patternToEdit " + patternToEdit.value + ", name " + updatePatternName.value + ", desc " + updatePatternDescription.value+" and active "+updatePatternActive.value)
}

export function useEditMistake(param) {
    mistakeToEdit.value = param.objectId
    updateMistakeName.value = param.name
    updateMistakeDescription.value = param.description
    updateMistakeActive.value = param.active

    //console.log("mistakeToEdit " + mistakeToEdit.value + ", name " + updateMistakeName.value + ", desc " + updateMistakeDescription.value+" and active "+updateMistakeActive.value)
}

export async function useUpdateEditPattern() {
    console.log("\nUPDATING EDITED PATTERN")
    if (updatePatternName.value == '') {
        alert("Name cannot be empty")
    } else {
        const parseObject = Parse.Object.extend("patterns");
        const query = new Parse.Query(parseObject);
        query.equalTo("objectId", patternToEdit.value)
        const results = await query.first();
        if (results) {
            console.log(" -> Updating pattern")
            results.set("name", updatePatternName.value)
            results.set("description", updatePatternDescription.value)
            results.set("active", updatePatternActive.value)

            results.save()
                .then(async () => {
                    console.log(' -> Updated edited pattern with id ' + results.id)
                    //spinnerSetupsText.value = "Updated setup"
                }, (error) => {
                    alert('Failed to create new object, with error code: ' + error.message);
                })
        } else {
            alert("There is no corresponding pattern id")
        }
        await useGetPatterns().then(() => {
            updatePatternName.value = null
            updatePatternDescription.value = null
            updatePatternActive.value = null
            patternToEdit.value = null
        })
        //console.log("Patterns "+JSON.stringify(patterns.value))
        localStorage.removeItem("selectedPatterns")
        localStorage.removeItem("selectedMistakes")

    }
}

export async function useUpdateEditMistake() {
    console.log("\nUPDATING EDITED MISTAKE")
    if (updateMistakeName.value == '') {
        alert("Name cannot be empty")
    } else {
        const parseObject = Parse.Object.extend("mistakes");
        const query = new Parse.Query(parseObject);
        query.equalTo("objectId", mistakeToEdit.value)
        const results = await query.first();
        if (results) {
            console.log(" -> Updating mistake")
            results.set("name", updateMistakeName.value)
            results.set("description", updateMistakeDescription.value)
            results.set("active", updateMistakeActive.value)

            results.save()
                .then(async () => {
                    console.log(' -> Updated edited mistake with id ' + results.id)
                    //spinnerSetupsText.value = "Updated setup"
                }, (error) => {
                    alert('Failed to create new object, with error code: ' + error.message);
                })
        } else {
            alert("There is no corresponding mistake id")
        }
        await useGetMistakes().then(() => {
            updateMistakeName.value = null
            updateMistakeDescription.value = null
            updateMistakeActive.value = null
            mistakeToEdit.value = null
        })
        //console.log("Mistakes "+JSON.stringify(mistakes.value))


    }
}

export async function useSaveNewPattern() {
    console.log(" -> \n SAVING NEW PATTERN")
    console.log(" newPatternName " + newPatternName.value)
    if (newPatternName.value == '' || newPatternName.value == null) {
        alert("Name cannot be empty")
    } else {
        const parseObject = Parse.Object.extend("patterns");
        const object = new parseObject();
        object.set("user", Parse.User.current())
        object.set("name", newPatternName.value)
        object.set("description", newPatternDescription.value)
        object.set("active", true)
        object.setACL(new Parse.ACL(Parse.User.current()));
        object.save()
            .then(async (object) => {
                console.log(' -> Added new pattern with id ' + object.id)
                await useGetPatterns()
            }, (error) => {
                console.log('Failed to create new object, with error code: ' + error.message);
            });
        newPatternName.value = null
        newPatternDescription.value = null
    }
}

export async function useSaveNewMistake() {
    console.log(" -> \n SAVING NEW MISTAKE")
    if (newMistakeName.value == '' || newMistakeName.value == null) {
        alert("Name cannot be empty")
    } else {
        const parseObject = Parse.Object.extend("mistakes");
        const object = new parseObject();
        object.set("user", Parse.User.current())
        object.set("name", newMistakeName.value)
        object.set("description", newMistakeDescription.value)
        object.set("active", true)
        object.setACL(new Parse.ACL(Parse.User.current()));
        object.save()
            .then(async (object) => {
                console.log(' -> Added new mistake with id ' + object.id)
                await useGetMistakes()
            }, (error) => {
                console.log('Failed to create new object, with error code: ' + error.message);
            });
        newMistakeName.value = null
        newMistakeDescription.value = null
    }
}