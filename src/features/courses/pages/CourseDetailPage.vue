<script setup lang="ts">
import { useRoute } from 'vue-router'

import PageHeader from '@/shared/ui/PageHeader.vue'

const route = useRoute()
</script>

<template>
  <section>
    <PageHeader
      title="Course Management"
      subtitle="Detail"
    />

    Course ID:
    {{ route.params.id }}
  </section>
</template>