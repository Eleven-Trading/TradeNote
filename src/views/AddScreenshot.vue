<script setup>
import { onBeforeMount } from 'vue';
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import { currentDate, dateScreenshotEdited, editingScreenshot, itemToEditId, mistakes, patterns, patternsMistakes, setup, spinnerLoadingPage } from '../stores/globals';
import { useGetScreenshots, useSaveScreenshot, useSetupImageUpload, useSetupMarkerArea } from '../utils/screenshots';
import { useDatetimeLocalFormat } from '../utils/utils';
import { useGetMistakes, useGetPatterns, useGetPatternsMistakes, useTradeSetupChange } from '../utils/patternsMistakes'

onBeforeMount(async () => {
    await (spinnerLoadingPage.value = true)
    //await useGetScreenshots()
    await Promise.all([getScreenshotToEdit(itemToEditId.value), useGetPatternsMistakes(), useGetPatterns(), useGetMistakes()])
    await sessionStorage.removeItem('editItemId');
    await (spinnerLoadingPage.value = false)
})

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
    setup.date = event
    //console.log("setup date (local time, i.e. New York time) " + this.setup.date)
    setup.dateUnix = dayjs.tz(this.setup.date, this.tradeTimeZone).unix()
    //console.log("unix " + dayjs.tz(this.setup.date, this.tradeTimeZone).unix()) // we SPECIFY that it's New york time
}

async function getScreenshotToEdit(param) {
    if (!param) {
        return
    }
    editingScreenshot.value = true

    //console.log("setup to edit " + screenshotIdToEdit.value)
    const parseObject = Parse.Object.extend("setupsEntries");
    const query = new Parse.Query(parseObject);
    query.equalTo("objectId", param);
    const results = await query.first();
    if (results) {
        for (let key in setup) delete setup[key]
        Object.assign(setup, JSON.parse(JSON.stringify(results)))

        //console.log(" -> Setup of screenshot to edit "+JSON.stringify(setup))
        if (setup.side) {
            setup.type = "entry"
        } else {
            setup.type = "setup"
        }

        let index = patternsMistakes.findIndex(obj => obj.tradeId == patternsMistakes.name)

        if (index != -1) {
            if (patternsMistakes[index].hasOwnProperty('pattern') && patternsMistakes[index].pattern != null && patternsMistakes[index].pattern != undefined && patternsMistakes[index].pattern.hasOwnProperty('objectId')) patternsMistakes.pattern = patternsMistakes[index].pattern.objectId

            if (patternsMistakes[index].hasOwnProperty('mistake') && patternsMistakes[index].mistake != null && patternsMistakes[index].mistake != undefined && patternsMistakes[index].mistake.hasOwnProperty('objectId')) patternsMistakes.mistake = patternsMistakes[index].mistake.objectId

            //updating patterns and mistakes used in dailyMixin
            tradeSetup.value.pattern = tradeSetup.value.pattern
            tradeSetup.value.mistake = tradeSetup.value.mistake
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
                        <select v-model="setup.type" class="form-select">
                            <option v-for="item in setupType" v-bind:value="item.value">{{ item.label }}</option>
                        </select>
                    </div>
                    <div class="col">
                        <input type="datetime-local" v-bind:step="setup.type == 'setup' ? '' : '1'" class="form-control"
                            v-bind:value="setup.hasOwnProperty('dateUnix') ? useDatetimeLocalFormat(setup.dateUnix) : currentDate"
                            v-on:input="screenshotUpdateDate($event.target.value)" />
                    </div>
                    <div class="col">
                        <input type="text" class="form-control"
                            v-bind:value="setup.hasOwnProperty('symbol') ? setup.symbol : ''"
                            v-on:input="setup.symbol = $event.target.value" placeholder="Symbol" />
                    </div>

                </div>
            </div>
            <div class="col-12">
                <div class="row">

                    <div v-if="setup.type == 'entry'" class="col">
                        <select v-model="setup.side" class="form-select">
                            <option v-for="item in entrySide" v-bind:value="item.value">{{ item.label }}</option>
                        </select>
                    </div>
                    <!-- Patterns -->
                    <div class="col">
                        <select v-on:change="useTradeSetupChange($event.target.value, 'pattern')" class="form-select">
                            <option value='null' selected>Pattern</option>
                            <option v-for="item in patterns.filter(r => r.active == true)" v-bind:value="item.objectId"
                                v-bind:selected="item.objectId == setup.pattern">{{ item.name }}</option>
                        </select>
                    </div>
                    <!-- Mistakes -->
                    <div class="col">
                        <select v-on:change="useTradeSetupChange($event.target.value, 'mistake')" class="form-select">
                            <option value='null' selected>Mistake</option>
                            <option v-for="item in mistakes.filter(r => r.active == true)" v-bind:value="item.objectId"
                                v-bind:selected="item.objectId == setup.mistake">{{ item.name }}</option>
                        </select>
                    </div>

                </div>
            </div>
        </div>
        <div class="mt-3">
            <input type="file" @change="useSetupImageUpload" />
        </div>
        <div class="mt-3" id="imagePreview"
            style="position: relative; display: flex; flex-direction: column; align-items: center; padding-top: 50px;">
            <img id="setupDiv" v-bind:src="setup.originalBase64" style="position: relative;" v-bind:key="renderData"
                crossorigin="anonymous" />
            <img v-bind:src="setup.annotatedBase64" style="position: absolute;" v-on:click="useSetupMarkerArea()" />
        </div>
        <p class="fst-italic fw-lighter text-center" v-show="setup.originalBase64">
            <small>Click image to mark & annotate</small>
        </p>

        <div class="mt-3 mb-3">
            <button type="button" v-on:click="useSaveScreenshot" class="btn btn-success btn-sm">Submit</button>
        </div>
        <div class="mt-3">
            <button type="cancel" onclick="location.href = '/screenshots';"
                class="btn btn-outline-secondary btn-sm">Cancel</button>
        </div>
    </div>
</template>