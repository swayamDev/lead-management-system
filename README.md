# Digital Heroes CRM — Lead Management Platform

A small CRM for capturing, assigning, and tracking sales leads, built for
the Digital Heroes Full Stack Development task.

- **Public capture form** — no login required, writes straight to the DB
- **Two roles** — Admin (full control) and Member (scoped to their own leads),
  enforced on both the client (hidden UI) and the server (403s)
- **Lead lifecycle** — status pipeline, assignment, timestamped notes, and
  an append-only activity trail
- **JSON REST API** — paginated, filterable, documented below
- **Tests** — auth/permission rules + core flows
- **Deployed on Vercel + Neon Postgres**

Live app: `<add your deployed URL here>`
Repo: `<add your GitHub URL here>`

---

## 1. Getting started locally

```bash
pnpm install

cp .env.example .env
# fill in DATABASE_URL / DIRECT_URL (a free Neon project works well)
# fill in BETTER_AUTH_SECRET with any long random string

pnpm prisma generate
pnpm db:migrate        # applies schema + runs prisma/seed.ts automatically
pnpm dev
```

Then open `http://localhost:3000` for the public capture form, or
`http://localhost:3000/login` for the dashboard.

### Seeded credentials

Running `pnpm db:migrate` (or `pnpm db:seed` on its own) creates:

| Role   | Email                     | Password    |
| ------ | ------------------------- | ----------- |
| Admin  | admin@digitalheroes.test  | Admin1234!  |
| Member | member@digitalheroes.test | Member1234! |

Rotate/replace these before sharing the deployed app publicly.

---

## 2. Architecture

```
Request
  -> Route handler (src/app/api/**)      - auth check, zod validation, HTTP status
  -> Service layer (src/lib/services/**) - permission + ownership rules, business logic
  -> Prisma (src/lib/prisma.ts)          - data access
  -> Postgres (Neon)
```

- **`src/lib/permissions.ts`** is the single source of truth for what each
  role can do. Both the dashboard UI (to hide buttons) and the API routes
  (to actually enforce access) import from here, so they can't drift apart.
- **Ownership, not just role**, gates access to a lead: `canAccessLead()`
  checks the row's `assignedToId` against the current user, so a Member
  can never reach another Member's lead by guessing an id, even though
  both are the same role.
- **Activity is append-only.** Every status change, assignment, and note
  writes a row to `Activity` and nothing there is ever edited or deleted -
  it's the audit trail for the lead.
- There is **no public signup**. Admins provision Member/Admin accounts
  from `/dashboard/admin/users`; the role field on `User` is marked
  `input: false` in Better Auth so it can only be set server-side.

### Data model

```
User (id, name, email, role: ADMIN|MEMBER)
  1 -- * Lead (assignedTo)
  1 -- * Note (author)
  1 -- * Activity (actor)

Lead (id, name, email, phone, company, message, budget, source, status, assignedToId)
  1 -- * Note
  1 -- * Activity

LeadStatus: NEW -> CONTACTED -> QUALIFIED -> PROPOSAL_SENT -> NEGOTIATION -> WON | LOST
LeadSource: WEBSITE | REFERRAL | LINKEDIN | COLD_OUTREACH | EVENT | OTHER
ActivityType: LEAD_CREATED | STATUS_CHANGED | ASSIGNED | UNASSIGNED | NOTE_ADDED
```

Full definitions: `prisma/schema.prisma`.

---

## 3. API reference

All authenticated routes require a valid Better Auth session cookie
(sign in via `/login`). Members are automatically scoped to their own
assigned leads; admins see everything. Responses are `{ data: ... }` on
success or `{ error: string }` on failure.

### Public

| Method | Route               | Auth | Description                                                                  |
| ------ | ------------------- | ---- | ---------------------------------------------------------------------------- |
| `POST` | `/api/public/leads` | none | Submit the public capture form. `201` on success, `400` on validation error. |

### Leads

| Method   | Route            | Auth           | Description                                                                                                                              |
| -------- | ---------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/leads`     | any            | Paginated, filtered list. Query params: `page`, `perPage` (max 100), `status`, `assignedTo` (admin only), `company`, `source`, `search`. |
| `POST`   | `/api/leads`     | admin          | Create a lead manually. `403` for members.                                                                                               |
| `GET`    | `/api/leads/:id` | owner or admin | Fetch one lead with notes. `403` if it's not yours, `404` if it doesn't exist.                                                           |
| `PATCH`  | `/api/leads/:id` | owner or admin | Update status/fields. Reassignment (`assignedToId`) is admin-only - `403` for members.                                                   |
| `DELETE` | `/api/leads/:id` | admin          | `403` for members.                                                                                                                       |

### Notes & activity

| Method         | Route                     | Auth           | Description                                |
| -------------- | ------------------------- | -------------- | ------------------------------------------ |
| `GET` / `POST` | `/api/leads/:id/notes`    | owner or admin | List / add a timestamped note.             |
| `GET`          | `/api/leads/:id/activity` | owner or admin | The lead's full audit trail, oldest first. |

### Admin

| Method | Route              | Auth  | Description                              |
| ------ | ------------------ | ----- | ---------------------------------------- |
| `GET`  | `/api/admin/users` | admin | List all accounts.                       |
| `POST` | `/api/admin/users` | admin | Provision a new Admin or Member account. |

Status codes used throughout: `200` (ok), `201` (created), `400` (validation),
`401` (not signed in), `403` (signed in, wrong role/owner), `404` (not found),
`500` (unexpected).

---

## 4. Testing

```bash
pnpm test          # vitest: permission rules, zod schemas, API route logic (mocked Prisma)
pnpm test:e2e      # playwright: public form submission, dashboard redirect
```

Playwright needs its browser binaries once per machine:
`npx playwright install chromium`.

---

## 5. Deployment

1. Push to GitHub, import the repo into Vercel.
2. Create a free Neon Postgres project, copy `DATABASE_URL`/`DIRECT_URL`.
3. Set `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
   `NEXT_PUBLIC_APP_URL` in Vercel's project environment variables.
4. Run `npx prisma migrate deploy` against the production database.
5. Deploy. Optionally run `pnpm db:seed` once against production for the
   sample admin/member accounts.

---

## 6. Project structure

```
prisma/                    schema, migrations, seed script
src/lib/                   auth, prisma client, permissions, api-response helper
src/lib/services/          business logic (lead, note, activity, user)
src/schemas/               zod validation, shared by forms and API routes
src/app/api/                route handlers (thin - validate, call service, respond)
src/app/dashboard/          authenticated pages
src/app/page.tsx           public lead capture landing page
src/components/            ui/ = design-system primitives (untouched theme),
                            dashboard/ + public/ + auth/ = feature components
e2e/                        Playwright specs
```
