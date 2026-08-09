# 🐲 KRTRADE: PORTAL TRADING ORANG KAYA 9 NAGA (KRTRADE.md)
> **KRTrade by Filla Calon Wong Sugih 9 Naga**  
> *Versi Aplikasi: BETA Version 0.0.0.1*  
> *Dokumen Resmi Arsitektur Sistem, Fitur Aktif & Roadmap Pengembangan*

---

## 📌 Executive Summary
**KRTrade** adalah aplikasi Web-Based Trading Journal & Community PWA (Progressive Web App) yang ultra-responsif, ringan, dan dirancang khusus untuk trader tingkat 9 Naga. Aplikasi ini memungkinkan pengguna mencatat log transaksi trading, menganalisis kurva pertumbuhan saldo (Equity Curve), bergabung dengan grup komunitas trading, serta bersaing pada papan peringkat (Leaderboard) global dan antar teman secara realtime.

---

## 🏗️ 1. TECH STACK & ARSITEKTUR SISTEM

- **Frontend Framework**: Next.js 16.2.12 (App Router + Webpack) & React 19
- **Tipografi**: Google Fonts **Montserrat** (Headings/Brand) & **Poppins** (Body/Text/Inputs)
- **Styling Engine**: Tailwind CSS v4 dengan Tradewire Financial Light Theme
- **Icons & Visuals**: Lucide React Icons & SVG Canvas Chart Engine
- **Backend & Database**: Supabase PostgreSQL Database (5 Tables: `profiles`, `trades`, `friendships`, `groups`, `group_members`)
- **Autentikasi**: Supabase Auth dengan penanganan Sesi Lokal Persistent (Session Refresh Safe)
- **Kapabilitas App**: Cross-Platform Progressive Web App (PWA Standalone) untuk Windows, Mac, Android, & iOS

---

## ✅ 2. FITUR YANG SUDAH JADI & SIAP PAKAI (RELEASED FEATURES)

| Nama Fitur | Deskripsi & Kemampuan Sistem | Status |
| :--- | :--- | :---: |
| **Language Selector Modal** | Modal popup pilihan bahasa utama (`Bahasa Indonesia` / `English`) saat pertama kali visit & switchable via Navbar / Settings. | ✅ **Active** |
| **Welcome Onboarding (`/welcome`)** | Halaman pendaratan dengan header *"Selamat Datang di Aplikasi Pencatatan Orang Kaya!"*, Brand **KRTrade**, Subtitle Tag `BETA Version 0.0.0.1`, & inline Language controls. | ✅ **Active** |
| **Direct Authentication (`/auth`)** | Form Login & Register dengan dukungan Username atau Email, Password Eye Toggle (`Eye`/`EyeOff`), & Styling Placeholder Profesional. | ✅ **Active** |
| **Mandatory Trader Agreement** | Validasi wajib menyetujui *Janji Anti-Tamak* & *Pengakuan Filla Orang Paling Kaya di Dunia* sebelum tombol registrasi aktif. | ✅ **Active** |
| **Protected Route Guard & Anti-Logout** | Memproteksi route terproteksi (`/dashboard`, `/journal`, `/community`, `/leaderboard`, `/settings`) dan mempertahankan sesi login saat browser di-refresh. | ✅ **Active** |
| **Dashboard PnL Metrics (`/dashboard`)** | Overview metrik statistik: Total PnL ($), Win Rate (%), Profit Factor, Avg RRR, Win/Loss Streak, & 5 Transaksi Terakhir. | ✅ **Active** |
| **Equity Growth Curve** | Visualisasi kurva pertumbuhan portfolio ($10,000 base balance) menggunakan SVG Canvas engine (Bebas error SVG NaN). | ✅ **Active** |
| **Trading Journal Log CRUD (`/journal`)** | Fitur Tambah, Edit, Hapus, & Lihat Transaksi Trading lengkap dengan kalkulasi PnL, RRR, Strategy Tag, Notes, & Upload Screenshot Chart. | ✅ **Active** |
| **Native Chart Screenshot Uploader** | Pengguna HP & Laptop dapat mengunggah foto chart TradingView / MetaTrader langsung dari galeri atau kamera HP. | ✅ **Active** |
| **Community Trading Groups (`/community`)** | Overview kartu grup trading (Total Member, Accumulative PnL, Win Rate), Modal Buat Grup Baru, & Join via Kode 6-digit (misal `NAGA99`). | ✅ **Active** |
| **Realtime Database Leaderboard (`/leaderboard`)** | Papan peringkat 100% realtime tanpa user dummy, membaca profil asli `profiles` dan statistik transaksi `trades`. | ✅ **Active** |
| **Add Friend System** | Pencarian trader berdasarkan `username`, pengiriman permintaan pertemanan ke `friendships`, dan filter daftar teman dekat. | ✅ **Active** |
| **Settings & Profile Management (`/settings`)** | Pengatur Bahasa, Update Nama Lengkap, Username, & Upload Foto Profil dari Galeri/Kamera HP/Laptop. | ✅ **Active** |
| **Popup Modal Konfirmasi Perubahan** | Modal konfirmasi popup (`ConfirmSaveModal`) saat memperbarui profil/foto dan modal konfirmasi saat Logout (`LogoutConfirmModal`). | ✅ **Active** |
| **Cross-Platform PWA App** | Standalone web app yang dapat diinstal di Android, iOS, Windows, dan macOS via *Add to Home Screen*. | ✅ **Active** |

