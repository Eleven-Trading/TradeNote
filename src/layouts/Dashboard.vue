<script setup>
import SideMenu from '../components/SideMenu.vue'
import Nav from '../components/Nav.vue'
import Screenshot from '../components/Screenshot.vue'
import ReturnToTopButton from '../components/ReturnToTopButton.vue'
import { onBeforeMount } from 'vue'
import { useInitParse, usePageId, useScreenType, useGetTimeZone, useGetPeriods, useInitPostHog, useCreatedDateFormat, useTimeFormat, useHourMinuteFormat } from '../utils/utils.js'
import { screenType, sideMenuMobileOut, screenshots, pageId, screenshot, selectedScreenshot, selectedScreenshotIndex, getMore } from '../stores/globals'
import { useSelectedScreenshotFunction } from '../utils/screenshots'

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
  <ReturnToTopButton />
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
  <!-- Modal -->
  <div class="modal fade" id="fullScreenModal" tabindex="-1" aria-labelledby="fullScreenModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-body">
          <Screenshot :index="selectedScreenshotIndex" source="fullScreen" :screenshot-data="selectedScreenshot" />
        </div>
        <div class="modal-footer">
          <!-- NEXT / PREVIOUS -->
          
            <div class="text-start">
              <button v-if="selectedScreenshotIndex - 1 >= 0" class="btn btn-outline-primary btn-sm ms-3 mb-2"
                v-on:click="useSelectedScreenshotFunction((selectedScreenshotIndex - 1), 'fullScreen')">
                <i class="fa fa-chevron-left me-2"></i></button>
            </div>
            <div v-if="selectedScreenshotIndex + 1 > 0 && screenshots[selectedScreenshotIndex + 1]"
              class="ms-auto text-end">
              <button class="btn btn-outline-primary btn-sm me-3 mb-2"
                v-on:click="useSelectedScreenshotFunction((selectedScreenshotIndex + 1), 'fullScreen')"
                :disabled="getMore"><span v-if="!getMore"><i class="fa fa-chevron-right ms-2"></i></span>
                <span v-else>
                  <div class="spinner-border spinner-border-sm" role="status">
                  </div>
                </span>
              </button>
            </div>
          
        </div>
      </div>
    </div>
  </div>
</template>