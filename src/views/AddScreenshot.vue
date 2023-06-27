<script setup>
import { onBeforeMount } from 'vue';
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import { currentDate, dateScreenshotEdited, editingScreenshot, itemToEditId, mistakes, patterns, setups, screenshot, spinnerLoadingPage, timeZoneTrade } from '../stores/globals';
import { useSaveScreenshot, useSetupImageUpload, useSetupMarkerArea } from '../utils/screenshots';
import { useDatetimeLocalFormat, useGetSelectedRange } from '../utils/utils';
import { useGetMistakes, useGetPatterns, useGetSetups, useTradeSetupChange } from '../utils/setups'

onBeforeMount(async () => {
    await (spinnerLoadingPage.value = true)
    await useGetSelectedRange()
    await Promise.all([useGetSetups(), useGetPatterns(), useGetMistakes()])
    await getScreenshotToEdit(itemToEditId.value)
    await sessionStorage.removeItem('editItemId');
    await (spinnerLoadingPage.value = false)
})
currentDate.value = dayjs().tz(timeZoneTrade.value).format("YYYY-MM-DD HH:mm")

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
        for (let index = 0; index < setups.length; index++) {
            const element = setups[index];
            if (element.tradeId == screenshot.name) {
                //console.log("element "+JSON.stringify(element))
                //console.log("pattern "+element.pattern.objectId)
                //console.log("mistake "+element.mistake.objectId)
                if (element.pattern != null) {
                    screenshot.pattern = element.pattern.objectId
                }
                if (element.mistake != null) {
                    screenshot.mistake = element.mistake.objectId
                }
            }


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
                    <!-- Patterns -->
                    <div class="col">
                        <select v-on:change="useTradeSetupChange($event.target.value, 'pattern')" class="form-select">
                            <option value='null' selected>Pattern</option>
                            <option v-for="item in patterns.filter(r => r.active == true)" v-bind:value="item.objectId"
                                v-bind:selected="item.objectId == screenshot.pattern">{{ item.name }}</option>
                        </select>
                    </div>
                    <!-- Mistakes -->
                    <div class="col">
                        <select v-on:change="useTradeSetupChange($event.target.value, 'mistake')" class="form-select">
                            <option value='null' selected>Mistake</option>
                            <option v-for="item in mistakes.filter(r => r.active == true)" v-bind:value="item.objectId"
                                v-bind:selected="item.objectId == screenshot.mistake">{{ item.name }}</option>
                        </select>
                    </div>

                </div>
            </div>
        </div>
        <div class="mt-3">
            <input type="file" @change="useSetupImageUpload" />
        </div>
        <div class="imgContainer">
            <img :id="'screenshotDiv-addScreenshot-'+screenshot.objectId" class="screenshotImg mt-3 img-fluid" v-bind:src="screenshot.originalBase64" />
            <img class="overlayImg screenshotImg mt-3 img-fluid"
                v-bind:src="screenshot.annotatedBase64" v-on:click="useSetupMarkerArea('addScreenshot')" />
        </div>
        <p class="fst-italic fw-lighter text-center" v-show="screenshot.originalBase64">
            <small>Click image to mark & annotate</small>
        </p>

        <div class="mt-3 mb-3">
            <button type="button" v-on:click="useSaveScreenshot" class="btn btn-success btn-sm">Submit</button>
        </div>
        <div class="mt-3">
            <button type="cancel" onclick="location.href = '/screenshots';"
                class="btn btn-outline-secondary btn-sm">Cancel</button>
        </div>
</div></template>