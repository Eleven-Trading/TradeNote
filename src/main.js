import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './assets/style-dark.css'


const app = createApp(App)

// --- SET APP ID FOR FRONTEND ---
if (!localStorage.getItem('parse_app_id')) {
  localStorage.setItem('parse_app_id', import.meta.env.VITE_APP_ID)
  console.log('Parse App ID set in localStorage:', import.meta.env.VITE_APP_ID)
}

app.use(createPinia())
app.use(router)

app.mount('#app')
