<script setup>
import { ref, onBeforeMount } from "vue";
import { useMonthFormat, useDateCalFormat, useDateCalFormatMonth, useMountCalendar, useMountDashboard, useMountDaily, useCheckVisibleScreen } from "../utils/utils.js";
import { pageId, currentUser, timeZoneTrade, periodRange, positions, timeFrames, ratios, grossNet, plSatisfaction, selectedPositions, selectedTimeFrame, selectedRatio, selectedAccounts, selectedGrossNet, selectedPlSatisfaction, selectedDateRange, selectedMonth, selectedPeriodRange, tempSelectedPlSatisfaction, amountCase, amountCapital, hasData, selectedTags, tags, availableTags } from "../stores/globals"
import { useECharts } from "../utils/charts.js";
import { useRefreshScreenshot } from "../utils/screenshots"

/*============================================
    VARIABLES
============================================*/

let filtersOpen = ref(false)
let filters = ref({
    "dashboard": ["accounts", "periodRange", "grossNet", "positions", "timeFrame", "ratio", "tags"],
    "calendar": ["month", "grossNet", "plSatisfaction"],
    "daily": ["accounts", "month", "grossNet", "positions", "tags"],
    "screenshots": ["accounts", "grossNet", "positions", "tags"],
})



/*if (selectedDateRange.value) {
    console.log(" -> Filtering date range")
    let tempFilter = periodRange.filter(element => element.start == selectedDateRange.value.start && element.end == selectedDateRange.value.end)
    if (tempFilter.length > 0) {
        selectedPeriodRange.value = tempFilter[0]
    } else {
        console.log(" -> Custom range in vue")
        selectedPeriodRange.value = periodRange.filter(element => element.start == -1)[0]
    }
}*/
//console.log(" -> Selected date range "+JSON.stringify(selectedPeriodRange))


//IMPORTANT : when exists in localstorage but is empty, then == ''. When does not exist in localstorage then == null. As it may be empty, we take the case of null


/*============================================
    LIFECYCLE
============================================*/
onBeforeMount(async () => {

})
/*============================================
    FUNCTIONS
============================================*/
function filtersClick() {
    filtersOpen.value = !filtersOpen.value
    //console.log(" -> Filters click: Selected Period Range " + JSON.stringify(selectedPeriodRange))
    //console.log(" -> Filters click: Selected Date Range Cal " + JSON.stringify(selectedDateRange))

    if (!filtersOpen.value) { //It's like clicking cancel of not saving so we remove data / go back to old data 

        // Restore Selected Date range cal
        selectedDateRange.value = JSON.parse(localStorage.getItem('selectedDateRange'))
        //console.log(" -> Filters click (close): Selected Date Range Cal " + JSON.stringify(selectedDateRange))
        //console.log(" periodRange "+JSON.stringify(periodRange))
        // Restore Selected Period range
        //console.log(" selectedDateRange "+JSON.stringify(selectedDateRange.value))
        let tempFilter = periodRange.filter(element => element.start == selectedDateRange.value.start && element.end == selectedDateRange.value.end)

        if (tempFilter.length > 0) {
            selectedPeriodRange.value = tempFilter[0]
        } else {
            //console.log(" -> Custom range in trades mixin")
            //console.log(" periodRange 2 " + JSON.stringify(periodRange))
            selectedPeriodRange.value = periodRange.filter(element => element.start == -1)[0]
        }

        //console.log(" -> Filters click (on close): Selected Period Range " + JSON.stringify(selectedPeriodRange))

        // Restore temp selected accounts
        if (localStorage.getItem('selectedAccounts')) {
            if (localStorage.getItem('selectedAccounts').includes(",")) {
                selectedAccounts.value = localStorage.getItem('selectedAccounts').split(",")
            } else {
                selectedAccounts.value = []
                selectedAccounts.value.push(localStorage.getItem('selectedAccounts'))
            }
        } else {
            selectedAccounts.value = []
        }


        //console.log(" Selected accounts " + selectedAccounts)

        //Restore gross net
        selectedGrossNet.value = localStorage.getItem('selectedGrossNet')
        //console.log(" Selected accounts " + selectedAccounts)

        // Restore temp selected positions
        if (localStorage.getItem('selectedPositions')) {
            if (localStorage.getItem('selectedPositions').includes(",")) {
                selectedPositions.value = localStorage.getItem('selectedPositions').split(",")
            } else {
                selectedPositions.value = []
                selectedPositions.value.push(localStorage.getItem('selectedPositions'))
            }
        } else {
            selectedPositions.value = []
        }

        selectedTimeFrame.value = localStorage.getItem('selectedTimeFrame')
        //console.log(" Selected timeframe " + selectedTimeFrame)

        selectedRatio.value = localStorage.getItem('selectedRatio')
        //console.log(" Selected ratio " + selectedRatio)

        selectedMonth.value = JSON.parse(localStorage.getItem('selectedMonth'))
        //console.log(" Selected Month " + JSON.stringify(selectedMonth))

        if (localStorage.getItem('selectedTags')) {
            if (localStorage.getItem('selectedTags').includes(",")) {
                selectedTags.value = localStorage.getItem('selectedTags').split(",")
            } else {
                selectedTags.value = []
                selectedTags.value.push(localStorage.getItem('selectedTags'))
            }
        } else {
            selectedTags.value = []
        }
    }
}

