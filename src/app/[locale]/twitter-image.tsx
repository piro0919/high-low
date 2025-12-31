import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "High or Low - Mood Tracker";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const title = "High or Low";
  const description =
    locale === "ja"
      ? "毎日のエネルギーレベルを記録するムードトラッカー"
      : "Track your daily energy levels";

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Icon */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 120,
          height: 120,
          background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
          borderRadius: 24,
          marginBottom: 40,
        }}
      >
        <svg
          width="70"
          height="70"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          <path d="M5 3v4" />
          <path d="M19 17v4" />
          <path d="M3 5h4" />
          <path d="M17 19h4" />
        </svg>
      </div>

      {/* Title */}
      <div
        style={{
          display: "flex",
          fontSize: 72,
          fontWeight: 700,
          color: "white",
          marginBottom: 16,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </div>

      {/* Description */}
      <div
        style={{
          display: "flex",
          fontSize: 32,
          color: "rgba(255, 255, 255, 0.8)",
          textAlign: "center",
          maxWidth: 800,
        }}
      >
        {description}
      </div>

      {/* Level indicators */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 60,
        }}
      >
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              background: `rgba(255, 255, 255, ${0.1 + level * 0.15})`,
              borderRadius: 28,
              fontSize: 24,
              fontWeight: 600,
              color: "white",
            }}
          >
            {level}
          </div>
        ))}
      </div>
    </div>,
    {
      ...size,
    },
  );
}
