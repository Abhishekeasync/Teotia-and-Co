# Blog CMS — Full Implementation Plan

**Project:** TEOTIA & CO. (TeotiaAndCo)  
**Scope:** Production backend (`backend/`) + frontend API integration (existing Next.js UI)  
**Approach:** Phased delivery — complete and verify each phase before starting the next  
**Last updated:** 2026-07-28 (decisions locked)  

---

## 0. Deep analysis summary (current project)

### 0.1 What exists today

| Area | Status |
|------|--------|
| Next.js 16 App Router, React 19, TypeScript | ✅ |
| Marketing pages: Home, About, Services, Contact | ✅ |
| Blog listing (`/blog`) and detail (`/blog/[slug]`) | ✅ (static mock data) |
| Blog UI components (grid, cards, featured, infinite scroll) | ✅ |
| Contact form UI | ✅ (submit → `alert` only) |
| Footer newsletter UI | ✅ (no submit logic) |
| Blog comments UI | ✅ (single disabled input; no name/email) |
| Backend folder | ❌ Not present |
| API client / `fetch` / env for API | ❌ None |
| Admin UI / login / CMS | ❌ None |
| Jodit editor | ❌ Not in `package.json` |
| Search / filter / sort on blog | ❌ Not in UI (grid uses local array + infinite scroll) |
| Social share | ❌ Placeholder “⋯” button only |

### 0.2 Deployment model — **LOCKED (D1, D8)**

**Decision:** Move to **dynamic Next.js** (remove `output: 'export'`). API is **same-origin**: browser calls `https://teotiaandco.com/api/v1/...` (production) via reverse proxy to Express; dev uses Next **rewrites** to the backend port.

Implications:

- Remove static export; blog routes fetch from API at request time (SSR/ISR or `force-dynamic` as needed).
- JWT cookies: `SameSite=Lax`, path `/`, no cross-subdomain CORS for admin.
- `NEXT_PUBLIC_API_BASE_URL` in prod can be **empty or `/api/v1`** (relative same-origin); `BASE_URL` / `NEXT_PUBLIC_SITE_URL` = `https://teotiaandco.com` (may change later — keep env-driven).

**Current code debt:** `next.config.js` still has `output: 'export'` until Phase 7.

### 0.3 Frontend vs backend data model gap

| Frontend (`BlogPost` in `lib/blog-posts.ts`) | Backend spec |
|-----------------------------------------------|--------------|
| `title` | `heading` |
| `excerpt` | `shortDescription` |
| `content: string[]` (paragraphs) | `body` (rich HTML) |
| `image` | `featuredImage` (S3 URL) |
| `category` (single label) | **`category`** (single FK — Taxation, GST, etc.) |
| — | **`tags`** (many-to-many; UI label “Tags”, not “Hashtags”) |
| `author`, `authorAvatar` | **`authorName`** (default: creating admin’s name; overridable per post) |
| `date` (display string, e.g. “Jan 31”) | `publishedAt`, `createdAt` |
| `readTime` (e.g. “4 min read”) | Not in spec |
| — | `metaTitle`, `metaDescription`, `canonicalUrl`, `ogImage`, `status` |

Integration layer must define: **cards** show primary **category** + up to **2 tags**; **detail** shows all tags; read-time from HTML word count; author from `authorName`; HTML body via sanitizer (`isomorphic-dompurify` or server whitelist).

### 0.4 Contact / enquiry field mismatch

| Contact form (`app/contact/page.tsx`) | Enquiry module spec |
|---------------------------------------|---------------------|
| `name`, `number`, `email`, `services` (select), `message` | `name`, `email`, `phone`, `subject`, `message` |

Store **`service_type`** (select value) **and** human-readable **`subject`** (e.g. label “Tax Planning & Filing”) in `enquiries`.

### 0.5 Email — **LOCKED (D2)**

- **Enquiry notifications to:** `info@easyncbooks.com`
- Site/marketing contact copy may remain `contact@teotiaandco.com` (UI only unless changed)

