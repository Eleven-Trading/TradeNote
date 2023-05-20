<script setup>
import { ref, reactive, onBeforeMount, onMounted, defineAsyncComponent } from 'vue'
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import Filters from '../components/Filters.vue'
import NoData from '../components/NoData.vue';
import Calendar from '../components/Calendar.vue';
import { spinnerLoadingPage, calendarData, filteredTrades } from '../stores/globals';
import { useInitIndexedDB } from '../utils/utils'
import { useLoadCalendar } from '../utils/calendar';

onBeforeMount(async () => {
    await (spinnerLoadingPage.value = true)
    await useInitIndexedDB()
    await useLoadCalendar(true) // no need for filtered trades just 3months back or all. And you get them either from indexedDB or from Parse DB
    await (spinnerLoadingPage.value = false)
})
</script>

<template>
    <DashboardLayout>
        <SpinnerLoadingPage />
        <div class="row mt-2 mb-2">
            <div v-if="filteredTrades.length == 0">
                <NoData />
            </div>
            <div v-else>
                <Filters />
                <div v-show="!spinnerLoadingPage">
                    <!-- ============ CALENDAR ============ -->
                    <div v-show="calendarData" class="col-12 text-center mt-2 align-self-start">
                        <div class="dailyCard">
                            <div class="row justify-content-center">
                                <Calendar />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </DashboardLayout>
</template>