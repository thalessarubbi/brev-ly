# brev.ly — Server

REST API for managing shortened URLs.

## Tech Stack

Required:

- TypeScript
- Fastify
- Drizzle
- Postgres

## Functional Requirements

### Links

- [ ] FR01 – Create a link — `POST /links`
- [ ] FR02 – Delete a link — `DELETE /links/:id`
- [ ] FR03 – List all registered links — `GET /links`

### Access

- [ ] FR04 – Get the original URL from a shortened URL — `GET /links/:shortUrl`
- [ ] FR05 – Increment the access count of a link — `PATCH /links/:id/access`

### CSV Export

- [ ] FR06 – Export the created links to a CSV — `POST /links/exports`

## Business Rules

- [ ] BR01 – A shortened URL must be well-formed (allowed format: `^[a-z0-9-]+$`)
- [ ] BR02 – A shortened URL must be unique
- [ ] BR03 – Delete and increment use the same identifier (`id`), for consistency with the front-end

## Non-Functional Requirements

- [ ] NFR01 – Link listing is performant (paginated, indexed on `short_url`)
- [ ] NFR02 – CSV is generated via streaming, not loaded fully into memory
- [ ] NFR03 – CSV is accessible through a CDN (Cloudflare R2, Amazon S3, etc.)
- [ ] NFR04 – CSV file name is random and unique
- [ ] NFR05 – CSV columns: `original_url`, `short_url`, `access_count`, `created_at`
- [x] NFR06 – CORS is enabled

## Environment Variables

- [x] `.env.example` file with the following keys:

```env
PORT=
DATABASE_URL=

CLOUDFLARE_ACCOUNT_ID=""
CLOUDFLARE_ACCESS_KEY_ID=""
CLOUDFLARE_SECRET_ACCESS_KEY=""
CLOUDFLARE_BUCKET=""
CLOUDFLARE_PUBLIC_URL=""
```

## Scripts

- [x] `dev` – Start the server in watch mode
- [x] `db:migrate` – Run the database migrations (exact key required)

## Docker

- [ ] `Dockerfile` that builds the application image, following best practices
