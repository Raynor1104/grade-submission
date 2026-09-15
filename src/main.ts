import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'

import App from '@/app/App.vue'
import { installAuthExpiredHandler } from '@/app/auth/auth-actions'
import { queryClient } from '@/app/providers/query-client'
import router from '@/app/router'
import { setAccessTokenProvider } from '@/core/api/http-client'
import { getAccessToken } from '@/core/auth/auth-session'

import '@/styles/tailwind.css'
import '@/styles/main.scss'

setAccessTokenProvider(getAccessToken)
installAuthExpiredHandler(router)

createApp(App)
  .use(router)
  .use(VueQueryPlugin, { queryClient })
  .mount('#app')
