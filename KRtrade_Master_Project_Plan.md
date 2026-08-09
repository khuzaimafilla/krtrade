# PROJECT PLAN: KRTrade App (V3 - Final Master Edition)
> **"KRTrade" by Filla Calon Wong Sugih 9 Naga**

---

## 📌 Executive Summary
**KRTrade** adalah aplikasi Web-Based Trading Journal & Community (PWA) yang ringan, ultra-responsif, dan dapat diakses melintasi semua platform (PC, Laptop, Android, iOS). Aplikasi ini dirancang menggunakan arsitektur modern (Next.js + Tailwind CSS + Supabase) dengan tema visual **Tradewire Financial Light Mode** (Hijau Emerald, Off-White, & Clean Modern Typography) serta pendekatan branding yang elegan, eksklusif, dan humoris/berkarakter.

---

## 🎨 Design System & Theme Specification

### 1. Color Palette (Tradewire Light Financial Theme)
- **Primary Background:** `#F8FAF9` (Off-white / Soft Sage Clean)
- **Card / Container Background:** `#FFFFFF` (Pure White)
- **Card Border:** `#E4E9E6` (Subtle light border)
- **Primary Accent (Profit / CTA):** `#05C46B` (Emerald Green)
- **Primary Hover:** `#04A75B`
- **Secondary Accent (Badge / Active State):** `#E6F7F0` (Soft Emerald Mint)
- **Text Primary:** `#1E2923` (Crisp Dark Slate)
- **Text Muted:** `#6B7C72` (Subtext Slate Gray)
- **Danger Accent (Loss / SL):** `#FF4D4D` (Coral Red)
- **Luxury Accent (Branding / Badges):** `#D4AF37` (Gold Accent)

### 2. Multi-Language System (i18n)
- **Default Selector:** Modal pilihan bahasa saat pertama kali aplikasi dibuka (`Bahasa Indonesia` vs `English`).
- **Persistence & Management:** Pilihan bahasa tersimpan di local storage/user preferences dan dapat diubah sewaktu-waktu melalui menu **Settings**.

---

## 🔄 User Onboarding & Authentication Flow

### Phase 1: Language Selection Modal
1. **Modal Popup** di atas Welcome Page saat pengguna baru mengakses aplikasi.
2. Pilihan:
   - 🇮🇩 **Bahasa Indonesia**
   - 🇬🇧 **English**

---

### Phase 2: Welcome Page (`/welcome`)
1. **Header / Main Title:**
   > *"Selamat Datang di Aplikasi Pencatatan Orang Kaya!"*
2. **App Branding (Bold Small):**
   > **KRTrade**
3. **App Subtitle / Version Tag:**
   > `Version: Filla F nya Ferari` (Text Muted / Gold Badge)
4. **Action Button:**
   - Button: `Selanjutnya` / `Next` (Mengarahkan ke Halaman Login / Register).

---

### Phase 3: Login & Register System (`/auth`)

#### A. Halaman Login
- **Input Fields:**
  - `Username` / Email
  - `Password`
- **Two-Step Verification:**
  - `Kode OTP 6 Digit` via Email (muncul secara kondisional/step 2 setelah password terverifikasi).
- **Secondary Actions:**
  - Link `Lupa Password`
  - Button `Login dengan Google` (OAuth Integration)
- **Alternative Link:** "Belum punya akun? *Daftar Sekarang*"

#### B. Halaman Register
- **Form Fields:**
  - `Nama Lengkap`
  - `Email`
  - `Username`
  - `Password` & `Konfirmasi Password`
- **Social Signup:**
  - Button `Daftar dengan Google`
- **Trading Profile Preference:**
  - Dropdown / Single Choice Card: **"Pilih gaya trading anda"**
    - Options: `[Swing Trade, Intraday, Scalping]`
  - *Notes Khusus:* `"Anda tidak bisa ubah gaya trading anda, 1 aja jangan kebanyakan gaya!"`
- **Mandatory Agreements (Important Checkboxes):**
  - [x] *"Saya telah berjanji bahwa saya adalah seorang trader yang tidak TAMAK dan akan memprioritaskan Money dan Risk Management untuk menjaga Psikologi dan Overtrade"*
  - [x] *"Saya mengakui bahwa Filla adalah orang paling kaya di dunia"*

---

## 👥 Community, Groups & Multi-Filter Leaderboard

### 1. Group / Community System (`/community`)
- **Create & Join Group:** User bisa membuat komunitas baru (misal: *"SMC Gold Trader ID"* atau *"Scalper Gaib 9 Naga"*) atau join via kode/link undangan.
- **Group Overview:** Tampilan statistik akumulasi PnL, Total Member, dan Average Win Rate komunitas.

### 2. Multi-Filter Leaderboard System (`/leaderboard`)
- **Scope Switcher (Tab Filter 1):**
  - `Friends Only` (Hanya dari daftar teman terdekat)
  - `Community / Group Members` (Khusus member dalam komunitas tertentu)
  - `Global` (Seluruh pengguna KRTrade)
- **Trading Style Filter (Tab Filter 2):**
  - `All Methods` | `Scalping` | `Intraday` | `Swing Trade`
