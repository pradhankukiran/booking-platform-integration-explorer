import { NextResponse } from "next/server";
import {
  liveCredentialFields,
  type LiveCheckResult,
  type LiveCheckStatus,
  type LiveValidationResponse,
} from "@/data/liveValidation";

type Credentials = Record<string, string>;

type Adapter = {
  label: string;
  validate: (credentials: Credentials) => Promise<LiveCheckResult[]>;
};

type RequestBody = {
  platformSlug?: string;
  credentials?: Credentials;
};

const jsonHeaders = {
  accept: "application/json",
};

function required(credentials: Credentials, keys: string[]) {
  const missing = keys.filter((key) => !credentials[key]?.trim());

  if (missing.length > 0) {
    return [
      {
        label: "Credentials",
        status: "fail" as const,
        message: `Missing required field: ${missing.join(", ")}`,
      },
    ];
  }

  return null;
}

function overallStatus(results: LiveCheckResult[]): LiveCheckStatus {
  if (results.some((result) => result.status === "fail")) return "fail";
  if (results.some((result) => result.status === "warn")) return "warn";
  return "pass";
}

function summarize(status: LiveCheckStatus) {
  if (status === "pass") return "Live API check passed.";
  if (status === "warn") return "Live API check completed with warnings.";
  return "Live API check failed.";
}

function countRecords(payload: unknown): number | undefined {
  if (Array.isArray(payload)) return payload.length;

  if (payload && typeof payload === "object") {
    const object = payload as Record<string, unknown>;
    for (const key of ["result", "results", "data", "items", "properties", "listings"]) {
      if (Array.isArray(object[key])) return object[key].length;
    }
  }

  return undefined;
}

function errorSnippet(payload: unknown) {
  if (!payload) return "No response body.";
  if (typeof payload === "string") return payload.slice(0, 180);
  return JSON.stringify(payload).slice(0, 220);
}

async function readPayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  return response.text().catch(() => null);
}

async function probe(
  label: string,
  endpoint: string,
  init: RequestInit,
  successMessage: string,
): Promise<LiveCheckResult> {
  try {
    const controller = new AbortController();
    const timeout = windowlessTimeout(() => controller.abort(), 10000);
    const response = await fetch(endpoint, {
      ...init,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const payload = await readPayload(response);

    if (response.ok) {
      return {
        label,
        status: "pass",
        statusCode: response.status,
        message: successMessage,
        endpoint,
        count: countRecords(payload),
      };
    }

    return {
      label,
      status: response.status === 401 || response.status === 403 ? "fail" : "warn",
      statusCode: response.status,
      message: errorSnippet(payload),
      endpoint,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown network or adapter error.";

    return {
      label,
      status: "fail",
      message,
      endpoint,
    };
  }
}

function windowlessTimeout(callback: () => void, delay: number) {
  return setTimeout(callback, delay);
}

async function tokenFromForm(endpoint: string, form: URLSearchParams) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      ...jsonHeaders,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form,
  });
  const payload = await readPayload(response);

  if (!response.ok) {
    return {
      token: null,
      result: {
        label: "Token exchange",
        status: "fail" as const,
        statusCode: response.status,
        message: errorSnippet(payload),
        endpoint,
      },
    };
  }

  const token =
    payload && typeof payload === "object"
      ? ((payload as Record<string, unknown>).access_token as string | undefined)
      : undefined;

  return {
    token: token ?? null,
    result: {
      label: "Token exchange",
      status: token ? ("pass" as const) : ("fail" as const),
      statusCode: response.status,
      message: token ? "Access token issued." : "Token response missing access_token.",
      endpoint,
    },
  };
}

