<template>
  <section class="base-card">
    <slot />
  </section>
</template>

<style scoped lang="scss">
.base-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);

  background: var(--color-surface);

  box-shadow: var(--shadow-card);
}
</style>