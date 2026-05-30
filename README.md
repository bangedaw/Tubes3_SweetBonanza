# Judol Detector - SweetBonanza

Judol Detector adalah Chromium browser extension untuk mendeteksi teks pada halaman web yang mengandung indikasi judi online. Extension membaca text node pada halaman, mencocokkannya dengan keyword dan pola mencurigakan, memberi highlight pada teks yang terdeteksi, menampilkan tooltip, dan menyediakan statistik hasil scan melalui popup.

## Requirement

- Node.js
- npm
- Chromium-based browser seperti Google Chrome, Chromium, Brave, atau Microsoft Edge

Versi yang sudah digunakan saat pengembangan:

```txt
Node.js v26.2.0
npm 11.14.1
```

## Instalasi

Install dependency project:

```bash
npm install
```

## Build

Build extension ke folder `dist/`:

```bash
npm run build
```

Hasil build utama:

```txt
dist/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── tesseract/
│   └── worker.min.js
└── tesseract-core/
    └── tesseract-core*.js/wasm
```

## Load Extension Di Chrome

1. Buka `chrome://extensions/`.
2. Aktifkan Developer Mode.
3. Klik Load unpacked.
4. Pilih folder `dist/`.
5. Buka atau refresh halaman web yang ingin diuji.
6. Klik ikon SweetBonanza Judol Detector untuk membuka popup statistik.

Jika extension baru saja di-reload, refresh tab halaman target agar content script berjalan ulang.

## Cara Penggunaan

1. Buka halaman web yang mengandung teks target, misalnya hasil pencarian berisi `slot`, `gacor`, `MAXWIN234`, atau variasi lain.
2. Extension akan melakukan scan otomatis setelah halaman siap.
3. Teks yang terdeteksi akan diberi highlight merah.
4. Hover highlight untuk melihat tooltip berisi keyword, algoritma, frekuensi, dan waktu eksekusi.
5. Buka popup extension untuk melihat:
   - total keyword ditemukan,
   - metadata scan terakhir,
   - statistik per algoritma,
   - perbandingan frekuensi keyword,
   - toggle OCR gambar,
   - toggle blur teks.

## Fitur Saat Ini

- Build extension dengan Vite.
- Content script berjalan pada halaman web Chromium.
- Highlight teks terdeteksi pada DOM.
- Tooltip custom saat highlight di-hover.
- Popup statistik hasil scan.
- Penyimpanan statistik scan ke `chrome.storage.local`.
- Refresh popup saat data statistik berubah.
- Tombol rescan halaman dari popup.
- Dukungan halaman dinamis melalui MutationObserver.
- Implementasi algoritma bonus Aho-Corasick dan Rabin-Karp.
- OCR gambar dengan Tesseract.js.
- Blur gambar dan teks untuk hasil deteksi.
- Toggle OCR gambar dan blur teks tersimpan di storage.

## Ringkasan Algoritma

Extension menggunakan beberapa pendekatan pencocokan string.

| Algoritma | Fungsi | Sumber Pattern |
|---|---|---|
| Knuth-Morris-Pratt | Exact matching keyword dasar dengan LPS/failure table. | `keywords/keywords.txt` |
| Boyer-Moore | Exact matching alternatif dengan last occurrence table dan shifting dari kanan ke kiri. | `keywords/keywords.txt` |
| RegEx | Mendeteksi pola kata yang langsung diikuti angka, misalnya `SLOT99` atau `MAXWIN234`. | Pattern di source code |
| Weighted Levenshtein | Fuzzy matching untuk variasi manipulatif seperti `H0KI88`, `M4XWIN`, atau `Gαcor999`. | `keywords/keywords.txt` |
| Aho-Corasick | Multi-pattern matching bonus dengan trie dan failure link. | `keywords/keywords.txt` |
| Rabin-Karp | Exact matching bonus berbasis rolling hash. | `keywords/keywords.txt` |
| OCR | Membaca teks pada gambar visible menggunakan Tesseract.js, lalu mencocokkannya dengan keyword. | `keywords/keywords.txt` |

