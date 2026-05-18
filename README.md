# PostPilot ✈️
**Plan it. Post it. Learn what works.**

A creator operating system for TikTok growth — built for small creators who want to grow without guessing.

---

## Quick Start

### 1. Clone & Install
```bash
npm install
```

### 2. Set Up Supabase
1. Go to [supabase.com](https://supabase.com) and create a free project
2. Copy `.env.local.example` → `.env.local`
3. Fill in your Supabase URL and anon key from the project dashboard

```bash
cp .env.local.example .env.local
# Edit .env.local with your values
```

### 3. Run Database Schema
1. In Supabase dashboard → SQL Editor
2. Paste and run the contents of `supabase/schema.sql`

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## App Structure

```
app/
  page.tsx                    # Login / Signup
  (app)/
    layout.tsx                # Sidebar shell + auth guard
    dashboard/page.tsx        # Home dashboard
    ideas/page.tsx            # Idea Vault (kanban + list)
    ideas/new/page.tsx        # Add idea form
    ideas/[id]/edit/page.tsx  # Edit idea form
    posts/page.tsx            # Post Journal list
    posts/new/page.tsx        # Log a post form
    posts/[id]/page.tsx       # Post detail + metric snapshots
    calendar/page.tsx         # Content calendar
    insights/page.tsx         # Analytics & patterns
    settings/page.tsx         # Profile + content pillars

lib/
  types.ts                    # All TypeScript types
  utils.ts                    # Helpers, labels, colors
  supabase/client.ts          # Supabase browser client
  services/data.ts            # All data access + insights engine
  context/AuthContext.tsx     # Auth state + profile context

supabase/
  schema.sql                  # Full DB schema with RLS policies
```

---

## Sprint Roadmap

**Done (Sprint 1-3):**
- Auth (sign up / sign in)
- Creator profile setup
- Content pillars management
- Idea Vault with kanban board & list view
- Content Calendar with month view
- Post Journal (log posts, view all)
- Post detail with metric snapshot tracker (1h/3h/24h/48h/7d/30d)
- Engagement rate, save rate, follow conversion auto-calculated
- Dashboard with stats overview
- Insights engine: best format, best pillar, best posting hour, winner posts

**Next (Sprint 4-6):**
- [ ] AI hook/caption suggestions (OpenAI API)
- [ ] Experiments tracker
- [ ] Weekly content plan generator
- [ ] TikTok URL auto-fill via public data
- [ ] Monetization event tracking
- [ ] Notifications / reminders

---

## Tech Stack
- **Frontend:** Next.js 15, Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Charts:** Recharts
- **Fonts:** Syne + DM Sans
- **Deploy:** Vercel (connect GitHub repo, add env vars)
