# BudgetBuddy Backend

Node.js + Express API for BudgetBuddy personal finance tracker.

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Prisma** - ORM for PostgreSQL
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Setup Instructions

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment variables**
```bash
# Copy .env.example to .env
cp .env.example .env

# Update .env with your database URL and JWT secret
```

3. **Set up database**
```bash
# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

4. **Run the server**
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server will run on http://localhost:5000

## API Endpoints

- `GET /health` - Health check
- `GET /` - API information

(More endpoints will be added as features are implemented)

## Project Structure

```
budgetbuddy-backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Auth, error handling
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── utils/         # Helper functions
│   └── server.js      # Express app entry
├── prisma/
│   └── schema.prisma  # Database schema
└── .env              # Environment variables
```
