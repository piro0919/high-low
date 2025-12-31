import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import webpush from "web-push";
import { env } from "@/env";

// Vercel Cronからのリクエストを検証
const CRON_SECRET = process.env.CRON_SECRET;

// 通知メッセージ
const messages = {
  en: {
    title: "High or Low",
    body: "How's your energy today? Take a moment to record it.",
  },
  ja: {
    title: "High or Low",
    body: "今日のエネルギーはどうですか？記録してみましょう。",
  },
};

export async function GET(request: Request) {
  // Cronシークレットの検証（本番環境のみ）
  if (process.env.NODE_ENV === "production" && CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // 現在のUTCスロットを計算
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcSlot = `${`${Math.floor(utcHour / 6) * 6}`.padStart(2, "0")}:00`;

  // VAPIDの設定
  webpush.setVapidDetails(
    env.VAPID_SUBJECT,
    env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY,
  );

  // Supabaseクライアント（サービスロール）
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!(supabaseUrl && secretKey)) {
    return NextResponse.json(
      { error: "Missing Supabase configuration" },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, secretKey);

  // 該当スロットのサブスクリプションを取得
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("utc_slot", utcSlot)
    .eq("enabled", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({
      message: "No subscriptions for this slot",
      slot: utcSlot,
      count: 0,
    });
  }

  // 通知を送信
  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const locale = sub.locale === "ja" ? "ja" : "en";
      const message = messages[locale];

      const payload = JSON.stringify({
        title: message.title,
        body: message.body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        url: "/",
      });

      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload,
        );
        return { id: sub.id, success: true };
      } catch (err) {
        const error = err as { statusCode?: number };
        // 購読が無効になっている場合は削除
        if (error.statusCode === 404 || error.statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        }
        return { id: sub.id, success: false, error: String(err) };
      }
    }),
  );

  const succeeded = results.filter(
    (r) => r.status === "fulfilled" && r.value.success,
  ).length;
  const failed = results.length - succeeded;

  return NextResponse.json({
    message: "Notifications sent",
    slot: utcSlot,
    total: subscriptions.length,
    succeeded,
    failed,
  });
}
