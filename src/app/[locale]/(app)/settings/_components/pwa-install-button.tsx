"use client";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import usePwa from "use-pwa";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

declare global {
  interface Window {
    __pwaInstallPromptEvent: BeforeInstallPromptEvent | null;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallButton() {
  const tPwa = useTranslations("PWA");
  const {
    appinstalled,
    canInstallprompt,
    enabledPwa,
    isPwa,
    showInstallPrompt,
  } = usePwa();

  const [hasCapturedEvent, setHasCapturedEvent] = useState(false);

  useEffect(() => {
    // グローバルにキャプチャされたイベントがあるかチェック
    if (window.__pwaInstallPromptEvent) {
      setHasCapturedEvent(true);
    }
  }, []);

  const handleInstall = useCallback(async () => {
    // use-pwaのcanInstallpromptがtrueならそちらを使用
    if (canInstallprompt) {
      showInstallPrompt();
      return;
    }

    // フォールバック: グローバルにキャプチャされたイベントを使用
    const event = window.__pwaInstallPromptEvent;
    if (event) {
      await event.prompt();
      const result = await event.userChoice;
      if (result.outcome === "accepted") {
        window.__pwaInstallPromptEvent = null;
        setHasCapturedEvent(false);
      }
    }
  }, [canInstallprompt, showInstallPrompt]);

  // PWA非対応環境、または既にPWAとして実行中の場合は非表示
  if (!enabledPwa || isPwa) {
    return null;
  }

  const canInstall = canInstallprompt || hasCapturedEvent;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tPwa("installApp")}</CardTitle>
        <CardDescription>{tPwa("installDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleInstall}
          disabled={!canInstall || appinstalled}
          className="w-full"
        >
          <Download className="mr-2 size-4" />
          {tPwa("installApp")}
        </Button>
      </CardContent>
    </Card>
  );
}
