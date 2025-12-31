"use client";

import { format, parseISO } from "date-fns";
import { enUS, ja } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import {
  getRecentMoodEntries,
  type MoodEntry,
} from "@/app/[locale]/(app)/actions";
import { MoodChart } from "./_components/mood-chart";

const localeMap = {
  ja,
  en: enUS,
};

export function StatsClient() {
  const tChart = useTranslations("Chart");
  const locale = useLocale();
  const dateFnsLocale = localeMap[locale as keyof typeof localeMap] || enUS;
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const {
        entries: data,
        startDate,
        endDate,
      } = await getRecentMoodEntries(30);
      setEntries(data);
      setDateRange({ startDate, endDate });
    });
  }, []);

  const formatDateRange = () => {
    if (!(dateRange.startDate && dateRange.endDate)) {
      return "";
    }
    const start = parseISO(dateRange.startDate);
    const end = parseISO(dateRange.endDate);
    return `${format(start, "M/d", { locale: dateFnsLocale })} - ${format(end, "M/d", { locale: dateFnsLocale })}`;
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex shrink-0 items-center justify-center">
        <h2 className="font-semibold text-lg md:text-xl">
          {tChart("last30Days")}{" "}
          <span className="font-normal text-muted-foreground text-sm">
            ({formatDateRange()})
          </span>
        </h2>
      </div>

      <div className="relative min-h-0 flex-1">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        )}
        <MoodChart
          entries={entries}
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
        />
      </div>
    </div>
  );
}
