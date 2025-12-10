# Deployment Guide for Vercel

This guide explains how to deploy the scooter-wraps-landing project to Vercel.

## Prerequisites

- A GitHub account
- A Vercel account (free tier is sufficient)
- Git installed on your local machine
- Node.js and npm installed

## Step 1: Prepare Your Project

### 1.1 Verify Build Works Locally

Before deploying, ensure the project builds successfully:

```bash
cd /Users/anatolii/scooter-wraps-landing
npm run build
```

If the build succeeds (exit code 0), you're ready to deploy.

### 1.2 Check Important Files

Make sure these files exist and are correct:

- ✅ `package.json` - Contains build scripts
- ✅ `next.config.js` - Next.js configuration
- ✅ `vercel.json` - Vercel deployment configuration (optional, auto-detected)
- ✅ `.gitignore` - Excludes `node_modules`, `.next`, `.vercel`
- ✅ `tsconfig.json` - TypeScript configuration

## Step 2: Push to GitHub

### 2.1 Initialize Git Repository (if not already done)

```bash
cd /Users/anatolii/scooter-wraps-landing

# Check if git is initialized
git status

# If not initialized, run:
git init
```

### 2.2 Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Name it: `scooter-wraps-landing` (or any name you prefer)
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### 2.3 Add Remote and Push

```bash
# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/scooter-wraps-landing.git

# Stage all files
git add .

# Commit
git commit -m "Initial commit: Scooter wraps landing page"

# Push to GitHub (main branch)
git branch -M main
git push -u origin main
```

**Note:** If you already have a remote, check with `git remote -v` and update if needed.

## Step 3: Deploy to Vercel

### 3.1 Connect GitHub to Vercel

1. Go to [Vercel](https://vercel.com) and sign in (or create an account)
2. Click "Add New..." → "Project"
3. Import your GitHub repository:
   - Click "Import Git Repository"
   - Authorize Vercel to access your GitHub account (if first time)
   - Select `scooter-wraps-landing` repository
   - Click "Import"

### 3.2 Configure Project Settings

Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `./` (leave as default)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### 3.3 Environment Variables (if needed)

If your project uses environment variables (e.g., API keys, Google Analytics ID):

1. In Vercel project settings, go to "Settings" → "Environment Variables"
2. Add each variable:
   - **Name:** `NEXT_PUBLIC_GA_ID` (example)
   - **Value:** Your actual value
   - **Environment:** Production, Preview, Development (select all)
3. Click "Save"

**Note:** Check `app/layout.tsx` for any hardcoded Google Analytics IDs that might need to be moved to environment variables.

### 3.4 Deploy

1. Click "Deploy" button
2. Wait for the build to complete (usually 1-3 minutes)
3. Once deployed, you'll get a URL like: `https://scooter-wraps-landing.vercel.app`

## Step 4: How Vercel Reads and Deploys Your Project

### 4.1 Auto-Detection

Vercel automatically detects Next.js projects by:

- Finding `package.json` with `next` in dependencies
- Detecting `next.config.js` or `next.config.ts`
- Recognizing the `app/` directory structure (App Router)

### 4.2 Build Process

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Build the Project:**

   ```bash
   npm run build
   ```

   This creates:
   - Static pages in `.next/static/`
   - Server components and API routes
   - Optimized assets

3. **Deploy:**
   - Vercel uploads the `.next` output directory
   - Sets up serverless functions for API routes (`app/api/*`)
   - Configures edge network for static assets

### 4.3 File Structure Vercel Uses

```
scooter-wraps-landing/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main landing page
│   ├── layout.tsx         # Root layout
│   └── api/               # API routes (serverless functions)
├── components/            # React components
├── public/                # Static assets (served at root)
│   ├── models/            # 3D GLB models
│   ├── images/            # Images
│   └── textures/          # Texture files
├── config/                # Configuration files
├── package.json           # Dependencies and scripts
├── next.config.js         # Next.js config
└── vercel.json            # Vercel-specific config (optional)
```

### 4.4 Important Files for Deployment

**Required:**

- `package.json` - Defines dependencies and build scripts
- `next.config.js` - Next.js configuration
- `app/` directory - Your application code
- `public/` directory - Static files served at root

**Optional but Recommended:**

- `vercel.json` - Custom Vercel settings (we created this)
- `.gitignore` - Excludes unnecessary files from Git
- `tsconfig.json` - TypeScript configuration
- `README.md` - Project documentation

**Ignored by Vercel (via .gitignore):**

- `node_modules/` - Installed during build
- `.next/` - Generated during build
- `.vercel/` - Vercel local config
- `.env*.local` - Local environment variables

## Step 5: Post-Deployment

### 5.1 Custom Domain (Optional)

1. In Vercel project settings, go to "Settings" → "Domains"
2. Add your custom domain (e.g., `scooterwraps.com`)
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic, usually < 5 minutes)

### 5.2 Environment Variables for Production

If you need different values for production:

1. Go to "Settings" → "Environment Variables"
2. Add variables with "Production" environment selected
3. Redeploy the project

### 5.3 Monitoring

- **Deployments:** View all deployments in the "Deployments" tab
- **Analytics:** Enable Vercel Analytics in project settings
- **Logs:** View function logs in the "Functions" tab

## Step 6: Continuous Deployment

Vercel automatically deploys when you push to GitHub:

1. **Push to `main` branch** → Deploys to production
2. **Push to other branches** → Creates preview deployments
3. **Pull Requests** → Creates preview deployments with unique URLs

### 6.1 Workflow

```bash
# Make changes locally
git add .
git commit -m "Update design"
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Runs npm install
# 3. Runs npm run build
# 4. Deploys to production
# 5. Sends you a notification
```

## Troubleshooting

### Build Fails on Vercel

1. **Check Build Logs:**
   - Go to Vercel dashboard → Your project → Failed deployment
   - Click "View Function Logs" or "Build Logs"

2. **Common Issues:**
   - **Missing dependencies:** Check `package.json` includes all required packages
   - **TypeScript errors:** Fix type errors locally first (`npm run build`)
   - **Missing files:** Ensure all required files are committed to Git
   - **Environment variables:** Check if any are missing

3. **Test Locally:**
   ```bash
   npm run build
   npm run start  # Test production build locally
   ```

### 3D Models Not Loading

- Ensure GLB files are in `public/models/`
- Check file paths in `config/scooters.js`
- Verify file sizes (Vercel has limits, but GLB files should be fine)

### Images Not Loading

- Ensure images are in `public/images/` or `public/textures/`
- Use relative paths starting with `/` (e.g., `/images/design.jpg`)
- Check file extensions match exactly (case-sensitive)

## Summary

**Commands to Push to GitHub:**

```bash
cd /Users/anatolii/scooter-wraps-landing
git add .
git commit -m "Ready for deployment"
git push origin main
```

**Vercel Deployment:**

1. Import GitHub repository in Vercel
2. Auto-detects Next.js (no configuration needed)
3. Click "Deploy"
4. Get your live URL

**Important Files:**

- `package.json` - Build configuration
- `next.config.js` - Next.js settings
- `app/` - Application code
- `public/` - Static assets

Your project is now ready for deployment! 🚀
