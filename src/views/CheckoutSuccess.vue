<script setup>
import { onBeforeMount, ref, onMounted, nextTick } from 'vue';
import { useCheckCloudPayment, useGetCurrentUser } from '../utils/utils';
import { currentUser } from '../stores/globals';

/* MODULES */
import Parse from 'parse/dist/parse.min.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
dayjs.extend(utc)
import isoWeek from 'dayjs/plugin/isoWeek.js'
dayjs.extend(isoWeek)
import timezone from 'dayjs/plugin/timezone.js'
dayjs.extend(timezone)
import duration from 'dayjs/plugin/duration.js'
dayjs.extend(duration)
import updateLocale from 'dayjs/plugin/updateLocale.js'
dayjs.extend(updateLocale)
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
dayjs.extend(localizedFormat)
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
dayjs.extend(customParseFormat)
import axios from 'axios'


onBeforeMount(async () => {
    await useGetCurrentUser();
    try {
        await useCheckCloudPayment(currentUser.value);
        window.location.replace("/dashboard")
    } catch (error) {
        // Redirect to checkout page on error
        let check = await initializeCheckout();
        if (check == 403) {
            window.location.replace("/dashboard")
        }
    }
})

async function updateProfile(param) {
    return new Promise(async (resolve, reject) => {
        console.log("\nUPDATING PROFILE")
        console.log(" param "+JSON.stringify(param))
        const parseObject = Parse.Object.extend("_User");
        const query = new Parse.Query(parseObject);
        query.equalTo("objectId", currentUser.value.objectId);
        const results = await query.first();
        if (results) {

            results.set("paymentService", param)
            await results.save().then(async () => { //very important to have await or else too quick to update
                console.log(" -> Profile updated")
            })
            //
        } else {
            alert("Update query did not return any results")
        }

        resolve()
    })
}

const initializeCheckout = async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sessionId = urlParams.get("session_id");
    if (!sessionId) return 403
    try {
        // Axios request to the session-status endpoint
        const response = await axios.get("/api/session-status", {
            params: { session_id: sessionId }, // Axios automatically builds query strings
        });

        const session = response.data; // Axios automatically parses JSON
        //console.log("Session:", JSON.stringify(session))

        if (session.status === "open") {
            window.location.replace("/checkout"); // Correct redirection method
        } else if (session.status === "complete") {
            document.getElementById("customer-email").textContent = session.customer_email;
            let param = 
            
            await updateProfile({
                customerId: session.session.customer,
                subscriptionId: session.session.subscription
            })
        }
    } catch (error) {
        // Handle errors
        console.error("Error fetching session status:", error);

        if (error.response) {
            console.error("Server Response:", error.response.data);
        } else if (error.request) {
            console.error("No response received from server:", error.request);
        } else {
            console.error("Request setup error:", error.message);
        }
    }
};


</script>
<template>
    <div class="row justify-content-md-center">
        <div class="col-12 col-md-8 text-center">
            <p>We appreciate your business! A confirmation email will be sent to <span id="customer-email"></span>.</p>
            <p>If you have any questions, please email <a href="mailto:hello@eleven.trading">hello@eleven.trading</a>.
            </p>
        </div>
    </div>
</template>