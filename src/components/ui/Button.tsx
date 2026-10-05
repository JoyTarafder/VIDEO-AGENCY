import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 24-px arrow that kicks 45° on hover — the house link glyph. */
export function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="square"
      className={cn("h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5", className)}
      aria-hidden="true"
    >
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

const base =
  "group inline-flex items-center justify-center gap-3 rounded-full font-medium transition-colors duration-300";

export const buttonStyles = {
  primary:
    "bg-acid text-ink hover:bg-paper",
  ghost:
    "border border-paper/25 text-paper hover:border-acid hover:text-acid",
  dark: "bg-ink text-paper hover:bg-coal border border-paper/10",
} as const;

export const buttonSizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
} as const;

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: keyof typeof buttonStyles;
  size?: keyof typeof buttonSizes;
  withArrow?: boolean;
  children: ReactNode;
};

/** Anchor-styled button (links only — forms use their own <button>s). */
export function Button({
  variant = "primary",
  size = "md",
  withArrow = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <a className={cn(base, buttonStyles[variant], buttonSizes[size], className)} {...rest}>
      {children}
      {withArrow && <ArrowUpRight />}
    </a>
  );
}
