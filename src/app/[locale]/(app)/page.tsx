import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { MoodCalendar } from "./_components/mood-calendar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ログインユーザーはnoindex、未ログイン（ランディング）はインデックス
  if (user) {
    return {
      title: t("home"),
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: {
      absolute: t("title"),
    },
    description: t("description"),
  };
}

export default function Page() {
  return (
    <div className="flex h-full flex-col">
      <MoodCalendar />
    </div>
  );
}
