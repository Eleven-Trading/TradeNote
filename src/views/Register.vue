<script>
import LoginRegister from '../components/LoginRegister.vue'

export default {
    components: {
        LoginRegister
    },
    data() {
        return {
            signingUp: false,
            registerForm: { username: null, password: null },
            loginForm: { username: null, password: null },
        }
    },
    created: async function () {
    },
    mounted() {

    },
}
</script>

<template>
    <LoginRegister />
</template>
