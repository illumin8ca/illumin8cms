# Illumin8 CMS – Production Export Package

## Overview
This is a pre-packaged version of Illumin8 CMS designed for easy integration into Astro projects. Simply copy this folder into your Astro project root and follow the setup instructions.

## Quick Start
1. **Copy this entire folder** into your Astro project root
2. **Install dependencies**: `npm install` (in the cms/admin folder)
3. **Configure environment variables** (see wrangler.toml)
4. **Run database migrations** using the schema in `db/schema.sql`
5. **Build the admin UI**: `cd cms/admin && npm run build`
6. **Deploy to Cloudflare Pages** with the configured wrangler.toml

## What's Included
- **CMS Admin Panel**: React-based admin interface with Vite
- **API Layer**: Cloudflare Functions for backend operations
- **Database Schema**: SQLite/D1 compatible schema
- **Configuration**: Pre-configured wrangler.toml for Cloudflare
- **Branding**: Illumin8 brand guide and styling

## Requirements
- Node.js 16+
- Cloudflare account with D1 and R2
- Astro project for frontend integration

## Support
Contact: hello@illumin8.ca


