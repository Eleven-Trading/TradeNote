<script setup>
import { onBeforeMount, onMounted, reactive, ref } from 'vue';
import { useCheckCurrentUser, useInitTooltip } from '../utils/utils';
import { currentUser, renderProfile, availableTags } from '../stores/globals';
import { useGetAvailableTags } from '../utils/daily';

let profileAvatar = null
let marketDataApiKey = null

let selectedGroup = ref(null)

const newAvailableTags = reactive([])

onBeforeMount(async () => {
    await useGetAvailableTags()
    //newAvailableTags = JSON.parse(JSON.stringify(availableTags)) //JSON.parse(JSON.stringify avoids the two arrays to be linked !!
    //console.log(" available tags "+JSON.stringify(availableTags))
    for (let index = 0; index < availableTags.length; index++) {
        const element = JSON.parse(JSON.stringify(availableTags[index]))
        newAvailableTags.push(element)
    }
    //console.log(" newAvailableTags "+JSON.stringify(newAvailableTags))
    initSortable()
})

onMounted(async () => {
    await useInitTooltip()
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
                onEnd: function ( /**Event*/ evt) {
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
            console.log(" newAvailableTags " + JSON.stringify(newAvailableTags))

            if (newAvailableTags.length > 0) {
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
            }
            else {
                temp.id = "group_0"
                temp.name = "Ungrouped"
                temp.color = "#6c757d"
                temp.tags = []
            }
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
                console.log("  -> Find highest number amongst " + JSON.stringify(param))
                param.forEach(innerArray => {
                    console.log(" innerArray.tags "+JSON.stringify(innerArray.tags))
                    if (innerArray.tags.length == 0 && highestId == -Infinity) {
                        highestId = 0
                    } else {
                        innerArray.tags.forEach(obj => {
                            if (Number(obj.id.replace("tag_", "")) > highestId) {
                                highestId = Number(obj.id.replace("tag_", ""))
                            }
                        });
                    }
                });
                return highestId;
            }

            // Get the highest id number
            const highestIdNumber = findHighestIdNumber(newAvailableTags);
            console.log("  --> Highest number "+highestIdNumber);

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

let tagsToUpdate = []
const inputGroupTag = (param1, param2) => { //groupIndex, tag.id, value
    //console.log(" param 1 " + param1)
    //console.log(" param 2 " + param2)
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

    let index = tagsToUpdate.findIndex(obj => obj.id == param1)
    if (index == -1) {
        tagsToUpdate.push(temp)
    } else {
        tagsToUpdate[index] = temp
    }

    //console.log(" newAvailableTags " + JSON.stringify(newAvailableTags))
    console.log(" Tags to update " + JSON.stringify(tagsToUpdate))
}

const updateSortedTags = async () => {
    return new Promise(async (resolve, reject) => {

        const updateAvailableTags = async () => {
            return new Promise(async (resolve, reject) => {
                console.log("\nUPDATING AVAILABLE TAGS")
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

        const updateTradeTags = async (param) => {
            return new Promise(async (resolve, reject) => {
                console.log("\nUPDATING TRADE TAGS")
                const parseObject = Parse.Object.extend("tags");
                const query = new Parse.Query(parseObject);
                const results = await query.find();
                if (results.length > 0) {
                    for (let i = 0; i < results.length; i++) {
                        const object = results[i];
                        console.log(" -> Object id " + object.id)
                        let temp = []
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
                    console.log(" -> No existing trade tags to update")
                    resolve()
                }
            })
        }

        // If name changed, we need to update existing tags/existing trade tags
        if (tagsToUpdate.length > 0) {
            for (let index = 0; index < tagsToUpdate.length; index++) {
                const element = tagsToUpdate[index];
                await updateTradeTags(element)
            }
        }

        await updateAvailableTags()

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
                    <p class="fs-5 fw-bold">API Keys</p>
                    <div class="col-12 col-md-3">Polygon<i class="ps-1 uil uil-info-circle" data-bs-toggle="tooltip"
                            data-bs-title="Your Polygon API Key will be used to fill out automatically MFE prices when you add new trades as well as provide you with charts for your trades on daily page."></i>
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
                    <p class="fs-5 fw-bold">TAGS</p>
                    <p class="fw-lighter">Create tag groups and assign tags to your groups.</p>
                    <div>

                        <button type="button" v-on:click="addNewGroup" class="btn blueBtn btn-sm"><i
                                class="uil uil-plus me-2"></i>Group</button>
                        <button v-show="newAvailableTags.length > 0" type="button" v-on:click="addNewTag"
                            class="btn blueBtn btn-sm ms-3"><i class="uil uil-plus me-2"></i>Tag</button>
                    </div>
                    <div v-for="(group, groupIndex) in availableTags" class="col-12 col-md-6">
                        <div class="availableTagsCard mt-3">
                            <div class="row align-items-center">
                                <div class="col-6">
                                    <h5 v-if="group.id == 'group_0'">{{ group.name }}</h5>
                                    <h5 v-else><input type="text" class="groupInput"
                                            v-on:input="inputGroupName(groupIndex, $event.target.value)"
                                            :value="group.name">
                                    </h5>
                                </div>
                                <div class="col-6 text-end">
                                    <input type="color" id="colorPicker" class=""
                                        v-on:input="inputGroupColor(groupIndex, $event.target.value)"
                                        :value="group.color">
                                </div>
                            </div>
                            <div :id="group.id">
                                <div v-for="tag in group.tags">
                                    <input type="text" :style="{ backgroundColor: group.color }" class="availableTags"
                                        v-on:input="inputGroupTag(tag.id, $event.target.value)" :id="tag.id"
                                        :value="tag.name">
                                    <i class="uil uil-draggabledots"></i>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="mt-3 mb-3">
                    <button type="button" v-on:click="updateSortedTags" class="btn btn-success">Save</button>
                </div>

            </div>
        </div>

    </div>
</template>