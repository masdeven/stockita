# PRD — Stockita

**Product Requirements Document · Siap Implementasi**

| Metadata | Nilai |
|---|---|
| Produk | Stockita |
| Versi dokumen | 1.2 |
| Tanggal | 13 Oktober 2026 |
| Status | Ready for implementation — dengan dependensi `DESIGN.md` |
| Platform | Web app, client-side only |
| Bahasa UI | Bahasa Indonesia |
| Format angka | Locale Indonesia (`id-ID`), mata uang default IDR |
| Design reference | `DESIGN.md` — gaya “Terminal Terang”: Compact, Soft, Tiny |
| Tagline | *Kelola stok, tanpa ribet.* |

> **Aturan utama desain:** seluruh UI WAJIB mengikuti token, komponen, skala tipografi, radius, shadow, dan pola interaksi dari `DESIGN.md`. Jangan menambahkan nilai warna, radius, ukuran font, shadow, atau komponen visual baru di luar sistem tersebut. Jika suatu token yang dirujuk PRD ini belum tersedia di `DESIGN.md`, jangan menebak nilainya: tandai sebagai dependency yang harus diputuskan sebelum implementasi komponen terkait.

---

## 1. Ringkasan Produk

### 1.1 Problem statement

Toko kecil dan pengelola inventori membutuhkan cara sederhana untuk mengetahui barang apa yang tersedia, barang apa yang perlu diisi ulang, dan bagaimana stok berubah. Spreadsheet sering membutuhkan input manual, rawan tidak konsisten, dan kurang nyaman digunakan melalui ponsel.

### 1.2 Solusi

**Stockita** adalah aplikasi inventori ringan yang berjalan di browser tanpa backend. Pengguna dapat mengelola produk, kategori, supplier, transaksi stok, melihat ringkasan inventori, serta memindahkan data lewat file backup.

Data operasional disimpan di **IndexedDB** melalui Dexie.js. Preferensi antarmuka yang ringan disimpan di **LocalStorage**. Setelah aplikasi dan aset PWA berhasil dimuat, fitur inti harus dapat digunakan tanpa koneksi internet.

### 1.3 Nilai utama

- **Cepat:** pencatatan produk dan transaksi memakai form ringkas.
- **Lokal:** data operasional tidak dikirim ke server aplikasi.
- **Offline-first:** halaman aplikasi dan data yang sudah tersimpan dapat digunakan tanpa internet.
- **Transparan:** stok, perubahan, status stok, dan nilai inventori dapat ditelusuri.
- **Ringan:** UI kompak, navigasi jelas, aset berat dimuat hanya ketika diperlukan.

### 1.4 Prinsip produk

1. Satu pengguna mengelola satu ruang inventori lokal pada satu profil browser.
2. Transaksi adalah catatan perubahan stok; perubahan stok tidak dilakukan secara diam-diam.
3. Semua nilai stok harus konsisten dengan transaksi dan penyesuaian yang tercatat.
4. Penghapusan data bersifat eksplisit dan memiliki konfirmasi yang sesuai tingkat risikonya.
5. Backup dan pemulihan data merupakan bagian inti dari produk, bukan fitur tambahan.
6. Desain memprioritaskan keterbacaan data dan kepadatan informasi, bukan dekorasi.

---

## 2. Target Pengguna dan Kebutuhan

| Persona | Kebutuhan utama | Indikator keberhasilan |
|---|---|---|
| Pemilik toko/UMKM | Mengetahui stok tersedia, stok rendah, dan nilai persediaan | Dapat memeriksa stok dan mencatat barang masuk/keluar tanpa spreadsheet terpisah |
| Pengelola gudang kecil | Mencatat penerimaan, pengeluaran, dan opname | Setiap perubahan memiliki tanggal, kuantitas, produk, dan alasan bila relevan |
| Pengelola inventori pribadi | Membuat daftar barang berdasarkan kategori dan lokasi | Dapat mencari produk dengan cepat dan melakukan backup mandiri |
| Developer/prototyper | Mendapatkan fondasi inventori tanpa backend | Dapat menjalankan aplikasi lokal dan melakukan uji alur end-to-end |

### 2.1 Jobs to be done

- Saat menerima barang, pengguna ingin menambahkan jumlah stok tanpa menghitung ulang stok secara manual.
- Saat barang terjual, rusak, hilang, atau dipindahkan, pengguna ingin mengurangi stok dan menyimpan alasannya.
- Saat melakukan stok opname, pengguna ingin memasukkan jumlah fisik dan melihat selisih dari stok sistem.
- Saat mencari barang, pengguna ingin menemukan produk berdasarkan nama atau SKU dari navigasi mana pun.
- Saat berpindah perangkat atau mengantisipasi data browser hilang, pengguna ingin mengunduh backup dan mengimpornya kembali.

---

## 3. Tujuan, Bukan Tujuan, dan Batasan

### 3.1 In scope

- Dashboard ringkasan inventori.
- CRUD Produk, Kategori, dan Supplier.
- Pencatatan Stok Masuk, Stok Keluar, dan Penyesuaian/Opname.
- Riwayat transaksi dengan filter, pencarian, detail, pagination, dan export.
- Global search / command palette dengan shortcut `Ctrl+K` atau `Cmd+K`.
- Pengaturan profil toko, preferensi tampilan, dan pengelolaan data.
- Export backup JSON yang dapat dipulihkan, serta export CSV/Excel untuk analisis.
- Penyimpanan lokal IndexedDB dan preferensi LocalStorage.
- Sinkronisasi perubahan antar-tab dalam browser yang sama melalui BroadcastChannel jika didukung.
- PWA installable dan mode offline untuk fitur inti.
- Layout desktop dan mobile responsif.

### 3.2 Out of scope

- Autentikasi server, role/permission, dan multi-user.
- Sinkronisasi cloud atau backup otomatis ke layanan eksternal.
- Multi-warehouse dengan saldo terpisah. Field `location` hanya metadata lokasi barang.
- Akuntansi formal, perpajakan, laporan keuangan, purchase order, penjualan POS, atau invoice.
- Integrasi payment gateway, barcode scanner khusus, dan hardware khusus.
- Riwayat audit yang aman terhadap manipulasi oleh pengguna browser.
- Jaminan penyimpanan permanen setelah pengguna menghapus data situs/browser atau membersihkan storage.

### 3.3 Batasan client-side only

- Data berada di storage browser pada origin aplikasi, bukan di akun online.
- Browser atau pengguna dapat menghapus data situs. Aplikasi wajib memberikan pengingat backup yang wajar, tetapi tidak menjamin data dapat dipulihkan tanpa file backup.
- Pengguna tidak dapat berbagi data otomatis lintas browser/perangkat.
- Tanpa backend, `createdBy`/user identity tidak tersedia. Riwayat tidak boleh menyebut “User” seolah ada sistem akun.
- Kapasitas riil IndexedDB bergantung pada browser dan perangkat; target kapasitas PRD adalah sasaran uji, bukan jaminan universal.

---

## 4. Definisi Produk dan Aturan Bisnis

Bagian ini merupakan sumber kebenaran untuk perilaku aplikasi. Jika wireframe atau implementasi berbeda, aturan di bagian ini yang diikuti.

### 4.1 Definisi status stok

Status dihitung dari stok tersedia dan nilai `minStock` produk:

| Status | Aturan | Makna UI |
|---|---|---|
| Habis | `stock <= 0` | Stok tidak tersedia |
| Rendah | `stock > 0 && stock <= minStock` | Perlu perhatian/pengisian ulang |
| Normal | `stock > minStock` | Di atas batas minimum |

`minStock` bernilai 0 atau lebih. Produk baru dengan `minStock = 0` dan stok 0 tetap berstatus **Habis**.

### 4.2 Aturan kuantitas

- `stock`, `minStock`, dan `qty` tidak boleh negatif.
- Kuantitas mendukung bilangan desimal agar satuan seperti kg/liter dapat digunakan. Jumlah angka desimal harus konsisten pada tampilan sesuai satuan; versi awal boleh menggunakan presisi hingga 3 angka desimal.
- Stok keluar tidak boleh melebihi stok yang tersedia.
- Penyesuaian menggunakan `physicalStock` (stok fisik), bukan selisih yang diketik secara langsung.
- Selisih dihitung: `difference = physicalStock - currentStock`.
- Penyesuaian hanya boleh disimpan ketika stok fisik valid dan hasil perhitungan tidak menghasilkan stok negatif.
- Operasi stok harus atomik sejauh didukung transaksi IndexedDB: catatan transaksi dan saldo produk tidak boleh hanya tersimpan salah satunya.

### 4.3 Aturan transaksi dan saldo stok

