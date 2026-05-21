import type { IDashboardStats, IDashboardStatsResponse } from '~/types/dashboard'

const DASHBOARD_STATS_ENDPOINT = '/api/dashboard'

export function useDashboardStats() {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()
  const stats = ref<IDashboardStats | null>(null)
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  function getAuthHeaders(): HeadersInit {
    if (!authStore.token) {
      throw new Error('Token autentikasi tidak tersedia.')
    }

    return {
      Authorization: `Bearer ${authStore.token}`
    }
  }

  async function fetchDashboardStats() {
    loading.value = true
    errorMessage.value = null

    try {
      const response = await $fetch<IDashboardStatsResponse>(`${config.public.apiBaseUrl}${DASHBOARD_STATS_ENDPOINT}`, {
        headers: getAuthHeaders()
      })

      stats.value = response.data

      return response.data
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string }; message?: string }
      const message = apiError?.data?.message || apiError?.message || 'Gagal memuat statistik dashboard.'

      errorMessage.value = message
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    errorMessage,
    fetchDashboardStats
  }
}
