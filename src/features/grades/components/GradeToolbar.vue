<script setup lang="ts">
import {
  BookOpen,
  ChevronDown,
  Funnel,
  Plus,
  Search,
  UserRound,
} from '@lucide/vue'

import BaseButton from '@/shared/ui/BaseButton.vue'

import type {
  GradeCourse,
  GradeStudent,
} from '../model/grade.types'

defineProps<{
  studentId: number | null
  courseId: number | null
  students: GradeStudent[]
  courses: GradeCourse[]
}>()

const emit = defineEmits<{
  'update:studentId': [value: number | null]
  'update:courseId': [value: number | null]
  search: []
  create: []
}>()

function getSelectedId(event: Event) {
  const value = (event.target as HTMLSelectElement).value

  return value ? Number(value) : null
}
</script>

<template>
  <div class="grade-toolbar">
    <div class="grade-toolbar__header">
      <h2 class="grade-toolbar__title">
        <Funnel :size="18" />
        Filter
      </h2>

      <BaseButton
        class="w-full sm:w-auto"
        @click="emit('create')"
      >
        <Plus :size="18" />
        Submit New Grade
      </BaseButton>
    </div>

    <div class="grade-toolbar__filters">
      <label class="grade-toolbar__field">
        <span class="grade-toolbar__label">Student</span>

        <span class="grade-toolbar__select-wrap">
          <UserRound
            :size="18"
            class="grade-toolbar__leading-icon"
          />

          <select
            class="grade-toolbar__select"
            :value="studentId ?? ''"
            @change="emit('update:studentId', getSelectedId($event))"
          >
            <option value="">Select Student</option>
            <option
              v-for="student in students"
              :key="student.id"
              :value="student.id"
            >
              {{ student.name }}
            </option>
          </select>

          <ChevronDown
            :size="17"
            class="grade-toolbar__chevron"
          />
        </span>
      </label>

      <label class="grade-toolbar__field">
        <span class="grade-toolbar__label">Course</span>

        <span class="grade-toolbar__select-wrap">
          <BookOpen
            :size="18"
            class="grade-toolbar__leading-icon"
          />

          <select
            class="grade-toolbar__select"
            :value="courseId ?? ''"
            @change="emit('update:courseId', getSelectedId($event))"
          >
            <option value="">Select Course</option>
            <option
              v-for="course in courses"
              :key="course.id"
              :value="course.id"
            >
              {{ course.code }} — {{ course.name }}
            </option>
          </select>

          <ChevronDown
            :size="17"
            class="grade-toolbar__chevron"
          />
        </span>
      </label>

      <BaseButton
        class="grade-toolbar__search"
        @click="emit('search')"
      >
        <Search :size="18" />
        Search
      </BaseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
.grade-toolbar {
  padding: 1.5rem 1.75rem 1.25rem;
  border-bottom: 1px solid var(--color-border);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin: 0;
    color: var(--color-text-primary);
    font-size: 1rem;
    font-weight: 600;
  }

  &__filters {
    display: grid;
    grid-template-columns: minmax(220px, 370px) minmax(220px, 340px) auto;
    align-items: end;
    gap: 1.5rem;
    margin-top: 0.375rem;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__label {
    color: var(--color-text-primary);
    font-size: 0.8125rem;
    font-weight: 500;
  }

  &__select-wrap {
    position: relative;
    display: block;
  }

  &__select {
    width: 100%;
    min-height: 40px;
    appearance: none;
    padding: 0.5rem 2.5rem 0.5rem 2.625rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    color: var(--color-text-secondary);
    font: inherit;
    font-size: 0.875rem;
    outline: none;
    cursor: pointer;
    transition: border-color 150ms ease, box-shadow 150ms ease;

    &:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgb(6 69 173 / 0.12);
    }
  }

  &__leading-icon,
  &__chevron {
    position: absolute;
    top: 50%;
    z-index: 1;
    color: var(--color-text-secondary);
    pointer-events: none;
    transform: translateY(-50%);
  }

  &__leading-icon {
    left: 0.875rem;
  }

  &__chevron {
    right: 0.875rem;
  }

  &__search {
    min-width: 128px;
    min-height: 40px;
  }
}

@media (max-width: 767px) {
  .grade-toolbar {
    padding: 1.25rem;

    &__header {
      align-items: stretch;
      flex-direction: column;
    }

    &__filters {
      grid-template-columns: 1fr;
      gap: 1rem;
      margin-top: 1.25rem;
    }
  }
}
</style>
