"use client";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import usePwa from "use-pwa";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PwaInstallButton() {
  const tPwa = useTranslations("PWA");
  const {
    appinstalled,
    canInstallprompt,
    enabledPwa,
    isPwa,
    showInstallPrompt,
  } = usePwa();

  // PWA非対応環境、または既にPWAとして実行中の場合は非表示
  if (!enabledPwa || isPwa) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tPwa("installApp")}</CardTitle>
        <CardDescription>{tPwa("installDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={showInstallPrompt}
          disabled={!canInstallprompt || appinstalled}
          className="w-full"
        >
          <Download className="mr-2 size-4" />
          {tPwa("installApp")}
        </Button>
      </CardContent>
    </Card>
  );
}
