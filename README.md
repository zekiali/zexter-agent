# ZEXTER AGENT

Pre-market futures trading intelligence tool for MNQ/NQ trading.

## Stack

- Next.js 14 (App Router)
- Supabase (database)
- Anthropic API — `claude-sonnet-4-20250514` with web_search tool
- Finnhub API (economic calendar)
- Tailwind CSS
- Recharts

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in your keys:

```
FINNHUB_KEY=your_finnhub_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database setup

Run `lib/schema.sql` in your Supabase SQL editor to create the required tables:

- `daily_briefs` — AI-generated pre-market intelligence
- `trade_logs` — individual trade records
- `account_snapshots` — Apex account balance snapshots

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Open the dashboard at 6–8 AM CT
2. Click **Settings** → **Fetch Calendar** to load Finnhub economic events
3. Click **◆ Generate Brief** to run the AI analysis
4. Review day type, catalyst, time windows, and trade parameters
5. Enter live RVOL and MCDX values to get GO/NO-GO signal
6. Log trades in the Session Trade Log

## Deploy to Vercel

```bash
npx vercel --prod
```

Set environment variables in Vercel dashboard under Project → Settings → Environment Variables.

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/calendar` | GET | Fetch Finnhub economic calendar (today + tomorrow) |
| `/api/brief` | POST | Generate AI pre-market brief |
| `/api/trades` | GET, POST | Fetch / log trades |
| `/api/analytics` | GET | Aggregate performance stats |
| `/api/accounts` | GET, POST | Account snapshots |
