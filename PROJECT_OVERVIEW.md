# TXD Project Overview

## Welcome to the TXD Project!

This document provides a beginner-friendly guide to understanding and working with the TXD scooter vinyl wraps website project.

---

## What is TXD?

**TXD** is a premium brand that sells vinyl wrap kits (cover-sets) with custom designs for different scooter models. The website allows users to:
- Browse ready-made designs for various scooter models
- Request custom designs
- Order vinyl wrap kits

---

## Tech Stack Explained

### Next.js (Framework)
- **What it is**: A React framework that makes building websites easier
- **Why we use it**: It provides great performance, SEO features, and makes deployment simple
- **Version**: 14.x (using the App Router)

### TypeScript
- **What it is**: JavaScript with type checking
- **Why we use it**: Helps catch errors early and makes code easier to understand
- **Files**: All `.ts` and `.tsx` files

### Tailwind CSS
- **What it is**: A utility-first CSS framework
- **Why we use it**: Makes styling fast and consistent
- **Configuration**: `tailwind.config.ts`

### React Three Fiber
- **What it is**: A React library for 3D graphics
- **Why we use it**: Powers the interactive 3D scooter model in the hero section
- **Dependencies**: `@react-three/fiber`, `@react-three/drei`, `three`

### Framer Motion
- **What it is**: A library for smooth animations
- **Why we use it**: Creates the premium, smooth animations throughout the site

---

## Project Structure

```
scooter-wraps-landing/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout (wraps all pages)
│   ├── page.tsx                 # Main landing page
│   ├── globals.css              # Global styles
│   └── designs/                 # Product detail pages
│       └── [model]/[slug]/
│           └── page.tsx         # Dynamic route for design details
│
├── components/                   # React components
│   ├── Header.tsx               # Navigation header
│   ├── Footer.tsx               # Site footer
│   ├── Hero.tsx                 # Hero section with 3D model
│   ├── ThreeDViewer.tsx         # 3D model viewer component
│   ├── InteractiveCreateBlock.tsx  # "you bike create now" block
│   ├── Gallery.tsx              # Design gallery section
│   ├── GalleryCard.tsx          # Individual design card
│   ├── DonateSection.tsx        # Donation section
│   ├── ProcessSteps.tsx         # Production process steps
│   ├── FAQ.tsx                  # Frequently asked questions
│   ├── ContactForm.tsx          # Contact/custom design form
│   ├── LanguageSwitcher.tsx     # EN/VI language switcher
│   └── ClientWrapper.tsx        # Wraps app with providers
│
├── contexts/                     # React contexts (state management)
│   └── LanguageContext.tsx      # Manages current language (EN/VI)
│
├── lib/                          # Utility functions and data
│   ├── i18n.ts                  # Translation helper functions
│   └── designsData.ts           # Mock data for models and designs
│
├── locales/                      # Translation files
│   ├── en.json                   # English translations
│   └── vi.json                   # Vietnamese translations
│
├── public/                       # Static files
│   ├── models/                   # 3D model files (.glb, .gltf)
│   └── images/                   # Image files
│       └── designs/              # Design preview images
│
├── package.json                  # Project dependencies
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── next.config.js                # Next.js configuration
└── PROJECT_OVERVIEW.md           # This file!
```

---

## Getting Started

### 1. Install Dependencies

First, make sure you have Node.js installed (version 18 or higher). Then run:

```bash
npm install
```

This will install all the required packages listed in `package.json`.

### 2. Run the Development Server

To see the website locally:

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

To create a production build:

```bash
npm run build
npm start
```

### 4. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel will automatically detect Next.js and deploy

---

## How to Edit Content

### Changing Text (English and Vietnamese)

All text content is stored in translation files:

- **English**: `/locales/en.json`
- **Vietnamese**: `/locales/vi.json`

**Example**: To change the hero headline:

1. Open `/locales/en.json`
2. Find `"hero": { "headline": "..." }`
3. Change the text
4. Do the same in `/locales/vi.json` for Vietnamese

The structure is the same in both files, so you can easily keep them in sync.

### How Translations Work

In components, we use the `useLanguage` hook:

```tsx
import { useLanguage } from '@/contexts/LanguageContext'

function MyComponent() {
  const { t } = useLanguage()
  return <h1>{t('hero.headline')}</h1>
}
```

The `t()` function looks up the translation based on the current language.

---

## How to Add a New Scooter Model

1. Open `/lib/designsData.ts`
2. Add a new entry to the `models` array:

```typescript
{
  id: 'honda-air-blade',
  name: 'Honda Air Blade',
  nameVi: 'Honda Air Blade',
  glbPath: '/models/honda-air-blade.glb',
  availableDesigns: 0, // Update after adding designs
}
```

3. Add designs for that model in the `designs` array:

```typescript
{
  id: '16',
  modelId: 'honda-air-blade', // Must match model id
  slug: 'my-design',
  name: 'My Design',
  nameVi: 'Thiết Kế Của Tôi',
  description: 'A beautiful design...',
  descriptionVi: 'Một thiết kế đẹp...',
  price: 450,
  image: '/images/designs/airblade-my-design.jpg',
  style: ['minimal', 'elegant'],
  includedPanels: ['Full body kit'],
}
```

4. Update the `availableDesigns` count in the model entry

---

## How to Add a New Design

1. Open `/lib/designsData.ts`
2. Add a new entry to the `designs` array (see example above)
3. Add a preview image to `/public/images/designs/`
4. The design will automatically appear in the gallery and be accessible at:
   `/designs/[model-id]/[slug]`

