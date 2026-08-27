<script setup lang="ts">
import {
  computed,
  ref,
  watch,
} from 'vue'
import { useRouter } from 'vue-router'

import PageHeader from '@/shared/ui/PageHeader.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import Pagination from '@/shared/ui/Pagination.vue'

import CourseToolbar from '../components/CourseToolbar.vue'
import CourseTable from '../components/CourseTable.vue'
import { mockCourses } from '../model/course.mock'
import type { CourseViewModel } from '../model/course.types.ts'

const router = useRouter()

const search = ref('')
const page = ref(1)

const pageSize = 10

const filteredCourses = computed(() => {
  const keyword = search.value
    .trim()
    .toLowerCase()
  
  if (!keyword) {
    return mockCourses
  }

  return mockCourses.filter(course => {
    return (
      course.courseName
        .toLowerCase()
        .includes(keyword) ||
      String(course.id)
        .includes(keyword)
    )
  })
})

const paginatedCourses = computed(() => {
  const start = (page.value - 1) * pageSize

  const end = start + pageSize

  return filteredCourses.value.slice(start, end)
})

watch(search, () => {
  page.value = 1
})

function handleCreate() {
  router.push('/courses/new')
}

function handleView(course: CourseViewModel) {
  router.push(`/courses/${course.id}`)
}
</script>

<template>
  <section>
    <PageHeader
      title="Course Management"
      subtitle="List"
    />

    <BaseCard>
      <CourseToolbar
        v-model:search="search"
        @create="handleCreate"
      />

      <CourseTable
        v-if="paginatedCourses.length" 
        :courses="paginatedCourses"
        @view="handleView"
      />

      <div
        v-else
        class="
          px-5
          py-12
          text-center
          text-sm
          text-(--color-text-secondary)
        "
      >
        No students found.
      </div>

      <Pagination
        v-if="filteredCourses.length"
        v-model:page="page"
        :total="filteredCourses.length"
        :page-size="pageSize"
      />
    </BaseCard>
  </section>
</template>