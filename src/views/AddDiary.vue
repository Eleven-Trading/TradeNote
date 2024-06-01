<script setup>
import { onBeforeMount } from 'vue';
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import { spinnerLoadingPage, itemToEditId, currentDate, diaryUpdate, timeZoneTrade, diaryIdToEdit, diaryButton } from '../stores/globals';
import { useInitQuill, useDateCalFormat } from '../utils/utils';
import { useUploadDiary } from '../utils/diary'

/* MODULES */
import Parse from 'parse/dist/parse.min.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
dayjs.extend(utc)
import isoWeek from 'dayjs/plugin/isoWeek.js'
dayjs.extend(isoWeek)
import timezone from 'dayjs/plugin/timezone.js'
dayjs.extend(timezone)
import duration from 'dayjs/plugin/duration.js'
dayjs.extend(duration)
import updateLocale from 'dayjs/plugin/updateLocale.js'
dayjs.extend(updateLocale)
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
dayjs.extend(localizedFormat)
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
dayjs.extend(customParseFormat)

let diary = {}
currentDate.value = dayjs().tz(timeZoneTrade.value).format("YYYY-MM-DD")

onBeforeMount(async () => {
    await (spinnerLoadingPage.value = true)
    await Promise.all([diaryDateInput(currentDate.value), useInitQuill("Diary")])
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
        document.querySelector("#quillEditorDiary .ql-editor").innerHTML = diary.diary
    } else {
        console.log(' -> No diary to edit')
        //alert("Query did not return any results")
    }
}

async function initDiaryJson(param) {
    return new Promise(async (resolve, reject) => {

        diaryUpdate.diary = {}

        resolve()
    })
}




</script>
<template>
    <SpinnerLoadingPage />
    <div class="row mt-2">
        <!-- ============ ADD Diary ============ -->
        <div>
            <div v-show="!spinnerLoadingPage">
                <div class="mt-3 input-group mb-3">
                    <input type="date" class="form-control"
                        v-bind:value="diaryUpdate.hasOwnProperty('date') ? diaryUpdate.date : diaryUpdate.date = currentDate"
                        v-on:input="diaryDateInput($event.target.value)" />
                </div>
                <div class="mt-2">
                    <div id="quillEditorDiary"></div>
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