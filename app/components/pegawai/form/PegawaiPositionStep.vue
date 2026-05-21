<script setup lang="ts">
import type { IPegawaiFormPayload } from '~/types/pegawai'

defineProps<{
  state: IPegawaiFormPayload
}>()
</script>

<template>
  <section class="rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(255,255,255,0.03)] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
    <div class="mb-4">
      <p class="text-sm font-semibold text-[var(--color-dark-50)]">Penugasan dan Jabatan</p>
      <p class="mt-1 text-sm text-[var(--color-dark-200)]">
        Tentukan posisi, eselon, dan unit kerja pegawai saat ini.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <UFormField label="Golongan" name="golongan">
        <UInput
          v-model="state.jabatan.golongan"
          icon="i-lucide-award"
          aria-label="Masukkan golongan pegawai"
          placeholder="Contoh: III/a"
          size="lg"
        />
      </UFormField>

      <UFormField label="Eselon" name="eselon">
        <UInput
          v-model="state.jabatan.eselon"
          icon="i-lucide-layers-2"
          aria-label="Masukkan eselon pegawai"
          placeholder="Contoh: IV"
          size="lg"
        />
      </UFormField>

      <div class="md:col-span-2">
        <UFormField label="Jabatan" name="jabatan">
          <UInput
            v-model="state.jabatan.jabatan"
            icon="i-lucide-briefcase-business"
            aria-label="Masukkan jabatan pegawai"
            placeholder="Contoh: Staff Administrasi"
            size="lg"
          />
        </UFormField>
      </div>

      <div class="md:col-span-2">
        <UFormField label="Tempat tugas" name="tempat_tugas">
          <UInput
            v-model="state.jabatan.tempat_tugas"
            icon="i-lucide-building"
            aria-label="Masukkan tempat tugas pegawai"
            placeholder="Contoh: Kantor Kecamatan Bekasi Timur"
            size="lg"
          />
        </UFormField>
      </div>

      <div class="md:col-span-2">
        <UFormField label="Unit kerja" name="unit_kerja">
          <UInput
            v-model="state.jabatan.unit_kerja"
            icon="i-lucide-network"
            aria-label="Masukkan unit kerja pegawai"
            placeholder="Contoh: Bagian Administrasi Umum"
            size="lg"
          />
        </UFormField>
      </div>
    </div>
  </section>
</template>
