import { playbookIdToEdit, playbookUpdate, playbooks, queryLimit, renderData, selectedItem, spinnerLoadingPage } from "../stores/globals";
import { useInitPopover, usePageRedirect } from "./utils";

export async function useGetPlaybooks(param) {
    return new Promise(async(resolve, reject) => {
        console.log(" -> Getting playbooks");
        const parseObject = Parse.Object.extend("playbooks");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current());
        query.descending("dateUnix");
        query.limit(queryLimit.value); // limit to at most 10 results
        playbooks.length = 0
        const results = await query.find();
        results.forEach(element => {
            playbooks.push(JSON.parse(JSON.stringify(element)))
        });
        //console.log(" -> Playbooks " + JSON.stringify(playbooks))
        spinnerLoadingPage.value = false
        resolve()
    })
}

export async function useUploadPlaybook() {
    const parseObject = Parse.Object.extend("playbooks");


    if (playbookIdToEdit.value) {
        console.log(" -> Updating playbook")
        const query = new Parse.Query(parseObject);
        query.equalTo("objectId", playbookIdToEdit.value);
        const results = await query.first();
        if (results) {
            results.set("playbook", playbookUpdate.playbook)
            await results.save() //very important to have await or else too quick to update
            usePageRedirect()


        } else {
            alert("Update query did not return any results")
        }
    } else {
        console.log(" -> Check if playbook already exists")

        const query = new Parse.Query(parseObject);
        query.equalTo("dateUnix", playbookUpdate.dateUnix);
        const results = await query.first();
        if (results) {
            alert("Playbook with that date already exists")
            return
        }

        console.log(" -> saving playbook")
        const object = new parseObject();
        object.set("user", Parse.User.current())
        object.set("date", playbookUpdate.dateDateFormat)
        object.set("dateUnix", playbookUpdate.dateUnix)
        object.set("playbook", playbookUpdate.playbook)
        object.setACL(new Parse.ACL(Parse.User.current()));
        object.save()
            .then((object) => {
                console.log(' -> Added new playbook with id ' + object.id)
                usePageRedirect()

            }, (error) => {
                console.log('Failed to create new object, with error code: ' + error.message);
            });
    }
}

export async function useDeletePlaybook() {
    //console.log("selected item " + selectedItem.value)
    console.log("\nDELETING PLAYBOOK ENTRY")
    const parseObject = Parse.Object.extend("playbooks");
    const query = new Parse.Query(parseObject);
    query.equalTo("objectId", selectedItem.value);
    const results = await query.first();

    if (results) {
        await results.destroy()
        await refreshPlaybooks()
    } else {
        alert("There was a problem with the query")
    }
}

async function refreshPlaybooks() {
    console.log(" -> Refreshing playbooks")
    return new Promise(async (resolve, reject) => {
        playbooks.length = 0
        await useGetPlaybooks()
        //await useInitPopover()
        await (renderData.value += 1)
        selectedItem.value = null
        resolve()
    })
}