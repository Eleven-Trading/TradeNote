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

import { loadStripe } from '@stripe/stripe-js';
import { useCheckCloudPayment, useGetCurrentUser, useGetStripePk } from '../utils/utils';
import { currentUser } from '../stores/globals';

const stripe = ref(null);


onBeforeMount(async () => {
    await useGetCurrentUser();
    try {
        await useCheckCloudPayment(currentUser.value);
        window.location.replace("/dashboard")
    } catch (error) {
        // Redirect to checkout page on error
        let stripePk = await useGetStripePk()
        stripe.value = await loadStripe(stripePk);
        initializeCheckout();
    }

})

onMounted(async () => {

});

// Create a Checkout Session
const initializeCheckout = async () => {
    const fetchClientSecret = async () => {
        const response = await fetch("/api/create-checkout-session", {
            method: "POST",
        });
        const { clientSecret } = await response.json();
        return clientSecret;
    };

    const checkout = await stripe.value.initEmbeddedCheckout({
        fetchClientSecret,
    });

    // Mount Checkout
    checkout.mount('#checkout');
}

</script>
<template>
    <div class="row justify-content-md-center">
        <div class="col-12 col-md-8 text-center">
            <p>Your trial period has expired.</p>
            <p>We hope you enjoyed using TradeNote. Please consider subscribing to continue enjoying TradeNote and
                supporting the project.</p>

            <form id="payment-form" @submit.prevent="handleSubmit">
                <div id="checkout">
                    <!-- Checkout will insert the payment form here -->
                </div>
            </form>
        </div>
    </div>
</template>