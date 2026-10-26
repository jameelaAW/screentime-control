import type { MetadataRoute } from "next";

// Makes the site installable ("Add to Home Screen") on phones and desktops.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Screen Time Control",
    short_name: "Screen Time",
    description: "Log screen sessions and keep each child's daily limit in view.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f7f4",
    theme_color: "#267265",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512?maskable=1", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
