export const DEVICES = ["tv", "tablet", "phone", "computer", "game-console"] as const;
export const ACTIVITIES = ["video", "game", "educational", "social", "browsing"] as const;

export type Device = (typeof DEVICES)[number];
export type Activity = (typeof ACTIVITIES)[number];

export const DEVICE_LABELS: Record<Device, string> = {
  tv: "TV",
  tablet: "Tablet",
  phone: "Phone",
  computer: "Computer",
  "game-console": "Game console",
};

export const ACTIVITY_LABELS: Record<Activity, string> = {
  video: "Video",
  game: "Game",
  educational: "Educational",
  social: "Social",
  browsing: "Browsing",
};

export const MAX_SESSION_MINUTES = 24 * 60;
export const MAX_LIMIT_MINUTES = 24 * 60;

export function label<T extends string>(map: Record<T, string>, key: string | null) {
  if (!key) return "—";
  return (map as Record<string, string>)[key] ?? key;
}
