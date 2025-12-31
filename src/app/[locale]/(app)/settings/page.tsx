import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SettingsClient } from "./settings-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("settings"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function SettingsPage() {
  return <SettingsClient />;
}
