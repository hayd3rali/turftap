# TurfTap 🏟️

A React Native mobile application for booking indoor sports courts —
a two-sided marketplace for Players and Court Owners.

## Features
- Role-based auth flow (Player / Owner) with simulated OTP login
- Stack + Bottom Tab navigation (React Navigation)
- Global state management with Redux Toolkit + async thunks
- Live API integration with Axios + loading/error handling
- Smooth mount animations using React Native Animated API

## Technologies
| Library | Purpose |
|---|---|
| React Native + Expo | Core framework |
| Redux Toolkit | Global state + async thunks |
| React Navigation | Stack + Tab navigation |
| Axios | HTTP requests |
| AsyncStorage | Offline persistence |
| React Native Animated | UI animations |

## Run Instructions
1. Clone the repository
   `git clone <your-repo-url>`
2. Install dependencies
   `npm install`
3. Start the development server
   `npx expo start`
4. Scan the QR code with Expo Go (iOS / Android)

## Environment Setup
1. Copy `.env.example` to a new file called `.env`
   `cp .env.example .env`
2. Fill in your actual values in `.env`:
   - Get Supabase URL and key from your Supabase project dashboard
   - Get Google Maps key from Google Cloud Console
3. Never commit your `.env` file to GitHub

## Project Structure
src/
├── components/   # PrimaryButton, InputField, CourtCard
├── navigation/   # AppNavigator, AuthNavigator, TabNavigator
├── screens/      # LoginScreen, HomeScreen, ProfileScreen, ...
├── store/        # store.js, userSlice.js, bookingSlice.js
└── services/     # (Firebase/Supabase config — Phase 9)


