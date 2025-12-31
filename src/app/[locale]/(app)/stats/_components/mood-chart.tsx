"use client";

import { eachDayOfInterval, format, parseISO } from "date-fns";
import { enUS, ja } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MoodEntry } from "@/app/[locale]/(app)/actions";

const localeMap = {
  ja,
  en: enUS,
};

function useChartColors() {
  const [colors, setColors] = useState({
    primary: "oklch(0.55 0.15 280)",
    muted: "oklch(0.94 0.015 300)",
    foreground: "oklch(0.5 0.03 280)",
  });

  useEffect(() => {
    const updateColors = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      setColors({
        primary:
          computedStyle.getPropertyValue("--primary").trim() || colors.primary,
        muted: computedStyle.getPropertyValue("--muted").trim() || colors.muted,
        foreground:
          computedStyle.getPropertyValue("--muted-foreground").trim() ||
          colors.foreground,
      });
    };

    updateColors();

    // テーマ変更を監視
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          updateColors();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, [colors.foreground, colors.muted, colors.primary]);

  return colors;
}

type MoodChartProps = {
  entries: MoodEntry[];
  startDate: string;
  endDate: string;
};

const levelLabels = ["1", "2", "3", "4", "5"];

export function MoodChart({ entries, startDate, endDate }: MoodChartProps) {
  const t = useTranslations("Chart");
  const locale = useLocale();
  const dateFnsLocale = localeMap[locale as keyof typeof localeMap] || enUS;
  const chartColors = useChartColors();

  const chartData = useMemo(() => {
    if (!(startDate && endDate)) {
      return [];
    }

    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const days = eachDayOfInterval({ start, end });

    return days.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const entry = entries.find((e) => e.date === dateStr);
      return {
        label: format(date, "M/d", { locale: dateFnsLocale }),
        level: entry?.level ?? null,
        date: dateStr,
      };
    });
  }, [entries, startDate, endDate, dateFnsLocale]);

  const average = useMemo(() => {
    const recorded = entries.filter(
      (e) => e.level !== undefined && e.level !== null,
    );
    if (recorded.length === 0) {
      return null;
    }
    return recorded.reduce((sum, e) => sum + e.level, 0) / recorded.length;
  }, [entries]);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: { label: string; level: number | null } }>;
  }) => {
    const firstPayload = payload?.[0];
    if (active && firstPayload) {
      const data = firstPayload.payload;
      if (data.level === null) {
        return null;
      }

      return (
        <div className="rounded-lg border bg-background px-3 py-2 shadow-sm">
          <p className="text-muted-foreground text-sm">{data.label}</p>
          <p className="font-semibold text-lg">Lv.{data.level}</p>
        </div>
      );
    }
    return null;
  };

  if (entries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        {t("noData")}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {average && (
        <div className="mb-2 text-center text-muted-foreground text-sm">
          {t("average")}: Lv.{average.toFixed(1)}
        </div>
      )}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.muted} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: chartColors.foreground }}
              tickLine={false}
              axisLine={{ stroke: chartColors.muted }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 12, fill: chartColors.foreground }}
              tickLine={false}
              tickFormatter={(value) => levelLabels[value - 1] ?? ""}
              axisLine={{ stroke: chartColors.muted }}
            />
            <Tooltip content={<CustomTooltip />} />
            {average && (
              <ReferenceLine
                y={average}
                stroke={chartColors.primary}
                strokeDasharray="5 5"
                strokeOpacity={0.5}
              />
            )}
            <Line
              type="monotone"
              dataKey="level"
              stroke={chartColors.primary}
              strokeWidth={2}
              dot={{ fill: chartColors.primary, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: chartColors.primary }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
