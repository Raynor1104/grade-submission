import { createApp } from 'vue'

import App from '@/app/App.vue'
import router from '@/app/router'

import '@/styles/tailwind.css'
import '@/styles/main.scss'

createApp(App)
  .use(router)
  .mount('#app')