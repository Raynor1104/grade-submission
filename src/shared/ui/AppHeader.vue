<script setup lang="ts">
import { UserRound } from '@lucide/vue'

withDefaults(
  defineProps<{
    username?: string | null
  }>(),
  {
    username: null,
  },
)
</script>

<template>
  <header
    class="
      border-b
      border-(--color-border)
      bg-(--color-surface)
    "
  >
    <div
      class="
        mx-auto
        flex
        h-14
        w-full
        max-w-[1600px]
        items-center
        justify-between
        px-6
      "
    >
      <div
        class="
          text-sm
          font-semibold
          tracking-wide
          text-(--color-text-primary)
        "
      >
        GRADE SUBMISSION SYSTEM
      </div>

      <div
        class="
          flex
          items-center
          gap-2
          text-sm
          text-(--color-text-secondary)
        "
      >
        <span>{{ username ? `Hello, ${username}` : 'Hello' }}</span>

        <UserRound
          :size="18"
          :stroke-width="1.8"
        />
      </div>
    </div>
  </header>
</template>
