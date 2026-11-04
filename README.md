# TPC ALUMNI INFORMATION AND CAREER MANAGEMENT SYSTEM

An institutional web-based alumni tracking, career management, and tracer analytics platform designed for **Talibon Polytechnic College (TPC)**.

---

## System Overview

The system bridges the gap between Talibon Polytechnic College and its graduates. It provides automated alumni profile management, employment tracking, tracer study reporting, and event announcements across institutional departments.

### Key Roles
- **Alumni President (`super_admin`)**: Manages college-wide departments, Department Heads, alumni master lists, events, announcements, and executive tracer reports across all batches.
- **Department Head (`admin`)**: Verifies and approves alumni registration applications for their department, manages department graduate lists, posts departmental announcements/events, and prints department-level tracer reports.
- **Alumni / Student (`user`)**: Completes onboarding, maintains career & employment histories (job title, company, work alignment), browses announcements and events, reacts to posts, and interacts with college updates.

---

## Tech Stack (Direct Local Host)

- **Backend**: PHP 8.2+ (PHP 8.4 recommended), Laravel 12 Framework, Laravel Sanctum (token authentication).
- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Lucide Icons, React-PDF.
- **Database**: MySQL 8.0+ or MariaDB 10.4+ (runs on XAMPP or Laragon without any containers).
- **Session & Cache**: Stored directly in the MySQL database (`SESSION_DRIVER=database`, `CACHE_STORE=database`).
- **Queue**: Synchronous execution for development (`QUEUE_CONNECTION=sync`).

---

## Prerequisites & Requirements

Before running the application, make sure you have the following installed on Windows:

1. **PHP 8.2 or higher** (Run `php -v` to verify).
   - Required extensions:
     - `pdo_mysql`
     - `mbstring`
     - `openssl`
     - `gd`
     - `fileinfo`
     - `zip`
     - `bcmath`
     - `curl`
2. **Composer 2.x** (Run `composer -V` to verify).
3. **Node.js (v18+) & npm** (Run `node -v` and `npm -v` to verify).
4. **XAMPP for Windows** (or Laragon / standalone MySQL):
   - Used for the MySQL database server and phpMyAdmin database manager.

> [!WARNING]
> **Important PHP Version Warning**: Do **NOT** use XAMPP's built-in PHP (version 8.0) to run the Laravel backend. Laravel 12 requires PHP 8.2 or higher. Use PHP 8.4 from `herd-lite` (which is in your system PATH) or install PHP 8.2+. **XAMPP is used for MySQL only.**

---

## Step-by-Step Installation & Setup (XAMPP)

### Step 1: Start MySQL in XAMPP
1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **MySQL** (and optionally **Apache** if you want to use phpMyAdmin at `http://localhost/phpmyadmin`).
3. Ensure MySQL shows as running on port `3306`.

### Step 2: Import the Database (`database.sql`)
You have two quick ways to set up the database:

#### Method A: Via phpMyAdmin (Easiest)
1. Open your browser and navigate to: `http://localhost/phpmyadmin`
2. Click **New** on the left sidebar to create a database.
3. Enter database name: `tpc_alumni` with collation `utf8mb4_unicode_ci` and click **Create**.
4. Click on the `tpc_alumni` database, then select the **Import** tab at the top.
5. Click **Choose File**, select `database.sql` from the project root folder (`C:\TPC-Alumni\database.sql`), and click **Import** at the bottom.

#### Method B: Via Command Line (Fastest)
Open PowerShell or Command Prompt and run:
```powershell
# Using XAMPP's mysql client:
C:\xampp\mysql\bin\mysql.exe -u root < database.sql
```

*(Note: The database script automatically sets up all 27 tables, seeds the 7 official departments, the default Super Admin accounts, and sample alumni data).*

---

### Step 3: Configure Environment Files

