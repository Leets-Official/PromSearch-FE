import { createAnalyticsPayload, sendAnalyticsPayload } from "@/analytics/client";
import type { AnalyticsEventName, AnalyticsPayload } from "@/analytics/events";

export function track<TName extends AnalyticsEventName>(
  name: TName,
  properties: AnalyticsPayload<TName>["properties"],
) {
  sendAnalyticsPayload(createAnalyticsPayload(name, properties));
}
