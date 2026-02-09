# AI-Powered LMS Platform

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Sanity](https://img.shields.io/badge/Sanity-CMS-F03E2F?logo=sanity)](https://www.sanity.io/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk)](https://clerk.com/)
[![Mux](https://img.shields.io/badge/Mux-Video-FF5A5F)](https://www.mux.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai)](https://openai.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

> A modern Learning Management System with AI-powered features and custom CMS.

---

## 📖 What Is This?

A full-featured Learning Management System (LMS) platform where:
- **Admins** create and manage video courses through a custom admin panel
- **Learners** watch lessons, track progress, and get AI-powered assistance
- **Content** is organized into courses, modules, and lessons with tiered access

### Key Features

- **Custom Admin Panel** built with Sanity App SDK
- **AI Learning Assistant** powered by GPT-4o (Ultra tier)
- **Tiered Subscriptions** (Free, Pro, Ultra)
- **Professional Video Streaming** via Mux
- **Progress Tracking** per user
- **Modern UI** with Tailwind 4 and Shadcn components

---

## ⭐ Features

### For Learners

| Feature | Free | Pro | Ultra |
|---------|:----:|:---:|:-----:|
| Foundational courses | ✅ | ✅ | ✅ |
| Basic projects | ✅ | ✅ | ✅ |
| Email support | ✅ | ✅ | ✅ |
| Advanced courses | ❌ | ✅ | ✅ |
| Priority support | ❌ | ✅ | ✅ |
| Certificates | ❌ | ✅ | ✅ |
| **AI Learning Assistant** | ❌ | ❌ | ✅ |
| Exclusive content | ❌ | ❌ | ✅ |

### Technical Features

#### Architecture

| Route | Technology | Purpose |
|-------|------------|---------|
| `/admin` | **Sanity App SDK** | Custom admin panel for content management |
| `/studio` | **Sanity Studio** | Full CMS fallback for advanced operations |

#### AI Features

- GPT-4o powered tutor with course content search
- Semantic search across lessons
- Context-aware responses
- Ultra tier exclusive

#### Video Streaming

- Mux integration for professional hosting
- Signed playback tokens
- Adaptive bitrate streaming
- Automatic thumbnail generation

#### Authentication & Billing

- Clerk authentication
- Subscription management
- Tier-based content gating
- Webhook integration

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- **pnpm** package manager
- Accounts: Sanity, Clerk, Mux, OpenAI

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd lms-platform
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Copy environment variables**

```bash
cp .env.example .env.local
```

4. **Configure environment variables**

```bash
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-11-27

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# OpenAI (for AI Tutor)
OPENAI_API_KEY=sk-...

# Mux Video
MUX_TOKEN_ID=your_mux_token_id
MUX_TOKEN_SECRET=your_mux_token_secret
MUX_SIGNING_KEY_ID=your_signing_key_id
MUX_SIGNING_KEY_PRIVATE=your_signing_key_private
```

5. **Run development server**

```bash
pnpm dev
```

6. **Access the application**

- Main app: [http://localhost:3000](http://localhost:3000)
- Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)
- Sanity Studio: [http://localhost:3000/studio](http://localhost:3000/studio)

---

## 🗄️ Database Schema

### Document Types

| Type | Description | Key Fields |
|------|-------------|------------|
| **Course** | Top-level container | title, slug, tier, modules[], featured |
| **Module** | Groups lessons | title, description, lessons[] |
| **Lesson** | Individual unit | title, slug, video, content, completedBy[] |
| **Category** | Organizes courses | title, description |

### Content Hierarchy

```
Course
├── category (reference)
├── modules[] (references)
│   └── lessons[] (references)
└── completedBy[] (user IDs)

Lesson
├── video (Mux asset)
├── content (Portable Text)
└── completedBy[] (user IDs)
```

---

## 🚢 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
pnpm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Post-Deployment

- Set environment variables in Vercel dashboard
- Configure Clerk webhooks: `https://your-domain.com/api/webhooks/clerk`
- Add production domain to Sanity CORS settings

---

## 🔧 Common Issues

### Authentication

| Problem | Solution |
|---------|----------|
| "Clerk not loading" | Check `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |
| Subscription not recognized | Verify webhook configuration |

### Video Playback

| Problem | Solution |
|---------|----------|
| Videos not playing | Verify Mux credentials |
| "Invalid token" | Check `MUX_SIGNING_KEY_PRIVATE` format |

### Sanity

| Problem | Solution |
|---------|----------|
| "Project not found" | Verify `NEXT_PUBLIC_SANITY_PROJECT_ID` |
| Schema changes not appearing | Restart dev server |
| TypeScript errors | Run `pnpm typegen` |

---

## 📚 Quick Reference

### Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm start            # Start production server

# Type Generation
pnpm typegen          # Generate Sanity types
pnpm typecheck        # Check TypeScript

# Code Quality
pnpm lint             # Run Biome linter
pnpm format           # Format with Biome
```

### Project Structure

```
├── app/
│   ├── (admin)/admin/     # Custom admin panel
│   ├── (app)/             # Main app
│   ├── studio/            # Sanity Studio
│   └── api/               # API routes
├── components/
│   ├── admin/             # Admin components
│   ├── courses/           # Course components
│   ├── lessons/           # Lesson components
│   ├── tutor/             # AI tutor
│   └── ui/                # Shadcn components
├── lib/
│   ├── actions/           # Server actions
│   ├── ai/                # AI agent & tools
│   └── hooks/             # React hooks
├── sanity/
│   ├── schemaTypes/       # Schema definitions
│   └── lib/               # Client & queries
└── sanity.config.ts       # Studio config
```

---

## 📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License**.

### You CAN:

- ✅ Use for learning and personal projects
- ✅ Modify and adapt the code
- ✅ Use as a portfolio piece

### You CANNOT:

- ❌ Use for commercial purposes without permission
- ❌ Sell or resell this code

See [LICENSE.md](LICENSE.md) for full details.
