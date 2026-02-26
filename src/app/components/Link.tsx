"use client";

import NextLink from "next/link";
import * as React from "react";

export type LinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export function Link({ href, children, className, onClick }: LinkProps) {
  return (
    <NextLink href={href} className={className ?? undefined} onClick={onClick}>
      {children}
    </NextLink>
  );
}
