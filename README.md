# Task Management App Frontend

React, TypeScript, Vite, Tailwind CSS, Axios, React Router, and Lucide icons power the frontend for the Task Management App.

## Features

- Modern login and register pages with responsive glass-style layouts.
- Password visibility toggle on login and register forms.
- Remember me support on login for saving the user's email locally.
- Google authentication buttons connected to the backend OAuth route.
- Role-based login redirect for admin and user dashboards.
- User dashboard for creating, editing, searching, filtering, paginating, deleting, and updating task status.
- Admin dashboard for viewing users, blocking or unblocking users, deleting users, assigning tasks, and monitoring all tasks.
- Light and dark theme support with polished dark panels and colorful dashboard accents.

## Pages

- `/` - Login
- `/register` - Register
- `/dashboard` - User dashboard
- `/admin` - Admin dashboard
- `/google-success` - Google OAuth success handler

## Requirements

- Node.js
- npm
- Backend API running on `https://task-managment-app-backend.onrender.com`

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

The Vite app usually starts on `http://localhost:5173`. If that port is busy, Vite will use the next available port.

## Build

```bash
npm run build
```

This runs the TypeScript build and creates the production bundle in `dist`.

## Lint

```bash
npm run lint
```

## Notes

- Auth tokens, roles, theme preference, username, and remembered email are stored in `localStorage`.
- The frontend expects the backend auth, admin, and task routes to be available under `https://task-managment-app-backend.onrender.com/api`.
