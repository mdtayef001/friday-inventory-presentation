# Friday Inventory

A multi-business inventory system: live stock across shops and warehouses, selling and receipts,
purchases from suppliers, rentals, stock transfers and delivery tracking, with roles and
per-feature permissions set by each business owner.

It is two apps that run and deploy separately:

| Folder      | What it is                                                                 |
|-------------|----------------------------------------------------------------------------|
| `backend/`  | Django 6 + Django REST Framework API, JWT login, PostgreSQL or SQLite      |
| `frontend/` | Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui            |

The browser never talks to Django directly: the Next.js server calls the API, and the browser's own
requests go through `/api/backend/*`, which attaches the login token.

- `/` is a public landing page describing the project, with a **Log in** button.
- `/login` is the only way in. There is no public sign-up: the super admin creates each business
  together with its owner's login, and the owner creates managers and staff.

## What you need

- **Python 3.12** or newer
- **Node.js 20** or newer (built with 24) and npm
- A **PostgreSQL** database for anything beyond local development. Locally you can skip it and use
  SQLite, which needs no setup.

## 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # then fill it in, see below
python manage.py migrate
python manage.py seed_demo         # demo businesses and logins (or: createsuperuser)
python manage.py runserver         # http://localhost:8000
```

Generate the two secrets `.env` needs:

```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"   # DJANGO_SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(48))"   # JWT_SIGNING_KEY
```

Run the tests with `python manage.py test apps`.

### `backend/.env`

| Variable               | Required            | What it is                                                                                 |
|------------------------|---------------------|--------------------------------------------------------------------------------------------|
| `DJANGO_SECRET_KEY`    | yes in production   | Django's signing key. Any long random string. Required once `DJANGO_DEBUG` is off.         |
| `JWT_SIGNING_KEY`      | **yes**             | Signs login tokens. At least 32 characters, and **the same value** as in `frontend/.env.local`. |
| `DJANGO_DEBUG`         | no (default `false`)| `true` for local development.                                                               |
| `DJANGO_ALLOWED_HOSTS` | no                  | Comma-separated hosts. Default `localhost,127.0.0.1`.                                       |
| `DATABASE_URL`         | no                  | PostgreSQL connection string. **Leave empty to use SQLite** (`backend/db.sqlite3`).        |
| `DATABASE_CONN_MAX_AGE`| no (default `0`)    | Seconds to keep a database connection open. Keep `0` with `runserver` and with poolers.    |
| `CORS_ALLOWED_ORIGINS` | no                  | Where the browser may call the API from. Default `http://localhost:3000`.                   |
| `FRONTEND_URL`         | no                  | Public address of the Next.js app. Default `http://localhost:3000`.                         |
| `CRON_SECRET`          | no                  | Bearer token for the daily cleanup job at `/api/cron/cleanup/`. Any long random string.     |

## 2. Frontend

Start the backend first, then:

```bash
cd frontend
npm install
cp .env.example .env.local         # set JWT_SIGNING_KEY to the same value as backend/.env
npm run dev                        # http://localhost:3000
```

`npm run build` makes a production build, `npm run lint` lints, and `npx tsc --noEmit` type-checks.

### `frontend/.env.local`

| Variable          | Required | What it is                                                                     |
|-------------------|----------|--------------------------------------------------------------------------------|
| `API_URL`         | **yes**  | The Django API, including `/api`. Locally `http://localhost:8000/api`.         |
| `JWT_SIGNING_KEY` | **yes**  | Verifies login tokens. Must match `JWT_SIGNING_KEY` in `backend/.env` exactly. |

If the two keys don't match, login appears to work and then every page bounces back to `/login`.

## 3. Connecting PostgreSQL on Supabase

Only the backend talks to the database; the frontend needs nothing for this.

1. Create a project at [supabase.com](https://supabase.com) and remember the database password.
2. In the project, click **Connect** at the top and open the **ORMs / connection string** tab.
3. Copy a connection string:
   - **Session pooler** (port `5432`) for local development and for a normal server.
   - **Transaction pooler** (port `6543`) for serverless hosting, where each request may land on a
     different instance.
4. Put it in `backend/.env` as `DATABASE_URL`, replace `[YOUR-PASSWORD]` with the database password,
   and add `?sslmode=require` on the end:

   ```
   DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require
   ```

5. Create the tables and the demo data on it:

   ```bash
   cd backend
   source .venv/bin/activate
   python manage.py migrate
   python manage.py createcachetable      # the login rate limit lives in a table on PostgreSQL
   python manage.py seed_demo             # optional
   ```

Switching back to SQLite is just emptying `DATABASE_URL` again. Any plain PostgreSQL database works
the same way — Supabase is only one way to get one.

> Keep `.env` and `.env.local` out of version control. Both are already ignored, and
> `.env.example` is the file to copy.

## 4. Demo logins

`python manage.py seed_demo` creates three businesses and these accounts. They are also listed on
the login page while running in development.

| Role        | Email              | Password   | Sees                                                        |
|-------------|--------------------|------------|-------------------------------------------------------------|
| Super admin | super@friday.app   | super123   | The platform: every business, and adds or suspends them     |
| Owner       | owner@friday.app   | owner123   | Everything in Friday Demo Store, including Business Settings|
| Manager     | manager@friday.app | manager123 | Their own outlets, with the rights the owner gave them      |
| Staff       | staff@friday.app   | staff123   | Quick Entry only: scanning and adding stock                 |
| Owner       | cafe@friday.app    | cafe1234   | Green Leaf Café, a business with rentals switched off       |
| Owner       | urban@friday.app   | urban123   | Urban Party Rentals                                         |

`python manage.py seed_demo --reset` deletes the demo businesses and loads them again.

## How access is checked

A login returns a short-lived access token and a longer refresh token, both in cookies the browser
can't read. Every request passes four checks:

1. `frontend/src/proxy.ts` verifies the token and renews it before any page renders.
2. The page re-reads the session through `frontend/src/lib/auth/dal.ts`, which asks Django who the
   user is, so disabling an account or changing a role takes effect at once.
3. `frontend/src/lib/auth/roles.ts` decides which routes that role may open.
4. Django checks the role, the business's feature switches and the owner's permissions again on
   every API call (`backend/apps/accounts/permissions.py`), and scopes every query to one business.
