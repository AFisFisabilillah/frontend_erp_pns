<script setup lang="ts">
import type { IPegawaiQueryParams } from '~/types/pegawai'
import PegawaiFilterPanel from "~/components/pegawai/PegawaiFilterPanel.vue";
import PegawaiTablePanel from "~/components/pegawai/PegawaiTablePanel.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Data Pegawai',
  subtitle: 'Kelola daftar PNS aktif beserta pencarian, filter, dan aksi administrasi.'
})

const pegawaiStore = usePegawaiStore()
const toast = useToast()

const filterForm = reactive<Required<Pick<IPegawaiQueryParams, 'search' | 'unit_kerja' | 'size' | 'page'>>>({
  search: '',
  unit_kerja: '',
  size: 10,
  page: 1
})

const selectedPegawaiIds = ref<string[]>([])
const deleteModalOpen = ref(false)
const deleteTargetIds = ref<string[]>([])

const daftarPerHalaman = [
  { label: '10 / halaman', value: 10 },
  { label: '25 / halaman', value: 25 },
  { label: '50 / halaman', value: 50 }
]

const SEMUA_UNIT_KERJA_VALUE = '__semua_unit_kerja__'

const daftarUnitKerjaFilter = computed(() => [
  { label: 'Semua unit kerja', value: SEMUA_UNIT_KERJA_VALUE },
  ...pegawaiStore.daftarUnitKerja
])

const unitKerjaFilterValue = computed(() => filterForm.unit_kerja || SEMUA_UNIT_KERJA_VALUE)

const totalPegawaiTerpilih = computed(() => selectedPegawaiIds.value.length)
const semuaBarisTerpilih = computed(() => {
  const daftar = pegawaiStore.daftarPegawai
  return daftar.length > 0 && daftar.every((item) => selectedPegawaiIds.value.includes(item.nip))
})

const totalData = computed(() => pegawaiStore.pagination?.total ?? 0)
const halamanSaatIni = computed(() => pegawaiStore.pagination?.current_page ?? 1)
const totalHalaman = computed(() => pegawaiStore.pagination?.last_page ?? 1)
const rentangData = computed(() => {
  const meta = pegawaiStore.pagination

  if (!meta || meta.total === 0) {
    return 'Belum ada data pegawai.'
  }

  return `Menampilkan ${meta.from ?? 0}-${meta.to ?? 0} dari ${meta.total} pegawai`
})

const ringkasanFilter = computed(() => [
  {
    label: 'Unit kerja',
    value: filterForm.unit_kerja || 'Semua unit'
  },
  {
    label: 'Pencarian',
    value: filterForm.search || 'Tanpa kata kunci'
  }
])

function toggleSelectedPegawai(nip: string, checked: boolean | 'indeterminate') {
  if (checked === 'indeterminate') {
    return
  }

  if (checked) {
    if (!selectedPegawaiIds.value.includes(nip)) {
      selectedPegawaiIds.value = [...selectedPegawaiIds.value, nip]
    }

    return
  }

  selectedPegawaiIds.value = selectedPegawaiIds.value.filter((item) => item !== nip)
}

function toggleSelectAll(checked: boolean | 'indeterminate') {
  if (checked === 'indeterminate') {
    return
  }

  selectedPegawaiIds.value = checked
    ? pegawaiStore.daftarPegawai.map((item) => item.nip)
    : []
}

async function loadPegawai(params: Partial<typeof filterForm> = {}) {
  try {
    await pegawaiStore.fetchPegawai({
      search: params.search ?? filterForm.search,
      unit_kerja: params.unit_kerja ?? filterForm.unit_kerja,
      size: params.size ?? filterForm.size,
      page: params.page ?? filterForm.page
    })
  } catch (error: unknown) {
    toast.add({
      title: 'Gagal memuat data pegawai',
      description: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil data pegawai.',
      color: 'error'
    })
  }
}

async function loadUnitKerjaFilter() {
  try {
    await pegawaiStore.fetchUnitKerja()
  } catch (error: unknown) {
    toast.add({
      title: 'Gagal memuat unit kerja',
      description: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil pilihan unit kerja.',
      color: 'error'
    })
  }
}

async function terapkanFilter() {
  filterForm.page = 1
  selectedPegawaiIds.value = []
  await loadPegawai({ page: 1 })
}

async function resetFilter() {
  filterForm.search = ''
  filterForm.unit_kerja = ''
  filterForm.size = 10
  filterForm.page = 1
  selectedPegawaiIds.value = []
  await loadPegawai()
}

async function ubahHalaman(halaman: number) {
  if (halaman < 1 || halaman > totalHalaman.value || halaman === halamanSaatIni.value) {
    return
  }

  filterForm.page = halaman
  selectedPegawaiIds.value = []
  await loadPegawai({ page: halaman })
}

async function ubahJumlahPerHalaman(value: number | string) {
  filterForm.size = Number(value)
  filterForm.page = 1
  selectedPegawaiIds.value = []
  await loadPegawai({ size: filterForm.size, page: 1 })
}

