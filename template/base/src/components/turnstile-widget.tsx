"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();

  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Failed to load Cloudflare Turnstile"));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

type TurnstileWidgetProps = {
  /** Called with the token when the widget verifies, and with "" on expiry. */
  onVerify: (token: string) => void;
  /** Overrides the NEXT_PUBLIC_TURNSTILE_SITE_KEY env var. */
  siteKey?: string;
  theme?: "auto" | "light" | "dark";
  className?: string;
};

export function TurnstileWidget({
  onVerify,
  siteKey,
  theme = "auto",
  className,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onVerifyRef = useRef(onVerify);
  const [error, setError] = useState<string | null>(null);
  const resolvedSiteKey = siteKey ?? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    if (!resolvedSiteKey) return;
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let widgetId: string | undefined;

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: resolvedSiteKey,
          theme,
          callback: (token: string) => onVerifyRef.current(token),
          "expired-callback": () => onVerifyRef.current(""),
          "error-callback": () => setError("Captcha failed to load"),
        });
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load Cloudflare Turnstile");
      });

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [resolvedSiteKey, theme]);

  if (!resolvedSiteKey) {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        Missing NEXT_PUBLIC_TURNSTILE_SITE_KEY
      </p>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        {error}
      </p>
    );
  }

  return <div ref={containerRef} className={className} />;
}
