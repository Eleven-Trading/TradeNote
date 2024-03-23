<script setup>
import { ref, reactive } from 'vue'
import { pageId, timeZones, availableTags, tradeTags, legacy } from '../stores/globals';
import { getCurrentUser, useGetPeriods, useGetTimeZone, useSetValues, useUpdateLegacy, useGetLegacy } from '../utils/utils';
import { useGetAvailableTags, useUpdateAvailableTags, useUpdateTags, useFindHighestIdNumber, useFindHighestIdNumberTradeTags } from '../utils/daily';

const loginForm = reactive({ username: null, password: null, timeZone: "America/New_York" })
const signingUp = ref(false)
let existingSchema = []

async function login() {
  console.log("\nLOGIN")
  signingUp.value = true
  if (!localStorage.getItem('parse_app_id')) {
    alert("Missing App ID. Please make sure you entered correct App ID during runtime.")
    return
  }
  const updateSchemaFunction = await updateSchema()
  console.log(" -> Status " + updateSchemaFunction.status)
  //const test = 200
  if (updateSchemaFunction.status == 200) {
    //if (test == 200) {
    try {
      console.log(" -> Parse logIn")
      await Parse.User.logIn(loginForm.username, loginForm.password)
      getCurrentUser()
      useGetTimeZone()
      await useGetPeriods()
      await useSetValues()
      await checkLegacy()


      console.log("Hooray! You are logged in")
      signingUp.value = false
      window.location.replace("/dashboard");
    } catch (error) {
      // Show the error message somewhere and let the user try again.
      signingUp.value = false
      alert("Error: " + error.code + " " + error.message);
    }
  } else {
    signingUp.value = false
    alert("Error updating schema " + updateSchema)
  }
}

async function register() {
  console.log("\nREGISTER")
  signingUp.value = true
  if (!localStorage.getItem('parse_app_id')) {
    alert("Missing App ID. Please make sure you entered correct App ID during runtime.")
    return
  }
  let updateSchemaFunction = await updateSchema()
  console.log(" -> Update Schema status " + updateSchemaFunction.status)
  if (updateSchemaFunction.status == 200) {
    const user = new Parse.User();
    user.set("username", loginForm.username);
    user.set("password", loginForm.password);
    user.set("email", loginForm.username);
    user.set("timeZone", loginForm.timeZone);

    try {
      await user.signUp();
      getCurrentUser()
      useGetTimeZone()
      await useGetPeriods()
      await useSetValues()
      console.log("Hooray! Let them use the app now")
      window.location.replace("/dashboard");
    } catch (error) {
      // Show the error message somewhere and let the user try again.
      alert("Error: " + error.code + " " + error.message);
    }
  } else {
    signingUp.value = false
    alert("Error updating schema " + updateSchema)
  }
}

