import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // Supabaseセッションを更新
  const supabaseResponse = await updateSession(request);

  // next-intlのミドルウェアを実行
  const intlResponse = intlMiddleware(request);

  // Supabaseのcookieをintlレスポンスにマージ
  if (intlResponse) {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      intlResponse.cookies.set(cookie.name, cookie.value);
    });
    return intlResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/", "/(ja|en)/:path*", "/auth/callback"],
};
