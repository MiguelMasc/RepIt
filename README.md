# Installation Instructions

## Prerequisites
- Node.js 18 or higher
- npm or yarn

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/Miguel61823/RepIt.git
cd repit
cd gymerapp
```

2. Install Dependencies
```bash
npm install
# or if using yarn
yarn install
```

3. Set Up Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Open .env and configure your environment variables
```

Required environment variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`= Your Clerk publishable key
- `CLERK_SECRET_KEY`= Your Clerk secret key

- `DATABASE_URL`= Your Neon Postgres Database URL
- `ANTHROPIC_API_KEY`= Your Anthropic api key

4. Start the Development Server
```bash
npm run dev
# or
yarn dev
```

Your application should now be running on `http://localhost:3000`

## Production Build

To create and run a production build:

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Tech Stack

- **Framework:** Next.js (frontend + API routes)
- **Language:** TypeScript
- **Database:** PostgreSQL (hosted on Neon)
- **ORM:** Drizzle ORM
  
