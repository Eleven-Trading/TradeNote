<script setup>
import { onBeforeMount, ref, onMounted, nextTick} from 'vue';
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import { imports, selectedItem, itemToEditId, currentDate, diaryUpdate, timeZoneTrade, diaryIdToEdit, diaryButton, tradeTags, tagInput, selectedTagIndex, showTagsList, availableTags, tags, countdownSeconds } from '../stores/globals';
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

onBeforeMount(async () => {
    await useGetTrades()
    await useInitPopover()
})

</script>
<template>
    <div class="row mt-2">
        <div>
            <div>
                <p>List of your latest imports. Please be careful when deleting imports, especially when you are swing trading. This can lead to unexpected behavior.</p>
                <p>When you delete an import, it will also delete your excursions. However, screenshots, tags, notes and satisfactions are not deleted.</p>
                <p>You can also manipulate your database directly using a MongoDB GUI or CLI.</p>
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
        </div>
    </div>
</template>