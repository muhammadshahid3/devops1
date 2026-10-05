# DocSlot - Doctor Appointment Booking (React + Laravel + Docker)

Patients browse doctors, read their education, and book a free slot.
Doctors log in, add their education/profile, open slots and manage bookings.

## Run it

You only need Docker Desktop.

```bash
docker compose up --build
```

First start takes a few minutes (Laravel and npm packages are downloaded inside the images).

| What            | URL                       |
|-----------------|---------------------------|
| Website (React) | http://localhost:5173     |
| API (Laravel)   | http://localhost:8000/api |
| MySQL           | localhost:3307 (user `docslot`, password `secret`, database `docslot`) |

Stop with `Ctrl+C`. Remove everything including the database: `docker compose down -v`.

## Demo logins (password for all: `password`)

| Role    | Email               |
|---------|---------------------|
| Patient | patient@demo.test   |
| Doctor  | ayesha@doctor.test  |
| Doctor  | bilal@doctor.test   |
| Doctor  | sana@doctor.test    |

The seeder also creates 6 doctors with education and slots for the next 7 days.
Set `SEED_DEMO_DATA: "false"` in `docker-compose.yml` for an empty database.

## Features

**Patient**
- Sign up / log in
- Search doctors by name, specialty or city
- See education, experience, fee and clinic address
- Pick a day and time slot and book (booked slots are crossed out)
- Dashboard with upcoming and past appointments, cancel anytime

**Doctor**
- Sign up as doctor with specialty and education
- Edit profile: education (one degree per line), experience, fee, city, address, bio
- Open slots: choose date, working hours and minutes per patient
- See every booking with patient name and phone
- Mark visits completed or cancel (cancelled slot opens again)

Double booking is prevented with a database row lock inside a transaction.

## How the backend image is built

`backend/Dockerfile` creates a fresh Laravel 12 app with Composer, installs Sanctum,
then copies everything in `backend/src/` over it (models, controllers, routes, migrations,
seeder, `bootstrap/app.php`). The container runs migrations and the seeder on start.

To change backend code: edit files in `backend/src/` and run `docker compose up --build backend`.

## API summary

| Method          | Endpoint                         | Who      |
|-----------------|----------------------------------|----------|
| POST            | /api/register, /api/login        | public   |
| GET             | /api/doctors?q=&specialization=  | public   |
| GET             | /api/doctors/{id}                | public   |
| GET / POST      | /api/me, /api/logout             | any user |
| GET / PUT       | /api/doctor/profile              | doctor   |
| GET/POST/DELETE | /api/doctor/slots                | doctor   |
| GET / PATCH     | /api/doctor/appointments         | doctor   |
| POST            | /api/appointments                | patient  |
| GET             | /api/patient/appointments        | patient  |
| PATCH           | /api/appointments/{id}/cancel    | patient  |

Auth uses Laravel Sanctum bearer tokens.

## Project layout

```
doctor-appointment-booking/
  docker-compose.yml
  backend/    Dockerfile, docker/entrypoint.sh, src/ (Laravel code)
  frontend/   Dockerfile, Vite + React app
```

## Going to production

This setup is for development: `php artisan serve` and the Vite dev server.
For production use PHP-FPM + Nginx, `npm run build`, strong passwords, and `APP_DEBUG=false`.
# devops1
