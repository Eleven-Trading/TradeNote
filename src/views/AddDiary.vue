<script setup>
import { onBeforeMount, onMounted } from 'vue';
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import { spinnerLoadingPage, itemToEditId, currentDate, journalUpdate, tradeTimeZone, journalIdToEdit, journalButton } from '../stores/globals';
import { useInitQuill, useDateCalFormat } from '../utils/utils';
import { useUploadJournal } from '../utils/diary'

let journal = {}

onBeforeMount(async () => {
    await (spinnerLoadingPage.value = true)
    await Promise.all([journalDateInput(currentDate.value), useInitQuill(0), useInitQuill(1), useInitQuill(2)])
    await initJournalJson()
    await getJournalToEdit(itemToEditId.value)
    await sessionStorage.removeItem('editItemId');
    await (spinnerLoadingPage.value = false)
})

function journalDateInput(param) {
    console.log(" -> journalDateInput param: " + param)
    journalUpdate.dateUnix = dayjs.tz(param, tradeTimeZone.value).unix()
    journalUpdate.date = dayjs(param, tradeTimeZone.value).format("YYYY-MM-DD")
    journalUpdate.dateDateFormat = new Date(dayjs(param, tradeTimeZone.value).format("YYYY-MM-DD"))
    //console.log(" -> journalDateUnix " + journalUpdate.dateUnix + " and date " + journalUpdate.date)
    //console.log("journalUpdate " + JSON.stringify(journalUpdate))
}

async function getJournalToEdit(param) {
    if (!param) {
        return
    }
    journalIdToEdit.value = param
    //console.log("journal to edit " + journalIdToEdit.value)
    const parseObject = Parse.Object.extend("journals");
    const query = new Parse.Query(parseObject);
    query.equalTo("objectId", param);
    const results = await query.first();
    if (results) {
        journal = JSON.parse(JSON.stringify(results)) //we start by using journal to show html. Then, for changing, we use journal
        //console.log(" Journal to edit " + JSON.stringify(journal))
        document.querySelector("#quillEditor0 .ql-editor").innerHTML = journal.journal.positive
        document.querySelector("#quillEditor1 .ql-editor").innerHTML = journal.journal.negative
        document.querySelector("#quillEditor2 .ql-editor").innerHTML = journal.journal.other
    } else {
        console.log(' -> No diary to edit')
        //alert("Query did not return any results")
    }
}

async function initJournalJson(param) {
    return new Promise(async (resolve, reject) => {

        journalUpdate.journal = {}

        resolve()
    })
}




</script>
<template>
    <SpinnerLoadingPage />
    <div class="row mt-2">
        <!-- ============ ADD JOURNAL ============ -->
        <div>
            <div v-show="!spinnerLoadingPage">
                <div class="mt-3 input-group mb-3">
                    <input type="date" class="form-control" v-bind:readonly="journal.hasOwnProperty('date')"
                        v-bind:value="journal.hasOwnProperty('dateUnix') ? journalUpdate.date = useDateCalFormat(journal.dateUnix) : journalUpdate.hasOwnProperty('date') ? journalUpdate.date : journalUpdate.date = currentDate"
                        v-on:input="journalDateInput($event.target.value)" />
                </div>
                <h5>Positive Aspects</h5>
                <div class="mt-2">
                    <div id="quillEditor0"></div>
                </div>
                <h5 class="mt-3">Negative Aspects</h5>
                <div class="mt-2">
                    <div id="quillEditor1"></div>
                </div>
                <h5 class="mt-3">Observations</h5>
                <div class="mt-2">
                    <div id="quillEditor2"></div>
                </div>
                <div class="mt-3">
                    <button :disabled="!journalButton" type="button" v-on:click="useUploadJournal()"
                        class="btn btn-success btn-lg">Submit</button>
                </div>
                <div class="mt-3">
                    <button type="cancel" onclick="location.href = '/diary';"
                        class="btn btn-outline-secondary btn-sm">Cancel</button>
                </div>
            </div>
        </div>
    </div>
</template>