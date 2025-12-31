import { AlertCircle } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });
  return {
    title: t("authError"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AuthErrorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="size-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">{t("authError")}</CardTitle>
          <CardDescription>{t("authErrorDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild={true}>
            <Link href="/auth/login">{t("tryAgain")}</Link>
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <Link
            href="/"
            className="text-muted-foreground text-sm hover:text-primary hover:underline"
          >
            {t("backToLogin")}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
