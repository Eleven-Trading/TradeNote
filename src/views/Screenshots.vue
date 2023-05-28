<script setup>
import { ref, reactive, onBeforeMount, onMounted } from 'vue'
import NoData from '../components/NoData.vue';
import Filters from '../components/Filters.vue';
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import { pageId, patternsMistakes, selectedItem, screenshots, spinnerLoadMore, spinnerLoadingPage, spinnerLoadingPageText } from '../stores/globals';
import { useCreatedDateFormat, useEditItem, useHourMinuteFormat, useInitPopover, useTimeFormat, useMountScreenshots } from '../utils/utils';
import { useGetScreenshots} from '../utils/screenshots';
import { endOfList } from '../stores/globals';

let expandedScreenshot = ref(null)

onBeforeMount(async () => {
    useMountScreenshots()
})

onMounted(async () => {
    

    window.addEventListener('scroll', () => {
        let scrollTop = window.scrollY
        let visibleScreen = window.innerHeight
        let documentHeight = document.documentElement.scrollHeight
        let difference = documentHeight - (scrollTop + visibleScreen)

        if (difference <= 0) {

            if (!spinnerLoadMore.value && !spinnerLoadingPage.value && !endOfList.value && expandedScreenshot.value == null) { //To avoid firing multiple times, make sure it's not loadin for the first time and that there is not already a loading more (spinner)
                console.log("  --> Loading more")
                useGetScreenshots()
                spinnerLoadMore.value = true
            }
        }
    })
})

</script>

<template>
    <SpinnerLoadingPage />
    <div v-show="!spinnerLoadingPage" class="mt-2 mb-2">
        <div v-if="screenshots.length == 0">
            <NoData />
        </div>
        <div v-else>
            <Filters />
        </div>
        <div class="row">
            <div v-if="!expandedScreenshot" v-for="(screenshot, index) in screenshots" class="col-12 col-xl-6 mt-2">
                <div class="dailyCard" v-bind:id="screenshot.objectId">
                    <div class="row">
                        <div class="col-12 cardFirstLine d-flex align-items-center fw-bold">
                            <div class="col-auto">{{ useCreatedDateFormat(screenshot.dateUnix) }}</div>
                        </div>
                        <div class="col-12">
                            <div class="row mt-2 diaryRow">
                                <span class="col mb-2 txt-small">{{ screenshot.symbol }}
                                    <span v-if="screenshot.side"> | {{ screenshot.side == 'SS' || screenshot.side ==
                                        'BC' ?
                                        'Short'
                                        : 'Long' }} | {{ useTimeFormat(screenshot.dateUnix) }}</span>
                                    <span v-else class="col mb-2"> | {{ useHourMinuteFormat(screenshot.dateUnix)
                                    }}</span>
                                    <span v-if="patternsMistakes.findIndex(obj => obj.tradeId == screenshot.name) != -1">
                                        <span
                                            v-if="patternsMistakes[patternsMistakes.findIndex(obj => obj.tradeId == screenshot.name)].hasOwnProperty('pattern') && patternsMistakes[patternsMistakes.findIndex(obj => obj.tradeId == screenshot.name)].pattern != null && patternsMistakes[patternsMistakes.findIndex(obj => obj.tradeId == screenshot.name)].pattern.hasOwnProperty('name')">
                                            | {{ patternsMistakes[patternsMistakes.findIndex(obj =>
                                                obj.tradeId == screenshot.name)].pattern.name }}</span>

                                        <span
                                            v-if="patternsMistakes[patternsMistakes.findIndex(obj => obj.tradeId == screenshot.name)].hasOwnProperty('mistake') && patternsMistakes[patternsMistakes.findIndex(obj => obj.tradeId == screenshot.name)].mistake != null && patternsMistakes[patternsMistakes.findIndex(obj => obj.tradeId == screenshot.name)].mistake.hasOwnProperty('name')">
                                            | {{ patternsMistakes[patternsMistakes.findIndex(obj =>
                                                obj.tradeId == screenshot.name)].mistake.name }}</span></span>
                                </span>
                                <span class="col mb-2 ms-auto text-end">
                                    <i class="uil uil-expand-arrows-alt pointerClass me-4"
                                        v-on:click="expandedScreenshot = screenshot.objectId"></i>

                                    <i class="uil uil-edit-alt editItem pointerClass"
                                        v-on:click="useEditItem(screenshot.objectId)"></i>

                                    <i v-on:click="selectedItem = screenshot.objectId"
                                        class="ps-2 uil uil-trash-alt popoverDelete pointerClass" data-bs-html="true"
                                        data-bs-content="<div>Are you sure?</div><div class='text-center'><a type='button' class='btn btn-red btn-sm popoverYes'>Yes</a><a type='button' class='btn btn-outline-secondary btn-sm ms-2 popoverNo'>No</a></div>"
                                        data-bs-toggle="popover" data-bs-placement="left"></i>
                                </span>
                            </div>
                            <div class="">
                                <!--<img v-bind:id="screenshot.objectId" class="setupEntryImg mt-3 img-fluid" v-bind:src="screenshot.annotated.url"/>-->
                                <img class="setupEntryImg mt-3 img-fluid" v-bind:src="screenshot.annotatedBase64" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Load more spinner -->
        <div v-if="spinnerLoadMore" class="d-flex justify-content-center mt-3">
            <div class="spinner-border text-blue" role="status"></div>
        </div>
        <div v-if="expandedScreenshot">
            <div class="row">
                <i class="col ms-auto text-end uil uil-times pointerClass" v-on:click="expandedScreenshot = null"></i>
            </div>
            <div id="setupsCarousel" class="carousel slide">
                <div class="carousel-inner">
                    <div v-for="(screenshot, index) in screenshots"
                        v-bind:class="[expandedScreenshot === screenshot.objectId ? 'active' : '', 'carousel-item']">
                        <img class="d-block w-100" v-bind:src="screenshot.annotatedBase64">
                        <div class="carousel-caption d-none d-md-block">
                            <h5>{{ useCreatedDateFormat(screenshot.dateUnix) }}</h5>
                            <p>{{ screenshot.symbol }}
                                <span v-if="screenshot.side"> | {{ screenshot.side == 'SS' || screenshot.side == 'BC' ?
                                    'Short' :
                                    'Long' }} | {{ useTimeFormat(screenshot.dateUnix) }}</span>
                                <span v-else class="col mb-2"> | {{ useHourMinuteFormat(screenshot.dateUnix) }}</span>
                                <span
                                    v-if="patternsMistakes.findIndex(obj => obj.tradeId == screenshot.name) != -1 && patternsMistakes[patternsMistakes.findIndex(obj => obj.tradeId == screenshot.name)].pattern.name != null">
                                    | {{ patternsMistakes[patternsMistakes.findIndex(obj =>
                                        obj.tradeId == screenshot.name)].pattern.name }}</span>
                            </p>
                        </div>
                    </div>
                </div>
                <button class="carousel-control-prev" type="button" data-bs-target="#setupsCarousel"
                    data-bs-slide="prev"></button>
                <button class="carousel-control-next" type="button" data-bs-target="#setupsCarousel"
                    data-bs-slide="next"></button>
            </div>
        </div>

    </div>
</template>