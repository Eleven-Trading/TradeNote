<script setup>
import { pageId, screenType } from "../stores/globals"
import { useToggleMobileMenu } from "../utils/utils";

</script>

<template>
    <div class="col-2 logoDiv d-flex align-items-center justify-content-center">
        <span v-if="screenType == 'mobile'">
            <a v-on:click="useToggleMobileMenu"><img src="../assets/sun_full_blue.png" class="logo me-2" />TradeNote</a>
        </span>
        <span v-else><img src="../assets/sun_full_blue.png" class="logo me-2" />TradeNote</span>
    </div>
    <div id="step2">
        <div class="sideMenuDiv">
            <div class="sideMenuDivContent">
                <label class="fw-lighter">ANALYZE</label>
                <a id="step3" v-bind:class="[pageId === 'dashboard' ? 'activeNavCss' : '', 'nav-link', 'mb-2']"
                    href="/dashboard">
                    <i class="uil uil-apps me-2"></i>Dashboard</a>
                <a id="step4" v-bind:class="[pageId === 'daily' ? 'activeNavCss' : '', 'nav-link', 'mb-2']" href="/daily">
                    <i class="uil uil-signal-alt-3 me-2"></i>Daily
                </a>
                <a id="step5" v-bind:class="[pageId === 'calendar' ? 'activeNavCss' : '', 'nav-link', 'mb-2']"
                    href="/calendar">
                    <i class="uil uil-calendar-alt me-2"></i>Calendar</a>
            </div>
        </div>

        <div class="sideMenuDiv">
            <div class="sideMenuDivContent">
                <label class="fw-lighter mt-3">Reflect</label>
                <a id="step6" v-bind:class="[pageId === 'diary' ? 'activeNavCss' : '', 'nav-link', 'mb-2']" href="/diary">
                    <i class="uil uil-diary me-2"></i>Diary
                </a>
                <a id="step7" v-bind:class="[pageId === 'screenshots' ? 'activeNavCss' : '', 'nav-link', 'mb-2']"
                    href="/screenshots">
                    <i class="uil uil-image-v me-2"></i>Screenshots
                </a>
                <a id="step8" v-bind:class="[pageId === 'playbook' ? 'activeNavCss' : '', 'nav-link', 'mb-2']"
                    href="/playbook">
                    <i class="uil uil-compass me-2"></i>Playbook
                </a>
            </div>
        </div>
    </div>
</template>