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

- [x] FR01 – Create a link — `POST /links`
- [x] FR02 – Delete a link — `DELETE /links/:id`
- [x] FR03 – List all registered links — `GET /links`

### Access

- [x] FR04 – Get the original URL from a shortened URL — `GET /links/:shortUrl`
- [x] FR05 – Increment the access count of a link — `PATCH /links/:id/access`

### CSV Export

- [x] FR06 – Export the created links to a CSV — `POST /links/exports`

## Business Rules

- [x] BR01 – A shortened URL must be well-formed (allowed format: `^[a-z0-9-]+$`)
- [x] BR02 – A shortened URL must be unique
- [x] BR03 – Delete and increment use the same identifier (`id`), for consistency with the front-end

## Non-Functional Requirements

- [x] NFR01 – Link listing is performant (paginated, indexed on `short_url`)
- [x] NFR02 – CSV is generated via streaming, not loaded fully into memory
- [x] NFR03 – CSV is accessible through a CDN (Cloudflare R2, Amazon S3, etc.)
- [x] NFR04 – CSV file name is random and unique
- [x] NFR05 – CSV includes the original URL, short URL, access count and creation date
- [x] NFR06 – CORS is enabled

## Environment Variables

- [x] `.env.example` file with the following keys:

```env
PORT=
DATABASE_URL=

CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_ACCESS_KEY_ID=
CLOUDFLARE_SECRET_ACCESS_KEY=
CLOUDFLARE_BUCKET=
CLOUDFLARE_PUBLIC_URL=
```

## Scripts

- [x] `dev` – Start the server in watch mode
- [x] `db:migrate` – Run the database migrations (exact key required)

## Docker

- [x] `Dockerfile` that builds the application image, following best practices
