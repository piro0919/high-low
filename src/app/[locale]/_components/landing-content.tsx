"use client";

import { ArrowRight, CalendarDays, Lock, Sparkles, Zap } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: typeof CalendarDays;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-background to-muted/50 p-8 shadow-lg ring-1 ring-border/50 transition-all hover:shadow-xl hover:ring-border"
    >
      <div className="-right-8 -top-8 absolute size-32 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-2xl transition-all group-hover:from-primary/20" />
      <div className="relative">
        <div className="mb-5 inline-flex rounded-xl bg-gradient-to-br from-primary to-primary/80 p-3 text-primary-foreground shadow-lg">
          <Icon className="size-6" />
        </div>
        <h3 className="mb-3 font-bold text-xl">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

function FloatingCalendar() {
  const days = [
    [null, null, 3, 4, 2, 3, 5],
    [4, 3, 2, 4, 5, 3, 2],
    [3, 4, 5, 3, 2, 4, 3],
    [2, 3, 4, 5, 4, 3, 2],
  ];

  // 紫（静か）→ オレンジ/黄（活発）のグラデーション
  const levelColors = [
    "from-violet-200 to-violet-300 dark:from-violet-900/60 dark:to-violet-800/60",
    "from-pink-200 to-pink-300 dark:from-pink-900/60 dark:to-pink-800/60",
    "from-rose-200 to-rose-300 dark:from-rose-900/60 dark:to-rose-800/60",
    "from-orange-200 to-orange-300 dark:from-orange-900/60 dark:to-orange-800/60",
    "from-amber-200 to-amber-300 dark:from-amber-900/60 dark:to-amber-800/60",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
      className="relative mx-auto w-full max-w-sm"
    >
      {/* Glow effect */}
      <div className="-inset-4 absolute rounded-3xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 blur-2xl" />

      {/* Card */}
      <div className="relative overflow-hidden rounded-2xl border bg-card/80 p-6 shadow-2xl backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-medium text-muted-foreground text-sm">
            December 2024
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`size-3 rounded-full bg-gradient-to-br ${levelColors[level - 1]}`}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div
              key={`header-${day}-${i}`}
              className="flex h-8 items-center justify-center font-medium text-muted-foreground text-xs"
            >
              {day}
            </div>
          ))}
          {days.flat().map((level, i) => (
            <motion.div
              key={`day-${i}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 + i * 0.02, duration: 0.3 }}
              className={`flex aspect-square items-center justify-center rounded-lg font-medium text-sm ${
                level !== null
                  ? `bg-gradient-to-br ${levelColors[level - 1]} shadow-sm`
                  : "bg-muted/30"
              }`}
            >
              {level !== null && (
                <span className="text-foreground/80">{level}</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function LandingContent() {
  const t = useTranslations("Landing");
  const tMeta = useTranslations("Metadata");

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild={true}>
              <Link href="/auth/login">{tMeta("login")}</Link>
            </Button>
            <Button size="sm" asChild={true}>
              <Link href="/auth/signup">{tMeta("signup")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16">
          {/* Background */}
          <div className="-z-10 absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
              alt=""
              fill={true}
              className="object-cover opacity-20 dark:opacity-10"
              priority={true}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
          </div>

          {/* Decorative elements */}
          <div className="-z-10 pointer-events-none absolute top-32 left-1/4 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="-z-10 pointer-events-none absolute top-64 right-1/4 size-96 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="container mx-auto px-4 py-24 md:py-32 lg:py-40">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm backdrop-blur-sm"
                >
                  <Zap className="size-4 text-primary" />
                  <span>{t("badge")}</span>
                </motion.div>

                <h1 className="mb-6 font-bold text-4xl tracking-tight md:text-5xl lg:text-6xl xl:text-7xl">
                  <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                    {t("hero")}
                  </span>
                </h1>

                <p className="mx-auto mb-10 max-w-lg text-lg text-muted-foreground md:text-xl lg:mx-0">
                  {t("heroDescription")}
                </p>

                <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                  <Button size="lg" className="group px-8" asChild={true}>
                    <Link href="/auth/signup">
                      {t("getStarted")}
                      <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild={true}>
                    <Link href="/auth/login">{tMeta("login")}</Link>
                  </Button>
                </div>
              </motion.div>

              <FloatingCalendar />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative border-y bg-muted/30 py-24 md:py-32">
          <div className="-z-10 absolute inset-0">
            <div className="-translate-y-1/2 absolute top-1/2 left-0 size-96 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute top-1/3 right-0 size-72 rounded-full bg-purple-500/5 blur-3xl" />
          </div>

          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 font-bold text-3xl md:text-4xl">
                {t("featuresTitle")}
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                {t("featuresDescription")}
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-3">
              <FeatureCard
                icon={Sparkles}
                title={t("feature1Title")}
                description={t("feature1Description")}
                index={0}
              />
              <FeatureCard
                icon={CalendarDays}
                title={t("feature2Title")}
                description={t("feature2Description")}
                index={1}
              />
              <FeatureCard
                icon={Lock}
                title={t("feature3Title")}
                description={t("feature3Description")}
                index={2}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden py-24 md:py-32">
          <div className="-z-10 absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80"
              alt=""
              fill={true}
              className="object-cover opacity-15 dark:opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background" />
          </div>

          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-6 font-bold text-3xl md:text-4xl lg:text-5xl">
                {t("ctaTitle")}
              </h2>
              <p className="mx-auto mb-10 max-w-md text-lg text-muted-foreground">
                {t("ctaDescription")}
              </p>
              <Button size="lg" className="group px-8" asChild={true}>
                <Link href="/auth/signup">
                  {t("getStarted")}
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 text-muted-foreground text-sm sm:flex-row sm:justify-between">
          <Logo size="sm" />
          <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
