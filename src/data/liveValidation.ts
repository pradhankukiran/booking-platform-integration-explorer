export type CredentialField = {
  key: string;
  label: string;
  type?: "text" | "password" | "select";
  placeholder?: string;
  help?: string;
  options?: Array<{ label: string; value: string }>;
};

export type LiveCheckStatus = "pass" | "warn" | "fail";

export type LiveCheckResult = {
  label: string;
  status: LiveCheckStatus;
  statusCode?: number;
  message: string;
  endpoint?: string;
  count?: number;
};

export type LiveValidationResponse = {
  platformSlug: string;
  checkedAt: string;
  status: LiveCheckStatus;
  summary: string;
  results: LiveCheckResult[];
};

export const liveCredentialFields: Record<string, CredentialField[]> = {
  guesty: [
    {
      key: "clientId",
      label: "Client ID",
      placeholder: "Guesty Booking Engine client ID",
    },
    {
      key: "clientSecret",
      label: "Client Secret",
      placeholder: "Guesty Booking Engine client secret",
      type: "password",
    },
  ],
  hostaway: [
    {
      key: "accountId",
      label: "Account ID",
      placeholder: "Hostaway account ID",
    },
    {
      key: "clientSecret",
      label: "Client Secret",
      placeholder: "Hostaway API secret",
      type: "password",
    },
  ],
  hospitable: [
    {
      key: "accessToken",
      label: "Personal Access Token",
      placeholder: "Hospitable PAT",
      type: "password",
    },
  ],
  smoobu: [
    {
      key: "apiKey",
      label: "API Key",
      placeholder: "Smoobu API key",
      type: "password",
      help: "Uses legacy Api-Key auth for now. Smoobu HMAC auth should replace this before September 25, 2026.",
    },
  ],
  hostfully: [
    {
      key: "apiKey",
      label: "API Key",
      placeholder: "Hostfully API key",
      type: "password",
    },
    {
      key: "environment",
      label: "Environment",
      type: "select",
      options: [
        { label: "Sandbox", value: "sandbox" },
        { label: "Production", value: "production" },
      ],
    },
    {
      key: "baseUrl",
      label: "Base URL override",
      placeholder: "Optional, ex: https://sandbox-api.hostfully.com/v3",
      help: "Leave blank unless Hostfully gives a different tenant/API base URL.",
    },
  ],
  ownerrez: [
    {
      key: "username",
      label: "Account email",
      placeholder: "OwnerRez account email",
    },
    {
      key: "personalAccessToken",
      label: "Personal Access Token",
      placeholder: "OwnerRez PAT",
      type: "password",
    },
    {
      key: "userAgent",
      label: "User-Agent",
      placeholder: "Booking Platform Integration Explorer",
      help: "OwnerRez asks integrations to identify themselves with User-Agent.",
    },
  ],
  lodgify: [
    {
      key: "apiKey",
      label: "API Key",
      placeholder: "Lodgify Public API key",
      type: "password",
    },
  ],
};

export function credentialDefaults(slug: string) {
  return Object.fromEntries(
    (liveCredentialFields[slug] ?? []).map((field) => [
      field.key,
      field.options?.[0]?.value ?? "",
    ]),
  ) as Record<string, string>;
}
