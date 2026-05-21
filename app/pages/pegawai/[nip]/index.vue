<script setup lang="ts">
import type { IPegawai } from '~/types/pegawai'

interface IDetailField {
  label: string
  value: string
  icon: string
}
interface IDetailGroup {
  title: string
  description: string
  icon: string
  fields: IDetailField[]
}

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Detail Pegawai',
  subtitle: 'Informasi lengkap pegawai berdasarkan kelompok data.'
})

const route = useRoute()
const toast = useToast()
const pegawaiStore = usePegawaiStore()
const { buildPegawaiFotoUrl } = usePegawaiForm()

const nipParam = computed(() => String(route.params.nip || ''))
const pegawai = computed(() => pegawaiStore.detailPegawai)
const fotoUrl = computed(() => buildPegawaiFotoUrl(pegawai.value?.foto_pegawai || null))
const jenisKelaminLabel = computed(() => {
  if (!pegawai.value) {
    return '-'
  }

  return pegawai.value.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'
})

const usiaLabel = computed(() => {
  if (!pegawai.value?.tgl_lahir) {
    return '-'
  }

  const tanggalLahir = new Date(pegawai.value.tgl_lahir)
  const hariIni = new Date()
  let usia = hariIni.getFullYear() - tanggalLahir.getFullYear()
  const belumUlangTahun = hariIni.getMonth() < tanggalLahir.getMonth()
    || (hariIni.getMonth() === tanggalLahir.getMonth() && hariIni.getDate() < tanggalLahir.getDate())

  if (belumUlangTahun) {
    usia -= 1
  }

  return `${usia} tahun`
})

const detailGroups = computed<IDetailGroup[]>(() => {
  const data = pegawai.value

  if (!data) {
    return []
  }

  return [
    {
      title: 'Identitas Pribadi',
      description: 'Data dasar yang melekat pada profil pegawai.',
      icon: 'i-lucide-id-card',
      fields: [
        { label: 'Nama Lengkap', value: data.nama, icon: 'i-lucide-user' },
        { label: 'NIP', value: data.nip, icon: 'i-lucide-fingerprint' },
        { label: 'Tempat Lahir', value: data.tempat_lahir, icon: 'i-lucide-map-pin' },
        { label: 'Tanggal Lahir', value: formatTanggal(data.tgl_lahir), icon: 'i-lucide-calendar-days' },
        { label: 'Usia', value: usiaLabel.value, icon: 'i-lucide-hourglass' },
        { label: 'Jenis Kelamin', value: jenisKelaminLabel.value, icon: 'i-lucide-users' },
        { label: 'Agama', value: data.agama, icon: 'i-lucide-book-open' },
        { label: 'No. HP', value: data.no_hp, icon: 'i-lucide-phone' },
        { label: 'NPWP', value: data.npwp, icon: 'i-lucide-receipt-text' }
      ]
    },
    {
      title: 'Alamat',
      description: 'Alamat domisili pegawai yang tercatat pada sistem.',
      icon: 'i-lucide-map',
      fields: [
        { label: 'Alamat Lengkap', value: data.alamat?.alamat || '-', icon: 'i-lucide-home' },
        { label: 'Kota / Kabupaten', value: data.alamat?.kota || '-', icon: 'i-lucide-building-2' },
        { label: 'Provinsi', value: data.alamat?.provinsi || '-', icon: 'i-lucide-landmark' }
      ]
    },
    {
      title: 'Jabatan',
      description: 'Informasi penugasan, golongan, dan unit kerja pegawai.',
      icon: 'i-lucide-briefcase-business',
      fields: [
        { label: 'Jabatan', value: data.jabatan?.jabatan || '-', icon: 'i-lucide-badge-check' },
        { label: 'Golongan', value: data.jabatan?.golongan || '-', icon: 'i-lucide-layers-3' },
        { label: 'Eselon', value: data.jabatan?.eselon || '-', icon: 'i-lucide-network' },
        { label: 'Tempat Tugas', value: data.jabatan?.tempat_tugas || '-', icon: 'i-lucide-building' },
        { label: 'Unit Kerja', value: data.jabatan?.unit_kerja || '-', icon: 'i-lucide-sitemap' }
      ]
    },
    {
      title: 'Riwayat Data',
      description: 'Jejak waktu pencatatan dan pembaruan data pegawai.',
      icon: 'i-lucide-history',
      fields: [
        { label: 'Dibuat Pada', value: formatTanggalWaktu(data.created_at), icon: 'i-lucide-calendar-plus' },
        { label: 'Diperbarui Pada', value: formatTanggalWaktu(data.updated_at), icon: 'i-lucide-refresh-cw' }
      ]
    }
  ]
})

const ringkasanJabatan = computed(() => {
  const data = pegawai.value

  if (!data?.jabatan) {
    return 'Jabatan belum tersedia'
  }

  return `${data.jabatan.jabatan || '-'} • ${data.jabatan.unit_kerja || '-'}`
})

function formatTanggal(tanggal: string): string {
  if (!tanggal) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(tanggal))
}

function formatTanggalWaktu(tanggal: string): string {
  if (!tanggal) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(tanggal))
}

function getInisial(nama: string): string {
  return nama
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((bagian) => bagian.charAt(0).toUpperCase())
    .join('')
}

