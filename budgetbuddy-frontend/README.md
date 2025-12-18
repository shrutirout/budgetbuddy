# BudgetBuddy Frontend

React + Vite frontend for BudgetBuddy personal finance tracker.

## Tech Stack

- **React** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Recharts** - Charts and analytics

## Setup Instructions

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment variables**
```bash
# Copy .env.example to .env
cp .env.example .env

# Update VITE_API_URL with your backend URL
```

3. **Run the development server**
```bash
npm run dev
```

App will run on http://localhost:5173

4. **Build for production**
```bash
npm run build
```

## Project Structure

```
budgetbuddy-frontend/
├── src/
│   ├── components/    # Reusable UI components
│   │   ├── auth/     # Login, Signup
│   │   ├── dashboard/
│   │   ├── expenses/
│   │   ├── income/
│   │   ├── budget/
│   │   └── common/   # Shared components
│   ├── services/     # API calls
│   ├── utils/        # Helper functions
│   ├── pages/        # Page components
│   └── context/      # React Context
└── .env             # Environment variables
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
