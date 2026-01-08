"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

const PWAPrompt = dynamic(() => import("react-ios-pwa-prompt"), {
  ssr: false,
});

export function PwaPrompt() {
  const t = useTranslations("PWA");

  return (
    <PWAPrompt
      appIconPath="/api/apple-icon"
      copyTitle={t("copyTitle")}
      copyDescription={t("copyDescription")}
      copyShareStep={t("copyShareStep")}
      copyAddToHomeScreenStep={t("copyAddToHomeScreenStep")}
      promptOnVisit={1}
      timesToShow={3}
    />
  );
}
