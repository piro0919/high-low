"use client";
import { ModeToggle } from "@/components/theme-toggle";
import {
  Calendar,
  CalendarCurrentDate,
  CalendarMonthView,
  CalendarNextTrigger,
  CalendarPrevTrigger,
  CalendarTodayTrigger,
} from "@/components/ui/full-calendar";
import { addHours } from "date-fns";
import { ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react";
import { ja } from "date-fns/locale/ja";
import { Bricolage_Grotesque } from "next/font/google";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700"],
});

export default function App(): React.JSX.Element {
  const { setTheme, theme } = useTheme();

  return (
    <Calendar
      events={[
        {
          id: "1",
          start: new Date(),
          end: addHours(new Date(), 2),
          title: "event A",
          color: "pink",
        },
        {
          id: "2",
          start: addHours(new Date(), 1.5),
          end: addHours(new Date(), 3),
          title: "event B",
          color: "blue",
        },
      ]}
      locale={ja}
    >
      <div className="h-dvh flex flex-col p-2 gap-2">
        <div className="flex items-center gap-4 px-2">
          <h1
            className={cn(bricolageGrotesque.className, "text-2xl font-bold")}
          >
            High or Low
          </h1>
          <CalendarTodayTrigger>今日</CalendarTodayTrigger>
          <div className="flex items-center">
            <CalendarPrevTrigger>
              <ChevronLeft size={20} />
              <span className="sr-only">Previous</span>
            </CalendarPrevTrigger>
            <CalendarNextTrigger>
              <ChevronRight size={20} />
              <span className="sr-only">Next</span>
            </CalendarNextTrigger>
          </div>
          <CalendarCurrentDate />
          <span className="flex-1" />
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          <CalendarMonthView />
        </div>
      </div>
    </Calendar>
  );
}
