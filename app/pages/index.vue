<script setup lang="ts">
import type { IDashboardChartItem } from '~/types/dashboard'

interface IBarChartRow {
  label: string
  total: number
}

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Dashboard Kepegawaian',
  subtitle: 'Ringkasan operasional data PNS dan statistik administrasi.'
})

const authStore = useAuthStore()
const toast = useToast()
const {
  stats,
  loading,
  errorMessage,
  fetchDashboardStats
} = useDashboardStats()

const barChartData = computed<IBarChartRow[]>(() => {
  return (stats.value?.bar_chart_golongan || []).map((item) => ({
    label: item.label,
    total: Number(item.total)
  }))
})

const donutChartData = computed(() => {
  return (stats.value?.pie_chart_jenis_kelamin || []).map((item) => Number(item.total))
})

const totalPegawai = computed(() => stats.value?.total_pegawai ?? 0)
const totalGolongan = computed(() => stats.value?.bar_chart_golongan.length ?? 0)
const totalJenisKelamin = computed(() => stats.value?.pie_chart_jenis_kelamin.length ?? 0)

const golonganCategories = {
  total: {
    name: 'Jumlah Pegawai',
    color: '#60A5FA'
  }
}

const genderCategories = computed(() => {
  return (stats.value?.pie_chart_jenis_kelamin || []).reduce<Record<string, { name: string; color: string }>>(
    (categories, item, index) => {
      categories[item.value] = {
        name: item.label,
        color: index === 0 ? '#60A5FA' : '#10B981'
      }

      return categories
    },
    {}
  )
})

const summaryCards = computed(() => [
  {
    label: 'Total Pegawai',
    value: totalPegawai.value.toLocaleString('id-ID'),
    description: 'Pegawai aktif tercatat',
    icon: 'i-lucide-users',
    tone: 'blue'
  },
  {
    label: 'Golongan',
    value: totalGolongan.value.toLocaleString('id-ID'),
    description: 'Kategori golongan tersedia',
    icon: 'i-lucide-layers-3',
    tone: 'cyan'
  },
  {
    label: 'Jenis Kelamin',
    value: totalJenisKelamin.value.toLocaleString('id-ID'),
    description: 'Komposisi demografi',
    icon: 'i-lucide-chart-pie',
    tone: 'emerald'
  }
])

const topGolongan = computed(() => {
  return [...(stats.value?.bar_chart_golongan || [])].sort((first, second) => second.total - first.total)[0]
})

function getPersentase(item: IDashboardChartItem): string {
  if (!totalPegawai.value) {
    return '0%'
  }

  return `${Math.round((Number(item.total) / totalPegawai.value) * 100)}%`
}

async function loadDashboardStats() {
  try {
    await fetchDashboardStats()
  } catch (error: unknown) {
    toast.add({
      title: 'Gagal memuat dashboard',
      description: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil statistik dashboard.',
      color: 'error'
    })
  }
}

onMounted(loadDashboardStats)
</script>

