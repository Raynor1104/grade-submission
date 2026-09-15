<script setup lang="ts">
import {
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'
import { TriangleAlert } from '@lucide/vue'

import BaseButton from '@/shared/ui/BaseButton.vue'

import type { StudentViewModel } from '../model/student.types'

const props = defineProps<{
  student: StudentViewModel
  isDeleting: boolean
  error: string | null
}>()

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()

const dialog = ref<HTMLDialogElement | null>(null)

function handleCancel(): void {
  if (!props.isDeleting) {
    emit('cancel')
  }
}

onMounted(() => {
  dialog.value?.showModal()
})

onBeforeUnmount(() => {
  if (dialog.value?.open) {
    dialog.value.close()
  }
})
</script>

<template>
  <dialog
    ref="dialog"
    class="student-delete-dialog"
    aria-labelledby="student-delete-title"
    aria-describedby="student-delete-description"
    @cancel.prevent="handleCancel"
  >
    <div class="student-delete-dialog__icon" aria-hidden="true">
      <TriangleAlert :size="24" />
    </div>

    <h2 id="student-delete-title" class="student-delete-dialog__title">
      Delete student?
    </h2>

    <div id="student-delete-description" class="student-delete-dialog__content">
      <p>
        Are you sure you want to delete
        <strong>“{{ student.name }}”</strong>
        (ID: {{ student.id }})?
      </p>

      <p class="student-delete-dialog__warning">
        Related grade records may also be deleted. This action cannot be undone.
      </p>
    </div>

    <p
      v-if="error"
      class="student-delete-dialog__error"
      role="alert"
    >
      {{ error }}
    </p>

    <div class="student-delete-dialog__actions">
      <BaseButton
        autofocus
        variant="secondary"
        :disabled="isDeleting"
        @click="handleCancel"
      >
        Cancel
      </BaseButton>

      <BaseButton
        variant="danger"
        :loading="isDeleting"
        @click="emit('confirm')"
      >
        Delete
      </BaseButton>
    </div>
  </dialog>
</template>

<style scoped lang="scss">
.student-delete-dialog {
  width: min(32rem, calc(100vw - 2rem));
  max-height: calc(100vh - 2rem);
  margin: auto;
  padding: 1.5rem;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-primary);
  box-shadow: 0 24px 64px rgb(15 23 42 / 0.24);

  &::backdrop {
    background: rgb(15 23 42 / 0.55);
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 999px;
    background: var(--color-danger-light);
    color: var(--color-danger);
  }

  &__title {
    margin: 1rem 0 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  &__content {
    display: grid;
    gap: 0.75rem;
    margin-top: 0.75rem;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    line-height: 1.5;

    p {
      margin: 0;
    }
  }

  &__warning {
    padding: 0.75rem;
    border-radius: var(--radius-sm);
    background: var(--color-danger-light);
    color: var(--color-danger);
  }

  &__error {
    margin: 0.875rem 0 0;
    color: var(--color-danger);
    font-size: 0.8125rem;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
}

@media (max-width: 480px) {
  .student-delete-dialog__actions {
    align-items: stretch;
    flex-direction: column-reverse;
  }
}
</style>
