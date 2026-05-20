<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import type { ILoginPayload } from '~/types/auth'

definePageMeta({
  layout: false,
  middleware: 'guest'
})

const { login } = useAuth()

const state = reactive<ILoginPayload>({
  email: 'admin@gmail.com',
  password: '123456'
})

const isSubmitting = ref(false)
const errorMessage = ref('')

function validate(formState: ILoginPayload): FormError[] {
  const errors: FormError[] = []

  if (!formState.email) {
    errors.push({ name: 'email', message: 'Email wajib diisi.' })
  }

  if (!formState.password) {
    errors.push({ name: 'password', message: 'Password wajib diisi.' })
  }

  return errors
}

async function onSubmit(event: FormSubmitEvent<ILoginPayload>) {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await login(event.data)
    await navigateTo('/')
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error
        ? error.message
        : 'Terjadi kesalahan saat login.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-dark-950 text-dark-50">
    <div class="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <section
          class="w-full max-w-md rounded-2xl border border-dark-700 bg-dark-900 p-6 shadow-2xl shadow-black/30 sm:p-8"
      >
        <!-- Header -->
        <div class="mb-8 text-center">
          <h1 class="font-display text-2xl font-semibold tracking-tight text-dark-50">
            Selamat Datang
          </h1>

          <p class="mt-2 text-sm leading-6 text-dark-300">
            Masuk untuk mengakses dashboard pengelolaan data PNS.
          </p>
        </div>

        <!-- Error Alert -->
        <UAlert
            v-if="errorMessage"
            color="error"
            variant="soft"
            icon="i-lucide-circle-alert"
            :title="errorMessage"
            class="mb-5"
        />

        <!-- Form -->
        <UForm
            :state="state"
            :validate="validate"
            class="space-y-5"
            @submit="onSubmit"
        >
          <UFormField label="Email" name="email">
            <UInput
                v-model="state.email"
                type="email"
                icon="i-lucide-mail"
                placeholder="admin@gmail.com"
                aria-label="Masukkan email akun"
                size="xl"
                class="w-full"
            />
          </UFormField>

          <UFormField label="Password" name="password">
            <UInput
                v-model="state.password"
                type="password"
                icon="i-lucide-lock-keyhole"
                placeholder="Masukkan password"
                aria-label="Masukkan password akun"
                size="xl"
                class="w-full"
            />
          </UFormField>

          <div class="flex items-center justify-between text-sm">
            <span class="text-dark-400">
              Sistem Administrasi PNS
            </span>

            <NuxtLink
                to="#"
                class="font-medium text-primary-400 transition hover:text-primary-300"
            >
              Lupa password?
            </NuxtLink>
          </div>

          <UButton
              type="submit"
              block
              size="xl"
              icon="i-lucide-log-in"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              aria-label="Masuk ke dashboard"
              class="mt-2 justify-center rounded-xl font-medium"
          >
            Masuk Dashboard
          </UButton>
        </UForm>

        <!-- Footer -->
        <p class="mt-8 text-center text-xs text-dark-500">
          © 2026 Sistem Pengelolaan Data PNS
        </p>
      </section>
    </div>
  </div>
</template>