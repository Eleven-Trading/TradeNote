import { excursions, queryLimit, satisfactionArray, satisfactionTradeArray, tags, selectedRange, availableTags, currentUser, tradeTags, tradeTagsDateUnix, tradeTagsId, newTradeTags, pageId, notes, tradeNote, tradeNoteDateUnix, tradeNoteId, spinnerSetups, spinnerSetupsText, availableTagsArray, tagInput, selectedTagIndex, showTagsList, tradeTagsChanged, filteredTrades, itemTradeIndex, tradeIndex, saveButton, screenshot, screenshotsPagination, screenshotsQueryLimit } from "../stores/globals";

export async function useGetSatisfactions() {
    return new Promise(async (resolve, reject) => {
        console.log("\nGETTING SATISFACTIONS");
        satisfactionTradeArray.length = 0
        satisfactionArray.length = 0
        let startD = selectedRange.value.start
        let endD = selectedRange.value.end
        const parseObject = Parse.Object.extend("satisfactions");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current());
        query.greaterThanOrEqualTo("dateUnix", startD)
        query.lessThan("dateUnix", endD)
        query.limit(queryLimit.value); // limit to at most 10 results

        const results = await query.find();
        for (let i = 0; i < results.length; i++) {
            let temp = {}
            const object = results[i];
            temp.tradeId = object.get('tradeId')
            temp.satisfaction = object.get('satisfaction')
            temp.dateUnix = object.get('dateUnix')
            if (temp.tradeId != undefined) {
                satisfactionTradeArray.push(temp)
            } else {
                satisfactionArray.push(temp)
            }

        }
        //console.log(" -> Trades satisfaction " + JSON.stringify(satisfactionArray))
        resolve()

    })
}


export async function useGetExcursions() {
    return new Promise(async (resolve, reject) => {
        console.log("\nGETTING EXCURSIONS")
        let startD = selectedRange.value.start
        let endD = selectedRange.value.end
        const parseObject = Parse.Object.extend("excursions");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current());
        query.ascending("order");
        query.greaterThanOrEqualTo("dateUnix", startD)
        query.lessThan("dateUnix", endD)
        query.limit(queryLimit.value); // limit to at most 10 results
        excursions.length = 0
        const results = await query.find();
        results.forEach(element => {
            const parseElement = JSON.parse(JSON.stringify(element))
            excursions.push(parseElement)
        });
        //console.log(" -> excursions " + JSON.stringify(excursions))
        resolve()
    })
}

/****************************************$
 * 
 * TAGS 
 ****************************************/
export const useGetTagInfo = (param) => {

    const findTagInfo = (tagId) => {
        let temp = {}
        //check if tag id exists then return color
        for (let obj of availableTags) {
            for (let tag of obj.tags) {
                if (tag.id === tagId) {
                    temp.groupColor = obj.color
                    temp.tagName = tag.name
                    return temp
                }
            }
        }

        //Else return default color or new Ungrouped color
        let color = "#6c757d"
        if (availableTags.length > 0) {
            color = availableTags.filter(obj => obj.id == "group_0")[0].color
        }
        temp.groupColor = color
        temp.tagName = ''
        return temp
    }

    const tagIdToFind = param;
    const tagInfo = findTagInfo(tagIdToFind);
    //console.log(" tagInfo "+JSON.stringify(tagInfo))
    return tagInfo
}

export async function useGetTags() {
    return new Promise(async (resolve, reject) => {
        console.log(" -> Getting Tags");
        tags.length = 0
        const parseObject = Parse.Object.extend("tags");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current());
        if (pageId.value == "daily") {
            let startD = selectedRange.value.start
            let endD = selectedRange.value.end
            query.greaterThanOrEqualTo("dateUnix", startD)
            query.lessThan("dateUnix", endD)
        } else {
            query.limit(screenshotsQueryLimit.value);
            query.skip(screenshotsPagination.value)
        }
        query.limit(queryLimit.value); // limit to at most 10 results

        const results = await query.find();
        if (results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                let temp = {}
                const object = results[i];
                temp.tradeId = object.get('tradeId')
                temp.tags = object.get('tags')
                temp.dateUnix = object.get('dateUnix')
                tags.push(temp)

            }
        }
        console.log("  --> Tags " + JSON.stringify(tags))
        resolve()

    })
}

