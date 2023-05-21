<script setup>
import { ref, reactive, onMounted } from 'vue'
import { pageId } from '../stores/globals';
import { useInitParse, usePageId } from '../utils/utils';

const loginForm = reactive({ username: null, password: null })
const signingUp = ref(false)


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

async function updateSchema() {
  return new Promise((resolve, reject) => {
    console.log(" -> Updating schema")
    axios.post('/updateSchemas').then((response) => {
      //console.log(response);
      resolve(response)
    })
      .catch((error) => {
        console.log("Error get app id " + error);
        reject(error)
      });
  })
}

async function register() {
  console.log("\nREGISTER")
  signingUp.value = true
  if (!localStorage.getItem('parse_app_id')) {
    alert("Missing App ID. Please make sure you entered correct App ID during runtime.")
    return
  }
  let updateSchemaFunction = await updateSchema()
  console.log("status " + updateSchemaFunction.status)
  if (updateSchemaFunction.status == 200) {
    const user = new Parse.User();
    user.set("username", loginForm.username);
    user.set("password", loginForm.password);
    user.set("email", loginForm.username);

    try {
      await user.signUp();
      console.log("Hooray! Let them use the app now")
      window.location.replace("/");
    } catch (error) {
      // Show the error message somewhere and let the user try again.
      alert("Error: " + error.code + " " + error.message);
    }
  } else {
    signingUp.value = false
    alert("Error updating schema " + updateSchema)
  }
}

</script>

<template>
  <main class="container" id="registerSignup">
    <form class="text-center col-md-4 offset-md-4 mt-5" v-on:submit.prevent="pageId == 'login' ? login() : register()">
      <img class="mb-4" src="">
      <h1 class="h3 mb-3 fw-normal">{{ pageId == 'login' ? "Please Login" : "Please Register" }}</h1>
      <input type="email" id="inputEmail" class="form-control" placeholder="Email" required="" autofocus=""
        v-model="loginForm.username">
      <input type="password" id="inputPassword" class="mt-1 form-control" placeholder="Password" required=""
        v-model="loginForm.password">
      <button class="mt-3 w-100 btn btn-lg btn-primary" type="submit" :disabled="signingUp">{{ pageId == 'login' ? 'Sign In' : 'Register' }}<span v-if="signingUp" class="ms-2 spinner-border spinner-border-sm" role="status"
          aria-hidden="true"></span></button>
    </form>
    <div class="text-center mt-3"><a :href="pageId == 'login' ? '/register' : '/'">{{ pageId == 'login' ? "Register" :
      "Login" }}</a> page</div>
  </main>
</template>