- **Stok Masuk (`in`)**: `stockAfter = stockBefore + qty`; `qty` harus lebih besar dari 0.
- **Stok Keluar (`out`)**: `stockAfter = stockBefore - qty`; `qty` harus lebih besar dari 0 dan tidak boleh melebihi `stockBefore`.
- **Penyesuaian (`adjust`)**: `qty` disimpan sebagai selisih bertanda (`physicalStock - stockBefore`), sedangkan `stockAfter = physicalStock`. Transaksi penyesuaian dengan selisih 0 tidak perlu disimpan; tampilkan pesan bahwa stok tidak berubah.
- Transaksi masuk dan keluar menyimpan kuantitas positif di kolom `qty`; tanda `+` atau `−` ditentukan berdasarkan tipe saat ditampilkan. Transaksi `adjust` menyimpan `qty` bertanda.
- Setiap transaksi mencatat `stockBefore` dan `stockAfter` agar histori dapat dibaca tanpa merekonstruksi seluruh transaksi.
- Setiap transaksi menyimpan snapshot nama produk dan SKU. Jika produk dihapus, histori tetap dapat dibaca.
- Edit atau hapus transaksi lama **tidak termasuk MVP**. Koreksi stok dilakukan dengan transaksi baru/penyesuaian baru agar jejak perubahan tetap dapat ditelusuri.
- Saat produk dibuat dengan `Stok Awal > 0`, aplikasi membuat catatan transaksi pembukaan stok (`in`, dengan penanda `opening-stock`) dalam operasi penyimpanan yang sama. Jika stok awal 0, transaksi pembukaan tidak perlu dibuat.
- Edit metadata produk tidak boleh mengubah transaksi historis.

### 4.4 Perhitungan nilai inventori

- **Nilai stok** di dashboard = jumlah `stock × costPrice` untuk semua produk dengan stok positif.
- `costPrice` dan `sellPrice` harus bernilai 0 atau lebih.
- Nilai stok adalah estimasi berbasis harga beli yang disimpan pada data produk saat ini, bukan valuasi historis dan bukan laporan akuntansi.
- Total nilai transaksi = `abs(qty) × price` jika harga transaksi tersedia. Jika harga tidak diisi, nilai transaksi ditampilkan `—` dan tidak dianggap sebagai nilai Rp0.
- Harga transaksi stok masuk/keluar adalah snapshot harga transaksi. Mengubah harga beli produk tidak mengubah transaksi terdahulu.

### 4.5 SKU dan integritas relasi

- SKU wajib, unik, dan dinormalisasi dengan `trim()`. Perbandingan keunikan tidak peka huruf besar/kecil.
- Nama produk wajib dan setelah `trim()` tidak boleh kosong.
- Kategori atau supplier yang dihapus tidak boleh meninggalkan foreign key rusak. Jika masih digunakan produk, tampilkan dialog yang menyebut jumlah produk terkait dan sediakan pilihan **Batal** atau **Hapus relasi**. `Hapus relasi` akan mengosongkan `categoryId`/`supplierId` produk terkait sebelum menghapus master data.
- Bila produk dihapus, transaksi tetap tersimpan dengan `productId` historis dan snapshot nama/SKU. UI menampilkan data snapshot dan label “Produk dihapus”.
- ID seluruh entitas dibuat secara lokal, misalnya `crypto.randomUUID()` dengan fallback yang aman untuk browser yang tidak mendukungnya.

### 4.6 Zona waktu dan tanggal

- Tanggal transaksi disimpan sebagai timestamp epoch dalam milidetik. Waktu pembuatan disimpan secara terpisah pada `createdAt`.
- Form tanggal mengikuti tanggal lokal perangkat pengguna. Riwayat juga ditampilkan dalam zona waktu lokal.
- Jangan menganggap tanggal transaksi sama dengan tanggal pembuatan; transaksi boleh dimasukkan untuk tanggal lampau.
- Urutan default riwayat: `date DESC`, kemudian `createdAt DESC` untuk mengatasi tanggal yang sama.

### 4.7 Penghapusan produk

- Penghapusan produk memerlukan dialog konfirmasi.
- Bila stok produk tidak nol, dialog wajib memperingatkan bahwa produk masih mempunyai stok.
- Setelah konfirmasi, produk dihapus dari master produk; transaksi historis tidak dihapus.
- Tidak ada hard delete untuk transaksi di MVP.

### 4.8 Batas nama/format input

Nilai berikut adalah batas awal untuk validasi; batas boleh dipusatkan sebagai konstanta aplikasi.

| Field | Aturan |
|---|---|
| Nama produk | 1–120 karakter |
| SKU | 1–64 karakter; unik case-insensitive |
| Nama kategori | 1–80 karakter |
| Nama supplier | 1–120 karakter |
| Satuan | 1–24 karakter; default `pcs` |
| Lokasi | Maksimum 120 karakter |
| Catatan | Maksimum 2.000 karakter |
| Kontak supplier | Maksimum 120 karakter |
| Alamat supplier | Maksimum 300 karakter |
| Foto produk | Maksimum 500 KB setelah kompresi |
| Harga | Angka finite, `>= 0` |
| Stok minimum | Angka finite, `>= 0` |
| Kuantitas transaksi | Angka finite, sesuai aturan tipe transaksi |

---

## 5. Branding dan Design Alignment

### 5.1 Identitas

| Elemen | Spesifikasi |
|---|---|
| Nama produk | Stockita |
| Tagline | *Kelola stok, tanpa ribet.* |
| Domain usulan | `stockita.app` — belum diasumsikan tersedia |
| PWA name | Stockita |
| PWA short name | Stockita |
| Font | Token `--font-sans` pada `DESIGN.md` (system-ui stack) |
| Ikon | Outline box/gudang dengan aksen huruf “S”, mengikuti gaya ikon `DESIGN.md` |

### 5.2 Pemetaan token warna

PRD ini tidak membuat warna baru. Nilai token aktual harus berasal dari `DESIGN.md` dan disalin ke `src/styles/tokens.css` tanpa modifikasi.

| Penggunaan Stockita | Token |
|---|---|
| Aksi utama, fokus, link, item aktif | `--accent`, `--accent-hover`, `--accent-soft` |
| CTA backup pada top bar | `--cta-dark` |
| Stok normal / stok masuk | `--positive` dan token soft pasangannya |
| Stok rendah | `--warning` dan token soft pasangannya |
| Stok habis / aksi destruktif | `--negative` dan token soft pasangannya |
| Penyesuaian netral | `--text-secondary` |
| Permukaan halaman/panel/subtle/hover/selected | `--bg-*` |
| Border | `--border-*` |
| Teks | `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-disabled` |

> Catatan dependency: bila `DESIGN.md` belum mendefinisikan `--positive-soft`, `--warning-soft`, `--negative-soft`, atau token kategori seperti `card-lavender`, lengkapi design system terlebih dahulu atau gunakan token terdekat yang telah disahkan. Jangan mengarang nilai CSS baru khusus Stockita.

### 5.3 Prinsip visual

1. Tiny dan compact: ukuran teks, tinggi kontrol, dan jarak mengikuti skala di `DESIGN.md`.
2. Soft, bukan blocky: border tipis, radius hanya dari skala resmi, tanpa bayangan pada panel/kartu halaman.
3. Netral terlebih dahulu: warna aksen terutama untuk aksi, fokus, atau status.
4. Hierarki dibangun melalui bobot teks, alignment, dan jarak, bukan banyak ukuran display.
5. Shadow hanya untuk elemen overlay yang diizinkan sistem desain, seperti modal, dropdown, tooltip, dan toast.
6. Ikon outline konsisten; status tidak boleh disampaikan dengan warna saja.
7. Hindari kartu dekoratif yang tidak menambah fungsi. Gunakan tabel, separator, dan susunan teks bila lebih efisien.
8. Angka stok dan harga harus mudah dibandingkan, rata kanan, dan memakai `tabular-nums`.

---

## 6. Teknologi dan Arsitektur

### 6.1 Stack yang ditetapkan

| Lapisan | Teknologi |
|---|---|
| UI | React + Vite |
| Bahasa | TypeScript dengan strict mode |
| Styling | Tailwind CSS + CSS custom properties dari `DESIGN.md` |
| State UI | Zustand, hanya untuk state antarmuka dan cache tampilan yang memang diperlukan |
| Persistensi | Dexie.js di atas IndexedDB |
| Preferensi sederhana | LocalStorage |
| Routing | React Router |
| Data table/export spreadsheet | CSV native untuk dasar; SheetJS/XLSX lazy-loaded untuk Excel bila dibutuhkan |
| Grafik | Recharts, dimuat secara lazy |
| PWA | `vite-plugin-pwa` dengan service worker dan precache aset inti |
| Pengujian | Vitest + React Testing Library; Playwright untuk alur end-to-end bila tersedia |

### 6.2 Prinsip arsitektur

