# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Illumin8 CMS is a modular, brand-ready content management system built for Cloudflare's edge platform. It includes:
- **Frontend**: React + TypeScript e-commerce site for Scenic Valley Quilts
- **Admin Panel**: React-based CMS admin interface
- **Backend**: Cloudflare Pages Functions with D1 database and R2 storage
- **Deployment**: Automated Cloudflare transformation tools

## Architecture

### Core Components
- **Cloudflare Edge Stack**: Pages Functions, D1 (SQLite), R2 (file storage)
- **Frontend**: Vite + React + TypeScript + Tailwind CSS + Radix UI
- **Database**: Comprehensive schema with products, orders, pages, blog posts, SEO features
- **Admin**: Separate React app for content management with TOTP authentication

### Directory Structure
```
cms/
├── admin/              # React admin panel (Vite + TypeScript)
├── api/               # Cloudflare Pages Functions (TypeScript)
├── config/            # Deployment configuration and scripts
├── db/               # Database schema and seed data
frontend/             # Customer-facing React site (Vite + TypeScript)
cloudflare-export/    # Deployment automation tools
```

## Development Commands

### Local Development
```bash
# Start everything (admin + backend)
node start.js
# Admin UI: http://localhost:5173
# Backend API: http://localhost:8788

# Individual components
cd frontend && npm run dev    # Customer site: http://localhost:5173
cd cms/admin && npm run dev   # Admin panel: http://localhost:5173
cd cms && npx wrangler pages dev cms/admin/dist --compatibility-date=2024-07-01
```

### Build Commands
```bash
# Frontend
cd frontend && npm run build    # Build customer site
cd frontend && npm run lint     # Lint React/TypeScript

# Admin
cd cms/admin && npm run build   # Build admin panel

# Backend (Cloudflare)
cd cms && npx wrangler deploy   # Deploy to Cloudflare
```

### Database Setup
```bash
# Local D1 development
cd cms && npx wrangler d1 create scenic-valley-quilts
cd cms && npx wrangler d1 execute scenic-valley-quilts --file=./db/schema.sql
cd cms && npx wrangler d1 execute scenic-valley-quilts --file=./db/seed.sql
```

## Key Technologies

- **Backend**: Cloudflare Pages Functions (TypeScript) with D1 database
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI components
- **Payments**: Stripe integration
- **Authentication**: TOTP (Time-based One-Time Password)
- **Storage**: Cloudflare R2 for file uploads
- **Styling**: Tailwind CSS with custom design system

## Environment Configuration

Required secrets (set via Cloudflare dashboard or wrangler):
- `STRIPE_SECRET` - Stripe payment processing
- `JWT_SECRET` - JWT token signing
- `MAILCHANNELS_DOMAIN` - Email sending domain
- Database bindings configured in `wrangler.toml`

## Deployment

1. **Cloudflare Pages**: Automated via `cloudflare-export/` tools
2. **Database**: D1 SQLite with full e-commerce schema
3. **Storage**: R2 bucket for product images and media
4. **Edge Functions**: Pages Functions for API endpoints

The system is designed for zero-config deployment to Cloudflare's global edge network.