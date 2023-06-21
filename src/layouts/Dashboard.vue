<script setup>
import SideMenu from '../components/SideMenu.vue'
import Nav from '../components/Nav.vue'
import { onBeforeMount } from 'vue'
import { useInitParse, usePageId, useScreenType, useGetTimeZone, useGetPeriods, useInitPostHog } from '../utils/utils.js'
import { screenType, sideMenuMobileOut } from '../stores/globals'

/*========================================
  Functions used on all Dashboard components
========================================*/
onBeforeMount (async () => {
  usePageId()
  useInitParse()
  useGetTimeZone()
  useGetPeriods()
  useScreenType()
})
useInitPostHog()
</script>
<template>
  <div v-cloak class="container-fluid g-0">
    <div class="row g-0">
      <div id="sideMenu" v-bind:class="'min-vh-100 ' +
        (screenType == 'computer' ? 'sideMenu col-2' : 'sideMenuMobile')
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