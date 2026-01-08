import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

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

  const logoData = await readFile(join(process.cwd(), "public/logo.png"));
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

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
        background: "#fff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Logo */}
      <img
        src={logoBase64}
        width={160}
        height={160}
        alt=""
        style={{
          borderRadius: 32,
          marginBottom: 40,
        }}
      />

      {/* Title */}
      <div
        style={{
          display: "flex",
          fontSize: 72,
          fontWeight: 700,
          color: "#1e1b4b",
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
          color: "#6b7280",
          textAlign: "center",
          maxWidth: 800,
        }}
      >
        {description}
      </div>
    </div>,
    {
      ...size,
    },
  );
}
