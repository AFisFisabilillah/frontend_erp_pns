<script setup lang="ts">
import PegawaiTrashPanel from '~/components/pegawai/PegawaiTrashPanel.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Trash Pegawai',
  subtitle: 'Kelola pegawai yang dihapus sementara untuk restore atau hapus permanen.'
})

const pegawaiStore = usePegawaiStore()
const toast = useToast()

const selectedPegawaiIds = ref<string[]>([])
const forceDeleteModalOpen = ref(false)
const forceDeleteTargetIds = ref<string[]>([])

const semuaBarisTerpilih = computed(() => {
  const daftar = pegawaiStore.daftarPegawaiTerhapus

  return daftar.length > 0 && daftar.every((item) => selectedPegawaiIds.value.includes(item.nip))
})

const forceDeleteDescription = computed(() => {
  return forceDeleteTargetIds.value.length === 1
    ? 'Data pegawai ini akan dihapus permanen dan tidak dapat direstore.'
    : `${forceDeleteTargetIds.value.length} data pegawai akan dihapus permanen dan tidak dapat direstore.`
})

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
    ? pegawaiStore.daftarPegawaiTerhapus.map((item) => item.nip)
    : []
}

async function loadTrashPegawai() {
  try {
    await pegawaiStore.fetchTrashPegawai()
  } catch (error: unknown) {
    toast.add({
      title: 'Gagal memuat trash pegawai',
      description: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil data trash pegawai.',
      color: 'error'
    })
  }
}

async function restorePegawai(ids: string[]) {
  if (ids.length === 0) {
    return
  }

  try {
    await pegawaiStore.restorePegawai({ id_pegawai: ids })
    selectedPegawaiIds.value = selectedPegawaiIds.value.filter((id) => !ids.includes(id))
    toast.add({
      title: 'Restore berhasil',
      description: ids.length === 1
        ? 'Data pegawai berhasil dikembalikan ke daftar aktif.'
        : `${ids.length} data pegawai berhasil dikembalikan ke daftar aktif.`,
      color: 'success'
    })
  } catch (error: unknown) {
    toast.add({
      title: 'Gagal restore pegawai',
      description: error instanceof Error ? error.message : 'Terjadi kesalahan saat restore data pegawai.',
      color: 'error'
    })
  }
}

function mintaForceDelete(ids: string[]) {
  if (ids.length === 0) {
    return
  }

  forceDeleteTargetIds.value = [...ids]
  forceDeleteModalOpen.value = true
}

async function forceDeletePegawai() {
  if (forceDeleteTargetIds.value.length === 0) {
    return
  }

  try {
    await pegawaiStore.forceDeletePegawai({ id_pegawai: forceDeleteTargetIds.value })
    selectedPegawaiIds.value = selectedPegawaiIds.value.filter((id) => !forceDeleteTargetIds.value.includes(id))
    toast.add({
      title: 'Force delete berhasil',
      description: forceDeleteTargetIds.value.length === 1
        ? 'Data pegawai berhasil dihapus permanen.'
        : `${forceDeleteTargetIds.value.length} data pegawai berhasil dihapus permanen.`,
      color: 'success'
    })
    forceDeleteModalOpen.value = false
    forceDeleteTargetIds.value = []
  } catch (error: unknown) {
    toast.add({
      title: 'Gagal force delete',
      description: error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus permanen data pegawai.',
      color: 'error'
    })
  }
}

onMounted(loadTrashPegawai)
</script>

<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-4 rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(17,17,24,0.84)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-sm text-[var(--color-dark-200)]">Arsip Soft Delete</p>
        <h1 class="mt-2 text-2xl font-semibold text-[var(--color-dark-50)]">Trash Pegawai</h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-dark-200)]">
          Review pegawai yang dihapus sementara, lalu restore ke daftar aktif atau hapus permanen secara massal.
        </p>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row">
        <UButton
          to="/pegawai"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
          aria-label="Kembali ke daftar pegawai"
        >
          Kembali
        </UButton>

        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-refresh-cw"
          :loading="pegawaiStore.loading"
          aria-label="Muat ulang data trash pegawai"
          @click="loadTrashPegawai"
        >
          Refresh
        </UButton>
      </div>
    </section>

    <PegawaiTrashPanel
      :pegawai-list="pegawaiStore.daftarPegawaiTerhapus"
      :error-message="pegawaiStore.errorMessage"
      :loading="pegawaiStore.loading"
      :submitting="pegawaiStore.submitting"
      :selected-ids="selectedPegawaiIds"
      :all-selected="semuaBarisTerpilih"
      @toggle-all="toggleSelectAll"
      @toggle-row="toggleSelectedPegawai"
      @restore-selected="restorePegawai(selectedPegawaiIds)"
      @force-delete-selected="mintaForceDelete(selectedPegawaiIds)"
      @restore-one="restorePegawai([$event])"
      @force-delete-one="mintaForceDelete([$event])"
    />

    <UModal v-model:open="forceDeleteModalOpen" title="Konfirmasi Hapus Permanen">
      <template #body>
        <div class="space-y-3">
          <p class="text-sm leading-6 text-[var(--color-dark-200)]">
            {{ forceDeleteDescription }}
          </p>
          <div class="rounded-xl border border-[rgba(239,68,68,0.36)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm text-red-100">
            Total data yang akan dihapus permanen: <span class="font-semibold">{{ forceDeleteTargetIds.length }}</span>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            aria-label="Batalkan hapus permanen data pegawai"
            @click="forceDeleteModalOpen = false"
          >
            Batal
          </UButton>
          <UButton
            color="error"
            icon="i-lucide-trash-2"
            :loading="pegawaiStore.submitting"
            aria-label="Konfirmasi hapus permanen data pegawai"
            @click="forceDeletePegawai"
          >
            Hapus Permanen
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
