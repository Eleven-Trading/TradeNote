<script setup>
import { onBeforeMount, onMounted } from 'vue';
import { useInitParse, useInitPostHog, usePageId } from '../utils/utils.js'
onBeforeMount(async() =>{
  usePageId()
  await getParseId()
  await useInitParse()
})
onMounted(async() => {
  
})

useInitPostHog()

async function getParseId() {
  return new Promise((resolve, reject) => {
    console.log("\nGETTING APP ID")
    axios.post('/parseAppId')
      .then((response) => {
        //console.log(response);
        localStorage.setItem('parse_app_id', response.data)
        console.log("  --> App id in localstorage "+localStorage.getItem('parse_app_id'))
        resolve()
      })
      .catch((error) => {
        console.log(" -> Error getting app id " + error)
        reject(error)
      });


  })
}
</script>
<template>
  <header class="text-center">
    <!-- Fixed navbar -->
    <img class="navLogo" />
  </header>
  <slot />
</template>