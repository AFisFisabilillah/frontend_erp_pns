<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui'
import type { IPegawai, IPegawaiFormPayload } from '~/types/pegawai'
import PegawaiProfileStep from '~/components/pegawai/form/PegawaiProfileStep.vue'
import PegawaiAddressStep from '~/components/pegawai/form/PegawaiAddressStep.vue'
import PegawaiPositionStep from '~/components/pegawai/form/PegawaiPositionStep.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Edit Pegawai',
  subtitle: 'Perbarui data pegawai melalui form bertahap.'
})

const route = useRoute()
const pegawaiStore = usePegawaiStore()
const toast = useToast()
const {
  createEmptyPegawaiFormState,
  buildPegawaiFotoUrl,
  applyPegawaiToFormState,
  validatePegawaiFormStep,
  validatePegawaiFormAll
} = usePegawaiForm()

const nipParam = computed(() => String(route.params.nip || ''))
const currentStep = ref(0)
const formError = ref('')
const fotoPreviewUrl = ref<string | null>(null)
const fotoName = ref('')
const isLoadingData = ref(true)
const pegawaiAktif = ref<IPegawai | null>(null)

const stepItems: StepperItem[] = [
  { slot: 'profil', title: 'Profil', description: 'Data identitas pegawai.' },
  { slot: 'alamat', title: 'Alamat', description: 'Alamat domisili pegawai.' },
  { slot: 'jabatan', title: 'Jabatan', description: 'Data penugasan dan unit kerja.' }
]

const state = reactive<IPegawaiFormPayload>(createEmptyPegawaiFormState())

function setError(message: string) {
  formError.value = message
  toast.add({
    title: 'Validasi form',
    description: message,
    color: 'warning'
  })
}

async function resolvePegawai(): Promise<IPegawai | null> {
  return await pegawaiStore.fetchPegawaiDetail(nipParam.value)
}

function validateStep(step: number): boolean {
  const error = validatePegawaiFormStep(state, step)

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
  fotoName.value = file?.name || (pegawaiAktif.value?.foto_pegawai ? 'Foto pegawai saat ini' : '')

  if (fotoPreviewUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(fotoPreviewUrl.value)
  }

  fotoPreviewUrl.value = file ? URL.createObjectURL(file) : buildPegawaiFotoUrl(pegawaiAktif.value?.foto_pegawai || null)
}

async function submitForm() {
  const error = validatePegawaiFormAll(state)

  if (error) {
    setError(error)
    return
  }

  try {
    state.jabatan.nip = state.nip
    await pegawaiStore.updatePegawai(nipParam.value, state)
    toast.add({
      title: 'Pegawai berhasil diperbarui',
      description: 'Perubahan data pegawai sudah tersimpan ke sistem.',
      color: 'success'
    })
    await navigateTo('/pegawai')
  } catch (error: unknown) {
    formError.value = error instanceof Error ? error.message : 'Terjadi kesalahan saat memperbarui data pegawai.'
  }
}

onMounted(async () => {
  isLoadingData.value = true

  try {
    const pegawai = await resolvePegawai()

    if (!pegawai) {
      throw new Error('Data pegawai tidak ditemukan untuk proses edit.')
    }

    pegawaiAktif.value = pegawai
    applyPegawaiToFormState(state, pegawai)
    fotoPreviewUrl.value = buildPegawaiFotoUrl(pegawai.foto_pegawai)
    fotoName.value = pegawai.foto_pegawai ? 'Foto pegawai saat ini' : ''
  } catch (error: unknown) {
    formError.value = error instanceof Error ? error.message : 'Gagal memuat data pegawai.'
  } finally {
    isLoadingData.value = false
  }
})

onBeforeUnmount(() => {
  if (fotoPreviewUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(fotoPreviewUrl.value)
  }
})
</script>

<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-4 rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(17,17,24,0.84)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-sm text-[var(--color-dark-200)]">Pemeliharaan Pegawai</p>
        <h1 class="mt-2 text-2xl font-semibold text-[var(--color-dark-50)]">Edit Data Pegawai</h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-dark-200)]">
          Perbarui profil, alamat, dan jabatan pegawai dengan tampilan bertahap yang konsisten dengan form tambah.
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
      <div v-if="isLoadingData" class="space-y-4">
        <USkeleton class="h-10 w-72 rounded-xl" />
        <USkeleton class="h-72 w-full rounded-2xl" />
      </div>

      <div v-else class="space-y-6">
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
        />

        <div class="flex flex-col gap-3 border-t border-[var(--color-dark-600)] pt-6 sm:flex-row sm:items-center sm:justify-between">
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
              aria-label="Simpan perubahan data pegawai"
              @click="submitForm"
            >
              Simpan Perubahan
            </UButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
