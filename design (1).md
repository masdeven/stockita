# DESIGN.md — Referensi Desain UI (Gaya "Terminal Terang": Compact, Soft, Tiny)

Dokumen ini adalah acuan tunggal untuk AI/developer saat membangun UI. Semua warna, tombol, teks, modal, sidebar, dan komponen WAJIB mengambil nilai dari token di dokumen ini, bukan nilai acak.

Inspirasi: antarmuka platform chart/trading bertema terang. Karakternya: padat informasi, font kecil tapi tajam, radius lembut, garis tipis, warna netral dengan satu aksen biru, dan warna semantik hijau/merah hanya untuk makna (naik/turun, sukses/bahaya).

---

## 1. Prinsip Desain

1. **Tiny & compact**: ukuran font kecil (11–14px), kontrol pendek (28–40px), padding hemat. Kepadatan tinggi tapi tetap lega lewat whitespace yang konsisten.
2. **Soft, bukan blocky**: radius membulat (6–12px), tanpa blok warna besar, tanpa border tebal. Pemisah memakai garis 1px tipis atau jarak kosong.
3. **Netral dulu, aksen belakangan**: 90% UI putih, abu, dan hitam. Biru hanya untuk aksi utama/fokus/link. Hijau dan merah hanya untuk makna data.
4. **Hierarki lewat bobot & warna teks**, bukan lewat ukuran besar. Judul cukup 600 weight dan satu tingkat lebih besar.
5. **Flat**: bayangan hanya untuk elemen melayang (modal, dropdown, tooltip). Panel dan kartu di halaman tanpa bayangan.
6. **Ikon outline tipis** (stroke 1.5px), konsisten, tanpa ikon berwarna kecuali status.
7. **Hover & aktif selalu halus**: perubahan latar abu sangat muda, tanpa animasi mencolok.

---

## 2. Design Tokens

### 2.1 Warna — Light Theme (utama)

```css
:root {
  /* Surface */
  --bg-app:            #FFFFFF;  /* latar utama halaman/chart */
  --bg-panel:          #FFFFFF;  /* sidebar, panel, modal */
  --bg-subtle:         #F8F9FD;  /* area sekunder, header tabel, input disabled */
  --bg-hover:          #F0F3FA;  /* hover baris/menu/ikon */
  --bg-selected:       #E8ECF4;  /* item terpilih di menu/list */
  --bg-overlay:        rgba(19, 23, 34, 0.40); /* backdrop modal */

  /* Border */
  --border-default:    #E0E3EB;  /* garis pemisah, border input */
  --border-subtle:     #F0F3FA;  /* grid, pemisah sangat halus */
  --border-strong:     #B2B5BE;  /* border input saat hover */
  --border-focus:      #2962FF;  /* fokus input */

  /* Text */
  --text-primary:      #131722;  /* judul, nilai penting */
  --text-secondary:    #434651;  /* label isi, menu */
  --text-tertiary:     #787B86;  /* caption, placeholder, header kolom */
  --text-disabled:     #B2B5BE;
  --text-on-accent:    #FFFFFF;
  --text-link:         #2962FF;

  /* Brand / Accent */
  --accent:            #2962FF;  /* aksi utama, fokus, link */
  --accent-hover:      #1E53E5;
  --accent-active:     #1848CC;
  --accent-soft:       #E3EBFF;  /* latar badge/chip aksen */

  /* Tombol hitam (CTA premium, seperti "Upgrade") */
  --cta-dark:          #131722;
  --cta-dark-hover:    #2A2E39;

  /* Semantik */
  --positive:          #089981;  /* naik, sukses, profit (hijau-teal) */
  --positive-soft:     #E0F5F1;
  --negative:          #F23645;  /* turun, error, loss */
  --negative-soft:     #FDE8EA;
  --warning:           #FF9800;
  --warning-soft:      #FFF1DB;
  --info:              #2962FF;
  --info-soft:         #E3EBFF;

  /* Kartu informasi lembut (mis. kartu berita) */
  --card-lavender:     #EFEAFF;
  --card-lavender-text:#3B2F7A;

  /* Badge notifikasi */
  --badge-bg:          #F23645;
  --badge-text:        #FFFFFF;
}
```

