<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Parse from 'parse/dist/parse.min.js'
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue'

const route = useRoute()
const router = useRouter()
const spinnerLoadingPage = ref(false)
const goalUpdate = ref({
  title: '',
  criteria: '',
  period: ''
})

const periods = ([
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' }
])

onMounted(async () => {
  const goalId = route.query.id
  if (!goalId) return

  spinnerLoadingPage.value = true
  try {
    const Goal = Parse.Object.extend('goals')
    const query = new Parse.Query(Goal)
    const goal = await query.get(goalId)

    goalUpdate.value.title = goal.get('title') || ''
    goalUpdate.value.criteria = goal.get('criteria') || ''
    goalUpdate.value.period = goal.get('period')?.toLowerCase() || ''
  } catch (err) {
    console.error('Error loading goal:', err)
  } finally {
    spinnerLoadingPage.value = false
  }
})

async function saveGoal() {
  spinnerLoadingPage.value = true
  try {
    const user = Parse.User.current()
    const Goal = Parse.Object.extend('goals')
    let goalObj

    // Edit mode
    if (route.query.id) {
      const query = new Parse.Query(Goal)
      goalObj = await query.get(route.query.id)
    } else {
      goalObj = new Goal()
      goalObj.set('user', user)
    }

    goalObj.set('title', goalUpdate.value.title)
    goalObj.set('criteria', goalUpdate.value.criteria)
    goalObj.set('period', goalUpdate.value.period.toLowerCase())

    await goalObj.save()

    router.push('/goalDefinitions')
  } catch (err) {
    console.error('Error saving goal:', err)
    alert('Failed to save goal.')
  } finally {
    spinnerLoadingPage.value = false
  }
}
</script>

<template>
  <SpinnerLoadingPage v-if="spinnerLoadingPage" />
  <div v-else class="container mt-3">
    <h4>{{ route.query.id ? 'Edit Goal' : 'Add Goal' }}</h4>

    <div class="mb-3">
      <label class="form-label">Title</label>
      <input v-model="goalUpdate.title" type="text" class="form-control" />
    </div>

    <div class="mb-3">
      <label class="form-label">Criteria</label>
      <textarea v-model="goalUpdate.criteria" class="form-control"></textarea>
    </div>

    <div class="mb-3">
      <label class="form-label">Period</label>
      <select v-model="goalUpdate.period" class="form-select">
        <option disabled value="">Select Period</option>
        <option v-for="p in periods" :key="p.value" :value="p.value">
          {{ p.label }}
        </option>
      </select>
    </div>

    <button class="btn btn-primary" @click="saveGoal">
      {{ route.query.id ? 'Update' : 'Save' }}
    </button>
  </div>
</template>
