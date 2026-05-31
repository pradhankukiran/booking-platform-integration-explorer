export type CapabilityLevel = "yes" | "partial" | "plan-gated" | "unknown";

export type Complexity = "low" | "medium" | "high";

export type Platform = {
  slug: string;
  name: string;
  category: "enterprise" | "agency-ready" | "operator-friendly";
  summary: string;
  bestFor: string;
  publicDocs: boolean;
  docsUrl: string;
  authModel: string;
  friction: Complexity;
  integrationEffort: string;
  backendRequired: boolean;
  confidence: "high" | "medium";
  capabilities: Record<CapabilityKey, CapabilityLevel>;
  credentials: string[];
  bookingFlows: string[];
  paymentNotes: string;
  webhookNotes: string;
  risks: string[];
  implementationChecklist: string[];
};

export type CapabilityKey =
  | "listings"
  | "availability"
  | "rates"
  | "quotes"
  | "reservations"
  | "payments"
  | "webhooks"
  | "guestData";

export const capabilityLabels: Record<CapabilityKey, string> = {
  listings: "Listings",
  availability: "Availability",
  rates: "Rates, fees, taxes",
  quotes: "Quote generation",
  reservations: "Reservation creation",
  payments: "Payment flow",
  webhooks: "Webhooks",
  guestData: "Guest data",
};

