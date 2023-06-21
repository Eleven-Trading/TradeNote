<script setup>
import { computed, ref, reactive, onMounted, onBeforeMount, defineAsyncComponent, onUpdated } from 'vue'
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import Filters from '../components/Filters.vue'
import { selectedDashTab, currentUser, patterns, spinnerLoadingPage, dashboardIdMounted, totals, totalsByDate, amountCase, amountCapital, profitAnalysis, renderData, selectedRatio, dashboardChartsMounted, filteredTrades, hasData, spinnerLoadingPageText, satisfactionArray } from '../stores/globals';
import { useInitShepherd, useInitTab, useThousandCurrencyFormat, useTwoDecCurrencyFormat, useTwoDecPercentFormat, useMountDashboard } from '../utils/utils';
import { useGetFilteredTrades, useTotalTrades, useCalculateProfitAnalysis } from '../utils/trades';
import NoData from '../components/NoData.vue';
import { useECharts } from '../utils/charts';
import { useTest } from "../stores/counter";

const dashTabs = [{
    id: "overviewTab",
    label: "Overview",
    target: "#overviewNav"
},
{
    id: "timeTab",
    label: "Time&Date",
    target: "#timeNav"
},
{
    id: "tradesTab",
    label: "Trades&Executions",
    target: "#tradesNav"
},
{
    id: "setupsTab",
    label: "Setups",
    target: "#setupsNav"
},
{
    id: "financialsTab",
    label: "Financials",
    target: "#financialsNav"
}
]
amountCapital.value = amountCase.value ? amountCase.value.charAt(0).toUpperCase() + amountCase.value.slice(1) : ''

const apptCompute = computed(() => {
    let temp = useTwoDecCurrencyFormat((totals['prob' + amountCapital.value + 'Wins'] * totals['avg' + amountCapital.value + 'Wins']) - (totals['prob' + amountCapital.value + 'Loss'] * totals['avg' + amountCapital.value + 'Loss']))
    console.log("temp " + temp)
    return temp
})

const appsptCompute = computed(() => {
    let temp = useTwoDecCurrencyFormat((totals['prob' + amountCapital.value + 'Wins'] * totals['avg' + amountCapital.value + 'SharePLWins']) - (totals['prob' + amountCapital.value + 'Loss'] * totals['avg' + amountCapital.value + 'SharePLLoss']))
    return temp
})

useMountDashboard()

</script>

