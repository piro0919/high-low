"use client";

import { LogOut, Monitor, Moon, Sun } from "lucide-react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { logout } from "@/app/[locale]/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { usePathname, useRouter } from "@/i18n/navigation";

const PwaInstallButton = dynamic(
  () =>
    import("./_components/pwa-install-button").then(
      (mod) => mod.PwaInstallButton,
    ),
  { ssr: false },
);

export function SettingsClient() {
  const t = useTranslations("Settings");
  const tSidebar = useTranslations("Sidebar");
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale && newLocale !== locale) {
      router.replace(pathname, { locale: newLocale as "en" | "ja" });
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <h1 className="font-bold text-2xl">{t("title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("theme")}</CardTitle>
          <CardDescription>{t("themeDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={(value) => value && setTheme(value)}
            className="justify-start"
          >
            <ToggleGroupItem value="light" aria-label={t("themeLight")}>
              <Sun className="mr-2 size-4" />
              {t("themeLight")}
            </ToggleGroupItem>
            <ToggleGroupItem value="dark" aria-label={t("themeDark")}>
              <Moon className="mr-2 size-4" />
              {t("themeDark")}
            </ToggleGroupItem>
            <ToggleGroupItem value="system" aria-label={t("themeSystem")}>
              <Monitor className="mr-2 size-4" />
              {t("themeSystem")}
            </ToggleGroupItem>
          </ToggleGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("language")}</CardTitle>
          <CardDescription>{t("languageDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ToggleGroup
            type="single"
            value={locale}
            onValueChange={handleLocaleChange}
            className="justify-start"
          >
            <ToggleGroupItem value="ja" aria-label="Japanese">
              日本語
            </ToggleGroupItem>
            <ToggleGroupItem value="en" aria-label="English">
              English
            </ToggleGroupItem>
          </ToggleGroup>
        </CardContent>
      </Card>

      <PwaInstallButton />

      <div className="pt-4">
        <form action={logout}>
          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
          >
            <LogOut className="mr-2 size-4" />
            {tSidebar("logout")}
          </Button>
        </form>
      </div>
    </div>
  );
}
