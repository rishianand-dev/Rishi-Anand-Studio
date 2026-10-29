# Liquid Glass Portfolio Documentation

This document describes the portfolio application in this repository, including its architecture, local setup, content model, API surface, and operational notes.

## 1. Project overview

This is a single-page software engineering portfolio built with Next.js 14 App Router. It combines:

- A public portfolio at `/`
- A content-management dashboard at `/admin`
- PostgreSQL persistence through Prisma
- Neon Object Storage for uploaded resumes, project images, SEO images, and contact attachments
- Zustand for client-side portfolio state
- Tailwind CSS, Framer Motion, and custom CSS for the liquid-glass visual system

The public page is composed of the following sections:

1. **Hero** - profile role, headline, introduction, resume link, and contact CTA
2. **Selected Work** - filterable project cards and project detail modal
3. **About & Philosophy** - profile bio, engineering principles, and categorized skills
4. **Career Timeline** - work experience and education
5. **Contact** - contact form backed by the `ContactMessage` model
6. **Footer** - social links and back-to-top control

## 2. Technology stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 14, App Router |
| Language | TypeScript |
| UI | React 18, Tailwind CSS, custom CSS |
| Animation and interaction | Framer Motion, Canvas Confetti, custom canvas/CSS effects |
| Icons | Lucide React |
| State | Zustand |
| Database | PostgreSQL |
| ORM | Prisma |
| File storage | Neon Object Storage (S3-compatible) |
| Image handling | `next/image` with HTTPS remote images enabled |

## 3. Repository structure

```text
.
├── prisma/
│   └── schema.prisma          Database models and PostgreSQL configuration
├── public/
│   └── resume.pdf             Local fallback resume
├── scripts/
│   └── seed.mjs               Initial database seed script
├── src/
│   ├── app/
│   │   ├── api/               Route handlers for content, contact, and admin login
│   │   ├── admin/             Admin dashboard page
│   │   ├── globals.css        Global styles and liquid-glass utilities
│   │   ├── layout.tsx         Global layout and database-driven metadata
│   │   └── page.tsx           Public page composition
│   ├── components/
│   │   ├── StoreHydrator.tsx  Server data to Zustand hydration boundary
│   │   └── ui/                Public sections and admin/project UI
│   └── lib/
│       ├── db.ts              Prisma access and in-memory fallback logic
│       ├── storage.ts          Neon Object Storage client and URL helpers
│       ├── upload.ts           Browser upload helper
│       ├── initial-data.ts     Content used before database data exists
│       ├── store.ts             Zustand store
│       └── types.ts             Shared TypeScript data contracts
├── .env.example               Environment variable template
├── next.config.mjs            Next.js image configuration
├── package.json               Scripts and dependencies
└── tailwind.config.js         Tailwind theme and animations
```

Generated directories such as `.next/` and `node_modules/` are not application source and should not be edited or committed.

## 4. Local development

### Prerequisites

- Node.js compatible with the installed Next.js 14 toolchain
- npm
- PostgreSQL for persistent content management
- Neon Object Storage bucket and S3 credentials for file uploads

### Installation

```bash
npm install
cp .env.example .env
```

Set `DATABASE_URL`, the admin credentials, and the Neon Object Storage variables in `.env`.

### Database setup

Create or select a PostgreSQL database, then apply the Prisma schema:

```bash
npx prisma generate
npm run prisma:push
npm run seed
```

`prisma db push` synchronizes the database with `prisma/schema.prisma` without creating migration files. The seed script inserts the initial portfolio content. Run the seed only when you want to initialize or refresh the database according to the script's behavior.

### Run the application

```bash
npm run dev
```

Open:

- Public portfolio: `http://localhost:3000`
- Admin dashboard: `http://localhost:3000/admin`

The production-style commands are:

```bash
npm run build
npm run start
```

