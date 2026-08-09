# 🚀 DEPLOYMENT & PWA INSTALLATION GUIDE (DEPLOY.md)
> **Aplikasi: KRTrade by Filla Calon Wong Sugih 9 Naga**  
> *Versi Aplikasi: BETA Version 0.0.0.1*  
> *Panduan Resmi Manual Deployment Vercel & Instalasi Cross-Platform (Laptop, PC, Android, iOS)*

---

## 📌 OVERVIEW
Dokumen ini berisi panduan langkah demi langkah bagi Anda untuk mendeploy aplikasi **KRTrade** secara manual ke **Vercel**, mengonfigurasi database **Supabase PostgreSQL & Auth** di server produksi, serta menjadikan aplikasi ini sebagai **Progressive Web App (PWA)** yang dapat diinstal langsung di perangkat **Laptop/PC (Windows/Mac), Android, dan iOS (iPhone/iPad)**.

---

## 🌐 1. PANDUAN MANUAL DEPLOY KE VERCEL

### Langkah 1: Push Project ke GitHub / GitLab / Bitbucket
1. Buka Terminal / PowerShell di folder project (`d:\laragon\www\krtrade`).
2. Inisialisasi Git repository (jika belum):
   ```bash
   git init
   ```
3. Tambahkan semua file dan buat commit awal:
   ```bash
   git add .
   git commit -m "feat: Initial release KRTrade BETA Version 0.0.0.1"
   ```
4. Buat Repository baru di akun [GitHub](https://github.com/new) Anda (misal nama repo: `krtrade-pwa`).
5. Hubungkan repo lokal dengan GitHub dan push kode:
   ```bash
   git remote add origin https://github.com/USERNAME/krtrade-pwa.git
   git branch -M main
   git push -u origin main
   ```

---

### Langkah 2: Import & Config Project di Vercel Dashboard
1. Buka [Vercel Dashboard](https://vercel.com/dashboard) dan Login ke akun Vercel Anda.
2. Klik tombol **"Add New..."** $\rightarrow$ Pilih **"Project"**.
3. Pilih repository `krtrade-pwa` dari daftar GitHub Anda $\rightarrow$ Klik **"Import"**.
4. Di halaman **Configure Project**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./` (Default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (Default)

---

### Langkah 3: Konfigurasi Environment Variables di Vercel
Sebelum menekan tombol Deploy, buka section **Environment Variables** di halaman konfigurasi Vercel, lalu tambahkan 2 kunci dari file `.env.local` Anda:

| Key (Nama Variable) | Value (Nilai) |
| :--- | :--- |
| **`NEXT_PUBLIC_SUPABASE_URL`** | `https://afvhfvjyrfmsfvpnmtrd.supabase.co` |
| **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** | `sb_publishable_-740rnqaU7ebCWs8NGQvYA_QnRST06K` |

> *Catatan: Jika Anda menggunakan akun Supabase pribadi Anda sendiri, masukkan URL dan Anon Key dari Supabase Dashboard Anda.*

5. Klik **"Deploy"** dan tunggu proses kompilasi Vercel selesai ($\approx 1 - 2$ menit).
6. Setelah selesai, Anda akan mendapatkan URL Domain Publik resmi aplikasi Anda, contoh:  
   👉 **`https://krtrade-pwa.vercel.app`**

---

### Langkah 4: Update Production Redirect URL di Supabase Dashboard
Agar fitur Autentikasi Supabase dan Google OAuth dapat berjalan lancar di domain Vercel:
1. Buka [Supabase Dashboard](https://supabase.com/dashboard).
2. Pilih project Anda $\rightarrow$ Masuk ke **Authentication** $\rightarrow$ **URL Configuration**.
3. Pada bagian **Site URL**, ubah dari `http://localhost:3000` menjadi URL Vercel Anda:
   ```
   https://krtrade-pwa.vercel.app
   ```
4. Di bagian **Redirect URLs**, tambahkan:
   ```
   https://krtrade-pwa.vercel.app/**
   ```
5. Klik **Save**.

---

## 📱 2. CARA MENJADIKAN APLIKASI WEB-BASED PWA DI BERBAGAI PERANGKAT

Aplikasi **KRTrade** sudah dilengkapi dengan `manifest.json` dan arsitektur PWA Standalone. Pengguna tidak perlu mengunduh aplikasi di Play Store / App Store, cukup menggunakan browser bawaan perangkat.

---

### A. 📱 Pengguna Smartphone Android (Chrome / Edge / Brave)
1. Buka browser Chrome di HP Android Anda.
2. Akses URL Vercel aplikasi Anda (misal: `https://krtrade-pwa.vercel.app`).
3. Akan muncul banner pop-up otomatis di bawah layar: **"Add KRTrade to Home Screen"**.
4. Jika banner tidak muncul otomatis:
   - Ketuk **Ikon Titik Tiga (⋮)** di sudut kanan atas Chrome.
   - Pilih menu **"Tambahkan ke Layar Utama" / "Add to Home Screen"** atau **"Install App"**.
5. Aplikasi **KRTrade** akan terinstall sebagai aplikasi independen di layar utama HP Android Anda dengan ikon resmi 9 Naga.

---

### B. 🍏 Pengguna iPhone & iPad / iOS (Safari Browser)
1. Buka browser **Safari** di iPhone / iPad Anda (*Wajib menggunakan Safari*).
2. Akses URL Vercel aplikasi Anda (misal: `https://krtrade-pwa.vercel.app`).
3. Ketuk **Ikon Bagikan (Share Button)** (ikon kotak dengan panah mengarah ke atas di navigasi bawah Safari).
4. Gulir ke bawah lalu pilih menu **"Tambahkan ke Layar Utama" / "Add to Home Screen"**.
5. Ketuk **"Tambah" / "Add"** di sudut kanan atas.
6. Aplikasi **KRTrade** kini terpasang di Home Screen iOS Anda dengan pengalaman Full-Screen App tanpa baris URL browser.

---

### C. 💻 Pengguna Laptop & PC Desktop (Windows, macOS, Linux)
1. Buka browser **Google Chrome / Microsoft Edge / Brave** di Laptop/PC Anda.
2. Akses URL Vercel aplikasi Anda (misal: `https://krtrade-pwa.vercel.app`).
3. Perhatikan di sebelah kanan **Address Bar (Bilah Alamat URL)** atas:
   - Di Chrome: Klik ikon **Monitor / Install App** 📥 yang berada di samping ikon Bintang Bookmark.
   - Di Edge: Klik ikon **App Available / Install KRTrade** 💻.
4. Klik **"Install"**.
5. Aplikasi **KRTrade** akan terbuka di jendela aplikasi independen (Standalone Desktop Window) dan membuat shortcut otomatis di **Desktop** & **Start Menu Windows / Launchpad Mac**.

---

## ⚡ 3. SUMMARY COMMAND QUICK REFERENCE

```bash
# 1. Test build lokal sebelum push
npm run build

# 2. Commit dan push ke GitHub
git add .
git commit -m "deploy: Release version BETA 0.0.0.1"
git push origin main

# 3. Jalankan server dev lokal kapan saja
npm run dev
```

---
*Dokumen DEPLOY.md dibuat resmi untuk project KRTrade by Filla Calon Wong Sugih 9 Naga.*
