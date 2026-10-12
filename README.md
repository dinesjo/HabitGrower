# 🪷HabitGrower

Deployed at [habitgrower.web.app](https://habitgrower.web.app).

HabitGrower is a web application built with React and TypeScript, designed to help users track and grow their habits. It uses Firebase for user authentication and data storage.

## Features

- User Authentication: Sign up, log in, and log out.
- Habit Tracking: Add, edit, and delete habits.
- Daily Check-In: Mark habits as done for each day.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository.
2. Install dependencies.
   ```sh
   npm install
   ```
3. Start the development server.
   ```sh
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## Local demo (no account or Firebase connections)

```sh
npm run dev:local
```

Open [http://127.0.0.1:5174](http://127.0.0.1:5174). The demo starts directly in the habit list with a synthetic profile and five sample habits. It includes daily, weekly, and monthly goals, 90 days of history, and a habit with no history. Dates are relative to when the samples are created.

Create, edit, register, delete, undo, view charts/history, and change profile preferences normally. Habits and schedule preferences persist in this browser's local storage under `habitgrower.local-demo.v1`. The separate HTTP origin keeps demo storage apart from normal HTTPS development. **Profile → Reset demo data** restores the sample habits and default schedule. Samples are seeded only on first use or reset (invalid demo storage also recovers to samples); deleting all habits leaves the empty state intact.

Local mode does not initialize Firebase Auth, Database, or Messaging, or load the Firebase sign-in UI. Push notifications and browser permission prompts are disabled. External fonts are omitted, so the UI uses its system-font fallbacks. A local-only Content Security Policy blocks external connections and workers as a second safeguard. The demo server binds to loopback, uses HTTP without certificate setup, and does not enable PWA registration. It requires browser storage; failures are reported instead of switching to the real backend.

This mode is explicitly selected by the `dev:local` command (`local-demo` Vite mode), and only runs in development on localhost. `npm run dev` and `npm run build` continue to use Firebase. `vite build --mode local-demo` is rejected to prevent deploying the demo accidentally. Real authentication, push delivery, and Firebase security rules still need testing against Firebase separately.

Run the backend regression checks with `npm run test:local`. They use Node's built-in test runner and the installed TypeScript compiler, with no extra packages or Firebase connections.

Jotai developer tools are hidden by default. To enable them locally, run `VITE_SHOW_DEVTOOLS=true npm run dev:local` (or `npm run dev`). They are excluded from production builds.

## Built With

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Firebase](https://firebase.google.com/)
- [MUI](https://mui.com/)
- [React Router](https://reactrouter.com/)
