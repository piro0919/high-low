import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import { Skeleton } from "@/components/ui/skeleton";

const SettingsClient = dynamic(
  () => import("./settings-client").then((mod) => mod.SettingsClient),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    ),
  },
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("settings"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function SettingsPage() {
  return <SettingsClient />;
}
