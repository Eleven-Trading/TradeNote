<script setup>
import { ref, onMounted } from 'vue'
import Parse from 'parse/dist/parse.min.js'
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue'

const overview = ref([])
const spinnerLoadingPage = ref(true)

async function fetchOverview() {
  const Goal = Parse.Object.extend('goals')
  const query = new Parse.Query(Goal)
  query.equalTo('user', Parse.User.current())
  const results = await query.find()

  // Use lowercase keys since DB stores lowercase values
  const groups = { daily: [], weekly: [], monthly: [] }

  results.forEach(goal => {
    const period = goal.get('period')?.toLowerCase() || 'daily'
    const successRate = goal.get('successRate') || 0
    if (!groups[period]) groups[period] = [] // safeguard if period key is unexpected
    groups[period].push(successRate)
  })

  overview.value = Object.entries(groups).map(([period, rates]) => {
    if (rates.length === 0) return { period, avg: 0, color: 'gray' }
    const avg = Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
    let color = 'red'
    if (avg >= 80) color = 'green'
    else if (avg >= 60) color = 'yellow'
    return { period, avg, color }
  })

  spinnerLoadingPage.value = false
}

onMounted(fetchOverview)
</script>

<template>
  <SpinnerLoadingPage v-if="spinnerLoadingPage" />

  <div v-else class="container mt-4">
    <h3>📊 Goal Completion Overview</h3>
    <div v-for="(item, i) in overview" :key="i" class="card mb-3 p-3">
      <div class="d-flex justify-content-between align-items-center">
        <h5>{{ item.period.charAt(0).toUpperCase() + item.period.slice(1) }} Goals</h5>
        <span :style="{ color: item.color }">{{ item.avg }}%</span>
      </div>
      <div class="progress mt-2" style="height: 8px;">
        <div
          class="progress-bar"
          role="progressbar"
          :style="{ width: item.avg + '%', backgroundColor: item.color }"
        ></div>
      </div>
    </div>
  </div>
</template>
