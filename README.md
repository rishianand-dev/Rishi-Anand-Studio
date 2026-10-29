# Liquid Glass Engineer Portfolio

An ultra-modern, interactive **Liquid Glass** software engineering portfolio inspired by Apple & Figma's refractive glassmorphism design language.

Designed and implemented with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **PostgreSQL (Prisma ORM)**, **Neon Object Storage**, and **Zustand**.

---

## 💎 Features & Architecture

- **Liquid Glass Aesthetic:**
  - Dynamic 3D interactive liquid sphere with fluid specular reflections, orbital rings, and mouse gyro-parallax reaction.
  - Floating frosted glass badges (`const craft = detail + curiosity;` and `CURRENTLY: Building for the web`).
  - Floating translucent glass navbar with active section indicators and "Available for work" glowing beacon.
  - Multi-layer luminous mesh gradient background with ambient drift.
  - Bento project cards with glass bevel borders, back-blur saturation, and hover elevations.
- **Admin Dashboard & Authentication (`/admin`):**
  - Secure credential login with HTTP-only cookies (`/api/admin/login`).
  - Default credentials: `admin` / `admin123` (customizable via `.env`).
  - **Heading & Profile Module:** Edit hero headlines, subtitle tags, display name, location, and social links.
  - **Resume Access & Upload Module:** Direct PDF resume upload via Neon Object Storage with live progress.
  - **Projects Module:** Create, edit existing, delete, and reorder projects.
  - **Education Module:** Add, edit, or delete degrees and academic achievements.
  - **Tech Stack Module:** Categorized skills (Frontend, Backend, Practices, Tools) with instant add/remove.
  - **Career Experience Module:** Add, modify, or delete career milestones, roles, and companies.
- **Resume Buttons in Portfolio:**
  - **Hero CTA:** Quick "View Resume" button with document icon and external link.
  - **Navbar:** "Resume" pill action for one-click access.
  - **About Section:** "Access Resume (PDF)" direct download button.
- **PostgreSQL Database:**
  - Prisma schema with models for `Project`, `Experience`, `Education`, `Skill`, `ContactMessage`, and `Profile`.
  - Migration and seed scripts (`scripts/seed.mjs`).
  - Resilient database adapter (`src/lib/db.ts`) with zero-downtime fallback for seamless local previews.
- **Neon File & Photo Storage:**
  - S3-compatible server-side storage integration for project screenshots, resume PDFs, SEO images, and contact attachments.
- **Zustand State Management:**
  - Single-source store (`src/lib/store.ts`) for projects, skills, education, experiences, profile, category filtering, and modal states.

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/liquid_portfolio?schema=public"

# Admin Authentication
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"

# Neon Object Storage
NEON_STORAGE_BUCKET="media"
AWS_ENDPOINT_URL_S3=""
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION=""
```

### 3. Database Migration & Seeding (PostgreSQL)
When your PostgreSQL database is running:
```bash
npx prisma db push
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
- Portfolio: [http://localhost:3000](http://localhost:3000)
- Admin Portal: [http://localhost:3000/admin](http://localhost:3000/admin) (Sign in with `admin` / `admin123`)

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom Liquid Glass Filters
- **Database:** PostgreSQL + Prisma ORM
- **File Storage:** Neon Object Storage
- **State Management:** Zustand
- **Animations:** Framer Motion + Canvas Confetti
- **Icons:** Lucide React

---

## 📚 Full Documentation

For the complete architecture, setup instructions, data model, API reference, admin workflow, fallback behavior, and deployment checklist, see [DOCUMENTATION.md](./DOCUMENTATION.md).