- IndexedDB adalah sumber kebenaran data produk, kategori, supplier, dan transaksi.
- LocalStorage hanya menyimpan preferensi kecil, bukan data inventori utama atau backup.
- Hindari menggandakan data persisten ke banyak store. Perubahan data harus melewati service/repository layer terpusat.
- Perhitungan status stok dan nilai stok harus berupa fungsi murni yang diuji, bukan logika berbeda di banyak komponen.
- Form tidak langsung mengubah saldo stok sebelum transaksi valid disimpan.
- Impor/ekspor dan library chart/spreadsheet harus lazy-loaded agar beban awal tetap kecil.
- Jangan memasukkan analytics, tracking, remote fonts, atau request jaringan yang tidak penting.
- Semua query yang berpotensi memproses banyak data harus menggunakan indeks, pagination, agregasi yang wajar, dan/atau worker bila pengujian menunjukkan blocking.

### 6.3 Struktur direktori yang disarankan

```text
src/
  app/
    App.tsx
    router.tsx
    providers.tsx
  components/
    ui/                 # Button, Input, Select, Modal, Toast, Chip, Table
    layout/             # TopBar, Sidebar, BottomNav, BottomBar, RightPanel
    feedback/           # EmptyState, Skeleton, ConfirmDialog
  features/
    dashboard/
    products/
    categories/
    suppliers/
    transactions/
    history/
    settings/
    command-palette/
  db/
    database.ts         # Dexie schema + migration
    repositories/
    backup/
  lib/
    format.ts
    validation.ts
    inventory.ts        # pure inventory calculation functions
    date.ts
    ids.ts
  stores/               # Zustand UI state only
  styles/
    tokens.css          # copy of approved DESIGN.md tokens
    globals.css
  types/
  tests/
public/
  icons/
```

Nama direktori boleh disesuaikan, tetapi pemisahan UI, domain logic, persistensi, dan fitur harus dipertahankan.

### 6.4 Konfigurasi theme dan Tailwind

Token warna, tipografi, radius, dan shadow harus menjadi CSS variables. Tailwind hanya memetakan nama utility ke token tersebut. Contoh berikut adalah pemetaan awal, bukan pengganti konfigurasi resmi pada `DESIGN.md`:

```js
// tailwind.config.js — sesuaikan format dengan versi Tailwind yang dipakai.
theme: {
  extend: {
    colors: {
      app: 'var(--bg-app)',
      panel: 'var(--bg-panel)',
      subtle: 'var(--bg-subtle)',
      hover: 'var(--bg-hover)',
      selected: 'var(--bg-selected)',
      bd: {
        DEFAULT: 'var(--border-default)',
        subtle: 'var(--border-subtle)',
        strong: 'var(--border-strong)',
      },
      txt: {
        p: 'var(--text-primary)',
        s: 'var(--text-secondary)',
        t: 'var(--text-tertiary)',
        d: 'var(--text-disabled)',
      },
      accent: {
        DEFAULT: 'var(--accent)',
        hover: 'var(--accent-hover)',
        soft: 'var(--accent-soft)',
      },
      pos: 'var(--positive)',
      neg: 'var(--negative)',
      warn: 'var(--warning)',
      cta: 'var(--cta-dark)',
    },
    // Nilai skala harus diselaraskan 1:1 dengan DESIGN.md.
  },
}
```

Jangan copy-paste nilai hex dari contoh lama ke komponen. File `tokens.css` harus menjadi satu-satunya sumber token visual aplikasi.

---

## 7. Navigasi dan App Shell

### 7.1 Struktur desktop

```text
┌────────────────────────────────────────────────────────────────────┐
│ TOP BAR 40px  [Stockita] [Global Search................] [Tema] [Backup] │
├───────┬──────────────────────────────────────────────┬───────────────┤
│       │                                              │               │
│ LEFT  │              AREA KERJA UTAMA                │ RIGHT PANEL   │
│ 52px  │         Dashboard / Produk / Transaksi       │ 290–320px     │
│       │                                              │ optional      │
├───────┴──────────────────────────────────────────────┴───────────────┤
│ BOTTOM BAR 36px  [7H 30H 90H] [IDR] [Penyimpanan lokal] [Tanggal]     │
└────────────────────────────────────────────────────────────────────┘
```

| Elemen | Ukuran target | Aturan |
|---|---:|---|
| Top bar | 40 px | Surface panel; border bawah 1 px |
| Sidebar kiri | 52 px | Toolbar ikon; border kanan 1 px |
| Panel kanan | 290–320 px | Opsional/kontekstual; border kiri 1 px |
| Rail kanan | 40 px | Hanya dipakai jika ada fungsi yang disetujui; bukan keharusan MVP |
| Bottom bar | 36 px | Surface panel; border atas 1 px |
| Area kerja | Fleksibel | Latar `--bg-app`; tanpa gap dekoratif di antara panel |

Ukuran di atas adalah target desktop. Ketika lebar viewport tidak cukup, panel kanan harus ditutup/dipindahkan ke bottom sheet dan konten utama tetap dapat digunakan.

### 7.2 Sidebar desktop

Urutan navigasi:

1. Dashboard
2. Produk
3. Kategori
4. Supplier
5. Separator
6. Stok Masuk
7. Stok Keluar
8. Penyesuaian
9. Riwayat
10. Separator
11. Pengaturan
12. Reset Data — ditempatkan dalam grup area bawah dan harus jelas sebagai tindakan destruktif

- Setiap ikon-tombol target sentuh minimal 36×36 px, ikon sekitar 20 px sesuai skala ikon design system.
- Item aktif memakai `--bg-selected` dan teks/ikon sesuai token aktif pada `DESIGN.md`.
- Tooltip muncul setelah 400 ms untuk ikon tanpa label yang terlihat.
- Reset Data bukan shortcut utama; gunakan label jelas, konfirmasi bertingkat, dan tidak boleh terpicu hanya dengan satu klik.

### 7.3 Top bar

- Kiri: ikon/logo mini dan nama `Stockita`.
- Tengah: global search dengan placeholder `Cari produk, SKU, atau menu…`.
- Kanan: tombol toggle tema dan tombol `Export Backup` varian CTA dark sesuai `DESIGN.md`.
- Pada viewport sempit, tombol backup dapat dipindahkan ke menu overflow, tetapi wajib dapat ditemukan di halaman Pengaturan.
- Search harus tetap dapat digunakan lewat keyboard.

### 7.4 Bottom bar

- Segmented control periode `7H`, `30H`, `90H`; memengaruhi rentang chart dashboard dan ringkasan berbasis waktu.
- Label mata uang menggunakan preferensi aktif, default `IDR`.
- Tampilkan status storage atau label `Data tersimpan di perangkat ini`.
- Bila menampilkan waktu, jelaskan konteksnya. Karena tidak ada sinkronisasi server, jangan memakai label “Sinkron terakhir”. Gunakan `Perubahan lokal terakhir` atau `Diperbarui`.

### 7.5 Navigasi mobile (<768 px)

- Sidebar desktop digantikan bottom navigation target tinggi 56 px.
- Lima item: `Dashboard`, `Produk`, `+ Tambah`, `Riwayat`, `Setelan`.
- `+ Tambah` membuka action sheet dengan opsi `Produk`, `Stok Masuk`, `Stok Keluar`, dan `Penyesuaian`.
- Navigasi sekunder seperti Kategori dan Supplier tersedia melalui Pengaturan/halaman Produk sesuai IA yang konsisten; semua fitur desktop harus tetap dapat dicapai pada mobile.
- Panel kanan menjadi bottom sheet dengan radius atas sesuai token radius yang disahkan di `DESIGN.md`; handle visual tidak menggantikan label/aksi aksesibel.
- Dialog/form besar menjadi layar penuh dengan header sticky. Tombol Simpan harus tetap terlihat atau mudah dicapai di akhir form.
- Tabel lebar menggunakan kolom prioritas dan/atau container scroll horizontal yang jelas. Jangan menyembunyikan informasi penting tanpa alternatif detail.

---

## 8. Spesifikasi Fitur

### 8.1 Dashboard

#### Tujuan

Memberi gambaran inventori saat aplikasi dibuka, mengarahkan pengguna ke stok yang perlu ditangani, dan memperlihatkan aktivitas terbaru.

#### Layout desktop

**Baris 1 — empat metrik ringkas** (grid 12 kolom, masing-masing 3 kolom):

1. Total Produk — jumlah produk aktif di master produk.
2. Nilai Stok — total `stock × costPrice` untuk semua produk.
3. Stok Rendah — jumlah produk berstatus Rendah; tampilkan jumlah Habis terpisah bila ruang mengizinkan.
4. Transaksi Hari Ini — jumlah transaksi berdasarkan tanggal transaksi lokal hari ini.

