<script setup>
import { ref, onMounted, watch } from 'vue'
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue'
import NoData from '../components/NoData.vue'
import {
  useGetGoalsByPeriod,
  completionPct,
  saveGoalRecords,
  spinnerLoadingPage,
  recalculateCompletion
} from '../utils/goalRecords'
import { goalRecords } from '../stores/globals'

// Period options
const periods = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' }
]
const selectedPeriod = ref('daily')

// Load goals based on period
async function loadGoals() {
  await useGetGoalsByPeriod(selectedPeriod.value)
  recalculateCompletion()
}

onMounted(async () => {
  await loadGoals()
})

// Reload when period changes
watch(selectedPeriod, async () => {
  await useGetGoalsByPeriod(selectedPeriod.value)
})
</script>

<template>
  <SpinnerLoadingPage v-if="spinnerLoadingPage" />

  <div v-else class="row mt-2 mb-2">
    <!-- Period Selector -->
    <div class="col-12 mb-3">
      <select class="form-select w-auto" v-model="selectedPeriod">
        <option v-for="p in periods" :key="p.value" :value="p.value">{{ p.label }}</option>
      </select>
    </div>

    <!-- No data -->
    <div v-if="goalRecords.length === 0">
      <NoData />
    </div>

    <!-- Goals list -->
    <div class="col-12" v-else>
      <div v-for="(goal, index) in goalRecords" :key="goal.goalId" class="row mt-2">
        <div class="col-12">
          <div class="dailyCard">
            <div class="row">
              <div class="col-8"><strong>{{ goal.title }}</strong></div>
              <div class="col-4 text-end">
                <input type="checkbox" v-model="goal.completed" @change="recalculateCompletion" />
              </div>
            </div>
            <div class="row mt-1">
              <div class="col-12"><small>{{ goal.criteria }}</small></div>
            </div>
            <div class="row mt-2">
              <div class="col-12">
                <textarea
                  v-model="goal.notes"
                  class="form-control"
                  placeholder="Notes / lessons learned"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Completion % -->
      <div class="mt-3"><strong>Completion: {{ completionPct }}%</strong></div>
      <div class="mt-2">
        <button class="btn btn-primary" @click="saveGoalRecords">Save {{ selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1) }} Goals</button>
      </div>
    </div>
  </div>
</template>
