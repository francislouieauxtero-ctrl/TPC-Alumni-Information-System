# TPC Alumni Information System - Deployment Guide (Railway + TiDB Cloud)

This guide walks you step-by-step through deploying the **TPC Alumni Information and Career Management System** to **Railway** using the MySQL-compatible Serverless database on **TiDB Cloud**.

---

## Architecture Overview

- **Backend API Service**: Laravel 12 (`/backend`) running in a production Docker container (PHP 8.3 + Nginx).
- **Frontend SPA Service**: Vite + React 19 (`/admin-web`) served with lightweight Nginx.
- **Database**: TiDB Cloud Serverless (MySQL 8.0 compatible with TLS/SSL encryption via bundled Let's Encrypt ISRG Root X1 CA).
- **Source Repository**: Connected to GitHub repository `francislouieauxtero-ctrl/TPC-Alumni-Information-System`.

---

## Step 1: TiDB Cloud Database Connection Details

Your TiDB Cloud connection details:
- **Host**: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`
- **Port**: `4000`
- **Database**: `tpc_alumni`
- **Username**: `3AmsX7WPRGu2Rdb.root`
- **Password**: *(Enter manually in Railway Dashboard — never commit to code)*
- **SSL Certificate Path**: `/etc/ssl/certs/tidb-ca.pem` *(automatically bundled into the Docker image)*

### (Optional) Manual Schema Import
If you wish to import the clean schema directly from the TiDB Cloud web console SQL editor:
1. Open `database-backup/clean_schema.sql` in VS Code.
2. Copy the entire SQL content and paste it into the TiDB Cloud SQL Editor, then execute it.
*(Alternatively, the Laravel backend container will automatically run `php artisan migrate` on startup!)*

---

## Step 2: Deploy Backend to Railway

1. Go to [https://railway.com](https://railway.com) and sign in with GitHub.
2. Click **New Project** > **Deploy from GitHub repo**.
3. Select `francislouieauxtero-ctrl/TPC-Alumni-Information-System`.
4. Click on the created service and go to **Settings**:
   - **Service Name**: Change to `tpc-backend`
   - **Root Directory**: Set to `/backend`
   - **Build**: Ensure Builder is set to **Dockerfile** (uses `/backend/Dockerfile`)
5. Go to the **Variables** tab and configure:

| Variable Name | Value | Description |
|---|---|---|
| `APP_NAME` | `TPC Alumni System` | Application Name |
| `APP_ENV` | `production` | Production environment |
| `APP_KEY` | *(Generate a 32-char key or copy from local `.env`)* | Laravel encryption key |
| `APP_DEBUG` | `false` | Disable debug mode in production |
| `APP_URL` | `https://${{RAILWAY_PUBLIC_DOMAIN}}` | Backend public URL |
| `DB_CONNECTION` | `mysql` | MySQL connection driver |
| `DB_HOST` | `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` | TiDB Cloud endpoint |
| `DB_PORT` | `4000` | TiDB Cloud port |
| `DB_DATABASE` | `tpc_alumni` | TiDB database name |
| `DB_USERNAME` | `3AmsX7WPRGu2Rdb.root` | TiDB username |
| `DB_PASSWORD` | `<your-tidb-password>` | Set directly as Railway secret |
| `MYSQL_ATTR_SSL_CA` | `/etc/ssl/certs/tidb-ca.pem` | Bundled ISRG Root X1 CA cert |
| `SESSION_DRIVER` | `database` | Store sessions in DB |
| `CACHE_STORE` | `database` | Store cache in DB |
| `QUEUE_CONNECTION` | `database` | Process queue jobs in DB |
| `SUPER_ADMIN_NAME` | `System Admin` | Name for default Super Admin |
| `SUPER_ADMIN_EMAIL` | `<your-email-address>` | Email for default Super Admin |
| `SUPER_ADMIN_PASSWORD` | `<your-secure-admin-password>` | Password for default Super Admin |
| `RUN_MIGRATIONS` | `true` | Runs migrations on deploy |
| `RUN_SEEDER` | `true` | Seeds Super Admin using env variables |
| `FRONTEND_URL` | *(Will be updated after Step 3 with frontend domain)* | Frontend URL |
| `CORS_ALLOWED_ORIGINS` | *(Will be updated after Step 3 with frontend domain)* | Allowed origins |
| `SANCTUM_STATEFUL_DOMAINS` | *(Will be updated after Step 3 with frontend domain)* | Sanctum domains |

6. Go to **Settings** > **Networking** > **Public Networking** and click **Generate Domain** (e.g. `tpc-backend-production.up.railway.app`).
7. Copy your backend domain URL.

---

## Step 3: Deploy Frontend (`admin-web`) to Railway

1. In the same Railway project dashboard, click **+ New Service** > **GitHub Repo**.
2. Select `francislouieauxtero-ctrl/TPC-Alumni-Information-System`.
3. Click on the new service and go to **Settings**:
   - **Service Name**: Change to `tpc-frontend`
   - **Root Directory**: Set to `/admin-web`
   - **Build**: Ensure Builder is set to **Dockerfile** (uses `/admin-web/Dockerfile`)
4. Go to the **Variables** tab and add:

| Variable Name | Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://<your-backend-domain>.up.railway.app` | Backend API URL for build |
| `BACKEND_URL` | `https://<your-backend-domain>.up.railway.app` | Nginx reverse proxy target |

5. Go to **Settings** > **Networking** > **Public Networking** and click **Generate Domain** (e.g. `tpc-frontend-production.up.railway.app`).
6. Copy your frontend domain URL.

---

## Step 4: Update Backend CORS with Frontend Domain

Now that you have your frontend URL (e.g., `https://tpc-frontend-production.up.railway.app`):
1. Return to the `tpc-backend` service in Railway.
2. Go to **Variables** and update:
   - `FRONTEND_URL`: `https://tpc-frontend-production.up.railway.app`
   - `CORS_ALLOWED_ORIGINS`: `https://tpc-frontend-production.up.railway.app`
   - `SANCTUM_STATEFUL_DOMAINS`: `tpc-frontend-production.up.railway.app`
3. Railway will automatically redeploy the backend with the updated CORS configuration.

---

## Step 5: Verification & Testing

1. Open your Frontend URL: `https://<your-frontend-domain>.up.railway.app`
2. **Login as Super Admin**:
   - Email: The email configured in `SUPER_ADMIN_EMAIL`
   - Password: The password configured in `SUPER_ADMIN_PASSWORD`
3. **Verify Clean Database**:
   - Check **Departments**: Clean (0 records) — ready for you to create official college departments.
   - Check **Alumni Profiles / Master List**: Clean (0 records).
   - Check **Events**: Clean (0 records).
   - Check **Announcements**: Clean (0 records).
4. **Test Real Data Flow**:
   - Create a Department (e.g., `Bachelor of Science in Information System`).
   - Create an Event or Announcement.
   - Test Alumni registration and approval workflow.

---

## Step 6: Ongoing Development & GitHub CI/CD Workflow

Whenever you make improvements or changes to the project in **VS Code**:

1. Open your project in VS Code (`C:\TPC-Alumni`).
2. Make your code edits in `admin-web` or `backend`.
3. Commit and push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Add new features or bug fixes"
   git push origin main
   ```
4. **Automatic Deployment**: Railway listens for commits to the `main` branch:
   - If you modified `/backend`, Railway automatically builds and deploys the backend.
   - If you modified `/admin-web`, Railway automatically builds and deploys the frontend.
5. You can monitor the live build logs directly in the Railway dashboard.
