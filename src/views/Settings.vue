<script setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import { useCheckCurrentUser } from '../utils/utils';
import { useGetMistakes, useGetPatterns, useUpdateEditPatternMistake } from '../utils/setups'
import { currentUser, patterns, mistakes, renderProfile, patternUpdate, mistakeUpdate, patternNew, mistakeNew, availableTags } from '../stores/globals';
import { useEditPatternMistake, useSaveNewPatternMistake } from '../utils/setups'
import { useGetAvailableTags } from '../utils/daily';

let profileAvatar = null
let marketDataApiKey = null

let selectedGroup = ref(null)

let newAvailableTags = []

onBeforeMount(async () => {
    await useGetAvailableTags()
    await Promise.all([useGetPatterns(), useGetMistakes()])
    initSortable()
    newAvailableTags = JSON.parse(JSON.stringify(availableTags)) //JSON.parse(JSON.stringify avoids the two arrays to be linked !!
})

onMounted(async () => {


    console.log(" -> Init Popover")
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl)
    })
    var popDel
    $(document).on('click', '.popoverDelete', (e) => {
        popDel = $(e.currentTarget);
        $('.popoverDelete').not(popDel.popover('hide'));
    });

    $(document).on('click', '.popoverYes', (e) => {
        $('.popoverDelete').not(popDel.popover('hide'));
        deleteGroup()
    });

    $(document).on('click', '.popoverNo', (e) => {
        $('.popoverDelete').not(popDel.popover('hide'));
        selectedGroup.value = null
    });

})

/* PROFILE */
async function uploadProfileAvatar(event) {
    const file = event.target.files[0];
    profileAvatar = file
}


async function updateProfile() {
    return new Promise(async (resolve, reject) => {
        console.log("\nUPDATING PROFILE")

        const parseObject = Parse.Object.extend("_User");
        const query = new Parse.Query(parseObject);
        query.equalTo("objectId", currentUser.value.objectId);
        const results = await query.first();
        if (results) {
            if (profileAvatar != null) {
                const parseFile = new Parse.File("avatar", profileAvatar);
                results.set("avatar", parseFile)
            }
            if (marketDataApiKey != null) results.set("marketDataApiKey", marketDataApiKey)

            await results.save().then(async () => { //very important to have await or else too quick to update
                await useCheckCurrentUser()
                await (renderProfile.value += 1)
                console.log(" -> Profile updated")
            })
            //
        } else {
            alert("Update query did not return any results")
        }

        resolve()
    })
}

/*********************
 * TAGS
 *********************/

const initSortable = () => {
    for (let index = 0; index < availableTags.length; index++) {
        const element = availableTags[index];
        Sortable.create(document.getElementById(element.id), {
            group: "common",
            animation: 100,
            dataIdAttr: element.id,
            onEnd: function (/**Event*/evt) {
                let itemEl = evt.item;  // dragged HTMLElement
                let tag = itemEl.textContent
                let oldListId = evt.from.id
                let newListId = evt.to.id
                let oldIndex = evt.oldIndex
                let newIndex = evt.newIndex

                console.log(" -> Tag " + tag + " dragged from list " + oldListId + " on index " + oldIndex + " to list " + newListId + " on position " + newIndex)
                //remove from old list
                newAvailableTags[Number(oldListId)].tags.splice(oldIndex, 1)

                //add to new new list
                newAvailableTags[Number(newListId)].tags.splice(newIndex, 0, tag)

                console.log(" -> New available tags " + JSON.stringify(newAvailableTags))
            },

        });
    }
}

const getNewArray = () => {
    var order = Sortable.toArray();
    console.log("order " + order)
}

const sortAvailableTags = () => {

}

const addNewGroup = async () => {
    const addToAvailableTags = async () => {
        return new Promise(async (resolve, reject) => {
            const highestId = availableTags.reduce((max, obj) => Math.max(max, parseInt(obj.id, 10)), -Infinity);
            const getRandomHexColor = () => {
                const red = Math.floor(Math.random() * 256);
                const green = Math.floor(Math.random() * 256);
                const blue = Math.floor(Math.random() * 256);
                const hexColor = '#' + ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1);
                return hexColor;
            }

            let temp = {}
            temp.id = (highestId + 1).toString()
            temp.name = "GroupName"
            temp.color = getRandomHexColor()
            temp.tags = []
            availableTags.push(temp)
            resolve()
        })
    }

    await addToAvailableTags()
    initSortable()
}

