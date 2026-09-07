<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    page: number
    total: number
    pageSize?: number
    itemLabel?: string
  }>(),
  {
    pageSize: 10,
  },
)

const emit = defineEmits<{
  'update:page': [page: number]
}>()

const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(props.total / props.pageSize),
  )
})

const startItem = computed(() => {
  if (props.total === 0) {
    return 0
  }

  return (props.page - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  return Math.min(
    props.page * props.pageSize,
    props.total,
  )
})

const visiblePages = computed(() => {
  const pages: number[] = []

  const start = Math.max(
    1,
    props.page - 2,
  )

  const end = Math.min(
    totalPages.value,
    props.page + 2,
  )

  for (
    let page = start;
    page <= end;
    page++
  ) {
    pages.push(page)
  }

  return pages
})

function goToPage(page: number) {
  if (
    page < 1 ||
    page > totalPages.value ||
    page === props.page
  ) {
    return
  }

  emit('update:page', page)
}
</script>

<template>
  <div
    class="
      flex
      flex-col
      gap-4
      border-t
      border-(--color-border)
      px-5
      py-4
      md:flex-row
      md:items-center
      md:justify-between
    "
  >
    <p
      class="
        text-sm
        text-(--color-text-secondary)
      "
    >
      Showing
      {{ startItem }}–{{ endItem }}
      of
      {{ total }}
      {{ itemLabel }}
    </p>

    <div class="flex items-center gap-1">
      <button
        type="button"
        class="pagination-button"
        :disabled="page <= 1"
        @click="goToPage(page - 1)"
      >
        Previous
      </button>

      <button
        v-for="pageNumber in visiblePages"
        :key="pageNumber"
        type="button"
        class="pagination-button"
        :class="{
            'pagination-button--active':
            pageNumber === page,
        }"
        :aria-label="
            `Go to page ${pageNumber}`
        "
        :aria-current="
            pageNumber === page
            ? 'page'
            : undefined
        "
        @click="goToPage(pageNumber)"
        >
        {{ pageNumber }}
      </button>

      <button
        type="button"
        class="pagination-button"
        :disabled="page >= totalPages"
        @click="goToPage(page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pagination-button {
  display: inline-flex;
  min-width: 32px;
  min-height: 32px;

  align-items: center;
  justify-content: center;

  padding: 0.375rem 0.625rem;

  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);

  background: var(--color-surface);

  color: var(--color-text-secondary);

  font-size: 0.75rem;
  font-weight: 500;

  transition:
    border-color 150ms ease,
    background-color 150ms ease,
    color 150ms ease;

  &:hover:not(:disabled) {
    border-color: var(--color-primary);

    color: var(--color-primary);
  }

  &--active {
    border-color: var(--color-primary);

    background: var(--color-primary);

    color: white;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
}
</style>
