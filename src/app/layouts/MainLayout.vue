<script setup lang="ts">
import AppFooter from '@/shared/ui/AppFooter.vue'
import AppHeader from '@/shared/ui/AppHeader.vue'
import AppNav from '@/shared/ui/AppNav.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader />

    <AppNav />

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