1. **Backend Environment**:
   Verify that `backend/.env` exists. If not, copy `.env.example`:
   ```powershell
   cd backend
   copy .env.example .env
   php artisan key:generate
   ```
   Ensure the database configuration points to your local MySQL:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=tpc_alumni
   DB_USERNAME=root
   DB_PASSWORD=

   SESSION_DRIVER=database
   CACHE_STORE=database
   QUEUE_CONNECTION=sync
   APP_URL=http://127.0.0.1:8000
   FRONTEND_URL=http://localhost:3000
   ```

2. **Frontend Environment**:
   Verify `admin-web/.env`:
   ```env
   VITE_API_URL=http://127.0.0.1:8000
   ```

---

### Step 4: Install Dependencies (If Not Already Installed)

- **Backend**:
  ```powershell
  cd backend
  composer install
  php artisan storage:link
  ```
- **Frontend**:
  ```powershell
  cd admin-web
  npm install
  ```

---

## Running the Application

### Option 1: 1-Click Launcher (Recommended)
Simply double-click:
```
run-local.bat
```
*(Or run `start-dev.bat`, which forwards to `run-local.bat`)*

This script automatically:
1. Validates PHP, Node.js, and npm.
2. Checks that MySQL is active on port 3306.
3. Verifies the storage symlink for uploaded pictures.
4. Starts the Laravel backend on `http://127.0.0.1:8000`.
5. Starts the Vite frontend on `http://localhost:3000`.
6. Opens your browser directly to the portal.

---

### Option 2: Manual Terminal Commands
If you prefer running the servers in separate terminals:

**Terminal 1 (Backend API):**
```powershell
cd backend
php artisan serve --host=127.0.0.1 --port=8000
```

**Terminal 2 (Frontend Client):**
```powershell
cd admin-web
npm run dev
```

Then visit **`http://localhost:3000`** in your browser.

---

## Default Login Credentials

All seeded accounts use the default password: **`password`**

| Role | Email | Password | Description |
|---|---|---|---|
| **Alumni President** | `francislouieauxtero@gmail.com` | `password` | Super Admin with full access |
| **System Admin** | `admin@tpc.edu.ph` | `password` | Secondary Super Admin account |
| **Sample Graduate / Alumni** | `peterpaul@gmail.com` | `password` | BSIS Graduate (Employed) |
| **Sample Graduate / Alumni** | `kahryll@gmail.com` | `password` | BSAIS Graduate (Employed) |
| **Sample Graduate / Alumni** | `paul@gmail.com` | `password` | BSIS Graduate (Unemployed) |
| **Sample Graduate / Alumni** | `francislouie@gmail.com` | `password` | BSIS Graduate (Self-Employed) |

---

## Background Queue Processing (Optional)

In local development, `QUEUE_CONNECTION=sync` processes email and notification jobs immediately in the same request.

If you want asynchronous background queue processing like in production:
1. Open `backend/.env` and set:
   ```env
   QUEUE_CONNECTION=database
   ```
2. Open a separate terminal and run the queue worker:
   ```powershell
   cd backend
   php artisan queue:work --sleep=3 --tries=3 --timeout=60
   ```

---

## File Uploads & Profile Pictures

Uploaded avatars, event images, and announcement attachments are stored in:
`backend/storage/app/public/`

The command:
```powershell
php artisan storage:link
```
links `backend/public/storage` directly to that folder. When running locally, uploaded files are immediately accessible via `http://127.0.0.1:8000/storage/...` or through the Vite proxy.

---

## Troubleshooting

### 1. "Access denied for user 'root'@'localhost'"
- Make sure `DB_USERNAME=root` and `DB_PASSWORD=` (empty) in `backend/.env` if your XAMPP installation has no root password.
- If you set a password for root in phpMyAdmin, enter that password in `DB_PASSWORD`.

### 2. "Database 'tpc_alumni' does not exist"
- Create the database in phpMyAdmin or run:
  ```powershell
  C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE tpc_alumni;"
  ```
- Then import `database.sql`.

### 3. Images or Profile Photos not displaying (404)
- Run `php artisan storage:link` inside the `backend` directory.
- Verify `backend/public/storage` points to `backend/storage/app/public`.

### 4. CORS Errors in Browser Console
- Check `backend/.env` and ensure `CORS_ALLOWED_ORIGINS` includes `http://localhost:3000` and `http://127.0.0.1:3000`.
- Clear the Laravel configuration cache:
  ```powershell
  cd backend
  php artisan config:clear
  ```

### 5. Outbound Mail Errors
- The system defaults to `MAIL_MAILER=log`. Emails are logged to `backend/storage/logs/laravel.log` so you can test registration and password reset links without needing a real SMTP server.

### 6. "NumberFormatter" or "intl" Extension Error
- If you see an error about `NumberFormatter` or `intl`, the `herd-lite` PHP does not include the `intl` extension. For standard Laravel operations, Symfony's intl polyfills in `vendor/` handle internal operations. If native ICU formatting is required, install the standard Windows PHP 8.4 package containing `php_intl.dll`.

