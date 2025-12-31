import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <span
      className={cn(
        "font-[family-name:var(--font-outfit)] font-bold tracking-tight",
        sizeClasses[size],
        className,
      )}
    >
      <span className="text-blue-500">High</span>
      <span className="mx-0.5 text-muted-foreground/60">or</span>
      <span className="text-orange-500">Low</span>
    </span>
  );
}
