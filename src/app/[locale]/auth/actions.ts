"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const authSchema = z.object({
  email: z.string().email({ message: "invalidEmail" }),
  password: z.string().min(8, { message: "passwordTooShort" }),
});

export type AuthResult = {
  success: boolean;
  errorKey?: string;
  errorMessage?: string;
};

export async function login(formData: FormData): Promise<AuthResult> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = authSchema.safeParse(rawData);
  if (!result.success) {
    return {
      success: false,
      errorKey: result.error.issues[0]?.message ?? "validationError",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(result.data);

  if (error) {
    return { success: false, errorMessage: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData): Promise<AuthResult> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = authSchema.safeParse(rawData);
  if (!result.success) {
    return {
      success: false,
      errorKey: result.error.issues[0]?.message ?? "validationError",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(result.data);

  if (error) {
    return { success: false, errorMessage: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;

  const emailSchema = z.string().email({ message: "invalidEmail" });
  const result = emailSchema.safeParse(email);
  if (!result.success) {
    return {
      success: false,
      errorKey: result.error.issues[0]?.message ?? "validationError",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(result.data, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback?next=/auth/update-password`,
  });

  if (error) {
    return { success: false, errorMessage: error.message };
  }

  return { success: true };
}

export async function updatePassword(formData: FormData): Promise<AuthResult> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    return { success: false, errorKey: "passwordMismatch" };
  }

  const passwordSchema = z.string().min(8, { message: "passwordTooShort" });
  const result = passwordSchema.safeParse(password);
  if (!result.success) {
    return {
      success: false,
      errorKey: result.error.issues[0]?.message ?? "validationError",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: result.data });

  if (error) {
    return { success: false, errorMessage: error.message };
  }

  return { success: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
