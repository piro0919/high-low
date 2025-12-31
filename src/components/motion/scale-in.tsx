"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type ScaleInProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
};

export function ScaleIn({
  children,
  delay = 0,
  duration = 0.2,
  className,
}: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
