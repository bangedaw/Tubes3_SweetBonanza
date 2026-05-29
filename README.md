# Tubes3_SweetBonanza

Judol Detector adalah Chromium browser extension untuk mendeteksi teks pada halaman web yang mengandung indikasi judi online. Extension membaca text node pada halaman, mencocokkannya dengan keyword dan pola mencurigakan, memberi highlight pada teks yang terdeteksi, menampilkan tooltip, dan menyediakan statistik hasil scan melalui popup.

## Requirement

- Node.js
- npm
- Chromium-based browser seperti Google Chrome, Chromium, Brave, atau Microsoft Edge

Versi yang sudah digunakan saat pengembangan:

```bash
node --version
npm --version
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
└── popup.js
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

KMP dan Boyer-Moore membaca daftar keyword secara iteratif dari `keywords.txt`. RegEx menggunakan regex engine JavaScript sesuai spesifikasi. Weighted Levenshtein memakai bobot substitusi lebih kecil untuk karakter yang mirip secara visual, seperti `o` dengan `0`, `a` dengan `4`, dan `a` dengan `α`.

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
- `npm test` masih berupa placeholder; verifikasi utama dilakukan lewat build dan uji manual di browser.

## Troubleshooting

- Jika highlight tidak muncul, reload extension lalu refresh halaman target.
- Jika popup belum menampilkan statistik terbaru, tutup dan buka kembali popup setelah halaman selesai discan.
- Jika extension gagal di-load, jalankan ulang `npm run build` dan pastikan folder `dist/` yang dipilih.
- Jika ada error, buka DevTools halaman target dan cek console untuk error dari `content.js`.

## Author

Kelompok SweetBonanza.
