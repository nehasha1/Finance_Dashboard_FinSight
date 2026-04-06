# FinSight - Personal Finance Dashboard

FinSight is a React + TypeScript finance dashboard for tracking income, expenses, and savings goals.  
It includes interactive charts, transaction management, role-based controls, dark mode, and CSV export.

## Features

- Dashboard overview with key metrics (income, expenses, savings rate)
- Transaction CRUD (create, read, update, delete)
- Search, filter, and sort transactions
- Savings goals tracking with progress indicators
- Insights page for spending trends and category analysis
- Role toggle (`Admin` / `Viewer`) for editable vs read-only actions
- Dark mode toggle
- CSV export for filtered transaction data
- Local storage persistence

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- React Router 7
- Recharts
- Framer Motion
- React Toastify
- Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+ (or equivalent)

### Install and Run

```bash
npm install
npm run dev
```

Open the URL shown in your terminal (usually `http://localhost:5173`).

## Available Scripts

- `npm run dev` - start development server
- `npm run build` - run TypeScript build and create production bundle
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint checks

## Project Structure

```text
src/
  components/   reusable UI components
  context/      global app state (context provider)
  data/         mock/seed data
  pages/        routed pages (Dashboard, Transactions, Insights, Goals)
  types/        TypeScript types
  utils/        helpers (formatting, export, calculations)
```

## Notes

- Data is stored in browser local storage, so it persists across refreshes on the same browser/device.
- `Viewer` role is useful for demos where editing should be disabled.
