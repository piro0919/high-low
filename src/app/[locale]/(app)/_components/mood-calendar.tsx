"use client";

import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  getDay,
  getDaysInMonth,
  getMonth,
  getYear,
  isToday as isDateToday,
  isFuture,
  isSameMonth,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { enUS, ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { useSwipeable } from "react-swipeable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import {
  useDeleteMoodEntry,
  useMultiMonthMoodEntries,
  useSaveMoodEntry,
} from "@/hooks/use-mood-entries";

// エネルギーレベルを表現（低い=静か、高い=活発）
const levelLabels = ["1", "2", "3", "4", "5"];
// 紫（静か）→ オレンジ/黄（活発）のグラデーション
const levelColors = [
  "bg-[oklch(0.90_0.06_280)] dark:bg-[oklch(0.32_0.06_280)]", // 薄紫
  "bg-[oklch(0.88_0.08_320)] dark:bg-[oklch(0.35_0.08_320)]", // ピンク寄り
  "bg-[oklch(0.86_0.10_20)] dark:bg-[oklch(0.38_0.10_20)]", // サーモン
  "bg-[oklch(0.84_0.12_45)] dark:bg-[oklch(0.42_0.12_45)]", // オレンジ
  "bg-[oklch(0.82_0.14_70)] dark:bg-[oklch(0.46_0.14_70)]", // 黄/ゴールド
];

const localeMap = {
  ja,
  en: enUS,
};

function getWeekDays(locale: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2024, 0, 7 + i);
    return formatter.format(date);
  });
}

type CalendarCell = {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
};

