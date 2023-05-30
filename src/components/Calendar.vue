<script setup>
import { onBeforeMount } from 'vue';
import { pageId, selectedMonth, selectedPlSatisfaction, amountCase, calendarData, miniCalendarsData, timeZoneTrade, spinnerLoadingPage, periodRange, renderingCharts, selectedRange, filteredTradesTrades } from '../stores/globals';
import { useThousandCurrencyFormat, useMountCalendar, useMountDaily } from '../utils/utils';
import { useGetFilteredTrades } from '../utils/trades';
import { useLoadCalendar } from '../utils/calendar'

const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

//console.log("perdio range "+JSON.stringify(periodRange))

async function monthLastNext(param) {
    await (spinnerLoadingPage.value = true)
    selectedMonth.value.start = dayjs.tz(selectedMonth.value.start * 1000, timeZoneTrade.value).add(param, 'month').startOf('month').unix()
    /* reuse just created .start because we only show one month at a time */
    selectedMonth.value.end = dayjs.tz(selectedMonth.value.start * 1000, timeZoneTrade.value).endOf('month').unix()
    //console.log("selectedMonth.value.start " + selectedMonth.value.start+" selectedMonth.value.end " + selectedMonth.value.end)
    localStorage.setItem('selectedMonth', JSON.stringify(selectedMonth.value))
    
    if (pageId.value == "calendar") {
        useMountCalendar()
    }

    if (pageId.value == "daily") {
        useMountDaily()
    }
}
</script>
<template>
    <div class="col-12">
        <div v-bind:class="[pageId === 'calendar' ? 'justify-content-center' : '', 'row']">
            <div v-bind:class="[pageId === 'calendar' ? 'col-md-9 col-xl-6' : '', 'col-12']">
                <div class="row">
                    <div class="col-2">
                        <i class="uil uil-angle-left-b pointerClass" v-on:click="monthLastNext(-1)"></i>
                    </div>
                    <div class="col-8">
                        <span v-if="calendarData.hasOwnProperty(0)">{{ calendarData[0][0].month }}</span>
                    </div>
                    <div class="col-2">
                        <i class="uil uil-angle-right-b pointerClass" v-on:click="monthLastNext(1)"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-bind:class="[pageId === 'calendar' ? 'col-md-9 col-xl-6 mb-5' : '', 'col-12']">
        <div class="row">
            <div class="col" v-for="(day, index) in days">
                <div>{{ day }}</div>
                <div v-for="line in calendarData">
                    <div class="row">
                        <div v-show="line[index] != 0"
                            v-bind:class="[{ 'greenTradeDiv': selectedPlSatisfaction == 'pl' ? line[index].pAndL[amountCase + 'Proceeds'] >= 0 : line[index].satisfaction == true, 'redTradeDiv': selectedPlSatisfaction == 'pl' ? line[index].pAndL[amountCase + 'Proceeds'] < 0 : line[index].satisfaction == false, 'calDivDay': pageId == 'daily', 'calDivDash': pageId == 'calendar' }, 'col']">
                            <p class="mb-1 dayNumber" v-show="line[index].day != 0">{{ line[index].day }}</p>
                            <div v-if="pageId == 'calendar'" class="d-none d-md-block">
                                <p v-show="line[index].pAndL.trades">{{ line[index].pAndL.trades }} trades</p>
                                <p v-show="line[index].pAndL[amountCase + 'Proceeds']">
                                    {{ useThousandCurrencyFormat(parseInt(line[index].pAndL[amountCase + 'Proceeds'])) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-show="pageId == 'calendar'" class="col-12">
        <div class="row">
            <div class="col-12 col-md-4 col-xl-3 mb-3" v-for="(calData, index) in miniCalendarsData">
                <div class="row me-2">
                    <div>{{ calData[0][0].month }}</div>
                    <div class="col miniCalBox" v-for="(day, index) in days">
                        <div>{{ day }}</div>
                        <div v-for="line in calData">
                            <div class="row">
                                <div v-show="line[index] != 0"
                                    v-bind:class="[{ 'greenTradeDiv': selectedPlSatisfaction == 'pl' ? line[index].pAndL[amountCase + 'Proceeds'] >= 0 : line[index].satisfaction == true, 'redTradeDiv': selectedPlSatisfaction == 'pl' ? line[index].pAndL[amountCase + 'Proceeds'] < 0 : line[index].satisfaction == false }, 'calDivMini', 'col']">
                                    <p class="mb-1 dayNumber" v-show="line[index].day != 0">{{ line[index].day }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>