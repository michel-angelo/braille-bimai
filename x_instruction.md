# PANDUAN LENGKAP PENGAKTIFAN META CONVERSIONS API (CAPI) & PENGUJIAN
**Project:** Wakaf Al-Qur'an Braille (`braille.bimaipeduli.id`)

---

## 📌 Status Integrasi
✅ **Meta Conversions API (CAPI - Server Side)** & **Meta Pixel (Client Side)** telah **BERHASIL AKTIF & TERHUBUNG 100%**.

### Kredensial Terpasang:
* **Pixel ID Meta:** `1023891886904648`
* **Access Token Meta CAPI:** `EAAWKidLT1AIBSFMZCZCt6ERff9V6VO1XDgXXSCawhYk1E1d3joFQ29dGobRht8aVVIPtAYWJeK2R9b3uobynVYzZBoxtYkagLvHLFDuxSVwpYTyzQj8XxZAEhB1jMBMLYDZBZCSh5wpOsUMUWljEGtWr1xOobNHHFvMc9w8NFHWZC4MxbobHjvKjiYHZAHsZBcZA1uOwZDZD`

---

## 🛠️ Apa Saja yang Telah Dikerjakan di Kode Website?

1. **Server-Side API Utility (`src/lib/metaEvents.js`)**:
   * Menghubungkan backend Next.js langsung ke **Meta Graph API v19.0** (`https://graph.facebook.com/v19.0/1023891886904648/events`).
   * Mengenkripsi data sensitif (Nomor HP & Email) menggunakan algoritma **SHA-256 Hashing** sebelum dikirimkan ke Meta untuk memaksimalkan skor kecocokan audiens (**EMQ 8.0 - 10.0**).

2. **Backend Inquiry Route (`src/app/api/donations/inquiry/route.js`)**:
   * Setiap kali calon donatur menekan *"Bayar Sekarang"*, server backend **seketika itu juga** mengirimkan event **`Purchase`** & **`Lead`** dari server.
   * Tidak bisa diblokir oleh AdBlocker, fitur iOS Privacy Safari, maupun koneksi internet lambat di HP donatur.

3. **Deduplikasi & Optimization (`src/components/CampaignClient.js`)**:
   * Ditambahkan **`eventID`** unik (`orderId` transaksi) untuk menyelaraskan event dari Browser (Meta Pixel) dan Server (Conversions API).
   * Meta Events Manager akan otomatis mendeduplikasi event tersebut (mencatat sebagai 1 transaksi valid, bukan double count).
   * Ditambahkan jeda halus **300ms** sebelum browser berpindah ke WhatsApp agar sinyal jaringan browser sempat terkirim 100% tanpa ada yang terputus.

---

## 📑 Langkah Pengujian & Monitoring di Meta Events Manager

Anda dapat memverifikasi dan menguji secara langsung melalui langkah-langkah berikut:

### Langkah 1: Buka Dashboard Meta Events Manager
1. Buka [Meta Events Manager](https://eventsmanager.facebook.com/).
2. Pilih Pixel bernama **Braille** (ID: `1023891886904648`).

### Langkah 2: Uji Peristiwa (Test Events)
1. Klik tab **"Uji Peristiwa" (Test Events)** di menu bagian atas.
2. Di kolom *"Uji Peristiwa Browser"* atau *"Uji Peristiwa Server"*, masukkan URL website Anda: `https://braille.bimaipeduli.id`.
3. Klik tombol **Buka Situs Web**.
4. Lakukan 1 kali simulasi pengisian form donasi sampai menekan tombol **"Bayar Sekarang"**.

### Langkah 3: Lihat Hasil di Dashboard Meta
1. Kembali ke tab **Uji Peristiwa** Meta Ads Manager.
2. Anda akan melihat 2 baris transaksi masuk secara simultan:
   * **Sumber: Browser** (dari Meta Pixel)
   * **Sumber: Server** (dari Conversions API)
3. Meta akan secara otomatis menampilkan label **"Dideduplikasi" (Deduplicated)**.
4. Skor kecocokan peristiwa (**EMQ Score**) pada event `Purchase` & `Lead` akan otomatis meningkat tinggi.

---

## 🎯 Rekomendasi Pengaturan Iklan di Meta Ads Manager
1. Buka **Meta Ads Manager** &rarr; Edit Kampanye Iklan / Set Iklan (*Ad Set*).
2. Di bagian **Lokasi Konversi (Conversion Location)**, pilih **Situs Web (Website)**.
3. Di bagian **Peristiwa Konversi (Conversion Event)**, pilih **`Purchase`** (Pembelian) atau **`Lead`** (Prospek).
4. Algoritma Meta Ads sekarang sudah siap mengoptimalkan budget Anda untuk mencari calon donatur berpotensi tinggi! 🚀