## 5. Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Persistent database: yes | PostgreSQL connection string used by Prisma |
| `ADMIN_USERNAME` | No | Admin username; defaults to `admin` when unset |
| `ADMIN_PASSWORD` | No | Admin password; defaults to `admin123` when unset |
| `RESEND_API_KEY` | Contact email: yes | Server-only Resend API key |
| `RESEND_FROM_EMAIL` | Contact email: yes | Verified Resend sender address |
| `NEXT_PUBLIC_SITE_URL` | Contact links: recommended | Public site origin used to turn stored attachment paths into absolute email links |
| `NEON_STORAGE_BUCKET` | Yes | Neon bucket name; this project uses `media` |
| `AWS_ENDPOINT_URL_S3` | Yes | Neon S3-compatible endpoint |
| `AWS_ACCESS_KEY_ID` | Yes | Neon storage access key |
| `AWS_SECRET_ACCESS_KEY` | Yes | Neon storage secret |
| `AWS_REGION` | Yes | Neon storage region |

Never commit `.env` or real credentials. Use strong, deployment-specific admin credentials instead of the development defaults.

## 6. Runtime architecture

### Public page data flow

1. `src/app/layout.tsx` loads SEO settings and generates Next.js metadata.
2. The public route renders the portfolio sections from `src/app/page.tsx`.
3. Initial data is available from `src/lib/initial-data.ts`.
4. Client components read live content from `usePortfolioStore` in `src/lib/store.ts`.
5. `StoreHydrator` replaces initial client state with server-fetched content when the application loads data from the database.

### Persistence and fallback behavior

`src/lib/db.ts` attempts to use Prisma first. If PostgreSQL is unavailable, reads and writes fall back to in-memory arrays initialized from `src/lib/initial-data.ts`.

This fallback is useful for local previews and builds, but it is not durable:

- Changes made while the database is unavailable are lost when the process restarts.
- Multiple application instances do not share fallback state.
- A successful API response does not imply durable persistence unless PostgreSQL is reachable.

### File upload flow

The admin dashboard calls `uploadPortfolioFile` in `src/lib/upload.ts` calls the server-side `/api/storage/upload` endpoint:

- The server uploads the file to the configured Neon S3-compatible bucket using AWS credentials that never reach the browser.
- The database stores a stable `/api/storage/...` URL. The download route reads the object from Neon and streams it to the browser, so private buckets and non-expiring application URLs are supported.

Uploaded file categories currently use these folders:

- `project-photos`
- `resumes`
- `seo-images`

## 7. Database model

The Prisma schema contains these models:

### `Project`

Stores portfolio work, including title, slug, descriptions, category, tags, image URL, demo/GitHub links, metrics, featured state, and display order.

### `Experience`

Stores career timeline entries with role, company, period, location, description, skills, and display order.

### `Education`

Stores degrees and academic achievements with institution, period, optional location/description, and display order.

### `Skill`

Stores a skill name, category, and display order. The UI groups skills under `Frontend`, `Backend`, and `Practices`; the database also supports `Tools`.

### `ContactMessage`

Stores contact form submissions, optional subject and attachment URL, read state, and creation time.

### `Profile`

Stores the default profile record, including name, role, location, headline, subheadline, availability, resume URL, social links, footer controls, all editable About section copy, and hero visual copy.

### `SeoSettings`

Stores metadata used by `generateMetadata`, including title, description, keywords, Open Graph image, canonical URL, Twitter handle, and robots directive.

## 8. API reference

