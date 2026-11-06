# brev.ly — Web

React SPA for managing shortened URLs, built on top of the brev.ly API.

## Tech Stack

Required:

- TypeScript
- React
- Vite (no framework)

Optional:

- TailwindCSS
- React Query
- React Hook Form
- Zod

## Functional Requirements

### Links

- [x] FR01 – Create a link
- [x] FR02 – Delete a link
- [x] FR03 – List all registered links

### Access

- [x] FR04 – Get the original URL from a shortened URL
- [x] FR05 – Increment the access count of a link

### CSV Export

- [x] FR06 – Download a CSV report of the created links

## Business Rules

- [x] BR01 – A shortened URL must be well-formed
- [x] BR02 – A shortened URL must be unique

## Non-Functional Requirements

- [x] NFR01 – React SPA bundled with Vite
- [ ] NFR02 – Follows the Figma layout as closely as possible
- [ ] NFR03 – Good UX: empty state, loading indicators, actions blocked depending on the app state
- [ ] NFR04 – Responsive: works well on desktop and mobile

## Pages

- [x] `/` – Create link form and the list of registered links
- [x] `/:shortUrl` – Looks up the shortened URL in the API and redirects to the original URL
- [ ] Not found – Shown for any other route, or when the shortened URL doesn't exist

## Environment Variables

- [x] `.env.example` file with the following keys:

```env
VITE_FRONTEND_URL=
VITE_BACKEND_URL=
```

## Scripts

- [x] `dev` – Start the app in development mode
- [x] `build` – Type-check and build the app for production
