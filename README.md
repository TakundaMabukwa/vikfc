# vik-fc

A romantic love contract web application built with Next.js and Supabase.

## Features

- Interactive digital love contract with signature canvas
- Valentine's Day surprise page
- Persistent signature storage with Supabase
- Print-friendly PDF export
- Responsive design

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Supabase
- Tailwind CSS
- Radix UI Components

## Getting Started

1. Install dependencies:
```bash
npm install
# or
pnpm install
```

2. Set up environment variables:
Create a `.env.local` file with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

Run the SQL script in `scripts/001_create_signatures.sql` in your Supabase SQL editor to create the signatures table.

## Deployment

Deploy easily on Vercel or any Next.js-compatible platform.