const adapters: Record<string, Adapter> = {
  guesty: {
    label: "Guesty",
    async validate(credentials) {
      const missing = required(credentials, ["clientId", "clientSecret"]);
      if (missing) return missing;

      const tokenResponse = await tokenFromForm(
        "https://booking.guesty.com/oauth2/token",
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
        }),
      );

      if (!tokenResponse.token) return [tokenResponse.result];

      const listings = await probe(
        "Listings probe",
        "https://booking.guesty.com/api/listings?limit=1",
        {
          headers: {
            ...jsonHeaders,
            authorization: `Bearer ${tokenResponse.token}`,
          },
        },
        "Authenticated listings endpoint reachable.",
      );

      return [tokenResponse.result, listings];
    },
  },
  hostaway: {
    label: "Hostaway",
    async validate(credentials) {
      const missing = required(credentials, ["accountId", "clientSecret"]);
      if (missing) return missing;

      const tokenResponse = await tokenFromForm(
        "https://api.hostaway.com/v1/accessTokens",
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: credentials.accountId,
          client_secret: credentials.clientSecret,
          scope: "general",
        }),
      );

      if (!tokenResponse.token) return [tokenResponse.result];

      const listings = await probe(
        "Listings probe",
        "https://api.hostaway.com/v1/listings?limit=1",
        {
          headers: {
            ...jsonHeaders,
            authorization: `Bearer ${tokenResponse.token}`,
          },
        },
        "Authenticated listings endpoint reachable.",
      );

      return [tokenResponse.result, listings];
    },
  },
  hospitable: {
    label: "Hospitable",
    async validate(credentials) {
      const missing = required(credentials, ["accessToken"]);
      if (missing) return missing;

      return [
        await probe(
          "Properties probe",
          "https://public.api.hospitable.com/v2/properties?per_page=1",
          {
            headers: {
              ...jsonHeaders,
              authorization: `Bearer ${credentials.accessToken}`,
            },
          },
          "Authenticated properties endpoint reachable.",
        ),
      ];
    },
  },
  smoobu: {
    label: "Smoobu",
    async validate(credentials) {
      const missing = required(credentials, ["apiKey"]);
      if (missing) return missing;

      return [
        await probe(
          "Apartments probe",
          "https://login.smoobu.com/api/apartments",
          {
            headers: {
              ...jsonHeaders,
              "Api-Key": credentials.apiKey,
            },
          },
          "Authenticated apartments endpoint reachable.",
        ),
        {
          label: "Auth migration",
          status: "warn",
          message:
            "Legacy Api-Key auth should be replaced with Smoobu HMAC auth before September 25, 2026.",
        },
      ];
    },
  },
  hostfully: {
    label: "Hostfully",
    async validate(credentials) {
      const missing = required(credentials, ["apiKey"]);
      if (missing) return missing;

      const baseUrl =
        credentials.baseUrl?.trim() ||
        (credentials.environment === "production"
          ? "https://api.hostfully.com/v3"
          : "https://sandbox-api.hostfully.com/v3");

      return [
        await probe(
          "Properties probe",
          `${baseUrl.replace(/\/$/, "")}/properties?limit=1`,
          {
            headers: {
              ...jsonHeaders,
              "X-HOSTFULLY-APIKEY": credentials.apiKey,
            },
          },
          "Authenticated properties endpoint reachable.",
        ),
      ];
    },
  },
  ownerrez: {
    label: "OwnerRez",
    async validate(credentials) {
      const missing = required(credentials, ["username", "personalAccessToken"]);
      if (missing) return missing;

      const auth = Buffer.from(
        `${credentials.username}:${credentials.personalAccessToken}`,
      ).toString("base64");

      return [
        await probe(
          "Properties probe",
          "https://app.ownerrez.com/api/properties",
          {
            headers: {
              ...jsonHeaders,
              authorization: `Basic ${auth}`,
              "user-agent":
                credentials.userAgent || "Booking Platform Integration Explorer",
            },
          },
          "Authenticated properties endpoint reachable.",
        ),
      ];
    },
  },
  lodgify: {
    label: "Lodgify",
    async validate(credentials) {
      const missing = required(credentials, ["apiKey"]);
      if (missing) return missing;

      return [
        await probe(
          "Properties probe",
          "https://api.lodgify.com/v2/properties?limit=1",
          {
            headers: {
              ...jsonHeaders,
              "X-ApiKey": credentials.apiKey,
            },
          },
          "Authenticated properties endpoint reachable.",
        ),
      ];
    },
  },
};

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const platformSlug = body.platformSlug ?? "";
  const adapter = adapters[platformSlug];

  if (!adapter || !liveCredentialFields[platformSlug]) {
    return NextResponse.json(
      { message: "Unsupported platform for live validation." },
      { status: 400 },
    );
  }

  const credentials = body.credentials ?? {};
  const allowedKeys = new Set(liveCredentialFields[platformSlug].map((field) => field.key));
  const filteredCredentials = Object.fromEntries(
    Object.entries(credentials).filter(([key]) => allowedKeys.has(key)),
  );

  const results = await adapter.validate(filteredCredentials);
  const status = overallStatus(results);
  const response: LiveValidationResponse = {
    platformSlug,
    checkedAt: new Date().toISOString(),
    status,
    summary: summarize(status),
    results,
  };

  return NextResponse.json(response);
}