**Fungsi warna (aturan baku):**

| Peran | Token | Dipakai untuk |
|---|---|---|
| Aksi utama | `--accent` | Tombol primer, link, fokus, tab aktif, toggle aktif |
| CTA premium | `--cta-dark` | Satu tombol penegas di top bar (mis. Upgrade/Pro) |
| Naik/Sukses | `--positive` | Angka naik, status berhasil, label harga bullish |
| Turun/Bahaya | `--negative` | Angka turun, error, hapus, badge notifikasi |
| Teks | `--text-primary/secondary/tertiary` | Tiga tingkat saja, jangan tambah tingkat baru |
| Garis | `--border-default/subtle` | Pemisah dan border; tidak lebih tebal dari 1px |

### 2.2 Warna — Dark Theme (opsional)

```css
[data-theme="dark"] {
  --bg-app:#131722; --bg-panel:#1E222D; --bg-subtle:#171B26;
  --bg-hover:#2A2E39; --bg-selected:#363A45; --bg-overlay:rgba(0,0,0,.6);
  --border-default:#363A45; --border-subtle:#2A2E39; --border-strong:#50535E;
  --text-primary:#D1D4DC; --text-secondary:#B2B5BE; --text-tertiary:#787B86;
  --accent:#2962FF; --accent-soft:#1B2A5E;
  --cta-dark:#FFFFFF; --cta-dark-hover:#D1D4DC;
  --positive:#26A69A; --negative:#EF5350;
  --positive-soft:#12332F; --negative-soft:#3A1A1D;
  --card-lavender:#2B2650; --card-lavender-text:#CFC6FF;
}
```

### 2.3 Tipografi

```css
:root {
  --font-sans: -apple-system, BlinkMacSystemFont, "Trebuchet MS", Roboto, Ubuntu, "Helvetica Neue", Arial, sans-serif;
  --font-mono: "SF Mono", Menlo, Consolas, "Roboto Mono", monospace; /* angka tabular opsional */
}
```

Gunakan `font-variant-numeric: tabular-nums;` untuk semua angka (harga, persentase, tabel) agar rata kanan rapi.

| Token | Ukuran / Line-height | Weight | Warna | Pemakaian |
|---|---|---|---|---|
| `display` | 28px / 36px | 600 | primary | Angka harga/nilai utama |
| `title-modal` | 20px / 28px | 600 | primary | Judul modal |
| `title-section` | 16px / 24px | 600 | primary | Judul panel/section |
| `body` | 14px / 20px | 400 | secondary | Isi menu, input, paragraf |
| `body-strong` | 14px / 20px | 600 | primary | Item terpilih, nama penting |
| `data` | 13px / 18px | 400–500 | primary | Baris daftar/tabel, simbol |
| `caption` | 12px / 16px | 400 | tertiary | Meta, label key-value, sub-info |
| `overline` | 11px / 16px | 500 | tertiary | Header grup (HURUF KAPITAL, letter-spacing 0.04em) |

Aturan: maksimal 3 ukuran berbeda pada satu layar kerja biasa. Jangan pakai weight 700+ kecuali angka `display`. Tidak ada teks di bawah 11px.

### 2.4 Spacing (skala 4px)

`--space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px; --space-5:20px; --space-6:24px; --space-8:32px;`

- Jarak ikon ke teks: 12px
- Padding horizontal panel: 16px
- Padding modal: 20–24px
- Jarak antar section: 24px
- Jarak antar kontrol dalam toolbar: 4–8px

### 2.5 Radius

`--radius-xs:4px` (tag kecil, tooltip) · `--radius-sm:6px` (tombol kecil, ikon tombol) · `--radius-md:8px` (input, tombol, item menu) · `--radius-lg:12px` (modal, kartu, dropdown) · `--radius-full:999px` (badge, pill, CTA bulat)

### 2.6 Bayangan (hanya untuk elemen melayang)

```css
--shadow-popover: 0 2px 8px rgba(19,23,34,0.12), 0 0 0 1px rgba(19,23,34,0.04);
--shadow-modal:   0 12px 40px rgba(19,23,34,0.18), 0 0 0 1px rgba(19,23,34,0.04);
```

### 2.7 Motion

