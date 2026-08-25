# Vernyomas - Blood Pressure Tracker

A web application to track blood pressure readings from a Sanitas device, built with React, TypeScript, and Tailwind CSS.

## Architecture

- **Build Tool**: Vite
- **Storage**: Firestore (remote) with localStorage fallback (local)
- **Data Layer**: Abstracted store pattern supporting multiple backends

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

**Firebase is optional.** Leave `VITE_FIREBASE_API_KEY` empty to use localStorage for local development. To enable cloud sync with Firestore, add your Firebase API key:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
```

**Blood Pressure Thresholds** can be customized via environment variables:

```env
VITE_SYSTOLIC_WARNING=120      # Yellow threshold for systolic
VITE_SYSTOLIC_DANGER=140       # Red threshold for systolic
VITE_DIASTOLIC_WARNING=80      # Yellow threshold for diastolic
VITE_DIASTOLIC_DANGER=90       # Red threshold for diastolic
```

Values are displayed in yellow for warning level and red for danger level in the table and chart.

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5174`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/        # React components
├── data/             # Data layer (store abstractions)
├── services/         # External service integrations (Firebase)
├── types/            # TypeScript type definitions
├── App.tsx           # Main app component
└── main.tsx          # Entry point
```

## Features

- ✅ Add blood pressure readings with systolic, diastolic, and pulse
- ✅ View reading history in a table
- ✅ Delete readings
- ✅ Local storage for offline access
- ✅ Firestore integration for cloud sync (with fallback to localStorage)
- ✅ Responsive design with Tailwind CSS

## Notes

- Readings are stored with timestamps automatically
- Optional notes can be added to each reading
- The app uses a store abstraction pattern, making it easy to swap between local and remote storage
- Firebase configuration is optional—the app falls back to localStorage if not configured