Setiap stat berisi label, nilai, dan satu metadata kontekstual. Nilai tidak boleh menampilkan perubahan naik/turun dibanding periode sebelumnya kecuali baseline pembanding benar-benar tersedia dan dihitung dengan benar. Jangan memberi warna merah/hijau untuk angka yang tidak memiliki makna arah.

**Baris 2 — pergerakan dan peringatan**

- Area sekitar 8/12 kolom: chart pergerakan stok dari transaksi `in` dan `out`, dengan filter periode 7H/30H/90H.
- Panel sekitar 4/12 kolom: daftar produk Stok Rendah dan Habis, diurutkan berdasarkan tingkat urgensi; klik item membuka detail/edit produk.
- Grafik kosong harus memiliki empty state, bukan sumbu tanpa data.
- Chart memakai grid horizontal tipis, label sumbu kecil, serta tooltip sesuai token dan komponen overlay `DESIGN.md`.
- Grafik adalah ringkasan kuantitas per hari; jangan mencampurkan jumlah unit dengan nilai Rupiah dalam satu sumbu.

**Baris 3 — transaksi terbaru**

- Tampilkan 5 transaksi terbaru berdasarkan `date DESC`, `createdAt DESC`.
- Kolom: Tanggal, Tipe, Produk, Qty, Nilai.
- Klik baris membuka modal detail transaksi.

#### Acceptance criteria

- Ringkasan menghitung seluruh produk/transaksi, bukan hanya data di halaman pagination.
- Produk Habis tidak dihitung ganda sebagai Stok Rendah.
- Periode chart berubah sesuai segmented control.
- Setiap angka dapat direkonsiliasi dengan data tersimpan.
- Dashboard tetap dapat dirender saat belum ada produk/transaksi.

### 8.2 Produk

#### Halaman daftar

Toolbar menyediakan:

- Search nama/SKU.
- Filter kategori, supplier, dan status stok.
- Tombol `+ Tambah Produk` sebagai aksi primer tunggal di area ini.
- Tombol export CSV/Excel bila sesuai ruang; fitur export juga tersedia di menu overflow.

Kolom tabel desktop:

| Kolom | Perilaku |
|---|---|
| SKU | Teks ringkas; unik |
| Nama | Nama produk; bila ada catatan dapat muncul di detail, bukan memadati tabel |
| Kategori | Nama atau `—` |
| Stok | Angka rata kanan + satuan |
| Harga Beli | Angka mata uang rata kanan |
| Status | Chip teks Normal/Rendah/Habis |
| Aksi | Menu `⋯`: Detail, Edit, Duplikat, Hapus |

- Default urutan nama A–Z atau produk terakhir diperbarui; pilih satu aturan dan gunakan konsisten. Rekomendasi: `updatedAt DESC` dengan kontrol pengurutan yang terlihat.
- Filter dapat dikombinasikan.
- Pagination harus dilakukan setelah filter dan pencarian diterapkan.
- Untuk lebih dari 500 baris, gunakan virtualisasi atau strategi tabel yang terbukti memenuhi target performa.
- Klik baris membuka panel detail kanan pada desktop dan bottom sheet pada mobile.

#### Modal tambah/edit produk

- Lebar desktop target 560 px; mobile full-screen.
- Grid dua kolom pada lebar cukup; satu kolom pada mobile.
- Field:
  - SKU*.
  - Nama produk*.
  - Kategori.
  - Supplier.
  - Satuan (default `pcs`).
  - Harga beli.
  - Harga jual.
  - Stok awal — hanya saat membuat produk.
  - Stok minimum.
  - Lokasi.
  - Foto produk opsional.
  - Catatan.
- Foto dikompres sebelum disimpan dan maksimum 500 KB setelah kompresi. Jika browser tidak dapat mengompres format gambar tertentu, tampilkan instruksi yang berguna dan jangan menyimpan file berukuran berlebih.
- Saat mode edit, stok hanya dibaca di form metadata; perubahan saldo dilakukan melalui transaksi/penyesuaian, bukan mengedit angka stok langsung.
- Simpan dinonaktifkan selama proses simpan berlangsung untuk mencegah submit ganda.
- Tutup via Esc, tombol tutup, atau backdrop. Bila form dirty, tampilkan konfirmasi agar perubahan tidak hilang.

#### Duplikat produk

- Membuka form baru berisi salinan field metadata.
- SKU harus dikosongkan atau diberi nilai unik yang dapat diedit; SKU duplikat tidak boleh langsung tersimpan.
- Stok awal default 0 agar stok tidak tergandakan tanpa disengaja.

#### Acceptance criteria

- SKU duplikat ditolak tanpa mengubah data tersimpan.
- Error tampil dekat field terkait dan fokus dipindahkan ke input invalid pertama saat submit.
- Edit metadata tidak mengubah saldo atau histori.
- Produk baru dengan stok awal positif memiliki transaksi pembukaan stok.
- Filter dan search bisa digabungkan dan bisa direset.
- Penghapusan mempertahankan transaksi terdahulu.

### 8.3 Kategori

#### Data

- Nama*.
- Deskripsi opsional.
- Pilihan warna badge berdasarkan token yang tersedia dan disahkan `DESIGN.md`.

#### Interaksi

- Daftar memakai pola toolbar + tabel yang sama dengan Produk.
- CRUD dilakukan melalui modal kecil target 400 px; mobile menggunakan layar penuh atau bottom sheet sesuai komponen resmi.
- Kategori yang dipakai produk tidak dapat dihapus tanpa konfirmasi eksplisit untuk mengosongkan relasi kategori produk terkait.
- Tidak ada warna bebas dalam bentuk input hex.

#### Acceptance criteria

- Nama kategori tidak boleh kosong.
- Penghapusan kategori tidak menghapus produk.
- Setelah penghapusan yang dikonfirmasi, produk terkait tetap ada dan nilai kategori menjadi `—`.

### 8.4 Supplier

#### Data

- Nama*.
- Kontak.
- Alamat.
- Catatan.

#### Interaksi dan aturan

- Pola halaman sama dengan Kategori.
- Supplier dapat dikaitkan dengan Produk dan transaksi Stok Masuk.
- Jika supplier dihapus, produk terkait tidak terhapus; relasi supplier pada produk dikosongkan setelah konfirmasi. Snapshot supplier pada transaksi historis, bila tersedia, tetap dipertahankan.

#### Acceptance criteria

- Supplier kosong tidak dapat disimpan.
- Penghapusan supplier tidak menghapus transaksi atau produk.
- Data kontak tidak ditampilkan pada halaman publik karena aplikasi tidak mempunyai halaman publik.

### 8.5 Stok Masuk

#### Field

- Tanggal transaksi* (default hari ini menurut waktu lokal).
- Produk* (combobox dengan search nama/SKU).
- Qty* (> 0).
- Harga per unit (opsional, angka `>= 0`).
- Supplier (opsional).
- Catatan opsional.

#### Perilaku

- Preview nilai tampil sebagai `Qty × Harga` jika harga dimasukkan; jika tidak, tampilkan `Nilai belum dihitung`.
- Saat memilih produk, tampilkan stok saat ini dan stok setelah transaksi.
- Setelah berhasil, saldo produk bertambah dan satu transaksi tercatat.
- Simpan tidak boleh membuat transaksi duplikat saat diklik berkali-kali.

#### Acceptance criteria

- Qty kosong, bukan angka, nol, atau negatif ditolak.
- Harga kosong dibedakan dari harga 0.
- Saldo akhir = saldo awal + qty.
- Jika penyimpanan gagal, tidak boleh ada keadaan parsial: transaksi tanpa update stok atau update stok tanpa transaksi.

### 8.6 Stok Keluar

#### Field

- Tanggal transaksi*.
- Produk*.
- Qty* (> 0 dan tidak melebihi stok tersedia).
- Harga per unit (opsional).
- Alasan* dari pilihan: Penjualan, Rusak, Hilang, Transfer, Lainnya.
- Catatan opsional; diwajibkan bila alasan `Lainnya` bila praktis diterapkan.

#### Perilaku

- Tampilkan stok tersedia sebelum submit.
- Bila qty melebihi stok, cegah submit dan tampilkan pesan `Stok tersedia: {n}`.
- Nilai stok berubah hanya setelah penyimpanan berhasil.
- Tipe `Transfer` hanya merekam alasan pengeluaran di lokasi metadata; bukan transfer antar-gudang otomatis.

#### Acceptance criteria

- Sistem tidak mengizinkan stok negatif.
- Kesalahan validasi mempertahankan input pengguna yang sudah diisi.
- Saldo akhir = saldo awal − qty.
- Alasan transaksi tersimpan dan muncul pada detail/riwayat.

### 8.7 Penyesuaian / Stok Opname

#### Field

- Tanggal transaksi*.
- Produk*.
- Stok fisik* (angka `>= 0`).
- Catatan/alasan opsional, disarankan untuk setiap koreksi selain selisih 0.

