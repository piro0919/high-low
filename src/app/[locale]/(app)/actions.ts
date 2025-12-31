"use server";

import { endOfMonth, format, startOfMonth, subDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const moodEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  level: z.number().int().min(1).max(5),
});

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");

export type MoodEntry = {
  id: string;
  date: string;
  level: number;
};

export async function getMoodEntries(
  year: number,
  month: number,
): Promise<MoodEntry[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // 月の最初と最後の日を計算
  const targetDate = new Date(year, month, 1);
  const startDate = format(startOfMonth(targetDate), "yyyy-MM-dd");
  const endDate = format(endOfMonth(targetDate), "yyyy-MM-dd");

  const { data, error } = await supabase
    .from("mood_entries")
    .select("id, date, level")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) {
    return [];
  }

  return data || [];
}

export async function saveMoodEntry(
  date: string,
  level: number,
): Promise<{ success: boolean; error?: string }> {
  const validation = moodEntrySchema.safeParse({ date, level });
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message ?? "Validation error",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase.from("mood_entries").upsert(
    {
      user_id: user.id,
      date: validation.data.date,
      level: validation.data.level,
    },
    {
      onConflict: "user_id,date",
    },
  );

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function deleteMoodEntry(
  date: string,
): Promise<{ success: boolean; error?: string }> {
  const validation = dateSchema.safeParse(date);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message ?? "Validation error",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("mood_entries")
    .delete()
    .eq("user_id", user.id)
    .eq("date", validation.data);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function getRecentMoodEntries(
  days = 30,
): Promise<{ entries: MoodEntry[]; startDate: string; endDate: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { entries: [], startDate: "", endDate: "" };
  }

  const today = new Date();
  const startDate = format(subDays(today, days - 1), "yyyy-MM-dd");
  const endDate = format(today, "yyyy-MM-dd");

  const { data, error } = await supabase
    .from("mood_entries")
    .select("id, date, level")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) {
    return { entries: [], startDate, endDate };
  }

  return { entries: data || [], startDate, endDate };
}