<template>
  <div class="space-y-6">
    <section class="overflow-hidden rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(17,17,24,0.88)] shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-xl">
      <div class="relative p-6 lg:p-7">
        <div class="absolute right-8 top-6 h-28 w-52 rounded-full bg-[rgba(37,99,235,0.2)] blur-3xl" />
        <div class="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-sm text-[var(--color-dark-200)]">Selamat datang</p>
            <h1 class="mt-2 font-display text-2xl font-semibold text-[var(--color-dark-50)]">
              {{ authStore.user?.fullname || authStore.user?.name || 'Administrator' }}
            </h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-dark-200)]">
              Pantau total pegawai, distribusi golongan, dan komposisi jenis kelamin dari dashboard kepegawaian.
            </p>
          </div>

          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-refresh-cw"
            :loading="loading"
            aria-label="Muat ulang statistik dashboard"
            @click="loadDashboardStats"
          >
            Refresh
          </UButton>
        </div>
      </div>
    </section>

    <UAlert
      v-if="errorMessage"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      :title="errorMessage"
    />

    <div class="grid gap-4 md:grid-cols-3">
      <article
        v-for="card in summaryCards"
        :key="card.label"
        class="rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(17,17,24,0.9)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm text-[var(--color-dark-200)]">{{ card.label }}</p>
            <p class="mt-3 text-3xl font-semibold text-[var(--color-dark-50)]">{{ card.value }}</p>
            <p class="mt-2 text-sm text-[var(--color-dark-400)]">{{ card.description }}</p>
          </div>
          <div class="flex size-12 items-center justify-center rounded-xl border border-[rgba(96,165,250,0.24)] bg-[rgba(37,99,235,0.14)] text-[var(--color-primary-200)]">
            <UIcon :name="card.icon" class="size-5" />
          </div>
        </div>
      </article>
    </div>

    <div v-if="loading && !stats" class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <USkeleton class="h-[430px] rounded-2xl" />
      <USkeleton class="h-[430px] rounded-2xl" />
    </div>

    <div v-else class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section class="rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(17,17,24,0.9)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="text-sm font-medium text-[var(--color-dark-50)]">Distribusi Golongan</p>
            <p class="mt-1 text-sm text-[var(--color-dark-200)]">Jumlah pegawai berdasarkan golongan.</p>
          </div>
          <UBadge v-if="topGolongan" color="primary" variant="soft" class="rounded-full">
            Terbanyak {{ topGolongan.label }}
          </UBadge>
        </div>

        <ClientOnly>
          <BarChart
            v-if="barChartData.length"
            class="mt-8"
            :data="barChartData"
            :categories="golonganCategories"
            :height="320"
            :y-axis="['total']"
            x-axis="label"
            :x-formatter="(index: number) => barChartData[index]?.label || ''"
            :y-formatter="(value: number) => value.toLocaleString('id-ID')"
            :radius="8"
            :y-grid-line="true"
            :x-domain-line="false"
            :y-domain-line="false"
            :hide-legend="true"
          />
          <template #fallback>
            <USkeleton class="mt-8 h-80 rounded-2xl" />
          </template>
        </ClientOnly>

        <div v-if="!barChartData.length" class="mt-8 rounded-xl border border-[var(--color-dark-600)] p-8 text-center text-sm text-[var(--color-dark-200)]">
          Data golongan belum tersedia.
        </div>
      </section>

      <section class="rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(17,17,24,0.9)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl">
        <div>
          <p class="text-sm font-medium text-[var(--color-dark-50)]">Komposisi Jenis Kelamin</p>
          <p class="mt-1 text-sm text-[var(--color-dark-200)]">Perbandingan pegawai laki-laki dan perempuan.</p>
        </div>

        <ClientOnly>
          <DonutChart
            v-if="donutChartData.length"
            class="mt-7"
            :data="donutChartData"
            :categories="genderCategories"
            :height="280"
            :radius="8"
            :arc-width="42"
            :pad-angle="0.02"
          >
            <div class="text-center">
              <p class="text-3xl font-semibold text-[var(--color-dark-50)]">{{ totalPegawai }}</p>
              <p class="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--color-dark-400)]">Pegawai</p>
            </div>
          </DonutChart>
          <template #fallback>
            <USkeleton class="mt-7 h-72 rounded-2xl" />
          </template>
        </ClientOnly>

        <div class="mt-6 space-y-3">
          <div
            v-for="item in stats?.pie_chart_jenis_kelamin || []"
            :key="item.value"
            class="flex items-center justify-between rounded-xl border border-[var(--color-dark-600)] bg-[rgba(255,255,255,0.025)] px-4 py-3"
          >
            <div>
              <p class="text-sm font-medium text-[var(--color-dark-50)]">{{ item.label }}</p>
              <p class="mt-1 text-xs text-[var(--color-dark-400)]">{{ getPersentase(item) }} dari total pegawai</p>
            </div>
            <p class="text-lg font-semibold text-[var(--color-dark-50)]">{{ item.total }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
