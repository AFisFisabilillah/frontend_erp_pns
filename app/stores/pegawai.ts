import { defineStore } from 'pinia'
import type {
  IActionMessageResponse,
  IApiErrorResponse,
  IBulkPegawaiPayload,
  IPegawai,
  IPegawaiFormPayload,
  IPegawaiListResponse,
  IPegawaiQueryParams,
  ITrashPegawaiResponse
} from '~/types/pegawai'

function getPegawaiErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as { data?: IApiErrorResponse; message?: string }

  if (apiError?.data?.message) {
    return apiError.data.message
  }

  const daftarError = apiError?.data?.errors
    ? Object.values(apiError.data.errors).flat()
    : []

  if (daftarError.length > 0) {
    return daftarError[0] || fallback
  }

  return apiError?.message || fallback
}

function buildPegawaiFormData(payload: IPegawaiFormPayload): FormData {
  const formData = new FormData()

  if (payload.foto) {
    formData.append('foto', payload.foto)
  }

  formData.append('nama', payload.nama)
  formData.append('nip', payload.nip)
  formData.append('tempat_lahir', payload.tempat_lahir)
  formData.append('tgl_lahir', payload.tgl_lahir)
  formData.append('jenis_kelamin', payload.jenis_kelamin)
  formData.append('agama', payload.agama)
  formData.append('no_hp', payload.no_hp)
  formData.append('npwp', payload.npwp)

  formData.append('alamat[alamat]', payload.alamat.alamat)
  formData.append('alamat[kota]', payload.alamat.kota)
  formData.append('alamat[provinsi]', payload.alamat.provinsi)

  formData.append('jabatan[golongan]', payload.jabatan.golongan)
  formData.append('jabatan[eselon]', payload.jabatan.eselon)
  formData.append('jabatan[jabatan]', payload.jabatan.jabatan)
  formData.append('jabatan[tempat_tugas]', payload.jabatan.tempat_tugas)
  formData.append('jabatan[unit_kerja]', payload.jabatan.unit_kerja)

  return formData
}

