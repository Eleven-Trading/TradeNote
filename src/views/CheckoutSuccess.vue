<script setup>
import { onBeforeMount, ref, onMounted, nextTick } from 'vue';

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

import { loadStripe } from '@stripe/stripe-js';

const stripe = ref(null);
const elements = ref(null);
const clientSecret = ref("");
const message = ref("");
const stripe_pk = "pk_test_51Kg2CGFIT9U3HKjW3pnX5rGQmQ285A6dB8c7Pd7ThtXoc0ZguzUJmnJPw7Dyby2sTi9G7ih2Eu1jj0BB8nzzP1jC00HpNuY5ZF"

onBeforeMount(async () => {
})

onMounted(async () => {
    //stripe.value = await loadStripe(stripe_pk);
    initializeCheckout();
    
});

const initializeCheckout = async () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sessionId = urlParams.get("session_id");

    try {
        // Axios request to the session-status endpoint
        const response = await axios.get("/api/session-status", {
            params: { session_id: sessionId }, // Axios automatically builds query strings
        });

        const session = response.data; // Axios automatically parses JSON
        console.log("Session:", JSON.stringify(session))

        if (session.status === "open") {
            window.location.replace("/checkout.html"); // Correct redirection method
        } else if (session.status === "complete") {
            document.getElementById("success").classList.remove("hidden");
            document.getElementById("customer-email").textContent = session.customer_email;
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
        <section id="success" class="hidden">
            <p>
                We appreciate your business! A confirmation email will be sent to <span id="customer-email"></span>.

                If you have any questions, please email <a href="mailto:hello@eleven.trading">hello@eleven.trading</a>.
            </p>
        </section>
    </div>
</template>