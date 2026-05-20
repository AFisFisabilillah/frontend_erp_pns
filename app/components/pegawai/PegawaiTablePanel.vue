<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { IPegawai } from '~/types/pegawai'

const props = defineProps<{
  pegawaiList: IPegawai[]
  errorMessage: string | null
  loading: boolean
  submitting: boolean
  isEmpty: boolean
  selectedIds: string[]
  allSelected: boolean
  totalData: number
  currentPage: number
  totalPages: number
  summaryText: string
}>()

const emit = defineEmits<{
  'toggle-all': [checked: boolean | 'indeterminate']
  'toggle-row': [nip: string, checked: boolean | 'indeterminate']
  'delete-selected': []
  'delete-one': [nip: string]
  detail: [pegawai: IPegawai]
  edit: [pegawai: IPegawai]
  prev: []
  next: []
}>()

const UCheckbox = resolveComponent('UCheckbox')
const config = useRuntimeConfig()
const isPreviewOpen = ref(false)
const previewPegawai = ref<IPegawai | null>(null)

const columns: TableColumn<IPegawai>[] = [
  {
    id: 'select',
    header: () => h(UCheckbox, {
      modelValue: props.allSelected,
      'aria-label': 'Pilih semua data pegawai',
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => emit('toggle-all', value)
    }),
    cell: ({ row }) => h(UCheckbox, {
      modelValue: props.selectedIds.includes(row.original.nip),
      'aria-label': `Pilih pegawai ${row.original.nama}`,
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
    accessorKey: 'foto_col',
    header: 'Foto',
    cell: ({ row }) => row.original,
    meta: {
      class: {
        th: 'w-28',
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
        th: 'min-w-56',
        td: 'align-top'
      }
    }
  },
  {
    accessorKey: 'jabatan_col',
    header: 'Jabatan',
    cell: ({ row }) => row.original,
    meta: {
      class: {
        th: 'min-w-44',
        td: 'align-top'
      }
    }
  },
  {
    accessorKey: 'unit_kerja_col',
    header: 'Unit Kerja',
    cell: ({ row }) => row.original,
    meta: {
      class: {
        th: 'min-w-44',
        td: 'align-top'
      }
    }
  },
  {
    accessorKey: 'golongan_col',
    header: 'Golongan',
    cell: ({ row }) => row.original,
    meta: {
      class: {
        th: 'w-32',
        td: 'align-top'
      }
    }
  },
  {
    accessorKey: 'tanggal_lahir_col',
    header: 'Tanggal Lahir',
    cell: ({ row }) => row.original,
    meta: {
      class: {
        th: 'w-40',
        td: 'align-top'
      }
    }
  },
  {
    accessorKey: 'action_col',
    header: 'Action',
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
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(tanggal))
}

function formatJenisKelamin(jenisKelamin: IPegawai['jenis_kelamin']): string {
  return jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'
}

function getFotoUrl(foto: string | null): string | undefined {
  if (!foto) {
    return undefined
  }

  if (/^https?:\/\//i.test(foto)) {
    return foto
  }

  const baseUrl = String(config.public.apiBaseUrl || '').replace(/\/+$/, '')
  const fotoPath = foto.replace(/^\/+/, '')

  return `${baseUrl}/${fotoPath}`
}

function getInisial(nama: string): string {
  return nama
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((bagian) => bagian.charAt(0).toUpperCase())
    .join('')
}

function bukaPreviewFoto(pegawai: IPegawai) {
  previewPegawai.value = pegawai
  isPreviewOpen.value = true
}
</script>

<template>
  <section class="rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(17,17,24,0.9)] shadow-[0_24px_60px_rgba(0,0,0,0.34)] backdrop-blur-xl">
    <div class="flex flex-col gap-4 border-b border-[var(--color-dark-600)] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-sm font-medium text-[var(--color-dark-50)]">Tabel Pegawai</p>
        <p class="mt-1 text-sm text-[var(--color-dark-200)]">{{ summaryText }}</p>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="rounded-full border border-[var(--color-dark-600)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-sm text-[var(--color-dark-200)]">
          {{ selectedIds.length }} dipilih
        </div>

        <UButton
          color="error"
          variant="soft"
          icon="i-lucide-trash-2"
          :disabled="selectedIds.length === 0 || submitting"
          :loading="submitting"
          aria-label="Hapus semua pegawai yang dipilih"
          @click="emit('delete-selected')"
        >
          Hapus Terpilih
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
          base: 'min-w-[1220px]',
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
              <div class="flex size-14 items-center justify-center rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(37,99,235,0.12)] text-[var(--color-primary-200)]">
                <UIcon name="i-lucide-files" class="size-6" />
              </div>
              <h2 class="mt-5 text-base font-semibold text-[var(--color-dark-50)]">Data pegawai tidak ditemukan</h2>
              <p class="mt-2 text-sm leading-6 text-[var(--color-dark-200)]">
                Ubah kata kunci pencarian atau filter unit kerja untuk menampilkan data yang tersedia.
              </p>
            </div>
          </div>
        </template>

        <template #foto_col-cell="{ row }">
          <UButton
            color="neutral"
            variant="ghost"
            class="rounded-xl p-0"
            :aria-label="`Perbesar foto ${row.original.nama}`"
            @click="bukaPreviewFoto(row.original)"
          >
            <UAvatar
              :src="getFotoUrl(row.original.foto_pegawai)"
              :alt="`Foto ${row.original.nama}`"
              :text="getInisial(row.original.nama)"
              size="xl"
              class="ring-1 ring-[var(--color-dark-600)]"
            />
          </UButton>
        </template>

        <template #pegawai-cell="{ row }">
          <div class="space-y-2">
            <div>
              <p class="text-sm font-semibold text-[var(--color-dark-50)]">{{ row.original.nama }}</p>
              <p class="mt-1 text-xs tracking-[0.16em] text-[var(--color-dark-400)]">{{ row.original.nip }}</p>
            </div>
            <div class="flex flex-wrap gap-2 text-xs text-[var(--color-dark-200)]">
              <span class="rounded-full border border-[var(--color-dark-600)] px-2.5 py-1">
                {{ formatJenisKelamin(row.original.jenis_kelamin) }}
              </span>
              <span class="rounded-full border border-[var(--color-dark-600)] px-2.5 py-1">
                {{ row.original.agama }}
              </span>
            </div>
          </div>
        </template>

        <template #jabatan_col-cell="{ row }">
          {{ row.original.jabatan?.jabatan || '-' }}
        </template>

        <template #unit_kerja_col-cell="{ row }">
          {{ row.original.jabatan?.unit_kerja || '-' }}
        </template>

        <template #golongan_col-cell="{ row }">
          {{ row.original.jabatan?.golongan || '-' }}
        </template>

        <template #tanggal_lahir_col-cell="{ row }">
          {{ formatTanggal(row.original.tgl_lahir) }}
        </template>


        <template #action_col-cell="{ row }">
          <div class="flex flex-wrap gap-2">
            <UButton
              color="neutral"
              variant="subtle"
              icon="i-lucide-eye"
              :aria-label="`Lihat detail pegawai ${row.original.nama}`"
              @click="emit('detail', row.original)"
            >
              Detail
            </UButton>

            <UButton
              color="primary"
              variant="soft"
              icon="i-lucide-pencil"
              :aria-label="`Edit pegawai ${row.original.nama}`"
              @click="emit('edit', row.original)"
            >
              Edit
            </UButton>

            <UButton
              color="error"
              variant="soft"
              icon="i-lucide-trash-2"
              :loading="submitting"
              :aria-label="`Hapus pegawai ${row.original.nama}`"
              @click="emit('delete-one', row.original.nip)"
            >
              Hapus
            </UButton>
          </div>
        </template>
      </UTable>
    </div>

    <UModal v-model:open="isPreviewOpen" title="Foto Pegawai">
      <template #body>
        <div v-if="previewPegawai" class="space-y-4">
          <div class="overflow-hidden rounded-xl border border-[var(--color-dark-600)] bg-[rgba(255,255,255,0.03)]">
            <img
              v-if="getFotoUrl(previewPegawai.foto_pegawai)"
              :src="getFotoUrl(previewPegawai.foto_pegawai)"
              :alt="`Foto ${previewPegawai.nama}`"
              class="max-h-[70vh] w-full object-contain"
            >
            <div v-else class="flex min-h-72 items-center justify-center p-6">
              <UAvatar
                :text="getInisial(previewPegawai.nama)"
                :alt="`Foto ${previewPegawai.nama}`"
                size="3xl"
              />
            </div>
          </div>

          <div>
            <p class="text-sm font-semibold text-[var(--color-dark-50)]">{{ previewPegawai.nama }}</p>
            <p class="mt-1 text-xs tracking-[0.16em] text-[var(--color-dark-400)]">{{ previewPegawai.nip }}</p>
          </div>
        </div>
      </template>
    </UModal>

    <div class="flex flex-col gap-4 border-t border-[var(--color-dark-600)] px-5 py-4 md:flex-row md:items-center md:justify-between">
      <p class="text-sm text-[var(--color-dark-200)]">
        Total data: <span class="font-semibold text-[var(--color-dark-50)]">{{ totalData }}</span>
      </p>

      <div class="flex items-center gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-chevron-left"
          :disabled="currentPage <= 1 || loading"
          aria-label="Ke halaman sebelumnya"
          @click="emit('prev')"
        />

        <div class="rounded-full border border-[var(--color-dark-600)] px-4 py-2 text-sm text-[var(--color-dark-50)]">
          Halaman {{ currentPage }} / {{ totalPages }}
        </div>

        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-chevron-right"
          :disabled="currentPage >= totalPages || loading"
          aria-label="Ke halaman berikutnya"
          @click="emit('next')"
        />
      </div>
    </div>
  </section>
</template>