---

## How to Replace Images

### Design Preview Images

1. Add your image to `/public/images/designs/`
2. Name it descriptively, e.g., `lead110-holographic-neon.jpg`
3. Update the `image` path in `designsData.ts` to match

### 3D Models

1. Export your 3D model as a `.glb` or `.gltf` file
2. Place it in `/public/models/`
3. Update the `glbPath` in `designsData.ts`

**Note**: Keep 3D models optimized (2-5 MB) for fast loading.

---

## How the 3D Kaleidoscope Effect Works

The hero section features an interactive 3D scooter model. As you rotate it, different designs cycle through like a kaleidoscope.

**How it works**:
1. The `ThreeDViewer` component tracks the rotation angle
2. When rotation crosses certain thresholds (every 60 degrees by default), it changes the displayed design
3. Designs are stored in an array and cycled through based on rotation

**To customize**:
- Edit `/components/ThreeDViewer.tsx`
- Adjust the `angleStep` calculation to change how often designs switch
- Add more designs to the array passed to the component

---

## Styling and Design

### Colors

Colors are defined in `tailwind.config.ts`:

- **Accent Neon**: `#00ff88` (neon green)
- **Accent Electric**: `#0066ff` (electric blue)
- **Neutral**: Various shades of gray

To change colors, edit the `colors` section in `tailwind.config.ts`.

### Typography

The project uses **Inter** font from Google Fonts. It's loaded in `app/layout.tsx`.

To change fonts:
1. Import a new font in `app/layout.tsx`
2. Update the `fontFamily` in `tailwind.config.ts`

### Spacing and Layout

The design uses:
- Generous white space
- Large, bold headings
- Clean, minimal layout
- Smooth animations

All spacing uses Tailwind's utility classes (e.g., `py-20`, `px-8`, `gap-6`).

---

## Adding New Sections

To add a new section to the landing page:

1. Create a new component in `/components/`, e.g., `Testimonials.tsx`
2. Add it to `/app/page.tsx`:

```tsx
import Testimonials from '@/components/Testimonials'

export default function Home() {
  return (
    <>
      <Hero />
      <Testimonials /> {/* Your new section */}
      <Gallery />
      {/* ... */}
    </>
  )
}
```

3. Add translations to `/locales/en.json` and `/locales/vi.json`

---

## Connecting to a Backend

Currently, the project uses mock data. To connect to a real backend:

### 1. Contact Form

Edit `/components/ContactForm.tsx`:

```typescript
const response = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData),
})
```

Then create `/app/api/contact/route.ts` to handle the request.

### 2. Design Data

Replace mock data in `/lib/designsData.ts` with API calls:

```typescript
// Instead of importing from designsData.ts
const designs = await fetch('/api/designs').then(r => r.json())
```

### 3. File Upload

In `/components/InteractiveCreateBlock.tsx`, wire the upload to your backend:

```typescript
const formData = new FormData()
formData.append('file', file)
await fetch('/api/upload', {
  method: 'POST',
  body: formData,
})
```

---

## Common Tasks

### Change the Default Language

Edit `/contexts/LanguageContext.tsx` and change the initial state:

```typescript
const [language, setLanguageState] = useState<Language>('vi') // or 'en'
```

### Add a New Language

1. Create `/locales/[lang].json` with the same structure as `en.json`
2. Update `Language` type in `/lib/i18n.ts`
3. Add the language to the switcher

### Change the Brand Name

1. Search for "TXD" in the codebase
2. Replace with your brand name
3. Update translations in locale files

### Modify Animations

Animations use Framer Motion. Edit the `motion` components in any file to adjust:
- Duration: `transition={{ duration: 0.6 }}`
- Delay: `transition={{ delay: 0.2 }}`
- Type: `transition={{ type: 'spring' }}`

---

## Troubleshooting

### "Module not found" errors

Run `npm install` to ensure all dependencies are installed.

### 3D model not showing

- Check that the model file exists in `/public/models/`
- Verify the path in `designsData.ts` is correct
- Check browser console for errors

### Translations not working

- Ensure the key exists in both `en.json` and `vi.json`
- Check the key path matches exactly (case-sensitive)
- Verify `LanguageProvider` wraps your component

### Styles not applying

- Check that Tailwind classes are spelled correctly
- Run `npm run dev` to restart the dev server
- Clear browser cache

---

## Next Steps

1. **Replace placeholder images** with actual design previews
2. **Add 3D models** for each scooter model
3. **Customize colors** to match your brand
4. **Connect to backend** for real data and form submissions
5. **Add payment integration** for donations and orders
6. **Set up analytics** (Google Analytics, etc.)
7. **Optimize images** for web (WebP format, proper sizing)
8. **Test on mobile devices** to ensure responsiveness

---

## Support

For questions or issues:
- Check this documentation first
- Review component comments in the code
- Check Next.js documentation: [nextjs.org/docs](https://nextjs.org/docs)

---

## Project Status

✅ **Completed**:
- Project structure and configuration
- All main sections (Hero, Gallery, Contact, etc.)
- Multi-language support (EN/VI)
- 3D model viewer with kaleidoscope effect
- Responsive design
- Dynamic product pages

🔄 **To Do**:
- Add actual 3D model files
- Add real design preview images
- Connect to backend API
- Add payment processing
- Set up analytics
- Add more scooter models and designs

---

**Happy coding!** 🚀

