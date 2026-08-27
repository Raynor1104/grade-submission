<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <header
    class="
      mb-5
      flex
      items-center
      gap-4
    "
  >
    <h1
      class="
        text-[22px]
        font-semibold
        tracking-tight
        text-(--color-text-primary)
      "
    >
      {{ title }}
    </h1>

    <template v-if="subtitle">
      <span
        class="
          h-5
          w-px
          bg-(--color-border)
        "
      />

      <span
        class="
          text-sm
          text-(--color-text-secondary)
        "
      >
        {{ subtitle }}
      </span>
    </template>

    <div class="ml-auto">
      <slot name="actions" />
    </div>
  </header>
</template>