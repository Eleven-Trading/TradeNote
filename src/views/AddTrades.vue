<script setup>
import { onMounted } from 'vue';
import { selectedBroker, spinnerLoadingPage, brokers, stepper, executions, currentUser, uploadMfePrices, existingImports, queryLimit, blotter, pAndL, gotExistingTradesArray, existingTradesArray, brokerData, tradovateTiers, selectedTradovateTier } from '../stores/globals';
import { useDecimalsArithmetic } from '../utils/utils';
import { useImportTrades, useUploadTrades } from '../utils/addTrades'
import { useCreatedDateFormat, useDateCalFormat } from '../utils/utils';
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue';

spinnerLoadingPage.value = false

onMounted(async () => {
    await Promise.all([getExistingTradesArray()])
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

    <!--DROPDOWN LIST-->
    <div class="form-floating">
        <select v-on:input="inputChooseBroker($event.target.value)" class="form-select">
            <option v-for="item in brokers" v-bind:value="item.value" v-bind:selected="item.value == selectedBroker">
                {{ item.label }}</option>
        </select>
        <label for="floatingSelect">Select your broker or trading platform</label>
    </div>
    <p class="txt-small fst-italic">You will find export instructions for your broker on the <a
            href="https://github.com/Eleven-Trading/TradeNote/tree/main/brokers" target="_blank">GitHub page</a>
    </p>
    <p v-show="selectedBroker">
        Supported asset types: <span
            v-for="(item, index) in brokers.filter(f => f.value == selectedBroker)[0].assetTypes">{{ item }}<span
                v-show="brokers.filter(f => f.value == selectedBroker)[0].assetTypes.length > 1 && (index + 1) < brokers.filter(f => f.value == selectedBroker)[0].assetTypes.length">,
            </span></span>
    </p>
    <p v-show="selectedBroker == 'tradovate'">
        Commisssion Plan: <span>
            <div class="form-check form-check-inline" v-for="item in tradovateTiers" :key="item.value">
                <input class="form-check-input" type="radio" :value="item.value" v-model="selectedTradovateTier">
                {{ item.label }}
            </div>

        </span>
    </p>

    <!--MFE-->
    <div class="mt-4" v-if="currentUser.marketDataApiKey">
        <div class="form-check form-switch">
            <label>Add MFE prices automatically (<a href="https://polygon.io/system" target="_blank">system
                    status</a>)</label>
            <input class="form-check-input" type="checkbox" role="switch" v-model="uploadMfePrices"
                v-on:click="uploadMfePrices = !uploadMfePrices">
        </div>
    </div>
    <div v-else>
        <p>Add your API in <a href="/settings">settings</a> to add MFE prices automatically</p>
    </div>

    <!--IMPORT-->
    <div class="mt-3">

        <div v-if="selectedBroker != 'tradeStation'" class="input-group mb-3">
            <input id="tradesInput" type="file" v-on:change="useImportTrades($event, 'file')" />
        </div>

        <div v-else>

            <div class="form-floating">
                <textarea class="form-control" style="height: 100px"
                    v-on:change="brokerData = $event.target.value"></textarea>
                <label for="tradesInputText">Paste your data</label>
            </div>

            <button type="button" v-on:click="useImportTrades('', 'text')" class="btn btn-success mt-3 mb-3">Load</button>
        </div>
        <div v-if="existingImports.length != 0">
            Following dates are already imported: <span v-for="(item, index) in existingImports">
                <span v-if="index > 0">, </span>{{ useDateCalFormat(item) }}</span>
        </div>

        <div v-if="Object.keys(blotter).length > 0 && Object.keys(pAndL).length > 0"
            v-for="(execution, index) in executions">
            <div v-if="blotter[index]">
                <h3 class="ml-2 mt-2 text-blue">{{ useCreatedDateFormat(index) }}</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Symbol</th>
                            <th scope="col">Vol</th>
                            <th scope="col">P/L gross</th>
                            <th scope="col">Comm</th>
                            <th scope="col">Tot Fees</th>
                            <th scope="col">P/L net</th>
                            <th scope="col">Wins(g)</th>
                            <th scope="col">Loss(g)</th>
                            <th scope="col">Trades</th>
                            <th scope="col">Executions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="blot in blotter[index]">
                            <td>{{ blot.symbol }}</td>
                            <td>{{ useDecimalsArithmetic(blot.buyQuantity, blot.sellQuantity) }}</td>
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
                            <td>{{ useDecimalsArithmetic(pAndL[index].buyQuantity, pAndL[index].sellQuantity) }}</td>
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
    </div>

    <!--BUTTONS-->
    <div>
        <button v-show="Object.keys(executions).length > 0 && !spinnerLoadingPage" type="button"
            v-on:click="useUploadTrades" class="btn btn-success btn-lg me-3">Submit</button>

        <button type="cancel" onclick="location.href = 'dashboard';"
            class="btn btn-outline-secondary btn-sm me-2">Cancel</button>

    </div>
</template>