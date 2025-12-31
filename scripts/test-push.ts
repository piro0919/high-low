/**
 * Push通知のローカルテスト用スクリプト
 *
 * 使い方:
 * 1. 設定画面で通知を有効にする
 * 2. このスクリプトを実行: npx tsx scripts/test-push.ts
 */

import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

// ローカル環境変数
const SUPABASE_URL = "http://127.0.0.1:56321";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU";

const VAPID_PUBLIC_KEY =
  "BBymW-qWc95Zwt3UuVCiuMllf66WWAbP7Q5isZ67qXnxVPkjRRzt931BQRXxR4weTYTyUstCplDciCZTyX_I-ks";
const VAPID_PRIVATE_KEY = "RioTeTbD1mkd_jJZ2aEWGYjS2fkyOTkCEdxbHcgxxzE";
const VAPID_SUBJECT = "mailto:piro.haniwa@gmail.com";

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

async function main() {
  console.log("🔔 Push通知テストを開始します...\n");

  // VAPIDの設定
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  // Supabaseクライアント
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // すべてのサブスクリプションを取得
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("enabled", true);

  if (error) {
    console.error("❌ サブスクリプションの取得に失敗:", error.message);
    process.exit(1);
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log("⚠️  有効なサブスクリプションがありません。");
    console.log("   設定画面で通知を有効にしてから再度実行してください。");
    process.exit(0);
  }

  console.log(
    `📱 ${subscriptions.length}件のサブスクリプションが見つかりました\n`,
  );

  // 通知を送信
  for (const sub of subscriptions) {
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
      console.log(
        `✅ 通知送信成功 (user: ${sub.user_id.slice(0, 8)}..., locale: ${locale})`,
      );
    } catch (err) {
      const error = err as { statusCode?: number; message?: string };
      console.error(
        `❌ 通知送信失敗 (user: ${sub.user_id.slice(0, 8)}...):`,
        error.message,
      );

      // 購読が無効になっている場合は削除
      if (error.statusCode === 404 || error.statusCode === 410) {
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        console.log("   → 無効なサブスクリプションを削除しました");
      }
    }
  }

  console.log("\n✨ テスト完了");
}

main();