#### Perilaku

- Saat produk dipilih, tampilkan `Stok sistem saat ini`.
- Selisih dihitung langsung: `stok fisik − stok sistem`.
- Selisih positif ditampilkan `+N`, negatif `−N`, dan nol `±0`.
- Penyimpanan menghasilkan transaksi `adjust` yang mencatat `stockBefore`, `stockAfter`, dan selisih bertanda.
- Jika selisih 0, tampilkan `Stok sudah sesuai. Tidak ada penyesuaian yang perlu disimpan.`

#### Acceptance criteria

- Pengguna mengisi stok fisik, bukan nilai selisih.
- Saldo akhir sama dengan stok fisik yang dikonfirmasi.
- Defisit tidak menghasilkan saldo negatif karena stok fisik tidak boleh negatif.
- Selisih nol tidak membuat transaksi kosong.

### 8.8 Riwayat Transaksi

#### Filter

- Rentang tanggal mulai/akhir.
- Tipe transaksi: Masuk, Keluar, Penyesuaian.
- Produk.
- Kategori produk (gunakan relasi saat ini; transaksi yang produknya sudah dihapus tetap dapat dicari melalui snapshot nama/SKU).
- Pencarian nama produk/SKU/catatan.

#### Kolom

- Tanggal/waktu.
- Tipe.
- Produk.
- Qty dengan tanda.
- Nilai.
- Catatan/alasan.
- Menu/detail.

#### Detail transaksi

Modal/panel detail menampilkan:

- Tipe dan waktu transaksi.
- Nama produk dan SKU snapshot.
- Qty/saldo sebelum/saldo setelah.
- Harga per unit dan nilai jika tersedia.
- Supplier snapshot bila relevan.
- Alasan dan catatan.
- Penanda jika produk master telah dihapus.

#### Pagination dan export

- Pagination default 25 baris; opsi 25/50/100 bila berguna.
- Indikator total hasil dan halaman saat ini.
- Export mengikuti filter aktif. Pengguna perlu diberi tahu apakah export memuat seluruh hasil filter atau hanya halaman yang sedang tampil. Aturan MVP: **export semua hasil yang cocok dengan filter**, bukan hanya halaman saat ini.
- CSV harus aman dibuka di spreadsheet; nilai teks yang diawali formula seperti `=`, `+`, `-`, `@` harus dinetralkan saat ekspor agar tidak menjadi formula berbahaya.

#### Acceptance criteria

- Urutan dan filter konsisten.
- Qty `in` ditampilkan `+N`, `out` `−N`, `adjust` sesuai selisih (`+N`, `−N`, atau `±0` hanya jika ada data legacy yang menyimpannya).
- Export mencakup semua hasil terfilter.
- Produk yang dihapus tetap terbaca melalui snapshot.

### 8.9 Global search / Command palette

- Shortcut buka: `Ctrl+K` Windows/Linux dan `Cmd+K` macOS.
- Shortcut `Esc` menutup palette; panah atas/bawah memilih hasil; `Enter` menjalankan hasil; fokus otomatis masuk ke input saat dibuka.
- Hasil dibagi ke grup `PRODUK`, `TRANSAKSI`, dan `NAVIGASI`.
- Pencarian produk berdasarkan nama/SKU; pencarian transaksi berdasarkan snapshot nama/SKU dan catatan jika performa memungkinkan.
- Item navigasi dapat membuka Dashboard, Produk, Kategori, Supplier, Stok Masuk, Stok Keluar, Penyesuaian, Riwayat, dan Pengaturan.
- Shortcut `N` saat palette terbuka membuka form Produk baru; shortcut tidak boleh mengganggu pengetikan `N` ketika fokus tidak pada konteks palette.
- Hasil kosong memiliki copywriting yang jelas dan opsi membersihkan kata kunci.

### 8.10 Pengaturan

#### Profil Toko

- Nama toko.
- Logo opsional.
- Alamat.
- Kontak.

Profil toko bersifat metadata lokal dan dapat digunakan pada header export. Data logo mengikuti batas storage dan dikompres bila disimpan sebagai gambar.

#### Preferensi

- Mata uang tampilan: default IDR. Format angka/mata uang harus menggunakan `Intl.NumberFormat`; dukung IDR secara default. Bila mata uang alternatif ditambahkan, jangan mengubah angka asli produk.
- Format tanggal.
- Ambang stok rendah default untuk produk baru atau saat `minStock` tidak ditetapkan. Prioritas status tetap menggunakan `minStock` produk.
- Tema: Light, Dark, System.

#### Data

- `Export JSON` — backup lengkap yang dapat diimpor kembali.
- `Import JSON` — file picker, validasi skema, preview ringkasan data, konfirmasi sebelum perubahan diterapkan.
- `Export CSV` — data produk dan/atau transaksi; pilih jenis data secara eksplisit.
- `Reset Data` — dialog destruktif yang mewajibkan pengguna mengetik `HAPUS`.

#### Tentang

- Nama aplikasi dan versi.
- Status IndexedDB tersedia/tidak.
- Estimasi penggunaan storage bila browser mendukung `navigator.storage.estimate()`.
- Tombol/tautan bantuan untuk membuat backup.

#### Acceptance criteria

- Preferensi tema langsung berlaku dan tersimpan.
- Import JSON tidak menghapus data lama sebelum file tervalidasi dan pengguna mengonfirmasi.
- Reset Data tidak dapat berjalan tanpa frasa konfirmasi tepat `HAPUS`.
- Setelah reset berhasil, data inventori kembali ke keadaan awal; preferensi tema boleh dipertahankan bila dijelaskan dalam dialog. Pilihan MVP: reset data inventori dan profil toko, tetapi mempertahankan preferensi tema dan format tanggal.

### 8.11 Import dan Backup JSON

#### Bentuk backup

Gunakan format dengan versi skema agar dapat dimigrasikan di masa depan. Contoh bentuk:

```json
{
  "app": "Stockita",
  "backupVersion": 1,
  "schemaVersion": 1,
  "exportedAt": 1791878400000,
  "settings": {},
  "products": [],
  "categories": [],
  "suppliers": [],
  "transactions": []
}
```

Timestamp contoh hanya ilustrasi format, bukan nilai waktu yang wajib.

#### Export

- Export seluruh data operasional dan pengaturan yang termasuk ruang lingkup backup.
- Nama file memuat aplikasi dan tanggal export lokal, misalnya `stockita-backup-YYYY-MM-DD.json`.
- File UTF-8 dengan JSON valid dan dapat diproses tanpa ketergantungan pada urutan key.
- Export tidak boleh mengubah data tersimpan.

#### Import

- Validasi JSON parse, `app`, `backupVersion/schemaVersion`, struktur array, tipe field, ID unik, referensi, SKU unik, serta nilai numerik.
- Bila versi tidak didukung, tolak dengan pesan yang menjelaskan alasannya; jangan mencoba mengimpor sebagian secara diam-diam.
- Tampilkan preview jumlah produk, kategori, supplier, dan transaksi sebelum konfirmasi.
- MVP menggunakan strategi **Replace all** dengan konfirmasi eksplisit dan backup otomatis opsional dari data saat ini sebelum replacement bila ruang storage mencukupi. Jika backup otomatis gagal, pengguna harus diberi tahu sebelum replacement dilanjutkan.
- Semua data diimport dalam satu strategi commit yang menjaga konsistensi. Jika validasi atau commit gagal, data lama harus tetap utuh.
- Data gambar yang tidak valid atau melebihi batas ditolak atau dihilangkan dengan peringatan eksplisit; jangan silently truncate file backup.
- Jalankan pemeriksaan konsistensi pasca-import: saldo produk harus sesuai dengan field saldo di backup; tidak perlu merekonstruksi saldo dari semua transaksi historis pada MVP karena transaksi lama bisa berasal dari versi skema berbeda.

### 8.12 Export CSV / Excel

- Produk: SKU, nama, kategori, supplier, satuan, stok, stok minimum, harga beli, harga jual, lokasi, catatan, createdAt, updatedAt.
- Transaksi: tanggal, tipe, SKU/nama produk snapshot, qty bertanda, saldo sebelum/sesudah, harga, nilai, supplier snapshot, alasan, catatan.
- CSV menggunakan UTF-8. Pertimbangkan BOM UTF-8 jika diperlukan agar Excel membaca karakter Indonesia dengan baik.
- Semua kolom harus mempunyai header dan urutan yang konsisten.
- Harga/kuantitas diekspor sebagai nilai yang dapat dianalisis; format mata uang dekoratif sebaiknya tidak ditanam ke nilai numerik CSV.
- Nilai teks yang berpotensi dieksekusi sebagai formula spreadsheet harus dinetralkan.
- XLSX/SheetJS dimuat ketika pengguna memilih export/import Excel, bukan pada initial bundle.

