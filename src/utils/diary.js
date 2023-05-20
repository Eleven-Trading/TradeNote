import { journals, selectedMonth, endOfList, spinnerLoadingPage, spinnerLoadMore, pageId, journalIdToEdit, journalUpdate, selectedItem, renderData } from "../stores/globals"
import { useInitPopover, usePageRedirect } from "./utils";
let diaryQueryLimit = 10
let diaryPagination = 0

export async function useGetJournals(param1, param2) {
    //param1: true is diary page
    //param2: true is diary delete
    console.log("param 1 "+ param1)
    console.log("param 2 "+ param2)
    return new Promise(async (resolve, reject) => {
        console.log(" -> Getting journals");
        const parseObject = Parse.Object.extend("journals");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current());
        query.descending("dateUnix");
        if (param1) {
            query.limit(diaryQueryLimit);
            query.skip(diaryPagination)
        } else {
            query.greaterThanOrEqualTo("dateUnix", selectedMonth.value.start)
            query.lessThanOrEqualTo("dateUnix", selectedMonth.value.end)
        }
        const results = await query.find();
        if (results.length > 0) {
            if (param1) { //when on diary page and not deleting diary
                //console.log("param2 "+param2+" and we are concatenating")
                results.forEach(element => {
                    journals.push(JSON.parse(JSON.stringify(element))) // Here we concat
                });
            } else {
                journals.length = 0 // here we do not concat so we reset
                results.forEach(element => {
                    journals.push(JSON.parse(JSON.stringify(element))) // Here we concatenante
                });
            }
        } else {
            endOfList.value = true
        }

        //console.log(" -> Journals " + JSON.stringify(journals))
        diaryPagination = diaryPagination + diaryQueryLimit
        if (pageId.value != "daily") spinnerLoadingPage.value = false //we remove it later
        spinnerLoadMore.value = false
        resolve()
    })
}



export async function useUploadJournal() {

    const parseObject = Parse.Object.extend("journals");

    if (journalIdToEdit.value) {
        console.log(" -> Updating journal")
        const query = new Parse.Query(parseObject);
        query.equalTo("objectId", journalIdToEdit.value);
        const results = await query.first();
        if (results) {
            results.set("journal", journalUpdate.journal)
            await results.save() //very important to have await or else too quick to update
            usePageRedirect()


        } else {
            alert("Update query did not return any results")
        }
    } else {
        const query = new Parse.Query(parseObject);
        query.equalTo("dateUnix", journalUpdate.dateUnix);
        const results = await query.first();
        if (results) {
            alert("Journal with that date already exists")
            return
        }

        console.log(" -> saving journal")
        const object = new parseObject();
        object.set("user", Parse.User.current())
        object.set("date", journalUpdate.dateDateFormat)
        object.set("dateUnix", journalUpdate.dateUnix)
        object.set("journal", journalUpdate.journal)
        object.setACL(new Parse.ACL(Parse.User.current()));
        object.save()
            .then((object) => {
                console.log(' -> Added new journal with id ' + object.id)
                usePageRedirect()

            }, (error) => {
                console.log('Failed to create new object, with error code: ' + error.message);
            });
    }
}

export async function useDeleteJournal(param1, param2) {
    //console.log("selected item " + selectedItem.value)
    console.log("\nDELETING JOURNAL ENTRY")
    const parseObject = Parse.Object.extend("journals");
    const query = new Parse.Query(parseObject);
    query.equalTo("objectId", selectedItem.value);
    const results = await query.first();

    if (results) {
        await results.destroy()
        await refreshJournals()

    } else {
        alert("There was a problem with the query")
    }
}

async function refreshJournals() {
    console.log(" -> Refreshing journal entries")
    return new Promise(async (resolve, reject) => {
        diaryQueryLimit = 10
        diaryPagination = 0
        journals.length = 0
        await useGetJournals(true)
        useInitPopover()
        await (renderData.value += 1)
        selectedItem.value = null
        resolve()
    })
}