<script setup>
import { onBeforeMount } from 'vue';
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import { spinnerLoadingPage, itemToEditId, currentDate, diaryUpdate, timeZoneTrade, diaryIdToEdit, diaryButton } from '../stores/globals';
import { useInitQuill, useDateCalFormat } from '../utils/utils';
import { useUploadDiary } from '../utils/diary'

let diary = {}
currentDate.value = dayjs().tz(timeZoneTrade.value).format("YYYY-MM-DD")

onBeforeMount(async () => {
    await (spinnerLoadingPage.value = true)
    await Promise.all([diaryDateInput(currentDate.value), useInitQuill(0), useInitQuill(1), useInitQuill(2)])
    await initDiaryJson()
    await getDiaryToEdit(itemToEditId.value)
    await sessionStorage.removeItem('editItemId');
    await (spinnerLoadingPage.value = false)
})

function diaryDateInput(param) {
    //console.log(" -> diaryDateInput param: " + param)
    diaryUpdate.dateUnix = dayjs.tz(param, timeZoneTrade.value).unix()
    diaryUpdate.date = dayjs(diaryUpdate.dateUnix * 1000).format("YYYY-MM-DD")
    diaryUpdate.dateDateFormat = new Date(diaryUpdate.date)
    console.log(" -> diaryDateUnix " + diaryUpdate.dateUnix + " and date " + diaryUpdate.date)
    //console.log("diaryUpdate " + JSON.stringify(diaryUpdate))
}

async function getDiaryToEdit(param) {
    if (!param) {
        return
    }
    diaryIdToEdit.value = param
    //console.log("diary to edit " + diaryIdToEdit.value)
    const parseObject = Parse.Object.extend("diaries");
    const query = new Parse.Query(parseObject);
    query.equalTo("objectId", param);
    const results = await query.first();
    if (results) {
        diary = JSON.parse(JSON.stringify(results)) //we start by using diary to show html. Then, for changing, we use diary
        //console.log(" Diary to edit " + JSON.stringify(diary))
        //console.log("diary.dateUnix "+diary.dateUnix)
        diaryUpdate.dateUnix = diary.dateUnix
        diaryUpdate.date = dayjs.unix(diary.dateUnix).format("YYYY-MM-DD")
        diaryUpdate.dateDateFormat = new Date(diaryUpdate.date)
        //console.log("diaryUpdate " + JSON.stringify(diaryUpdate))
        document.querySelector("#quillEditor0 .ql-editor").innerHTML = diary.journal.positive
        document.querySelector("#quillEditor1 .ql-editor").innerHTML = diary.journal.negative
        document.querySelector("#quillEditor2 .ql-editor").innerHTML = diary.journal.other
    } else {
        console.log(' -> No diary to edit')
        //alert("Query did not return any results")
    }
}

async function initDiaryJson(param) {
    return new Promise(async (resolve, reject) => {

        diaryUpdate.journal = {}

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
                    <input type="date" class="form-control"
                        v-bind:value="diaryUpdate.hasOwnProperty('date') ? diaryUpdate.date : diaryUpdate.date = currentDate"
                        v-on:input="diaryDateInput($event.target.value)" />
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
                    <button :disabled="!diaryButton" type="button" v-on:click="useUploadDiary()"
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