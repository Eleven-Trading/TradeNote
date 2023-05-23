<script setup>
import { onBeforeMount } from 'vue';
import { useCheckCurrentUser } from '../utils/utils';
import { useGetMistakes, useGetPatterns } from '../utils/patternsMistakes'
import { currentUser, patternToEdit, updatePatternName, updatePatternDescription, updatePatternActive, newPatternName, newPatternDescription, mistakeToEdit, updateMistakeName, updateMistakeDescription, updateMistakeActive, newMistakeName, newMistakeDescription, patterns, mistakes } from '../stores/globals';
import { useEditPattern, useUpdateEditPattern, useSaveNewPattern, useEditMistake, useSaveNewMistake, useUpdateEditMistake } from '../utils/patternsMistakes'

let profileAvatar = null
let renderProfile = 0
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
                await (renderProfile += 1)
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
        <nav>
            <div class="nav nav-tabs" id="nav-tab" role="tablist">
                <button class="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-profile"
                    type="button" role="tab" aria-controls="nav-profile" aria-selected="true">Profile</button>
                <button class="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-patterns"
                    type="button" role="tab" aria-controls="nav-patterns" aria-selected="false">Patterns</button>
                <button class="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-mistakes"
                    type="button" role="tab" aria-controls="nav-mistakes" aria-selected="false">Mistakes</button>
            </div>
        </nav>
        <div class="tab-content" id="nav-tabContent">
            <!--=============== PROFILE ===============-->
            <div class="tab-pane fade active show" id="nav-profile" role="tabpanel" aria-labelledby="nav-home-tab">
                <!-- Picture -->
                <div class="mt-3">
                    <h5>Choose Profile picture</h5>
                    <input type="file" @change="uploadProfileAvatar" />
                </div>

                <!-- Finnhub API Key -->
                <div class="mt-3">
                    <h5>Insert your Polygon API Key</h5>
                    <p>Your Polygon API Key will be used to fill out automatically MFE prices when you add new trades.</p>
                    <input type="text" :value="currentUser.marketDataApiKey"
                        @input="marketDataApiKey = $event.target.value" />
                </div>

                <div class="mt-3 mb-3">
                    <button type="button" v-on:click="updateProfile" class="btn btn-success">Save</button>
                </div>
            </div>

            <!--=============== PATTERNS ===============-->
            <div class="tab-pane fade" id="nav-patterns" role="tabpanel" aria-labelledby="nav-profile-tab">

                <div class="mt-3">

                    <!--=============== PATTERN ===============-->
                    <table class="table">
                        <thead class="thead-dark">
                            <tr>
                                <th scope="col" class="col-md-4">Pattern</th>
                                <th scope="col" class="col-md-6">Description</th>
                                <th scope="col" class="col-md-1">active</th>
                                <th scope="col" class="col-md-1"></th>
                            </tr>
                        </thead>
                        <tbody class="txt-small" v-for="pattern in patterns">
                            <tr>
                                <td><input v-if="patternToEdit == pattern.objectId" type="text" class="form-control"
                                        v-bind:value="pattern.name" v-on:input="updatePatternName = $event.target.value">
                                    <span v-else>{{ pattern.name }}</span>
                                </td>
                                <td><input v-if="patternToEdit == pattern.objectId" type="text" class="form-control"
                                        v-bind:value="pattern.description"
                                        v-on:input="updatePatternDescription = $event.target.value">
                                    <span v-else>{{ pattern.description }}</span>
                                </td>
                                <td>
                                    <span class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" role="switch"
                                            v-bind:disabled="patternToEdit != pattern.objectId"
                                            v-bind:checked="pattern.active"
                                            v-on:change="updatePatternActive = !updatePatternActive">
                                    </span>
                                </td>
                                <td>
                                    <i v-if="patternToEdit == pattern.objectId" class="uil uil-save pointerClass"
                                        v-on:click="useUpdateEditPattern"></i>
                                    <i v-else class="uil uil-edit-alt editItem pointerClass"
                                        v-on:click="useEditPattern(pattern)"></i>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="mt-2 input-group">
                    <input type="text" class="form-control" v-on:input="newPatternName = $event.target.value"
                        placeholder="Pattern">
                    <input type="text" class="form-control" v-on:input="newPatternDescription = $event.target.value"
                        placeholder="Description">
                    <button type="button" v-on:click="useSaveNewPattern" class="btn btn-success">Add</button>
                </div>
            </div>
            <!--=============== MISTAKE ===============-->
            <div class="tab-pane fade" id="nav-mistakes" role="tabpanel" aria-labelledby="nav-profile-tab">
                <div class="mt-3">
                    <table class="table">
                        <thead class="thead-dark">
                            <tr>
                                <th scope="col" class="col-md-4">Mistake</th>
                                <th scope="col" class="col-md-6">Description</th>
                                <th scope="col" class="col-md-1">active</th>
                                <th scope="col" class="col-md-1"></th>
                            </tr>
                        </thead>
                        <tbody class="txt-small" v-for="mistake in mistakes">
                            <tr>
                                <td><input v-if="mistakeToEdit == mistake.objectId" type="text" class="form-control"
                                        v-bind:value="mistake.name" v-on:input="updateMistakeName = $event.target.value">
                                    <span v-else>{{ mistake.name }}</span>
                                </td>
                                <td><input v-if="mistakeToEdit == mistake.objectId" type="text" class="form-control"
                                        v-bind:value="mistake.description"
                                        v-on:input="updateMistakeDescription = $event.target.value">
                                    <span v-else>{{ mistake.description }}</span>
                                </td>
                                <td>
                                    <span class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" role="switch"
                                            v-bind:disabled="mistakeToEdit != mistake.objectId"
                                            v-bind:checked="mistake.active"
                                            v-on:change="updateMistakeActive = !updateMistakeActive">
                                    </span>
                                </td>
                                <td>
                                    <i v-if="mistakeToEdit == mistake.objectId" class="uil uil-save pointerClass"
                                        v-on:click="useUpdateEditMistake"></i>
                                    <i v-else class="uil uil-edit-alt editItem pointerClass"
                                        v-on:click="useEditMistake(mistake)"></i>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="mt-2 input-group">
                    <input type="text" class="form-control" v-on:input="newMistakeName = $event.target.value"
                        placeholder="Mistake">
                    <input type="text" class="form-control" v-on:input="newMistakeDescription = $event.target.value"
                        placeholder="Description">
                    <button type="button" v-on:click="useSaveNewMistake" class="btn btn-success">Add</button>

                </div>
            </div>
            <div class="tab-pane fade" id="nav-misc" role="tabpanel" aria-labelledby="nav-contact-tab">...</div>
        </div>
    </div>
</template>