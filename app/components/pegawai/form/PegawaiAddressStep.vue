<script setup lang="ts">
import type { IPegawaiFormPayload } from '~/types/pegawai'

defineProps<{
  state: IPegawaiFormPayload
}>()
</script>

<template>
  <section class="rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(255,255,255,0.03)] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
    <div class="mb-4">
      <p class="text-sm font-semibold text-[var(--color-dark-50)]">Alamat Domisili</p>
      <p class="mt-1 text-sm text-[var(--color-dark-200)]">
        Masukkan alamat aktif pegawai untuk keperluan administrasi kepegawaian.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="md:col-span-2">
        <UFormField label="Alamat lengkap" name="alamat">
          <UTextarea
            v-model="state.alamat.alamat"
            :rows="5"
            aria-label="Masukkan alamat lengkap pegawai"
            placeholder="Jalan, nomor rumah, kelurahan, kecamatan"
            class="w-full"
          />
        </UFormField>
      </div>

      <UFormField label="Kota / Kabupaten" name="kota">
        <UInput
          v-model="state.alamat.kota"
          icon="i-lucide-building-2"
          aria-label="Masukkan kota atau kabupaten pegawai"
          placeholder="Contoh: Bekasi"
          size="lg"
        />
      </UFormField>

      <UFormField label="Provinsi" name="provinsi">
        <UInput
          v-model="state.alamat.provinsi"
          icon="i-lucide-map"
          aria-label="Masukkan provinsi pegawai"
          placeholder="Contoh: Jawa Barat"
          size="lg"
        />
      </UFormField>
    </div>
  </section>
</template>
