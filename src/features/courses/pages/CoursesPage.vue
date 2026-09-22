<script setup lang="ts">
import {
  computed,
  ref,
  watch,
} from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'
import Pagination from '@/shared/ui/Pagination.vue'

import { courseQueries } from '../api/course.queries'
import CourseTable from '../components/CourseTable.vue'
import CourseToolbar from '../components/CourseToolbar.vue'
import type { CourseViewModel } from '../model/course.types'

const router = useRouter()

const {
  data: courseData,
  isPending: coursesPending,
  isError: coursesError,
  refetch: refetchCourses,
} = useQuery(courseQueries.all())

const courses = computed(() => courseData.value ?? [])
const search = ref('')
const page = ref(1)

const pageSize = 10

const filteredCourses = computed(() => {
  const keyword = search.value
    .trim()
    .toLowerCase()
  
  if (!keyword) {
    return courses.value
  }

  return courses.value.filter(course => {
    return (
      course.subject
        .toLowerCase()
        .includes(keyword) ||
      course.code
        .toLowerCase()
        .includes(keyword) ||
      String(course.id)
        .includes(keyword)
    )
  })
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredCourses.value.length / pageSize))
})

const paginatedCourses = computed(() => {
  const start = (page.value - 1) * pageSize

  const end = start + pageSize

  return filteredCourses.value.slice(start, end)
})

watch(search, () => {
  page.value = 1
})

watch(
  [totalPages, coursesPending, coursesError],
  () => {
    if (!coursesPending.value && !coursesError.value) {
      page.value = Math.min(page.value, totalPages.value)
    }
  },
)

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

      <div
        v-if="coursesError"
        class="course-state course-state--stacked"
        role="alert"
      >
        <span>Unable to load courses. Please try again.</span>
        <BaseButton
          variant="secondary"
          size="sm"
          @click="refetchCourses()"
        >
          Retry
        </BaseButton>
      </div>

      <div
        v-else-if="coursesPending"
        class="course-state"
        role="status"
        aria-live="polite"
      >
        Loading courses...
      </div>

      <div
        v-else-if="courses.length === 0"
        class="course-state"
      >
        No courses yet.
      </div>

      <CourseTable
        v-else-if="paginatedCourses.length"
        :courses="paginatedCourses"
        @view="handleView"
      />

      <div
        v-else
        class="course-state"
      >
        No courses found.
      </div>

      <Pagination
        v-if="filteredCourses.length"
        v-model:page="page"
        :total="filteredCourses.length"
        :page-size="pageSize"
        item-label="courses"
        aria-label="Course list pagination"
      />
    </BaseCard>
  </section>
</template>

<style scoped lang="scss">
.course-state {
  display: flex;
  min-height: 12rem;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.25rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  text-align: center;

  &--stacked {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
