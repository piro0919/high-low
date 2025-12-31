"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRateLimit } from "@/hooks/use-rate-limit";
import { Link } from "@/i18n/navigation";
import { login } from "../../actions";

const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t("invalidEmail")),
    password: z.string().min(8, t("passwordTooShort")),
  });

type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

export function LoginForm() {
  const t = useTranslations("Auth");
  const [error, setError] = useState<string | null>(null);
  const { isLocked, remainingSeconds, recordAttempt } = useRateLimit({
    maxAttempts: 5,
    windowMs: 60000,
    lockoutMs: 30000,
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(createLoginSchema(t)),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: LoginFormValues) => {
    if (isLocked) {
      setError(t("tooManyAttempts", { seconds: remainingSeconds }));
      return;
    }

    if (!recordAttempt()) {
      setError(t("tooManyAttempts", { seconds: remainingSeconds }));
      return;
    }

    setError(null);

    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);

    const result = await login(formData);

    if (!result.success) {
      setError(
        result.errorKey ? t(result.errorKey) : result.errorMessage || "Error",
      );
    }
  };

  return (
    <FadeIn>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">{t("login")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("email")}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>{t("password")}</FormLabel>
                      <Link
                        href="/auth/forgot-password"
                        className="text-muted-foreground text-xs hover:text-primary hover:underline"
                      >
                        {t("forgotPassword")}
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting || isLocked}
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {isLocked
                  ? t("tooManyAttempts", { seconds: remainingSeconds })
                  : t("login")}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-muted-foreground text-sm">
            {t("noAccount")}{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              {t("signup")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </FadeIn>
  );
}