`--ease: cubic-bezier(.2,.0,.2,1); --dur-fast:100ms; --dur-base:160ms; --dur-modal:200ms;`
Hover/warna: 100ms. Modal: fade + naik 8px, 200ms. Hindari bounce, spring, dan animasi panjang.

### 2.8 Ukuran Ikon

Ikon standar 20px (area klik 28–36px). Ikon kecil di dalam teks/baris 16px. Stroke 1.5px, warna `--text-secondary`; aktif `--text-primary` atau `--accent`.

---

## 3. Layout Aplikasi (Shell)

```
┌──────────────────────────────────────────────────────────────┬────┐
│ TOP BAR (tinggi 40px)                                         │    │
├────┬───────────────────────────────────────────────┬─────────┤ R  │
│ L  │                                               │ PANEL   │ A  │
│ E  │            AREA KERJA UTAMA                   │ KANAN   │ I  │
│ F  │            (chart / konten)                   │ 290px   │ L  │
│ T  │                                               │         │    │
│ 52 │                                               │         │ 40 │
├────┴───────────────────────────────────────────────┴─────────┴────┤
│ BOTTOM BAR (tinggi 36px): rentang waktu, zona waktu, pengaturan   │
└──────────────────────────────────────────────────────────────────┘
```

| Bagian | Ukuran | Latar | Border |
|---|---|---|---|
| Top bar | tinggi 40px | `--bg-panel` | bawah 1px `--border-default` |
| Sidebar kiri (toolbar ikon) | lebar 52px | `--bg-panel` | kanan 1px `--border-default` |
| Panel kanan | lebar 290–320px | `--bg-panel` | kiri 1px `--border-default` |
| Rail ikon kanan | lebar 40px | `--bg-panel` | kiri 1px `--border-default` |
| Bottom bar | tinggi 36px | `--bg-panel` | atas 1px `--border-default` |

Area kerja utama berlatar `--bg-app`. Semua panel berdampingan dengan satu garis 1px, tanpa jarak/gap dan tanpa bayangan.

---

## 4. Komponen

### 4.1 Tombol

Tinggi: `sm` 28px · `md` 32px · `lg` 40px. Font 13–14px, weight 500–600. Padding horizontal 12–16px. Radius `--radius-md` (CTA pill: `--radius-full`).

| Varian | Latar | Teks | Border | Hover | Aktif |
|---|---|---|---|---|---|
| **Primary** | `--accent` | putih | – | `--accent-hover` | `--accent-active` |
| **CTA Dark** (pill) | `--cta-dark` | putih | – | `--cta-dark-hover` | sedikit lebih gelap |
| **Secondary (outline)** | `--bg-panel` | `--text-primary` | 1px `--border-default` | latar `--bg-hover` | latar `--bg-selected` |
| **Ghost** | transparan | `--text-secondary` | – | latar `--bg-hover` | latar `--bg-selected` |
| **Danger** | `--negative` | putih | – | 90% opasitas | 80% opasitas |
| **Disabled** | `--bg-subtle` | `--text-disabled` | – | tanpa efek | – |

Aturan: satu tombol primer per area. Fokus keyboard: ring 2px `--accent` dengan offset 2px. Tombol berikon + teks: ikon 18px, jarak 8px.

**Icon button** (toolbar): kotak 32×32px (sidebar kiri 36×36px), radius `--radius-sm`, ikon 20px, hover latar `--bg-hover`, aktif latar `--bg-selected` atau ikon `--accent`.

### 4.2 Input & Search

- Tinggi 40px (modal) atau 32px (padat). Radius `--radius-md`. Border 1px `--border-default`. Latar `--bg-panel`.
- Teks 14px `--text-primary`; placeholder `--text-tertiary`.
- Ikon pencarian 20px di kiri (padding kiri 12px, jarak ikon–teks 8px).
- Hover: border `--border-strong`. Fokus: border 1px `--border-focus` + ring halus `0 0 0 3px rgba(41,98,255,.15)`.
- Error: border `--negative`, pesan 12px `--negative` di bawah input (jarak 4px).
- Disabled: latar `--bg-subtle`, teks `--text-disabled`.

### 4.3 Modal / Dialog

