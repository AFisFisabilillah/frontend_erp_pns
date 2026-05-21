<script setup lang="ts">
import type { IPegawaiFormPayload } from '~/types/pegawai'

defineProps<{
  state: IPegawaiFormPayload
  fotoPreviewUrl: string | null
  fotoName: string
}>()

const emit = defineEmits<{
  'foto-change': [file: File | null]
}>()

const jenisKelaminOptions = [
  { label: 'Laki-laki', value: 'L' },
  { label: 'Perempuan', value: 'P' }
]

const agamaOptions = [
  { label: 'Islam', value: 'Islam' },
  { label: 'Kristen', value: 'Kristen' },
  { label: 'Katolik', value: 'Katolik' },
  { label: 'Hindu', value: 'Hindu' },
  { label: 'Buddha', value: 'Buddha' },
  { label: 'Konghucu', value: 'Konghucu' }
]
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
    <section class="rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(255,255,255,0.03)] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
      <p class="text-sm font-semibold text-[var(--color-dark-50)]">Foto Profil</p>
      <p class="mt-1 text-sm leading-6 text-[var(--color-dark-200)]">
        Unggah foto pegawai untuk identifikasi pada daftar data.
      </p>

      <div class="mt-5 flex flex-col items-center gap-4">
        <UAvatar
          :src="fotoPreviewUrl || undefined"
          :alt="`Foto ${state.nama || 'pegawai baru'}`"
          :text="state.nama ? state.nama.slice(0, 2).toUpperCase() : 'PG'"
          size="3xl"
          class="ring-1 ring-[var(--color-dark-600)]"
        />

        <div class="w-full">
          <UFileUpload
            :model-value="state.foto"
            label="Unggah foto pegawai"
            description="Format JPG, PNG, atau WEBP. Gunakan foto yang jelas dan proporsional."
            accept="image/*"
            icon="i-lucide-image-up"
            variant="area"
            size="lg"
            layout="list"
            :highlight="Boolean(state.foto)"
            aria-label="Unggah foto pegawai"
            class="w-full"
            @update:model-value="emit('foto-change', $event)"
          />
        </div>

        <p class="text-center text-xs text-[var(--color-dark-400)]">
          {{ fotoName || 'Belum ada file yang dipilih.' }}
        </p>
      </div>
    </section>

    <div class="space-y-6">
      <section class="rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(255,255,255,0.03)] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
        <div class="mb-4">
          <p class="text-sm font-semibold text-[var(--color-dark-50)]">Identitas Utama</p>
          <p class="mt-1 text-sm text-[var(--color-dark-200)]">
            Data dasar pegawai untuk kebutuhan administrasi dan pencarian.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <UFormField label="Nama pegawai" name="nama">
            <UInput v-model="state.nama" icon="i-lucide-user" aria-label="Masukkan nama pegawai" placeholder="Nama lengkap pegawai" size="lg" />
          </UFormField>

          <UFormField label="NIP" name="nip">
            <UInput v-model="state.nip" icon="i-lucide-id-card" aria-label="Masukkan NIP pegawai" placeholder="18 digit NIP" size="lg" />
          </UFormField>

          <UFormField label="Tempat lahir" name="tempat_lahir">
            <UInput v-model="state.tempat_lahir" icon="i-lucide-map-pinned" aria-label="Masukkan tempat lahir pegawai" placeholder="Kota kelahiran" size="lg" />
          </UFormField>

          <UFormField label="Tanggal lahir" name="tgl_lahir">
            <UInput v-model="state.tgl_lahir" type="date" icon="i-lucide-calendar-days" aria-label="Masukkan tanggal lahir pegawai" size="lg" />
          </UFormField>

          <UFormField label="Jenis kelamin" name="jenis_kelamin">
            <USelect
              v-model="state.jenis_kelamin"
              :items="jenisKelaminOptions"
              value-key="value"
              label-key="label"
              aria-label="Pilih jenis kelamin pegawai"
              size="lg"
            />
          </UFormField>

          <UFormField label="Agama" name="agama">
            <USelect
              v-model="state.agama"
              :items="agamaOptions"
              value-key="value"
              label-key="label"
              aria-label="Pilih agama pegawai"
              size="lg"
            />
          </UFormField>
        </div>
      </section>

      <section class="rounded-2xl border border-[var(--color-dark-600)] bg-[rgba(255,255,255,0.03)] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
        <div class="mb-4">
          <p class="text-sm font-semibold text-[var(--color-dark-50)]">Kontak dan Administrasi</p>
          <p class="mt-1 text-sm text-[var(--color-dark-200)]">
            Nomor telepon dan data pajak pegawai yang dipakai pada kebutuhan operasional.
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <UFormField label="Nomor telepon" name="no_hp">
            <UInput v-model="state.no_hp" icon="i-lucide-phone" aria-label="Masukkan nomor telepon pegawai" placeholder="08xxxxxxxxxx" size="lg" />
          </UFormField>

          <UFormField label="NPWP" name="npwp">
            <UInput v-model="state.npwp" icon="i-lucide-badge-percent" aria-label="Masukkan NPWP pegawai" placeholder="Nomor NPWP" size="lg" />
          </UFormField>
        </div>
      </section>
    </div>
  </div>
</template>