const deleteGroup = async () => {
    //first we move all the tags to the ungrouped group
    let ungroupedIndex = availableTags.findIndex(obj => obj.id == "0")
    let toDeleteIndex = availableTags.findIndex(obj => obj.id == "1")

    const moveTags = async () => {
        return new Promise(async (resolve, reject) => {
            for (let index = 0; index < availableTags[toDeleteIndex].tags.length; index++) {
                const element = availableTags[toDeleteIndex].tags[index];
                console.log(" -> Element " + element)
                availableTags[ungroupedIndex].tags.push(element)
                if ((index + 1) == availableTags[toDeleteIndex].tags.length) {
                    resolve()
                }
            }
        })
    }
    await moveTags()
    //we remove the group
    availableTags.splice(toDeleteIndex, 1)

}

const updateSortedTags = async () => {
    return new Promise(async (resolve, reject) => {
        console.log("\nUPDATING PROFILE")
        const parseObject = Parse.Object.extend("_User");
        const query = new Parse.Query(parseObject);
        query.equalTo("objectId", currentUser.value.objectId);
        const results = await query.first();
        if (results) {
            results.set("tags", newAvailableTags)
            await results.save().then(async() => {
                console.log(" -> Updated sorted tags")
                await useGetAvailableTags()
                resolve()
            })
        } else {
            alert("Update query did not return any results")
        }
    })
}