<template>
    <SpinnerLoadingPage />
    <div class="row mt-2">

        <div v-show="!spinnerLoadingPage">
            <Filters />
            <div v-if="!hasData">
                <NoData />
            </div>
            <div v-else>
                <nav>
                    <div class="nav nav-tabs mb-2" id="nav-tab" role="tablist">
                        <button v-for="dashTab in dashTabs" :key="dashTab.id"
                            :class="'nav-link ' + (selectedDashTab == dashTab.id ? 'active' : '')" :id="dashTab.id"
                            data-bs-toggle="tab" :data-bs-target="dashTab.target" type="button" role="tab"
                            aria-controls="nav-overview" aria-selected="true">{{ dashTab.label }}</button>
                    </div>
                </nav>

                <div class="tab-content" id="nav-tabContent">

                    <!-- ============ OVERVIEW ============ -->
                    <div v-bind:class="'tab-pane fade ' + (selectedDashTab == 'overviewTab' ? 'active show' : '')"
                        id="overviewNav" role="tabpanel" aria-labelledby="nav-overview-tab">
                        <!-- ============ LINE 2: ID CARDS ============ -->
                        <div class="col-12 text-center">
                            <div class="row">

                                <div v-if="dashboardIdMounted">
                                    <!-- FIRST LINE -->
                                    <div class="col-12 mb-3">
                                        <div class="row">
                                            <div class="col-6 mb-2 mb-lg-0 col-lg-3">
                                                <div class="dailyCard">
                                                    <h4 class="titleWithDesc">
                                                        {{
                                                            useThousandCurrencyFormat(totals[amountCase
                                                                +
                                                                'Proceeds']) }}
                                                    </h4>
                                                    <span class="dashInfoTitle">Cumulated P&L</span>

                                                </div>
                                            </div>
                                            <div class="col-6 mb-2 mb-lg-0 col-lg-3">
                                                <div class="dailyCard">
                                                    <h4 class="titleWithDesc">
                                                        {{ apptCompute }}</h4>
                                                    <span class="dashInfoTitle">APPT</span>
                                                </div>
                                            </div>
                                            <div class="col-6 col-lg-3">
                                                <div class="dailyCard">
                                                    <h4 class="titleWithDesc">
                                                        <span v-if="!isNaN(profitAnalysis[amountCase + 'R'])">{{
                                                            (profitAnalysis[amountCase +
                                                                'R']).toFixed(2)
                                                        }}</span>
                                                        <span v-else>-</span>
                                                    </h4>
                                                    <span class="dashInfoTitle">P/L Ratio</span>
                                                </div>
                                            </div>
                                            <div class="col-6 col-lg-3">
                                                <div class="dailyCard">
                                                    <h4 class="titleWithDesc">
                                                        <span v-if="profitAnalysis[amountCase + 'MfeR'] != null">{{
                                                            (profitAnalysis[amountCase +
                                                                'MfeR']).toFixed(2)
                                                        }}</span>
                                                        <span v-else>-</span>
                                                    </h4>
                                                    <span class="dashInfoTitle">MFE P/L Ratio</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- SECOND LINE -->
                                    <div class="col-12">
                                        <div class="row">
                                            <!-- Left square -->
                                            <div class="col-12 col-lg-6">
                                                <!-- first line -->
                                                <div class="row mb-2">
                                                    <div class="col-6">
                                                        <div class="dailyCard">
                                                            <h5 class="titleWithDesc">
                                                                <span
                                                                    v-if="!isNaN(profitAnalysis[amountCase + 'AvWinPerShare'])">{{
                                                                        useTwoDecCurrencyFormat(profitAnalysis[amountCase +
                                                                            'AvWinPerShare'])
                                                                    }}</span>
                                                                <span v-else>-</span>
                                                            </h5>
                                                            <span class="dashInfoTitle">Win Per Share (avg.)</span>
                                                        </div>
                                                    </div>
                                                    <div class="col-6">
                                                        <div class="dailyCard">
                                                            <h5 class="titleWithDesc">
                                                                <span
                                                                    v-if="!isNaN(profitAnalysis[amountCase + 'AvLossPerShare'])">{{
                                                                        useTwoDecCurrencyFormat(profitAnalysis[amountCase +
                                                                            'AvLossPerShare'])
                                                                    }}</span>
                                                                <span v-else>-</span>
                                                            </h5>
                                                            <span class="dashInfoTitle">Loss Per Share (avg.)</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <!-- second line -->
                                                <div class="row mb-2 mb-lg-0">
                                                    <div class="col-6">
                                                        <div class="dailyCard">
                                                            <h5 class="titleWithDesc">
                                                                <span
                                                                    v-if="profitAnalysis[amountCase + 'HighWinPerShare'] > 0">{{
                                                                        useTwoDecCurrencyFormat(profitAnalysis[amountCase +
                                                                            'HighWinPerShare'])
                                                                    }}</span>
                                                                <span v-else>-</span>
                                                            </h5>
                                                            <span class="dashInfoTitle">Win Per Share (high)</span>
                                                        </div>
                                                    </div>
                                                    <div class="col-6">
                                                        <div class="dailyCard">
                                                            <h5 class="titleWithDesc">
                                                                <span
                                                                    v-if="profitAnalysis[amountCase + 'HighLossPerShare'] > 0">{{
                                                                        useTwoDecCurrencyFormat(profitAnalysis[amountCase +
                                                                            'HighLossPerShare']) }}</span>
                                                                <span v-else>-</span>
                                                            </h5>
                                                            <span class="dashInfoTitle">Loss Per Share (high)</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>


                                            <!-- Right square -->
                                            <div class="col-12 col-lg-6">
                                                <div class="row text-center mb-3">
                                                    <div class="col-6">
                                                        <div class="dailyCard">
                                                            <div v-if="dashboardIdMounted">
                                                                <div v-bind:key="renderData" id="pieChart1"
                                                                    class="chartIdCardClass">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div class="col-6">
                                                        <div v-if="dashboardIdMounted">
                                                            <div v-if="!satisfactionArray.length > 0" class="dailyCard">
                                                                <div
                                                                    class="chartIdCardClass d-flex align-items-center justify-content-center">
                                                                    <div>
                                                                        <div>-</div>
                                                                        <div class="dashInfoTitle">Satisfaction</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div v-show="satisfactionArray.length > 0" class="dailyCard">
                                                                <div v-bind:key="renderData" id="pieChart2"
                                                                    class="chartIdCardClass">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ============ LINE 3 : TOTAL CHARTS ============ -->
                        <div class="col-12">
                            <div class="row">
                                <!-- CUMULATIVE P&L -->
                                <div class="col-12 col-xl-6 mb-3">
                                    <div class="dailyCard">
                                        <h6>Cumulated P&L</h6>
                                        <!--<div class="text-center" v-if="!dashboardChartsMounted">
                                    <div class="spinner-border text-blue" role="status"></div>
                                </div>-->
                                        <div v-bind:key="renderData" id="lineBarChart1" class="chartClass"></div>
                                    </div>
                                </div>

                                <!-- PROFIT FACTOR -->
                                <div class="col-12 col-xl-6 mb-3">
                                    <div class="dailyCard">
                                        <h6>Profit Factor</h6>
                                        <!--<div class="text-center" v-if="!dashboardChartsMounted">
                                    <div class="spinner-border text-blue" role="status"></div>
                                </div>-->
                                        <div v-bind:key="renderData" id="lineChart1" class="chartClass"></div>
                                    </div>
                                </div>

                                <!-- APPT CHART -->
                                <div class="col-12 col-xl-6 mb-3">
                                    <div class="dailyCard">
                                        <h6 v-if="selectedRatio == 'appt'">Average Profit Per Trade (APPT)</h6>
                                        <h6 v-else>Average Profit Per Share Per Trade (APPSPT)</h6>
                                        <!--<div class="text-center" v-if="!dashboardChartsMounted">
                                    <div class="spinner-border text-blue" role="status"></div>
                                </div>-->
                                        <div v-bind:key="renderData" id="barChart1" class="chartClass"></div>
                                    </div>
                                </div>

                                <!-- WIN LOSS CHART -->
                                <div class="col-12 col-xl-6 mb-3">
                                    <div class="dailyCard">
                                        <h6>Win Rate</h6>
                                        <!--<div class="text-center" v-if="!dashboardChartsMounted">
                                    <div class="spinner-border text-blue" role="status"></div>
                                </div>-->
                                        <div v-bind:key="renderData" id="barChart2" class="chartClass"></div>
                                    </div>
                                </div>

                                <!-- RISK REWARD CHART
                    <div class="col-12 col-xl-6 mb-3">
                        <div class="dailyCard">
                            <h6>Risk & Reward</h6>
                            <div class="text-center" v-if="!dashboardChartsMounted">
                                <div class="spinner-border text-blue" role="status"></div>
                            </div>
                            <div v-bind:key="renderData" id="boxPlotChart1" class="chartClass"></div>
                        </div>
                    </div>-->

                            </div>
                        </div>

                    </div>

                    <!-- ============ TIME ============ -->
                    <div v-bind:class="'tab-pane fade ' + (selectedDashTab == 'timeTab' ? 'active show' : '')" id="timeNav"
                        role="tabpanel" aria-labelledby="nav-time-tab">
                        <div class="col-12">
                            <div class="row">

                                <!-- GROUP BY TIMEFRAME -->
                                <div class="col-12 col-xl-4 mb-3">
                                    <div class="dailyCard">
                                        <h6>Group by Timeframe (<span v-if="selectedRatio == 'appt'">APPT</span>
                                            <span v-else>APPST</span>)
                                        </h6>
                                        <!--<div class="text-center" v-if="!dashboardChartsMounted">
                                    <div class="spinner-border text-blue" role="status"></div>
                                </div>-->
                                        <div v-bind:key="renderData" id="barChartNegative1" class="chartClass"></div>
                                    </div>
                                </div>

                                <!-- GROUP BY DURATION -->
                                <div class="col-12 col-xl-4 mb-3">
                                    <div class="dailyCard">
                                        <h6>Group by Duration (<span v-if="selectedRatio == 'appt'">APPT</span>
                                            <span v-else>APPST</span>)
                                        </h6>
                                        <!--<div class="text-center" v-if="!dashboardChartsMounted">
                                    <div class="spinner-border text-blue" role="status"></div>
                                </div>-->
                                        <div v-bind:key="renderData" id="barChartNegative2" class="chartClass"></div>
                                    </div>
                                </div>

                                <!-- GROUP BY DAY OF WEEK -->
                                <div class="col-12 col-xl-4 mb-3">
                                    <div class="dailyCard">
                                        <h6>Group by Day of Week (<span v-if="selectedRatio == 'appt'">APPT</span>
                                            <span v-else>APPST</span>)
                                        </h6>
                                        <!--<div class="text-center" v-if="!dashboardChartsMounted">
                                    <div class="spinner-border text-blue" role="status"></div>
                                </div>-->
                                        <div v-bind:key="renderData" id="barChartNegative3" class="chartClass"></div>
                                    </div>
                                </div>

                                <!-- SCATTER WINS -->
                                <div class="col-12">
                                    <div class="dailyCard">
                                        <h6>Scatter Wins</h6>
                                        <div v-bind:key="renderData" id="scatterChart1" class="chartClass"></div>
                                    </div>
                                </div>

                                <!-- SCATTER LOSSES -->
                                <div class="col-12">
                                    <div class="dailyCard">
                                        <h6>Scatter Losses</h6>
                                        <div v-bind:key="renderData" id="scatterChart2" class="chartClass"></div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <!-- ============ TRADES ============ -->
                    <div v-bind:class="'tab-pane fade ' + (selectedDashTab == 'tradesTab' ? 'active show' : '')"
                        id="tradesNav" role="tabpanel" aria-labelledby="nav-trades-tab">
                        <div class="col-12">
                            <div class="row">

                                <!-- GROUP BY TRADES -->
                                <div class="col-12 col-xl-6 mb-3">
                                    <div class="dailyCard">
                                        <h6>Group by Trades</h6>
                                        <!--<div class="text-center" v-if="!dashboardChartsMounted">
                                    <div class="spinner-border text-blue" role="status"></div>
                                </div>-->
                                        <div v-bind:key="renderData" id="barChartNegative4" class="chartClass"></div>
                                    </div>
                                </div>

                                <!-- GROUP BY EXECUTIONS -->
                                <div class="col-12 col-xl-6 mb-3">
                                    <div class="dailyCard">
                                        <h6>Group by Executions</h6>
                                        <!--<div class="text-center" v-if="!dashboardChartsMounted">
                                    <div class="spinner-border text-blue" role="status"></div>
                                </div>-->
                                        <div v-bind:key="renderData" id="barChartNegative7" class="chartClass"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ============ SETUPS ============ -->
                    <div v-bind:class="'tab-pane fade ' + (selectedDashTab == 'setupsTab' ? 'active show' : '')"
                        id="setupsNav" role="tabpanel" aria-labelledby="nav-setups-tab">
                        <div class="col-12">
                            <div class="row">

                                <!-- GROUP BY PATTERN -->
                                <div class="col-12 col-xl-6 mb-3">
                                    <div class="dailyCard">
                                        <h6>Group by Pattern</h6>
                                        <div class="text-center" v-if="!dashboardChartsMounted">
                                            <div class="spinner-border text-blue" role="status"></div>
                                        </div>
                                        <div v-bind:key="renderData" id="barChartNegative10" class="chartClass"></div>
                                    </div>
                                </div>
                                <!-- GROUP BY PATTERN TYPE
                        <div class="col-12 col-xl-4 mb-3">
                            <div class="dailyCard">
                                <h6>Group by Pattern Type</h6>
                                <div class="text-center" v-if="!dashboardChartsMounted">
                                    <div class="spinner-border text-blue" role="status"></div>
                                </div>
                                <div v-bind:key="renderData" id="barChartNegative11" class="chartClass"></div>
                            </div>
                        </div> -->

                                <!-- GROUP BY MISTAKES -->
                                <div class="col-12 col-xl-6 mb-3">
                                    <div class="dailyCard">
                                        <h6>Group by Mistake</h6>
                                        <div class="text-center" v-if="!dashboardChartsMounted">
                                            <div class="spinner-border text-blue" role="status"></div>
                                        </div>
                                        <div v-bind:key="renderData" id="barChartNegative15" class="chartClass"></div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <!-- ============ FINANCIALS ============ -->
                    <div v-bind:class="'tab-pane fade ' + (selectedDashTab == 'financialsTab' ? 'active show' : '')"
                        id="financialsNav" role="tabpanel" aria-labelledby="nav-financials-tab">
                        <div class="col-12">
                            <div class="row">

                                <!-- GROUP BY SYMBOL -->
                                <div class="col-12 col-xl-6 mb-3">
                                    <div class="dailyCard">
                                        <h6>Group by Symbol</h6>
                                        <!--<div class="text-center" v-if="!dashboardChartsMounted">
                                    <div class="spinner-border text-blue" role="status"></div>
                                </div>-->
                                        <div v-bind:key="renderData" id="barChartNegative16" class="chartClass"></div>
                                    </div>
                                </div>

                                <!-- GROUP BY FLOAT
                        <div class="col-12 col-xl-4 mb-3">
                            <div class="dailyCard">
                                <h6>Group by Share Float</h6>
                                <div class="text-center" v-if="!dashboardChartsMounted">
                                    <div class="spinner-border text-blue" role="status"></div>
                                </div>
                                <div v-bind:key="renderData" id="barChartNegative12" class="chartClass"></div>
                            </div>
                        </div>-->

                                <!-- GROUP BY MARKET CAP
                        <div class="col-12 col-xl-4 mb-3">
                            <div class="dailyCard">
                                <h6>Group by Market Cap</h6>
                                <div class="text-center" v-if="!dashboardChartsMounted">
                                    <div class="spinner-border text-blue" role="status"></div>
                                </div>
                                <div v-bind:key="renderData" id="barChartNegative14" class="chartClass"></div>
                            </div>
                        </div>-->

                                <!-- GROUP BY ENTRYPRICE -->
                                <div class="col-12 col-xl-6 mb-3">
                                    <div class="dailyCard">
                                        <h6>Group by Entry Price</h6>
                                        <!--<div class="text-center" v-if="!dashboardChartsMounted">
                                    <div class="spinner-border text-blue" role="status"></div>
                                </div>-->
                                        <div v-bind:key="renderData" id="barChartNegative13" class="chartClass"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>
