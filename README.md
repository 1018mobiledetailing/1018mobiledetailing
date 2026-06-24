# HomeHQ

A mobile-first family household management web app built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Family Dashboard** — Overview of groceries, reminders, bills, and projects
- **Grocery List** — Shared list with categories, priority, store assignment, and due dates
- **Reminders** — Family reminders with person assignment, repeat frequency, and priority
- **Upload Center** — Private file storage for images, PDFs, and documents
- **Meal Planner** — Weekly meal planning calendar
- **Bills** — Bill tracking with due dates, amounts, and autopay status
- **Vehicles** — Vehicle records with insurance, inspection, registration, and maintenance tracking
- **Home Projects** — Project management with status tracking and priority
- **Settings** — Family management, invite codes, and profile editing

## Security

- Supabase Row Level Security (RLS) on all tables
- Families are fully isolated — users can only access their own family's data
- Children cannot access bills or financial information
- Uploads are private — no public URLs; access via signed URLs only
- No hardcoded API keys — all secrets via environment variables

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend/Auth/DB**: Supabase (PostgreSQL + Auth + Storage)
- **Icons**: Lucide React

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd 1018mobiledetailing
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned

### 3. Set up the database

In the Supabase dashboard, go to **SQL Editor** and run these files in order:

1. `supabase/schema.sql` — Creates all tables and enables RLS
2. `supabase/rls-policies.sql` — Sets up Row Level Security policies

**Optional**: Run `supabase/seed.sql` to populate sample data for the Johnson family.

### 4. Create the uploads storage bucket

In the Supabase dashboard, go to **Storage** and create a new bucket:

- **Name**: `uploads`
- **Public**: OFF (private)

### 5. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your values from the Supabase project dashboard (Settings > API):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## User Flow

1. **Sign up** with email and password at `/auth`
2. **Create your family** on the onboarding page — give your family a name and set your display name
3. **Share your invite code** from Settings so other family members can join
4. **Start using** the dashboard and all features

## Family Roles

| Role  | Dashboard | Groceries | Reminders | Uploads | Bills | Vehicles | Projects | Meals |
|-------|-----------|-----------|-----------|---------|-------|----------|----------|-------|
| Admin | Full      | Full      | Full      | Full    | Full  | Full     | Full     | Full  |
| Adult | Full      | Full      | Full      | Full    | Full  | Full     | Full     | Full  |
| Child | Limited   | View/Add  | View      | Limited | None  | View     | View/Add | View  |

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    auth/                 # Sign in / sign up
    onboarding/           # Family setup for new users
    groceries/            # Grocery list
    reminders/            # Reminders
    uploads/              # File uploads
    meals/                # Meal planner
    bills/                # Bills tracker
    vehicles/             # Vehicle management
    home-projects/        # Home projects
    settings/             # Family & account settings
    more/                 # Secondary navigation
  components/             # Reusable components
    AppShell.tsx          # Page layout with header and bottom nav
    BottomNav.tsx         # Mobile bottom navigation
    Modal.tsx             # Slide-up modal for forms
    DashboardCard.tsx     # Stats card for the dashboard
    GroceryItem.tsx       # Single grocery list item
    ReminderCard.tsx      # Single reminder card
    UploadCard.tsx        # Single upload card
    FamilyMemberSelector.tsx  # Member dropdown + avatar
    CategoryBadge.tsx     # Category label badge
    PriorityBadge.tsx     # Priority label badge
    AddButton.tsx         # Add / FAB button
  contexts/
    AuthContext.tsx        # User authentication state
    FamilyContext.tsx      # Family data and members
  lib/
    supabase/
      client.ts            # Browser Supabase client
      server.ts            # Server Supabase client
  types/
    database.ts            # TypeScript types for all tables
  middleware.ts            # Auth redirect middleware

supabase/
  schema.sql              # Database tables and indexes
  rls-policies.sql        # Row Level Security policies
  seed.sql                # Sample family data
```

## Deployment

The app is designed for deployment on [Vercel](https://vercel.com):

1. Push code to GitHub
2. Import the repository in Vercel
3. Add environment variables in the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Development Notes

- All pages use client-side data fetching for simplicity
- Forms use optimistic updates for toggle operations (complete/paid)
- The middleware redirects unauthenticated users to `/auth`
- New users without a family are redirected to `/onboarding`
- Storage paths follow the pattern: `{family_id}/{member_id}/{timestamp}.{ext}`
- File access uses Supabase signed URLs (60 second expiry) — no public URLs
