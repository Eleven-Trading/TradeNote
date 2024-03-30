<script setup>
import { onBeforeMount } from 'vue';
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import Screenshot from '../components/Screenshot.vue'
import { currentDate, dateScreenshotEdited, editingScreenshot, itemToEditId, screenshot, spinnerLoadingPage, timeZoneTrade, tradeTags, tagInput, selectedTagIndex, showTagsList, availableTags, tags } from '../stores/globals';
import { useSaveScreenshot, useSetupImageUpload } from '../utils/screenshots';
import { useDatetimeLocalFormat, useGetSelectedRange } from '../utils/utils';
import { useFilterSuggestions, useTradeTagsChange, useFilterTags, useToggleTagsDropdown, useGetTags, useGetAvailableTags, useGetTagInfo } from '../utils/daily';

onBeforeMount(async () => {
    await (spinnerLoadingPage.value = true)
    await useGetSelectedRange()
    await Promise.all([useGetTags(), useGetAvailableTags()])
    await getScreenshotToEdit(itemToEditId.value)
    await sessionStorage.removeItem('editItemId');
    await (spinnerLoadingPage.value = false)
})
currentDate.value = dayjs().tz(timeZoneTrade.value).format("YYYY-MM-DD HH:mm")
//console.log(" current page id " + pageId.value)
//console.log(" screenshot "+JSON.stringify(screenshot))
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
    //console.log(" screenshot "+JSON.stringify(screenshot))
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

        let findTags = tags.find(obj => obj.tradeId == screenshot.name)
        if (findTags) {
            findTags.tags.forEach(element => {
                for (let obj of availableTags) {
                    for (let tag of obj.tags) {
                        if (tag.id === element) {
                            let temp = {}
                            temp.id = tag.id
                            temp.name = tag.name
                            tradeTags.push(temp)
                        }
                    }
                }
            });
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
                    <div class="container-tags col">
                        <div class="form-control dropdown form-select" style="height: auto;">
                            <div style="display: flex; align-items: center; flex-wrap: wrap;">
                                <span v-for="(tag, index) in tradeTags" :key="index" class="tag txt-small"
                                    :style="{ 'background-color': useGetTagInfo(tag).groupColor }"
                                    @click="useTradeTagsChange('remove', index)">
                                    {{ tag.name }}<span class="remove-tag">×</span>
                                </span>

                                <input type="text" v-model="tagInput" @input="useFilterTags"
                                    @keydown.enter.prevent="useTradeTagsChange('add', tagInput)"
                                    @keydown.tab.prevent="useTradeTagsChange('add', tagInput)"
                                    class="form-control tag-input" placeholder="Add a tag">
                                <div class="clickable-area" v-on:click="useToggleTagsDropdown">
                                </div>
                            </div>
                        </div>

                        <ul id="dropdown-menu-tags" class="dropdown-menu-tags"
                            :style="[!showTagsList ? 'border: none;' : '']">
                            <span v-show="showTagsList" v-for="group in availableTags">
                                <h6 class="p-1 mb-0" :style="'background-color: ' + group.color + ';'"
                                    v-show="useFilterSuggestions(group.id).filter(obj => obj.id == group.id)[0].tags.length > 0">
                                    {{ group.name }}</h6>
                                <li v-for="(suggestion, index) in useFilterSuggestions(group.id).filter(obj => obj.id == group.id)[0].tags"
                                    :key="index" :class="{ active: index === selectedTagIndex }"
                                    @click="useTradeTagsChange('addFromDropdownMenu', suggestion)"
                                    class="dropdown-item dropdown-item-tags">
                                    <span class="ms-2">{{ suggestion.name }}</span>
                                </li>
                            </span>
                        </ul>
                    </div>



                </div>
            </div>
        </div>
        <div class="mt-3">
            <input type="file" @change="useSetupImageUpload" />
        </div>
        <Screenshot v-if="screenshot.originalBase64" :screenshot-data="screenshot" source="addScreenshot" />

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
    </div>
</template>