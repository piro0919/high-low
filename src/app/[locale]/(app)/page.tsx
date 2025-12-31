import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MoodCalendar } from "./_components/mood-calendar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("home"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function Page() {
  return (
    <div className="flex h-full flex-col">
      <MoodCalendar />
    </div>
  );
}
