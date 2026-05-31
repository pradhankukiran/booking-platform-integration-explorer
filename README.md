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

## Positioning

Use this as a client-facing discovery tool:

- Compare Guesty, Hostaway, Hospitable, Smoobu, Hostfully, OwnerRez, and Lodgify.
- Select a booking flow: request to book, instant booking, or payment-enabled checkout.
- Generate a readiness report with required access, implementation checklist, and risks.
- Explain why secure backend integration is required before API keys are shared.

## Data Caveat

Capability data is based on public API documentation and conservative
implementation assumptions. Final feasibility requires account access, enabled
API permissions, payment settings, and sandbox testing.
