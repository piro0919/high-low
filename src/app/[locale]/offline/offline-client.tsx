"use client";

import { RefreshCw, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function OfflineClient() {
  const t = useTranslations("Offline");

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
        <WifiOff className="size-8 text-muted-foreground" />
      </div>
      <h1 className="mt-6 font-semibold text-2xl">{t("title")}</h1>
      <p className="mt-2 text-center text-muted-foreground">
        {t("description")}
      </p>
      <Button onClick={handleRetry} className="mt-6">
        <RefreshCw className="mr-2 size-4" />
        {t("retry")}
      </Button>
    </div>
  );
}
