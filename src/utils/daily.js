import { excursions, queryLimit, satisfactionArray, satisfactionTradeArray, tags, selectedRange, availableTags, currentUser, tradeTags, tradeTagsDateUnix, tradeTagsId, newTradeTags, pageId, notes, tradeNote, tradeNoteDateUnix, tradeNoteId, spinnerSetups, spinnerSetupsText } from "../stores/globals";

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
export const useGetTagColor = (param) => {
    const findGroupColor = (tagId) => {
        for (let obj of availableTags) {
            for (let tag of obj.tags) {
                if (tag.id === tagId) {
                    return obj.color;
                }
            }
        }

        let color = "#6c757d"
        if (availableTags.length > 0) {
            color = availableTags.filter(obj => obj.id == "group_0")[0].color
        }
        return color // Return ungroupcolor if no result
    }

    const tagIdToFind = param;
    const groupColor = findGroupColor(tagIdToFind);

    return "background-color: " + groupColor + ";"
}

export async function useGetTags() {
    return new Promise(async (resolve, reject) => {
        console.log(" -> Getting Tags");
        tags.length = 0
        let startD = selectedRange.value.start
        let endD = selectedRange.value.end
        const parseObject = Parse.Object.extend("tags");
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
                if (pageId.value == "daily"){
                    tempArray = newTradeTags
                }else{
                    tempArray = tradeTags
                }

                for (let index = 0; index < tempArray.length; index++) {
                    const element = tempArray[index];
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