### 8.13 Toast, empty state, loading, error

- Sukses: toast ringkas, posisi kanan bawah desktop; posisi yang tidak menutupi bottom navigation/CTA pada mobile; durasi target 4 detik.
- Error: bahasa jelas, menyebut apa yang gagal dan tindakan berikutnya; jangan hanya menampilkan “Error”.
- Loading: skeleton pada konten yang memang sedang diambil dari storage; jangan menampilkan skeleton jika query selesai terlalu cepat dan membuat UI berkedip.
- Empty state: satu ikon netral, judul singkat, deskripsi, dan maksimal satu CTA primer/sekunder sesuai konteks.
- Skeleton shimmer 1,2 detik hanya jika diizinkan design system, serta dinonaktifkan pada `prefers-reduced-motion`.
- Error database/storage harus tetap memberi jalan ke pengaturan/backup jika memungkinkan.

---

## 9. Data Model dan Database

Semua data disimpan secara lokal. Skema TypeScript di bawah merupakan kontrak domain; implementasi IndexedDB boleh menambahkan field teknis jika didokumentasikan dan tidak mengubah makna field.

```ts
export type TransactionType = 'in' | 'out' | 'adjust';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId?: string;
  supplierId?: string;
  unit: string;                    // default: 'pcs'
  costPrice: number;               // >= 0
  sellPrice: number;               // >= 0
  stock: number;                   // >= 0
  minStock: number;                // >= 0
  location?: string;
  image?: string;                  // data URL/base64 terkompresi, max 500 KB
  note?: string;
  createdAt: number;               // epoch ms
  updatedAt: number;               // epoch ms
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: TokenColor;               // enum token yang disahkan DESIGN.md
  createdAt: number;
  updatedAt: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  address?: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  productId: string;               // boleh merujuk produk yang sudah dihapus
  productSkuSnapshot: string;
  productNameSnapshot: string;
  qty: number;                     // in/out > 0; adjust signed difference
  stockBefore: number;
  stockAfter: number;
  price?: number;                  // harga per unit; absent berbeda dari 0
  supplierId?: string;
  supplierNameSnapshot?: string;
  reason?: 'sale' | 'damaged' | 'lost' | 'transfer' | 'other' | 'opening-stock' | 'stocktake';
  note?: string;
  date: number;                    // tanggal transaksi, epoch ms
  createdAt: number;               // waktu transaksi dicatat, epoch ms
}

export interface StoreProfile {
  storeName: string;
  logo?: string;
  address?: string;
  contact?: string;
}

export interface AppSettings {
  profile: StoreProfile;
  currency: string;                // default: 'IDR'
  dateFormat: 'locale' | 'dd/MM/yyyy' | 'yyyy-MM-dd';
  lowStockThreshold: number;       // default untuk produk baru
  theme: ThemeMode;
  schemaVersion: number;
  updatedAt: number;
}

// Contoh tipe domain; enum nilainya diturunkan dari token yang tersedia.
export type TokenColor =
  | 'accent'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'subtle';
```

### 9.1 Indeks IndexedDB yang diperlukan

Indeks minimum yang perlu dipertimbangkan di Dexie:

- `products`: primary key `id`; unique index `skuNormalized`; index `name`, `categoryId`, `supplierId`, `updatedAt`.
- `categories`: primary key `id`; unique index `nameNormalized` bila produk mensyaratkan kategori unik.
- `suppliers`: primary key `id`; index `nameNormalized` bila dibutuhkan.
- `transactions`: primary key `id`; index `date`, `createdAt`, `type`, `productId`, serta komposit yang sesuai untuk filter tanggal/tipe.
- `settings`: satu record konfigurasi atau table key-value.

Nama index Dexie harus mengikuti sintaks versi library yang digunakan. Indeks tambahan hanya ditambahkan berdasarkan query yang benar-benar dibutuhkan.

### 9.2 Migrasi skema

- Setiap versi database mempunyai nomor versi Dexie dan `schemaVersion` backup.
- Migrasi wajib deterministik, diuji dari fixture data versi lama, dan tidak menghapus field/data tanpa aturan eksplisit.
- Bila migrasi gagal, aplikasi tidak boleh menginisialisasi database kosong seolah-olah data pengguna tidak ada. Tampilkan status pemulihan dan arahkan pengguna membuat salinan/backup bila memungkinkan.

### 9.3 Invariant yang harus selalu benar

1. SKU produk unik setelah normalisasi.
2. Stok produk tidak pernah negatif.
3. Harga dan stok minimum finite dan tidak negatif.
4. Setiap transaksi mengandung snapshot produk dan saldo sebelum/sesudah.
5. Untuk transaksi `in`, `stockAfter = stockBefore + qty`.
6. Untuk transaksi `out`, `stockAfter = stockBefore - qty` dan `qty <= stockBefore`.
7. Untuk transaksi `adjust`, `stockAfter = stockBefore + qty` dan `stockAfter >= 0`.
8. Operasi transaksi yang mengubah saldo tersimpan secara atomik.
9. Menghapus master produk tidak menghapus transaksi historis.
10. Import gagal tidak boleh merusak data yang sebelumnya valid.

---

## 10. State, Interaksi, dan Aksesibilitas

### 10.1 State komponen

| State | Aturan |
|---|---|
| Hover | Surface `--bg-hover`; transisi singkat sesuai `DESIGN.md` |
| Pressed | Surface `--bg-selected` |
| Selected | Surface `--bg-selected`; teks sesuai token dan bobot yang ditetapkan |
| Focus-visible | Ring 2 px memakai `--accent` dengan offset sesuai `DESIGN.md` |
| Disabled | Token disabled; tanpa affordance hover; tetap terbaca |
| Loading | Spinner kecil di dalam tombol atau indikator skeleton yang tepat |
| Error | Border dan teks `--negative`, dengan pesan dekat kontrol |
| Sukses | Toast yang tidak menutupi aksi penting |
| Destruktif | Confirm dialog; Reset Data mengharuskan mengetik `HAPUS` |

### 10.2 Aksesibilitas

- Target minimal WCAG 2.1 AA sebagai sasaran dasar.
- Semua tombol ikon memiliki accessible name/`aria-label` dan tooltip jika label visual tidak terlihat.
- Gunakan HTML semantik: heading, button, label, table, form, dan navigation landmark.
- Setiap input memiliki label programatik; placeholder bukan pengganti label.
- Status stok tidak boleh bergantung pada warna saja; chip selalu memiliki teks.
- Arah kuantitas ditunjukkan melalui tanda `+`/`−` serta label tipe transaksi.
- Dialog mengelola fokus: fokus masuk ke dialog, tidak keluar saat modal terbuka, Esc hanya menutup jika tidak ada konfirmasi perubahan yang tertunda, dan fokus kembali ke pemicu setelah ditutup.
- Semua aksi dapat dijalankan menggunakan keyboard.
- Chart harus memiliki ringkasan teks atau data alternatif yang setara.
- Hormati `prefers-reduced-motion`; jangan mewajibkan animasi untuk menyampaikan status.
- Kontras warna diverifikasi terhadap token aktual di `DESIGN.md`; target teks biasa minimal 4.5:1, teks besar minimal 3:1.
- Error form diumumkan secara aksesibel dan tidak hanya ditandai border berwarna.

### 10.3 Shortcut

| Shortcut | Fungsi | Catatan |
|---|---|---|
| `Ctrl+K` / `Cmd+K` | Buka command palette | Tidak menghalangi browser shortcut penting |
| `Esc` | Tutup dialog/palette | Hanya jika aman menutup |
| `N` | Produk baru saat palette terbuka | Tidak aktif dalam input teks |
| `Enter` | Jalankan item pilihan palette | Fokus dan seleksi harus jelas |

---

## 11. Persyaratan Non-Fungsional

| Area | Requirement |
|---|---|
| Performa tabel | Interaksi/render daftar 1.000 produk terasa responsif; target pembaruan UI lokal <100 ms pada perangkat pengujian yang ditentukan |
| Skala data | Target uji 10.000 produk dan 100.000 transaksi pada browser/perangkat yang ditentukan |
| Initial load | Dashboard target tampil interaktif <1 detik pada perangkat uji setelah aset inti tersedia; ukur dengan benchmark yang ditulis jelas |
| Virtualisasi | Untuk daftar >500 baris, gunakan virtualisasi atau bukti hasil profiling bahwa pendekatan lain tetap memenuhi performa |
| Bundle | Target <400 KB gzip untuk initial JS/CSS, dengan Recharts dan SheetJS lazy-loaded; tetapkan apakah angka menghitung shared vendor chunk |
| Offline | Fitur inti bekerja offline setelah kunjungan pertama dan service worker selesai instalasi |
| Browser | Chrome, Edge, Firefox, Safari versi yang masih didukung dan dirilis dalam dua tahun terakhir; uji minimal Chrome desktop dan Android, serta Safari iOS jika tersedia |
| Penyimpanan | IndexedDB sebagai storage utama; beri pesan yang dapat ditindaklanjuti bila storage gagal atau mendekati kuota |
| Privasi | Tidak ada analytics/tracking; data inventori tidak dikirim ke server eksternal oleh aplikasi |
| Keamanan input | Validasi input, validasi file import, pembatasan ukuran file/gambar, dan mitigasi CSV formula injection |
| Responsif | Breakpoint 640 / 768 / 1024 / 1280 px, dengan perilaku khusus di bawah 768 px |
| Aksesibilitas | WCAG 2.1 AA sebagai target dasar, termasuk keyboard dan reduced motion |
| Keandalan | Refresh/menutup tab setelah operasi sukses tidak menghilangkan data yang telah ter-commit ke IndexedDB |

