<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { IPegawai } from '~/types/pegawai'

const props = defineProps<{
  pegawaiList: IPegawai[]
  errorMessage: string | null
  loading: boolean
  submitting: boolean
  selectedIds: string[]
  allSelected: boolean
}>()

const emit = defineEmits<{
  'toggle-all': [checked: boolean | 'indeterminate']
  'toggle-row': [nip: string, checked: boolean | 'indeterminate']
  'restore-selected': []
  'force-delete-selected': []
  'restore-one': [nip: string]
  'force-delete-one': [nip: string]
}>()

const UCheckbox = resolveComponent('UCheckbox')
const { buildPegawaiFotoUrl } = usePegawaiForm()

const columns: TableColumn<IPegawai>[] = [
  {
    id: 'select',
    header: () => h(UCheckbox, {
      modelValue: props.allSelected,
      'aria-label': 'Pilih semua pegawai terhapus',
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => emit('toggle-all', value)
    }),
    cell: ({ row }) => h(UCheckbox, {
      modelValue: props.selectedIds.includes(row.original.nip),
      'aria-label': `Pilih pegawai terhapus ${row.original.nama}`,
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => emit('toggle-row', row.original.nip, value)
    }),
    meta: {
      class: {
        th: 'w-14',
        td: 'align-top'
      }
    }
  },
  {
    accessorKey: 'pegawai',
    header: 'Pegawai',
    cell: ({ row }) => row.original,
    meta: {
      class: {
        th: 'min-w-72',
        td: 'align-top'
      }
    }
  },
  {
    accessorKey: 'kontak',
    header: 'Kontak',
    cell: ({ row }) => row.original,
    meta: {
      class: {
        th: 'min-w-48',
        td: 'align-top'
      }
    }
  },
  {
    accessorKey: 'lahir',
    header: 'Kelahiran',
    cell: ({ row }) => row.original,
    meta: {
      class: {
        th: 'min-w-48',
        td: 'align-top'
      }
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => row.original,
    meta: {
      class: {
        th: 'w-44',
        td: 'align-top'
      }
    }
  },
  {
    accessorKey: 'aksi',
    header: 'Aksi',
    cell: ({ row }) => row.original,
    meta: {
      class: {
        th: 'w-72',
        td: 'align-top'
      }
    }
  }
]

function formatTanggal(tanggal: string): string {
  if (!tanggal) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(tanggal))
}

function formatJenisKelamin(jenisKelamin: IPegawai['jenis_kelamin']): string {
  return jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'
}

function getInisial(nama: string): string {
  return nama
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((bagian) => bagian.charAt(0).toUpperCase())
    .join('')
}
</script>

