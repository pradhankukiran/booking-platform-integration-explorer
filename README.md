# Booking Platform Integration Explorer

Short-Term Rental API Capability Mapper for direct-booking websites.

This app helps an agency compare property management systems before client
credentials are available. It uses curated public documentation data to map
listing sync, availability, rates, quote generation, reservation creation,
payments, webhooks, guest data, implementation friction, and risk.

## Stack

- Next.js App Router
- TypeScript
- USWDS styling
- Vercel-ready static deployment
- Static capability data in `src/data/platforms.ts`
- Server-side live validation route in `src/app/api/live-validation/route.ts`

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run build
```

## Deployment

Deploy to Vercel as a standard Next.js project. No environment variables are
required for the current static demo.

Future live adapters should use Vercel environment variables and server-side
route handlers so platform API credentials never reach browser JavaScript.

## Live Validation

The app includes read-only live probes for all mapped platforms:

- Guesty: token exchange + listings probe
- Hostaway: token exchange + listings probe
- Hospitable: properties probe
- Smoobu: apartments probe using legacy `Api-Key` auth
- Hostfully: properties probe with sandbox/production base URL
- OwnerRez: properties probe using account email + personal access token
- Lodgify: properties probe using `X-ApiKey`

Credentials are submitted to a server-side route for the current request and are
not stored by the app. Production deployments should run behind HTTPS and can be
changed to use Vercel environment variables if credentials should never be typed
into the browser.

Some platforms gate endpoints by plan, partner status, tenant base URL, or
enabled scopes. A failed live probe can mean bad credentials, missing plan access,
wrong environment, or an endpoint that differs for that account.

## Positioning

Use this as a client-facing discovery tool:

- Compare Guesty, Hostaway, Hospitable, Smoobu, Hostfully, OwnerRez, and Lodgify.
- Select a booking flow: request to book, instant booking, or payment-enabled checkout.
- Generate a readiness report with required access, implementation checklist, and risks.
- Run live read-only probes once API credentials are available.
- Explain why secure backend integration is required before booking/payment APIs are used.

## Data Caveat

Capability data is based on public API documentation and conservative
implementation assumptions. Final feasibility requires account access, enabled
API permissions, payment settings, and sandbox testing.