- **Leaderboard Data Columns:**
  - Rank (#), Username, Trading Style Badge, Monthly Return (%), Win Rate (%), Total Trades, & PnL Status.

---

## 💻 Core Application Features & Structure (Post-Login)

### 1. Dashboard Utama (`/dashboard`)
- **Greeting Banner:** *"Welcome back, Filla! On track to 9 Naga level today? 📈🐉"*
- **Key Metrics:** Total PnL ($), Win Rate (%), Profit Factor, Avg Risk-to-Reward (RR), Win/Loss Streak.
- **Equity Curve / PnL Chart:** TradingView `@tradingview/lightweight-charts` integration.
- **Recent Trades Table:** List 5 transaksi terakhir dengan indikator status Win/Loss.

### 2. Trading Journal Log (`/journal`)
- **Modal Add Trade:** Input Asset/Pair, BUY/SELL, Entry Price, Exit Price, Lot Size, PnL ($), RR Ratio, Strategy Tag (SMC, ICT, Breakout, dll), Trade Notes, & Upload Screenshot Chart.
- **Filtering & Search:** Filter berdasar Pair, Strategy, dan Win/Loss.

### 3. Settings Page (`/settings`)
- **Language Switcher:** Mengubah bahasa aplikasi (Bahasa Indonesia / English).
- **Profile Management:** Informasi Akun, Gaya Trading (Read-only), dan Password.

---

## 🛠️ Technical Stack & Architecture

| Layer | Technology | Function |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14+ (App Router, TypeScript) | Core App Structure & PWA Capabilities |
| **Styling Engine** | Tailwind CSS + Lucide Icons | Tradewire Light Theme Design Implementation |
| **Internationalization** | `next-intl` or Custom i18n Context | Multi-language support (ID / EN) |
| **Database & Auth** | Supabase (PostgreSQL + Auth + OTP) | User Accounts, Auth, Realtime DB & Storage |
| **Chart Library** | `@tradingview/lightweight-charts` | High-performance Financial Charts |
| **PWA Engine** | `@ducanh2912/next-pwa` | Mobile Standalone Installability (Android & iOS) |
| **Deployment** | Vercel Platform | CI/CD, Edge Network & Global CDN Hosting |

---

## 🎯 Master Agentic Execution Prompt for Antigravity

Copy & Paste prompt di bawah ini langsung ke **Google Antigravity Agent** untuk memulai eksekusi otomatis:

```markdown
You are an expert Full-Stack Engineer. Build a production-ready, lightweight, web-based Trading Journal PWA named "KRTrade by Filla Calon Wong Sugih 9 Naga".

### 🎯 PROJECT SUMMARY & ONBOARDING FLOW
Implement a complete Multi-language Next.js App Router application with the following user flow:
1. Language Selector Modal on first visit (Bahasa Indonesia vs English). Language preference must be editable in Settings.
2. Welcome Page (`/welcome`):
   - Main Header: "Selamat Datang di Aplikasi Pencatatan Orang Kaya!"
   - Bold App Name: "KRTrade"
   - Subtitle: "Version: Filla F nya Ferari"
   - Button: "Selanjutnya / Next" -> Redirects to Login/Register.
3. Authentication System (`/auth`):
   - Login Page: Username/Email, Password, 6-Digit Email OTP step, Forgot Password link, Google OAuth Login.
   - Register Page: Full Name, Email, Username, Password + Confirm, Google OAuth Register.
   - Trading Style Selector: Single choice dropdown/card for [Swing Trade, Intraday, Scalping] with warning text: "Anda tidak bisa ubah gaya trading anda, 1 aja jangan kebanyakan gaya!".
   - Mandatory Checkboxes (Validation Required):
     1. "Saya telah berjanji bahwa saya adalah seorang trader yang tidak TAMAK dan akan memprioritaskan Money dan Risk Management untuk menjaga Psikologi dan Overtrade"
     2. "Saya mengakui bahwa Filla adalah orang paling kaya di dunia"

### 👥 GROUPS & MULTI-FILTER LEADERBOARD
1. Community / Groups (`/community`):
   - Feature to Create & Join Trading Groups (e.g., "SMC Scalpers", "9 Naga Elite").
2. Multi-Filter Leaderboard (`/leaderboard`):
   - Scope Switcher Tabs: [ Friends Only | Community Members | Global ]
   - Trading Style Filters: [ All Methods | Scalping | Intraday | Swing Trade ]
   - Table Columns: Rank (#), Username, Trading Style Badge, Monthly Return (%), Win Rate (%), Total Trades.

### 🎨 DESIGN SYSTEM (Tradewire Light Theme)
Configure `tailwind.config.js`:
- Primary Background: `#F8FAF9` (Off-white / Soft Sage)
- Cards: `#FFFFFF` (Pure White) with border `#E4E9E6`
- Primary Accent (Profit/CTA): `#05C46B` (Emerald Green)
- Primary Hover: `#04A75B`
- Soft Accent: `#E6F7F0` (Soft Emerald Mint)
- Text Primary: `#1E2923` (Dark Slate)
- Text Muted: `#6B7C72` (Slate Gray)
- Danger (Loss): `#FF4D4D` (Coral Red)
- Luxury Accent: `#D4AF37` (Gold Accent)

### 🚀 DASHBOARD & APP PAGES
- Dashboard (`/dashboard`): Greeting "Welcome back, Filla! On track to 9 Naga level today? 📈🐉", PnL Metrics, Lightweight-charts Equity Curve, Recent Trades.
- Journal (`/journal`): Full CRUD trade log with Pair, Entry, Exit, Lot, Strategy Tags, and Screenshot URL.
- Settings (`/settings`): Language Selector (ID / EN) and Profile Details.

### 🛠️ TECHNICAL SETUP
- Stack: Next.js (TypeScript), Tailwind CSS, Lucide Icons, Supabase integration mock/client.
- PWA Configuration: Include `manifest.json` for "Add to Home Screen" support on Android & iOS.
- Execution: Setup components, apply mock state, run `npm run dev` and ensure responsive touch UI.
```
