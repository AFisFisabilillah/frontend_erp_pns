import type { IUser } from '~/types/auth'
import {defineStore} from "pinia";

const AUTH_TOKEN_KEY = 'auth_token'
const AUTH_USER_KEY = 'auth_user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<IUser | null>(null)
  const initialized = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value))

  function setAuth(newToken: string, newUser: IUser) {
    token.value = newToken
    user.value = newUser

    if (import.meta.client) {
      localStorage.setItem(AUTH_TOKEN_KEY, newToken)
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser))
    }
  }

  function initializeAuth() {
    if (!import.meta.client || initialized.value) {
      return
    }

    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY)
    const storedUser = localStorage.getItem(AUTH_USER_KEY)

    token.value = storedToken

    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser) as IUser
      } catch {
        user.value = null
        localStorage.removeItem(AUTH_USER_KEY)
      }
    }

    initialized.value = true
  }

  function logout() {
    token.value = null
    user.value = null

    if (import.meta.client) {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(AUTH_USER_KEY)
    }
  }

  return {
    token,
    user,
    initialized,
    isAuthenticated,
    setAuth,
    initializeAuth,
    logout
  }
})
