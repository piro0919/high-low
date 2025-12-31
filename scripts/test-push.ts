/**
 * Push通知のテスト用スクリプト
 *
 * 使い方:
 * ローカル（全員）:     npm run push:test
 * ローカル（特定ユーザー）: npm run push:test -- --user <user_id>
 * 本番（特定ユーザー）:   npm run push:test:prod -- --user <user_id>
 *
 * オプション:
 * --prod        本番環境の設定を使用
 * --user <id>   特定のユーザーIDにのみ送信（本番環境では必須）
 *
 * 環境変数ファイル:
 * - ローカル: .env.local
 * - 本番:     .env.production.local
 */

import { createClient } from "@supabase/supabase-js";
import { config as loadEnv } from "dotenv";
import webpush from "web-push";

const isProd = process.argv.includes("--prod");

// --user オプションの解析
const userIndex = process.argv.indexOf("--user");
const targetUserId = userIndex !== -1 ? process.argv[userIndex + 1] : null;

// 環境に応じた.envファイルを読み込む
// ローカル: .env.local、本番: .env.production.local
const envFile = isProd ? ".env.production.local" : ".env.local";
loadEnv({ path: envFile });

console.log(`📁 環境変数ファイル: ${envFile}`);

// 環境設定
// NEXT_PUBLIC_プレフィックス付きの変数も対応
const envConfig = {
  supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  serviceRoleKey: process.env.SUPABASE_SECRET_KEY,
  vapidPublicKey:
    process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
  vapidSubject: process.env.VAPID_SUBJECT,
};

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
  console.log(
    `🔔 Push通知テストを開始します... (${isProd ? "本番" : "ローカル"})\n`,
  );

  // 本番環境では --user オプションが必須
  if (isProd && !targetUserId) {
    console.error("❌ 本番環境では --user オプションが必須です");
    console.error("   使用例: npm run push:test:prod -- --user <user_id>");
    process.exit(1);
  }

  if (targetUserId) {
    console.log(`👤 対象ユーザー: ${targetUserId}\n`);
  }

  // 環境変数チェック
  if (
    !(
      envConfig.supabaseUrl &&
      envConfig.serviceRoleKey &&
      envConfig.vapidPublicKey &&
      envConfig.vapidPrivateKey &&
      envConfig.vapidSubject
    )
  ) {
    console.error("❌ 必要な環境変数が設定されていません");
    console.error(`   ${envFile} に以下を設定してください:`);
    console.error(
      "   SUPABASE_URL, SUPABASE_SECRET_KEY, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT",
    );
    process.exit(1);
  }

  // VAPIDの設定
  webpush.setVapidDetails(
    envConfig.vapidSubject,
    envConfig.vapidPublicKey,
    envConfig.vapidPrivateKey,
  );

  // Supabaseクライアント
  const supabase = createClient(
    envConfig.supabaseUrl,
    envConfig.serviceRoleKey,
  );

  // サブスクリプションを取得
  let query = supabase
    .from("push_subscriptions")
    .select("*")
    .eq("enabled", true);

  if (targetUserId) {
    query = query.eq("user_id", targetUserId);
  }

  const { data: subscriptions, error } = await query;

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
      console.log(`\n📤 送信先: ${sub.endpoint.slice(0, 60)}...`);
      const result = await webpush.sendNotification(
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
      console.log(`   Status: ${result.statusCode}`);
      console.log(`   Body: ${result.body || "(empty)"}`);
      console.log(`   Location: ${result.headers?.location || "(none)"}`);
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