```
┌─────────────────────────────────────────────┐
│ Judul modal (20px/600)                    ✕ │  padding 20–24px
│ ┌─────────────────────────────────────────┐ │
│ │ 🔍 Search                               │ │  input 40px
│ └─────────────────────────────────────────┘ │
│ ┌──────────────┬──────────────────────────┐ │
│ │ MENU KIRI    │ KONTEN KANAN             │ │  2 kolom bila perlu
│ └──────────────┴──────────────────────────┘ │
└─────────────────────────────────────────────┘
```

- Latar `--bg-panel`, radius `--radius-lg` (12px), bayangan `--shadow-modal`, backdrop `--bg-overlay`.
- Lebar: kecil 400px · sedang 560px · besar 840px (maks 90vw). Tinggi maks 85vh, konten scroll di dalam.
- Posisi: tengah horizontal, sedikit di atas tengah vertikal (sekitar 12vh dari atas).
- Judul 20px/600 di kiri, tombol tutup (icon button 32px, ikon ✕ 20px) di kanan atas.
- Tanpa garis pemisah di bawah judul; pisahkan dengan jarak 16px.
- Untuk modal berbentuk dialog aksi: tombol di kanan bawah, urutan [Secondary] [Primary], jarak 8px, padding atas 20px.
- Esc dan klik backdrop menutup (kecuali dialog destruktif).
- Animasi: fade + translateY(8px→0), 200ms.

### 4.4 Menu List (navigasi dalam modal / dropdown)

- Item tinggi 40px, padding horizontal 12px, radius `--radius-md`.
- Ikon 20px (`--text-secondary`) + jarak 12px + label 14px.
- Normal: transparan. Hover: `--bg-hover`. Terpilih: `--bg-selected` + label `--text-primary` weight 600.
- **Header grup**: gaya `overline` (11px, kapital, `--text-tertiary`), padding 12px 12px 6px, jarak antar grup 16px.
- Item hasil di panel kanan (daftar bernama) memakai tinggi 32px, 14px, ikon bintang/aksi di kiri; hover `--bg-hover`.

### 4.5 Dropdown / Popover / Context Menu

Latar `--bg-panel`, radius `--radius-lg`, bayangan `--shadow-popover`, padding 4px, item tinggi 32–36px, teks 13–14px. Pemisah antar grup: garis 1px `--border-subtle` dengan margin 4px 0. Maks tinggi 320px lalu scroll.

### 4.6 Tabs & Segmented Control

- **Timeframe/toolbar pill**: teks 13px, tinggi 28px, padding 0 8px, radius `--radius-sm`. Normal `--text-secondary`; hover `--bg-hover`; aktif latar `--bg-selected` + teks `--text-primary` weight 600 (atau teks `--accent`).
- **Tabs garis bawah**: tinggi 40px, teks 14px; aktif teks `--text-primary` + garis bawah 2px `--accent`; nonaktif `--text-tertiary`.

### 4.7 Sidebar Kiri (toolbar vertikal)

- Lebar 52px, ikon dalam kotak 36×36px, jarak vertikal 4px, ikon 20px.
- Dikelompokkan dengan pemisah horizontal 1px `--border-subtle` (lebar 28px, di tengah) dengan margin 8px.
- Item aktif: latar `--bg-selected`, ikon `--text-primary`; hover `--bg-hover`.
- Tooltip muncul di kanan setelah 400ms (lihat 4.12).
- Elemen "hapus/trash" ditempatkan di akhir grup bawah.

### 4.8 Panel Kanan (Widget Panel)

- **Header panel**: tinggi 40px, padding 0 16px. Judul 14px/600 + panah dropdown kecil; aksi (tambah, layout, menu ⋯) berupa icon button 28px di kanan.
- **Header kolom tabel**: 12px, `--text-tertiary`, tinggi 32px, border bawah 1px `--border-subtle`, kolom angka rata kanan.
- **Pemisah grup** ("SAHAM (STOCK)"): `overline` 11px, dengan caret kolaps di kiri, tinggi 28px.
- **Baris daftar**: tinggi 30–32px, padding 0 16px, teks 13px. Simbol weight 500 `--text-primary`; harga `--text-primary` rata kanan; perubahan: `--positive` jika naik, `--negative` jika turun, `--text-tertiary` jika 0. Hover `--bg-hover`; terpilih `--bg-selected`.
- **Logo simbol**: lingkaran 18px sebelum nama (jarak 8px).
- **Bagian detail** (di bawah daftar): dipisah garis 1px; nama ticker 14px/600, sub-info 12px `--text-tertiary`, harga `display` 28px/600, perubahan 14px/600 berwarna semantik, status ("Market open") 12px dengan titik 6px berwarna `--positive`.
- **Key stats**: baris 2 kolom, label 12–13px `--text-secondary` kiri, nilai 13px/600 `--text-primary` kanan, tinggi baris 24px.