//Date : periode
function inputDateRange(param) {
    //console.log(" -> Input Date Range - Param: "+param)
    //Filter to find the value of date range
    var filterJson = periodRange.filter(element => element.value == param)[0]
    selectedPeriodRange.value = filterJson
    //console.log(" -> Input range: Selected Date Range " + JSON.stringify(selectedPeriodRange.value))

    //Created selected Date range calendar mode
    let temp = {}
    temp.start = selectedPeriodRange.value.start
    temp.end = selectedPeriodRange.value.end
    selectedDateRange.value = temp
    //console.log(" -> Input range : Selected Date Range Cal " + JSON.stringify(selectedDateRange.value))

}
//Date : calendar
function inputDateRangeCal(param1, param2) {
    //console.log("param1 " + param1 + ", param2 " + param2)
    //console.log(" -> Initial selectedDateRange " + JSON.stringify(selectedDateRange.value))

    if (param1 == "start") {
        selectedDateRange.value.start = dayjs.tz(param2, timeZoneTrade.value).unix()
    }
    if (param1 == "end") {
        selectedDateRange.value.end = dayjs.tz(param2, timeZoneTrade.value).endOf("day").unix() // it must be tz(...). It cannot be dayjs().t
    }


    //console.log("selectedDateRange " + JSON.stringify(selectedDateRange.value))

    /* Update selectedPeriodRange */
    let tempFilter = periodRange.filter(element => element.start == selectedDateRange.value.start && element.end == selectedDateRange.value.end)
    if (tempFilter.length > 0) {
        selectedPeriodRange.value = tempFilter[0]
    } else {
        //console.log(" -> Custom range in trades mixin")
        selectedPeriodRange.value = periodRange.filter(element => element.start == -1)[0]
    }
}

function inputMonth(param1) {
    //console.log(" param1 " + param1)
    let temp = {}
    temp.start = dayjs.tz(param1, timeZoneTrade.value).unix()
    temp.end = dayjs.tz(param1, timeZoneTrade.value).endOf("month").unix()
    selectedMonth.value = temp
    //console.log(" -> Selected Month "+JSON.stringify(selectedMonth.value))
}

async function saveFilter() {
    //console.log(" -> Save filters: Selected Date Range Cal " + JSON.stringify(selectedDateRange.value))
    //console.log(" -> Selected accounts "+selectedAccounts.value)
    // Check if start date before end date and vice versa
    if (selectedDateRange.value.end < selectedDateRange.value.start) {
        alert("End date cannot be before start date")
        return
    } else {
        localStorage.setItem('selectedDateRange', JSON.stringify(selectedDateRange.value))
    }


    if (pageId.value == "dashboard" && selectedDateRange.value.end >= selectedDateRange.value.start && hasData.value) {
        useECharts("clear")
    }

    localStorage.setItem('selectedPeriodRange', JSON.stringify(selectedPeriodRange.value))
    localStorage.setItem('selectedAccounts', selectedAccounts.value)

    localStorage.setItem('selectedGrossNet', selectedGrossNet.value)
    amountCase.value = selectedGrossNet.value
    amountCapital.value = selectedGrossNet.value.charAt(0).toUpperCase() + selectedGrossNet.value.slice(1)
    //console.log("filter amountCapital " + amountCapital.value)

    localStorage.setItem('selectedPositions', selectedPositions.value)

    localStorage.setItem('selectedTimeFrame', selectedTimeFrame.value)

    localStorage.setItem('selectedRatio', selectedRatio.value)

    if (pageId.value == "daily" || pageId.value == "calendar") {
        localStorage.setItem('selectedMonth', JSON.stringify(selectedMonth.value))
    }

    localStorage.setItem('selectedTags', selectedTags.value)

    if (tempSelectedPlSatisfaction.value != null) {
        selectedPlSatisfaction.value = tempSelectedPlSatisfaction.value
        localStorage.setItem('selectedPlSatisfaction', selectedPlSatisfaction.value)
        tempSelectedPlSatisfaction.value = null
    }

    if (pageId.value == "dashboard") {
        useMountDashboard()
    }

    if (pageId.value == "daily") {
        await useMountDaily()
        useCheckVisibleScreen()
    }

    if (pageId.value == "screenshots") {
        await useRefreshScreenshot()
        useCheckVisibleScreen()
    }
    if (pageId.value == "calendar") {
        useMountCalendar(true)
    }
}
</script>

