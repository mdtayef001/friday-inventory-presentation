# Friday Inventory — backend

Django + Django REST Framework API for the Next.js app in `../frontend`.
Login uses JWT (SimpleJWT). There is no sign-up: the super admin creates
businesses and their owners, and owners and managers create the other users.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env              # set DJANGO_SECRET_KEY and JWT_SIGNING_KEY
python manage.py migrate
python manage.py seed_demo        # demo businesses and logins (or: createsuperuser)
python manage.py runserver        # http://localhost:8000
```

With `DATABASE_URL` empty the backend uses SQLite (`db.sqlite3`). To use Supabase, copy the
"Session pooler" connection string from the Supabase dashboard (Connect button) into
`DATABASE_URL`, add `?sslmode=require`, then run `migrate` and `seed_demo` against it.

`JWT_SIGNING_KEY` must be the same in `backend/.env` and `frontend/.env.local`: the Next.js
proxy uses it to check login tokens. `python manage.py seed_demo --reset` puts the demo data
back to how it started.

Run the tests with `python manage.py test apps`.

## Deploying

This branch carries no host-specific configuration: deploy it wherever you like.

- **backend**: serve `config.wsgi` behind a real server, run `collectstatic`, and set
  `DATABASE_URL` (PostgreSQL, `?sslmode=require`), `DJANGO_SECRET_KEY`, `JWT_SIGNING_KEY`,
  `DJANGO_ALLOWED_HOSTS` (the backend's domain), `CORS_ALLOWED_ORIGINS` and `FRONTEND_URL`
  (the frontend's address), and `CRON_SECRET`. Leave `DJANGO_DEBUG` unset.
- **frontend**: `API_URL` (`https://<backend domain>/api`) and the same `JWT_SIGNING_KEY`
  as the backend.

Run migrations yourself against the production database before a release that adds one:

```bash
DATABASE_URL='postgresql://…:5432/postgres?sslmode=require' \
  sh -c 'python manage.py migrate && python manage.py createcachetable'
```

`createcachetable` is only needed on PostgreSQL, where the login rate limit lives in a table.

`GET /api/cron/cleanup/` deletes expired login tokens and finishes due business deletions. It
authenticates with `CRON_SECRET` as a Bearer token; call it once a day from whatever scheduler
your host provides (cron, a systemd timer, an external pinger). Nothing calls it automatically.

## Layout

| Path | What it is |
| --- | --- |
| `config/` | Settings and root URLs |
| `apps/accounts/` | `Business` (tenant), `User` (role + locations), JWT login, role permissions |
| `apps/inventory/` | Locations, products, stock, clients, shipments, rentals, transfers, activity log |
| `apps/inventory/services.py` | Every stock-changing action, atomic and logged |
| `apps/api.py` | Shared serializer fields (ids go out as strings, like the frontend's types) |

JSON is camelCase on the wire, matching `frontend/src/lib/types.ts`.

## Roles

`superadmin` runs the platform (`/api/platform/…`) and has no tenant data access.
`owner` sees everything in their business. `manager` and `staff` are limited
to their assigned locations, and the owner's switches in business settings
(`modules`, `permissions`) turn features on and off for them, the same rules as
`frontend/src/lib/auth/roles.ts`. A business that is suspended, or whose
deletion has been approved, gets 403 on every tenant endpoint.

## Endpoints (all under `/api/`)

| Endpoint | Who |
| --- | --- |
| `POST auth/login/` · `auth/refresh/` · `auth/logout/` · `GET auth/me/` | everyone |
| `GET/PATCH business/` | owner |
| `users/` | owner; managers manage staff when allowed |
| `locations/`, `products/` (`?code=` for scanner lookup), `stock/`, `POST stock/adjust/` | owner, manager, staff |
| `clients/`, `activity/` | owner, manager |
| `shipments/` + `POST {id}/status/` | owner, manager (tracking module) |
| `rentals/` + `POST {id}/return/` | owner, manager (rentals module) |
| `transfers/` + `POST {id}/receive/` · `{id}/cancel/` | owner, manager (transfers module) |
| `GET sales/summary/` (filters: `from`, `to`, `location`, `product`, `seller`, `channel`; includes the chart series and top products) | owner, manager |
| `GET sales/export/` (same filters) | owner, manager; CSV, profit columns only for those allowed to see profit |
| `sales/` (`POST` to sell) | everyone sells at their own shops; owners and managers list; cost and profit for owners only |
| `stock-requests/` + `POST {id}/approve/` · `{id}/decline/` · `{id}/cancel/` | managers ask; owner or a manager of the sending location decides |
| `suppliers/` (`?stats=1`) · `purchases/` + `GET summary/` | owners; managers when `managerPurchases` is on, at their locations. A purchase adds stock and averages the price paid into the product's cost |
| `supplier-returns/` + `POST {id}/replacement/` · `{id}/refund/` · `{id}/credit/` · `{id}/close/` · `GET summary/` | same access; credit and close are owners only |
| `supplier-payments/` + `GET summary/` · `GET suppliers/{id}/statement/` | owners only; a payment is given to the supplier's oldest unpaid bills |
| `GET track/{token}/` | public; a client's order status, nothing internal |
| `platform/businesses/` + `POST {id}/suspend/` · `{id}/approve-deletion/` · `{id}/stop-deletion/`, `DELETE`, `POST platform/users/{id}/password/` | super admin |
