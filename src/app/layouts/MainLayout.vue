<script setup lang="ts">
import { useRouter } from 'vue-router'

import { logout } from '@/app/auth/auth-actions'
import { authSession } from '@/core/auth/auth-session'
import AppFooter from '@/shared/ui/AppFooter.vue'
import AppHeader from '@/shared/ui/AppHeader.vue'
import AppNav from '@/shared/ui/AppNav.vue'

const router = useRouter()

function handleLogout(): void {
  void logout(router)
}
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader :username="authSession.username" />

    <AppNav @logout="handleLogout" />

    <main
      class="
        flex-1
        bg-(--color-page)
      "
    >
      <div
        class="
          mx-auto
          w-full
          max-w-[1600px]
          px-6
          py-5
        "
      >
        <RouterView />
      </div>
    </main>

    <AppFooter />
  </div>
</template>
