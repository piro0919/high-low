"use client";

import { ProgressProvider as BProgressProvider } from "@bprogress/next/app";
import type { ReactNode } from "react";

export function ProgressProvider({ children }: { children: ReactNode }) {
  return (
    <BProgressProvider
      height="3px"
      color="oklch(0.55 0.15 280)"
      options={{ showSpinner: false }}
      shallowRouting={true}
    >
      {children}
    </BProgressProvider>
  );
}
