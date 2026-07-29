# Project context — TEOTIA & CO. Blog CMS

Living document: update this file as phases complete and decisions are made so future work does not require re-explaining the codebase.

**Last updated:** 2026-07-28  
**Current phase:** Phase 1 complete — ready for Phase 2  
**Primary plan:** See [plan.md](./plan.md)

---

## 1. Product identity

| Item | Value |
|------|--------|
| Brand | TEOTIA & CO. — Chartered Accountants |
| Repo folder | `TeotiaAndCo` |
| Public site URL (env) | `https://teotiaandco.com` (may change later) |
| Public site contact (UI) | contact@teotiaandco.com, +91 98765 43210, New Delhi |
| Enquiry / admin notification email | **info@easyncbooks.com** |

---

## 2. Tech stack (locked by spec)

### Frontend (existing)

- Next.js 16, React 19, TypeScript 5.x
- Styling: global CSS (`globals.css`, `page-styles.css`, component CSS) + Tailwind in some blog components
- Framer Motion for animations
- **Target:** dynamic Next (remove static export in Phase 7); same-origin `/api` via rewrites
- **No** API layer yet; **no** Jodit yet

### Backend (to build)

- Node.js, Express, TypeScript, MySQL (mysql2) — **local MySQL 8.0.46** for dev; production host TBD
- AWS SDK v3 (S3), Multer, Nodemailer
- JWT + bcrypt + cookie-parser
- Helmet, cors, compression, morgan, express-rate-limit
- Zod validation, ts-node-dev

### Monorepo layout (target)

```
TeotiaAndCo/
├── app/                 # Next.js App Router (public site + /admin)
├── components/
├── lib/
├── public/
├── backend/             # Express API (to create)
├── plan.md
├── context.md
└── ...
```

### Same-origin API (locked)

- Browser calls **`/api/v1/...`** on the site host (prod: reverse proxy to Express).
- Dev: Next `rewrites` → `http://127.0.0.1:<BACKEND_PORT>/api/:path*`.
- Admin JWT: HTTP-only cookie, `credentials: 'include'`, minimal CORS (same site).

---

## 3. Current frontend map

### Routes

| Route | File | Data source |
|-------|------|-------------|
| `/` | `app/page.tsx` | Static + `blogPosts.slice(0,3)` |
| `/about` | `app/about/page.tsx` | Static |
| `/services`, `/services/[slug]` | `app/services/*` | `lib/services.ts` |
| `/blog` | `app/blog/page.tsx` | `lib/blog-posts.ts` |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | `lib/blog-posts.ts`, `generateStaticParams` |
| `/contact` | `app/contact/page.tsx` | Client form → alert |

**Planned (Phase 7):** `/admin/*`, `/unsubscribe/success`

### Blog-related files

- **Data:** `lib/blog-posts.ts` — type `BlogPost`, ~20 mock posts → **seed into MySQL**
- **UI:** `components/blog/*` — grid, cards, category badge (maps to **category**; add optional tag chips later)
- **Behavior:** Client infinite scroll over in-memory array → replace with **API pagination**

### Forms (non-functional today)

- **Footer newsletter:** no handler
- **Contact:** alert only; fields include **`services`** select
- **Comments:** disabled input → need name, email, comment + moderation messaging

### Next.js config (until Phase 7)

- Still `output: 'export'` and `images.unoptimized: true` — **must change** for CMS

---

## 4. Content model (locked)

### Blog

| Concept | Rule |
|---------|------|
| **Category** | Exactly **one** per post (e.g. Taxation, GST, Compliance, Company Law). Shown on cards. |
| **Tags** | **Many** per post (renamed from “Hashtags” in UX). Filter in list API. Cards show **≤ 2 tags**; detail shows **all**. |
| **Author** | `author_name` defaults to **logged-in admin’s name**; **editable** on create/update. |
| **Popular** | Sort by `view_count` (increment on public post view). **`view_count` only in admin APIs/UI**, not public. |

### Comments

- New comments → **`pending`**
- Public list → **`approved` only**
- Admin: approve / reject / delete

### Subscribers

- Unsubscribe via email link (`token`)
- On click: validate token → set **`unsubscribed_at`** (do not delete row) → **success page**

### Enquiries

| Form field | DB / API |
|------------|----------|
| `name` | `name` |
| `number` | `phone` |
| `email` | `email` |
| `services` | **`service_type`** (value) + **`subject`** (human-readable label) |
| `message` | `message` |

---

## 5. Frontend ↔ API mapping

| UI (`BlogPost` today) | API | Notes |
|----------------------|-----|--------|
| `title` | `heading` | |
| `excerpt` | `shortDescription` | |
| `content[]` | `body` (HTML) | Sanitized render |
| `image` | `featuredImage` | S3 URL |
| `category` | `category.name` | Single |
| (new) | `tags[]` | Card: slice(0,2); detail: all |
| `author` | `authorName` | |
| `slug` | `slug` | |
| `date` | `publishedAt` | Formatted in mapper |
| `readTime` | — | From HTML word count |