export async function useGetAvailableTags() {
    return new Promise(async (resolve, reject) => {
        console.log(" -> Getting Available Tags");
        availableTags.splice(0);


        const parseObject = Parse.Object.extend("_User");
        const query = new Parse.Query(parseObject);
        query.equalTo("objectId", currentUser.value.objectId);
        const results = await query.first();

        if (results) {
            let parsedResults = JSON.parse(JSON.stringify(results))
            let currentTags = parsedResults.tags
            //console.log(" current tags " + JSON.stringify(currentTags))
            if (currentTags == undefined) {
                //console.log("  --> Available Tags " + JSON.stringify(availableTags))
                resolve()
            } else if (currentTags.length > 0) {
                for (let index = 0; index < currentTags.length; index++) {
                    const element = currentTags[index];
                    availableTags.push(element)
                    if ((index + 1) == currentTags.length) {
                        //console.log("  --> Available Tags " + JSON.stringify(availableTags))
                        resolve()
                    }
                }
            } else {
                //console.log("  --> Available Tags " + JSON.stringify(availableTags))
                resolve()
            }
        } else {
            alert("No user")
        }

        /*let currentTags = currentUser.value.tags
        if (currentTags != undefined){
            for (let index = 0; index < currentTags.length; index++) {
                const element = currentTags[index];
                availableTags.push(element)   
            }
        }  

        console.log("  --> Available Tags " + JSON.stringify(availableTags))
        resolve()*/

    })
}

