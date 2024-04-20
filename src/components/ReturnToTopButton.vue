<script setup>
    import { windowIsScrolled } from "../stores/globals";
    import { returnToTop, useCheckIfWindowIsScrolled } from "../utils/utils";
    useCheckIfWindowIsScrolled();
</script>

<template>
    <button class="btn blueBtn btn-sm" id="btn-return-to-top" v-show="windowIsScrolled" v-on:click="returnToTop">
        <i class="uil uil-arrow-up"></i>
    </button>
</template>