---

## 6. Backend module ownership (target)

| Module | Service | Repository |
|--------|---------|------------|
| Auth | AuthService | Admin, Otp, LoginHistory |
| Blog | BlogService | Blog, Category, Tag |
| Comment | CommentService | Comment, Subscriber |
| Subscriber | SubscriberService | Subscriber |
| Enquiry | EnquiryService | Enquiry |
| Dashboard | DashboardService | aggregates |
| Mail | MailService | templates + nodemailer |
| Storage | S3 via utils / BlogService | — |

---

## 7. Authentication rules

- **Single admin** seeded initially; table supports more admins later (2–3).
- Email + password → OTP when first login or **> 7 days** since `lastVerifiedAt` → JWT in HTTP-only cookie.
- Login history recorded.

---

## 8. Environment variables

**Backend:** see `backend/.env.example` (Phase 1) — include `BASE_URL=https://teotiaandco.com`.

**Frontend:**

- `NEXT_PUBLIC_SITE_URL=https://teotiaandco.com`
- API client base: **`/api/v1`** (relative, same-origin)

Never commit `.env` files.

---

## 9. Decisions log

| ID | Topic | Status | Decision |
|----|--------|--------|----------|
| D1 | Static export vs dynamic Next | **LOCKED** | Dynamic Next; remove static export in Phase 7 |
| D8 | API hosting | **LOCKED** | Same-origin `/api` → Express (rewrites / reverse proxy) |
| D2 | Enquiry email recipient | **LOCKED** | info@easyncbooks.com |
| D3 | Contact form | **LOCKED** | Store `service_type` + `subject` |
| D4 | Category vs tags | **LOCKED** | One category + many tags; UI “Tags” |
| D5 | Author | **LOCKED** | Default admin name; overridable per blog |
| D6 | Comments | **LOCKED** | Admin approval required |
| D7 | Seed mock posts | **LOCKED** | Yes, from `lib/blog-posts.ts` |
| D9 | MySQL | **LOCKED** | Local dev **8.0.46**; production TBD |
| D13 | SMTP | **LOCKED** | Real SMTP credentials available (OTP, newsletters, enquiries) |
| D10 | Admin count | **LOCKED** | One seed now; multi-admin-ready schema |
| D11 | View count | **LOCKED** | Track for popular sort; admin-only display |
| D12 | Unsubscribe | **LOCKED** | Token GET → unsubscribed_at + success page |

---

## 10. Phase progress tracker

| Phase | Description | Status | Completed date | Notes |
|-------|-------------|--------|----------------|-------|
| 0 | Analysis + plan + decisions | Done | 2026-07-28 | |
| 1 | Backend foundation | **Done** | 2026-07-29 | `backend/` Express + TS; `GET /health` |
| 2 | Database + migrations + seed | Not started | | Includes blog import seed |
| 3 | Authentication | Not started | | |
| 4 | Blog + S3 + public search | Not started | | Category/tag filters |
| 5 | Subscribers, comments, enquiries, email | Not started | | Moderation + unsubscribe |
| 6 | Dashboard APIs | Not started | | |
| 7 | Frontend + admin integration | Not started | | Rewrites, dynamic blog |

---

## 11. Session changelog

### 2026-07-28 (initial)

- Deep analysis; created `plan.md` and `context.md`.

### 2026-07-28 (decisions)

- Locked deployment (dynamic + same-origin), URLs, email, taxonomy (category + tags), author, comment moderation, seed, MySQL dev, single admin, view_count privacy, unsubscribe flow.
- Updated `plan.md` schema and phases accordingly.

### 2026-07-29

- **Phase 1:** `backend/` scaffold — env (Zod), MySQL pool, middleware, ApiError/ApiResponse, logger, pagination, error handler, `GET /health`, `/api/v1` router stub. Verified `npm run build` and health/404 responses.

### 2026-07-28 (infra)

- MySQL **8.0.46** confirmed for local dev.
- **SMTP credentials available** — use real Nodemailer in dev/staging (no mail stub unless env missing).

---

## 12. Commands reference (when backend exists)

```bash
cd backend
cp .env.example .env
# Set JWT_SECRET and COOKIE_SECRET (16+ chars). Create DB: teotia_blog
npm install
npm run dev
```

**Local dev tip:** use `BASE_URL=http://localhost:3000` in `.env` until production deploy. Set `SKIP_DB_CHECK=true` only if MySQL is not running yet (Phase 2 creates schema).

**Dev same-origin:** Next rewrites `/api/*` to backend; both processes run locally.

---

## 13. Key contacts / credentials

- Admin seed: `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` in env only — document in backend README.
