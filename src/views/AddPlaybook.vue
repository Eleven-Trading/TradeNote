<script setup>
import { onBeforeMount } from 'vue';
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import { currentDate, itemToEditId, spinnerLoadingPage, timeZoneTrade, playbookUpdate, playbookButton, playbookIdToEdit } from '../stores/globals';
import { useDateCalFormat, useInitQuill } from '../utils/utils';
import { useUploadPlaybook } from '../utils/playbooks';

let playbook = {} //this is first time or when load
currentDate.value = dayjs().tz(timeZoneTrade.value).format("YYYY-MM-DD HH:mm")

onBeforeMount(async () => {
    await (spinnerLoadingPage.value = true)
    await useInitQuill("Playbook")
    await getPlaybookToEdit(itemToEditId.value)
    await sessionStorage.removeItem('editItemId');
    playbookDateInput(currentDate)
    await (spinnerLoadingPage.value = false)
})

function playbookDateInput(param) {
    //console.log(" param "+param)
    playbookUpdate.dateUnix = dayjs.tz(param, timeZoneTrade.value).unix()
    playbookUpdate.date = dayjs(playbookUpdate.dateUnix * 1000).format("YYYY-MM-DD")
    playbookUpdate.dateDateFormat = new Date(playbookUpdate.date)
    console.log(" -> playbookDateUnix " + playbookUpdate.dateUnix + " and date " + playbookUpdate.date + " and date formated "+playbookUpdate.dateDateFormat)
}

async function getPlaybookToEdit(param) {
    if (!param) {
        return
    }
    playbookIdToEdit.value = param
    //console.log("playbook to edit " + playbookIdToEdit.value)
    const parseObject = Parse.Object.extend("playbooks");
    const query = new Parse.Query(parseObject);
    query.equalTo("objectId", param);
    const results = await query.first();
    if (results) {
        playbook = JSON.parse(JSON.stringify(results))
        //we start by using this.playbook to show html. Then, for changing, we use this.playbookUpdate
        //console.log(" Playbook to edit "+JSON.stringify(this.playbook))
        document.querySelector("#quillEditorPlaybook .ql-editor").innerHTML = playbook.playbook
    } else {
        alert("Query did not return any results")
    }
}


</script>

<template>
    <SpinnerLoadingPage />
    <div class="row mt-2">
        <div v-show="!spinnerLoadingPage">
            <div class="mt-3 input-group mb-3">
                <input type="date" class="form-control" v-bind:readonly="playbook.hasOwnProperty('dateUnix')"
                    v-bind:value="playbook.hasOwnProperty('dateUnix') ? playbookUpdate.date = useDateCalFormat(playbook.dateUnix) : playbookUpdate.hasOwnProperty('date') ? playbookUpdate.date : ''"
                    v-on:input="playbookDateInput($event.target.value)" />
            </div>
            <h5>Playbook</h5>
            <div class="mt-2">
                <div id="quillEditorPlaybook"></div>
            </div>
            <div class="mt-3">
                <button :disabled="!playbookButton" type="button" v-on:click="useUploadPlaybook()"
                    class="btn btn-success btn-lg">Submit</button>
            </div>
            <div class="mt-3">
                <button type="cancel" onclick="location.href = '/playbook';"
                    class="btn btn-outline-secondary btn-sm">Cancel</button>
            </div>
        </div>
    </div>
</template>