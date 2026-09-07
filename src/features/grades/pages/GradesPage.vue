<script setup lang="ts">
import {
  computed,
  ref,
} from 'vue'

import BaseCard from '@/shared/ui/BaseCard.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'
import Pagination from '@/shared/ui/Pagination.vue'

import GradeTable from '../components/GradeTable.vue'
import GradeToolbar from '../components/GradeToolbar.vue'
import { mockGrades } from '../model/grade.mock'

import type {
  GradeCourse,
  GradeStudent,
  GradeViewModel,
} from '../model/grade.types'

const selectedStudentId = ref<number | null>(null)
const selectedCourseId = ref<number | null>(null)
const appliedStudentId = ref<number | null>(null)
const appliedCourseId = ref<number | null>(null)
const page = ref(1)

const pageSize = 6

const students = computed<GradeStudent[]>(() => {
  return Array.from(
    new Map(
      mockGrades.map(grade => [grade.student.id, grade.student]),
    ).values(),
  )
})

const courses = computed<GradeCourse[]>(() => {
  return Array.from(
    new Map(
      mockGrades.map(grade => [grade.course.id, grade.course]),
    ).values(),
  )
})

const filteredGrades = computed(() => {
  return mockGrades.filter(grade => {
    const matchesStudent =
      appliedStudentId.value === null ||
      grade.student.id === appliedStudentId.value

    const matchesCourse =
      appliedCourseId.value === null ||
      grade.course.id === appliedCourseId.value

    return matchesStudent && matchesCourse
  })
})

const paginatedGrades = computed(() => {
  const start = (page.value - 1) * pageSize

  return filteredGrades.value.slice(start, start + pageSize)
})

function handleSearch() {
  appliedStudentId.value = selectedStudentId.value
  appliedCourseId.value = selectedCourseId.value
  page.value = 1
}

function handleCreate() {
  console.log('Submit new grade')
}

function handleEdit(grade: GradeViewModel) {
  console.log('Edit grade:', grade)
}
</script>

<template>
  <section>
    <PageHeader
      title="Grade Management"
      subtitle="List"
    />

    <BaseCard>
      <GradeToolbar
        v-model:student-id="selectedStudentId"
        v-model:course-id="selectedCourseId"
        :students="students"
        :courses="courses"
        @search="handleSearch"
        @create="handleCreate"
      />

      <GradeTable
        v-if="paginatedGrades.length"
        :grades="paginatedGrades"
        @edit="handleEdit"
      />

      <div
        v-else
        class="px-5 py-12 text-center text-sm text-(--color-text-secondary)"
      >
        No grades found for the selected filters.
      </div>

      <Pagination
        v-if="filteredGrades.length"
        v-model:page="page"
        :total="filteredGrades.length"
        :page-size="pageSize"
        item-label="grades"
      />
    </BaseCard>
  </section>
</template>
