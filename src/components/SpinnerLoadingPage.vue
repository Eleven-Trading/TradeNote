<script setup>
import { spinnerLoadingPage } from '../stores/globals';
</script>
<template>
    <div v-show="spinnerLoadingPage" class="text-center overlay">
        <div class="d-flex justify-content-center">
            <div class="spinner-border text-blue" role="status"></div>
        </div>
        {{ spinnerLoadingPageText }}
    </div>
</template>