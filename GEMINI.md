# Project Olimp Frontend

## Overview
Project Olimp Frontend is a modern web application built with **Next.js 15 (App Router)** and **React 19**. It serves as the user interface for the "Olimp" system, providing functionality for both students and administrators.

### Main Technologies
- **Framework:** Next.js 15.3.2
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **State/Data Fetching:** Axios with a custom `apiService` wrapper.
- **Forms:** React Hook Form with Yup validation.
- **Tables:** @tanstack/react-table for data management.
- **Cookies:** js-cookie for authentication token management.

## Project Structure
- `src/app`: Contains the Next.js App Router structure.
    - `(app)`: Protected application routes (Cabinet, Catalogue, Disciplines, etc.).
    - `(auth)`: Authentication-related routes (Login, Change Password).
- `src/components`: Reusable UI and layout components.
    - `ui`: Base components like `DataTable`, `Modal`, `FilterBox`.
    - `layouts`: Higher-level layout wrappers.
- `src/services`: Business logic and API services (`axiosService.ts`, `cookie-servies.ts`).
- `src/constants`: Project-wide constants (`routes.ts`, `cookies.ts`).
- `src/asssets`: SVG components and other static assets.

## Authentication & Authorization
- **Cookie-based Auth:** The application uses a cookie named `userProfile` (defined in `USER_PROFLE` constant) to store user session information.
- **Middleware:** `src/middleware.ts` handles route protection and redirection based on the presence of the authentication cookie.
- **Role-based Logic:** Navigation and access are role-dependent. Role ID `2` typically represents an Administrator.

## Development Guide

### Building and Running
- **Development Server:** `npm run dev`
- **Build for Production:** `npm run build`
- **Start Production Server:** `npm run start`
- **Linting:** `npm run lint`

### API Integration
The API base URL is currently hardcoded in `src/services/axiosService.ts` as `http://212.3.125.183:5154/api/`. Use `apiService` for making HTTP requests to ensure authentication headers are automatically attached.

### Coding Conventions
- **Functional Components:** Use functional components with TypeScript interfaces for props.
- **Styling:** Use Tailwind CSS utility classes. Avoid custom CSS unless necessary (use `src/app/globals.css`).
- **Icons:** SVG icons are stored as React components in `src/asssets/svgs`.
- **Navigation:** Use the `ROUTES` constant from `src/constants/routes.ts` for internal linking.

## Key Files
- `src/middleware.ts`: Core routing and security logic.
- `src/services/axiosService.ts`: Centralized API configuration.
- `src/components/ui/DataTable.tsx`: Main component for data display.
- `src/app/(app)/layout.tsx`: Layout for the authenticated area.
