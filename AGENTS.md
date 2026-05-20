# AGENTS.MD — Frontend Aplikasi Pengelolaan Data PNS

> Dokumen ini adalah panduan kerja untuk AI Agent (dan developer) yang bekerja pada proyek **Sistem Informasi Pengelolaan Data PNS** berbasis **Nuxt.js**. Baca seluruh dokumen ini sebelum menulis satu baris kode pun.

---

## 1. Ringkasan Proyek

| Atribut | Detail |
|---|---|
| **Nama Proyek** | Sistem Informasi Pengelolaan Data PNS |
| **Framework Frontend** | Nuxt.js 3 (Composition API) |
| **Backend** | Laravel (REST API — sudah tersedia) |
| **Autentikasi** | Laravel Sanctum / JWT via API |
| **Desain** | Dashboard Modern — Warna utama: **Biru (#1E40AF)** & **Hitam (#0A0A0F)** |
| **Target** | Admin Pemerintahan / Operator Kepegawaian |
---

## 2. Stack & Dependensi Wajib

```bash
# Core
nuxt@^3.x
vue@^3.x
@pinia/nuxt            # State management
@nuxtjs/tailwindcss    # Utility-first CSS
@vueuse/nuxt           # Vue composables

# UI & Komponen
@nuxt/icon             # Icon set
@nuxt/ui
#chart
vue-chartjs            # Visualisasi statistik kepegawaian

```

---

## 3. Desain System & Tema

### 3.1 Palet Warna (CSS Variables)

Definisikan di `assets/css/main.css` :

```css
:root {
  /* === PRIMARY BRAND === */
  --color-primary-50:  #EFF6FF;
  --color-primary-100: #DBEAFE;
  --color-primary-200: #BFDBFE;
  --color-primary-400: #60A5FA;
  --color-primary-500: #3B82F6;
  --color-primary-600: #2563EB;
  --color-primary-700: #1D4ED8;
  --color-primary-800: #1E40AF;   /* UTAMA — Biru */
  --color-primary-900: #1E3A8A;

  /* === DARK / HITAM === */
  --color-dark-950:    #0A0A0F;   /* Background utama gelap */
  --color-dark-900:    #111118;
  --color-dark-800:    #1A1A24;   /* Sidebar */
  --color-dark-700:    #22222E;   /* Card background */
  --color-dark-600:    #2C2C3A;   /* Border / divider */
  --color-dark-400:    #6B6B80;   /* Text muted */
  --color-dark-200:    #C4C4CF;   /* Text secondary */
  --color-dark-50:     #F0F0F5;   /* Text primary */

  /* === ACCENT / STATUS === */
  --color-success:     #10B981;
  --color-warning:     #F59E0B;
  --color-danger:      #EF4444;
  --color-info:        #06B6D4;
}
```

### 3.2 Tipografi

```css
/* Gunakan Google Fonts atau self-host */
/* Display/Heading: "Plus Jakarta Sans" — modern, tegas */
/* Body: "DM Sans" — bersih, mudah dibaca */

font-family-display: 'Plus Jakarta Sans', sans-serif;
font-family-body:    'DM Sans', sans-serif;
```

### 3.3 Prinsip Desain

- **Dark-first**: Seluruh antarmuka menggunakan dark theme sebagai default
- **Glass morphism** pada card dan modal: `backdrop-filter: blur(12px)` dengan `bg-opacity`
- **Blue glow effect** pada elemen aktif/fokus: `box-shadow: 0 0 20px rgba(37, 99, 235, 0.4)`
- **Border subtle**: Selalu gunakan border tipis `1px solid var(--color-dark-600)` pada card
- **Rounded konsisten**: `rounded-xl` untuk card, `rounded-lg` untuk input/button, `rounded-full` untuk badge
- **Transisi halus**: `transition-all duration-200 ease-in-out` pada semua elemen interaktif

---

### 4.1 Aturan Folder

| Aturan | Detail |
|---|---|
| **components/ui/** | Hanya komponen **tanpa logika bisnis**. Props-driven, tidak boleh memanggil API langsung. |
| **components/[fitur]/** | Komponen yang spesifik untuk satu fitur. Boleh menggunakan composables. |
| **composables/** | Semua logika reusable ada di sini. Satu file per domain (usePNS, useAuth, dll). |
| **stores/** | Hanya state yang perlu dibagi antar komponen/halaman. Jangan overuse. |
| **pages/** | Hanya routing logic & perakitan komponen. Tidak boleh ada logika bisnis langsung di pages. |
| **types/** | Semua interface/type wajib didefinisikan di sini. Tidak ada `any` type. |
| **utils/** | Fungsi murni (pure functions), tidak ada side effect, tidak import Vue/Nuxt. |

---

## 5. Konvensi Penamaan

```
# File Komponen Vue
PascalCase.vue              → AppButton.vue, PNSTable.vue

# File Composable
camelCase dengan prefix use  → useAuth.ts, usePNS.ts

# File Store Pinia
camelCase                   → auth.ts, pns.ts (nama store di dalam: 'auth', 'pns')

# File Halaman (Pages)
kebab-case                  → daftar-pns.vue (atau gunakan folder struktur)

# Variabel & Fungsi
camelCase                   → const dataPNS, function fetchPegawai()

# Konstanta
SCREAMING_SNAKE_CASE        → STATUS_PNS_AKTIF, GOLONGAN_III_A

# TypeScript Interface
PascalCase dengan prefix I  → IPNSDetail, IApiResponse, ILoginPayload
```

---

---

## 6. Autentikasi & Otorisasi

- Gunakan **Laravel Sanctum** (token-based) atau **JWT**
- Token disimpan di **`localStorage`** (atau `cookie` jika SSR diaktifkan)
- Middleware `auth.ts` dijalankan di semua halaman selain `/login`
- Middleware `role.ts` mengecek `user.role` dari store sebelum akses halaman sensitif
- **Roles yang tersedia**: `super_admin`, `admin_kepegawaian`, `operator`, `viewer`

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
```

---

## 7. State Management (Pinia)

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<IUser | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  function setAuth(newToken: string, newUser: IUser) {
    token.value = newToken
    user.value = newUser
    if (import.meta.client) {
      localStorage.setItem('auth_token', newToken)
    }
  }

  function logout() {
    token.value = null
    user.value = null
    if (import.meta.client) {
      localStorage.removeItem('auth_token')
    }
  }

  return { token, user, isAuthenticated, setAuth, logout }
}, {
  persist: true  // menggunakan @pinia-plugin-persistedstate
})
```


## 8. Aturan Penulisan Kode

1. **Selalu gunakan TypeScript** — tidak ada file `.js`, semua `.ts` atau `.vue` dengan `<script setup lang="ts">`
2. **Composition API only** — tidak menggunakan Options API
3. **Tidak ada logika di template** — pindahkan ke computed/method
4. **Tidak ada `any` type** — definisikan interface yang tepat di `types/`
5. **Error handling wajib** — setiap `await` dibungkus `try/catch`
6. **Konsistensi penamaan** — ikuti konvensi di Bagian 5
7. **Komentar dalam Bahasa Indonesia** — untuk konteks bisnis kepegawaian
8. **Komponen tidak boleh > 300 baris** — pecah menjadi sub-komponen jika lebih
9. **Gunakan `defineProps` dengan TypeScript** — tidak menggunakan syntax object biasa
10. **Aksesibilitas** — semua elemen interaktif wajib memiliki `aria-label`

---

## 9. Variabel Lingkungan (`.env`)

```env
# .env
NUXT_PUBLIC_API_BASE_URL=http://localhost:8000
NUXT_PUBLIC_APP_NAME="SIMPEG - Sistem Informasi Kepegawaian"
NUXT_PUBLIC_APP_VERSION=1.0.0
```

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL,
      appName: process.env.NUXT_PUBLIC_APP_NAME,
    }
  }
})
```

---

## 12. Checklist Sebelum Push Kode

- [ ] Tidak ada `console.log` yang tertinggal
- [ ] Tidak ada `any` type yang tidak diperlukan
- [ ] Semua form sudah memiliki validasi
- [ ] Semua endpoint API sudah memiliki error handling
- [ ] Komponen baru sudah mengikuti struktur folder yang benar
- [ ] Tidak ada logika bisnis langsung di `pages/`
- [ ] Loading & empty state sudah ditangani
- [ ] Tampilan responsif untuk layar 1280px ke atas (dashboard admin)

---

## 13. Endpoint API Laravel (Referensi)

> Sesuaikan dengan endpoint yang sudah dibuat di backend Laravel.

```
# Auth
POST   /api/login
Request : {
    "email":"admin@gmail.com",
    "password": "123456"
}

Response: {
    "message": "login berhasil",
    "token": "3|G4g7Igj5YRw7aUxpabVr5fvgjjKekyfjg04F37PA20458bd7",
    "user": {
        "id": 1,
        "name": "admin",
        "email": "admin@gmail.com",
        "fullname": null,
        "profile": null
    }
}

DELETE   /api/logout
Response : {
    "message": "logout berhasil"
}

GET    /api/profile
Response : {
    "data": {
        "id": 1,
        "name": "admin",
        "fullname": null,
        "email": "admin@gmail.com",
        "profile": null,
        "created_at": "2026-05-19T08:58:09.000000Z",
        "updated_at": "2026-05-19T08:58:09.000000Z",
        "deleted_at": null
    }
}

# PNS
GET    /api/pegawai                  → Daftar PNS (support: ?search=, ?unit_kerja=, ?size=)
Response : 
{
    "data": [
        {
            "nip": "294801012022211001",
            "nama": "reyhan kemal",
            "tempat_lahir": "Bekasi",
            "tgl_lahir": "1998-01-01",
            "jenis_kelamin": "L",
            "agama": "Islam",
            "no_hp": "081234567890",
            "npwp": "223456733012340",
            "created_at": "2026-05-19T15:19:12.000000Z",
            "updated_at": "2026-05-19T16:25:05.000000Z",
            "foto_pegawai": "public/foto_profile/85q6C4KCdS4ZGdpC8FofnVu4VOZLFZASurVPAdtP.jpg",
            "jabatan": {
                "id": 4,
                "nip": "294801012022211001",
                "golongan": "III/a",
                "eselon": "IV",
                "jabatan": "Staff Administrasi",
                "tempat_tugas": "Kantor Kecamatan Bekasi Timur",
                "unit_kerja": "Bagian Administrasi Umum",
                "created_at": "2026-05-19T15:19:12.000000Z",
                "updated_at": "2026-05-19T15:19:12.000000Z"
            }
        }
    ],
    "links": {
        "first": "http://localhost:8000/api/pegawai?page=1",
        "last": "http://localhost:8000/api/pegawai?page=1",
        "prev": null,
        "next": null
    },
    "meta": {
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "links": [
            {
                "url": null,
                "label": "&laquo; Previous",
                "page": null,
                "active": false
            },
            {
                "url": "http://localhost:8000/api/pegawai?page=1",
                "label": "1",
                "page": 1,
                "active": true
            },
            {
                "url": null,
                "label": "Next &raquo;",
                "page": null,
                "active": false
            }
        ],
        "path": "http://localhost:8000/api/pegawai",
        "per_page": 1,
        "to": 1,
        "total": 1
    }
}

POST   /api/pegawai                  → Tambah PNS baru
Header : Mediatype : multipart/form
request :
foto:images, max 2048 Mb
nama: Budi Santoso
nip:294801012022211001
tempat_lahir: Bekasi
tgl_lahir: 1998-01-01
jenis_kelamin: L
agama: Islam
no_hp: 081234567890
npwp:223456733012340
alamat[alamat]: Jl. Melati No. 10
alamat[kota]: Bekasi
alamat[provinsi]: Jawa Barat
jabatan[golongan]: III/a
jabatan[eselon]: IV
jabatan[jabatan]: Staff Administrasi
jabatan[tempat_tugas]: Kantor Kecamatan Bekasi Timur
jabatan[unit_kerja]: Bagian Administrasi Umum

POST /api/pegawai/{nip} -> Edit pegawai
Header : Mediatype : multipart/form
request :
foto:images, max 2048 Mb
nama: Budi Santoso
nip:294801012022211001
tempat_lahir: Bekasi
tgl_lahir: 1998-01-01
jenis_kelamin: L
agama: Islam
no_hp: 081234567890
npwp:223456733012340
alamat[alamat]: Jl. Melati No. 10
alamat[kota]: Bekasi
alamat[provinsi]: Jawa Barat
jabatan[golongan]: III/a
jabatan[eselon]: IV
jabatan[jabatan]: Staff Administrasi
jabatan[tempat_tugas]: Kantor Kecamatan Bekasi Timur
jabatan[unit_kerja]: Bagian Administrasi Umum

DELETE /api/pegawai/delete
Request : {
"id_pegawai" : [nip1,nip2]
}

GET /api/pegawai/trash 
response : {
    "data": [
        {
            "nip": "294801012022211001",
            "nama": "reyhan kemal",
            "tempat_lahir": "Bekasi",
            "tgl_lahir": "1998-01-01",
            "jenis_kelamin": "L",
            "agama": "Islam",
            "no_hp": "081234567890",
            "npwp": "223456733012340",
            "created_at": "2026-05-19T15:19:12.000000Z",
            "updated_at": "2026-05-20T08:03:23.000000Z",
            "foto_pegawai": "public/foto_profile/85q6C4KCdS4ZGdpC8FofnVu4VOZLFZASurVPAdtP.jpg"
        }
    ]
}

PATCH /api/pegawai/restore 
Request : {
"id_pegawai" : [nip1,nip2]
}


DELETE /api/pegawai/forceDelete
Request : 
{
    "id_pegawai" : ["199801012020011001", "199801012022211001"]
}

GET /api/pegawai/export/pdf
Header: Accept :application/pdf

