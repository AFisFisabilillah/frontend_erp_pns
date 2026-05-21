export interface IJabatanPegawai {
  id?: number
  nip: string
  golongan: string
  eselon: string
  jabatan: string
  tempat_tugas: string
  unit_kerja: string
  created_at?: string
  updated_at?: string
}

export interface IAlamatPegawai {
  alamat: string
  kota: string
  provinsi: string
}

export interface IPegawai {
  nip: string
  nama: string
  tempat_lahir: string
  tgl_lahir: string
  jenis_kelamin: 'L' | 'P'
  agama: string
  no_hp: string
  npwp: string
  foto_pegawai: string | null
  created_at: string
  updated_at: string
  jabatan?: IJabatanPegawai | null
  alamat?: IAlamatPegawai | null
}

export interface IPegawaiQueryParams {
  search?: string
  unit_kerja?: string
  size?: number
  page?: number
}

export interface IUnitKerjaOption {
  label: string
  value: string
}

export interface IApiPaginationLink {
  url: string | null
  label: string
  page: number | null
  active: boolean
}

export interface IApiPaginationMeta {
  current_page: number
  from: number | null
  last_page: number
  links: IApiPaginationLink[]
  path: string
  per_page: number
  to: number | null
  total: number
}

export interface IApiPaginationLinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}

export interface IPegawaiListResponse {
  data: IPegawai[]
  links: IApiPaginationLinks
  meta: IApiPaginationMeta
}

export interface IPegawaiDetailResponse {
  data?: IPegawai
  pegawai?: IPegawai
}

export interface ITrashPegawaiResponse {
  data: IPegawai[]
}

export interface IActionMessageResponse {
  message: string
}

export interface IBulkPegawaiPayload {
  id_pegawai: string[]
}

export interface IPegawaiFormPayload {
  foto?: File | null
  nama: string
  nip: string
  tempat_lahir: string
  tgl_lahir: string
  jenis_kelamin: 'L' | 'P'
  agama: string
  no_hp: string
  npwp: string
  alamat: IAlamatPegawai
  jabatan: Omit<IJabatanPegawai, 'id' | 'created_at' | 'updated_at'>
}

export interface IApiErrorResponse {
  message?: string
  errors?: Record<string, string[]>
}
