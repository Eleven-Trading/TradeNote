<script setup>
import { onBeforeMount } from 'vue';
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import Screenshot from '../components/Screenshot.vue'
import { currentDate, dateScreenshotEdited, editingScreenshot, itemToEditId, screenshot, spinnerLoadingPage, timeZoneTrade, pageId } from '../stores/globals';
import { useSaveScreenshot, useSetupImageUpload} from '../utils/screenshots';
import { useDatetimeLocalFormat, useGetSelectedRange } from '../utils/utils';

onBeforeMount(async () => {
    await (spinnerLoadingPage.value = true)
    await useGetSelectedRange()
    await getScreenshotToEdit(itemToEditId.value)
    await sessionStorage.removeItem('editItemId');
    await (spinnerLoadingPage.value = false)
})
currentDate.value = dayjs().tz(timeZoneTrade.value).format("YYYY-MM-DD HH:mm")
console.log(" current page id "+pageId.value)
let setupType = [{
    value: null,
    label: "Type"
},
{
    value: "setup",
    label: "General Setup"
},
{
    value: "entry",
    label: "Trade Entry"
}
]
let entrySide = [{
    value: null,
    label: "Side"
},
{
    value: "SS",
    label: "Short"
},
{
    value: "B",
    label: "Buy"
}
]

function screenshotUpdateDate(event) {
    if (editingScreenshot.value) {
        dateScreenshotEdited.value = true
    }
    screenshot.date = event
    //console.log("screenshot date (local time, i.e. New York time) " + this.screenshot.date)
    screenshot.dateUnix = dayjs.tz(screenshot.date, timeZoneTrade.value).unix()
    //console.log("unix " + dayjs.tz(this.screenshot.date, this.timeZoneTrade).unix()) // we SPECIFY that it's New york time
}

async function getScreenshotToEdit(param) {
    console.log(" -> Getting screenshot to edit " + param)
    if (!param) {
        return
    }
    editingScreenshot.value = true

    //console.log("screenshot to edit " + screenshotIdToEdit.value)
    const parseObject = Parse.Object.extend("screenshots");
    const query = new Parse.Query(parseObject);
    query.equalTo("objectId", param);
    const results = await query.first();
    if (results) {
        for (let key in screenshot) delete screenshot[key]
        Object.assign(screenshot, JSON.parse(JSON.stringify(results)))
        //console.log(" -> Screenshot to edit "+JSON.stringify(screenshot))
        if (screenshot.side) {
            screenshot.type = "entry"
        } else {
            screenshot.type = "setup"
        }


    } else {
        console.log(' -> No screenshot to edit')
        //alert("Query did not return any results")
    }
}

</script>
<template>
    <SpinnerLoadingPage />
    <div v-show="!spinnerLoadingPage">
        <div class="row mt-3 mb-3">
            <div class="col-12 mb-2">
                <div class="row">
                    <div class="col">
                        <select v-model="screenshot.type" class="form-select">
                            <option v-for="item in setupType" v-bind:value="item.value">{{ item.label }}</option>
                        </select>
                    </div>
                    <div class="col">
                        <input type="datetime-local" v-bind:step="screenshot.type == 'setup' ? '' : '1'"
                            class="form-control"
                            v-bind:value="screenshot.hasOwnProperty('dateUnix') ? useDatetimeLocalFormat(screenshot.dateUnix) : currentDate"
                            v-on:input="screenshotUpdateDate($event.target.value)" />
                    </div>
                    <div class="col">
                        <input type="text" class="form-control"
                            v-bind:value="screenshot.hasOwnProperty('symbol') ? screenshot.symbol : ''"
                            v-on:input="screenshot.symbol = $event.target.value" placeholder="Symbol" />
                    </div>

                </div>
            </div>
            <div class="col-12">
                <div class="row">

                    <div v-if="screenshot.type == 'entry'" class="col">
                        <select v-model="screenshot.side" class="form-select">
                            <option v-for="item in entrySide" v-bind:value="item.value">{{ item.label }}</option>
                        </select>
                    </div>

                    <!-- Tags -->
                    

                </div>
            </div>
        </div>
        <div class="mt-3">
            <input type="file" @change="useSetupImageUpload" />
        </div>
        <Screenshot v-if="screenshot.originalBase64" :screenshot-data="screenshot" source="addScreenshot"/>
    
        <p class="fst-italic fw-lighter text-center" v-show="screenshot.originalBase64">
            <small>Click on <i class="uil uil-image-edit ms-2 me-2"></i> to mark & annotate</small>
        </p>

        <div class="mt-3 mb-3">
            <button type="button" v-on:click="useSaveScreenshot" class="btn btn-success btn-sm">Submit</button>
        </div>
        <div class="mt-3">
            <button type="cancel" onclick="location.href = '/screenshots';"
                class="btn btn-outline-secondary btn-sm">Cancel</button>
        </div>
</div></template>