# Panduan Konfigurasi & Setup Mandiri (Duitku & Supabase)

Berkas ini berisi daftar langkah yang perlu Anda lakukan untuk mengonfigurasi **Duitku Payment Gateway** dan **Supabase Database** agar integrasi sistem donasi berjalan dengan lancar setelah migrasi Next.js selesai dilakukan oleh AI.

---

## Langkah 1: Setup Database di Supabase

1. Masuk ke [Supabase Dashboard](https://supabase.com) dan buka proyek Anda.
2. Di menu sidebar sebelah kiri, klik **SQL Editor**.
3. Klik **New Query**, kemudian salin dan tempel skrip SQL berikut:

```sql
-- 1. Hapus tabel lama jika ada untuk menghindari konflik
drop table if exists donations;

-- 2. Buat tabel baru dengan kolom terstandarisasi untuk Duitku
create table donations (
  id bigint generated always as identity primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  merchant_order_id text not null unique, -- ID Transaksi unik (misal: BIMAI-XXXXXXXX)
  donor_name text not null,               -- Nama Donatur
  phone text not null,                    -- Nomor WhatsApp (Sensitif)
  wakif_name text,                        -- Nama Wakif
  amount bigint not null,                 -- Nominal Donasi
  niat text,                              -- Niat/Doa khusus
  payment_method text not null,           -- Kode metode bayar (misal: DQ untuk QRIS)
  status_payment text default 'pending'::text, -- 'pending', 'success', 'expired'
  payment_reference text,                 -- Referensi transaksi dari Duitku
  payment_code text                       -- Kode Virtual Account / raw QRIS string dari Duitku
);

-- 3. Aktifkan Row Level Security (RLS) demi keamanan data pribadi
alter table donations enable row level security;

-- 4. Matikan akses REST API publik langsung di sisi klien
-- Semua pembacaan dan penulisan akan ditangani secara aman dari server Next.js (Service Role)
create policy "Matikan baca publik langsung" on donations for select using (false);
create policy "Matikan tulis publik langsung" on donations for insert with check (false);
```

4. Klik tombol **Run** di pojok kanan bawah untuk mengeksekusi perintah. Tabel `donations` siap digunakan.

---

## Langkah 2: Dapatkan API Keys Supabase & Duitku

Anda perlu mengambil kunci-kunci kredensial berikut untuk dimasukkan ke konfigurasi server Next.js:

### A. Kredensial Supabase
1. Di Supabase Dashboard, masuk ke menu **Project Settings** (ikon gerigi di kiri bawah) -> **API**.
2. Salin nilai berikut:
   - **Project URL** (misal: `https://xxxxxx.supabase.co`)
   - **`service_role` key** (Klik tombol *Reveal* terlebih dahulu untuk menampilkan kuncinya. **PENTING**: Kunci ini bersifat rahasia, jangan pernah dibagikan ke orang lain atau dipasang di script HTML biasa).
   - **`anon` public key** (Kunci publik standard).

### B. Kredensial Duitku
1. Masuk ke portal Merchant Duitku (baik [Sandbox/Testing](https://sandbox.duitku.com) atau [Production](https://passport.duitku.com)).
2. Masuk ke menu **Metode Pembayaran** atau **Pengaturan Proyek**.
3. Salin nilai berikut:
   - **Merchant Code** (Kode Merchant Anda)
   - **Merchant Key / API Key** (Kunci API rahasia Anda)

---

## Langkah 3: Konfigurasi Berkas `.env.local`

1. Buat berkas baru bernama `.env.local` di direktori utama proyek Anda (`braille-bimai/`).
2. Masukkan kredensial yang sudah Anda salin di Langkah 2 dengan format seperti di bawah ini:

```env
# Kredensial Supabase (Server-side)
NEXT_PUBLIC_SUPABASE_URL=https://ganti-dengan-project-url-anda.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ganti-dengan-anon-key-anda
SUPABASE_SERVICE_ROLE_KEY=ganti-dengan-service-role-key-anda

# Kredensial Duitku (Server-side)
DUITKU_MERCHANT_CODE=ganti-dengan-merchant-code-anda
DUITKU_MERCHANT_KEY=ganti-dengan-merchant-key-anda
DUITKU_ENVIRONMENT=sandbox  # Ubah menjadi 'production' jika sudah live/siap pakai
DUITKU_CALLBACK_URL=https://domain-anda.com/api/payment-callback
```

---

## Langkah 4: Setup Callback URL di Portal Duitku

Agar status pembayaran otomatis berubah dari `pending` ke `success` saat donatur selesai membayar, Anda harus mendaftarkan URL callback di portal merchant Duitku Anda:

1. Masuk ke Portal Merchant Duitku.
2. Masuk ke bagian pengaturan proyek/toko Anda.
3. Isi kolom **Callback URL** dengan alamat endpoint webhook callback Anda, contoh:
   - Sandbox/Testing lokal: `https://domain-anda.com/api/payment-callback` (Jika testing di komputer lokal, Anda bisa menggunakan bantuan tool seperti Ngrok untuk mem-forward port Next.js ke URL publik).
   - Server Production: `https://namawebsiteanda.com/api/payment-callback`

---

*Catatan: Pihak AI saat ini sedang memproses migrasi struktur halaman, styling CSS, dan penulisan API Route Duitku pada kode proyek Next.js Anda. Berkas instruksi ini dapat Anda jadikan checklist setelah AI selesai melakukan tugasnya.*
