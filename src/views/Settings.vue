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

    //newAvailableTags = JSON.parse(JSON.stringify(availableTags)) //JSON.parse(JSON.stringify avoids the two arrays to be linked !!
    newAvailableTags = _.cloneDeep(availableTags)
    initSortable()
})

onMounted(async () => {

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

const initSortable = (param1) => {
    let idDivElToCreate

    for (let index = 0; index < availableTags.length; index++) {
        const element = availableTags[index];

        idDivElToCreate = document.getElementById(element.id)
        if (idDivElToCreate != null) {
            Sortable.create(idDivElToCreate, {
                group: {
                    name: "common",
                },
                animation: 100,
                onEnd: function( /**Event*/ evt) {
                    let itemEl = evt.item; // dragged HTMLElement
                    let tagName = itemEl.querySelector('input').value
                    let tagId = itemEl.querySelector('input').id

                    let oldListId = evt.from.id
                    let newListId = evt.to.id
                    let oldIndex = evt.oldIndex
                    let newIndex = evt.newIndex

                    let oldListIndex = newAvailableTags.findIndex(obj => obj.id == oldListId)
                    let newListIndex = newAvailableTags.findIndex(obj => obj.id == newListId)

                    //console.log(" -> Tag " + tagName + " dragged from list " + oldListId + " on index " + oldIndex + " to list " + newListId + " on position " + newIndex)

                    //remove from old list
                    newAvailableTags[oldListIndex].tags.splice(oldIndex, 1)

                    //add to new new list
                    let temp = {}
                    temp.id = tagId
                    temp.name = tagName
                    newAvailableTags[newListIndex].tags.splice(newIndex, 0, temp)

                    //console.log(" -> New available tags " + JSON.stringify(newAvailableTags))
                    //console.log(" -> available tags " + JSON.stringify(availableTags))
                }


            });
        }
    }


}

const getNewArray = () => {
    var order = Sortable.toArray();
    console.log("order " + order)
}

const sortAvailableTags = () => {

}

const addNewGroup = async () => {
    let temp = {}
    const addToAvailableTags = async () => {
        return new Promise(async (resolve, reject) => {
            const highestId = newAvailableTags.reduce((max, obj) => Math.max(max, parseInt(obj.id.replace("group_", ""), 10)), -Infinity);
            const getRandomHexColor = () => {
                const red = Math.floor(Math.random() * 256);
                const green = Math.floor(Math.random() * 256);
                const blue = Math.floor(Math.random() * 256);
                const hexColor = '#' + ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1);
                return hexColor;
            }

            temp.id = "group_" + (highestId + 1).toString()
            temp.name = "GroupName"
            temp.color = getRandomHexColor()
            temp.tags = []
            newAvailableTags.push(temp)

            resolve()
        })
    }

    await addToAvailableTags()
    await updateSortedTags()
}

const addNewTag = async () => {
    let temp = {}
    const addToAvailableTags = async () => {
        return new Promise(async (resolve, reject) => {
            const findHighestIdNumber = (param) => {
                let highestId = -Infinity;
                param.forEach(innerArray => {
                    innerArray.tags.forEach(obj => {
                        if (Number(obj.id.replace("tag_", "")) > highestId) {
                            highestId = obj.id;
                        }
                    });
                });
                return highestId;
            }

            // Get the highest id number
            const highestIdNumber = findHighestIdNumber(newAvailableTags);
            console.log(highestIdNumber); // Output: 6

            temp.id = "tag_" + (highestIdNumber + 1).toString()
            temp.name = "TagName"

            let ungroupedIndex = newAvailableTags.findIndex(obj => obj.id == 'group_0')
            newAvailableTags[ungroupedIndex].tags.push(temp)
            resolve()
        })
    }

    await addToAvailableTags()
    await updateSortedTags()
}

const deleteGroup = async () => {
    //first we move all the tags to the ungrouped group
    let toDeleteIndex = newAvailableTags.findIndex(obj => obj.id == selectedGroup.value)

    const moveTags = async () => {
        return new Promise(async (resolve, reject) => {
            //console.log(" newAvailableTags[toDeleteIndex].tags "+JSON.stringify(newAvailableTags[toDeleteIndex]))
            //console.log(" newAvailableTags[0].tags "+JSON.stringify(newAvailableTags[0]))
            if (newAvailableTags[toDeleteIndex].tags.length == 0) {
                resolve()
            } else {

                for (let index = 0; index < newAvailableTags[toDeleteIndex].tags.length; index++) {
                    const element = newAvailableTags[toDeleteIndex].tags[index];
                    //console.log(" -> Element " + element)
                    newAvailableTags[0].tags.push(element)
                    availableTags[0].tags.push(element)
                    if ((index + 1) == newAvailableTags[toDeleteIndex].tags.length) {
                        resolve()
                    }
                }
            }
        })
    }
    const spliceArrays = async () => {
        return new Promise(async (resolve, reject) => {
            newAvailableTags.splice(toDeleteIndex, 1)

            //availableTags.splice(toDeleteIndex, 1) // but also the availableTags in order to remove visually the card

            //INFO : we need to keep availableTags or else, the div moves up a row, and inherits the tags that have been draged to the deleted div

            //Remove de deleted divs
            function removeAllChildNodes(parent) {
                while (parent.firstChild) {
                    parent.removeChild(parent.firstChild);
                }
            }
            const deletedDiv = document.getElementById(selectedGroup.value);
            removeAllChildNodes(deletedDiv);
            deletedDiv.remove() // also remove parent div or, because we keep availableTags, it still can add tags 

            //Remove delte Icon
            const iconElement = document.getElementById("icon_" + selectedGroup.value);
            if (iconElement) {
                iconElement.remove();
            }
            //console.log(" available tags "+JSON.stringify(availableTags))
            resolve()
        })
    }
    await moveTags()
    await spliceArrays()
    //initSortable()
    console.log(" -> newAvailableTags " + JSON.stringify(newAvailableTags))
}

const inputGroupName = (param1, param2) => {
    newAvailableTags[param1].name = param2
    console.log(" newAvailableTags " + JSON.stringify(newAvailableTags))
}

const inputGroupColor = (param1, param2) => {
    newAvailableTags[param1].color = param2
    console.log(" newAvailableTags " + JSON.stringify(newAvailableTags))
}

const inputGroupTag = (param1, param2) => { //groupIndex, tag.id, value
    let groupIndex = -1;

    newAvailableTags.some((group, index) => {
        if (group.tags.some(tag => tag.id === param1)) {
            groupIndex = index;
            return true; // Stop iteration
        }
    });

    console.log(groupIndex);

    let tagIndex = newAvailableTags[groupIndex].tags.findIndex(obj => obj.id == param1)

    //remove from old list
    newAvailableTags[groupIndex].tags.splice(tagIndex, 1)

    //add to new new list
    let temp = {}
    temp.id = param1
    temp.name = param2
    newAvailableTags[groupIndex].tags.splice(tagIndex, 0, temp)

    console.log(" newAvailableTags " + JSON.stringify(newAvailableTags))
}

const updateSortedTags = async () => {
    return new Promise(async (resolve, reject) => {
        console.log("\nUPDATING SORTED TAGS")
        const parseObject = Parse.Object.extend("_User");
        const query = new Parse.Query(parseObject);
        query.equalTo("objectId", currentUser.value.objectId);
        const results = await query.first();
        if (results) {
            results.set("tags", newAvailableTags)
            await results.save().then(async () => {
                console.log(" -> Updated sorted tags")
                await useGetAvailableTags()
                initSortable()
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
                    <p class="mb-4 fw-lighter">Your Polygon API Key will be used to fill out automatically MFE prices when you add new trades as well as provide you with charts for your trades on daily page.</p>
                    <div class="col-12 col-md-3">
                        Polygon API Key
                    </div>
                    <div class="col-12 col-md-9">
                        <input type="text" class="form-control" :value="currentUser.marketDataApiKey" @input="marketDataApiKey = $event.target.value" />
                    </div>
    
                </div>
    
                <div class="mt-3 mb-3">
                    <button type="button" v-on:click="updateProfile" class="btn btn-success">Save</button>
                </div>
    
    
                <hr />
    
                <!--=============== TAGS ===============-->
                <div class="mt-3 row">
                    <p class="fs-5 fw-bold">TAGS</p>
                    <p class="fw-lighter">Create tag groups and assign tags to your groups.</p>
                    <div>
                        <button type="button" v-on:click="addNewGroup" class="btn blueBtn btn-sm"><i
                                    class="uil uil-plus me-2"></i>Group</button>
                        <button type="button" v-on:click="addNewTag" class="btn blueBtn btn-sm ms-3"><i
                                    class="uil uil-plus me-2"></i>Tag</button>
                    </div>
                    <div v-for="(group, groupIndex) in availableTags" class="col-12 col-md-6">
                        <div class="availableTagsCard mt-3">
                            <div class="row align-items-center">
                                <div class="col-6">
                                    <h5 v-if="group.id == 'group_0'">{{ group.name }}</h5>
                                    <h5 v-else><input type="text" class="groupInput" v-on:input="inputGroupName(groupIndex, $event.target.value)" :value="group.name">
                                    </h5>
                                </div>
                                <div class="col-6 text-end">
                                    <input type="color" id="colorPicker" class="" v-on:input="inputGroupColor(groupIndex, $event.target.value)" :value="group.color">
                                </div>
                            </div>
                            <div :id="group.id">
                                <div v-for="tag in group.tags">
                                    <input type="text" :style="{ backgroundColor: group.color }" class="availableTags" v-on:input="inputGroupTag(tag.id, $event.target.value)" :id="tag.id" :value="tag.name">
                                    <i class="uil uil-draggabledots"></i>
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
                                <td><input v-if="patternUpdate.edit == pattern.objectId" type="text" class="form-control" v-bind:value="pattern.name" v-on:input="patternUpdate.name = $event.target.value">
                                    <span v-else>{{ pattern.name }}</span>
                                </td>
                                <td><input v-if="patternUpdate.edit == pattern.objectId" type="text" class="form-control" v-bind:value="pattern.description" v-on:input="patternUpdate.description = $event.target.value">
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
                                    <i v-if="patternUpdate.edit == pattern.objectId" class="uil uil-save pointerClass" v-on:click="useUpdateEditPatternMistake(pattern, 'pattern')"></i>
                                    <i v-else class="uil uil-edit-alt pointerClass" v-on:click="useEditPatternMistake(pattern, 'pattern')"></i>
                                </td>
                            </tr>
                        </tbody>
                    </table>
    
                    <div class="mt-2 input-group">
                        <input type="text" class="form-control" v-on:input="patternNew.name = $event.target.value" placeholder="Pattern">
                        <input type="text" class="form-control" v-on:input="patternNew.description = $event.target.value" placeholder="Description">
                        <button type="button" v-on:click="useSaveNewPatternMistake('pattern')" class="btn btn-success">Add</button>
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
                            <td><input v-if="mistakeUpdate.edit == mistake.objectId" type="text" class="form-control" v-bind:value="mistake.name" v-on:input="mistakeUpdate.name = $event.target.value">
                                <span v-else>{{ mistake.name }}</span>
                            </td>
                            <td><input v-if="mistakeUpdate.edit == mistake.objectId" type="text" class="form-control" v-bind:value="mistake.description" v-on:input="mistakeUpdate.description = $event.target.value">
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
                                <i v-if="mistakeUpdate.edit == mistake.objectId" class="uil uil-save pointerClass" v-on:click="useUpdateEditPatternMistake(mistake, 'mistake')"></i>
                                <i v-else class="uil uil-edit-alt pointerClass" v-on:click="useEditPatternMistake(mistake, 'mistake')"></i>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="mt-2 input-group">
                    <input type="text" class="form-control" v-on:input="mistakeNew.name = $event.target.value" placeholder="Mistake">
                    <input type="text" class="form-control" v-on:input="mistakeNew.description = $event.target.value" placeholder="Description">
                    <button type="button" v-on:click="useSaveNewPatternMistake('mistake')" class="btn btn-success">Add</button>
    
    
                </div>
            </div>
        </div>
    
    </div>
</template>