export const usePegawaiStore = defineStore('pegawai', () => {
  const authStore = useAuthStore()
  const config = useRuntimeConfig()

  const daftarPegawai = ref<IPegawai[]>([])
  const daftarPegawaiTerhapus = ref<IPegawai[]>([])
  const detailPegawai = ref<IPegawai | null>(null)
  const loading = ref(false)
  const submitting = ref(false)
  const exporting = ref(false)
  const errorMessage = ref<string | null>(null)
  const pagination = ref<IPegawaiListResponse['meta'] | null>(null)
  const paginationLinks = ref<IPegawaiListResponse['links'] | null>(null)
  const filterAktif = ref<IPegawaiQueryParams>({
    page: 1,
    size: 10
  })

  const isEmpty = computed(() => !loading.value && daftarPegawai.value.length === 0)

  function getAuthHeaders(extraHeaders?: HeadersInit): HeadersInit {
    if (!authStore.token) {
      throw new Error('Token autentikasi tidak tersedia.')
    }

    return {
      Authorization: `Bearer ${authStore.token}`,
      ...extraHeaders
    }
  }

  async function fetchPegawai(params: IPegawaiQueryParams = {}) {
    loading.value = true
    errorMessage.value = null

    try {
      const query = {
        ...filterAktif.value,
        ...params
      }

      const response = await $fetch<IPegawaiListResponse>(`${config.public.apiBaseUrl}/api/pegawai`, {
        headers: getAuthHeaders(),
        query
      })

      daftarPegawai.value = response.data
      pagination.value = response.meta
      paginationLinks.value = response.links
      filterAktif.value = query

      return response
    } catch (error: unknown) {
      const message = getPegawaiErrorMessage(error, 'Gagal memuat data pegawai.')
      errorMessage.value = message
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  function setDetailPegawai(nip: string) {
    detailPegawai.value = daftarPegawai.value.find((item) => item.nip === nip) || null

    return detailPegawai.value
  }

  async function createPegawai(payload: IPegawaiFormPayload) {
    submitting.value = true
    errorMessage.value = null

    try {
      const response = await $fetch<IPegawai>(`${config.public.apiBaseUrl}/api/pegawai`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: buildPegawaiFormData(payload)
      })

      await fetchPegawai(filterAktif.value)

      return response
    } catch (error: unknown) {
      const message = getPegawaiErrorMessage(error, 'Gagal menambah data pegawai.')
      errorMessage.value = message
      throw new Error(message)
    } finally {
      submitting.value = false
    }
  }

  async function updatePegawai(nip: string, payload: IPegawaiFormPayload) {
    submitting.value = true
    errorMessage.value = null

    try {
      const response = await $fetch<IPegawai>(`${config.public.apiBaseUrl}/api/pegawai/${nip}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: buildPegawaiFormData(payload)
      })

      await fetchPegawai(filterAktif.value)
      detailPegawai.value = response

      return response
    } catch (error: unknown) {
      const message = getPegawaiErrorMessage(error, 'Gagal memperbarui data pegawai.')
      errorMessage.value = message
      throw new Error(message)
    } finally {
      submitting.value = false
    }
  }

  async function deletePegawai(payload: IBulkPegawaiPayload) {
    submitting.value = true
    errorMessage.value = null

    try {
      const response = await $fetch<IActionMessageResponse>(`${config.public.apiBaseUrl}/api/pegawai/delete`, {
        method: 'DELETE',
        headers: getAuthHeaders({
          'Content-Type': 'application/json'
        }),
        body: payload
      })

      await fetchPegawai(filterAktif.value)

      return response
    } catch (error: unknown) {
      const message = getPegawaiErrorMessage(error, 'Gagal menghapus data pegawai.')
      errorMessage.value = message
      throw new Error(message)
    } finally {
      submitting.value = false
    }
  }

  async function fetchTrashPegawai() {
    loading.value = true
    errorMessage.value = null

    try {
      const response = await $fetch<ITrashPegawaiResponse>(`${config.public.apiBaseUrl}/api/pegawai/trash`, {
        headers: getAuthHeaders()
      })

      daftarPegawaiTerhapus.value = response.data

      return response.data
    } catch (error: unknown) {
      const message = getPegawaiErrorMessage(error, 'Gagal memuat data pegawai terhapus.')
      errorMessage.value = message
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  async function restorePegawai(payload: IBulkPegawaiPayload) {
    submitting.value = true
    errorMessage.value = null

    try {
      const response = await $fetch<IActionMessageResponse>(`${config.public.apiBaseUrl}/api/pegawai/restore`, {
        method: 'PATCH',
        headers: getAuthHeaders({
          'Content-Type': 'application/json'
        }),
        body: payload
      })

      await fetchTrashPegawai()
      await fetchPegawai(filterAktif.value)

      return response
    } catch (error: unknown) {
      const message = getPegawaiErrorMessage(error, 'Gagal memulihkan data pegawai.')
      errorMessage.value = message
      throw new Error(message)
    } finally {
      submitting.value = false
    }
  }

  async function forceDeletePegawai(payload: IBulkPegawaiPayload) {
    submitting.value = true
    errorMessage.value = null

    try {
      const response = await $fetch<IActionMessageResponse>(`${config.public.apiBaseUrl}/api/pegawai/forceDelete`, {
        method: 'DELETE',
        headers: getAuthHeaders({
          'Content-Type': 'application/json'
        }),
        body: payload
      })

      await fetchTrashPegawai()

      return response
    } catch (error: unknown) {
      const message = getPegawaiErrorMessage(error, 'Gagal menghapus permanen data pegawai.')
      errorMessage.value = message
      throw new Error(message)
    } finally {
      submitting.value = false
    }
  }

  async function exportPegawaiPdf() {
    exporting.value = true
    errorMessage.value = null

    try {
      const blob = await $fetch<Blob>(`${config.public.apiBaseUrl}/api/pegawai/export/pdf`, {
        headers: getAuthHeaders({
          Accept: 'application/pdf'
        }),
        responseType: 'blob'
      })

      return blob
    } catch (error: unknown) {
      const message = getPegawaiErrorMessage(error, 'Gagal mengekspor data pegawai ke PDF.')
      errorMessage.value = message
      throw new Error(message)
    } finally {
      exporting.value = false
    }
  }

  function resetState() {
    daftarPegawai.value = []
    daftarPegawaiTerhapus.value = []
    detailPegawai.value = null
    pagination.value = null
    paginationLinks.value = null
    errorMessage.value = null
    filterAktif.value = {
      page: 1,
      size: 10
    }
  }

  return {
    daftarPegawai,
    daftarPegawaiTerhapus,
    detailPegawai,
    loading,
    submitting,
    exporting,
    errorMessage,
    pagination,
    paginationLinks,
    filterAktif,
    isEmpty,
    fetchPegawai,
    setDetailPegawai,
    createPegawai,
    updatePegawai,
    deletePegawai,
    fetchTrashPegawai,
    restorePegawai,
    forceDeletePegawai,
    exportPegawaiPdf,
    resetState
  }
})
