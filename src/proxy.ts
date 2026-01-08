import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // next-intlのミドルウェアを先に実行（リライト/リダイレクトを処理）
  const intlResponse = intlMiddleware(request);

  // Supabaseセッションを更新してcookieをマージ
  const supabaseResponse = await updateSession(request);
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  // api, _next, _vercel, serwist, ~offline, ファイル拡張子付き、auth/callbackを除くすべてのパス
  matcher: [
    "/((?!api|_next|_vercel|serwist|~offline|auth/callback|.*\\..*).*)",
    "/",
  ],
};