### 0.6 Content seed — **LOCKED (D7)**

~20 posts in `lib/blog-posts.ts` → **seed script** maps `category` to `categories`, body from mock paragraphs (HTML wrap), default author; tags can be empty or inferred in seed if desired.

---

## 1. Target architecture

```
┌─────────────────┐     HTTPS + cookies (admin)     ┌──────────────────┐
│  Next.js (UI)   │ ◄──────────────────────────────►│ Express API      │
│  Public + Admin │     JSON API (public + admin)   │  backend/        │
└─────────────────┘                                 └────────┬─────────┘
                                                               │
                    ┌──────────────────────────────────────────┼──────────┐
                    ▼                    ▼                     ▼          ▼
                 MySQL                 AWS S3              SMTP      (future jobs)
```

**Layers (backend):** Routes → Controllers (thin) → Services (business logic) → Repositories (SQL) → MySQL  

**Cross-cutting:** Zod validators, middleware (auth, validation, upload, error), utils (ApiResponse, ApiError, asyncHandler, logger, pagination, jwt, otp, slug, s3, mail).

---

## 2. Repository layout (backend)

Create `backend/` at repo root (sibling to `app/`, `components/`):

```
backend/
├── src/
│   ├── config/          database.ts, aws.ts, mail.ts, env.ts
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── routes/
│   ├── middlewares/     auth, validation, upload, error
│   ├── validators/
│   ├── interfaces/
│   ├── models/          (types/DTOs if not ORM entities)
│   ├── constants/
│   ├── types/
│   ├── jobs/            e.g. bulk email queue-ready stubs
│   ├── templates/       HTML email templates
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── migrations/          or sql/
├── seeds/
├── .env.example
├── package.json
├── tsconfig.json
├── eslint.config.js
├── .prettierrc
└── README.md
```

---

## 3. Global standards (all phases)

### 3.1 API response shape

- **Success:** `{ success: true, message: string, data: T }`
- **Failure:** `{ success: false, message: string, errors: string[] | object[] }`

Implement `ApiResponse` and `ApiError` once; use everywhere.

### 3.2 Error handler coverage

Validation (Zod), JWT, authz, MySQL (duplicate, FK), AWS, Multer, Nodemailer, generic 500. No stack traces in production.

### 3.3 Security baseline

Helmet, CORS (same-origin primary; dev rewrite minimizes cross-origin), rate limits (stricter on auth/OTP/contact), HTTP-only secure cookies for JWT, parameterized queries only, sanitize HTML for blog body storage policy, env validation on boot (`env.ts` with Zod).

### 3.4 Logging

Morgan for HTTP; custom logger for auth, uploads, email failures, errors.

---

## 4. Phase 1 — Backend foundation

**Goal:** Compilable, runnable Express + TypeScript skeleton with global middleware and utilities.

### Steps

1. **Initialize Node project** in `backend/`: `package.json`, scripts (`dev`: ts-node-dev, `build`, `start`, `lint`).
2. **TypeScript:** strict mode, path aliases if needed, `outDir` → `dist/`.
3. **ESLint + Prettier:** align with strict TS; ignore `dist/`.
4. **Environment:** `.env.example` (all vars from spec); `config/env.ts` validate with Zod; fail fast on missing required vars.
5. **Express app:** `app.ts` — json parser, cookie-parser, compression, helmet, cors, morgan, rate limiter(s), health route `GET /health`.
6. **MySQL pool:** `config/database.ts` using mysql2/promise; connection test on startup (optional retry).
7. **Utilities:**
   - `ApiError` (statusCode, message, errors?)
   - `ApiResponse` static helpers (`success`, `fail`)
   - `asyncHandler` wrapper
   - `logger` (level by NODE_ENV)
   - `pagination` (parse page/limit, return meta: total, page, limit, totalPages)
