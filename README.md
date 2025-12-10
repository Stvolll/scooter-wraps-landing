# TXD — Premium Vinyl Wraps for Scooters

Full-stack Next.js application with Design Lifecycle Management System.

## 🎯 Центральная концепция

**Одна логика взаимодействия с пользователем, показывающая премиум сегмент и экспертизу в дизайне.**

> ⚠️ **ВАЖНО для всех ИИ**: Перед внесением изменений в архитектуру или дизайн, обязательно ознакомьтесь с:
> - [Архитектурные принципы](./docs/ARCHITECTURE_PRINCIPLES.md) - центральная концепция и правила разработки
> - [Design System](./docs/DESIGN_SYSTEM.md) - визуальные стандарты iOS 26 style
>
> Это необходимо для сохранения единой логики взаимодействия и премиум позиционирования сайта.

## Features

- **Design Lifecycle System**: Complete workflow from CREATIVE → MODELING_3D → UV_TEMPLATE → PRINTING → FOR_SALE → SOLD → DELIVERY → FEEDBACK
- **Prisma + PostgreSQL**: Type-safe database access
- **S3 Uploads**: Signed URL uploads for media files
- **3D Model Viewer**: Interactive 3D scooter visualization
- **Admin Panel**: Full CRUD for designs with status tracking
- **SEO Optimized**: Dynamic sitemap, metadata generation, structured data
- **Image Optimization**: Responsive images with WebP/AVIF support
- **iOS 26 Design**: Modern glassmorphism UI

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Storage**: AWS S3 / Cloudflare R2
- **3D**: Three.js, @react-three/fiber, model-viewer
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Required variables:

- `DATABASE_URL` - PostgreSQL connection string
- `S3_BUCKET` or `AWS_S3_BUCKET_NAME` - S3 bucket name
- `S3_KEY` or `AWS_ACCESS_KEY_ID` - S3 access key
- `S3_SECRET` or `AWS_SECRET_ACCESS_KEY` - S3 secret key
- `S3_REGION` or `AWS_REGION` - S3 region

### 3. Initialize Database

```bash
# Create migration
npx prisma migrate dev --name design-lifecycle-init

# Generate Prisma Client
npx prisma generate
```

### 4. Generate Optimized Images

```bash
npm run image:build
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Admin Panel

Access admin at `/admin`:

- **Dashboard**: `/admin`
- **Designs List**: `/admin/designs`
- **Create Design**: `/admin/designs/new`
- **Edit Design**: `/admin/designs/[id]`

## Design Lifecycle System (Migration Notes)

This project uses the Design Lifecycle System and has removed SKU-based flows.

### After pulling this branch:

1. **Copy environment file:**

   ```bash
   cp .env.example .env.local
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Generate Prisma client and run migration:**

   ```bash
   npx prisma generate
   npx prisma migrate dev --name design-lifecycle-init
   ```

4. **(Optional) Run image optimization:**

   ```bash
   npm run image:build
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

### Signed Uploads

We use signed S3 PUT URLs for direct client-side uploads. See `app/api/uploads/signed-url/route.ts` for implementation details.

### Manual Steps

- Install `gltfpack` / `toktx` locally or in CI if you want GLB/texture compression
- Configure S3 / R2 credentials in deployment environment
- Set up database backup before running migrations in production

## Design Lifecycle

Each design progresses through 8 stages:

1. **CREATIVE** - Initial design concept
2. **MODELING_3D** - 3D model creation
3. **UV_TEMPLATE** - UV mapping and template preparation
4. **PRINTING** - Physical printing process
5. **FOR_SALE** - Available for purchase
6. **SOLD** - All editions sold
7. **DELIVERY** - Shipping to customer
8. **FEEDBACK** - Customer feedback received

Status can only move forward (no backward transitions).

## File Uploads

### Signed URL Flow

1. Client requests signed URL from `/api/uploads/signed-url`
2. Server validates file and returns S3 signed URL
3. Client uploads directly to S3 using signed URL
4. Client receives public URL after upload

### Example Usage

```typescript
// Get signed URL
const res = await fetch('/api/uploads/signed-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filename: file.name,
    contentType: file.type,
    fileSize: file.size,
  }),
})

const { url: signedUrl, key } = await res.json()

// Upload to S3
await fetch(signedUrl, {
  method: 'PUT',
  headers: { 'Content-Type': file.type },
  body: file,
})

// Get public URL
const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`
```

## 3D Asset Optimization

### Prerequisites

Install optimization tools:

```bash
# gltfpack (for GLB compression)
npm install -g gltfpack

# toktx (for KTX2 textures)
# macOS: brew install ktx-software
# Linux: apt-get install libktx-dev
```

### Optimize Models

```bash
npm run gltf:compress
```

### Optimize Textures

```bash
npm run texture:ktx2
# or
npm run optimize:textures
```

See [docs/3d-optimization.md](./docs/3d-optimization.md) for details.

## Image Optimization

Generate responsive image versions:

```bash
npm run image:build
```

This creates:

- Multiple sizes (320w, 640w, 1024w, 1600w)
- WebP and AVIF formats
- Manifest file at `public/_optimized/manifest.json`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run analyze` - Analyze bundle size
- `npm run image:build` - Generate responsive images
- `npm run gltf:compress` - Compress 3D models
- `npm run health` - Run health checks

## Database Management

### Prisma Studio

Visual database editor:

```bash
npx prisma studio
```

Opens at `http://localhost:5555`

### Migrations

```bash
# Create new migration
npx prisma migrate dev --name your-migration-name

# Apply migrations in production
npx prisma migrate deploy
```

## Deployment

See [docs/deployment-notes.md](./docs/deployment-notes.md) for detailed deployment instructions.

### Environment Variables

Set all variables from `.env.example` in your hosting provider:

- **Vercel**: Settings → Environment Variables
- **Railway**: Variables tab
- **Heroku**: Config Vars

### Build

```bash
npm run build
npm run start
```

## Project Structure

```
├── app/
│   ├── admin/              # Admin panel pages
│   │   └── designs/        # Design management
│   ├── api/                # API routes
│   │   ├── admin/          # Admin APIs
│   │   └── uploads/        # File upload APIs
│   ├── designs/            # Public design pages
│   └── sitemap.ts          # Dynamic sitemap
├── components/
│   ├── admin/              # Admin components
│   ├── sections/           # Landing page sections
│   ├── DesignCard.tsx      # Design card component
│   ├── DesignTimeline.tsx  # Status timeline
│   └── StageChecklist.tsx  # Stage management
├── lib/
│   └── prisma.ts           # Prisma client
├── prisma/
│   └── schema.prisma       # Database schema
└── scripts/                # Build scripts
```

## License

Private project - All rights reserved
