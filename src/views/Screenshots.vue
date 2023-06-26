<script setup>
import { ref, onBeforeMount, onMounted } from 'vue'
import NoData from '../components/NoData.vue';
import Filters from '../components/Filters.vue';
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import { setups, selectedItem, screenshots, spinnerLoadMore, spinnerLoadingPage, expandedScreenshot } from '../stores/globals';
import { useCreatedDateFormat, useEditItem, useHourMinuteFormat, useTimeFormat, useMountScreenshots, useCheckVisibleScreen, useLoadMore } from '../utils/utils';
import { endOfList } from '../stores/globals';
import { useSetupMarkerArea } from '../utils/screenshots'

onBeforeMount(async () => {

})

onMounted(async () => {
    await useMountScreenshots()
    window.addEventListener('scroll', () => {
        let scrollFromTop = window.scrollY
        let visibleScreen = (window.innerHeight + 200) // adding 200 so that loads before getting to bottom
        let documentHeight = document.documentElement.scrollHeight
        let difference = documentHeight - (scrollFromTop + visibleScreen)
        //console.log("scroll top "+scrollFromTop)
        //console.log("visible screen "+visibleScreen)
        //console.log("documentHeight "+documentHeight)
        //console.log("difference "+difference)
        if (difference <= 0) {

            if (!spinnerLoadMore.value && !spinnerLoadingPage.value && !endOfList.value && expandedScreenshot.value == null) { //To avoid firing multiple times, make sure it's not loadin for the first time and that there is not already a loading more (spinner)
                useLoadMore()
            }
        }
    })
    useCheckVisibleScreen()

})

</script>

<template>
    <SpinnerLoadingPage />
    <div v-show="!spinnerLoadingPage" class="mt-2 mb-2">
        <Filters />
        <div v-if="screenshots.length == 0">
            <NoData />
        </div>
        <div class="row">
            <div v-if="!expandedScreenshot" v-for="(itemScreenshot, index) in screenshots" class="col-12 col-xl-6 mt-2">
                <div class="dailyCard" v-bind:id="itemScreenshot.objectId">
                    <div class="row">
                        <div class="col-12 cardFirstLine d-flex align-items-center fw-bold">
                            <div class="col-auto">{{ useCreatedDateFormat(itemScreenshot.dateUnix) }}</div>
                        </div>
                        <div class="col-12">
                            <div class="row mt-2 diaryRow">
                                <span class="col mb-2 txt-small">{{ itemScreenshot.symbol }}
                                    <span v-if="itemScreenshot.side"> | {{ itemScreenshot.side == 'SS' || itemScreenshot.side ==
                                        'BC' ?
                                        'Short'
                                        : 'Long' }} | {{ useTimeFormat(itemScreenshot.dateUnix) }}</span>
                                    <span v-else class="col mb-2"> | {{ useHourMinuteFormat(itemScreenshot.dateUnix)
                                    }}</span>
                                    <span>{{ itemScreenshot.patternName }}</span>
                                    <span>{{ itemScreenshot.mistakeName }}</span>

                                </span>
                                <span class="col mb-2 ms-auto text-end">
                                    <i class="uil uil-expand-arrows-alt pointerClass me-3"
                                        v-on:click="expandedScreenshot = itemScreenshot.objectId"></i>

                                    <i class="uil uil-image-edit pointerClass me-3" v-on:click="useSetupMarkerArea(itemScreenshot, index)"></i>

                                    <i class="uil uil-edit-alt pointerClass me-4"
                                        v-on:click="useEditItem(itemScreenshot.objectId)"></i>
                                    <i v-on:click="selectedItem = itemScreenshot.objectId"
                                        class="ps-2 uil uil-trash-alt popoverDelete pointerClass" data-bs-html="true"
                                        data-bs-content="<div>Are you sure?</div><div class='text-center'><a type='button' class='btn btn-red btn-sm popoverYes'>Yes</a><a type='button' class='btn btn-outline-secondary btn-sm ms-2 popoverNo'>No</a></div>"
                                        data-bs-toggle="popover" data-bs-placement="left"></i>
                                </span>
                            </div>
                            <div class="imgContainer">
                                <img v-bind:id="'screenshotDiv' + itemScreenshot.objectId " v-if="itemScreenshot.markersOnly" class="screenshotImg mt-3 img-fluid"
                                    v-bind:src="itemScreenshot.originalBase64" />
                                <img v-bind:class="[itemScreenshot.markersOnly ? 'overlayImg' : '', 'screenshotImg mt-3 img-fluid']"
                                    v-bind:src="itemScreenshot.annotatedBase64" />
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
    </div>
</template>