8. **Error middleware:** register last; map known error types.
9. **server.ts:** listen on PORT; graceful shutdown hooks (optional).
10. **Verification:** `npm run build` zero TS errors; `GET /health` returns 200; invalid env exits with clear message.

**Deliverables:** Empty route modules wired but 404 for unknown paths; README stub pointing to Phase 2+.

---

## 5. Phase 2 — Database design and migrations

**Goal:** Normalized schema, indexes, seed admin.

### 5.1 Tables (logical design)

| Table | Purpose |
|-------|---------|
| `admins` | id, email (unique), password_hash, name, last_verified_at, created_at, updated_at, deleted_at (soft) |
| `otp_verifications` | id, admin_id, otp_hash, expires_at, consumed_at, created_at |
| `login_history` | id, admin_id, ip, user_agent, success, created_at |
| `blogs` | id, heading (unique), slug (unique), short_description, body (LONGTEXT), featured_image_url, meta_title, meta_description, canonical_url, og_image_url, status (draft/published), published_at, **category_id** (FK), **author_name** (display; default from admin), **created_by_admin_id** (FK), view_count, created_at, updated_at, deleted_at |
| `categories` | id, name (unique), slug optional, created_at |
| `tags` | id, name (unique normalized) |
| `blog_tags` | blog_id, tag_id (PK composite) |
| `comments` | id, blog_id, name, email, comment, **status** (`pending` \| `approved` \| `rejected`), created_at, deleted_at, **approved_at** nullable |
| `subscribers` | id, email (unique), name nullable, **unsubscribed_at** nullable, unsubscribe_token (unique), created_at |
| `enquiries` | id, name, email, phone, **service_type**, subject, message, created_at, deleted_at |

**Indexes:** slug, status+published_at, category_id, blog heading search (FULLTEXT or LIKE), blog_tags.tag_id, comments.blog_id+status, enquiries.created_at, subscribers.email.

**FKs:** blogs.category_id → categories; blogs.created_by_admin_id → admins; blog_tags → blogs/tags; comments → blogs.

**Rules (locked):**

- **Popular sort:** `view_count` incremented on public detail view; **never expose `view_count` in public API** — admin list/detail/dashboard only (D11).
- **Comments:** default **`pending`**; public GET returns **`approved` only** (D6).
- **Subscribers:** unsubscribe = set `unsubscribed_at`, retain row (D12).
- **Admins:** single seed now; schema supports 2–3 later without change (D10).
- **MySQL:** local **8.0.46** for dev; production host TBD (D9).
- **SMTP:** real credentials available — configure Nodemailer from env in Phase 5 (D13); optional console fallback only when `NODE_ENV=development` and SMTP vars absent.

### Steps

