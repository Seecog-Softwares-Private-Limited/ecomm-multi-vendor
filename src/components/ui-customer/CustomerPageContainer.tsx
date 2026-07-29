import type { ReactNode } from "react";

type CustomerPageContainerProps = {
  children: ReactNode;
  variant?: "default" | "account" | "narrow";
  className?: string;
};

export function CustomerPageContainer({
  children,
  variant = "default",
  className = "",
}: CustomerPageContainerProps) {
  const base =
    variant === "account"
      ? "iv-page-account"
      : variant === "narrow"
        ? "mx-auto w-full max-w-3xl px-3 sm:px-6"
        : "iv-page";

  return <div className={`${base} py-5 sm:py-8 ${className}`}>{children}</div>;
}
