import { FileQuestion } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
      <FileQuestion className="size-12 text-muted-foreground" />
      <h1 className="font-bold text-2xl">{t("title")}</h1>
      <p className="text-center text-muted-foreground">{t("description")}</p>
      <Button asChild={true}>
        <Link href="/">{t("backHome")}</Link>
      </Button>
    </div>
  );
}
