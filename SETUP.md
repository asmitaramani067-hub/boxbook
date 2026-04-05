# QuickBox — Local Setup Guide

## Prerequisites

Make sure you have the following installed:

- PHP 8.0+
- MySQL 5.7+ or MariaDB
- Composer ([getcomposer.org](https://getcomposer.org))

---

## 1. Clone the Repository

```bash
git clone https://github.com/asmitaramani067-hub/boxbook.git
cd boxbook
git checkout tech-stack-change
```

---

## 2. Database Setup

Make sure MySQL is running, then import the schema:

```bash
mysql -u root -proot < backend_php/schema.sql
```

This creates the `quickbox` database with all required tables.

If your MySQL credentials are different, update `backend_php/db.php`:

```php
$user = 'your_mysql_user';
$pass = 'your_mysql_password';
```

---

## 3. Backend Setup (PHP API)

```bash
cd backend_php
composer install
```

Start the PHP development server:

```bash
php -S 127.0.0.1:8000 index.php
```

API will be available at: `http://127.0.0.1:8000/api`

---

## 4. Frontend Setup (HTML)

Open a new terminal from the project root:

```bash
php -S 127.0.0.1:5500 -t frontend_html
```

Open in browser: `http://127.0.0.1:5500`

---

## 5. Run Both at Once

From the project root:

```bash
php -S 127.0.0.1:8000 backend_php/index.php &
php -S 127.0.0.1:5500 -t frontend_html
```

---

## 6. Email Setup (Optional)

To enable password reset emails, set these environment variables before starting the backend:

```bash
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USER=your@gmail.com
export SMTP_PASS=your_app_password
export SMTP_FROM_EMAIL=noreply@quickbox.com
export SMTP_FROM_NAME=QuickBox
```

---

## Default Ports

| Service      | URL                        |
|--------------|----------------------------|
| Backend API  | http://127.0.0.1:8000/api  |
| Frontend     | http://127.0.0.1:5500      |