async function loadDetailPegawai() {
  try {
    await pegawaiStore.fetchPegawaiDetail(nipParam.value)
  } catch (error: unknown) {
    toast.add({
      title: 'Gagal memuat detail pegawai',
      description: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil detail pegawai.',
      color: 'error'
    })
  }
}

onMounted(loadDetailPegawai)
</script>

<template>
  <div class="space-y-6">
    <section class="flex flex-col gap-4 rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(17,17,24,0.84)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-sm text-[var(--color-dark-200)]">Profil Pegawai</p>
        <h1 class="mt-2 text-2xl font-semibold text-[var(--color-dark-50)]">Detail Pegawai</h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-dark-200)]">
          Ditampilkan berdasarkan kelompok identitas, alamat, jabatan, dan riwayat data.
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
          v-if="pegawai"
          :to="`/pegawai/${pegawai.nip}/edit`"
          icon="i-lucide-pencil"
          aria-label="Edit data pegawai"
        >
          Edit Pegawai
        </UButton>
      </div>
    </section>

    <div v-if="pegawaiStore.loading" class="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <USkeleton class="h-[520px] rounded-2xl" />
      <div class="grid gap-5 lg:grid-cols-2">
        <USkeleton v-for="item in 4" :key="item" class="h-64 rounded-2xl" />
      </div>
    </div>

    <UAlert
      v-else-if="pegawaiStore.errorMessage && !pegawai"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      :title="pegawaiStore.errorMessage"
    />

    <div v-else-if="pegawai" class="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside class="overflow-hidden rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(17,17,24,0.92)] shadow-[0_24px_70px_rgba(0,0,0,0.34)] backdrop-blur-xl">
        <div class="relative min-h-[430px] bg-[linear-gradient(160deg,rgba(30,64,175,0.42),rgba(10,10,15,0.86)_62%)] p-5">
          <div class="absolute inset-x-6 top-6 h-28 rounded-full bg-[rgba(96,165,250,0.22)] blur-3xl" />
          <div class="relative overflow-hidden rounded-2xl border border-[rgba(196,196,207,0.18)] bg-[rgba(255,255,255,0.04)]">
            <img
              v-if="fotoUrl"
              :src="fotoUrl"
              :alt="`Foto ${pegawai.nama}`"
              class="aspect-[4/5] w-full object-cover"
            >
            <div v-else class="flex aspect-[4/5] w-full items-center justify-center">
              <UAvatar
                :text="getInisial(pegawai.nama)"
                :alt="`Foto ${pegawai.nama}`"
                size="3xl"
                class="ring-1 ring-[var(--color-dark-600)]"
              />
            </div>
          </div>
        </div>

        <div class="space-y-5 p-5">
          <div>
            <UBadge color="primary" variant="soft" class="rounded-full">
              {{ pegawai.jabatan?.golongan || 'Golongan belum tersedia' }}
            </UBadge>
            <h2 class="mt-3 text-xl font-semibold leading-7 text-[var(--color-dark-50)]">{{ pegawai.nama }}</h2>
            <p class="mt-2 text-xs tracking-[0.16em] text-[var(--color-dark-400)]">{{ pegawai.nip }}</p>
            <p class="mt-3 text-sm leading-6 text-[var(--color-dark-200)]">{{ ringkasanJabatan }}</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-xl border border-[var(--color-dark-600)] bg-[rgba(255,255,255,0.03)] p-4">
              <p class="text-xs text-[var(--color-dark-400)]">Jenis Kelamin</p>
              <p class="mt-1 text-sm font-semibold text-[var(--color-dark-50)]">{{ jenisKelaminLabel }}</p>
            </div>
            <div class="rounded-xl border border-[var(--color-dark-600)] bg-[rgba(255,255,255,0.03)] p-4">
              <p class="text-xs text-[var(--color-dark-400)]">Usia</p>
              <p class="mt-1 text-sm font-semibold text-[var(--color-dark-50)]">{{ usiaLabel }}</p>
            </div>
          </div>
        </div>
      </aside>

      <section class="grid gap-5 lg:grid-cols-2">
        <article
          v-for="group in detailGroups"
          :key="group.title"
          class="rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(17,17,24,0.9)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl"
        >
          <div class="flex gap-4">
            <div class="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(96,165,250,0.24)] bg-[rgba(37,99,235,0.14)] text-[var(--color-primary-200)]">
              <UIcon :name="group.icon" class="size-5" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-[var(--color-dark-50)]">{{ group.title }}</h3>
              <p class="mt-1 text-sm leading-6 text-[var(--color-dark-200)]">{{ group.description }}</p>
            </div>
          </div>

          <dl class="mt-5 space-y-3">
            <div
              v-for="field in group.fields"
              :key="`${group.title}-${field.label}`"
              class="grid gap-3 rounded-xl border border-[var(--color-dark-600)] bg-[rgba(255,255,255,0.025)] p-4 sm:grid-cols-[180px_minmax(0,1fr)]"
            >
              <dt class="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-dark-400)]">
                <UIcon :name="field.icon" class="size-4" />
                {{ field.label }}
              </dt>
              <dd class="break-words text-sm font-medium leading-6 text-[var(--color-dark-50)]">{{ field.value || '-' }}</dd>
            </div>
          </dl>
        </article>
      </section>
    </div>
  </div>
</template>
