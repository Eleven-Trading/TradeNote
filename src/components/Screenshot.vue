<script setup>
import { selectedItem, modalDailyTradeOpen, pageId, tags } from '../stores/globals';
import { useSetupMarkerArea, useSelectedScreenshotFunction } from '../utils/screenshots';
import { useHourMinuteFormat, useTimeFormat, useEditItem, useCreatedDateFormat } from '../utils/utils';
import { useGetTagColor } from '../utils/daily';


const props = defineProps({
    screenshotData: Object,
    showTitle: Boolean,
    source: String,
    index: Number
})

//console.log(" -> Source " + props.source)

</script>

<template>
    <div class="row">
        <!-- HEADER / DATE & INFO -->
        <div v-if="props.source == 'fullScreen' || props.source == 'screenshots'" class="col-12 cardFirstLine">
            <div class="row">
                <div class="col">
                    <h5>{{ useCreatedDateFormat(props.screenshotData.dateUnix) }}</h5>
                </div>
                <div v-if="props.source == 'fullScreen'" class="col me-auto text-end" data-bs-theme="dark">
                    <button v-if="!modalDailyTradeOpen" type="button" class="btn-close" data-bs-dismiss="modal"
                        aria-label="Close"></button>
                    <button v-if="modalDailyTradeOpen" type="button" class="btn-close" data-bs-target="#tradesModal"
                        data-bs-toggle="modal"></button>
                </div>
            </div>
        </div>

        <!-- SUB HEADER -->
        <div class="col-12 mt-2">
            <div class="row">

                <!-- Left: info -->
                <div v-if="props.source != 'addScreenshot' && props.source != 'dailyModal'" class="col-6">
                    <span>{{ props.screenshotData.symbol }}</span><span v-if="props.screenshotData.side"
                        class="col mt-1">
                        | {{ props.screenshotData.side == 'SS' || props.screenshotData.side == 'BC' ? 'Short' :
            'Long' }}
                        | {{ useTimeFormat(props.screenshotData.dateUnix) }}</span>
                    <span v-else class="col mb-2"> | {{
            useHourMinuteFormat(props.screenshotData.dateUnix)
        }}</span>


                    <span v-for="tags in tags.filter(obj => obj.tradeId == props.screenshotData.name)"><span
                            v-if="tags.tags.length > 0"> | <span v-for="tag in tags.tags.slice(0, 2)" class="tag txt-small"
                                :style="useGetTagColor(tag.id)">{{
            tag.name
        }}
                            </span>
                            <span v-show="tags.tags.length > 2">+{{
            tags.tags.length
            - 2 }}</span></span></span>
                </div>

                <!-- Right: tools -->
                <div v-if="props.source != 'fullScreen'"
                    :class="[props.source == 'addScreenshot' || props.source == 'dailyModal' ? 'offset-6' : '', 'col-6 text-end']">

                    <!-- Expand / fullScreen screen -->
                    <i v-if="props.screenshotData.objectId && props.source != 'addScreenshot'"
                        class="uil uil-expand-arrows-alt pointerClass me-3" data-bs-toggle="modal"
                        data-bs-target="#fullScreenModal"
                        v-on:click="useSelectedScreenshotFunction(props.index, props.source, props.screenshotData)"></i>

                    <!-- Annotate -->
                    <i class="uil uil-image-edit pointerClass me-3"
                        v-on:click="useSetupMarkerArea(props.source, props.screenshotData)"></i>

                    <!-- Edit -->
                    <i v-if="props.source == 'screenshots'" class="uil uil-edit-alt pointerClass me-4"
                        v-on:click="useEditItem(props.screenshotData.objectId)"></i>

                    <!-- Delete -->
                    <i v-if="props.screenshotData.objectId && props.source != 'addScreenshot'"
                        v-on:click="selectedItem = props.screenshotData.objectId"
                        class="ps-2 uil uil-trash-alt popoverDelete pointerClass" data-bs-html="true"
                        data-bs-content="<div>Are you sure?</div><div class='text-center'><a type='button' class='btn btn-red btn-sm popoverYes'>Yes</a><a type='button' class='btn btn-outline-secondary btn-sm ms-2 popoverNo'>No</a></div>"
                        data-bs-toggle="popover" data-bs-placement="left"></i>
                </div>
            </div>
        </div>

    </div>

    <!-- SCREENSHOTS -->
    <div :class="[pageId === 'addScreenshot' ? 'imgContainerAddScreenshot' : 'imgContainer']">
        <img :id="props.screenshotData.objectId ? 'screenshotDiv-' + props.source + '-' + props.screenshotData.objectId : 'screenshotDiv-' + props.source + '-' + props.screenshotData.dateUnix"
            class="screenshotImg mt-3 img-fluid" v-bind:src="props.screenshotData.originalBase64" />
        <img class="overlayImg screenshotImg mt-3 img-fluid" v-bind:src="props.screenshotData.annotatedBase64" />

        <!--<img v-if="props.screenshotData.markersOnly" :id="props.screenshotData.objectId ? 'screenshotDiv-' + props.source + '-' + props.screenshotData.objectId : 'screenshotDiv-' + props.source + '-' + props.screenshotData.dateUnix" class="screenshotImg mt-3 img-fluid" v-bind:src="props.screenshotData.originalBase64" />

        <img :id="!props.screenshotData.markersOnly ? props.screenshotData.objectId ? 'screenshotDiv-' + props.source + '-' + props.screenshotData.objectId : 'screenshotDiv-' + props.source + '-' + props.screenshotData.dateUnix : ''"
            v-bind:class="[props.screenshotData.markersOnly ? 'overlayImg' : '', 'screenshotImg mt-3 img-fluid']"
            v-bind:src="props.screenshotData.annotatedBase64" />-->

        <!--<img v-if="props.screenshotData.markersOnly" class="screenshotImg mt-3 img-fluid"
            v-bind:src="props.screenshotData.originalBase64" />
        <img v-bind:class="[props.screenshotData.markersOnly ? 'overlayImg' : '', 'screenshotImg mt-3 img-fluid']"
            v-bind:src="props.screenshotData.annotatedBase64" />-->
    </div>
</template>
