# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production (includes sitemap generation)
npm run start        # Start production server
npm run lint         # Run Biome linter
npm run format       # Format code with Biome
npm run secretlint   # Check for secrets in files
```

## Architecture

**High or Low** is a mood tracking PWA built with Next.js 16 and Supabase.

### Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: Tailwind CSS v4, shadcn/ui, Radix UI
- **Backend**: Supabase (Auth, PostgreSQL)
- **i18n**: next-intl (Japanese/English)
- **PWA**: Serwist, react-ios-pwa-prompt
- **Charts**: Recharts

### File Structure

- `src/app/[locale]/` - Locale-based routing
  - `(app)/` - Authenticated app pages (home, stats, settings)
  - `auth/` - Authentication pages (login, signup)
- `src/components/ui/` - Global shadcn/ui components only
- `src/app/[locale]/(app)/_components/` - App-scoped components
- `src/app/[locale]/(app)/[page]/_components/` - Page-scoped components
- `src/lib/supabase/` - Supabase client configurations

### Component Organization

- `src/components/` is reserved for global/reusable UI components (shadcn)
- Feature-specific components go in `_components/` directories within their scope
- Use relative imports for scoped components, `@/` for global imports

### Key Patterns

- **Environment Variables**: Type-safe with `@t3-oss/env-nextjs` in `src/env.ts`
- **Navigation**: Use `@/i18n/navigation` instead of direct Next.js imports
- **Auth**: Server-side auth check in `(app)/layout.tsx`
- **Database**: Mood entries stored with date (YYYY-MM-DD) and level (1-5)

## Code Standards

- **Linting**: Biome for formatting and linting
- **Git Hooks**: Lefthook runs Biome, TypeScript, and Secretlint on pre-commit
- **TypeScript**: Strict mode with `@total-typescript/ts-reset` and `better-typescript-lib`

## Important Notes

- All user-facing text must be internationalized via next-intl
- Filter operations require explicit boolean conditions (ts-reset enforces this)
- PWA assets and manifest are in `/public/`
