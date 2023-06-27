<script setup>
import SideMenu from '../components/SideMenu.vue'
import Nav from '../components/Nav.vue'
import FullScreenImg from '../components/FullScreenImg.vue'
import { onBeforeMount } from 'vue'
import { useInitParse, usePageId, useScreenType, useGetTimeZone, useGetPeriods, useInitPostHog, useCreatedDateFormat, useTimeFormat, useHourMinuteFormat } from '../utils/utils.js'
import { screenType, sideMenuMobileOut, expandedScreenshot, screenshots, setups, pageId, screenshot } from '../stores/globals'

/*========================================
  Functions used on all Dashboard components
========================================*/
onBeforeMount(async () => {
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
  <div class="row">
    <div v-if="expandedScreenshot" class="fullScreen col-12">
      <div class="row">
        <div class="col-12 ms-auto text-end">
          <i class="uil uil-times pointerClass txt-x-large" v-on:click="expandedScreenshot = null"></i>
        </div>
        <div v-if="pageId == 'screenshots'">
          <div id="setupsCarousel" class="col-12 carousel slide">
            <div class="carousel-inner">
              <div v-for="(itemScreenshot, index) in screenshots"
                v-bind:class="[expandedScreenshot === itemScreenshot.objectId ? 'active' : '', 'carousel-item', 'row']">
                <FullScreenImg :screenshot-data="itemScreenshot"/>
              </div>
            </div>
          </div>
        </div>
        <div v-if="pageId == 'daily'">
          <FullScreenImg :screenshot-data="screenshot"/>
        </div>
      </div>
    </div>
  </div>
</template>