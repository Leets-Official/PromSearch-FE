import type { AnalyticsAppEnv, AnalyticsEventName, AnalyticsPayload } from "@/analytics/events";

const ANONYMOUS_ID_KEY = "promsearch.anonymous_id";
const SESSION_ID_KEY = "promsearch.session_id";

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

function getStorageValue(key: string, prefix: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(key);

    if (storedValue) {
      return storedValue;
    }

    const nextValue = createId(prefix);
    window.localStorage.setItem(key, nextValue);

    return nextValue;
  } catch {
    return null;
  }
}

export function getAnalyticsAppEnv(): AnalyticsAppEnv {
  const configuredEnv = process.env.NEXT_PUBLIC_APP_ENV;

  if (configuredEnv === "local" || configuredEnv === "dev" || configuredEnv === "prod") {
    return configuredEnv;
  }

  return process.env.NODE_ENV === "production" ? "prod" : "local";
}

export function createAnalyticsPayload<TName extends AnalyticsEventName>(
  name: TName,
  properties: AnalyticsPayload<TName>["properties"],
): AnalyticsPayload<TName> {
  return {
    name,
    properties,
    context: {
      anonymous_id: getStorageValue(ANONYMOUS_ID_KEY, "anon"),
      app_env: getAnalyticsAppEnv(),
      page_url: typeof window === "undefined" ? null : window.location.href,
      referrer: typeof document === "undefined" ? null : document.referrer || null,
      session_id: getStorageValue(SESSION_ID_KEY, "sess"),
      timestamp: new Date().toISOString(),
    },
  };
}

export function sendAnalyticsPayload(payload: AnalyticsPayload) {
  const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
  const isDisabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "false";

  if (isDisabled || payload.context.app_env === "local") {
    console.info("[analytics]", payload);
    return;
  }

  if (!endpoint) {
    if (payload.context.app_env === "dev") {
      console.info("[analytics]", payload);
    }

    return;
  }

  void fetch(endpoint, {
    body: JSON.stringify(payload),
    headers: { "content-type": "application/json" },
    keepalive: true,
    method: "POST",
  }).catch((error: unknown) => {
    if (payload.context.app_env !== "prod") {
      console.warn("[analytics] failed to send event", error);
    }
  });
}
