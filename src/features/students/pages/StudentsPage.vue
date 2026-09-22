<script setup lang="ts">
import {
  computed,
  nextTick,
  ref,
  watch,
} from 'vue'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/vue-query'
import {
  useRoute,
  useRouter,
} from 'vue-router'

import {
  gradeKeys,
  studentKeys,
} from '@/core/api/query-keys'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import DeleteConfirmDialog from '@/shared/ui/DeleteConfirmDialog.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'
import Pagination from '@/shared/ui/Pagination.vue'

import { deleteStudent } from '../api/student.api'
import { studentQueries } from '../api/student.queries'
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
import type { StudentViewModel } from '../model/student.types'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()

const {
  data: studentData,
  isPending: studentsPending,
  isError: studentsError,
  refetch: refetchStudents,
} = useQuery(studentQueries.all())

const students = computed(() => studentData.value ?? [])
const search = ref('')
const page = ref(1)
const deleteTarget = ref<StudentViewModel | null>(null)
const deleteTrigger = ref<HTMLElement | null>(null)
const deleteError = ref<string | null>(null)

const {
  isPending: isDeleting,
  mutateAsync: removeStudent,
  reset: resetDeleteMutation,
} = useMutation({
  mutationFn: (id: number) => deleteStudent(id),
  onSuccess: (_data, id) => {
    queryClient.setQueryData<StudentViewModel[]>(
      studentKeys.all(),
      currentStudents => (
        currentStudents?.filter(student => student.id !== id) ?? []
      ),
    )
    queryClient.removeQueries({
      queryKey: studentKeys.detail(id),
      exact: true,
    })
    void queryClient.invalidateQueries({ queryKey: studentKeys.root })
    void queryClient.invalidateQueries({ queryKey: gradeKeys.root })
  },
})

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
  [totalPages, studentsPending, studentsError],
  () => {
    if (studentsPending.value || studentsError.value) {
      return
    }

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
  deleteError.value = null
  resetDeleteMutation()
  deleteTarget.value = student
}

function closeDeleteDialog(): void {
  const trigger = deleteTrigger.value

  deleteTarget.value = null
  deleteTrigger.value = null
  deleteError.value = null
  resetDeleteMutation()

  void nextTick(() => {
    trigger?.focus()
  })
}

async function handleConfirmDelete(): Promise<void> {
  if (!deleteTarget.value || isDeleting.value) {
    return
  }

  deleteError.value = null

  try {
    await removeStudent(deleteTarget.value.id)
    closeDeleteDialog()
  } catch {
    deleteError.value = 'Unable to delete student. Please try again.'
  }
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
        v-if="studentsError"
        class="student-state student-state--stacked"
        role="alert"
      >
        <span>Unable to load students. Please try again.</span>
        <BaseButton
          variant="secondary"
          size="sm"
          @click="refetchStudents()"
        >
          Retry
        </BaseButton>
      </div>

      <div
        v-else-if="studentsPending"
        class="student-state"
        role="status"
        aria-live="polite"
      >
        Loading students...
      </div>

      <div
        v-else-if="students.length === 0"
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

    <DeleteConfirmDialog
      v-if="deleteTarget"
      title="Delete student?"
      :message="`Are you sure you want to delete “${deleteTarget.name}” (ID: ${deleteTarget.id})?`"
      warning="Related grade records may also be deleted. This action cannot be undone."
      :is-deleting="isDeleting"
      :error="deleteError"
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

  &--stacked {
    flex-direction: column;
    gap: 0.75rem;
  }
}

.student-edit-note {
  display: inline-flex;
  align-items: center;
  text-align: center;
}
</style>