> Semua target waktu performa harus dilaporkan bersama spesifikasi perangkat, browser, ukuran data, dan metode pengukuran. Jangan mengklaim target universal hanya dari pengujian di satu mesin pengembangan.

---

## 12. Keamanan, Privasi, dan Ketahanan Data

- Tidak ada akun, backend, analytics, telemetry, ataupun pengiriman data inventori ke layanan eksternal.
- Aset PWA dapat di-cache dari origin aplikasi; data inventori tidak boleh ditaruh di Cache Storage.
- Import JSON dianggap sebagai input tidak tepercaya: validasi struktur dan tipe sebelum menulis ke IndexedDB.
- File gambar harus divalidasi jenis dan ukurannya; hindari menampilkan SVG arbitrer dari file pengguna sebagai markup aktif.
- Jangan menyertakan isi catatan atau nilai inventori pada URL/query parameter.
- Backup file dapat berisi informasi bisnis; UI menyarankan pengguna menyimpan file pada tempat yang aman.
- Data di browser bukan enkripsi. Jangan menjanjikan bahwa data terlindungi dari pengguna lain yang mempunyai akses ke profil browser/komputer yang sama.
- Jika storage quota tidak tersedia atau API estimate tidak didukung, tampilkan status “Tidak tersedia” daripada angka palsu.
- Jika IndexedDB gagal dibuka, jangan diam-diam beralih ke LocalStorage untuk menyimpan seluruh transaksi. Tampilkan error dan arahan pemulihan/backup.

---

## 13. Edge Cases dan Perilaku yang Diharapkan

| Kasus | Perilaku wajib |
|---|---|
| Import JSON rusak | Ditolak; data aktif tidak berubah; tampilkan alasan ringkas |
| Import schema tidak didukung | Ditolak; berikan versi yang didukung jika diketahui |
| SKU duplikat setelah trim/case folding | Tolak dan fokuskan field SKU |
| Produk terhapus tetapi punya transaksi | Histori tetap tampil dengan snapshot dan label produk dihapus |
| Hapus kategori/supplier yang sedang dipakai | Konfirmasi jumlah relasi; unlink secara konsisten setelah disetujui |
| Stok keluar lebih besar dari stok | Cegah commit; tampilkan stok tersedia |
| Stok fisik sama dengan stok sistem | Tidak membuat transaksi penyesuaian |
| Pengguna menekan Simpan berkali-kali | Cegah submit ganda |
| Storage penuh | Jangan menganggap sukses; tampilkan pesan, pertahankan input bila memungkinkan |
| Dua tab membuka aplikasi | Beri kabar ke tab lain melalui BroadcastChannel; invalidasi/refetch data yang berubah |
| BroadcastChannel tidak didukung | Aplikasi tetap berjalan; sinkronisasi real-time antar-tab tidak dijamin |
| Foto >500 KB | Kompres; jika tetap terlalu besar, tolak dengan pesan yang jelas |
| Pengguna mengganti timezone | Tanggal ditampilkan sesuai zona waktu lokal, dengan timestamp tersimpan tetap konsisten |
| Data sangat banyak | Pagination/virtualisasi dan ekspor tidak boleh membekukan UI secara tidak terkendali |
| IndexedDB upgrade/migration gagal | Tampilkan error pemulihan; jangan membuat database kosong otomatis |
| Refresh saat form belum disimpan | Tidak wajib memulihkan draft; bila draft tidak disimpan, beri konfirmasi saat pengguna mencoba meninggalkan form |
| Offline sebelum PWA terpasang | Tidak menjanjikan offline penuh; offline dijamin setelah aset inti ter-cache |
| Nilai teks dimulai `=`, `+`, `-`, `@` saat CSV | Dinetralkan sebagai teks saat export |
| Harga kosong vs 0 | Kosong tampil `—`/belum dihitung; 0 tampil sebagai nilai nol yang eksplisit |
| Waktu perangkat tidak akurat | Simpan timestamp perangkat; tidak ada server untuk koreksi waktu |

---

## 14. Analytics dan Observability

Stockita tidak mengirim analytics telemetri ke server. Untuk pengembangan dan QA:

- Gunakan logging development-only tanpa mencatat isi catatan, kontak supplier, atau data bisnis secara berlebihan.
- Error penting seperti gagal membuka database, gagal transaksi atomik, gagal import, dan quota/storage error harus mempunyai pesan yang dapat dipahami pengguna.
- Hapus console logging debug dari build produksi kecuali pesan error yang aman dan benar-benar diperlukan.
- Gunakan pengujian otomatis dan pengukuran lokal sebagai cara utama memverifikasi keberhasilan.

---

## 15. Kriteria Penerimaan Lintas Fitur

Sebuah fitur dianggap diterima ketika:

- [ ] Alur utama dan seluruh state invalid/loading/empty/error/success diimplementasikan.
- [ ] Data persisten ditulis melalui layer data resmi; tidak ada jalur UI yang melewati validasi domain.
- [ ] Validasi dilakukan di UI dan domain/service layer, bukan hanya mengandalkan atribut HTML.
- [ ] Tidak ada perubahan saldo tanpa catatan transaksi yang sesuai.
- [ ] Tidak ada transaksi sukses yang tersimpan tanpa perubahan saldo yang sesuai.
- [ ] Tidak ada warna, font size, radius, atau shadow hardcoded di luar token `DESIGN.md`.
- [ ] Hover, pressed, selected, focus, disabled, dan error konsisten.
- [ ] Status menggunakan teks dan/atau tanda, bukan warna saja.
- [ ] Tabel mendukung keyboard, header kolom, alignment numerik, filter, dan empty state.
- [ ] Import gagal tidak mengubah data aktif.
- [ ] Aksi destruktif mempunyai konfirmasi yang sesuai.
- [ ] Layout diuji pada desktop dan mobile di bawah 768 px.
- [ ] Tidak ada error runtime/console yang diketahui pada alur normal.

---

## 16. Test Plan Minimum

### 16.1 Unit tests

- Status stok pada batas: 0, `minStock`, `minStock + epsilon`.
- Format kuantitas positif, negatif, dan nol.
- Hitung nilai stok dan nilai transaksi dengan harga yang kosong maupun nol.
- Validasi SKU case-insensitive dan whitespace.
- Hitung saldo untuk masuk, keluar, dan penyesuaian.
- Validasi qty tidak finite, negatif, nol, atau melebihi stok.
- Validasi struktur backup/schema dan duplicate IDs/SKU.
- CSV formula-injection neutralization.

### 16.2 Integration tests

- Buat produk dengan stok awal 0 dan >0.
- Buat stok masuk: saldo dan transaksi sama-sama berubah.
- Buat stok keluar valid dan tidak valid.
- Buat penyesuaian surplus/defisit/nol.
- Hapus produk yang mempunyai histori dan verifikasi snapshot tetap tampil.
- Hapus kategori/supplier yang sedang dipakai dan verifikasi relasi di-unlink.
- Export JSON lalu import kembali dan bandingkan data secara konsisten.
- Import gagal dan verifikasi data lama tetap utuh.
- Reset Data dengan konfirmasi benar dan salah.

### 16.3 End-to-end smoke tests

1. Pengguna membuka aplikasi tanpa data → empty state tampil.
2. Tambahkan kategori, supplier, dan produk.
3. Catat stok masuk.
4. Catat stok keluar yang valid, kemudian percobaan melebihi stok.
5. Lakukan penyesuaian stok.
6. Cari produk melalui global search.
7. Filter riwayat dan export hasil.
8. Reload aplikasi dan verifikasi data tetap ada.
9. Simulasikan offline setelah PWA ter-cache dan ulangi fitur inti.
10. Uji layout mobile dan bottom navigation/action sheet.

---

## 17. Milestone dan Urutan Implementasi

Urutan didasarkan pada dependency teknis. Perkiraan hari kerja bersifat indikatif dan tidak menjadi komitmen jadwal.