export function MoodCalendar() {
  const t = useTranslations("Mood");
  const locale = useLocale();
  const dateFnsLocale = localeMap[locale as keyof typeof localeMap] || enUS;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [moodLevel, setMoodLevel] = useState(3);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const year = getYear(currentDate);
  const month = getMonth(currentDate);

  // TanStack Queryを使用
  const { entries, isLoading } = useMultiMonthMoodEntries(year, month);
  const saveMutation = useSaveMoodEntry();
  const deleteMutation = useDeleteMoodEntry();

  const weekDays = useMemo(() => getWeekDays(locale), [locale]);

  // カレンダーのセルを生成（前月・次月含む）
  const calendarCells = useMemo<CalendarCell[]>(() => {
    const firstDay = startOfMonth(currentDate);
    const lastDay = endOfMonth(currentDate);
    const startingDayOfWeek = getDay(firstDay);
    const daysInMonth = getDaysInMonth(currentDate);
    const totalCells = 42;

    const cells: CalendarCell[] = [];

    // 前月の日付
    const prevMonthEnd = subDays(firstDay, 1);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = subDays(prevMonthEnd, i);
      cells.push({
        date,
        day: date.getDate(),
        isCurrentMonth: false,
      });
    }

    // 当月の日付
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      cells.push({
        date,
        day,
        isCurrentMonth: true,
      });
    }

    // 次月の日付
    const nextMonthStart = addDays(lastDay, 1);
    let nextDayIndex = 0;
    while (cells.length < totalCells) {
      const date = addDays(nextMonthStart, nextDayIndex);
      cells.push({
        date,
        day: date.getDate(),
        isCurrentMonth: false,
      });
      nextDayIndex++;
    }

    return cells;
  }, [currentDate, year, month]);

  const prevMonth = useCallback(() => {
    setCurrentDate((prev) => subMonths(prev, 1));
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentDate((prev) => addMonths(prev, 1));
  }, []);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => !isLoading && nextMonth(),
    onSwipedRight: () => !isLoading && prevMonth(),
    trackMouse: false,
    trackTouch: true,
    delta: 50,
    preventScrollOnSwipe: true,
  });

  const handleDayClick = (date: Date) => {
    // 未来の日付はクリック不可
    if (isFuture(date)) {
      return;
    }

    setSelectedDate(date);
    const dateStr = format(date, "yyyy-MM-dd");
    const existing = entries.find((e) => e.date === dateStr);
    setMoodLevel(existing?.level ?? 3);
    setDialogOpen(true);
  };

  const hasExistingEntry = useMemo(() => {
    if (!selectedDate) {
      return false;
    }
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return entries.some((e) => e.date === dateStr);
  }, [selectedDate, entries]);

  const handleSave = () => {
    if (!selectedDate) {
      return;
    }
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    saveMutation.mutate(
      { date: dateStr, level: moodLevel },
      { onSuccess: () => setDialogOpen(false) },
    );
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedDate) {
      return;
    }
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setDeleteConfirmOpen(false);
    deleteMutation.mutate(dateStr, {
      onSuccess: () => setDialogOpen(false),
    });
  };

  const getMoodForDate = (date: Date): number | undefined => {
    const dateStr = format(date, "yyyy-MM-dd");
    return entries.find((e) => e.date === dateStr)?.level;
  };

  // 今日の記録があるかチェック
  const todayHasEntry = useMemo(() => {
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    return entries.some((e) => e.date === todayStr);
  }, [entries]);

  const handleTodayClick = () => {
    const today = new Date();
    setSelectedDate(today);
    const dateStr = format(today, "yyyy-MM-dd");
    const existing = entries.find((e) => e.date === dateStr);
    setMoodLevel(existing?.level ?? 3);
    setDialogOpen(true);
  };

  const isMutating = saveMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <div
        {...swipeHandlers}
        className="relative flex h-full touch-pan-y flex-col"
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        )}

        {!(isLoading || todayHasEntry) &&
          isSameMonth(currentDate, new Date()) && (
            <button
              type="button"
              onClick={handleTodayClick}
              className="mb-2 flex shrink-0 items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-left transition-colors hover:bg-primary/10 active:scale-[0.99] md:mb-4"
            >
              <span className="font-medium text-sm">{t("todayReminder")}</span>
              <span className="text-muted-foreground text-xs">
                {t("tapToRecord")}
              </span>
            </button>
          )}

        <div className="mb-2 flex shrink-0 items-center justify-between md:mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevMonth}
            disabled={isLoading}
            aria-label={t("prevMonth")}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <h2 className="font-semibold text-lg md:text-xl">
            {format(currentDate, t("monthFormat"), { locale: dateFnsLocale })}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            disabled={isLoading}
            aria-label={t("nextMonth")}
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>

        <div className="grid shrink-0 grid-cols-7">
          {weekDays.map((day, i) => (
            <div
              key={`${day}-${i}`}
              className={`flex h-6 items-center justify-center font-medium text-xs md:h-8 md:text-sm ${
                i === 0
                  ? "text-red-500"
                  : i === 6
                    ? "text-blue-500"
                    : "text-muted-foreground"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-0.5 md:gap-1">
          {calendarCells.map((cell, index) => {
            const dayIndex = index % 7;
            const mood = getMoodForDate(cell.date);
            const isToday = isDateToday(cell.date);
            const isFutureDate = isFuture(cell.date);
            const dateLabel = format(cell.date, "PPP", {
              locale: dateFnsLocale,
            });
            const ariaLabel =
              mood !== undefined
                ? t("dayLabel", { date: dateLabel, level: mood })
                : t("dayLabelNoEntry", { date: dateLabel });

            return (
              <button
                key={`cell-${index}`}
                type="button"
                onClick={() => handleDayClick(cell.date)}
                disabled={isFutureDate}
                aria-label={ariaLabel}
                className={`relative flex flex-col items-center justify-center rounded-md border transition-colors ${
                  isFutureDate
                    ? "cursor-not-allowed opacity-30"
                    : "hover:border-primary active:scale-95"
                } ${
                  mood !== undefined ? levelColors[mood - 1] : "bg-card"
                } ${isToday ? "ring-2 ring-primary ring-offset-1" : ""} ${
                  cell.isCurrentMonth || isFutureDate ? "" : "opacity-40"
                }`}
              >
                <span
                  className={`font-medium text-xs md:text-sm ${
                    dayIndex === 0
                      ? "text-red-500"
                      : dayIndex === 6
                        ? "text-blue-500"
                        : ""
                  } ${cell.isCurrentMonth ? "" : "text-muted-foreground"}`}
                >
                  {cell.day}
                </span>
                {mood !== undefined && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary font-bold text-[10px] text-primary-foreground md:size-6 md:text-xs">
                    {levelLabels[mood - 1]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("recordMood")}</DialogTitle>
            <DialogDescription>
              {selectedDate &&
                format(selectedDate, "PPP", { locale: dateFnsLocale })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <span className="flex size-20 items-center justify-center rounded-full bg-primary font-bold text-3xl text-primary-foreground">
                {levelLabels[moodLevel - 1]}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-muted-foreground text-sm">
                <span>{t("low")}</span>
                <span>{t("high")}</span>
              </div>
              <Slider
                value={[moodLevel]}
                onValueChange={(values) => values[0] && setMoodLevel(values[0])}
                min={1}
                max={5}
                step={1}
              />
            </div>

            <div className="flex justify-center gap-2">
              {levelLabels.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setMoodLevel(i + 1)}
                  className={`flex size-10 items-center justify-center rounded-full font-bold text-sm transition-transform hover:scale-110 md:size-12 md:text-base ${
                    moodLevel === i + 1
                      ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="flex-row gap-2 sm:justify-between">
            {hasExistingEntry && (
              <Button
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={isMutating}
                className="flex-1 sm:flex-none"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 size-4" />
                )}
                {t("delete")}
              </Button>
            )}
            <div className="flex flex-1 justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isMutating}
              >
                {t("cancel")}
              </Button>
              <Button onClick={handleSave} disabled={isMutating}>
                {saveMutation.isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {t("save")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedDate &&
                format(selectedDate, "PPP", { locale: dateFnsLocale })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
