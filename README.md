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

1. Set up environment variables:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

1. Run database migrations:

```bash
npx supabase db push
```

1. Start development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Scripts

| Command              | Description              |
| -------------------- | ------------------------ |
| `npm run dev`        | Start development server |
| `npm run build`      | Build for production     |
| `npm run start`      | Start production server  |
| `npm run lint`       | Run Biome linter         |
| `npm run format`     | Format code with Biome   |
| `npm run secretlint` | Check for secrets        |

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