KMP dan Boyer-Moore membaca daftar keyword secara iteratif dari `keywords.txt`. Pada struktur repository ini, file keyword tersebut berada di `keywords/keywords.txt`. RegEx menggunakan regex engine JavaScript sesuai spesifikasi. Weighted Levenshtein memakai bobot substitusi lebih kecil untuk karakter yang mirip secara visual, seperti `o` dengan `0`, `a` dengan `4`, dan `a` dengan `α`. Aho-Corasick dan Rabin-Karp ditambahkan sebagai fitur bonus untuk memperluas perbandingan algoritma pada popup.

## Checklist Spesifikasi

| No | Poin | Ya | Tidak |
|---:|---|:---:|:---:|
| 1 | Extension berhasil di-build dan di-load tanpa kesalahan pada chromium browser dan dikembangkan dengan TypeScript | ✓ |  |
| 2 | KMP dan Boyer-Moore diimplementasikan from scratch | ✓ |  |
| 3 | Regex menghandle format `<kata><angka>` dan berbagai edge case | ✓ |  |
| 4 | Pencarian KMP & BM membaca `keyword.txt` secara iteratif dan tidak menggunakan built-in search function atau library eksternal | ✓ |  |
| 5 | Exact matching dan fuzzy matching berjalan benar | ✓ |  |
| 6 | Elemen DOM terdeteksi diberi highlight dan terhapus saat rescanning | ✓ |  |
| 7 | Tooltip muncul saat hover dengan informasi keyword, algoritma, kemunculan, dan waktu eksekusi | ✓ |  |
| 8 | Popup menampilkan statistik realtime: total keyword, perbandingan, waktu eksekusi, jumlah match | ✓ |  |
| 9 | [Bonus] Membuat Video |  | ✓ |
| 10 | [Bonus] Implementasi Algoritma Aho-Corasick dan Rabin Karp | ✓ |  |
| 11 | [Bonus] Implementasi Censorship / Blur Teks | ✓ |  |
| 12 | [Bonus] Implementasi Optical Character Recognition pada Gambar | ✓ |  |

## Struktur Project

```txt
Tubes3_SweetBonanza/
├── dist/                 # hasil build extension
├── keywords/             # daftar keyword deteksi
├── public/               # manifest extension
├── scripts/              # script build
├── src/
│   ├── algorithms/       # implementasi pattern matching
│   ├── extension/        # background, content script, popup
│   ├── storage/          # helper storage statistik dan pengaturan
│   └── types/            # tipe data shared
├── package.json
├── popup.html
├── tsconfig.json
└── vite.config.mjs
```

## Known Limitation

- OCR gambar membutuhkan waktu lebih lama dibanding scan teks dan hasilnya bergantung pada kualitas gambar.
- Beberapa gambar cross-origin, thumbnail terlalu kecil, atau teks dekoratif dapat gagal dibaca OCR.

## Troubleshooting

- Jika highlight tidak muncul, reload extension lalu refresh halaman target.
- Jika popup belum menampilkan statistik terbaru, tutup dan buka kembali popup setelah halaman selesai discan.
- Jika extension gagal di-load, jalankan ulang `npm run build` dan pastikan folder `dist/` yang dipilih.
- Jika ada error, buka DevTools halaman target dan cek console untuk error dari `content.js`.

## Author

Kelompok SweetBonanza.

| NIM | Nama | Pembagian Tugas |
|:---:|:---|:---|
| 13524036 | Edward David Rumahorbo | Implementasi OCR, Popup dan Statistik, Dokumentasi pada README |
| 13524066 | Nathanael Gunawan | Implementasi algoritma KMP, Boyer-Moore, Regex, Weighted Levenshtein Distance |
| 13524102 | Manuel Thimoty Silalahi | Implementasi Manifest, DOM Walker, Integrasi Algoritma, dan Implementasi Algoritma Bonus |