export const useCreateAvailableTagsArray = () => {
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
export const useFilterSuggestions = (param) => {
    
    //console.log(" availableTagsArray " + JSON.stringify(availableTagsArray))
    //console.log(" filtered suggestion param " + param)
    let index = availableTags.findIndex(obj => obj.id == param)
    //console.log(" index " + index)
    let temp = {}
    temp.id = param
    temp.tags = availableTags[index].tags.filter(tag => tag.name.toLowerCase().startsWith(tagInput.value.toLowerCase()));
    let index2 = filteredSuggestions.findIndex(obj => obj.id == temp.id)
    if (index2 == -1) {
        filteredSuggestions.push(temp)
    } else {
        filteredSuggestions[index2].tags = temp.tags
    }
    //console.log(" filteredSuggestions " + JSON.stringify(filteredSuggestions))
    return filteredSuggestions
}

export const useTradeTagsChange = async (param1, param2) => {
    console.log(" -> Type of trade tags change: " + param1)
    console.log(" -> Input added: " + JSON.stringify(param2))
    //console.log(" tags " + JSON.stringify(tags))

    if (param1 == "add") {

        //Case when arrow select and enter button
        if (selectedTagIndex.value != -1) {
            console.log(" -> Adding on arrow down and enter " + param2)

            let tradeTagsIndex = tradeTags.findIndex(obj => obj.id == filteredSuggestions[selectedTagIndex.value].id)

            //only add if does not exist in tradeTags already
            if (tradeTagsIndex == -1) {
                tradeTags.push(filteredSuggestions[selectedTagIndex.value]);
                tradeTagsChanged.value = true
                saveButton.value = true
                tagInput.value = ''; // Clear input after adding tag
            }

        } else if (param2) {

            let inputTextIndex = tradeTags.findIndex(obj => obj.name.toLowerCase() == param2.toLowerCase())
            console.log(" -> InputTextIndex " + inputTextIndex)

            //First check if input text already exists in trades tags ( = current array of tags)
            if (inputTextIndex != -1) {
                console.log("  --> Input text already exists in trades tags")
            } else {
                //Check if already in availableTags
                let inAvailableTagsIndex = availableTagsArray.findIndex(tag =>
                    tag.name.toLowerCase() == param2.toLowerCase())
                console.log("  --> InAvailableTagsIndex " + JSON.stringify(inAvailableTagsIndex))

                if (inAvailableTagsIndex != -1) {
                    console.log("  --> Input text already exists in availableTags")
                    tradeTags.push(availableTagsArray[inAvailableTagsIndex])
                    tradeTagsChanged.value = true
                    saveButton.value = true
                }
                else {
                    //Else new tag
                    console.log("  --> Input is a new tag")
                    let temp = {}



                    // Get the highest id number
                    const highestIdNumberAvailableTags = useFindHighestIdNumber(availableTags);
                    const highestIdNumberTradeTags = useFindHighestIdNumberTradeTags(tradeTags);

                    function chooseHighestNumber(num1, num2) {
                        return Math.max(num1, num2);
                    }

                    // Example usage:
                    const highestIdNumber = chooseHighestNumber(highestIdNumberAvailableTags, highestIdNumberTradeTags);

                    //console.log(" -> Highest tag id number " + highestIdNumber);

                    temp.id = "tag_" + (highestIdNumber + 1).toString()
                    temp.name = param2
                    tradeTags.push(temp)
                    tradeTagsChanged.value = true
                    saveButton.value = true

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
            console.log(" -> Adding " + JSON.stringify(param2))
            tradeTags.push(param2);
            tradeTagsChanged.value = true
            saveButton.value = true
            tagInput.value = ''; // Clear input after adding tag
        }
        selectedTagIndex.value = -1
        showTagsList.value = false
        console.log(" -> TradeTags " + JSON.stringify(tradeTags))
    }

    if (param1 == "remove") {
        //param2 is index of element to remove inside tradeTags
        tradeTags.splice(param2, 1);
        tradeTagsChanged.value = true
        saveButton.value = true
    }


    if (pageId.value == "daily") {
        tradeTagsDateUnix.value = filteredTrades[itemTradeIndex.value].dateUnix
        tradeTagsId.value = filteredTrades[itemTradeIndex.value].trades[tradeIndex.value].id
    }

};

export const useFilterTags = () => {
    if (tagInput.value == '') selectedTagIndex.value = -1
    let showDropdownToReturn = tagInput.value !== '' && filteredSuggestions.length > 0
    //console.log("Filtered tags showDropdownToReturn " + showDropdownToReturn)
    showTagsList.value = showDropdownToReturn
};

export const useHandleKeyDown = (event) => {
    if (showTagsList.value) {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            console.log("filteredSuggestions " + JSON.stringify(filteredSuggestions))
            selectedTagIndex.value = Math.min(selectedTagIndex.value + 1, filteredSuggestions.length - 1);
            //console.log(" arrow down and selectedTagIndex " + selectedTagIndex.value)
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            selectedTagIndex.value = Math.max(selectedTagIndex.value - 1, 0);
        }
    }
};

export const useToggleTagsDropdown = () => {
    selectedTagIndex.value = -1
    showTagsList.value = !showTagsList.value
}


export const useGetTagGroup = (param) => {
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

export const useResetTags = () => {
    tradeTags.splice(0);
}

export const useFindHighestIdNumber = (param) => {
    let highestId = -Infinity;
    if (param.length == 0) {
        highestId = 0
    } else {
        param.forEach(innerArray => {
            innerArray.tags.forEach(obj => {
                if (Number(obj.id.replace("tag_", "")) > highestId) {
                    highestId = Number(obj.id.replace("tag_", ""))
                }
            });
        });
    }
    return highestId;
}

export const useFindHighestIdNumberTradeTags = (param) => {
    let highestId = -Infinity;
    if (param.length == 0) {
        highestId = 0
    } else {
        param.forEach(obj => {
            if (Number(obj.id.replace("tag_", "")) > highestId) {
                highestId = Number(obj.id.replace("tag_", ""))
            }
        });
    }
    return highestId;
}

export const useUpdateTags = async () => {
    console.log("\nUPDATING OR SAVING TAGS IN PARSE DB")
    return new Promise(async (resolve, reject) => {
        spinnerSetups.value = true
        //tradeSetupChanged.value = true
        let tagsArray = []
        for (let index = 0; index < tradeTags.length; index++) {
            const element = tradeTags[index];
            tagsArray.push(element.id)            
        }
        const parseObject = Parse.Object.extend("tags");
        const query = new Parse.Query(parseObject);
        if (pageId.value == "addScreenshot") {
            query.equalTo("tradeId", screenshot.name)
        } else {
            query.equalTo("tradeId", tradeTagsId.value)
        }
        const results = await query.first();
        if (results) {
            console.log(" -> Updating tags")

            spinnerSetupsText.value = "Updating"
            results.set("tags", tagsArray)

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
            //console.log("screenshot" + JSON.stringify(screenshot) )
            spinnerSetupsText.value = "Saving"
            //console.log(" -> Trade tags " + JSON.stringify(tradeTags))
            const object = new parseObject();
            object.set("user", Parse.User.current())
            object.set("tags", tagsArray)
            if (pageId.value == "addScreenshot") {
                object.set("dateUnix", screenshot.dateUnix)
                object.set("tradeId", screenshot.name)
            } else {
                object.set("dateUnix", tradeTagsDateUnix.value)
                object.set("tradeId", tradeTagsId.value)
            }
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

export const useUpdateAvailableTags = async () => {
    console.log("\nUPDATING OR SAVING AVAILABLE TAGS")
    return new Promise(async (resolve, reject) => {
        const parseObject = Parse.Object.extend("_User");
        const query = new Parse.Query(parseObject);
        query.equalTo("objectId", currentUser.value.objectId);
        const results = await query.first();
        if (results) {
            let parsedResults = JSON.parse(JSON.stringify(results))
            let currentTags = parsedResults.tags
            //console.log(" currentTags " + JSON.stringify(currentTags))

            const saveTags = () => {
                console.log(" -> Saving available tags")
                currentTags = []
                let temp = {}
                temp.id = "group_0"
                temp.name = "Ungrouped"
                temp.color = "#6c757d"
                temp.tags = []
                for (let index = 0; index < tradeTags.length; index++) {
                    const element = tradeTags[index];
                    temp.tags.push(element)
                }
                currentTags.push(temp)
            }

            if (currentTags == undefined) {
                saveTags()

            } else if (currentTags.length == 0) {
                saveTags()
            }

            else {
                console.log(" -> Updating available tags")
                let ungroupedIndex = currentTags.findIndex(obj => obj.id == "group_0")

                let tempArray = []
                if (pageId.value == "daily") {
                    tempArray = newTradeTags
                } else {
                    tempArray = tradeTags
                }

                for (let index = 0; index < tempArray.length; index++) {
                    const element = tempArray[index];
                    //console.log("  --> tags "+JSON.stringify(currentTags[ungroupedIndex].tags))
                    //console.log("  --> element "+JSON.stringify(element))
                    let index2 = currentTags[ungroupedIndex].tags.findIndex(obj => obj.id == element.id)
                    //console.log("  --> index2 "+index2)
                    //useUpdateAvailableTags is called whenever tradeTagsChanged.value = true. So either i differentiate or simply make a check here: only push if doesn't already exist. Else was showing multiple time in dropdown list.
                    if (index2 == -1) {
                        console.log("  --> Adding new tag to available tags")
                        currentTags[ungroupedIndex].tags.push(element)
                    } else {
                        console.log("  --> Tag already exists in available tags")
                    }
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

/****************************************$
 * 
 * NOTES 
 ****************************************/

export async function useGetNotes() {
    return new Promise(async (resolve, reject) => {
        console.log(" -> Getting Notes");
        notes.length = 0
        let startD = selectedRange.value.start
        let endD = selectedRange.value.end
        const parseObject = Parse.Object.extend("notes");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current());
        query.greaterThanOrEqualTo("dateUnix", startD)
        query.lessThan("dateUnix", endD)
        query.limit(queryLimit.value); // limit to at most 10 results

        const results = await query.find();
        if (results.length > 0) {
            for (let i = 0; i < results.length; i++) {
                let temp = {}
                const object = results[i];
                temp.tradeId = object.get('tradeId')
                temp.note = object.get('note')
                temp.dateUnix = object.get('dateUnix')
                notes.push(temp)

            }
        }
        console.log("  --> notes " + JSON.stringify(notes))
        resolve()

    })
}

export const useUpdateNote = async () => {
    console.log("\nUPDATING OR SAVING NOTE IN PARSE DB")
    return new Promise(async (resolve, reject) => {
        spinnerSetups.value = true

        const parseObject = Parse.Object.extend("notes");
        const query = new Parse.Query(parseObject);
        query.equalTo("tradeId", tradeNoteId.value)
        const results = await query.first();
        if (results) {
            console.log(" -> Updating note")

            spinnerSetupsText.value = "Updating"
            results.set("note", tradeNote.value)

            results.save()
                .then(async () => {
                    console.log(' -> Updated note with id ' + results.id)
                    //await useGetSelectedRange()
                    resolve()
                }, (error) => {
                    console.log('Failed to create new object, with error code: ' + error.message);
                })
        } else {
            console.log(" -> Saving note")
            spinnerSetupsText.value = "Saving"
            const object = new parseObject();
            object.set("user", Parse.User.current())
            object.set("note", tradeNote.value)
            object.set("dateUnix", tradeNoteDateUnix.value)
            object.set("tradeId", tradeNoteId.value)
            object.setACL(new Parse.ACL(Parse.User.current()));
            object.save()
                .then(async (object) => {
                    console.log(' -> Added new note with id ' + object.id)
                    //await useGetSelectedRange()
                    resolve()
                }, (error) => {
                    console.log('Failed to create new object, with error code: ' + error.message);
                })
        }



    })
}