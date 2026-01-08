import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: 現在の端末のサブスクリプションを取得
export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // endpointをクエリパラメータから取得
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return NextResponse.json({ subscription: null });
  }

  const { data: subscription, error } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("endpoint", endpoint)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const transformedSubscription = subscription
    ? {
        ...subscription,
        utcSlot: subscription.utc_slot,
      }
    : null;

  return NextResponse.json({ subscription: transformedSubscription });
}

// POST: 新しいサブスクリプションを作成（この端末のみ）
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

  // この端末の既存サブスクリプションを削除（他の端末は残す）
  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", subscription.endpoint);

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

// PATCH: サブスクリプションを更新（この端末のみ）
export async function PATCH(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { endpoint, utcSlot, enabled } = body as {
    endpoint: string;
    utcSlot?: string;
    enabled?: boolean;
  };

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint required" }, { status: 400 });
  }

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
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE: サブスクリプションを削除（この端末のみ）
export async function DELETE(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { endpoint } = body as { endpoint: string };

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