### 4.9 Rail Ikon Kanan

Lebar 40px, ikon 20px dalam kotak 32px, jarak 8px. Item aktif ditandai latar `--bg-selected`. Tombol penting di bawah (mis. grid aplikasi) boleh memakai bulatan hitam `--cta-dark` 32px dengan ikon putih. Ikon bantuan (?) di paling bawah.

### 4.10 Kartu & Banner Informasi

- Kartu berita/info: latar `--card-lavender`, radius `--radius-lg`, padding 12px, tanpa border.
- Label atas 12px/600 (mis. "News · Sep 25"), judul 13px/500 `--card-lavender-text`, aksi kecil ("More events ›") 12px `--text-tertiary`.
- Kartu netral: latar `--bg-panel`, border 1px `--border-default`, radius `--radius-lg`, padding 16px, tanpa bayangan.

### 4.11 Badge, Chip, Label Harga

- **Badge notifikasi**: lingkaran 16–18px, latar `--badge-bg`, teks 10–11px/600 putih, diletakkan menempel di pojok kanan atas avatar/ikon.
- **Chip/tag**: tinggi 20–24px, radius `--radius-full`, teks 12px/500. Variasi: aksen (`--accent-soft` + teks `--accent`), positif, negatif, warning, netral (`--bg-subtle` + `--text-secondary`).
- **Label harga pada sumbu chart**: kotak radius 4px, tinggi 18px, teks 12px/600 putih, latar `--positive` (harga naik) atau `--negative` (turun) atau `--cta-dark` (nilai referensi). Subteks (mis. hitung mundur) pada baris kedua dengan ukuran sama.

### 4.12 Tooltip

Latar `--cta-dark`, teks putih 12px, padding 6px 8px, radius `--radius-xs`, tanpa panah besar, muncul setelah 400ms, hilang 100ms. Maks lebar 240px.

### 4.13 Toggle, Checkbox, Radio

- Toggle: 32×18px, radius penuh; mati `--border-strong`, hidup `--accent`; knob putih 14px.
- Checkbox: 16px, radius 4px, border 1.5px `--border-strong`; checked latar `--accent` dengan centang putih.
- Radio: 16px bulat, titik tengah 8px `--accent` saat aktif.

### 4.14 Tabel Data

Header 12px/500 `--text-tertiary` pada latar `--bg-subtle`, tinggi 32px. Baris 36px (padat 30px), teks 13px, garis pemisah `--border-subtle`. Angka rata kanan + `tabular-nums`. Hover baris `--bg-hover`. Tanpa zebra stripe dan tanpa border vertikal.

### 4.15 Toast / Notifikasi

Latar `--cta-dark`, teks putih 13px, radius `--radius-lg`, padding 12px 16px, bayangan `--shadow-popover`, muncul di kanan bawah, hilang otomatis 4 detik. Varian sukses/error memakai titik/ikon 8–16px berwarna `--positive`/`--negative` di kiri.

### 4.16 Scrollbar

Tipis 6–8px, thumb `--border-strong` radius penuh, track transparan, thumb lebih gelap saat hover. Hanya tampil saat hover/scroll jika memungkinkan.

### 4.17 Empty State & Skeleton

Empty state: ikon 32px `--text-disabled`, judul 14px/600, deskripsi 13px `--text-tertiary`, satu tombol secondary. Skeleton: blok `--bg-subtle` radius `--radius-sm` dengan shimmer lembut 1.2s.

---

## 5. Visualisasi Data (Chart)

