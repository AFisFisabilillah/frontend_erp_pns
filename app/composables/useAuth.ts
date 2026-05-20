import type { IApiErrorResponse, ILoginPayload, ILoginResponse, IProfileResponse } from '~/types/auth'

function getErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as { data?: IApiErrorResponse; message?: string }

  if (apiError?.data?.message) {
    return apiError.data.message
  }

  const firstFieldErrors = apiError?.data?.errors
    ? Object.values(apiError.data.errors).flat()
    : []

  if (firstFieldErrors.length > 0) {
    return firstFieldErrors[0] || fallback
  }

  return apiError?.message || fallback
}

export function useAuth() {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  function initializeAuth() {
    authStore.initializeAuth()
  }

  async function login(payload: ILoginPayload) {
    try {
      const response = await $fetch<ILoginResponse>(`${config.public.apiBaseUrl}/api/login`, {
        method: 'POST',
        body: payload
      })

      authStore.setAuth(response.token, response.user)

      return response
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Login gagal. Periksa email dan password Anda.'))
    }
  }

  async function fetchProfile() {
    if (!authStore.token) {
      throw new Error('Token autentikasi tidak tersedia.')
    }

    try {
      const response = await $fetch<IProfileResponse>(`${config.public.apiBaseUrl}/api/profile`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })

      authStore.setAuth(authStore.token, response.data)

      return response.data
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Gagal memuat profil pengguna.'))
    }
  }

  async function logout() {
    try {
      if (authStore.token) {
        await $fetch(`${config.public.apiBaseUrl}/api/logout`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
      }
    } catch {
      // Backend logout yang gagal tidak boleh menahan pembersihan sesi lokal.
    } finally {
      authStore.logout()
      await navigateTo('/login')
    }
  }

  return {
    authStore,
    initializeAuth,
    login,
    fetchProfile,
    logout
  }
}
