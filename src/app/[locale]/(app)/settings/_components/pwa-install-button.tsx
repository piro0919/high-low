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
  const { canInstall, install, isInstalled, isSupported } = usePwa();

  // PWA非対応環境、または既にインストール済みの場合は非表示
  if (!isSupported || isInstalled) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tPwa("installApp")}</CardTitle>
        <CardDescription>{tPwa("installDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={install} disabled={!canInstall} className="w-full">
          <Download className="mr-2 size-4" />
          {tPwa("installApp")}
        </Button>
      </CardContent>
    </Card>
  );
}