function ubahUnitKerjaFilter(value: string) {
  filterForm.unit_kerja = value === SEMUA_UNIT_KERJA_VALUE ? '' : value
}

const deleteDescription = computed(() => {
  return deleteTargetIds.value.length === 1
    ? 'Data pegawai yang dipilih akan dipindahkan dari daftar aktif.'
    : `${deleteTargetIds.value.length} data pegawai yang dipilih akan dipindahkan dari daftar aktif.`
})

async function bukaDetailPegawai(nip: string) {
  await navigateTo(`/pegawai/${nip}`)
}

async function bukaEditPegawai(nip: string) {
  await navigateTo(`/pegawai/${nip}/edit`)
}

function mintaHapusPegawai(ids: string[]) {
  if (ids.length === 0) {
    return
  }

  deleteTargetIds.value = [...ids]
  deleteModalOpen.value = true
}

async function hapusPegawai() {
  if (deleteTargetIds.value.length === 0) {
    return
  }

  try {
    await pegawaiStore.deletePegawai({ id_pegawai: deleteTargetIds.value })
    selectedPegawaiIds.value = selectedPegawaiIds.value.filter((id) => !deleteTargetIds.value.includes(id))
    deleteModalOpen.value = false

    toast.add({
      title: 'Penghapusan berhasil',
      description: deleteTargetIds.value.length === 1
        ? 'Data pegawai berhasil dipindahkan dari daftar aktif.'
        : `${deleteTargetIds.value.length} data pegawai berhasil dipindahkan dari daftar aktif.`,
      color: 'success'
    })
    deleteTargetIds.value = []
  } catch (error: unknown) {
    toast.add({
      title: 'Gagal menghapus data',
      description: error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus data pegawai.',
      color: 'error'
    })
  }
}

onMounted(async () => {
  await loadUnitKerjaFilter()
  await loadPegawai()
})
</script>

<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-4 rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(17,17,24,0.84)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-sm text-[var(--color-dark-200)]">Operasional Pegawai</p>
        <h1 class="mt-2 text-2xl font-semibold text-[var(--color-dark-50)]">Daftar Pegawai</h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-dark-200)]">
          Kelola daftar pegawai aktif, cari berdasarkan unit kerja, dan lakukan aksi administrasi dari satu tampilan kerja.
        </p>
      </div>

      <UButton
        to="/pegawai/tambah"
        icon="i-lucide-user-plus"
        aria-label="Buka halaman tambah pegawai"
      >
        Tambah Pegawai
      </UButton>
    </section>

    <PegawaiFilterPanel
      :search="filterForm.search"
      :unit-kerja="unitKerjaFilterValue"
      :unit-kerja-options="daftarUnitKerjaFilter"
      :unit-kerja-loading="pegawaiStore.unitKerjaLoading"
      :size="filterForm.size"
      :per-page-options="daftarPerHalaman"
      @update:search="filterForm.search = $event"
      @update:unit-kerja="ubahUnitKerjaFilter"
      @update:size="ubahJumlahPerHalaman"
      @apply="terapkanFilter"
      @reset="resetFilter"
    />

    <PegawaiTablePanel
      :pegawai-list="pegawaiStore.daftarPegawai"
      :error-message="pegawaiStore.errorMessage"
      :loading="pegawaiStore.loading"
      :submitting="pegawaiStore.submitting"
      :is-empty="pegawaiStore.isEmpty"
      :selected-ids="selectedPegawaiIds"
      :all-selected="semuaBarisTerpilih"
      :total-data="totalData"
      :current-page="halamanSaatIni"
      :total-pages="totalHalaman"
      :summary-text="rentangData"
      @toggle-all="toggleSelectAll"
      @toggle-row="toggleSelectedPegawai"
      @delete-selected="mintaHapusPegawai(selectedPegawaiIds)"
      @delete-one="mintaHapusPegawai([$event])"
      @detail="bukaDetailPegawai($event.nip)"
      @edit="bukaEditPegawai($event.nip)"
      @prev="ubahHalaman(halamanSaatIni - 1)"
      @next="ubahHalaman(halamanSaatIni + 1)"
    />

    <UModal v-model:open="deleteModalOpen" title="Konfirmasi Hapus Pegawai">
      <template #body>
        <div class="space-y-3">
          <p class="text-sm leading-6 text-[var(--color-dark-200)]">
            {{ deleteDescription }}
          </p>
          <div class="rounded-xl border border-[var(--color-dark-600)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-[var(--color-dark-50)]">
            Total data yang akan dihapus: <span class="font-semibold">{{ deleteTargetIds.length }}</span>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            aria-label="Batalkan penghapusan data pegawai"
            @click="deleteModalOpen = false"
          >
            Batal
          </UButton>
          <UButton
            color="error"
            icon="i-lucide-trash-2"
            :loading="pegawaiStore.submitting"
            aria-label="Konfirmasi hapus data pegawai"
            @click="hapusPegawai"
          >
            Hapus
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
