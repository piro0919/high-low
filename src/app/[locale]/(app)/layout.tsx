import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import { LandingContent } from "../_components/landing-content";
import { AppSidebar } from "./_components/app-sidebar";
import { MobileNav } from "./_components/mobile-nav";
import { PwaPrompt } from "./_components/pwa-prompt";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LandingContent />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex h-svh flex-col overflow-hidden">
        <main className="min-h-0 flex-1 overflow-y-auto p-2 md:p-4">
          {children}
        </main>
        <MobileNav />
      </SidebarInset>
      <PwaPrompt />
    </SidebarProvider>
  );
}
