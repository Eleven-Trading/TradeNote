import Parse from 'parse/dist/parse.min.js'
import { ref } from 'vue'
import { goalRecords } from '../stores/globals'
import { getTodayUnix, getWeekStartUnix, getMonthStartUnix } from './date.js'

export const spinnerLoadingPage = ref(false)
export const completionPct = ref(0)

// 🧮 Recalculate local completion %
export function recalculateCompletion() {
  const total = goalRecords.value.length
  const completed = goalRecords.value.filter(g => g.completed).length
  completionPct.value = total ? Math.round((completed / total) * 100) : 0
}

// 📥 Fetch goal records by period
export async function useGetGoalsByPeriod(period = 'daily') {
  spinnerLoadingPage.value = true
  goalRecords.value = []

  const periodLower = period.toLowerCase()
  const user = Parse.User.current()
  const GoalRecord = Parse.Object.extend('goalRecords')
  const query = new Parse.Query(GoalRecord)
  query.equalTo('user', user)
  query.equalTo('period', periodLower)

  let periodStart
  if (periodLower === 'daily') periodStart = getTodayUnix()
  else if (periodLower === 'weekly') periodStart = getWeekStartUnix()
  else periodStart = getMonthStartUnix()
  query.equalTo('periodStart', periodStart)

  const results = await query.find()

  if (results.length === 0) {
    // 🔍 Create new ones based on goal definitions
    const GoalDef = Parse.Object.extend('goals')
    const goalQuery = new Parse.Query(GoalDef)
    goalQuery.equalTo('user', user)
    goalQuery.equalTo('period', periodLower)
    const defs = await goalQuery.find()

    if (defs.length === 0) {
      console.warn(`⚠️ No goal definitions found for period "${periodLower}"`)
    }

    for (const def of defs) {
      const title = def.get('title') || '(Untitled Goal)'
      const criteria = def.get('criteria') || def.get('description') || '(No criteria set)'

      const rec = new GoalRecord()
      rec.set('user', user)
      rec.set('goal', def)
      rec.set('title', title)
      rec.set('criteria', criteria)
      rec.set('period', periodLower)
      rec.set('periodStart', periodStart)
      rec.set('completed', false)
      await rec.save()
    }

    // Reload to populate the store with the newly created records
    return await useGetGoalsByPeriod(period)
  }

  // ✅ Map records with all needed info
  goalRecords.value = results.map(r => ({
    id: r.id,
    goalId: r.get('goal')?.id,
    title: r.get('title') || '(Untitled)',
    criteria: r.get('criteria') || '(No criteria)',
    notes: r.get('notes') || '',
    completed: r.get('completed') || false,
    period: r.get('period')
  }))

  recalculateCompletion()
  spinnerLoadingPage.value = false
}

// 💾 Save all records & update success rates
export async function saveGoalRecords() {
  spinnerLoadingPage.value = true
  const user = Parse.User.current()
  const GoalRecord = Parse.Object.extend('goalRecords')

  for (const g of goalRecords.value) {
    const rec = new GoalRecord()
    if (g.id) rec.id = g.id
    rec.set('user', user)
    rec.set('completed', g.completed)
    rec.set('notes', g.notes || '')
    await rec.save()
  }

  // ✅ Recalculate goal success rates after save
  const goalIds = goalRecords.value.map(g => g.goalId)
  await updateGoalSuccessRates(goalIds)

  spinnerLoadingPage.value = false
}

// 📊 Update successRate in goal definitions
export async function updateGoalSuccessRates(goalIds = []) {
  if (!goalIds || goalIds.length === 0) return

  const Goal = Parse.Object.extend('goals')
  const GoalRecord = Parse.Object.extend('goalRecords')

  for (const goalId of goalIds) {
    const goalPointer = {
      __type: 'Pointer',
      className: 'goals',
      objectId: goalId
    }

    const query = new Parse.Query(GoalRecord)
    query.equalTo('goal', goalPointer)
    const allRecords = await query.find()

    if (allRecords.length === 0) continue

    const completed = allRecords.filter(r => r.get('completed')).length
    const successRate = Math.round((completed / allRecords.length) * 100)

    const goalQuery = new Parse.Query(Goal)
    const goalObj = await goalQuery.get(goalId)
    goalObj.set('successRate', successRate)
    await goalObj.save()
  }
}
