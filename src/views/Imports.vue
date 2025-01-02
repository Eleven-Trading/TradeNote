<script setup>
import { onBeforeMount, ref, onMounted, nextTick } from 'vue';
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import { imports, selectedItem, itemToEditId, currentDate, diaryUpdate, timeZoneTrade, diaryIdToEdit, diaryButton, tradeTags, tagInput, selectedTagIndex, showTagsList, availableTags, tags, countdownSeconds, selectedBroker, brokers } from '../stores/globals';
import { useInitQuill, useDateCalFormat, useInitPopover } from '../utils/utils';
import { useUploadDiary } from '../utils/diary'
import { useFilterSuggestions, useTradeTagsChange, useFilterTags, useToggleTagsDropdown, useGetTags, useGetAvailableTags, useGetTagInfo } from '../utils/daily';
import { useGetTrades } from '../utils/trades';

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


let syncActiveBrokers = ref([])
let autoSyncInputs = ref({})

onBeforeMount(async () => {
    await useGetTrades()
    await useInitPopover()
    syncActiveBrokers.value = brokers.filter(f => f.autoSync.active)
    if (!syncActiveBrokers.value.includes(localStorage.getItem('selectedBroker'))) inputChooseBroker(syncActiveBrokers.value[0].value)

})

const selectedTab = "manageTab"

const tabs = [
    {
        id: "manageTab",
        label: "Manage Imports",
        target: "#manageNav"
    },
    /*{
        id: "syncImpTab",
        label: "Auto-Sync Imports",
        target: "#syncImpNav"
    },
    {
        id: "syncExcTab",
        label: "Auto-Sync Excursions",
        target: "#syncExcNav"
    }*/
]


function inputChooseBroker(param) {
    localStorage.setItem('selectedBroker', param)
    selectedBroker.value = param
}


</script>
<template>
    <div class="row mt-2">
        <div>
            <nav>
                <div class="nav nav-tabs mb-2" id="nav-tab" role="tablist">
                    <button v-for="tab in tabs" :key="tab.id"
                        :class="'nav-link ' + (selectedTab == tab.id ? 'active' : '')" :id="tab.id" data-bs-toggle="tab"
                        :data-bs-target="tab.target" type="button" role="tab" aria-controls="nav-overview"
                        aria-selected="true">{{ tab.label }}</button>
                </div>
            </nav>
            <div class="tab-content" id="nav-tabContent">
                <div v-bind:class="'tab-pane fade ' + (selectedTab == 'manageTab' ? 'active show' : '')" id="manageNav">
                    <p>Please be careful when deleting imports, especially when you are swing trading, as it can lead to
                        unexpected behavior.</p>
                    <p>When you delete an import, it will also delete your excursions. However, screenshots, tags, notes
                        and
                        satisfactions are not deleted.</p>
                    <p>You can also manage your database using a MongoDB GUI or CLI.</p>
                    <table class="table">
                        <thead>
                        </thead>
                        <tbody>
                            <tr v-for="(data, index)  in imports">
                                <td>{{ useDateCalFormat(data.dateUnix) }}</td>
                                <td class="text-end">
                                    <i :id="data.dateUnix" v-on:click="selectedItem = data.dateUnix"
                                        class="ps-2 uil uil-trash-alt popoverDelete pointerClass" data-bs-html="true"
                                        data-bs-content="<div>Are you sure?</div><div class='text-center'><a type='button' class='btn btn-red btn-sm popoverYes'>Yes</a><a type='button' class='btn btn-outline-secondary btn-sm ms-2 popoverNo'>No</a></div>"
                                        data-bs-toggle="popover" data-bs-placement="left"></i>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                
                <div v-bind:class="'tab-pane fade ' + (selectedTab == 'syncImpTab' ? 'active show' : '')"
                    id="syncImpNav">
                    Work in progress
                    <div class="form-floating">
                        <select v-on:input="inputChooseBroker($event.target.value)" class="form-select">
                            <option v-for="item in syncActiveBrokers" v-bind:value="item.value"
                                v-bind:selected="item.value == selectedBroker">
                                {{ item.label }}</option>
                        </select>
                        <label for="floatingSelect">Select your broker or trading platform</label>
                    </div>
                    <p class="mt-2" v-show="selectedBroker">
                        Supported asset types: <span
                            v-for="(item, index) in brokers.filter(f => f.value == selectedBroker)[0].assetTypes">{{
                                item }}<span
                                v-show="brokers.filter(f => f.value == selectedBroker)[0].assetTypes.length > 1 && (index + 1) < brokers.filter(f => f.value == selectedBroker)[0].assetTypes.length">,
                            </span></span>
                    </p>
                    <p class="mt-2" v-show="selectedBroker">Instructions
                    <ul v-for="instruction in brokers.filter(f => f.value == selectedBroker)[0].autoSync.instructions">
                        <li v-html="instruction"></li>
                    </ul>
                    </p>

                    <div class="form-floating mb-2 w-25"
                        v-for="input in brokers.filter(f => f.value == selectedBroker)[0].autoSync.inputs">
                        <input id="floatingInput" type="text" class="form-control" v-model="autoSyncInputs[input.value]"
                            placeholder="" />
                        <label for="floatingInput">{{ input.label }}</label>

                    </div>
                
                </div>
                               
                
                <div v-bind:class="'tab-pane fade ' + (selectedTab == 'syncExcTab' ? 'active show' : '')"
                    id="syncExcNav">
                    Work in progress
                </div>
            </div>
        </div>
    </div>
</template>