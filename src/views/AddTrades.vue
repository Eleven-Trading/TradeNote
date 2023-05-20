<script setup>
import { onBeforeMount, onMounted } from 'vue';
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';
import { selectedBroker, spinnerLoadingPage, brokers, stepper, spinnerLoadingPageText, executions, currentUser, uploadMfePrices, existingImports, queryLimit, blotter, pAndL, gotExistingTradesArray, existingTradesArray } from '../stores/globals';
import { useInitStepper, useInitIndexedDB } from '../utils/utils';
import { useGetPatternsMistakes } from '../utils/patternsMistakes'
import { useImportTrades, useUploadTrades } from '../utils/addTrades'
import { useCreatedDateFormat, useDateCalFormat } from '../utils/utils';

onMounted(async () => {
    useInitStepper()
    await Promise.all([getExistingTradesArray(), useGetPatternsMistakes(), useInitIndexedDB()])
})

function inputChooseBroker(param) {
    localStorage.setItem('selectedBroker', param)
    selectedBroker.value = param
}
function stepperNext() {
    stepper.value.next()
    existingImports.length = 0
}

function stepperPrevious() {
    stepper.value.previous()
    existingImports.length = 0
}

async function getExistingTradesArray() {
    console.log(" -> Getting existing trades for filter")
    return new Promise(async (resolve, reject) => {
        const parseObject = Parse.Object.extend("trades");
        const query = new Parse.Query(parseObject);
        query.equalTo("user", Parse.User.current());
        query.limit(queryLimit.value); // limit to at most 1M results
        const results = await query.find();
        for (let i = 0; i < results.length; i++) {
            const object = results[i];
            //console.log("unix time "+ object.get('dateUnix'));
            existingTradesArray.push(object.get('dateUnix'))
        }
        gotExistingTradesArray.value = true
        console.log(" -> Finished getting existing trades for filter")
        //console.log(" -> ExistingTradesArray "+JSON.stringify(existingTradesArray))
        resolve()
    })
}
</script>
<template>
    <SpinnerLoadingPage />
    <div>
        <div v-show="!spinnerLoadingPage">
            <select v-on:input="inputChooseBroker($event.target.value)" class="form-select">
                <option v-for="item in brokers" v-bind:value="item.value" v-bind:selected="item.value == selectedBroker">
                    {{ item.label }}</option>
            </select>
            <p class="mt-3">You will find export instructions for your broker on the <a
                    href="https://github.com/Eleven-Trading/TradeNote/tree/main/brokers" target="_blank">GitHub page</a></p>

            <!-- ============ STEPPER INIT ============ -->
            <div id="addStepper" class="bs-stepper">
                <div class="bs-stepper-header">
                    <!--!<div class="step" data-target="#step1">
                    <button type="button" class="btn step-trigger">
                        <span class="bs-stepper-circle">1</span>
                        <span class="bs-stepper-label">Cash Journal(s)</span>
                    </button>
                </div>
                <div class="line"></div>-->
                    <div class="step" data-target="#step2">
                        <button type="button" class="btn step-trigger">
                            <span class="bs-stepper-circle">1</span>
                            <span class="bs-stepper-label">Trades</span>
                        </button>
                    </div>
                    <div class="line"></div>
                    <div class="step" data-target="#step3">
                        <button type="button" class="btn step-trigger">
                            <span class="bs-stepper-circle">2</span>
                            <span class="bs-stepper-label">Validate</span>
                        </button>
                    </div>
                </div>

                <!-- ============ STEPPER CONTENT ============ -->
                <div class="bs-stepper-content">

                    <!-- STEP 2 - Trades -->
                    <div id="step2" class="content">
                        <!--@@include('components/stepperPrevious.html')-->
                        <div>
                            <span v-show="Object.keys(executions).length > 0"><button class="btn btn-outline-primary btn-sm"
                                    v-on:click="stepperNext">Next<i class="fa fa-chevron-right ms-2"></i></button></span>
                            <button type="cancel" onclick="location.href = 'dashboard';"
                                class="btn btn-outline-secondary btn-sm">Cancel</button>
                        </div>
                        <!--<label>Auto upload MFE prices</label>-->
                        <div class="mt-4" v-show="currentUser.marketDataApiKey">
                            <div class="form-check form-switch">
                                <label>Upload automatically MFE prices</label>
                                <input class="form-check-input" type="checkbox" role="switch" v-model="uploadMfePrices"
                                    v-on:click="uploadMfePrices = !uploadMfePrices">
                            </div>

                        </div>
                        <h4 class="mt-3">Trades</h4>
                        <div class="mt-3 input-group mb-3">
                            <input id="tradesInput" type="file" v-on:change="useImportTrades($event)" />
                        </div>
                        <div v-if="existingImports.length != 0">
                            Following dates are already imported: <span v-for="(item, index) in existingImports">
                                <span v-if="index > 0">, </span>{{ useDateCalFormat(item) }}</span>
                        </div>
                        <div v-if="Object.keys(blotter).length > 0 && Object.keys(pAndL).length > 0" v-for="(execution, index) in executions">
                            <h3 class="ml-2 mt-2 text-blue">{{ useCreatedDateFormat(index) }}</h3>
                            <table class="table">
                                <thead class="thead-dark">
                                    <tr>
                                        <th scope="col">Symbol</th>
                                        <th scope="col">Tot Qty</th>
                                        <th scope="col">P/L gross</th>
                                        <th scope="col">Comm</th>
                                        <th scope="col">Tot Fees</th>
                                        <th scope="col">P/L net</th>
                                        <th scope="col">wins(g)</th>
                                        <th scope="col">loss(g)</th>
                                        <th scope="col">trades</th>
                                        <th scope="col">executions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="blot in blotter[index]">
                                        <td>{{ blot.symbol }}</td>
                                        <td>{{ blot.buyQuantity + blot.sellQuantity }}</td>
                                        <td v-bind:class="[blot.grossProceeds > 0 ? 'greenTrade' : 'redTrade']">
                                            {{ (blot.grossProceeds).toFixed(2) }}</td>
                                        <td>{{ (blot.commission).toFixed(2) }}</td>
                                        <td>{{ (blot.fees).toFixed(2) }}</td>
                                        <td v-bind:class="[blot.netProceeds > 0 ? 'greenTrade' : 'redTrade']">
                                            {{ (blot.netProceeds).toFixed(2) }}</td>
                                        <td>{{ blot.grossWinsCount }}</td>
                                        <td>{{ blot.grossLossCount }}</td>
                                        <td>{{ blot.trades }}</td>
                                        <td>{{ blot.executions }}</td>
                                    </tr>
                                    <tr v-if="index != null" class="sumRow">
                                        <td>Total</td>
                                        <td>{{ pAndL[index].buyQuantity + pAndL[index].sellQuantity }}</td>
                                        <td v-bind:class="[pAndL[index].grossProceeds > 0 ? 'greenTrade' : 'redTrade']">
                                            {{ (pAndL[index].grossProceeds).toFixed(2) }}</td>
                                        <td>{{ (pAndL[index].commission).toFixed(2) }}</td>
                                        <td>{{ (pAndL[index].fees).toFixed(2) }}</td>
                                        <td v-bind:class="[pAndL[index].netProceeds > 0 ? 'greenTrade' : 'redTrade']">
                                            {{ (pAndL[index].netProceeds).toFixed(2) }}</td>
                                        <td>{{ pAndL[index].grossWinsCount }}</td>
                                        <td>{{ pAndL[index].grossLossCount }}</td>
                                        <td>{{ pAndL[index].trades }}</td>
                                        <td>{{ pAndL[index].executions }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- STEP 3 - Validate -->
                    <div id="step3" class="content">
                        <!-- Button -->
                        <div class="mt-3">
                            <button type="button" v-on:click="useUploadTrades" class="btn btn-success btn-lg">Submit</button>
                        </div>
                        <div class="mt-3">
                            <button class="btn btn-outline-primary btn-sm" v-on:click="stepperPrevious"><i class="fa fa-chevron-left me-2"></i>Previous</button>
                            <button type="cancel" onclick="location.href = 'dashboard';" class="btn btn-outline-secondary btn-sm">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>