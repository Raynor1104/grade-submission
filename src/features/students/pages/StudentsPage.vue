<script setup lang="ts">
import {
  computed,
  nextTick,
  ref,
  watch,
} from 'vue'
import {
  useRoute,
  useRouter,
} from 'vue-router'

import BaseCard from '@/shared/ui/BaseCard.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'
import Pagination from '@/shared/ui/Pagination.vue'

import StudentDeleteDialog from '../components/StudentDeleteDialog.vue'
import StudentTable from '../components/StudentTable.vue'
import StudentToolbar from '../components/StudentToolbar.vue'
import {
  clampPage,
  filterStudents,
  getTotalPages,
  normalizeStudentSearch,
  paginateStudents,
  parseStudentPage,
  STUDENT_PAGE_SIZE,
} from '../model/student-list'
import { mockStudents } from '../model/student.mock'
import type { StudentViewModel } from '../model/student.types'

const route = useRoute()
const router = useRouter()

const students = ref<StudentViewModel[]>([...mockStudents])
const search = ref('')
const page = ref(1)
const deleteTarget = ref<StudentViewModel | null>(null)
const deleteTrigger = ref<HTMLElement | null>(null)
const isDeleting = ref(false)

function getQueryText(value: unknown): string {
  const queryValue = Array.isArray(value) ? value[0] : value

  return typeof queryValue === 'string' ? queryValue : ''
}

function getManagedQuery(
  searchValue: string,
  pageValue: number,
) {
  const query = { ...route.query }
  const normalizedQuery = searchValue.trim()

  if (normalizedQuery) {
    query.q = normalizedQuery
  } else {
    delete query.q
  }

  if (pageValue > 1) {
    query.page = String(pageValue)
  } else {
    delete query.page
  }

  return query
}

function replaceManagedQuery(
  searchValue = search.value,
  pageValue = page.value,
): void {
  void router.replace({
    query: getManagedQuery(searchValue, pageValue),
  })
}

watch(
  () => [route.query.q, route.query.page] as const,
  ([querySearch, queryPage]) => {
    const routeSearch = getQueryText(querySearch)
    const routePage = getQueryText(queryPage)

    search.value = routeSearch.trim()
    page.value = parseStudentPage(queryPage)

    const canonicalPage = page.value > 1 ? String(page.value) : ''

    if (
      routeSearch !== search.value ||
      routePage !== canonicalPage
    ) {
      replaceManagedQuery(search.value, page.value)
    }
  },
  { immediate: true },
)

const normalizedSearch = computed(() => normalizeStudentSearch(search.value))
const filteredStudents = computed(() => {
  return filterStudents(students.value, normalizedSearch.value)
})
const filteredTotal = computed(() => filteredStudents.value.length)
const totalPages = computed(() => {
  return getTotalPages(filteredTotal.value, STUDENT_PAGE_SIZE)
})
const effectivePage = computed(() => clampPage(page.value, totalPages.value))
const paginatedStudents = computed(() => {
  return paginateStudents(
    filteredStudents.value,
    effectivePage.value,
    STUDENT_PAGE_SIZE,
  )
})

watch(
  totalPages,
  () => {
    const clampedPage = clampPage(page.value, totalPages.value)
    const canonicalSearch = search.value.trim()
    const currentQuerySearch = getQueryText(route.query.q)
    const currentQueryPage = getQueryText(route.query.page)
    const canonicalPage = clampedPage > 1 ? String(clampedPage) : ''

    if (
      clampedPage !== page.value ||
      currentQuerySearch !== canonicalSearch ||
      currentQueryPage !== canonicalPage
    ) {
      page.value = clampedPage
      search.value = canonicalSearch
      replaceManagedQuery(canonicalSearch, clampedPage)
    }
  },
  { immediate: true },
)

function handleSearchUpdate(value: string): void {
  search.value = value
  page.value = 1
  replaceManagedQuery(value, 1)
}

function handlePageUpdate(value: number): void {
  const nextPage = clampPage(value, totalPages.value)

  page.value = nextPage
  void router.push({
    query: getManagedQuery(search.value, nextPage),
  })
}

function handleCreate(): void {
  void router.push('/students/new')
}

function handleView(student: StudentViewModel): void {
  void router.push(`/students/${student.id}`)
}

function handleDelete(student: StudentViewModel): void {
  deleteTrigger.value = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null
  deleteTarget.value = student
}

function closeDeleteDialog(): void {
  const trigger = deleteTrigger.value

  deleteTarget.value = null
  deleteTrigger.value = null
  isDeleting.value = false

  void nextTick(() => {
    trigger?.focus()
  })
}

async function handleConfirmDelete(): Promise<void> {
  if (!deleteTarget.value || isDeleting.value) {
    return
  }

  isDeleting.value = true
  const deletedStudentId = deleteTarget.value.id

  await nextTick()

  students.value = students.value.filter(student => {
    return student.id !== deletedStudentId
  })

  closeDeleteDialog()
}
</script>

<template>
  <section>
    <PageHeader
      title="Student Management"
      subtitle="List"
    />

    <BaseCard>
      <StudentToolbar
        :search="search"
        @update:search="handleSearchUpdate"
        @create="handleCreate"
      />

      <div
        v-if="students.length === 0"
        class="student-state"
      >
        No students yet.
      </div>

      <div
        v-else-if="filteredTotal === 0"
        class="student-state"
      >
        No students found.
      </div>

      <StudentTable
        v-else
        :students="paginatedStudents"
        @view="handleView"
        @delete="handleDelete"
      />

      <Pagination
        v-if="filteredTotal > 0"
        :page="effectivePage"
        :total="filteredTotal"
        :page-size="STUDENT_PAGE_SIZE"
        item-label="students"
        aria-label="Student list pagination"
        @update:page="handlePageUpdate"
      >
        <template #note>
          <span class="student-edit-note">
            Edit is currently unavailable.
          </span>
        </template>
      </Pagination>
    </BaseCard>

    <StudentDeleteDialog
      v-if="deleteTarget"
      :student="deleteTarget"
      :is-deleting="isDeleting"
      :error="null"
      @cancel="closeDeleteDialog"
      @confirm="handleConfirmDelete"
    />
  </section>
</template>

<style scoped lang="scss">
.student-state {
  display: flex;
  min-height: 12rem;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.25rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  text-align: center;
}

.student-edit-note {
  display: inline-flex;
  align-items: center;
  text-align: center;
}
</style>