All responses use JSON with a `success` boolean. Errors generally include an `error` message.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/admin/login` | Validate admin credentials and set the HTTP-only `admin_token` cookie |
| `GET` | `/api/admin/check` | Check whether the admin cookie is present and valid |
| `POST` | `/api/admin/logout` | Clear the admin session cookie |
| `GET` | `/api/projects` | List projects ordered by `order` |
| `POST` | `/api/projects` | Create a project; `title`, `description`, and `imageUrl` are required |
| `PUT` | `/api/projects/:id` | Update a project |
| `DELETE` | `/api/projects/:id` | Delete a project |
| `GET` | `/api/experience` | List experience entries |
| `POST` | `/api/experience` | Create an experience entry |
| `PUT` | `/api/experience/:id` | Update an experience entry |
| `DELETE` | `/api/experience/:id` | Delete an experience entry |
| `GET` | `/api/education` | List education entries |
| `POST` | `/api/education` | Create an education entry |
| `PUT` | `/api/education/:id` | Update an education entry |
| `DELETE` | `/api/education/:id` | Delete an education entry |
| `GET` | `/api/skills` | List skills |
| `POST` | `/api/skills` | Create a skill |
| `PUT` | `/api/skills/:id` | Update a skill |
| `DELETE` | `/api/skills/:id` | Delete a skill |
| `GET` | `/api/profile` | Return profile, experience, education, and skills |
| `PUT` | `/api/profile` | Update profile fields |
| `GET` | `/api/seo` | Return SEO settings |
| `PUT` | `/api/seo` | Update SEO settings |
| `POST` | `/api/contact` | Save a contact submission; `name`, `email`, and `message` are required |

Contact submissions are saved to PostgreSQL and delivered through Resend to the admin-configured `contactEmail` profile field. Configure `RESEND_API_KEY` and a verified `RESEND_FROM_EMAIL` before enabling email delivery.

### API security note

The admin page checks the login cookie before showing the dashboard. The current content mutation route handlers do not independently verify that cookie. Before deploying the admin API to an untrusted public environment, add server-side authorization checks to every protected read/write handler and validate request payloads more strictly.

## 9. Admin dashboard

The `/admin` page provides these tabs:

- **Heading** - profile identity, headline, availability, social links, and resume upload
- **Hero visual controls** - technology strip, floating code card lines, and current status badge
- **About Section** - edit the About label, heading, left bio card copy and CTA labels, plus all three philosophy card titles and descriptions
- **Footer Controls** - customize footer branding, copyright text, and technology line
- **Projects** - create, edit, delete, and upload project images
- **Tech Stack** - manage categorized skills
- **Experience** - manage career timeline entries
- **Education** - manage academic entries
- **SEO** - update page metadata and upload an Open Graph image

After a successful mutation, the dashboard updates the Zustand store so the current session reflects the new content without a full page reload.

## 10. Useful npm scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Generate Prisma Client and create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run the configured Next.js lint command |
| `npm run prisma:generate` | Generate the Prisma client |
| `npm run prisma:push` | Push the Prisma schema to PostgreSQL |
| `npm run seed` | Run the initial data seed script |

## 11. Deployment checklist

1. Provision PostgreSQL and set a production `DATABASE_URL`.
2. Set strong `ADMIN_USERNAME` and `ADMIN_PASSWORD` values.
3. Configure the Neon `media` bucket and verify the S3 credentials can upload and read objects.
4. Run `npx prisma generate` and `npx prisma db push` as part of deployment setup.
5. Seed the database only when initial data is needed.
6. Confirm `npm run build` completes successfully.
7. Protect every admin mutation endpoint with server-side authentication.
8. Replace placeholder profile, social, canonical, and SEO values.
9. Verify resume, project images, contact submissions, and metadata on the deployed domain.
10. Ensure `.env`, build output, and dependency directories are excluded from version control.

## 12. Troubleshooting

### The app shows initial sample content

Check `DATABASE_URL`, confirm PostgreSQL is reachable, run `npx prisma db push`, and run `npm run seed` if the database is empty.

### Changes disappear after restart

The application was using the in-memory fallback because PostgreSQL was unavailable. Configure a working database connection for durable writes.

### Uploads fail

Confirm `NEON_STORAGE_BUCKET`, `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION` are set, and that the `media` bucket exists in Neon. Restart the development server after changing `.env`.

### Remote images fail to render

The image URL must use HTTPS. The current Next.js configuration permits HTTPS remote hosts, but the remote host still needs to return a valid image.

### Metadata does not match the deployed site

Update the SEO settings through `/admin`, then verify `canonicalUrl`, Open Graph image URL, Twitter handle, and robots settings. Metadata is generated in `src/app/layout.tsx`.
