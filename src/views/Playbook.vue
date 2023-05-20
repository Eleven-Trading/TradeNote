<script setup>
import { ref, reactive, onBeforeMount, onMounted } from 'vue'
import NoData from '../components/NoData.vue';
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import { useCreatedDateFormat, useEditItem, useInitPopover } from '../utils/utils';
import { playbooks, queryLimit, selectedItem, spinnerLoadingPage } from '../stores/globals';
import { useGetPlaybooks } from '../utils/playbooks';

onBeforeMount(async () => {
    await useGetPlaybooks()
    await useInitPopover()
})

</script>

<template>
    <DashboardLayout>
        <SpinnerLoadingPage />
        <div class="row mt-2 mb-2">
            <div v-if="playbooks.length == 0">
                <NoData />
            </div>
            <div class="col-12">
                <div v-for="(playbook, index) in playbooks" class="row mt-2">
                    <div class="col-12">
                        <div class="dailyCard quill">
                            <div class="row">
                                <div class="col-12 cardFirstLine d-flex align-items-center fw-bold">
                                    <div class="col-auto">{{ useCreatedDateFormat(playbook.dateUnix) }}</div>
                                    <span class="col mb-2 ms-auto text-end">
                                        <i class="uil uil-edit-alt editItem pointerClass"
                                            v-on:click="useEditItem(playbook.objectId)"></i>

                                        <i v-on:click="selectedItem = playbook.objectId"
                                            class="ps-2 uil uil-trash-alt popoverDelete pointerClass" data-bs-html="true"
                                            data-bs-content="<div>Are you sure?</div><div class='text-center'><a type='button' class='btn btn-red btn-sm popoverYes'>Yes</a><a type='button' class='btn btn-outline-secondary btn-sm ms-2 popoverNo'>No</a></div>"
                                            data-bs-toggle="popover" data-bs-placement="left"></i>

                                    </span>
                                </div>
                                <p class="mt-3">
                                    <span v-html="playbook.playbook"></span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- end dashboard-->

        </div>
    </DashboardLayout>
</template>