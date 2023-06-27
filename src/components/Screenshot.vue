<script setup>
import { expandedScreenshot, selectedItem } from '../stores/globals';
import { useSetupMarkerArea, useExpandScreenshot } from '../utils/screenshots';
import { useHourMinuteFormat, useTimeFormat, useEditItem, useCreatedDateFormat } from '../utils/utils';

const props = defineProps({
    screenshotData: Object,
    showTitle: Boolean,
    source: String
})
console.log("source " + props.source)
</script>

<template>
    <div class="row">
        <div v-if="props.source == 'screenshots'" class="col-12 cardFirstLine d-flex align-items-center fw-bold mb-2">
            <h5>{{ useCreatedDateFormat(props.screenshotData.dateUnix) }}</h5>
        </div>
        <div v-if="props.showTitle" class="col">
            <span>{{ props.screenshotData.symbol }}</span><span v-if="props.screenshotData.side" class="col mt-1">
                | {{ props.screenshotData.side == 'SS' || props.screenshotData.side == 'BC' ? 'Short' :
                    'Long' }}
                | {{ useTimeFormat(props.screenshotData.dateUnix) }}</span>
            <span v-else class="col mb-2"> | {{
                useHourMinuteFormat(props.screenshotData.dateUnix)
            }}</span>

            <span>{{ props.screenshotData.patternName }}</span>

            <span>{{ props.screenshotData.mistakeName }}</span>
        </div>

        <div class="col mb-2 ms-auto text-end mt-2">
            <i class="uil uil-expand-arrows-alt pointerClass me-3"
                v-on:click="useExpandScreenshot(props.source, props.screenshotData)"></i>

            <i class="uil uil-image-edit pointerClass me-3"
                v-on:click="useSetupMarkerArea(props.source, props.screenshotData)"></i>

            <span v-if="props.source == 'screenshots'">
                <i class="uil uil-edit-alt pointerClass me-4" v-on:click="useEditItem(props.screenshotData.objectId)"></i>

                <i v-on:click="selectedItem = props.screenshotData.objectId"
                    class="ps-2 uil uil-trash-alt popoverDelete pointerClass" data-bs-html="true"
                    data-bs-content="<div>Are you sure?</div><div class='text-center'><a type='button' class='btn btn-red btn-sm popoverYes'>Yes</a><a type='button' class='btn btn-outline-secondary btn-sm ms-2 popoverNo'>No</a></div>"
                    data-bs-toggle="popover" data-bs-placement="left"></i>
            </span>
        </div>
    </div>


    <div class="imgContainer">
        <img :id="props.screenshotData.objectId ? 'screenshotDiv-' + props.source + '-' + props.screenshotData.objectId : 'screenshotDiv-' + props.source + '-' + props.screenshotData.dateUnix"
            class="screenshotImg mt-3 img-fluid" v-bind:src="props.screenshotData.originalBase64" />
        <img class="overlayImg screenshotImg mt-3 img-fluid" v-bind:src="props.screenshotData.annotatedBase64" />
    </div>
</template>