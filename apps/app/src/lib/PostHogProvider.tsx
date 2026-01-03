import { PostHogProvider as ReactPostHogProvider } from "@posthog/react";
import posthog from "posthog-js";
import type { PropsWithChildren } from "react";

export function PostHogProvider({ children }: PropsWithChildren) {
  if (import.meta.env.MODE !== "production") return children;

  posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
    defaults: "2025-11-30",
    person_profiles: "always",
  });

  return (
    <ReactPostHogProvider client={posthog}>{children}</ReactPostHogProvider>
  );
}
