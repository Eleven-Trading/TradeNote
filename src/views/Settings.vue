<script setup>
import { onBeforeMount } from 'vue';
import { useCheckCurrentUser } from '../utils/utils';
import { useGetMistakes, useGetPatterns, useUpdateEditPatternMistake } from '../utils/setups'
import { currentUser, patterns, mistakes, renderProfile, patternUpdate, mistakeUpdate, patternNew, mistakeNew } from '../stores/globals';
import { useEditPatternMistake, useSaveNewPatternMistake } from '../utils/setups'

let profileAvatar = null
let marketDataApiKey = null

onBeforeMount(async () => {
    await Promise.all([useGetPatterns(), useGetMistakes()])
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
                                    <td><input v-if="patternUpdate.edit == pattern.objectId" type="text"
                                            class="form-control" v-bind:value="pattern.name"
                                            v-on:input="patternUpdate.name = $event.target.value">
                                        <span v-else>{{ pattern.name }}</span>
                                    </td>
                                    <td><input v-if="patternUpdate.edit == pattern.objectId" type="text"
                                            class="form-control" v-bind:value="pattern.description"
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