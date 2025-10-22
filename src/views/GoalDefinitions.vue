<script setup>
import { onMounted, onBeforeMount, ref, nextTick } from 'vue'
import SpinnerLoadingPage from '../components/SpinnerLoadingPage.vue'
import NoData from '../components/NoData.vue'
import { useRouter } from 'vue-router'
import { useInitPopover } from '../utils/utils'
import { goals, selectedRange, spinnerLoadingPage, spinnerLoadMore, endOfList } from '../stores/globals'
import { useGetGoals } from '../utils/goals'
import Parse from 'parse/dist/parse.min.js'

const router = useRouter()
const selectedGoal = ref(null)

onBeforeMount(async () => {
  spinnerLoadingPage.value = true
})

onMounted(async () => {
  await useGetGoals(true)
  await nextTick()
  useInitPopover()
  setupDeletePopovers()
  //setupInfiniteScroll()
  spinnerLoadingPage.value = false
})

async function loadGoals() {
  goals.value = await useGetGoals(true)
}

//function setupInfiniteScroll() {
//  window.addEventListener('scroll', () => {
//    let scrollTop = window.scrollY
//    let visibleScreen = window.innerHeight
//    let documentHeight = document.documentElement.scrollHeight
//    let difference = documentHeight - (scrollTop + visibleScreen)
//
//    if (difference <= 0 && !spinnerLoadMore.value && !spinnerLoadingPage.value && !endOfList.value) {
//      loadMoreGoals()
//    }
//  })
//}

async function loadMoreGoals() {
  spinnerLoadMore.value = true
  const more = await useGetGoals(false)
  if (more.length === 0) {
    endOfList.value = true
  } else {
    goals.value.push(...more)
  }
  spinnerLoadMore.value = false
}

// 🖋️ Navigate to edit page
function editGoal(goalId) {
  router.push({ name: 'addGoalDefinition', query: { id: goalId } })
}

// 🗑️ Delete goal
function setupDeletePopovers() {
  document.querySelectorAll('.popoverDelete').forEach(el => {
    el.addEventListener('shown.bs.popover', () => {
      const yesButton = document.querySelector('.popoverYes')
      const noButton = document.querySelector('.popoverNo')

      if (yesButton) yesButton.addEventListener('click', async () => {
        const goalId = el.dataset.goalId // directly from DOM
	await deleteGoal(goalId)
        const popover = bootstrap.Popover.getInstance(el)
        popover.hide()
      })

      if (noButton) noButton.addEventListener('click', () => {
        const popover = bootstrap.Popover.getInstance(el)
        popover.hide()
      })
    })
  })
}

async function deleteGoal(goalId) {
  try {
    const Goal = Parse.Object.extend('goals')
    const goalToDelete = new Goal()
    goalToDelete.id = goalId
    await goalToDelete.destroy()
    console.log("Goal deleted successfully:", goalId)

    // Remove locally
    goals.value = goals.value.filter(g => g.objectId !== goalId)
  } catch (error) {
    console.error("Error deleting goal:", error)
  }
}

</script>
<template>
  <SpinnerLoadingPage />
  <div v-show="!spinnerLoadingPage" class="row mt-2 mb-2">
    <div v-if="goals.length == 0">
      <NoData />
    </div>

    <div class="col-12">
      <div v-for="(goal, index) in goals" :key="goal.objectId" class="row mt-2">
        <div class="col-12">
          <div class="dailyCard quill">
            <div class="row">
              <div class="col-12 cardFirstLine">
                <div class="d-flex align-items-center fw-bold">
                  <div class="col-auto">
                    {{ goal.title }}
                    <i
                      class="uil uil-check-circle ms-2 pointerClass"
                      :class="{ greenTrade: goal.completed }"
                      @click="useToggleGoalSuccess(goal)"
                    ></i>
                  </div>

                  <span class="col mb-2 ms-auto text-end">
		    <i class="uil uil-edit-alt pointerClass" @click="editGoal(goal.objectId)"></i>
                    <i
                      class="ps-2 uil uil-trash-alt popoverDelete pointerClass"
                      :data-goal-id="goal.objectId"
                      data-bs-html="true"
                      data-bs-content="<div>Are you sure?</div><div class='text-center'><a type='button' class='btn btn-red btn-sm popoverYes'>Yes</a><a type='button' class='btn btn-outline-secondary btn-sm ms-2 popoverNo'>No</a></div>"
                      data-bs-toggle="popover"
                      data-bs-placement="left"
                    ></i>
                  </span>
                </div>
              </div>

              <div class="col-12 mt-2">
                <p>{{ goal.criteria }}</p>
                <p><b>Period:</b> {{ goal.period }}</p>
                <p><b>Success Rate:</b> {{ goal.successRate ?? 0 }}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Load more spinner -->
    <div v-if="spinnerLoadMore" class="d-flex justify-content-center mt-3">
      <div class="spinner-border text-blue" role="status"></div>
    </div>
  </div>
</template>