- Latar chart putih; grid garis 1px `--border-subtle`, hanya horizontal dan vertikal tipis.
- Candle/bar naik `--positive`, turun `--negative` (isi sama dengan garis; wick 1px).
- Garis harga terakhir: putus-putus 1px; label harga di sumbu kanan (lihat 4.11).
- Label sumbu 11–12px `--text-secondary`; legenda di pojok kiri atas 12px dengan nilai OHLC berwarna semantik.
- Indikator/overlay: gunakan palet berurutan `#2962FF, #FF9800, #9C27B0, #00BCD4, #F23645, #089981`; ketebalan garis 1–2px.
- Panel indikator di bawah dipisah garis 1px dan diberi nama kecil abu di pojok kiri atas.

---

## 6. Interaksi & State

| State | Aturan |
|---|---|
| Hover | latar `--bg-hover`, transisi 100ms |
| Pressed | latar `--bg-selected` |
| Selected | latar `--bg-selected` + teks/ikon lebih gelap |
| Focus-visible | ring 2px `--accent`, offset 2px |
| Disabled | teks `--text-disabled`, tanpa hover, kursor default |
| Loading | spinner 16px `--text-tertiary` di dalam tombol, label tetap |
| Error | border/teks `--negative`, pesan di bawah elemen |

Target klik minimal: 28px (desktop padat), 44px (layar sentuh).

---

## 7. Aksesibilitas

- Kontras teks `--text-primary` pada putih ≈ 17:1; `--text-tertiary` hanya untuk info sekunder (≥ 12px).
- Jangan mengandalkan warna saja untuk naik/turun: sertakan tanda +/− atau panah.
- Semua ikon-tombol wajib punya `aria-label` dan tooltip.
- Modal: kunci fokus di dalam, kembalikan fokus ke pemicu saat ditutup.
- Hormati `prefers-reduced-motion`: matikan transisi modal dan shimmer.

---

## 8. Adaptasi Mobile / Responsif

- < 768px: sidebar kiri dan rail kanan berubah menjadi **bottom navigation** (tinggi 56px, ikon 24px + label 11px) atau drawer.
- Panel kanan menjadi bottom sheet (radius atas 16px, handle 4×32px `--border-strong`).
- Modal besar menjadi layar penuh dengan header sticky 48px; modal kecil menjadi bottom sheet.
- Tinggi kontrol naik ke 40–44px; font isi naik ke 14–16px; tetap pertahankan radius, warna, dan hierarki yang sama.
- Padding horizontal halaman 16px, jarak antar section 20–24px.

---

## 9. Do & Don't

**Do**
- Gunakan token, jangan hardcode warna/ukuran.
- Pisahkan area dengan garis 1px dan whitespace.
- Pakai hijau/merah hanya untuk data naik/turun atau sukses/gagal.
- Rata kanan untuk angka; rata kiri untuk teks.
- Satu aksi primer per area; sisanya outline/ghost.

**Don't**
- Jangan pakai blok warna besar, border tebal, atau bayangan pada kartu halaman.
- Jangan campur lebih dari satu warna aksen.
- Jangan pakai radius > 12px kecuali pill/badge (dan bottom sheet mobile).
- Jangan pakai font di bawah 11px atau weight 700+ selain angka `display`.
- Jangan pakai gradien dan efek glassmorphism.
- Jangan menambah tingkat warna teks di luar tiga tingkat.

---

## 10. Checklist untuk AI Sebelum Mengirim Hasil

- [ ] Semua warna berasal dari token `:root`.
- [ ] Font hanya dari skala tipografi; angka memakai `tabular-nums`.
- [ ] Radius hanya `4/6/8/12/999`.
- [ ] Hanya satu tombol primer pada area yang sama.
- [ ] Modal: radius 12, bayangan modal, judul 20/600, tombol tutup kanan atas, backdrop gelap 40%.
- [ ] Sidebar/panel dipisah garis 1px, bukan bayangan.
- [ ] State hover, selected, focus, disabled sudah didefinisikan di setiap komponen interaktif.
- [ ] Naik/turun berwarna hijau/merah dan disertai tanda +/−.
- [ ] Tampilan mobile diuji (bottom nav, bottom sheet).
- [ ] Jika ada elemen baru yang belum ada di dokumen ini, turunkan gayanya dari komponen terdekat; jangan mengarang gaya baru.
