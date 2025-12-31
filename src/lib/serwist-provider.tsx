"use client";

import { SerwistProvider as BaseSerwistProvider } from "@serwist/turbopack/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  swUrl: string;
};

export function SerwistProvider({ children, swUrl }: Props) {
  // Disable Service Worker in development
  if (process.env.NODE_ENV === "development") {
    return <>{children}</>;
  }

  return <BaseSerwistProvider swUrl={swUrl}>{children}</BaseSerwistProvider>;
}