1. Write SQL migration files (001_init.sql, 002_indexes.sql) or lightweight migration runner.
2. Document ERD in `backend/README.md`.
3. **Seed script:** one admin (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`); **import `lib/blog-posts.ts` content** into blogs + categories.
4. Run migrations locally; verify constraints (duplicate email, duplicate slug).
5. **Verification:** integration test script or manual SQL checks.

---

## 6. Phase 3 — Authentication and authorization

**Goal:** Admin-only login with OTP rules and JWT in HTTP-only cookies.

### 6.1 Auth flow (API)

1. `POST /api/v1/auth/login` — email + password → validate → bcrypt compare → evaluate OTP requirement:
   - Required if `last_verified_at` IS NULL OR > 7 days ago.
   - If required: generate OTP, store hashed, email template, return `{ otpRequired: true }` (no JWT yet).
   - If not required: issue JWT, set cookie, log login history, return admin profile (minimal).
2. `POST /api/v1/auth/verify-otp` — email + otp → verify → update `last_verified_at` → JWT cookie → login history.
3. `POST /api/v1/auth/logout` — clear cookie.
4. `GET /api/v1/auth/me` — auth middleware → current admin.

### Steps

1. Repositories: `AdminRepository`, `OtpRepository`, `LoginHistoryRepository`.
2. Services: `AuthService` (all rules above), `OtpService` (generate, hash, TTL e.g. 10 min).
3. Utils: `jwt.ts`, `otp.ts` (crypto), bcrypt rounds from constant.
4. Middleware: `auth.middleware.ts` — verify JWT from cookie; attach `req.admin`.
5. Validators: login, verify-otp Zod schemas.
6. Routes + controllers (delegate only).
7. Rate limit login/OTP endpoints aggressively.
8. **Verification:** Postman/ curl flow — first login OTP, second login within 7 days skip OTP, after 7 days OTP again; invalid password; expired OTP.

**CSRF-ready:** SameSite=Lax/Strict cookies; document double-submit token if API and UI on different sites.

---

## 7. Phase 4 — Blog module (admin + public)

**Goal:** Full blog CRUD, S3 images, **category + tags**, SEO, search/filter/sort/pagination.

### 7.1 Admin routes (auth required)

| Method | Path | Action |
|--------|------|--------|
| POST | `/api/v1/admin/blogs` | Create draft |
| GET | `/api/v1/admin/blogs` | List all statuses, pagination |
| GET | `/api/v1/admin/blogs/:id` | Detail |
| PATCH | `/api/v1/admin/blogs/:id` | Update any field |
| DELETE | `/api/v1/admin/blogs/:id` | Soft delete |
| POST | `/api/v1/admin/blogs/:id/publish` | Set published + published_at |
| POST | `/api/v1/admin/blogs/:id/unpublish` | Back to draft |
| POST | `/api/v1/admin/blogs/upload-image` | Multer → S3 (featured/og) |

**Business rules:**

- Auto slug from heading via `slug.ts`; unique; regenerate on heading change with collision handling.
- Unique heading constraint.
- On image replace: delete old S3 object if URL owned by bucket prefix.
- **Category:** required FK (seed common list: Taxation, GST, Compliance, Company Law, etc.).
- **Tags:** normalize names, upsert `tags`, sync `blog_tags`; admin UI label “Tags”.
- **Author:** default `author_name` = logged-in `admins.name`; allow override on create/update (D5).
- Publish triggers subscriber emails (Phase 5 hook — stub event in service if Phase 5 not done).

### 7.2 Public routes

| Method | Path | Action |
|--------|------|--------|
| GET | `/api/v1/blogs` | Published only; query: `search`, **`category`**, **`tag`**, `sort` (latest/oldest/popular), pagination — **no `viewCount` in response** |
| GET | `/api/v1/blogs/:slug` | Detail + increment view_count server-side — **omit viewCount from JSON** |
| GET | `/api/v1/blogs/:slug/share` | Return share URLs (LinkedIn, WhatsApp, X, copy link) |

### Steps

1. S3 util: upload, delete, validate mime/size (10MB, jpg/jpeg/png/webp).
2. `upload.middleware.ts` — Multer memory storage.
3. Repositories: `BlogRepository`, `CategoryRepository`, `TagRepository`.
4. Service: `BlogService` — all CRUD, publish, search SQL (optimized: avoid SELECT *, use indexes).
5. Validators: create/update/query params.
6. Controllers + routes mount under `/api/v1`.
7. Admin list/detail **includes** `viewCount`; public does not.
8. **Verification:** Create draft with image; publish; filter by category/tag; search heading; sort latest/oldest/popular; update replaces image and deletes old key.

---

## 8. Phase 5 — Subscribers, comments, enquiries, email

**Goal:** Visitor features + Nodemailer + publish notification pipeline.

### 8.1 Subscribers

- `POST /api/v1/subscribers` — email (+ optional name); idempotent friendly message if duplicate.
- **Unsubscribe (D12):** `GET /api/v1/subscribers/unsubscribe?token=...` — validate token → set `unsubscribed_at` → redirect or JSON for Next **success page** (`/unsubscribe/success`).

### 8.2 Comments

- `GET /api/v1/blogs/:slug/comments` — **`approved` only**.
- `POST /api/v1/blogs/:slug/comments` — name, email, comment → save as **`pending`**; user message “awaiting moderation”.
- Service: if email not subscribed → create subscriber then comment (transaction).
- Admin: `GET /api/v1/admin/comments` (filter by status), **`PATCH /api/v1/admin/comments/:id/approve`**, **`PATCH .../reject`** (optional), `DELETE`.

### 8.3 Enquiries

- `POST /api/v1/enquiries` — store `name`, `email`, `phone`, **`service_type`**, **`subject`**, `message`; notify **info@easyncbooks.com** + user confirmation.
- Admin: list, delete.

### 8.4 Email templates (`templates/`)

- OTP verification
- Welcome subscriber
- New blog published (title, image, short description, CTA, blog URL, unsubscribe link)
- Contact confirmation
- Admin notification (new enquiry)

### 8.5 Publish hook

In `BlogService.publish`: after commit, async send to all active subscribers (batch/chunk to avoid SMTP limits; log failures per email).

### Steps

1. `config/mail.ts` + `utils/mail.ts` (Nodemailer transport).
2. Repositories: Subscriber, Comment, Enquiry.
3. Services with transactions where needed.
4. Wire routes; rate limit public POSTs.
5. **Verification:** Subscribe; comment with new email auto-subscribes; publish blog sends mail (test SMTP); enquiry emails info@… (once confirmed).

---

## 9. Phase 6 — Admin dashboard APIs

**Goal:** Statistics + recent activity for admin UI.

### Endpoints (auth required)

- `GET /api/v1/admin/dashboard/stats`
  - totalBlogs, publishedBlogs, draftBlogs, totalSubscribers, totalComments, totalEnquiries
- `GET /api/v1/admin/dashboard/recent`
  - recentBlogs, recentComments, recentSubscribers, recentEnquiries (limit param, default 5–10)

Implement via dedicated `DashboardService` + SQL aggregations (single query or parallel repos).

**Verification:** Counts match DB after fixture data.

---

## 10. Phase 7 — Next.js integration (no UI redesign)

**Goal:** Connect existing pages to APIs; add minimal admin surfaces without restyling marketing site.

### 10.1 Prerequisites

- Remove static export; add **rewrites** in `next.config.js`: `/api/:path*` → Express (dev: `http://127.0.0.1:${BACKEND_PORT}/api/:path*`).
- Env: `NEXT_PUBLIC_SITE_URL=https://teotiaandco.com`; API base **relative** `/api/v1` for same-origin.

### 10.2 Shared frontend infrastructure

1. `lib/api/client.ts` — fetch wrapper, credentials: `include` for admin, typed errors from global format.
2. `lib/api/types.ts` — DTOs mirroring backend responses.
3. `lib/blog/mapPost.ts` — API → UI: category badge, **up to 2 tags on cards**, all tags on detail, read time, `authorName`.
4. Optional: React Query or SWR for client lists (search/filter).

### 10.3 Public page integration (minimal UI changes)

| Page / component | Work |
|------------------|------|
| `app/blog/page.tsx` | Fetch published blogs; add search/filter/sort controls only if missing (reuse existing CSS patterns). |
| `app/blog/[slug]/page.tsx` | Fetch by slug; render HTML body; dynamic metadata from SEO fields; wire comments form (name, email, comment); optional share menu on existing button. |
| `components/Footer.tsx` | Newsletter submit → subscribe API + toast/message. |
| `app/contact/page.tsx` | Submit → enquiry API with `service_type` + `subject`. |
| `app/unsubscribe/success/page.tsx` | Shown after unsubscribe flow (token validated server-side or via API redirect). |
| Home blog preview | Fetch latest 3 published posts instead of `blogPosts.slice(0, 3)`. |

### 10.4 Next.js config changes

- Remove `output: 'export'`.
- Same-origin `/api` rewrites to Express; production nginx/Caddy same pattern.
- `images.remotePatterns` for S3 bucket host.
- Blog routes: dynamic fetch (drop static-only `generateStaticParams` from mock data).

### 10.5 Admin UI (net-new routes, separate layout)

Spec does not include admin mockups — build functional CMS under e.g. `/admin`:

- Login (email/password → OTP step)
- Dashboard (stats from Phase 6)
- Blog list / create / edit (Jodit for `body` — add dependency here)
- Comments (**approve/reject/delete**), enquiries, subscribers tables
- Blog editor: category select, tags multi-input, **author name** (prefilled from admin, editable)

Use same design tokens/CSS variables where possible; **do not** alter public Header/Footer on admin routes (separate `app/admin/layout.tsx`).

### 10.6 Deprecation

- Keep `lib/blog-posts.ts` as fallback only during dev; remove or gate behind `USE_MOCK_BLOG` env for production.

### 10.7 Verification checklist

- Visitor: browse, search, filter, read post, comment, subscribe, contact.
- Admin: full blog lifecycle, image upload, publish → subscriber email received.
- Cookies work in dev (proxy or same-origin strategy documented).
- Production build succeeds.

---

## 11. API surface checklist (consolidated)

Prefix: `/api/v1`

**Public:** health, blogs (list/detail/share), comments (list/create), subscribers (create/unsubscribe), enquiries (create).

**Auth:** login, verify-otp, logout, me.

**Admin:** blogs CRUD + publish/unpublish + upload (includes viewCount), comments approve/reject/delete, enquiries, subscribers (read optional), dashboard stats/recent, categories/tags helpers as needed.

Document each in `backend/README.md` with example request/response and error codes.

---

## 12. Locked product & architecture decisions

| # | Topic | Decision |
|---|--------|----------|
| 1 | Deployment | Dynamic Next.js; **same-origin** `/api` → Express |
| 2 | Site URL | `https://teotiaandco.com` via env (changeable later) |
| 3 | Enquiry email | `info@easyncbooks.com` |
| 4 | Contact form | Persist **`service_type`** + **`subject`** |
| 5 | Taxonomy | **One category** (broad); many **tags** (UI: “Tags”); cards: category + ≤2 tags; detail: all tags |
| 6 | Author | Default **admin’s name**; **overridable** per blog (`author_name`) |
| 7 | Comments | **Admin approval** required (`pending` → `approved`) |
| 8 | Seed | Import mock **`blog-posts.ts`** into MySQL |
| 9 | MySQL | **Local 8.0.46**; production provider **TBD** |
| 13 | SMTP | **Real credentials** for OTP, subscriber, enquiry mail |
| 10 | Admins | **One** seeded admin; schema ready for 2–3 later |
| 11 | Popular | **`view_count`** on view; **admin-only** visibility in API/UI |
| 12 | Unsubscribe | GET link → validate token → set **`unsubscribed_at`** → **success page** (keep record) |

**Still default unless you say otherwise:** read time computed from HTML word count; Jodit HTML with server-side sanitize whitelist.

---

## 13. Phase gate checklist

| Phase | Gate |
|-------|------|
| 1 | Build passes; health OK; error handler returns spec JSON |
| 2 | Migrations apply clean; admin seed login row exists |
| 3 | Auth flows verified including 7-day OTP rule |
| 4 | Blog CRUD + S3 + public search/filter/sort |
| 5 | Emails send; publish notifies subscribers; comment auto-subscribe |
| 6 | Dashboard numbers accurate |
| 7 | E2E manual test script passed; frontend production build |

---

## 14. Post-MVP (out of scope unless requested)

- Background job queue (BullMQ) for mass email
- Multi-admin roles/permissions beyond shared admin
- CSRF tokens for cross-site admin
- Automated tests (unit + integration)
- CI/CD pipelines
- WAF / CloudFront in front of S3 assets

---

## 15. Documentation deliverables

- `backend/README.md` — installation, env, API, auth flow, deployment
- Update root `README.md` — monorepo dev (run frontend + backend)
- Keep `context.md` updated each session with decisions and phase status