async function updateSchema() {
  return new Promise((resolve, reject) => {
    console.log(" -> Updating schema")
    axios.post('/updateSchemas').then((response) => {
      //console.log("  --> Schema response "+JSON.stringify(response))
      existingSchema = response.data.existingSchema
      resolve(response)
    })
      .catch((error) => {
        console.log("Error get app id " + error);
        reject(error)
      });
  })
}
const checkLegacy = async (param) => {
  return new Promise(async (resolve, reject) => {
    console.log("\nCHECKING LEGACY")

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

    const updateAvailableTags = async () => {
      console.log("\n -> Handling available tags legacy")
      await useGetAvailableTags()
      if (existingSchema.includes("patterns")) await updateAvailableTagsWithPatterns()
      if (existingSchema.includes("mistakes")) await updateAvailableTagsWithMistakes()
      //console.log(" --> Trade Tags " + JSON.stringify(tradeTags))
      await useUpdateAvailableTags()
      await useUpdateLegacy("updateAvailableTagsWithPatterns")
    }

    const updateTags = async () => {
      console.log("\n -> Handling tags legacy")
      await useGetAvailableTags()
      if (existingSchema.includes("setups")) await copySetups()
      await useUpdateLegacy("updateSetupsToTags")
    }

    const copySetups = async () => {
      return new Promise(async (resolve, reject) => {
        const parseObject = Parse.Object.extend("setups");
        const query = new Parse.Query(parseObject);
        query.include('pattern');
        query.include('mistake');
        const results = await query.find();

        if (results.length > 0) {
          for (let i = 0; i < results.length; i++) {
            let setupsArray = []
            const object = results[i];
            console.log(" -> Object id " + object.id)

            //console.log(" -> Object " + JSON.stringify(object))
            let index1 = availableTags.findIndex(obj => obj.id == "group_0")

            const createTemp = async (param) => {
              let index2 = availableTags[index1].tags.findIndex(obj => obj.name == param)
              if (index2 != -1) {
                setupsArray.push(availableTags[index1].tags[index2])
              } else {
                console.log(" -> Error : cannot find " + param + " in availableTags")
              }
            }

            if (object.get('pattern') != null && object.get('pattern') != '') {
              let name = object.get('pattern').get('name')
              console.log("  --> Pattern name " + name)
              createTemp(name)
            }

            if (object.get('mistake') != null && object.get('mistake') != '') {
              let name = object.get('mistake').get('name')
              console.log("  --> mistake name " + name)
              createTemp(name)
            }
            console.log("   ----> setupsArray " + JSON.stringify(setupsArray))

            //Saving to tags
            if (setupsArray.length > 0) {

              const parseObject = Parse.Object.extend("tags");
              const object2 = new parseObject();
              object2.set("user", Parse.User.current())
              object2.set("tags", setupsArray)
              object2.set("dateUnix", object.get('dateUnix'))
              object2.set("tradeId", object.get('tradeId'))
              object2.setACL(new Parse.ACL(Parse.User.current()));
              object2.save()
                .then(async (object) => {
                  console.log(' -> Added new tags with id ' + object.id)
                }, (error) => {
                  console.log('Failed to create new object, with error code: ' + error.message);
                })
            }
          }
          resolve()

        } else {
          console.log(" -> No setups to copy")
          resolve()
        }
      })
    }

    const copyNotes = async () => {
      return new Promise(async (resolve, reject) => {
        const parseObject = Parse.Object.extend("setups");
        const query = new Parse.Query(parseObject);
        const results = await query.find();
        if (results.length > 0) {
          for (let i = 0; i < results.length; i++) {
            let setupsArray = []
            const object = results[i];
            console.log(" -> Object id " + object.id)


            //Saving to notes
            if (object.get('note') != undefined && object.get('note') != '') {

              const parseObject = Parse.Object.extend("notes");
              const object2 = new parseObject();
              object2.set("user", Parse.User.current())
              object2.set("note", object.get('note'))
              object2.set("dateUnix", object.get('dateUnix'))
              object2.set("tradeId", object.get('tradeId'))
              object2.setACL(new Parse.ACL(Parse.User.current()));
              object2.save()
                .then(async (object) => {
                  console.log(' -> Added new note with id ' + object.id)
                }, (error) => {
                  console.log('Failed to create new object, with error code: ' + error.message);
                })
            }
          }
          resolve()

        } else {
          console.log(" -> No notes to copy")
          resolve()
        }
      })
    }

    const updateNotes = async () => {
      console.log("\n -> Handling notes legacy")
      if (existingSchema.includes("setups")) await copyNotes()
      await useUpdateLegacy("updateNotes")
    }

    const updateTagsArray = async () => {
      return new Promise(async (resolve, reject) => {
        console.log("\n -> Handling tags json legacy")

        const copyTagsToArray = async () => {
          return new Promise(async (resolve, reject) => {
            const parseObject = Parse.Object.extend("tags");
            const query = new Parse.Query(parseObject);
            const results = await query.find();
            if (results.length > 0) {
              for (let i = 0; i < results.length; i++) {
                const object = results[i];
                console.log(" -> Object id " + object.id)

                if (object.get('tags') != undefined && object.get('tags').length > 0) {
                  let tagsArray = []
                  for (let index = 0; index < object.get('tags').length; index++) {
                    const element = object.get('tags')[index];
                    tagsArray.push(element.id)
                  }
                  object.set("tags", tagsArray)
                  object.save()
                    .then(async (object) => {
                      console.log(' -> Updated tags to array with id ' + object.id)
                    }, (error) => {
                      console.log(' -> Failed to update tags to array, with error code: ' + error.message);
                    })
                }
              }
              resolve()

            } else {
              console.log(" -> No tags to update")
              resolve()
            }
          })
        }

        if (existingSchema.includes("tags")) {
          await copyTagsToArray()
        }
        await useUpdateLegacy("updateTagsArray")
        resolve()
      })
    }


    await useGetLegacy()

    if (legacy == undefined || legacy.length == 0) {
      await updateAvailableTags()
      await updateTags()
      await updateNotes()
      await updateTagsArray()
    }

    else if (legacy.length > 0) {
      let index1 = legacy.findIndex(obj => obj.name == "updateAvailableTagsWithPatterns")
      if (index1 == -1) {
        await updateAvailableTags()
      } else {
        console.log("  --> Legacy 'updateAvailableTags' done")
      }

      let index2 = legacy.findIndex(obj => obj.name == "updateSetupsToTags")
      if (index2 == -1) {
        await updateTags()
      } else {
        console.log("  --> Legacy 'updateSetupsToTags' done")
      }

      let index3 = legacy.findIndex(obj => obj.name == "updateNotes")
      if (index3 == -1) {
        await updateNotes()
      } else {
        console.log("  --> Legacy 'updateNotes' done")
      }

      let index4 = legacy.findIndex(obj => obj.name == "updateTagsArray")
      if (index4 == -1) {
        await updateTagsArray()
      } else {
        console.log("  --> Legacy 'updateTagsArray' done")
      }

    } else {
      console.log(" -> There is an issue with legacy")
    }
    resolve()
  })
}


</script>

<template>
  <main class="container" id="registerSignup">
    <form class="text-center col-md-4 offset-md-4 mt-5" v-on:submit.prevent="pageId == 'login' ? login() : register()">
      <img class="mb-4" src="">
      <h1 class="h3 mb-3 fw-normal">{{ pageId == 'login' ? "Please Log in" : "Please Register" }}</h1>
      <input type="email" id="inputEmail" class="form-control" placeholder="Email" required="" autofocus=""
        v-model="loginForm.username" autocomplete="username">
      <input type="password" id="inputPassword" class="mt-1 form-control" placeholder="Password" required=""
        v-model="loginForm.password" v-bind:autocomplete="pageId == 'login' ? 'current-password' : 'new-password'">
      <div v-if="pageId == 'register'">
        <p class="mt-3">Choose the timezone (of the market) your trades will be located and imported from.</p>
        <select v-model="loginForm.timeZone" class="form-select">
          <option v-for="item in timeZones" :key="item.value" :value="item">{{ item }}</option>
        </select>
      </div>
      <button class="mt-3 w-100 btn btn-lg btn-primary" type="submit" :disabled="signingUp">{{ pageId == 'login' ?
      "Log&nbsp;in" : "Register" }}<span v-if="signingUp" class="ms-2 spinner-border spinner-border-sm" role="status"
          aria-hidden="true"></span></button>
    </form>
    <div class="text-center mt-3"><a :href="pageId == 'login' ? '/register' : '/'">{{ pageId == 'login' ? "Register" :
      "Login" }}</a> page</div>
  </main>
</template>