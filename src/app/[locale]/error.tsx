"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorProps) {
  const t = useTranslations("Error");

  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: Error logging is intentional
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
      <AlertCircle className="size-12 text-destructive" />
      <h1 className="font-bold text-2xl">{t("title")}</h1>
      <p className="text-center text-muted-foreground">{t("description")}</p>
      <Button onClick={reset}>{t("retry")}</Button>
    </div>
  );
}
