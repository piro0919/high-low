# High or Low

A simple mood tracking PWA that helps you record and visualize your daily energy levels.

## Features

- Track daily mood/energy levels (1-5 scale)
- Calendar view with color-coded entries
- 30-day trend chart with averages
- Multi-language support (Japanese/English)
- Dark/Light theme
- PWA support for mobile installation

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **i18n**: next-intl
- **Charts**: Recharts
- **PWA**: Serwist

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase account (or local Supabase)

### Setup

1. Install dependencies:

```bash
npm install
```

1. Start local Supabase:

```bash
supabase start
```

1. Set up environment variables:

```bash
cp .env.example .env.local
```

Then update `.env.local` with values from `supabase status`:

```bash
# Get these values from: supabase status
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:56321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SECRET_KEY=sb_secret_xxx
```

1. Start development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

### File Structure

- `.env.example` - Template showing required variables (committed to git)
- `.env.local` - Local development values (git ignored)
- `.env.production.local` - Production values for scripts (git ignored, optional)

### Required Variables

| Variable                               | Description                   | Where to get                                  |
| -------------------------------------- | ----------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase API URL              | `supabase status` (local) or Dashboard (prod) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client-side key               | `supabase status` (local) or Dashboard (prod) |
| `SUPABASE_SECRET_KEY`                  | Server-side key (for scripts) | `supabase status` (local) or Dashboard (prod) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`         | Web Push public key           | `npx web-push generate-vapid-keys --json`     |
| `VAPID_PRIVATE_KEY`                    | Web Push private key          | Same command as above                         |
| `VAPID_SUBJECT`                        | Web Push contact              | `mailto:your-email@example.com`               |

### Key Formats

Supabase local development uses the new key format:

- **Publishable**: `sb_publishable_xxx` (client-side)
- **Secret**: `sb_secret_xxx` (server-side)

Do not mix with legacy JWT format (`eyJhbG...`).

## Scripts

| Command              | Description              |
| -------------------- | ------------------------ |
| `npm run dev`        | Start development server |
| `npm run build`      | Build for production     |
| `npm run start`      | Start production server  |
| `npm run lint`       | Run Biome linter         |
| `npm run format`     | Format code with Biome   |
| `npm run secretlint` | Check for secrets        |
| `npm run push:test`  | Test push notifications  |

### Push Notification Testing

```bash
# Local - all users
npm run push:test

# Local - specific user
npm run push:test -- --user <user_id>

# Production - specific user (--user is required)
npm run push:test:prod -- --user <user_id>
```

Note: Production environment requires `--user` option to prevent accidental mass notifications.

## Project Structure

```text
src/
├── app/[locale]/
│   ├── (app)/           # Authenticated pages
│   │   ├── _components/ # App-scoped components
│   │   ├── settings/    # Settings page
│   │   └── stats/       # Statistics page
│   └── auth/            # Authentication pages
├── components/ui/       # Global UI components (shadcn)
├── i18n/                # Internationalization config
└── lib/supabase/        # Supabase clients
```

## License

MIT
