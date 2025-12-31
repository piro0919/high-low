import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: 現在のサブスクリプションを取得
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: subscription, error } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform snake_case to camelCase for frontend
  const transformedSubscription = subscription
    ? {
        ...subscription,
        utcSlot: subscription.utc_slot,
      }
    : null;

  return NextResponse.json({ subscription: transformedSubscription });
}

// POST: 新しいサブスクリプションを作成
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { subscription, utcSlot, locale } = body as {
    subscription: {
      endpoint: string;
      keys: {
        p256dh: string;
        auth: string;
      };
    };
    utcSlot: string;
    locale: string;
  };

  if (
    !(
      subscription?.endpoint &&
      subscription?.keys?.p256dh &&
      subscription?.keys?.auth
    )
  ) {
    return NextResponse.json(
      { error: "Invalid subscription" },
      { status: 400 },
    );
  }

  if (!["00:00", "06:00", "12:00", "18:00"].includes(utcSlot)) {
    return NextResponse.json({ error: "Invalid UTC slot" }, { status: 400 });
  }

  // 既存のサブスクリプションを削除
  await supabase.from("push_subscriptions").delete().eq("user_id", user.id);

  // 新しいサブスクリプションを作成
  const { error } = await supabase.from("push_subscriptions").insert({
    user_id: user.id,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
    utc_slot: utcSlot,
    locale: locale || "en",
    enabled: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// PATCH: サブスクリプションを更新
export async function PATCH(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { utcSlot, enabled } = body as {
    utcSlot?: string;
    enabled?: boolean;
  };

  const updates: Record<string, unknown> = {};

  if (utcSlot !== undefined) {
    if (!["00:00", "06:00", "12:00", "18:00"].includes(utcSlot)) {
      return NextResponse.json({ error: "Invalid UTC slot" }, { status: 400 });
    }
    updates.utc_slot = utcSlot;
  }

  if (enabled !== undefined) {
    updates.enabled = enabled;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .update(updates)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE: サブスクリプションを削除
export async function DELETE() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
