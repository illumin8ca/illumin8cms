# Illumin8 CMS – Stand-Alone Module

## Overview
Illumin8 CMS is a modular, brand-ready content management system designed for easy integration into any modern web project. This folder contains all backend, frontend, and configuration files needed to run the CMS independently or as a submodule in a larger project.

---

## Folder Structure
```
illumin8-cms/
  backend/           # API logic, database models, endpoints
  frontend/          # React UI, admin panel, branding
  db/                # Database schema (SQL)
  BRAND-GUIDE.md     # Illumin8 brand guide (colors, logo, UI)
  README.md          # This file
  ...                # Additional config/scripts as needed
```

---

## Integration Instructions
1. **Copy the `illumin8-cms/` folder** into your project root or desired subdirectory.
2. **Install dependencies** for both backend and frontend (see respective package.json files).
3. **Configure environment variables** as needed (see `.env.example` or config docs).
4. **Run database migrations** using the schema in `db/schema.sql`.
5. **Start the backend and frontend servers** (see scripts in backend/frontend folders).
6. **Access the CMS UI** at the provided local URL (default: http://localhost:3000 or as configured).

---

## Requirements
- Node.js (v16+ recommended)
- SQL database (Cloudflare D1 or compatible)
- Modern browser for admin UI

---

## Customization
- Update branding, colors, and UI elements as needed using `BRAND-GUIDE.md`.
- Use Bootstrap Icons via React/bs library for consistent iconography.
- All styles and components are designed for light mode only.

---

## Support
For questions or help, contact the Illumin8 CMS team at hello@illumin8.ca 