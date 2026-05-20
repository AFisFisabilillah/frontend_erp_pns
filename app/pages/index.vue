<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  title: 'Dashboard Kepegawaian',
  subtitle: 'Ringkasan operasional data PNS dan aktivitas administrasi hari ini.'
})

const authStore = useAuthStore()
</script>

<template>
  <div class="space-y-6">
    <div class="dashboard-glass rounded-xl p-6">
      <p class="text-sm text-[var(--color-dark-200)]">Selamat datang</p>
      <h1 class="mt-2 font-display text-2xl font-semibold text-[var(--color-dark-50)]">
        {{ authStore.user?.fullname || authStore.user?.name || 'Administrator' }}
      </h1>
      <p class="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-dark-200)]">
        Anda sudah berhasil login ke sistem informasi pengelolaan data PNS. Halaman ini siap dipakai
        untuk ringkasan statistik, tabel pegawai, dan modul administrasi berikutnya.
      </p>
    </div>
  </div>
</template>
