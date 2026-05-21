import type { IPegawai, IPegawaiFormPayload } from '~/types/pegawai'

export function usePegawaiForm() {
  const config = useRuntimeConfig()

  function createEmptyPegawaiFormState(): IPegawaiFormPayload {
    return {
      foto: null,
      nama: '',
      nip: '',
      tempat_lahir: '',
      tgl_lahir: '',
      jenis_kelamin: 'L',
      agama: '',
      no_hp: '',
      npwp: '',
      alamat: {
        alamat: '',
        kota: '',
        provinsi: ''
      },
      jabatan: {
        nip: '',
        golongan: '',
        eselon: '',
        jabatan: '',
        tempat_tugas: '',
        unit_kerja: ''
      }
    }
  }

  function buildPegawaiFotoUrl(foto: string | null): string | null {
    if (!foto) {
      return null
    }

    if (/^https?:\/\//i.test(foto)) {
      return foto
    }

    const baseUrl = String(config.public.apiBaseUrl || '').replace(/\/+$/, '')
    const fotoPath = foto.replace(/^\/+/, '')

    return `${baseUrl}/${fotoPath}`
  }

  function applyPegawaiToFormState(state: IPegawaiFormPayload, pegawai: IPegawai) {
    state.foto = null
    state.nama = pegawai.nama
    state.nip = pegawai.nip
    state.tempat_lahir = pegawai.tempat_lahir
    state.tgl_lahir = pegawai.tgl_lahir
    state.jenis_kelamin = pegawai.jenis_kelamin
    state.agama = pegawai.agama
    state.no_hp = pegawai.no_hp
    state.npwp = pegawai.npwp
    state.alamat.alamat = pegawai.alamat?.alamat || ''
    state.alamat.kota = pegawai.alamat?.kota || ''
    state.alamat.provinsi = pegawai.alamat?.provinsi || ''
    state.jabatan.nip = pegawai.nip
    state.jabatan.golongan = pegawai.jabatan?.golongan || ''
    state.jabatan.eselon = pegawai.jabatan?.eselon || ''
    state.jabatan.jabatan = pegawai.jabatan?.jabatan || ''
    state.jabatan.tempat_tugas = pegawai.jabatan?.tempat_tugas || ''
    state.jabatan.unit_kerja = pegawai.jabatan?.unit_kerja || ''
  }

  function validatePegawaiProfil(state: IPegawaiFormPayload): string | null {
    if (!state.nama) return 'Nama pegawai wajib diisi.'
    if (!state.nip) return 'NIP pegawai wajib diisi.'
    if (!state.tempat_lahir) return 'Tempat lahir wajib diisi.'
    if (!state.tgl_lahir) return 'Tanggal lahir wajib diisi.'
    if (!state.agama) return 'Agama wajib dipilih.'
    if (!state.no_hp) return 'Nomor telepon wajib diisi.'
    if (!state.npwp) return 'NPWP wajib diisi.'
    return null
  }

  function validatePegawaiAlamat(state: IPegawaiFormPayload): string | null {
    if (!state.alamat.alamat) return 'Alamat lengkap wajib diisi.'
    if (!state.alamat.kota) return 'Kota atau kabupaten wajib diisi.'
    if (!state.alamat.provinsi) return 'Provinsi wajib diisi.'
    return null
  }

  function validatePegawaiJabatan(state: IPegawaiFormPayload): string | null {
    if (!state.jabatan.golongan) return 'Golongan wajib diisi.'
    if (!state.jabatan.eselon) return 'Eselon wajib diisi.'
    if (!state.jabatan.jabatan) return 'Jabatan wajib diisi.'
    if (!state.jabatan.tempat_tugas) return 'Tempat tugas wajib diisi.'
    if (!state.jabatan.unit_kerja) return 'Unit kerja wajib diisi.'
    return null
  }

  function validatePegawaiFormStep(state: IPegawaiFormPayload, step: number): string | null {
    const validators = [validatePegawaiProfil, validatePegawaiAlamat, validatePegawaiJabatan]
    return validators[step]?.(state) || null
  }

  function validatePegawaiFormAll(state: IPegawaiFormPayload): string | null {
    return validatePegawaiProfil(state) || validatePegawaiAlamat(state) || validatePegawaiJabatan(state)
  }

  return {
    createEmptyPegawaiFormState,
    buildPegawaiFotoUrl,
    applyPegawaiToFormState,
    validatePegawaiFormStep,
    validatePegawaiFormAll
  }
}
