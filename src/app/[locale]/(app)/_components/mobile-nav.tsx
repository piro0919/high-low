"use client";

import { BarChart3, Home, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function MobileNav() {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();

  const menuItems = [
    {
      title: t("home"),
      url: "/",
      icon: Home,
    },
    {
      title: t("stats"),
      url: "/stats",
      icon: BarChart3,
    },
    {
      title: t("settings"),
      url: "/settings",
      icon: Settings,
    },
  ];

  return (
    <nav className="relative z-50 flex h-14 shrink-0 items-center justify-around border-t bg-background md:hidden">
      {menuItems.map((item) => {
        const isActive = pathname === item.url;
        return (
          <Link
            key={item.url}
            href={item.url}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon className="size-5" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