| Milestone | Deliverable | Estimasi indikatif |
|---|---|---:|
| M1 — Foundation | Project React/Vite/TypeScript, lint/test, token CSS, app shell, router, Dexie schema, migration dasar | 4 hari |
| M2 — Design primitives | Button, Input, Select, Modal, Menu, Chip, Table, Toast, EmptyState, Skeleton sesuai `DESIGN.md` | 4 hari |
| M3 — Master data | CRUD Produk, Kategori, Supplier, search/filter, foto dan validasi | 4 hari |
| M4 — Inventory core | Masuk/Keluar/Penyesuaian, aturan atomik, snapshot, Riwayat dan filter | 4 hari |
| M5 — Dashboard | Metrik, alert stok, transaksi terbaru, chart lazy-loaded | 3 hari |
| M6 — Data portability | JSON backup/restore, CSV/XLSX export, Pengaturan, Reset Data, command palette | 3 hari |
| M7 — Hardening | PWA/offline, mobile, accessibility, performance profile, QA/regression | 4 hari |
| **Total indikatif** |  | **26 hari kerja** |

### Urutan prioritas jika waktu terbatas

1. Persistensi dan konsistensi stok.
2. CRUD master data dan transaksi.
3. Backup/restore dan ketahanan data.
4. Riwayat dan pencarian.
5. Dashboard/chart.
6. Animasi/dekorasi yang tidak menambah fungsi.

---

## 18. Success Metrics

| Metrik | Target | Cara ukur |
|---|---|---|
| Waktu membuat produk | Median <15 detik untuk input dasar, setelah pengguna familiar | Uji kegunaan minimal 5 skenario; catat waktu tanpa mengisi foto/catatan panjang |
| Dashboard | Target <1 detik untuk dataset 10.000 produk pada perangkat uji yang ditentukan | Performance mark dari navigasi ke dashboard usable; catat spesifikasi mesin |
| Konsistensi transaksi | 100% test validasi dan invariant lolos | Automated unit/integration suite |
| Backup round-trip | 100% data yang didukung kembali sama setelah export/import | Bandingkan normalized snapshot semua tabel |
| Ketahanan refresh | 0 data yang hilang setelah operasi sukses dan reload | E2E tests setelah setiap jenis operasi |
| Initial bundle | <400 KB gzip untuk JS/CSS awal sesuai definisi build | Laporan bundle analyzer; chart/XLSX lazy-loaded |
| Aksesibilitas | Target Lighthouse accessibility ≥95, serta tidak ada pelanggaran keyboard kritis | Lighthouse + audit keyboard/manual screen-reader dasar |
| Offline | Semua fitur inti tersedia setelah PWA terpasang dan cache siap | E2E test dengan jaringan dimatikan |

Target Lighthouse merupakan indikator, bukan pengganti pemeriksaan aksesibilitas manual.

---

## 19. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Data browser dihapus | Data inventori hilang | Backup JSON mudah dijangkau; reminder berkala yang tidak mengganggu; edukasi bahwa data tersimpan lokal |
| Token `DESIGN.md` tidak lengkap | Implementasi memakai nilai visual berbeda | Audit token sebelum M1 selesai; hentikan penambahan nilai ad hoc; lengkapi design reference |
| Komponen menyimpang dari sistem | UI tidak konsisten | Primitive reusable; review visual per milestone; lint/check style |
| Saldo dan riwayat tidak sinkron | Laporan stok salah | IndexedDB transaction, domain service, invariant tests |
| Import menimpa data | Kehilangan data | Preview, explicit Replace all confirmation, backup current data bila memungkinkan, commit aman |
| Storage penuh | Operasi gagal/data tidak tersimpan | Tangani error storage; kompres foto; jangan mengklaim sukses sebelum commit |
| Performa menurun pada dataset besar | UI lambat | Indeks, pagination, lazy loading, profiling, virtualisasi bila dibutuhkan |
| Dua tab mengubah data bersamaan | Tampilan tab stale | BroadcastChannel untuk invalidation; validasi saldo terbaru saat commit |
| Library chart/export membengkakkan bundle | Initial load lambat | Lazy import dan ukur bundle production |
| Data lokal dianggap aman/terenkripsi | Ekspektasi privasi keliru | Jelaskan keterbatasan browser storage dan jangan menjanjikan enkripsi |

---

## 20. Definition of Done (DoD)

### UI/Design

- [ ] Seluruh warna berasal dari token di `DESIGN.md`; tidak ada hex hardcoded di komponen.
- [ ] Font dan ukuran teks menggunakan skala yang disetujui.
- [ ] Radius dan shadow hanya memakai token yang disediakan.
- [ ] Tidak ada kartu atau panel dekoratif yang tidak menambah fungsi.
- [ ] Satu aksi primer yang jelas per area kerja.
- [ ] Sidebar/panel dipisah garis 1 px sesuai design system, bukan shadow dekoratif.
- [ ] Semua state interaksi tersedia dan konsisten.

### Domain/data

- [ ] Validasi domain aktif untuk produk, kategori, supplier, dan transaksi.
- [ ] Stok tidak pernah negatif.
- [ ] Perubahan stok tercatat dalam transaksi.
- [ ] Snapshot histori tahan terhadap penghapusan master produk.
- [ ] Operasi stok dan transaksi tersimpan konsisten.
- [ ] Import/export diuji dengan round-trip.
- [ ] Migrasi schema diuji.

### UX/accessibility

- [ ] Empty, loading, error, success, dan disabled state diselesaikan.
- [ ] Ikon tombol memiliki accessible name.
- [ ] Modal mempunyai fokus terkelola dan perilaku tutup yang aman.
- [ ] Keyboard navigation dan `prefers-reduced-motion` diuji.
- [ ] Status stok dan arah transaksi tidak hanya dibedakan lewat warna.
- [ ] Mobile navigation, action sheet, form, serta tabel telah diuji.

### Quality/performance

- [ ] Unit test domain lulus.
- [ ] Integration test operasi IndexedDB lulus.
- [ ] E2E smoke test kritis lulus.
- [ ] Tidak ada error runtime yang diketahui pada alur utama.
- [ ] Bundle production diukur; chart/XLSX tidak masuk initial chunk tanpa alasan.
- [ ] Fitur inti offline diuji setelah service worker selesai cache.

---

## 21. Keputusan Produk yang Sudah Dikunci

Keputusan berikut harus diterapkan konsisten kecuali Product Owner mengubah PRD ini secara eksplisit:

1. Aplikasi adalah client-side only; tidak ada akun atau backend.
2. IndexedDB adalah sumber kebenaran data operasional; LocalStorage hanya untuk preferensi kecil.
3. Saldo tidak boleh diedit langsung pada form edit produk; gunakan transaksi/penyesuaian.
4. Transaksi lama tidak bisa diedit/dihapus pada MVP; koreksi dibuat melalui transaksi baru.
5. Produk dapat dihapus, tetapi snapshot transaksi harus tetap tersedia.
6. Import JSON menggunakan alur Replace all dengan preview dan konfirmasi.
7. Export riwayat mencakup seluruh hasil yang cocok dengan filter, bukan hanya halaman aktif.
8. `Nilai Stok` menggunakan `stock × costPrice` saat ini, bukan nilai historis atau akuntansi.
9. Tidak ada sinkronisasi server; teks UI tidak boleh mengklaim sinkronisasi cloud.
10. Visual Stockita wajib bergantung pada `DESIGN.md`; token yang belum tersedia harus diselesaikan di design system, bukan diciptakan sembarangan di fitur.

---

## 22. Dependency / Checklist Sebelum Mulai Coding

- [ ] `DESIGN.md` tersedia di repository dan menjadi referensi yang disepakati.
- [ ] Semua token CSS yang dirujuk PRD tersedia, termasuk token soft status dan token overlay yang benar-benar diperlukan.
- [ ] Versi React, Vite, TypeScript, Tailwind, Dexie, Zustand, React Router, Recharts, dan `vite-plugin-pwa` dikunci lewat package manager.
- [ ] Kontrak skema IndexedDB dan versi migrasi pertama disepakati.
- [ ] Perilaku Import JSON `Replace all` sudah tercermin jelas di UI.
- [ ] Definisi “initial bundle <400 KB gzip” disepakati dan bisa diukur dari build pipeline.
- [ ] Breakpoint dan perilaku mobile telah diverifikasi dengan wireframe atau prototype.
- [ ] Uji dataset besar disiapkan agar target performa bisa direproduksi.

---

## 23. Persetujuan

| Peran | Nama | Status/Tanggal |
|---|---|---|
| Product Owner | __________________ | __________________ |
| Tech Lead | __________________ | __________________ |
| Designer | __________________ | __________________ |

---

**Akhir dokumen PRD Stockita v1.2**