export const platforms: Platform[] = [
  {
    slug: "guesty",
    name: "Guesty",
    category: "enterprise",
    summary:
      "Strong fit for branded direct-booking flows when Booking Engine API access and payment settings are enabled.",
    bestFor:
      "Operators already using Guesty who want a headless booking widget instead of redirect links.",
    publicDocs: true,
    docsUrl: "https://booking-api-docs.guesty.com/docs",
    authModel: "Client credentials through secure backend-to-backend calls",
    friction: "medium",
    integrationEffort: "2-4 weeks for branded booking with payments",
    backendRequired: true,
    confidence: "high",
    capabilities: {
      listings: "yes",
      availability: "yes",
      rates: "yes",
      quotes: "yes",
      reservations: "yes",
      payments: "partial",
      webhooks: "yes",
      guestData: "yes",
    },
    credentials: [
      "Booking Engine API client id",
      "Booking Engine API client secret",
      "Guesty Open API credentials if admin sync is needed",
      "Payment provider settings for GuestyPay or Stripe tokenization",
    ],
    bookingFlows: [
      "Search listings",
      "Check calendar and pricing",
      "Create reservation quote",
      "Collect guest details",
      "Tokenize payment when instant booking requires card data",
      "Create reservation from quote",
    ],
    paymentNotes:
      "Payment flow depends on GuestyPay or Stripe configuration. Card data must be tokenized outside the app before reservation creation.",
    webhookNotes:
      "Use reservation and calendar webhooks from Guesty Open API when site state must react to changes after booking.",
    risks: [
      "Account configuration controls inquiry vs instant booking behavior",
      "Payment requirements vary by listing and booking engine setup",
      "Credentials must never be exposed in browser code",
    ],
    implementationChecklist: [
      "Confirm Booking Engine API is enabled",
      "Verify inquiry, instant booking, and payment settings",
      "Build serverless proxy for protected Guesty calls",
      "Implement quote-first reservation flow",
      "Add webhook listener for post-booking changes",
    ],
  },
  {
    slug: "hostaway",
    name: "Hostaway",
    category: "agency-ready",
    summary:
      "Low-friction alternative with public REST docs and broad property, calendar, reservation, and webhook coverage.",
    bestFor:
      "Agencies building reusable direct-booking integrations across multiple professional hosts.",
    publicDocs: true,
    docsUrl: "https://api.hostaway.com/documentation",
    authModel: "OAuth-style bearer token from Hostaway API credentials",
    friction: "low",
    integrationEffort: "1-3 weeks for booking-ready integration",
    backendRequired: true,
    confidence: "high",
    capabilities: {
      listings: "yes",
      availability: "yes",
      rates: "yes",
      quotes: "partial",
      reservations: "yes",
      payments: "partial",
      webhooks: "yes",
      guestData: "yes",
    },
    credentials: [
      "Hostaway account id",
      "Hostaway API key",
      "Payment processor or external checkout details if collecting card data",
    ],
    bookingFlows: [
      "Fetch listings",
      "Read availability calendar",
      "Calculate rate and fees",
      "Create reservation or inquiry",
      "Sync status through webhooks",
    ],
    paymentNotes:
      "Payment handling should be confirmed per account. Many builds pair Hostaway data with separate checkout or payment automation.",
    webhookNotes:
      "Webhook support makes it suitable for keeping a direct-booking site aligned after reservation changes.",
    risks: [
      "Quote/pricing exactness needs test bookings against account settings",
      "Payment collection may need external provider design",
      "Rate rules can vary by channel/account configuration",
    ],
    implementationChecklist: [
      "Create API credentials in Hostaway",
      "Validate listing, calendar, rate, and reservation endpoints",
      "Decide external vs platform-managed payment flow",
      "Register webhooks for reservation changes",
      "Package adapter for reuse across agency clients",
    ],
  },
  {
    slug: "hospitable",
    name: "Hospitable",
    category: "operator-friendly",
    summary:
      "Accessible developer portal and token model, strongest for automations and reservation operations around smaller portfolios.",
    bestFor:
      "Hosts who need operational automation, guest messaging context, and lighter-weight booking workflows.",
    publicDocs: true,
    docsUrl: "https://developer.hospitable.com/",
    authModel: "Personal access token or OAuth app depending on use case",
    friction: "low",
    integrationEffort: "1-2 weeks for operational integration",
    backendRequired: true,
    confidence: "high",
    capabilities: {
      listings: "yes",
      availability: "partial",
      rates: "partial",
      quotes: "unknown",
      reservations: "yes",
      payments: "unknown",
      webhooks: "yes",
      guestData: "yes",
    },
    credentials: [
      "Hospitable personal access token or OAuth app",
      "Webhook signing secret when receiving events",
    ],
    bookingFlows: [
      "Read properties",
      "Read reservations",
      "React to reservation and guest events",
      "Automate follow-up workflows",
    ],
    paymentNotes:
      "Treat payment-enabled direct booking as account-specific until confirmed in client environment.",
    webhookNotes:
      "Webhook support is useful for automation-heavy agency services.",
    risks: [
      "Not always best first pick for full headless checkout",
      "Payment and quote capabilities need account-level validation",
      "Scope may skew toward operations instead of booking engine replacement",
    ],
    implementationChecklist: [
      "Confirm required scopes",
      "Generate token or OAuth app",
      "Map reservation and property endpoints",
      "Subscribe to relevant webhooks",
      "Confirm whether direct booking checkout is in scope",
    ],
  },
  {
    slug: "smoobu",
    name: "Smoobu",
    category: "operator-friendly",
    summary:
      "Budget-friendly property management system with public API docs for smaller operators.",
    bestFor:
      "Small portfolios that need simple property, apartment, availability, and booking sync.",
    publicDocs: true,
    docsUrl:
      "https://support.smoobu.com/hc/en-us/articles/360003170740-Smoobu-API-Documentation",
    authModel: "API key from Smoobu account",
    friction: "medium",
    integrationEffort: "1-2 weeks for simple sync or inquiry flow",
    backendRequired: true,
    confidence: "medium",
    capabilities: {
      listings: "yes",
      availability: "yes",
      rates: "partial",
      quotes: "unknown",
      reservations: "yes",
      payments: "unknown",
      webhooks: "partial",
      guestData: "partial",
    },
    credentials: [
      "Smoobu API key",
      "Professional account access when required",
    ],
    bookingFlows: [
      "Read apartments",
      "Read availability",
      "Create booking or sync booking data",
      "Use external checkout if payment is required",
    ],
    paymentNotes:
      "Expect external payment design unless client account proves a supported tokenized payment path.",
    webhookNotes:
      "Webhook/event coverage should be confirmed for the specific sync needs.",
    risks: [
      "API access can be plan-gated",
      "May need external payment and quote logic",
      "Good for simple builds, weaker for advanced booking engines",
    ],
    implementationChecklist: [
      "Confirm Smoobu plan includes API key",
      "Validate apartment and availability responses",
      "Decide payment provider outside Smoobu if needed",
      "Add booking sync safeguards",
      "Document limitations for future agency clients",
    ],
  },
  {
    slug: "hostfully",
    name: "Hostfully",
    category: "agency-ready",
    summary:
      "Public API positioning for syncing property data, availability, rates, and bookings with external websites.",
    bestFor:
      "Direct-booking website agencies that need structured property content and reservation sync.",
    publicDocs: true,
    docsUrl: "https://www.hostfully.com/pmp-features/open-api/",
    authModel: "API key or partner credentials depending on account setup",
    friction: "medium",
    integrationEffort: "2-3 weeks for direct-booking flow",
    backendRequired: true,
    confidence: "medium",
    capabilities: {
      listings: "yes",
      availability: "yes",
      rates: "yes",
      quotes: "partial",
      reservations: "yes",
      payments: "partial",
      webhooks: "partial",
      guestData: "yes",
    },
    credentials: [
      "Hostfully API credentials",
      "Agency or account-level access confirmation",
      "Payment provider settings",
    ],
    bookingFlows: [
      "Sync property data",
      "Read availability and rates",
      "Create booking or lead",
      "Track reservation state",
    ],
    paymentNotes:
      "Payment collection and token flow should be confirmed before fixed pricing.",
    webhookNotes:
      "Event coverage should be verified during discovery.",
    risks: [
      "Some access may depend on account or partner status",
      "Payment and exact quote behavior need sandbox validation",
      "Docs surface may differ from enabled client account",
    ],
    implementationChecklist: [
      "Confirm API access with Hostfully account",
      "Map property, rate, and booking endpoints",
      "Test one quote/booking path",
      "Confirm webhook or polling strategy",
      "Write reusable client onboarding checklist",
    ],
  },
  {
    slug: "ownerrez",
    name: "OwnerRez",
    category: "agency-ready",
    summary:
      "Mature vacation rental operations platform with API access, useful for controlled reservation workflows.",
    bestFor:
      "Property managers that need strong operations, channel sync, and detailed reservation handling.",
    publicDocs: true,
    docsUrl: "https://www.ownerrez.com/support/articles/api-overview",
    authModel: "Personal access token or OAuth application",
    friction: "medium",
    integrationEffort: "2-4 weeks depending on booking and payment scope",
    backendRequired: true,
    confidence: "medium",
    capabilities: {
      listings: "yes",
      availability: "yes",
      rates: "partial",
      quotes: "partial",
      reservations: "yes",
      payments: "partial",
      webhooks: "yes",
      guestData: "yes",
    },
    credentials: [
      "OwnerRez API access",
      "Personal access token or OAuth app credentials",
      "Webhook subscription settings",
    ],
    bookingFlows: [
      "Read properties",
      "Read availability",
      "Create quote or booking when supported by account flow",
      "Track reservation status through webhooks",
    ],
    paymentNotes:
      "Payment support depends on OwnerRez configuration and selected payment processor.",
    webhookNotes:
      "Webhook support makes it good for syncing a website or agency dashboard after booking events.",
    risks: [
      "API changes and endpoint permissions should be reviewed before build",
      "Booking writes can require careful permission and account setup",
      "Payment processor specifics affect final architecture",
    ],
    implementationChecklist: [
      "Confirm API model: personal token or OAuth",
      "Verify write permissions for target booking flow",
      "Map quote and reservation lifecycle",
      "Register reservation webhooks",
      "Create test booking rollback plan",
    ],
  },
  {
    slug: "lodgify",
    name: "Lodgify",
    category: "operator-friendly",
    summary:
      "Website-first property management system with API access that should be validated against account tier before scoping.",
    bestFor:
      "Hosts already using Lodgify websites who need controlled add-ons or external sync.",
    publicDocs: true,
    docsUrl: "https://docs.lodgify.com/",
    authModel: "API key or OAuth-style access depending on product area",
    friction: "medium",
    integrationEffort: "1-3 weeks after endpoint validation",
    backendRequired: true,
    confidence: "medium",
    capabilities: {
      listings: "yes",
      availability: "yes",
      rates: "yes",
      quotes: "partial",
      reservations: "yes",
      payments: "partial",
      webhooks: "partial",
      guestData: "yes",
    },
    credentials: [
      "Lodgify API credentials",
      "Account tier confirmation",
      "Payment setup details",
    ],
    bookingFlows: [
      "Read properties",
      "Read rates and availability",
      "Create or sync bookings when enabled",
      "Use platform or external payment path",
    ],
    paymentNotes:
      "Payment flow needs confirmation from account docs and settings before build commitment.",
    webhookNotes:
      "Webhook/event options should be verified during discovery.",
    risks: [
      "API surface and docs access can vary by product area",
      "May be easier to extend existing Lodgify flow than replace it",
      "Payment path needs early validation",
    ],
    implementationChecklist: [
      "Confirm Lodgify API access and plan",
      "Validate property, availability, and rate endpoints",
      "Confirm booking creation endpoint behavior",
      "Choose embedded vs external payment flow",
      "Record setup for future client replication",
    ],
  },
];

export function getPlatform(slug: string) {
  return platforms.find((platform) => platform.slug === slug);
}

export function capabilityScore(platform: Platform) {
  return Object.values(platform.capabilities).reduce((score, level) => {
    if (level === "yes") return score + 3;
    if (level === "partial") return score + 2;
    if (level === "plan-gated") return score + 1;
    return score;
  }, 0);
}

export function capabilityLevelLabel(level: CapabilityLevel) {
  const labels: Record<CapabilityLevel, string> = {
    yes: "Supported",
    partial: "Partial",
    "plan-gated": "Plan-gated",
    unknown: "Verify",
  };

  return labels[level];
}
