"use client";

import { Bell, BellOff } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type UtcSlot = "00:00" | "06:00" | "12:00" | "18:00";

interface SubscriptionState {
  enabled: boolean;
  utcSlot: UtcSlot;
}

// ローカル時間帯からUTCスロットを計算
function getDefaultUtcSlot(): UtcSlot {
  const offset = new Date().getTimezoneOffset(); // 分単位（日本は-540）
  const offsetHours = -offset / 60;

  // ローカル21時をUTCに変換
  const localEvening = 21;
  const utcHour = (localEvening - offsetHours + 24) % 24;

  // 最も近いスロットを選択
  if (utcHour < 3 || utcHour >= 21) {
    return "00:00";
  }
  if (utcHour < 9) {
    return "06:00";
  }
  if (utcHour < 15) {
    return "12:00";
  }
  return "18:00";
}

// UTCスロットをローカル時間帯の説明に変換
function getLocalTimeLabel(
  utcSlot: UtcSlot,
  t: (key: string) => string,
): string {
  const offset = new Date().getTimezoneOffset();
  const offsetHours = -offset / 60;

  const utcHour = Number.parseInt(utcSlot.split(":")[0] ?? "0", 10);
  const localHour = (utcHour + offsetHours + 24) % 24;

  if (localHour >= 5 && localHour < 11) {
    return t("timeMorning");
  }
  if (localHour >= 11 && localHour < 15) {
    return t("timeNoon");
  }
  if (localHour >= 15 && localHour < 19) {
    return t("timeEvening");
  }
  return t("timeNight");
}

export function NotificationSettings() {
  const t = useTranslations("Notifications");
  const locale = useLocale();

  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [subscription, setSubscription] = useState<SubscriptionState | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 初期化
  useEffect(() => {
    const init = async () => {
      // ブラウザサポートチェック
      if (!("serviceWorker" in navigator && "PushManager" in window)) {
        setIsSupported(false);
        setIsLoading(false);
        return;
      }

      setIsSupported(true);
      setPermission(Notification.permission);

      // 既存のサブスクリプションを取得
      try {
        const response = await fetch("/api/push/subscription");
        if (response.ok) {
          const data = (await response.json()) as {
            subscription?: { enabled: boolean; utcSlot: UtcSlot };
          };
          if (data.subscription) {
            setSubscription({
              enabled: data.subscription.enabled,
              utcSlot: data.subscription.utcSlot,
            });
          }
        }
      } catch {
        // エラーは無視
      }

      setIsLoading(false);
    };

    init();
  }, []);

  // 通知許可をリクエスト
  const requestPermission = useCallback(async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  // 購読を有効化
  const enableNotifications = useCallback(async () => {
    setIsSaving(true);

    try {
      // 通知許可を確認
      let currentPermission = permission;
      if (currentPermission === "default") {
        currentPermission = await requestPermission();
      }

      if (currentPermission !== "granted") {
        toast.error(t("permissionDenied"), {
          description: t("permissionDeniedDescription"),
        });
        return;
      }

      // Service Workerを取得
      const registration = await navigator.serviceWorker.ready;

      // Push購読を作成
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error("VAPID public key not configured");
      }

      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const utcSlot = subscription?.utcSlot || getDefaultUtcSlot();

      // サーバーに保存
      const response = await fetch("/api/push/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: pushSubscription.toJSON(),
          utcSlot,
          locale,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save subscription");
      }

      setSubscription({ enabled: true, utcSlot });
      toast.success(t("enabled"), {
        description: t("enabledDescription"),
      });
    } catch {
      toast.error(t("error"), {
        description: t("errorDescription"),
      });
    } finally {
      setIsSaving(false);
    }
  }, [permission, requestPermission, subscription?.utcSlot, locale, t]);

  // 購読を無効化
  const disableNotifications = useCallback(async () => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/push/subscription", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete subscription");
      }

      // ブラウザの購読も解除
      const registration = await navigator.serviceWorker.ready;
      const pushSubscription = await registration.pushManager.getSubscription();
      if (pushSubscription) {
        await pushSubscription.unsubscribe();
      }

      setSubscription(null);
      toast.success(t("disabled"), {
        description: t("disabledDescription"),
      });
    } catch {
      toast.error(t("error"), {
        description: t("errorDescription"),
      });
    } finally {
      setIsSaving(false);
    }
  }, [t]);

  // 時間帯を変更
  const handleSlotChange = useCallback(
    async (utcSlot: UtcSlot) => {
      if (!subscription) {
        return;
      }

      setIsSaving(true);

      try {
        const response = await fetch("/api/push/subscription", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ utcSlot }),
        });

        if (!response.ok) {
          throw new Error("Failed to update subscription");
        }

        setSubscription({ ...subscription, utcSlot });
        toast.success(t("updated"), {
          description: t("updatedDescription"),
        });
      } catch {
        toast.error(t("error"), {
          description: t("errorDescription"),
        });
      } finally {
        setIsSaving(false);
      }
    },
    [subscription, t],
  );

  // 非対応環境
  if (!isSupported) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-10 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {subscription?.enabled ? (
              <Bell className="size-4" />
            ) : (
              <BellOff className="size-4 text-muted-foreground" />
            )}
            <span>{t("dailyReminder")}</span>
          </div>
          <Switch
            checked={subscription?.enabled ?? false}
            onCheckedChange={(checked) => {
              if (checked) {
                enableNotifications();
              } else {
                disableNotifications();
              }
            }}
            disabled={isSaving}
          />
        </div>

        {subscription?.enabled && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">
              {t("notificationTime")}
            </p>
            <Select
              value={subscription.utcSlot}
              onValueChange={(value) => handleSlotChange(value as UtcSlot)}
              disabled={isSaving}
            >
              <SelectTrigger aria-label={t("notificationTime")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="00:00">
                  {getLocalTimeLabel("00:00", t)}
                </SelectItem>
                <SelectItem value="06:00">
                  {getLocalTimeLabel("06:00", t)}
                </SelectItem>
                <SelectItem value="12:00">
                  {getLocalTimeLabel("12:00", t)}
                </SelectItem>
                <SelectItem value="18:00">
                  {getLocalTimeLabel("18:00", t)}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {permission === "denied" && (
          <p className="text-destructive text-sm">{t("permissionBlocked")}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Base64をUint8Arrayに変換
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
