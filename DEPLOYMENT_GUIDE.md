# TPC Alumni Information System - Deployment Guide (Local + Vercel)

This guide walks you through deploying the **TPC Alumni Information and Career Management System**.

> [!IMPORTANT]
> **Architecture Note**: **Vercel hosts ONLY the React frontend (`admin-web`)**.
> The Laravel backend API (`/backend`) and MySQL database must be hosted on a separate PHP/MySQL environment (such as a VPS, shared hosting like cPanel/Hostinger, Render, Fly.io, or an institutional server). The production backend host has not been selected yet.

---

## 1. Local Development (Windows + XAMPP)

For full local development instructions, see [`README.md`](README.md).
- **Backend API**: Runs locally on `http://127.0.0.1:8000` via `php artisan serve`.
- **Frontend SPA**: Runs locally on `http://localhost:3000` via `npm run dev`.
- **Database**: Runs locally via XAMPP MySQL / MariaDB on port `3306` (`tpc_alumni`).
- **Quick Start**: Double-click `run-local.bat`.

---

## 2. Deploying Frontend (`admin-web`) to Vercel

### Step 1: Push Code to GitHub
Ensure your repository is pushed to GitHub:
```bash
git push origin <your-branch>
```

### Step 2: Configure Vercel Project
1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository (`TPC-Alumni`).
3. In the project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`admin-web`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Add Single Page Application (SPA) Rewrite (`vercel.json`)
To ensure that React Router client-side routes (e.g. `/student/dashboard`, `/alumni-list`, `/login`) work without throwing a `404 Not Found` error when users refresh or directly access a link, create a `vercel.json` file inside the `admin-web` directory:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Step 4: Configure Vercel Environment Variables
In your Vercel Project Settings $\rightarrow$ **Environment Variables**, add:

| Variable | Example Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://api.your-tpc-alumni-backend.com` | Full HTTPS URL of your deployed Laravel backend API |

---

## 3. Production Backend Configuration Checklist

Whenever you choose and set up your production backend hosting (VPS, shared hosting, cloud VM, etc.), the following environment variables in `backend/.env` **must** be updated to link securely with your Vercel frontend:

```env
# Application URL (Your deployed backend domain)
APP_URL=https://api.your-tpc-alumni-backend.com

# Frontend Application URL (Your Vercel production domain)
FRONTEND_URL=https://tpc-alumni.vercel.app

# Cross-Origin Resource Sharing (CORS) - Allows Vercel frontend to call Laravel API
CORS_ALLOWED_ORIGINS=https://tpc-alumni.vercel.app

# Laravel Sanctum Stateful Domains (Enables secure cookie/session & token auth from Vercel)
SANCTUM_STATEFUL_DOMAINS=tpc-alumni.vercel.app

# Production Database Credentials
DB_CONNECTION=mysql
DB_HOST=your-production-db-host
DB_PORT=3306
DB_DATABASE=your-production-db-name
DB_USERNAME=your-production-db-user
DB_PASSWORD=your-secure-db-password

# Session & Cache (Can remain database for zero external dependencies)
SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

---

## 4. Production Security & Optimization Checklist

Once the production backend is active:
1. Set `APP_ENV=production` and `APP_DEBUG=false`.
2. Generate an encryption key: `php artisan key:generate`.
3. Run migrations on the production database: `php artisan migrate --force`.
4. Link storage for uploaded photos and resumes: `php artisan storage:link`.
5. Cache configuration and routes for optimal performance:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```
