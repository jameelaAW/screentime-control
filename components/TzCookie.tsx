"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Tells the server the browser's timezone so "today" means the caregiver's today. */
export function TzCookie() {
  const router = useRouter();
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return;
    const current = document.cookie.split("; ").find((c) => c.startsWith("tz="))?.slice(3);
    if (current !== encodeURIComponent(tz)) {
      document.cookie = `tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    }
  }, [router]);
  return null;
}
