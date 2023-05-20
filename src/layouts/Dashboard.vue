<script setup>
import SideMenu from '../components/SideMenu.vue'
import Nav from '../components/Nav.vue'
import { ref, reactive, onMounted, onBeforeMount } from 'vue'
import { useInitParse, usePageId, useScreenType, useSetSelectedLocalStorage, useInitIndexedDB } from '../utils/utils.js'

/*========================================
  Functions used on all Dashboard components
========================================*/
onBeforeMount(async () => {
  usePageId()
  useInitParse()
  await useSetSelectedLocalStorage()
})

const sideMenuMobileOut = ref(false)

function toggleMobileMenu() {
  let element = document.getElementById("sideMenu");
  element.classList.toggle("toggleSideMenu");
  sideMenuMobileOut.value = !sideMenuMobileOut.value
  console.log("sideMenuMobileOut " + sideMenuMobileOut.value)
}
</script>
<template>
  <div v-cloak class="container-fluid g-0">
    <div class="row g-0">
      <div id="sideMenu" v-bind:class="'min-vh-100 ' +
        (useScreenType() == 'computer' ? 'sideMenu col-2' : 'sideMenuMobile')
        ">
        <SideMenu />
      </div>
      <div class="col-12 col-lg-10 position-relative">
        <div v-show="sideMenuMobileOut" class="sideMenuMobileOut position-absolute" v-on:click="toggleMobileMenu"></div>
        <Nav />
        <main>
          <slot />
        </main>
      </div>
      <!--footer-->
    </div>
  </div>
</template>