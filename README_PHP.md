# PitchUp — PHP + MySQL Stack

## Project Structure

```
backend_php/          ← PHP REST API
  index.php           ← Router entry point
  db.php              ← PDO MySQL connection
  helpers.php         ← JWT auth, response helpers
  mailer.php          ← PHPMailer email helper
  composer.json       ← Dependencies (firebase/php-jwt, phpmailer)
  .htaccess           ← URL rewriting
  schema.sql          ← Full MySQL schema
  routes/
    auth.php          ← /api/auth/*
    turfs.php         ← /api/turfs/*
    boxes.php         ← /api/boxes/*
    bookings.php      ← /api/bookings/*
    matches.php       ← /api/matches/*
    notifications.php ← /api/notifications/*
  uploads/            ← Uploaded turf images

frontend_html/        ← HTML/CSS/JS/Bootstrap frontend
  index.html          ← Home page
  login.html          ← Login
  register.html       ← Register
  forgot-password.html
  reset-password.html
  turfs.html          ← Browse turfs
  turf-detail.html    ← Turf detail + booking
  my-bookings.html    ← Player bookings (reschedule/cancel)
  matches.html        ← Find players / post match
  match-detail.html   ← Match detail + join/leave
  owner-dashboard.html← Owner stats, turfs, bookings, analytics
  turf-form.html      ← Add/edit turf
  js/
    api.js            ← Fetch wrapper with JWT auth
    auth.js           ← Auth helpers + toast notifications
  css/
    style.css         ← Custom styles
```

## Setup

### 1. Database
```sql
-- Import the schema
mysql -u root -proot < backend_php/schema.sql
```

### 2. Backend (PHP)
```bash
cd backend_php
composer install
```

Configure your web server (Apache/Nginx) to:
- Point document root to `backend_php/`
- Enable `mod_rewrite` (Apache) or equivalent
- All requests → `index.php`

Or use PHP built-in server for development:
```bash
cd backend_php
php -S localhost:8000
```

The API will be at `http://localhost:8000/api/...`

### 3. Frontend
Update `API_BASE` in `frontend_html/js/api.js` to match your backend URL:
```js
const API_BASE = 'http://localhost:8000/api';
```

Serve the frontend with any static server:
```bash
cd frontend_html
php -S localhost:3000
# or: npx serve .
```

### 4. Email (optional)
Set environment variables for SMTP:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_EMAIL=noreply@pitchup.com
SMTP_FROM_NAME=PitchUp
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Register |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | ✓ | Get current user |
| POST | /api/auth/forgot-password | — | Request reset |
| PUT | /api/auth/reset-password/:token | — | Reset password |
| GET | /api/turfs | — | List turfs (filterable) |
| GET | /api/turfs/my | owner | Owner's turfs |
| GET | /api/turfs/:id | — | Turf detail |
| POST | /api/turfs | owner | Create turf |
| PUT | /api/turfs/:id | owner | Update turf |
| DELETE | /api/turfs/:id | owner | Delete turf |
| POST | /api/turfs/:id/reviews | ✓ | Add review |
| GET | /api/turfs/:id/availability | — | Slot availability |
| GET | /api/turfs/:id/boxes | — | List boxes |
| POST | /api/turfs/:id/boxes | owner | Add box |
| PUT | /api/boxes/:id | owner | Update box |
| DELETE | /api/boxes/:id | owner | Delete box |
| POST | /api/bookings | ✓ | Create booking |
| GET | /api/bookings/my | ✓ | My bookings |
| GET | /api/bookings/owner | owner | Owner bookings |
| PUT | /api/bookings/:id/cancel | ✓ | Cancel booking |
| PUT | /api/bookings/:id/reschedule | ✓ | Reschedule |
| POST | /api/bookings/lock | ✓ | Lock slot |
| DELETE | /api/bookings/lock | ✓ | Unlock slot |
| GET | /api/bookings/slots | — | Booked slots |
| GET | /api/bookings/locks | — | Active locks |
| POST | /api/bookings/waitlist | ✓ | Join waitlist |
| DELETE | /api/bookings/waitlist | ✓ | Leave waitlist |
| GET | /api/bookings/waitlist | ✓ | My waitlist |
| GET | /api/matches | — | List matches |
| GET | /api/matches/:id | — | Match detail |
| POST | /api/matches | ✓ | Create match |
| POST | /api/matches/:id/join | ✓ | Join match |
| DELETE | /api/matches/:id/join | ✓ | Leave match |
| DELETE | /api/matches/:id | ✓ | Cancel match |
| GET | /api/notifications | ✓ | Get notifications |
| PATCH | /api/notifications/read-all | ✓ | Mark all read |
