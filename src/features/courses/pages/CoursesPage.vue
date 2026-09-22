<script setup lang="ts">
import {
  computed,
  nextTick,
  ref,
  watch,
} from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { courseKeys, gradeKeys } from '@/core/api/query-keys'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import DeleteConfirmDialog from '@/shared/ui/DeleteConfirmDialog.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'
import Pagination from '@/shared/ui/Pagination.vue'

import { deleteCourse } from '../api/course.api'
import { courseQueries } from '../api/course.queries'
import CourseTable from '../components/CourseTable.vue'
import CourseToolbar from '../components/CourseToolbar.vue'
import type { CourseViewModel } from '../model/course.types'

const router = useRouter()
const queryClient = useQueryClient()

const {
  data: courseData,
  isPending: coursesPending,
  isError: coursesError,
  refetch: refetchCourses,
} = useQuery(courseQueries.all())

const courses = computed(() => courseData.value ?? [])
const search = ref('')
const page = ref(1)
const deleteTarget = ref<CourseViewModel | null>(null)
const deleteTrigger = ref<HTMLElement | null>(null)
const deleteError = ref<string | null>(null)

const {
  isPending: isDeleting,
  mutateAsync: removeCourse,
  reset: resetDeleteMutation,
} = useMutation({
  mutationFn: (id: number) => deleteCourse(id),
  onSuccess: (_data, id) => {
    queryClient.setQueryData<CourseViewModel[]>(
      courseKeys.all(),
      currentCourses => currentCourses?.filter(course => course.id !== id) ?? [],
    )
    queryClient.removeQueries({ queryKey: courseKeys.detail(id), exact: true })
    void queryClient.invalidateQueries({ queryKey: courseKeys.root })
    void queryClient.invalidateQueries({ queryKey: gradeKeys.root })
  },
})

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

function handleDelete(course: CourseViewModel): void {
  deleteTrigger.value = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null
  deleteError.value = null
  resetDeleteMutation()
  deleteTarget.value = course
}

function closeDeleteDialog(): void {
  if (isDeleting.value) return

  const trigger = deleteTrigger.value
  deleteTarget.value = null
  deleteTrigger.value = null
  deleteError.value = null
  resetDeleteMutation()

  void nextTick(() => trigger?.focus())
}

async function handleConfirmDelete(): Promise<void> {
  if (!deleteTarget.value || isDeleting.value) return

  deleteError.value = null

  try {
    await removeCourse(deleteTarget.value.id)
    closeDeleteDialog()
  } catch {
    deleteError.value = 'Unable to delete course. Please try again.'
  }
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
        @delete="handleDelete"
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

    <DeleteConfirmDialog
      v-if="deleteTarget"
      title="Delete course?"
      :message="`Are you sure you want to delete “${deleteTarget.subject}” (${deleteTarget.code})?`"
      warning="Related grade records may also be deleted. This action cannot be undone."
      :is-deleting="isDeleting"
      :error="deleteError"
      @cancel="closeDeleteDialog"
      @confirm="handleConfirmDelete"
    />
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
