<script setup>
import { setups, pageId } from '../stores/globals';
import { useCreatedDateFormat, useHourMinuteFormat, useTimeFormat } from '../utils/utils';

const props = defineProps({
    screenshotData: Object
})

</script>
<template>
    <div class="col-12">
        <div>{{ useCreatedDateFormat(props.screenshotData.dateUnix) }}
            <span class="ms-2">- {{ props.screenshotData.symbol }}
                <span v-if="props.screenshotData.side"> | {{ props.screenshotData.side == 'SS' || props.screenshotData.side
                    == 'BC' ?
                    'Short' :
                    'Long' }} | {{ useTimeFormat(props.screenshotData.dateUnix) }}</span>
                <span v-else class="col mb-2"> | {{ useHourMinuteFormat(props.screenshotData.dateUnix) }}</span>
                <span
                    v-if="setups.findIndex(obj => obj.tradeId == props.screenshotData.name) != -1 && setups[setups.findIndex(obj => obj.tradeId == props.screenshotData.name)].pattern != null">
                    | {{ setups[setups.findIndex(obj =>
                        obj.tradeId == props.screenshotData.name)].pattern.name }}</span>
            </span>
        </div>
    </div>
    <div class="imgContainer">
        <img v-if="props.screenshotData.markersOnly" class="screenshotImg mt-3 img-fluid"
            v-bind:src="props.screenshotData.originalBase64" />
        <img v-bind:class="[props.screenshotData.markersOnly ? 'overlayImg' : '', 'screenshotImg mt-3 img-fluid']"
            v-bind:src="props.screenshotData.annotatedBase64" />
        <div v-if="pageId == 'screenshots'">
            <button class="carousel-control-prev" type="button" data-bs-target="#setupsCarousel" data-bs-slide="prev"><i
                    class="fa fa-chevron-left"></i></button>
            <button class="carousel-control-next" type="button" data-bs-target="#setupsCarousel" data-bs-slide="next"><i
                    class="fa fa-chevron-right"></i></button>
        </div>
    </div>
</template>