</script>
<template>
    <div class="row mt-2">
        <div class="row justify-content-md-center">
            <div class="col-12 col-md-9">
                <!--=============== PROFILE ===============-->
                <!-- Picture -->
                <div class="row align-items-center">
                    <p class="fs-5 fw-bold">Profile</p>
                    <div class="col-12 col-md-3">
                        Your profile picture
                    </div>
                    <div class="col-12 col-md-9">
                        <input type="file" @change="uploadProfileAvatar" />
                    </div>
                </div>

                <div class="mt-3 mb-3">
                    <button type="button" v-on:click="updateProfile" class="btn btn-success">Save</button>
                </div>

                <hr />

                <!--=============== API KEY ===============-->
                <div class="mt-3 row align-items-center">
                    <p class="fs-5 fw-bold">API Key</p>
                    <p class="mb-4 fw-lighter">Your Polygon API Key will be used to fill out automatically MFE
                        prices when you add new
                        trades as well as provide you with charts for your trades on daily page.</p>
                    <div class="col-12 col-md-3">
                        Polygon API Key
                    </div>
                    <div class="col-12 col-md-9">
                        <input type="text" class="form-control" :value="currentUser.marketDataApiKey"
                            @input="marketDataApiKey = $event.target.value" />
                    </div>

                </div>

                <div class="mt-3 mb-3">
                    <button type="button" v-on:click="updateProfile" class="btn btn-success">Save</button>
                </div>


                <hr />

                <!--=============== TAGS ===============-->
                <div class="mt-3 row">
                    <div class="row">
                        <div class="col">
                            <p class="fs-5 fw-bold">TAGS</p>
                        </div>
                        <div class="col text-end">
                            <button type="button" v-on:click="addNewGroup" class="btn blueBtn btn-sm"><i
                                    class="uil uil-plus me-2"></i>Add</button>
                        </div>
                    </div>
                    <p class="fw-lighter">Create tag groups and assign tags to your groups.</p>
                    <div v-for="group in availableTags" class="col-12 col-md-6">
                        <div class="availableTagsCard mt-3">
                            <div class="row align-items-center">
                                <div class="col-6">
                                    <h5>{{ group.name }}</h5>
                                </div>
                                <div class="col-6 text-end">
                                    <input type="color" id="colorPicker" class="" :value="group.color">
                                    <span><i v-if="group.id != '0'" v-on:click="selectedGroup = group.id"
                                            class="ps-2 uil uil-trash-alt popoverDelete pointerClass" data-bs-html="true"
                                            data-bs-content="<div>Are you sure?</div><div class='text-center'><a type='button' class='btn btn-red btn-sm popoverYes'>Yes</a><a type='button' class='btn btn-outline-secondary btn-sm ms-2 popoverNo'>No</a></div>"
                                            data-bs-toggle="popover" data-bs-placement="left"></i></span>
                                </div>
                            </div>
                            <div :id="group.id">
                                <div v-for="tag in group.tags">
                                    <div :style="{ backgroundColor: group.color }" class="availableTags">{{ tag }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="mt-3 mb-3">
                    <button type="button" v-on:click="updateSortedTags" class="btn btn-success">Save</button>
                </div>


                <hr />

                <!--=============== PATTERNS ===============-->

                <div class="">
                    <p class="fs-5 fw-bold">Patterns</p>
                    <p class="mb-4 fw-lighter">Add a list of patterns used for labelling your trades.</p>

                    <!--=============== PATTERN ===============-->
                    <table class="table">
                        <thead>
                            <tr>
                                <th scope="col" class="col-md-4">Pattern</th>
                                <th scope="col" class="col-md-6">Description</th>
                                <th scope="col" class="col-md-1">active</th>
                                <th scope="col" class="col-md-1"></th>
                            </tr>
                        </thead>
                        <tbody class="txt-small" v-for="pattern in patterns">
                            <tr>
                                <td><input v-if="patternUpdate.edit == pattern.objectId" type="text" class="form-control"
                                        v-bind:value="pattern.name" v-on:input="patternUpdate.name = $event.target.value">
                                    <span v-else>{{ pattern.name }}</span>
                                </td>
                                <td><input v-if="patternUpdate.edit == pattern.objectId" type="text" class="form-control"
                                        v-bind:value="pattern.description"
                                        v-on:input="patternUpdate.description = $event.target.value">
                                    <span v-else>{{ pattern.description }}</span>
                                </td>
                                <td>
                                    <span class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" role="switch"
                                            v-bind:disabled="patternUpdate.edit != pattern.objectId"
                                            v-bind:checked="pattern.active"
                                            v-on:change="patternUpdate.active = !patternUpdate.active">
                                    </span>
                                </td>
                                <td>
                                    <i v-if="patternUpdate.edit == pattern.objectId" class="uil uil-save pointerClass"
                                        v-on:click="useUpdateEditPatternMistake(pattern, 'pattern')"></i>
                                    <i v-else class="uil uil-edit-alt pointerClass"
                                        v-on:click="useEditPatternMistake(pattern, 'pattern')"></i>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="mt-2 input-group">
                        <input type="text" class="form-control" v-on:input="patternNew.name = $event.target.value"
                            placeholder="Pattern">
                        <input type="text" class="form-control" v-on:input="patternNew.description = $event.target.value"
                            placeholder="Description">
                        <button type="button" v-on:click="useSaveNewPatternMistake('pattern')"
                            class="btn btn-success">Add</button>
                    </div>

                </div>

                <!--=============== MISTAKE ===============-->
                <hr />
                <p class="fs-5 fw-bold">Mistakes</p>
                <p class="mb-4 fw-lighter">Add a list of mistakes used for labelling your trades.</p>
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col" class="col-md-4">Mistake</th>
                            <th scope="col" class="col-md-6">Description</th>
                            <th scope="col" class="col-md-1">active</th>
                            <th scope="col" class="col-md-1"></th>
                        </tr>
                    </thead>
                    <tbody class="txt-small" v-for="mistake in mistakes">
                        <tr>
                            <td><input v-if="mistakeUpdate.edit == mistake.objectId" type="text" class="form-control"
                                    v-bind:value="mistake.name" v-on:input="mistakeUpdate.name = $event.target.value">
                                <span v-else>{{ mistake.name }}</span>
                            </td>
                            <td><input v-if="mistakeUpdate.edit == mistake.objectId" type="text" class="form-control"
                                    v-bind:value="mistake.description"
                                    v-on:input="mistakeUpdate.description = $event.target.value">
                                <span v-else>{{ mistake.description }}</span>
                            </td>
                            <td>
                                <span class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" role="switch"
                                        v-bind:disabled="mistakeUpdate.edit != mistake.objectId"
                                        v-bind:checked="mistake.active"
                                        v-on:change="mistakeUpdate.active = !mistakeUpdate.active">
                                </span>
                            </td>
                            <td>
                                <i v-if="mistakeUpdate.edit == mistake.objectId" class="uil uil-save pointerClass"
                                    v-on:click="useUpdateEditPatternMistake(mistake, 'mistake')"></i>
                                <i v-else class="uil uil-edit-alt pointerClass"
                                    v-on:click="useEditPatternMistake(mistake, 'mistake')"></i>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="mt-2 input-group">
                    <input type="text" class="form-control" v-on:input="mistakeNew.name = $event.target.value"
                        placeholder="Mistake">
                    <input type="text" class="form-control" v-on:input="mistakeNew.description = $event.target.value"
                        placeholder="Description">
                    <button type="button" v-on:click="useSaveNewPatternMistake('mistake')"
                        class="btn btn-success">Add</button>


                </div>
            </div>
        </div>

    </div>
</template>