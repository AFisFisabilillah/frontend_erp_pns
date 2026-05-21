<script setup lang="ts">
import type { IUnitKerjaOption } from '~/types/pegawai'

interface IPerPageOption {
  label: string
  value: number
}

defineProps<{
  search: string
  unitKerja: string
  unitKerjaOptions: IUnitKerjaOption[]
  unitKerjaLoading: boolean
  size: number
  perPageOptions: IPerPageOption[]
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:unitKerja': [value: string]
  'update:size': [value: number | string]
  apply: []
  reset: []
}>()
</script>

<template>
  <section class="rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(26,26,36,0.82)] p-5 shadow-[0_16px_48px_rgba(0,0,0,0.28)] backdrop-blur-xl">
    <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div class="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_180px]">
        <UFormField label="Pencarian pegawai" name="search">
          <UInput
            :model-value="search"
            icon="i-lucide-search"
            placeholder="Cari nama, NIP, atau jabatan"
            aria-label="Cari data pegawai"
            class="w-full"
            size="xl"
            @update:model-value="emit('update:search', String($event))"
            @keydown.enter.prevent="emit('apply')"
          />
        </UFormField>

        <UFormField label="Filter unit kerja" name="unit_kerja">
          <USelect
            :model-value="unitKerja"
            :items="unitKerjaOptions"
            :loading="unitKerjaLoading"
            value-key="value"
            label-key="label"
            icon="i-lucide-building-2"
            placeholder="Pilih unit kerja"
            aria-label="Filter data berdasarkan unit kerja"
            class="w-full"
            size="xl"
            @update:model-value="emit('update:unitKerja', String($event))"
          />
        </UFormField>

        <UFormField label="Baris per halaman" name="size">
          <USelect
            :model-value="size"
            :items="perPageOptions"
            value-key="value"
            label-key="label"
            aria-label="Pilih jumlah data per halaman"
            size="xl"
            class="w-full"
            @update:model-value="emit('update:size', $event)"
          />
        </UFormField>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row">
        <UButton
          color="neutral"
          variant="subtle"
          icon="i-lucide-rotate-ccw"
          aria-label="Reset seluruh filter data pegawai"
          class="justify-center"
          @click="emit('reset')"
        >
          Reset
        </UButton>

        <UButton
          icon="i-lucide-filter"
          aria-label="Terapkan filter data pegawai"
          class="justify-center shadow-[0_0_20px_rgba(37,99,235,0.25)]"
          @click="emit('apply')"
        >
          Terapkan Filter
        </UButton>
      </div>
    </div>
  </section>
</template>
