<script setup lang="ts">
import {
  BookOpen,
  ClipboardList,
  House,
  LogOut,
  Users,
} from '@lucide/vue'

const navItems = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: House,
  },
  {
    label: 'Students',
    to: '/students',
    icon: Users,
  },
  {
    label: 'Courses',
    to: '/courses',
    icon: BookOpen,
  },
  {
    label: 'Grades',
    to: '/grades',
    icon: ClipboardList,
  },
]
</script>

<template>
  <nav
    class="
      border-b
      border-(--color-border)
      bg-(--color-surface)
    "
  >
    <div
      class="
        mx-auto
        flex
        h-11
        w-full
        max-w-[1600px]
        items-stretch
        px-6
      "
    >
      <div class="flex items-stretch gap-6">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="
            relative
            flex
            items-center
            gap-2
            text-sm
            text-(--color-text-secondary)
            transition-colors
            hover:text-(--color-primary)
          "
          active-class="
            text-(--color-primary)
            after:absolute
            after:inset-x-0
            after:bottom-0
            after:h-0.5
            after:bg-(--color-primary)
          "
        >
          <component
            :is="item.icon"
            :size="16"
            :stroke-width="1.8"
          />

          {{ item.label }}
        </RouterLink>
      </div>

      <button
        type="button"
        class="
          ml-auto
          flex
          items-center
          gap-2
          text-sm
          text-(--color-text-secondary)
          transition-colors
          hover:text-(--color-primary)
        "
      >
        <LogOut
          :size="16"
          :stroke-width="1.8"
        />

        Logout
      </button>
    </div>
  </nav>
</template>