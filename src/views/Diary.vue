<script setup>
import { onMounted, onBeforeMount } from 'vue'
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import NoData from '../components/NoData.vue';
import { spinnerLoadingPage, diaries, selectedItem, spinnerLoadMore, endOfList } from '../stores/globals';
import { useCheckVisibleScreen, useCreatedDateFormat, useEditItem, useInitPopover, useLoadMore } from '../utils/utils';
import { useGetDiaries } from '../utils/diary';

onBeforeMount(async () => {
    
})

onMounted(async () => {
    await useGetDiaries(true)
    useInitPopover()
    window.addEventListener('scroll', () => {
        let scrollTop = window.scrollY
        let visibleScreen = window.innerHeight
        let documentHeight = document.documentElement.scrollHeight
        let difference = documentHeight - (scrollTop + visibleScreen)

        if (difference <= 0) {
            if (!spinnerLoadMore.value && !spinnerLoadingPage.value && !endOfList.value) { //To avoid firing multiple times, make sure it's not loadin for the first time and that there is not already a loading more (spinner)
                useLoadMore()
            }
        }
    })
    useCheckVisibleScreen()
})
</script>

<template>
    <SpinnerLoadingPage />
    <div v-show="!spinnerLoadingPage" class="row mt-2 mb-2">
        <div v-if="diaries.length == 0">
            <NoData />
        </div>
        <div class="col-12">
            <div v-for="(itemDiary, index) in diaries" class="row mt-2">
                <div class="col-12">
                    <div class="dailyCard quill">
                        <div class="row">
                            <div class="col-12 cardFirstLine d-flex align-items-center fw-bold">
                                <div class="col-auto">{{ useCreatedDateFormat(itemDiary.dateUnix) }}</div>
                                <span class="col mb-2 ms-auto text-end">
                                    <i class="uil uil-edit-alt pointerClass"
                                        v-on:click="useEditItem(itemDiary.objectId)"></i>

                                    <i v-on:click="selectedItem = itemDiary.objectId"
                                        class="ps-2 uil uil-trash-alt popoverDelete pointerClass" data-bs-html="true"
                                        data-bs-content="<div>Are you sure?</div><div class='text-center'><a type='button' class='btn btn-red btn-sm popoverYes'>Yes</a><a type='button' class='btn btn-outline-secondary btn-sm ms-2 popoverNo'>No</a></div>"
                                        data-bs-toggle="popover" data-bs-placement="left"></i>
                                </span>
                            </div>
                            <div class="col-12">
                                <p v-html="itemDiary.diary"></p>
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