<template>
  <section class="rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(17,17,24,0.9)] shadow-[0_24px_60px_rgba(0,0,0,0.34)] backdrop-blur-xl">
    <div class="flex flex-col gap-4 border-b border-[var(--color-dark-600)] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-sm font-medium text-[var(--color-dark-50)]">Data Terhapus</p>
        <p class="mt-1 text-sm text-[var(--color-dark-200)]">
          {{ pegawaiList.length }} pegawai berada di trash, {{ selectedIds.length }} dipilih.
        </p>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="rounded-full border border-[var(--color-dark-600)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-sm text-[var(--color-dark-200)]">
          {{ selectedIds.length }} dipilih
        </div>

        <UButton
          color="success"
          variant="soft"
          icon="i-lucide-rotate-ccw"
          :disabled="selectedIds.length === 0 || submitting"
          :loading="submitting"
          aria-label="Pulihkan semua pegawai yang dipilih"
          @click="emit('restore-selected')"
        >
          Restore
        </UButton>

        <UButton
          color="error"
          variant="soft"
          icon="i-lucide-trash-2"
          :disabled="selectedIds.length === 0 || submitting"
          :loading="submitting"
          aria-label="Hapus permanen semua pegawai yang dipilih"
          @click="emit('force-delete-selected')"
        >
          Force Delete
        </UButton>
      </div>
    </div>

    <div v-if="errorMessage" class="px-5 pt-5">
      <UAlert
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        :title="errorMessage"
      />
    </div>

    <div class="px-5 py-5">
      <UTable
        :data="pegawaiList"
        :columns="columns"
        :loading="loading"
        sticky="header"
        :ui="{
          root: 'rounded-xl border border-[var(--color-dark-600)] bg-[rgba(255,255,255,0.02)]',
          base: 'min-w-[1060px]',
          thead: 'bg-[rgba(255,255,255,0.02)]',
          th: 'px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-dark-400)]',
          td: 'px-5 py-4 text-sm text-[var(--color-dark-200)]',
          tbody: 'divide-y divide-[var(--color-dark-600)]',
          tr: 'transition-colors duration-200 hover:bg-[rgba(255,255,255,0.025)]'
        }"
      >
        <template #empty>
          <div class="px-5 py-16 text-center">
            <div class="mx-auto flex max-w-sm flex-col items-center">
              <div class="flex size-14 items-center justify-center rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(16,185,129,0.12)] text-emerald-200">
                <UIcon name="i-lucide-shield-check" class="size-6" />
              </div>
              <h2 class="mt-5 text-base font-semibold text-[var(--color-dark-50)]">Trash masih kosong</h2>
              <p class="mt-2 text-sm leading-6 text-[var(--color-dark-200)]">
                Pegawai yang dihapus sementara akan tampil di sini untuk direstore atau dihapus permanen.
              </p>
            </div>
          </div>
        </template>

        <template #pegawai-cell="{ row }">
          <div class="flex items-start gap-4">
            <UAvatar
              :src="buildPegawaiFotoUrl(row.original.foto_pegawai) || undefined"
              :alt="`Foto ${row.original.nama}`"
              :text="getInisial(row.original.nama)"
              size="xl"
              class="ring-1 ring-[var(--color-dark-600)]"
            />
            <div>
              <p class="font-semibold text-[var(--color-dark-50)]">{{ row.original.nama }}</p>
              <p class="mt-1 text-xs tracking-[0.16em] text-[var(--color-dark-400)]">{{ row.original.nip }}</p>
              <p class="mt-2 text-xs text-[var(--color-dark-200)]">{{ formatJenisKelamin(row.original.jenis_kelamin) }} · {{ row.original.agama }}</p>
            </div>
          </div>
        </template>

        <template #kontak-cell="{ row }">
          <div class="space-y-1">
            <p class="text-[var(--color-dark-50)]">{{ row.original.no_hp || '-' }}</p>
            <p class="text-xs text-[var(--color-dark-400)]">NPWP {{ row.original.npwp || '-' }}</p>
          </div>
        </template>

        <template #lahir-cell="{ row }">
          <div class="space-y-1">
            <p class="text-[var(--color-dark-50)]">{{ row.original.tempat_lahir || '-' }}</p>
            <p class="text-xs text-[var(--color-dark-400)]">{{ formatTanggal(row.original.tgl_lahir) }}</p>
          </div>
        </template>

        <template #status-cell="{ row }">
          <UBadge color="warning" variant="soft" class="rounded-full">
            Dihapus sementara
          </UBadge>
          <p class="mt-2 text-xs text-[var(--color-dark-400)]">
            Update {{ formatTanggal(row.original.updated_at) }}
          </p>
        </template>

        <template #aksi-cell="{ row }">
          <div class="flex flex-wrap gap-2">
            <UButton
              color="success"
              variant="soft"
              icon="i-lucide-rotate-ccw"
              :loading="submitting"
              :aria-label="`Restore pegawai ${row.original.nama}`"
              @click="emit('restore-one', row.original.nip)"
            >
              Restore
            </UButton>

            <UButton
              color="error"
              variant="soft"
              icon="i-lucide-trash-2"
              :loading="submitting"
              :aria-label="`Hapus permanen pegawai ${row.original.nama}`"
              @click="emit('force-delete-one', row.original.nip)"
            >
              Force Delete
            </UButton>
          </div>
        </template>
      </UTable>
    </div>
  </section>
</template>
