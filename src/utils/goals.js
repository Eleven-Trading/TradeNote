import {
  goals,
  selectedGoal,
  selectedRange,
  endOfList,
  spinnerLoadingPage,
  spinnerLoadMore,
  goalIdToEdit,
  goalUpdate,
  goalQueryLimit,
  goalPagination,
  pageId,
  queryLimit,
  renderData
} from "../stores/globals.js"

import { usePageRedirect } from "./utils.js"
import Parse from "parse/dist/parse.min.js"

/**
 * Fetch goals from Parse server for the current user
 * @param {Boolean} loadMore - whether to append to existing goals or start fresh
 */
export async function useGetGoals(loadMore = false) {
  return new Promise(async (resolve, reject) => {
    console.log(" -> Getting Goals");

    if (!loadMore) {
      goals.value.length = 0; // reset array if not loading more
      endOfList.value = false;
    }

    const Goal = Parse.Object.extend("goals");
    const query = new Parse.Query(Goal);

    // Fetch only current user's goals
    query.equalTo("user", Parse.User.current());
    query.limit(queryLimit.value);
    query.descending("createdAt");

    // If loading more, skip already loaded
    if (loadMore) {
      query.skip(goals.value.length);
    }

    try {
      spinnerLoadingPage.value = !loadMore;
      spinnerLoadMore.value = loadMore;

      const results = await query.find();

      if (results.length === 0) {
        endOfList.value = true;
      } else {
        for (let i = 0; i < results.length; i++) {
          const object = results[i];
          const temp = {
            objectId: object.id,
            title: object.get("title"),
            criteria: object.get("criteria"),
            period: object.get("period").toLowerCase(),
            completed: object.get("completed") ?? false,
            successRate: object.get("successRate") ?? 0,
          };
          goals.value.push(temp);
        }
      }

      spinnerLoadMore.value = false;
      spinnerLoadingPage.value = false;
      resolve(goals.value);
    } catch (error) {
      console.error("Error fetching goals:", error);
      spinnerLoadMore.value = false;
      spinnerLoadingPage.value = false;
      reject(error);
    }
  });
}


export async function useUploadGoal(param) {
    return new Promise(async (resolve, reject) => {
        const parseObject = Parse.Object.extend("goals");

        if (goalIdToEdit.value) {
            console.log(" -> Updating goal")
            const query = new Parse.Query(parseObject);
            query.equalTo("objectId", goalIdToEdit.value);
            const results = await query.first();
            if (results) {
                results.set("title", goalUpdate.title)
                results.set("criteria", goalUpdate.criteria)
                results.set("period", goalUpdate.period.toLowerCase())
                results.set("successRate", goalUpdate.successRate)
                results.set("completed", goalUpdate.completed)
                await results.save()
                if (param != "autoSave") usePageRedirect()
            } else {
                alert("Update query did not return any results")
            }
        } else {
            console.log(" -> Saving new goal")
            const object = new parseObject()
            object.set("user", Parse.User.current())
            object.set("title", goalUpdate.title)
            object.set("criteria", goalUpdate.criteria)
            object.set("period", goalUpdate.period.toLowerCase())
            object.set("successRate", goalUpdate.successRate)
            object.set("completed", goalUpdate.completed)
            object.setACL(new Parse.ACL(Parse.User.current()))
            object.save()
                .then((object) => {
                    console.log("  --> Added new goal with id " + object.id)
                    if (param != "autoSave") usePageRedirect()
                    else goalIdToEdit.value = object.id
                }, (error) => {
                    console.log("Failed to create new goal, error: " + error.message)
                })
        }

        resolve()
    })
}

export async function useDeleteGoal() {
  console.log(" -> Deleting goal entry")
  const Goal = Parse.Object.extend("goals")
  const query = new Parse.Query(Goal)
  query.equalTo("objectId", selectedGoal.value)
  const res = await query.first()
  if (res) {
    await res.destroy()
    await refreshGoals()
  } else {
    alert("There was a problem with the query")
  }
}

async function refreshGoals() {
  console.log(" -> Refreshing goal entries")
  return new Promise(async resolve => {
    goalQueryLimit.value = 10
    goalPagination.value = 0
    goals.length = 0
    await useGetGoals(true)
    await (renderData.value += 1)
    selectedGoal.value = null
    resolve()
  })
}

