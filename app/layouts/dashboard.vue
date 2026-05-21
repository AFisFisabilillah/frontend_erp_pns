<script setup lang="ts">
import type { NavigationMenuItem, SidebarProps } from '@nuxt/ui'

// Ignore the props for the example
defineProps<Pick<SidebarProps, 'variant' | 'collapsible' | 'side'>>()

const open = ref(true)
const route = useRoute()

const items: NavigationMenuItem[] = [
  {
    label: 'Home',
    icon: 'i-lucide-house',
    to: '/',
    active: route.path === '/'
  },
  {
    label: 'Pegawai',
    icon: 'i-lucide-users',
    to: '/pegawai',
    active: route.path.startsWith('/pegawai')
  }
]
</script>

<template>
  <div
      class="flex flex-1"
      :class="[
      variant === 'inset' && 'bg-neutral-50 dark:bg-neutral-950',
      side === 'right' && 'flex-row-reverse'
    ]"
  >
    <USidebar
        v-model:open="open"
        :variant="variant"
        :collapsible="collapsible || 'icon'"
        :side="side"
        :ui="{
        container: 'h-full'
      }"
    >
      <template #header>
        <UIcon name="i-logos-nuxt-icon" class="size-8" />
      </template>

      <UNavigationMenu
          :items="items"
          orientation="vertical"
          :ui="{ link: 'p-1.5 overflow-hidden' }"
      />
    </USidebar>

    <div
        class="flex-1 flex flex-col overflow-hidden lg:peer-data-[variant=floating]:my-4 peer-data-[variant=inset]:m-4 lg:peer-data-[variant=inset]:not-peer-data-[collapsible=offcanvas]:ms-0 peer-data-[variant=inset]:rounded-xl peer-data-[variant=inset]:shadow-sm peer-data-[variant=inset]:ring peer-data-[variant=inset]:ring-default bg-default"
    >
      <div
          class="h-(--ui-header-height) shrink-0 flex items-center px-4"
          :class="[
          variant !== 'floating' && 'border-b border-default',
          side === 'right' && 'justify-end'
        ]"
      >
        <UButton
            :icon="side === 'left' ? 'i-lucide-panel-left' : 'i-lucide-panel-right'"
            color="neutral"
            variant="ghost"
            aria-label="Toggle sidebar"
            @click="open = !open"
        />
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <slot />
      </div>
    </div>
  </div>
</template>
