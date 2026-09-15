import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'

import App from '@/app/App.vue'
import { queryClient } from '@/app/providers/query-client'
import router from '@/app/router'

import '@/styles/tailwind.css'
import '@/styles/main.scss'

createApp(App)
  .use(router)
  .use(VueQueryPlugin, { queryClient })
  .mount('#app')
