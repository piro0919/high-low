"use client";

import { format, setHours, setMinutes } from "date-fns";
import { enUS, ja } from "date-fns/locale";
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

// UTCスロットをローカル時間のラベルに変換
function getLocalTimeLabel(utcSlot: UtcSlot, locale: string): string {
  const offset = new Date().getTimezoneOffset();
  const offsetHours = -offset / 60;

  const utcHour = Number.parseInt(utcSlot.split(":")[0] ?? "0", 10);
  const localHour = (utcHour + offsetHours + 24) % 24;

  // 今日の日付でローカル時間を作成
  const date = setMinutes(setHours(new Date(), localHour), 0);
  const dateLocale = locale === "ja" ? ja : enUS;

  // 「21:00頃」のようなフォーマット
  const timeStr = format(date, "H:mm", { locale: dateLocale });
  return locale === "ja" ? `${timeStr}頃` : `Around ${timeStr}`;
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

  // 現在のendpointを保持
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);

  // Service Workerが準備できているか
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);

  // サブスクリプション状態を取得する関数
  const fetchSubscriptionState = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setIsServiceWorkerReady(false);
        return;
      }

      // active, waiting, installing のいずれかがあればOK
      const worker =
        registration.active || registration.waiting || registration.installing;
      if (!worker) {
        setIsServiceWorkerReady(false);
        return;
      }

      setIsServiceWorkerReady(true);

      // pushManagerはactiveなワーカーが必要
      if (!registration.active) {
        return;
      }

      const pushSubscription = await registration.pushManager.getSubscription();
      const endpoint = pushSubscription?.endpoint;

      if (endpoint) {
        setCurrentEndpoint(endpoint);

        const response = await fetch(
          `/api/push/subscription?endpoint=${encodeURIComponent(endpoint)}`,
        );
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
      }
    } catch {
      // エラーは無視
    }
  }, []);

  // 初期化
  useEffect(() => {
    // ブラウザサポートチェック
    if (!("serviceWorker" in navigator && "PushManager" in window)) {
      setIsSupported(false);
      setIsLoading(false);
      return;
    }

    setIsSupported(true);
    setPermission(Notification.permission);

    // 初回チェック
    fetchSubscriptionState().then(() => setIsLoading(false));

    // Service Workerがアクティブになった時に再チェック
    const handleControllerChange = () => {
      fetchSubscriptionState();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, [fetchSubscriptionState]);

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

      // endpointを保存
      setCurrentEndpoint(pushSubscription.endpoint);
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
      // ブラウザの購読を取得してendpointを確認
      const registration = await navigator.serviceWorker.ready;
      const pushSubscription = await registration.pushManager.getSubscription();
      const endpoint = pushSubscription?.endpoint || currentEndpoint;

      if (!endpoint) {
        throw new Error("No endpoint found");
      }

      const response = await fetch("/api/push/subscription", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete subscription");
      }

      // ブラウザの購読も解除
      if (pushSubscription) {
        await pushSubscription.unsubscribe();
      }

      setCurrentEndpoint(null);
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
  }, [currentEndpoint, t]);

  // 時間帯を変更
  const handleSlotChange = useCallback(
    async (utcSlot: UtcSlot) => {
      if (!subscription) {
        return;
      }
      if (!currentEndpoint) {
        return;
      }

      setIsSaving(true);

      try {
        const response = await fetch("/api/push/subscription", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: currentEndpoint, utcSlot }),
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
    [subscription, currentEndpoint, t],
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

  // オフからオンにするにはService Workerが必要
  const isCurrentlyEnabled = subscription?.enabled ?? false;
  const canEnableToggle = isServiceWorkerReady || isCurrentlyEnabled;
  const isToggleDisabled = isSaving || !canEnableToggle;

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
            disabled={isToggleDisabled}
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
                  {getLocalTimeLabel("00:00", locale)}
                </SelectItem>
                <SelectItem value="06:00">
                  {getLocalTimeLabel("06:00", locale)}
                </SelectItem>
                <SelectItem value="12:00">
                  {getLocalTimeLabel("12:00", locale)}
                </SelectItem>
                <SelectItem value="18:00">
                  {getLocalTimeLabel("18:00", locale)}
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
