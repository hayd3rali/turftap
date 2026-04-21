# TurfTap 🏟️

A cross-platform React Native mobile application for booking indoor sports courts — a two-sided marketplace connecting **Players** who want to find and book courts with **Owners** who manage venues.

Built with **Expo SDK 55**, powered by **Supabase** (Auth, PostgreSQL, Storage).

---

## Features

### Authentication & Onboarding
- Email/password and phone OTP authentication via Supabase Auth
- Role selection (Player / Owner) after signup
- Guided profile setup with photo upload and area selection
- Password reset via deep linking (`expo-linking`)

### Player
- **Home** — Featured and nearby courts based on selected area
- **Explore** — Search and filter courts across 100+ Karachi areas
- **Court Detail** — Venue photos, available time slots, pricing, and interactive map
- **Multi-Slot Booking** — Select consecutive hours with real-time availability validation
- **Checkout & Confirmation** — Booking summary, pricing breakdown, success screen
- **Booking History** — Track upcoming, completed, and cancelled bookings
- **Profile** — Edit personal info, notification settings, theme toggle, help & privacy

### Owner
- **Venue Setup** — Multi-step wizard (identity → media upload → map location → pricing)
- **Dashboard** — Real-time analytics (total bookings, revenue, today's count, active courts)
- **Schedule** — Manage all bookings with today / upcoming / past filters
- **Venue Editing** — Update personal info, venue details, and pricing at any time

### General
- Interactive maps via Google Map API
- Searchable area picker modal (100+ areas)
- Location services via `expo-location`
- Glassmorphism, gradients, and smooth animations

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| Framework | React Native + Expo | 0.83 / SDK 55 |
| Language | JavaScript (ES6+) | — |
| Backend | Supabase (Auth, DB, Storage) | 2.100 |
| State | Redux Toolkit + React-Redux | 2.11 / 9.2 |
| Navigation | React Navigation (Stack + Tabs) | 7.x |
| Maps | React Native Maps + OpenStreetMap | 1.27 |
| HTTP | Axios | 1.13 |
| Dates | date-fns | 4.1 |
| Storage | AsyncStorage | 2.2 |
| Build | EAS Build | — |

**Expo modules:** `expo-image-picker` · `expo-location` · `expo-linear-gradient` · `expo-blur` · `expo-linking` · `expo-status-bar`

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- Expo CLI (`npm install -g expo-cli`) or use `npx expo`
- A [Supabase](https://supabase.com) project
- (Optional) Google Maps API key for Android

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd turftap

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
```

Fill in your `.env` with actual values:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_BASE_URL=your_supabase_project_url
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_api_key
```

> ⚠️ Never commit your `.env` file. It is already in `.gitignore`.

### Run

```bash
npx expo start
```

Scan the QR code with **Expo Go** (Android / iOS) or press `a` to open in an Android emulator.

---

## Project Structure

```
src/
├── api/                  # Service layer for Supabase data
│   ├── bookingsService.js
│   ├── courtsService.js
│   └── slotsService.js
├── components/           # Reusable UI components
│   ├── AreaPickerModal.js
│   ├── CourtCard.js
│   ├── InputField.js
│   ├── MapLocationPicker.js
│   ├── PrimaryButton.js
│   └── owner/            # Owner-specific form sections
│       ├── LocationSection.js
│       ├── MediaSection.js
│       ├── PricingEngineSection.js
│       └── VenueIdentitySection.js
├── config/
│   └── env.js            # Environment variable access
├── constants/
│   └── colors.js         # Design system color tokens
├── navigation/
│   ├── AppNavigator.js       # Root navigator (auth → setup → main)
│   ├── AuthNavigator.js      # Login / OTP / role selection
│   ├── SetupNavigator.js     # Profile & venue setup flows
│   ├── PlayerTabNavigator.js # Player bottom tabs + stack
│   └── OwnerTabNavigator.js  # Owner bottom tabs + stack
├── screens/              # All app screens (25 total)
│   ├── AuthPhoneScreen.js
│   ├── LoginScreen.js
│   ├── OTPScreen.js
│   ├── RoleSelectionScreen.js
│   ├── SetupProfileScreen.js
│   ├── HomeScreen.js
│   ├── ExploreScreen.js
│   ├── CourtDetailScreen.js
│   ├── CheckoutScreen.js
│   ├── SuccessScreen.js
│   ├── BookingsScreen.js
│   ├── BookingDetailScreen.js
│   ├── ProfileScreen.js
│   ├── PersonalInfoScreen.js
│   ├── OwnerSetupScreen.js
│   ├── OwnerHomeScreen.js
│   ├── OwnerBookingsScreen.js
│   ├── OwnerProfileScreen.js
│   ├── OwnerEditPersonalScreen.js
│   ├── OwnerEditVenueScreen.js
│   ├── OwnerManagePricingScreen.js
│   ├── ResetPasswordScreen.js
│   ├── HelpSupportScreen.js
│   ├── NotificationSettingsScreen.js
│   └── PrivacyPolicyScreen.js
├── services/
│   └── supabase.js       # Supabase client initialization
└── store/                # Redux state management
    ├── store.js
    ├── userSlice.js
    ├── bookingSlice.js
    └── themeSlice.js
```

---

## License

This project is private and not licensed for redistribution.
