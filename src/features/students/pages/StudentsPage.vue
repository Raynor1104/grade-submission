<script setup lang="ts">
import {
  computed,
  ref,
  watch,
} from 'vue'
import { useRouter } from 'vue-router'

import BaseCard from '@/shared/ui/BaseCard.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'
import Pagination from '@/shared/ui/Pagination.vue'

import StudentTable from '../components/StudentTable.vue'
import StudentToolbar from '../components/StudentToolbar.vue'
import { mockStudents } from '../model/student.mock'

import type { StudentViewModel } from '../model/student.types'

const router = useRouter()

const search = ref('')
const page = ref(1)

const pageSize = 10

const filteredStudents = computed(() => {
  const keyword = search.value
    .trim()
    .toLowerCase()

  if (!keyword) {
    return mockStudents
  }

  return mockStudents.filter(student => {
    return (
      student.name
        .toLowerCase()
        .includes(keyword) ||
      String(student.id)
        .includes(keyword)
    )
  })
})

const paginatedStudents = computed(() => {
  const start =
    (page.value - 1) * pageSize

  const end =
    start + pageSize

  return filteredStudents.value.slice(
    start,
    end,
  )
})

watch(search, () => {
  page.value = 1
})

function handleCreate() {
  router.push('/students/new')
}

function handleView(
  student: StudentViewModel,
) {
  router.push(
    `/students/${student.id}`,
  )
}

function handleDelete(
  student: StudentViewModel,
) {
  console.log(
    'Delete student:',
    student,
  )
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
        v-model:search="search"
        @create="handleCreate"
      />

      <StudentTable
        v-if="paginatedStudents.length"
        :students="paginatedStudents"
        @view="handleView"
        @delete="handleDelete"
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
        v-if="filteredStudents.length"
        v-model:page="page"
        :total="filteredStudents.length"
        :page-size="pageSize"
      />
    </BaseCard>
  </section>
</template>