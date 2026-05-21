export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  authStore.initializeAuth()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
