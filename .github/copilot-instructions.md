# HabitGrower - React + TypeScript Habit Tracking Web Application

HabitGrower is a Progressive Web Application (PWA) built with React, TypeScript, and Vite that helps users track and grow their habits. It uses Firebase for authentication, real-time database, and push notifications, with Vercel functions for serverless API endpoints.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap and Dependencies
- Install dependencies: `npm install` -- takes 2 minutes. NEVER CANCEL. Set timeout to 5+ minutes.
  - Expect deprecation warnings and ~15 vulnerabilities (these are known and do not affect functionality)
  - All required dependencies will be installed successfully

### Building and Linting
- Lint the code: `npm run lint` -- takes 2 seconds
  - Expect TypeScript version warning (5.8.2 vs officially supported <5.6.0) - this is harmless
  - Must pass with 0 warnings before committing changes
- Build for production: `npm run build` -- takes 25 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
  - Compiles TypeScript and builds with Vite
  - Creates optimized bundles in `dist/` directory
  - Expect Browserslist data warning (safe to ignore)
  - Expect chunk size warnings for large bundles (normal for this app)

### Development Server
- **CRITICAL LIMITATION**: `npm run dev` fails in CI environments due to mkcert plugin network restrictions
  - Error: "AxiosError: Request failed with status code 403" from vite-plugin-mkcert
  - **WORKAROUND**: Temporarily disable mkcert plugin in `vite.config.ts`:
    ```typescript
    plugins: [
      react(),
      // mkcert(), // Disable for CI environments
      VitePWA({...})
    ]
    ```
  - After disabling mkcert: `npm run dev` starts successfully on http://localhost:5173
- Preview production build: `npm run preview` -- starts on http://localhost:4173
  - Use this to test production builds locally
  - Works without mkcert plugin issues

### Timing Expectations
- `npm install`: 2 minutes (NEVER CANCEL - set 5+ minute timeout)
- `npm run build`: 25 seconds (NEVER CANCEL - set 60+ second timeout)  
- `npm run lint`: 2 seconds
- `npm run dev`: Immediate startup (after mkcert workaround)
- `npm run preview`: Immediate startup

## Validation

### Manual Testing Requirements
**ALWAYS manually validate changes by running through complete user scenarios after making modifications.**

1. **Authentication Flow**: 
   - Navigate to the application
   - Test sign up/sign in process
   - Verify user authentication state persists

2. **Core Habit Management**:
   - Create a new habit
   - Edit habit details and settings
   - Mark habits as complete for current day
   - View habit history and statistics
   - Delete a habit and test undo functionality

3. **Navigation and UI**:
   - Test all routes and navigation
   - Verify responsive design on different screen sizes
   - Check Material-UI components render correctly

### Pre-commit Validation
- ALWAYS run `npm run lint` before committing - CI will fail if linting errors exist
- ALWAYS build the application with `npm run build` to catch TypeScript compilation errors
- Test key user flows manually using `npm run preview` after building

## Repository Structure

### Key Directories and Files
```
/src/
  /components/        - Reusable React components
  /routes/           - Route-specific components and views
    /Index/          - Main habit tracking interface
    /Profile/        - User account and authentication
  /services/         - Firebase services and data persistence
  /types/            - TypeScript type definitions
  /utils/            - Utility functions and helpers
  firebase.ts        - Firebase configuration and initialization
  main.tsx          - Application entry point
  store.ts          - Jotai state management

/api/                - Vercel serverless functions (TypeScript)
  registerHabitNow.ts     - Habit registration endpoint
  sendNotificationIfTime.ts - Push notification scheduler

/.github/workflows/  - GitHub Actions CI/CD
  firebase-hosting-merge.yml      - Production deployment
  firebase-hosting-pull-request.yml - Preview deployments

Key Config Files:
- vite.config.ts    - Vite bundler configuration with PWA setup
- package.json      - Dependencies and npm scripts
- firebase.json     - Firebase hosting configuration
- tsconfig.json     - TypeScript compiler options
- .eslintrc.cjs     - ESLint configuration
```

### Technology Stack
- **Frontend**: React 18, TypeScript, Material-UI (MUI), React Router
- **Build Tool**: Vite with SWC for fast compilation
- **Backend**: Firebase (Auth, Realtime Database, Cloud Messaging)
- **API**: Vercel serverless functions
- **State Management**: Jotai for atomic state management
- **PWA**: Workbox via vite-plugin-pwa
- **Deployment**: Firebase Hosting + GitHub Actions

## Common Development Tasks

### Adding New Features
1. Always run `npm run lint` first to check current code quality
2. Create components in `/src/components/` or route-specific views in `/src/routes/`
3. Add TypeScript types in `/src/types/` for new data structures
4. Update Firebase services in `/src/services/` for data persistence
5. Test manually using the validation scenarios above
6. Run `npm run build` to ensure TypeScript compilation succeeds
7. Run `npm run lint` before committing

### Debugging Build Issues
- TypeScript errors: Check `tsconfig.json` and type definitions in `/src/types/`
- Import errors: Verify file paths and module resolution in Vite config
- Firebase errors: Check configuration in `src/firebase.ts`
- API function errors: Check Vercel functions in `/api/` directory

### Working with Firebase
- Authentication: See `src/firebase.ts` and auth utilities in `/src/utils/`
- Database operations: See services in `/src/services/habitsPersistance.ts`
- Push notifications: Handled via `/api/sendNotificationIfTime.ts`
- Configuration is public and hardcoded (not sensitive)

## CI/CD Information
- GitHub Actions automatically deploy to Firebase Hosting on main branch
- Pull requests get preview deployments
- Build command in CI: `npm ci && npm run build`
- Deployment targets: Firebase Hosting (frontend) + Vercel (API functions)

## Known Issues and Limitations
- **mkcert plugin fails in CI environments** - use the workaround documented above
- **No automated test suite** - relies entirely on manual testing
- **15 vulnerabilities in dependencies** - mostly dev dependencies, safe to ignore
- **TypeScript version warning** - using newer TypeScript than officially supported by ESLint, but works fine
- **Large bundle size warnings** - normal for this app due to Firebase and MUI dependencies

## Important Notes for GitHub Copilot
- This codebase has NO automated tests - always perform manual validation
- The development server requires the mkcert workaround in CI environments
- Firebase configuration is public and safe to view/modify
- Build times are fast (under 30 seconds) - don't skip the build step
- The app uses atomic state management with Jotai - check `store.ts` for global state
- All routes are client-side - the app is a Single Page Application (SPA)