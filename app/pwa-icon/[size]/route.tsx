import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

const SIZES = new Set([180, 192, 512]);

// App icon drawn at request time so no binary assets need to live in the repo.
// The clock is vector shapes rather than a font glyph, which the image renderer may not have.
export async function GET(request: NextRequest, { params }: { params: Promise<{ size: string }> }) {
  const size = Number((await params).size);
  if (!SIZES.has(size)) return new Response("Not found", { status: 404 });
  // Maskable icons need a full-bleed background and the artwork inside the central safe zone.
  const maskable = request.nextUrl.searchParams.get("maskable") === "1";
  const art = size * (maskable ? 0.5 : 0.62);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#267265",
          borderRadius: maskable ? 0 : size * 0.22,
        }}
      >
        <svg width={art} height={art} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff" strokeWidth="9" />
          <path d="M50 26 V50 L68 61" fill="none" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    { width: size, height: size, headers: { "Cache-Control": "public, max-age=86400" } },
  );
}