<template>
    <!-- ============ LINE 1: DATE FILTERS ============ -->
    <div id="step10" class="col-12 mb-3">
        <div class="dailyCard">
            <div>
                <span v-if="!filtersOpen" v-on:click="filtersClick" class="pointerClass">Filters <i
                        class="uil uil-angle-up"></i>
                </span>
                <span v-if="!filtersOpen" class="dashInfoTitle ms-3">
                    <span v-show="filters[pageId].includes('accounts')">
                        <span
                            v-if="currentUser.hasOwnProperty('accounts') && currentUser.accounts.length == selectedAccounts.length">All
                            accounts |</span>
                        <span v-else>Selected accounts |</span>
                    </span>

                    <span v-show="filters[pageId].includes('periodRange')">
                        {{ selectedPeriodRange.label }} |
                        <span v-show="selectedPeriodRange.value == 'custom'"> Range |</span>
                    </span>

                    <span v-show="filters[pageId].includes('month')">
                        {{ useMonthFormat(selectedMonth.start) }} |
                    </span>

                    <span v-show="filters[pageId].includes('grossNet')">{{ selectedGrossNet.charAt(0).toUpperCase() +
                    selectedGrossNet.slice(1) }} data |
                    </span>

                    <span v-show="filters[pageId].includes('positions')">
                        <span v-if="positions.length == selectedPositions.length">All positions |</span>
                        <span v-else>{{ selectedPositions.toString().charAt(0).toUpperCase() +
                    selectedPositions.toString().slice(1) }} |</span>
                    </span>

                    <span v-show="filters[pageId].includes('timeFrame')">
                        {{ selectedTimeFrame.charAt(0).toUpperCase() + selectedTimeFrame.slice(1) }} timeframe |
                    </span>

                    <span v-show="filters[pageId].includes('ratio')">
                        <span v-if="selectedRatio != 'profitFactor'">{{ selectedRatio.toUpperCase() }}</span><span v-else>Profit Factor</span> |
                    </span>

                    <span v-show="filters[pageId].includes('tags')">
                        <span v-if="tags.length == selectedTags.length">All
                            tags</span>
                        <span v-else>Selected tags</span>
                    </span>

                    <span v-show="filters[pageId].includes('plSatisfaction')">
                        {{ selectedPlSatisfaction == 'satisfaction' ? 'Satisfaction' : "P&L" }} calendar
                    </span>

                </span>

                <span v-else v-on:click="filtersClick" class="pointerClass mb-3">Filters<i
                        class="uil uil-angle-down"></i>
                </span>
            </div>

            <div v-show="filtersOpen" class="row text-center align-items-center">
                <!-- Date : periode -->
                <div class="col-12 col-lg-4 mt-1 mt-lg-0 mb-lg-1" v-show="pageId == 'dashboard'">
                    <select v-on:input="inputDateRange($event.target.value)" class="form-select">
                        <option v-for="item in periodRange" :key="item.value" :value="item.value"
                            :selected="item.value == selectedPeriodRange.value">{{ item.label }}</option>
                    </select>
                </div>

                <!-- Date : calendar -->
                <div class="col-12 col-lg-8 mt-1 mt-lg-0 mb-1" v-show="pageId == 'dashboard'">
                    <div class="row">
                        <div class="col-5">
                            <input type="date" class="form-control" :value="useDateCalFormat(selectedDateRange.start)"
                                :selected="selectedDateRange.start"
                                v-on:input="inputDateRangeCal('start', $event.target.value)" />
                        </div>
                        <div class="col-2">
                            <i class="uil uil-angle-right-b"></i>
                        </div>
                        <div class="col-5">
                            <input type="date" class="form-control" :value="useDateCalFormat(selectedDateRange.end)"
                                :selected="selectedDateRange.end"
                                v-on:input="inputDateRangeCal('end', $event.target.value)">
                            <div class="row"></div>
                        </div>
                    </div>
                </div>

                <!-- Accounts -->
                <div class="col-6 dropdown" v-show="pageId != 'screenshots' && pageId != 'calendar'">
                    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown"
                        aria-expanded="false">Accounts <span class="dashInfoTitle">({{ selectedAccounts.length
                            }})</span></button>
                    <ul class="dropdown-menu dropdownCheck">
                        <div v-for="item in currentUser.accounts" :key="item.value" class="form-check">
                            <input class="form-check-input" type="checkbox" :value="item.value"
                                v-model="selectedAccounts">
                            {{ item.label }}
                        </div>
                    </ul>
                </div>

                <!-- Month -->
                <div class="col-12 col-lg-6 mt-1 mt-lg-0 mb-lg-1" v-show="pageId == 'daily' || pageId == 'calendar'">
                    <input type="month" class="form-control" :value="useDateCalFormatMonth(selectedMonth.start)"
                        :selected="selectedMonth.start" v-on:input="inputMonth($event.target.value)">
                </div>

                <!-- Tags -->
                <div :class="[pageId == 'screenshots' ? 'col-12' : 'col-6', 'dropdown mt-1 mt-lg-1']"
                    v-show="pageId != 'calendar'">

                    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown"
                        aria-expanded="false">Tags <span class="dashInfoTitle">({{ selectedTags.length
                            }})</span></button>

                    <ul class="dropdown-menu dropdownCheck">
                        <input class="form-check-input" type="checkbox" value="t000t"
                            v-model="selectedTags">&nbsp;&nbsp;No Tag
                        <hr>
                        <span v-for="group in availableTags">
                            <h6 class="p-1 mb-0" :style="'background-color: ' + group.color + ';'">
                                {{ group.name }}</h6>
                            <div v-for="item in group.tags" class="form-check">
                                <input class="form-check-input" type="checkbox" :value="item.id" v-model="selectedTags">
                                {{ item.name }}
                            </div>
                        </span>
                        
                    </ul>
                </div>

                <!-- Gross/Net -->
                <div class="col-6 col-lg-3" v-show="pageId != 'screenshots'">
                    <select v-on:input="selectedGrossNet = $event.target.value" class="form-select">
                        <option v-for="item in grossNet" :key="item.value" :value="item.value"
                            :selected="item.value == selectedGrossNet">{{ item.label }}</option>
                    </select>
                </div>

                <!-- Positions -->
                <div class="col-6 col-lg-3 dropdown" v-show="pageId != 'screenshots' && pageId != 'calendar'">
                    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown"
                        aria-expanded="false">Positions <span class="dashInfoTitle">({{ selectedPositions.length
                            }})</span></button>
                    <ul class="dropdown-menu dropdownCheck">
                        <div v-for="item in positions" :key="item.value" class="form-check">
                            <input class="form-check-input" type="checkbox" :value="item.value"
                                v-model="selectedPositions">
                            {{ item.label }}
                        </div>
                    </ul>
                </div>

                <!-- Timeframe -->
                <div class="col-6 col-lg-3 mt-1 mt-lg-1" v-show="pageId == 'dashboard'">
                    <select v-on:input="selectedTimeFrame = $event.target.value" class="form-select">
                        <option v-for="item in timeFrames" :key="item.value" :value="item.value"
                            :selected="item.value == selectedTimeFrame">{{ item.label }}</option>
                    </select>
                </div>

                <!-- Ratio -->
                <div class="col-6 col-lg-3 mt-1 mt-lg-1" v-show="pageId == 'dashboard'">
                    <select v-on:input="selectedRatio = $event.target.value" class="form-select">
                        <option v-for="item in ratios" :key="item.value" :value="item.value"
                            :selected="item.value == selectedRatio">{{ item.label }}</option>
                    </select>
                </div>

                <!-- P&L / Satisfaction  -->
                <div :class="[pageId == 'daily' ? 'col-4' : 'col-3']" v-show="pageId == 'calendar'">
                    <select v-on:input="tempSelectedPlSatisfaction = $event.target.value" class="form-select">
                        <option v-for="item in plSatisfaction" :key="item.value" :value="item.value"
                            :selected="item.value == selectedPlSatisfaction">{{ item.label }}</option>
                    </select>
                </div>

                <div class="col-12 text-center">
                    <button class="btn btn-success btn-sm mt-2" v-on:click="saveFilter">Filter</button>
                </div>
            </div>
        </div>
    </div>
</template>