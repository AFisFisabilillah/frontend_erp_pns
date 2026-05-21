<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui'
import type { IPegawaiFormPayload } from '~/types/pegawai'
import PegawaiProfileStep from '~/components/pegawai/form/PegawaiProfileStep.vue'
import PegawaiAddressStep from '~/components/pegawai/form/PegawaiAddressStep.vue'
import PegawaiPositionStep from '~/components/pegawai/form/PegawaiPositionStep.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Tambah Pegawai',
  subtitle: 'Input data pegawai baru melalui form bertahap.'
})

const pegawaiStore = usePegawaiStore()
const toast = useToast()
const currentStep = ref(0)
const formError = ref('')
const fotoPreviewUrl = ref<string | null>(null)
const fotoName = ref('')

const stepItems: StepperItem[] = [
  { slot: 'profil', title: 'Profil', description: 'Data identitas pegawai baru.' },
  { slot: 'alamat', title: 'Alamat', description: 'Alamat domisili pegawai.' },
  { slot: 'jabatan', title: 'Jabatan', description: 'Data penugasan dan unit kerja.' }
]

const state = reactive<IPegawaiFormPayload>({
  foto: null,
  nama: '',
  nip: '',
  tempat_lahir: '',
  tgl_lahir: '',
  jenis_kelamin: 'L',
  agama: '',
  no_hp: '',
  npwp: '',
  alamat: {
    alamat: '',
    kota: '',
    provinsi: ''
  },
  jabatan: {
    nip: '',
    golongan: '',
    eselon: '',
    jabatan: '',
    tempat_tugas: '',
    unit_kerja: ''
  }
})

function setError(message: string) {
  formError.value = message
  toast.add({
    title: 'Validasi form',
    description: message,
    color: 'warning'
  })
}

function validateProfil(): string | null {
  if (!state.nama) return 'Nama pegawai wajib diisi.'
  if (!state.nip) return 'NIP pegawai wajib diisi.'
  if (!state.tempat_lahir) return 'Tempat lahir wajib diisi.'
  if (!state.tgl_lahir) return 'Tanggal lahir wajib diisi.'
  if (!state.agama) return 'Agama wajib dipilih.'
  if (!state.no_hp) return 'Nomor telepon wajib diisi.'
  if (!state.npwp) return 'NPWP wajib diisi.'
  return null
}

function validateAlamat(): string | null {
  if (!state.alamat.alamat) return 'Alamat lengkap wajib diisi.'
  if (!state.alamat.kota) return 'Kota atau kabupaten wajib diisi.'
  if (!state.alamat.provinsi) return 'Provinsi wajib diisi.'
  return null
}

function validateJabatan(): string | null {
  if (!state.jabatan.golongan) return 'Golongan wajib diisi.'
  if (!state.jabatan.eselon) return 'Eselon wajib diisi.'
  if (!state.jabatan.jabatan) return 'Jabatan wajib diisi.'
  if (!state.jabatan.tempat_tugas) return 'Tempat tugas wajib diisi.'
  if (!state.jabatan.unit_kerja) return 'Unit kerja wajib diisi.'
  return null
}

function validateStep(step: number): boolean {
  const validators = [validateProfil, validateAlamat, validateJabatan]
  const error = validators[step]?.() || null

  if (!error) {
    formError.value = ''
    return true
  }

  setError(error)
  return false
}

function nextStep() {
  if (!validateStep(currentStep.value)) {
    return
  }

  currentStep.value += 1
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value -= 1
  }
}

function handleFotoChange(file: File | null) {
  state.foto = file
  fotoName.value = file?.name || ''

  if (fotoPreviewUrl.value) {
    URL.revokeObjectURL(fotoPreviewUrl.value)
    fotoPreviewUrl.value = null
  }

  if (file) {
    fotoPreviewUrl.value = URL.createObjectURL(file)
  }
}

async function submitForm() {
  const validators = [validateProfil(), validateAlamat(), validateJabatan()].filter(Boolean)

  if (validators.length > 0) {
    setError(validators[0] as string)
    return
  }

  try {
    state.jabatan.nip = state.nip
    await pegawaiStore.createPegawai(state)
    toast.add({
      title: 'Pegawai berhasil ditambahkan',
      description: 'Data pegawai baru sudah tersimpan ke sistem.',
      color: 'success'
    })
    await navigateTo('/pegawai')
  } catch (error: unknown) {
    formError.value = error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data pegawai.'
  }
}

onBeforeUnmount(() => {
  if (fotoPreviewUrl.value) {
    URL.revokeObjectURL(fotoPreviewUrl.value)
  }
})
</script>

<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-4 rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(17,17,24,0.84)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-sm text-[var(--color-dark-200)]">Form Bertahap Pegawai</p>
        <h1 class="mt-2 text-2xl font-semibold text-[var(--color-dark-50)]">Tambah Pegawai Baru</h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-dark-200)]">
          Lengkapi data profil, alamat, dan jabatan secara berurutan sebelum menyimpan pegawai baru.
        </p>
      </div>

      <UButton
        to="/pegawai"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        aria-label="Kembali ke daftar pegawai"
      >
        Kembali ke Daftar
      </UButton>
    </section>

    <section class="rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(17,17,24,0.92)] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl">
      <UStepper v-model="currentStep" :items="stepItems" class="gap-8">
        <template #profil>
          <PegawaiProfileStep
            :state="state"
            :foto-preview-url="fotoPreviewUrl"
            :foto-name="fotoName"
            @foto-change="handleFotoChange"
          />
        </template>

        <template #alamat>
          <PegawaiAddressStep :state="state" />
        </template>

        <template #jabatan>
          <PegawaiPositionStep :state="state" />
        </template>
      </UStepper>

      <UAlert
        v-if="formError"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        :title="formError"
        class="mt-6"
      />

      <div class="mt-6 flex flex-col gap-3 border-t border-[var(--color-dark-600)] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div class="rounded-full border border-[var(--color-dark-600)] px-4 py-2 text-sm text-[var(--color-dark-200)]">
          Tahap {{ currentStep + 1 }} dari {{ stepItems.length }}
        </div>

        <div class="flex gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-chevron-left"
            :disabled="currentStep === 0 || pegawaiStore.submitting"
            aria-label="Kembali ke tahap sebelumnya"
            @click="prevStep"
          >
            Sebelumnya
          </UButton>

          <UButton
            v-if="currentStep < stepItems.length - 1"
            icon="i-lucide-chevron-right"
            trailing
            aria-label="Lanjut ke tahap berikutnya"
            @click="nextStep"
          >
            Lanjut
          </UButton>

          <UButton
            v-else
            icon="i-lucide-save"
            :loading="pegawaiStore.submitting"
            aria-label="Simpan data pegawai baru"
            @click="submitForm"
          >
            Simpan Pegawai
          </UButton>
        </div>
      </div>
    </section>
  </div>
</template>
