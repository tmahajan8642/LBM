# LightBill — Electricity Bill Management System

A modern full-stack light bill management system built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **PostgreSQL**, and **NextAuth**.

## Languages

The app supports **4 languages**:

| Code | Language |
|------|----------|
| `en` | English |
| `hi` | हिन्दी (Hindi) |
| `mr` | मराठी (Marathi) |
| `gu` | ગુજરાતી (Gujarati) |

Use the **language switcher** (globe icon) in the header or sidebar. Your choice is saved in a cookie.

To add more languages, create `src/i18n/messages/<code>.json` (copy `en.json`) and add the locale to `src/i18n/config.ts`.

## Features

### Admin
- Dashboard with statistics and revenue charts
- Create, edit, and delete renters
- Generate bills from meter readings (auto-calculated units & amount)
- Search and filter bills (year, month, status)
- Year-wise reports and monthly history
- Export bills to PDF
- Mobile-responsive sidebar layout

### Renter
- View own bills with filters
- Bill detail page with PDF download
- Profile management
- Dashboard statistics

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + ShadCN UI
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth v5 (Credentials, JWT)
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **PDF:** jsPDF + jspdf-autotable

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. **Install dependencies**

```bash
cd zxp
npm install
```

2. **Configure environment**

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/lightbill?schema=public"
AUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

3. **Set up database**

```bash
npm run db:push
npm run db:seed
```

4. **Start development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Credentials

| Role   | Email                 | Password   |
|--------|-----------------------|------------|
| Admin  | admin@lightbill.com   | admin123   |
| Renter | john@example.com      | renter123  |
| Renter | jane@example.com      | renter123  |

## Bill Calculation

```
Units = Current Reading - Previous Reading
Amount = (Units × Rate Per Unit) + Fixed Charge
```

## Project Structure

```
zxp/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Sample data
├── src/
│   ├── app/
│   │   ├── (public)/    # Home, About, Contact
│   │   ├── admin/       # Admin dashboard & CRUD
│   │   ├── renter/      # Renter portal
│   │   └── login/       # Authentication
│   ├── actions/         # Server actions
│   ├── components/      # UI components
│   ├── lib/             # Auth, Prisma, utils, PDF
│   └── middleware.ts    # Route protection
└── .env.example
```

## Scripts

| Command           | Description              |
|-------------------|--------------------------|
| `npm run dev`     | Start dev server         |
| `npm run build`   | Production build         |
| `npm run db:push` | Push schema to database  |
| `npm run db:seed` | Seed demo data           |
| `npm run db:studio` | Open Prisma Studio     |

## Deployment

1. Set environment variables on your hosting platform (Vercel, Railway, etc.)
2. Run `npm run build`
3. Ensure PostgreSQL is accessible
4. Run migrations: `npx prisma migrate deploy`
5. Seed if needed: `npm run db:seed`

## License

MIT
