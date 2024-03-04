<script setup>
import { ref, reactive, onBeforeMount, onMounted } from 'vue'
import NoData from '../components/NoData.vue';
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import { useCreatedDateFormat, useEditItem, useInitPopover, useUpdateLegacy, useGetLegacy } from '../utils/utils';
import { availableTags, playbooks, queryLimit, selectedItem, spinnerLoadingPage, tradeTags, legacy } from '../stores/globals';
import { useGetPlaybooks } from '../utils/playbooks';
import { useGetAvailableTags, useUpdateAvailableTags, useUpdateTags, useFindHighestIdNumber, useFindHighestIdNumberTradeTags } from '../utils/daily';

onBeforeMount(async () => {
    await useGetPlaybooks()
    await useInitPopover()
})

const legacySetups = async (param) => {
    return new Promise(async (resolve, reject) => {
        console.log("\nLEGACY SETUPS")

        const updateAvailableTagsWithPatterns = async () => {
            return new Promise(async (resolve, reject) => {
                console.log("\nUpdate Available Tags With Patterns")
                const parseObject = Parse.Object.extend("patterns");
                const query = new Parse.Query(parseObject);
                const results = await query.find();
                if (results.length > 0) {
                    for (let i = 0; i < results.length; i++) {
                        const object = results[i];
                        console.log(" -> Object id " + object.id)

                        const highestIdNumberAvailableTags = useFindHighestIdNumber(availableTags);
                        const highestIdNumberTradeTags = useFindHighestIdNumberTradeTags(tradeTags);

                        function chooseHighestNumber(num1, num2) {
                            return Math.max(num1, num2);
                        }

                        // Example usage:
                        const highestIdNumber = chooseHighestNumber(highestIdNumberAvailableTags, highestIdNumberTradeTags);

                        //console.log(" -> Highest tag id number " + highestIdNumber);
                        let temp = {}
                        temp.id = "tag_" + (highestIdNumber + 1).toString()
                        temp.name = object.get("name")
                        tradeTags.push(temp)
                    }
                    resolve()
                } else {
                    alert("Updating trade tags did not return any results")
                }
            })
        }

        const updateAvailableTagsWithMistakes = async () => {
            return new Promise(async (resolve, reject) => {
                console.log("\nUpdate Available Tags With Mistakes")
                const parseObject = Parse.Object.extend("mistakes");
                const query = new Parse.Query(parseObject);
                const results = await query.find();
                if (results.length > 0) {
                    for (let i = 0; i < results.length; i++) {
                        const object = results[i];
                        console.log(" -> Object id " + object.id)
                        const highestIdNumberAvailableTags = useFindHighestIdNumber(availableTags);
                        const highestIdNumberTradeTags = useFindHighestIdNumberTradeTags(tradeTags);

                        function chooseHighestNumber(num1, num2) {
                            return Math.max(num1, num2);
                        }

                        // Example usage:
                        const highestIdNumber = chooseHighestNumber(highestIdNumberAvailableTags, highestIdNumberTradeTags);

                        //console.log(" -> Highest tag id number " + highestIdNumber);
                        let temp = {}
                        temp.id = "tag_" + (highestIdNumber + 1).toString()
                        temp.name = object.get("name")
                        tradeTags.push(temp)

                    }
                    resolve()
                } else {
                    alert("Updating trade tags did not return any results")
                }
            })
        }


        /*const copySetupsToTags = async () => {

            return new Promise(async (resolve, reject) => {
                const parseObject = Parse.Object.extend("setups");
                const query = new Parse.Query(parseObject);
                query.include('pattern');
                query.include('mistake');
                const results = await query.find();
                if (results.length > 0) {
                    for (let i = 0; i < results.length; i++) {
                        const object = results[i];
                        console.log(" -> Object id " + object.id)
                        //console.log(" -> Object " + JSON.stringify(object))
                        if (object.get('pattern') != null && object.get('pattern') != '') {
                            console.log("  --> Pattern name " + object.get('pattern').get('name'))
                        }

                        if (object.get('mistake') != null && object.get('mistake') != '') {
                            console.log("  --> mistake name " + object.get('mistake').get('name'))
                        }

                        /*let temp = []
                    let updated = false
                    for (let index = 0; index < object.get('tags').length; index++) {
                        const element = object.get('tags')[index];
                        if (element.id == param.id) {
                            updated = true
                            temp.push(param)
                        } else {
                            temp.push(element)
                        }
            
                        if (((index + 1) == object.get('tags').length) && updated) {
                            console.log("  --> Updating")
                            object.set("tags", temp)
                            await object.save().then(async () => {
                                console.log("   ---> Updated tags")
                            })
                        }
            
                    }
                    }
                    resolve()
                } else {
                    alert("Updating trade tags did not return any results")
                }
            })
        }*/

        await useGetLegacy()
        if (legacy == undefined || legacy.length == 0) {
            await useGetAvailableTags()
            await updateAvailableTagsWithPatterns()
            await updateAvailableTagsWithMistakes()
            console.log(" --> Trade Tags " + JSON.stringify(tradeTags))
            await useUpdateAvailableTags()
            await useUpdateLegacy("updateAvailableTagsWithPatterns")

        }
        if (legacy.length > 0) {
            let index = legacy.findIndex(obj => obj.name == "updateAvailableTagsWithPatterns")
            if (index == -1) {
                await useGetAvailableTags()
                await updateAvailableTagsWithPatterns()
                await updateAvailableTagsWithMistakes()
                console.log(" --> Trade Tags " + JSON.stringify(tradeTags))
                await useUpdateAvailableTags()
                await useUpdateLegacy("updateAvailableTagsWithPatterns")
            }
        }



        //await copySetupsToTags()
    })
}

await legacySetups()
</script>

<template>
    <SpinnerLoadingPage />
    <div v-show="!spinnerLoadingPage" class="row mt-2 mb-2">
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
                                    <i class="uil uil-edit-alt pointerClass"
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
</template>