# 📘 SYSTEM DOCUMENTATION: KRtrade PWA Application
> **"KRtrade" by Filla Calon Wong Sugih 9 Naga**  
> *Versi Aplikasi: BETA Version 0.0.0.1*

---

## 📌 Executive Summary
**KRtrade** adalah aplikasi Web-Based Trading Journal & Community (PWA) yang dirancang ultra-responsif, ringan, dan siap pakai melintasi perangkat Desktop, Laptop, Android, dan iOS. Aplikasi ini dibangun dengan arsitektur modern Next.js 16 (App Router + Webpack), React 19, Google Fonts (Montserrat & Poppins), Tailwind CSS (Tradewire Financial Light Mode Theme), Supabase Backend (PostgreSQL Database & Supabase Auth), serta sistem multi-bahasa (i18n) dan penyimpanan state lokal (fallback-safe).

---

## 🎯 1. Features Implemented (Fitur yang Sudah Jadi)

| Fitur / Halaman | Deskripsi Component & Capabilities | Status Implementation |
| :--- | :--- | :---: |
| **Google Fonts Typography** | Montserrat (Headings/Brand) & Poppins (Body/Inputs) dikonfigurasi via `next/font/google`. | ✅ **Completed** |
| **App Logo Component** | Komponen modular `src/components/common/AppLogo.tsx` yang merender `/public/logo.png` dengan SVG crown fallback. | ✅ **Completed** |
| **Splash Screen & Initial Loading** | Animasi loading awal aplikasi dengan logo pulse & indikator progress di `src/components/common/SplashScreen.tsx`. | ✅ **Completed** |
| **Version Tag Update** | Seluruh tampilan label versi diperbarui secara konsisten menjadi `"BETA Version 0.0.0.1"`. | ✅ **Completed** |
| **Welcome Page Refinements (`/welcome`)** | Kontrol pemilihan Bahasa (ID / EN) & Theme Switcher (Light / Dark Mode) langsung di halaman pendaratan. | ✅ **Completed** |
| **Auth UI/UX Refinements (`/auth`)** | Dihapusnya tombol Google OAuth, penambahan Toggle Mata Password (`Eye`/`EyeOff`), & styling placeholder profesional (opacity 50%). | ✅ **Completed** |
| **Register Button Disabled Validation** | Tombol "Daftar / Register" berada dalam keadaan `disabled` (grayed out) sampai kedua checkbox wajib (Janji Anti-Tamak & Pengakuan Filla Paling Kaya) dicentang. | ✅ **Completed** |
| **Supabase Client Setup** | Helper Supabase di `src/lib/supabaseClient.ts` membaca kredensial dari `.env.local` dengan auto-detection. | ✅ **Completed & Active** |
| **PostgreSQL Database Schema** | Skema tabel lengkap di `supabase_schema.sql` untuk `profiles`, `trades`, `friendships`, `groups`, dan `group_members` beserta RLS policies. | ✅ **Completed** |
| **Real Auth & Session Guard** | Connect `supabase.auth.signUp()`, `signInWithPassword()`, & `verifyOtp()`. Protected route guard otomatis meredirect user tak terautentikasi ke `/auth`. | ✅ **Completed** |
| **Logout Session & Redirect** | Tombol logout pada navbar yang mengakhiri sesi auth dan mengarahkan pengguna kembali ke halaman `/welcome`. | ✅ **Completed** |
| **Two-Step Email OTP (`OtpModal`)** | Langkah verifikasi 6-digit kode OTP via email menggunakan `supabase.auth.verifyOtp()` & simulated fallback. | ✅ **Completed** |
| **User Profile & Settings Update** | Edit Nama Lengkap, Username, & Avatar URL di `/settings` yang tersimpan otomatis ke tabel PostgreSQL `profiles`. | ✅ **Completed** |
| **Real Add Friend & Community** | Cari trader berdasarkan `username`, simpan permintaan ke `friendships`, serta join komunitas ke `group_members`. | ✅ **Completed** |
| **Dashboard Utama (`/dashboard`)** | Greeting banner *"Welcome back, Filla! On track to 9 Naga level today? 📈🐉"*, 5 PnL metric cards, & 5 transaksi terakhir. | ✅ **Completed** |
| **Equity Growth Curve (`EquityChart`)** | Visualisasi kurva pertumbuhan portfolio ($10,000 base balance) menggunakan SVG/Canvas Lightweight chart engine (Bebas error SVG NaN). | ✅ **Completed** |
| **Trading Journal Log (`/journal`)** | Log transaksi CRUD lengkap (Add, Edit, Delete) tersambung ke tabel `trades` PostgreSQL. | ✅ **Completed** |
| **Community & Groups (`/community`)** | Overview kartu grup trading (Total Member, Accumulative PnL, Avg Win Rate), Modal Buat Grup Baru, & Join via Kode Undangan (e.g. `NAGA99`). | ✅ **Completed** |
| **Multi-Filter Leaderboard (`/leaderboard`)** | **Scope Switcher Tabs**: `[ Friends Only \| Community Members \| Global ]`<br>**Style Filter**: `[ All Methods \| Scalping \| Intraday \| Swing Trade ]`<br>Kolom: Rank (#), Avatar, Username, Style Badge, Return (%), Win Rate (%), Total Trades, Net PnL ($). | ✅ **Completed** |
| **PWA Configuration** | `manifest.json`, Theme Color `#05C46B`, Mobile Viewport Touch UI, & Standalone Installability. | ✅ **Completed** |

---

## 🗄️ 2. Database Schema (PostgreSQL DDL)

Berikut adalah struktur 5 tabel utama pada `supabase_schema.sql`:

1. **`profiles`**: `id` (UUID, PK references `auth.users`), `username`, `full_name`, `avatar_url`, `trading_style`, `accepts_tamak_promise`, `acknowledges_filla_richest`, `created_at`.
2. **`trades`**: `id` (UUID, PK), `user_id` (FK `profiles.id`), `pair`, `type` (`BUY`/`SELL`), `lot_size`, `entry_price`, `exit_price`, `pnl`, `rrr`, `strategy_tag`, `notes`, `chart_url`, `created_at`.
3. **`friendships`**: `id` (UUID, PK), `requester_id` (FK `profiles.id`), `addressee_id` (FK `profiles.id`), `status` (`pending`/`accepted`).
4. **`groups`**: `id` (UUID, PK), `name`, `code` (VARCHAR(6) UNIQUE), `description`, `created_by`, `created_at`.
5. **`group_members`**: `id` (UUID, PK), `group_id` (FK `groups.id`), `user_id` (FK `profiles.id`), `joined_at`.

---

## 📁 3. Project Directory Structure

```
d:\laragon\www\krtrade\
├── .env.local                           # Credentials Supabase URL & Anon Key
├── supabase_schema.sql                  # Schema DDL PostgreSQL (5 Tables & RLS)
├── public/
│   ├── favicon.ico
│   ├── logo.png                         # PNG Logo File (dengan SVG fallback)
│   └── manifest.json                    # PWA Manifest & Icons
├── src/
│   ├── app/
│   │   ├── auth/page.tsx                # Auth Page (Eye Toggle, Disabled State, Placeholders)
│   │   ├── community/page.tsx           # Groups Page
│   │   ├── dashboard/page.tsx           # Dashboard Metrics Page
│   │   ├── journal/page.tsx             # Trading Journal CRUD Page
│   │   ├── leaderboard/page.tsx         # Multi-Filter Leaderboard Page
│   │   ├── settings/page.tsx            # Settings & Profile Page (AppLogo & BETA 0.0.0.1)
│   │   ├── welcome/page.tsx             # Welcome Page (Inline Lang & Theme Controls)
│   │   ├── globals.css                  # Montserrat & Poppins Font Tokens
│   │   ├── layout.tsx                   # Root Layout & Montserrat/Poppins Fonts + SplashScreen
│   │   └── page.tsx                     # Root Page Redirect
│   ├── components/
│   │   ├── common/
│   │   │   ├── AppLogo.tsx              # Reusable Modular Logo Component
│   │   │   └── SplashScreen.tsx         # Smooth Splash Loading Component
│   │   ├── dashboard/EquityChart.tsx    # Grafik Equity Growth (Safe SVG)
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx            # Navigation Mobile
│   │   │   └── Navbar.tsx               # Navigation Bar Desktop (AppLogo & BETA 0.0.0.1)
│   │   └── modals/
│   │       ├── AddFriendModal.tsx       # Modal Cari & Tambah Teman
│   │       ├── LanguageSelectorModal.tsx# Modal Pemilihan Bahasa
│   │       ├── OtpModal.tsx             # Modal 6-Digit Email OTP
│   │       └── TradeModal.tsx           # Modal CRUD Transaksi Jurnal
│   ├── context/
│   │   ├── AuthContext.tsx              # Supabase Auth Session & Protected Guard
│   │   └── LanguageContext.tsx          # Multi-Language i18n
│   ├── lib/
│   │   ├── mockData.ts                  # Initial Fallback Data
│   │   ├── storage.ts                   # Local Storage Helper
│   │   ├── supabaseClient.ts            # Supabase Client Helper
│   │   └── translations.ts              # Dictionary Bahasa ID & EN (BETA Version 0.0.0.1)
│   └── types/
│       └── index.ts                     # TypeScript Interfaces
├── ANALISIS_SISTEM_KRTRADE.md           # Dokumentasi Analisis Lengkap
├── SYSTEM_DOCUMENTATION.md              # Dokumentasi Sistem Aplikasi
├── next.config.ts
└── package.json
```