---

## ⏳ 3. FITUR DALAM TAHAP PENGEMBANGAN (UNDER DEVELOPMENT ROADMAP)

Berikut adalah daftar fitur lanjutan yang direncanakan untuk dirilis pada versi mendatang:

### 1. 💬 Realtime Group Chat & Trading Room
- **Deskripsi**: Fitur pesan instan (chat room) berbasis Supabase Realtime Channel di dalam setiap grup komunitas.
- **Tujuan**: Memungkinkan anggota grup 9 Naga berdiskusi sinyal, analisa chart, dan psikologi secara live.
- **Status**: ⏳ *Under Development (Planned v0.0.0.2)*

### 2. 🔔 Push Notifications Alert System
- **Deskripsi**: Notifikasi browser & HP saat ada teman yang mengirim friend request, posting jurnal baru, atau mencapai Winrate Streak.
- **Tujuan**: Meningkatkan keterlibatan pengguna dalam komunitas.
- **Status**: ⏳ *Under Development (Planned v0.0.0.3)*

### 3. 🧠 Emotional & Psychological Analytics Deep-Dive
- **Deskripsi**: Penambahan tag emosi saat entry (e.g. *FOMO, Revenge Trade, Disciplined, Calm*) dan grafik heatmap jam/hari trading paling menguntungkan.
- **Tujuan**: Membantu trader mengeliminasi overtrade dan memperkuat psikologi trading.
- **Status**: ⏳ *Under Development (Planned v0.0.0.4)*

### 4. 📄 Export Journal Data to PDF & Excel/CSV
- **Deskripsi**: Fitur mengunduh laporan jurnal trading bulanan ke dalam format dokumen PDF elegan dan file spreadsheet CSV/Excel.
- **Tujuan**: Memudahkan pembukuan keuangan dan audit pribadi trader.
- **Status**: ⏳ *Under Development (Planned v0.0.0.5)*

### 5. 🤖 Automated Webhook Sync (MetaTrader 4/5 & TradingView)
- **Deskripsi**: Integrasi Webhook API yang secara otomatis mencatat transaksi BUY/SELL langsung dari akun MT4/MT5 atau alert TradingView tanpa perlu diinput manual.
- **Tujuan**: Efisiensi pencatatan otomatis 100%.
- **Status**: ⏳ *Under Development (Planned v0.0.1.0)*

---

## 🗄️ 4. SKEMA TABEL DATABASE SUPABASE (POSTGRESQL)

1. **`profiles`**: Identitas & verifikasi trader (`id`, `username`, `full_name`, `avatar_url`, `trading_style`, `accepts_tamak_promise`, `acknowledges_filla_richest`).
2. **`trades`**: Log transaksi trading (`id`, `user_id`, `pair`, `type`, `lot_size`, `entry_price`, `exit_price`, `pnl`, `rrr`, `strategy_tag`, `notes`, `chart_url`).
3. **`friendships`**: Relasi pertemanan antar trader (`id`, `requester_id`, `addressee_id`, `status`).
4. **`groups`**: Komunitas trading (`id`, `name`, `code`, `description`, `created_by`).
5. **`group_members`**: Keanggotaan grup (`id`, `group_id`, `user_id`, `joined_at`).

---
*Dokumen KRTRADE.md merupakan dokumentasi resmi sistem aplikasi KRTrade by Filla Calon Wong Sugih 9 Naga.*
