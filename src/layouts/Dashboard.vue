<script setup>
import SideMenu from '../components/SideMenu.vue'
import Nav from '../components/Nav.vue'
import { onBeforeMount } from 'vue'
import { useInitParse, usePageId, useScreenType, useGetTimeZone, useGetPeriods, useInitPostHog, useCreatedDateFormat, useTimeFormat, useHourMinuteFormat } from '../utils/utils.js'
import { screenType, sideMenuMobileOut, expandedScreenshot, screenshots, setups } from '../stores/globals'

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
          <i class="uil uil-times pointerClass" v-on:click="expandedScreenshot = null"></i>
        </div>
        <div id="setupsCarousel" class="col-12 carousel slide">
          <div class="carousel-inner">
            <div v-for="(screenshot, index) in screenshots"
              v-bind:class="[expandedScreenshot === screenshot.objectId ? 'active' : '', 'carousel-item', 'row']">
              <div class="col-12">
                <div>{{ useCreatedDateFormat(screenshot.dateUnix) }}
                <span class="ms-2">- {{ screenshot.symbol }}
                  <span v-if="screenshot.side"> | {{ screenshot.side == 'SS' || screenshot.side == 'BC' ?
                    'Short' :
                    'Long' }} | {{ useTimeFormat(screenshot.dateUnix) }}</span>
                  <span v-else class="col mb-2"> | {{ useHourMinuteFormat(screenshot.dateUnix) }}</span>
                  <span
                    v-if="setups.findIndex(obj => obj.tradeId == screenshot.name) != -1 && setups[setups.findIndex(obj => obj.tradeId == screenshot.name)].pattern.name != null">
                    | {{ setups[setups.findIndex(obj =>
                      obj.tradeId == screenshot.name)].pattern.name }}</span>
                </span></div>
              </div>
              <div class="imgContainer">
                <img v-if="screenshot.markersOnly" class="screenshotImg mt-3 img-fluid"
                  v-bind:src="screenshot.originalBase64" />
                <img v-bind:class="[screenshot.markersOnly ? 'overlayImg' : '', 'screenshotImg mt-3 img-fluid']"
                  v-bind:src="screenshot.annotatedBase64" />
                <button class="carousel-control-prev" type="button" data-bs-target="#setupsCarousel"
                  data-bs-slide="prev"><i class="fa fa-chevron-left"></i></button>
                <button class="carousel-control-next" type="button" data-bs-target="#setupsCarousel"
                  data-bs-slide="next"><i class="fa fa-chevron-right"></i></button>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12">

        </div>
      </div>
    </div>
  </div>
</template>