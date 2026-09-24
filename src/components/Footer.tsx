"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { IndovyaparLogo } from "./IndovyaparLogo";
import { CMS_FOOTER_SECTIONS, cmsFooterPublicPath } from "@/lib/cms-footer-pages";
import { useAppMode } from "@/contexts/AppModeContext";

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.seecogg.indovyapar";
const APP_STORE_URL =
  "https://apps.apple.com/in/app/indovyapar/id6764801670";

function GooglePlayIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3.6 1.8c-.3.2-.5.6-.5 1.1v18.2c0 .5.2.9.5 1.1l.1.1 10.2-10.2v-.2L3.7 1.7l-.1.1z"
        fill="#00D3FF"
      />
      <path
        d="M16.1 14.4l-2.2-2.2v-.4l2.2-2.2.1.1 2.6 1.5c.7.4.7 1.1 0 1.5l-2.6 1.5-.1.2z"
        fill="#FFD400"
      />
      <path
        d="M16.2 14.5L13.9 12.3 3.6 22.6c.4.4 1 .5 1.6.1l11-6.2z"
        fill="#F83A3A"
      />
      <path
        d="M16.2 9.5L5.2 3.3C4.6 2.9 4 3 3.6 3.4l10.3 10.3 2.3-2.2z"
        fill="#00F076"
      />
    </svg>
  );
}

function AppleLogoIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#FFFFFF"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

const storeBadgeStyle: CSSProperties = {
  height: 46,
  background: "#1E2939",
  borderRadius: 9,
  textDecoration: "none",
};

export function Footer() {
  const { isAppMode } = useAppMode();

  if (isAppMode) return null;

  return (
    <footer
      className="w-full"
      style={{ background: "#1E5128" }}
    >
      <div
        className="mx-auto max-w-[1440px] px-4 sm:px-6"
        style={{ paddingTop: 28 }}
      >
        {/* Top 4-column links */}
        <div className="grid grid-cols-2 gap-6 pb-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 lg:pb-10">
          {CMS_FOOTER_SECTIONS.map((col) => (
            <div key={col.id} className="flex flex-col gap-3.5">
              <h3
                style={{
                  fontFamily: "'Nunito', 'Manrope', sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  lineHeight: "23px",
                  color: "#FFFFFF",
                }}
              >
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.pages.map((page) => (
                  <li key={page.slug}>
                    <Link
                      href={cmsFooterPublicPath(page.slug)}
                      style={{
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 400,
                        fontSize: 12,
                        lineHeight: "18px",
                        color: "#F4F4F4",
                        textDecoration: "none",
                      }}
                    >
                      {page.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: "0.94px solid #F4F4F4" }} />

        {/* Bottom bar */}
        <div
          className="flex flex-col items-start justify-between gap-6 py-6 sm:flex-row sm:items-center sm:py-8"
        >
          {/* Download App */}
          <div className="flex flex-col gap-3">
            <h4
              style={{
                fontFamily: "'Nunito', 'Manrope', sans-serif",
                fontWeight: 800,
                fontSize: 14,
                lineHeight: "21px",
                color: "#FFFFFF",
              }}
            >
              Download Our App
            </h4>
            <div className="flex flex-wrap gap-3">
              {/* Google Play */}
              <a
                href={GOOGLE_PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get IndoVyapar on Google Play"
                className="flex min-w-[132px] flex-row items-center gap-2 px-3 sm:px-4"
                style={storeBadgeStyle}
              >
                <GooglePlayIcon size={22} />
                <div className="flex flex-col items-start">
                  <span
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 500,
                      fontSize: 8,
                      lineHeight: "14px",
                      color: "#F4F4F4",
                      letterSpacing: "0.04em",
                    }}
                  >
                    GET IT ON
                  </span>
                  <span
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 700,
                      fontSize: 11,
                      lineHeight: "18px",
                      color: "#FFFFFF",
                    }}
                  >
                    Google Play
                  </span>
                </div>
              </a>

              {/* App Store */}
              <a
                href={APP_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download IndoVyapar on the App Store"
                className="flex min-w-[132px] flex-row items-center gap-2 px-3 sm:px-4"
                style={storeBadgeStyle}
              >
                <AppleLogoIcon size={22} />
                <div className="flex flex-col items-start">
                  <span
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 500,
                      fontSize: 8,
                      lineHeight: "14px",
                      color: "#F4F4F4",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Download on the
                  </span>
                  <span
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 700,
                      fontSize: 11,
                      lineHeight: "18px",
                      color: "#FFFFFF",
                    }}
                  >
                    App Store
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex w-full flex-col gap-3 sm:w-auto">
            <h4
              style={{
                fontFamily: "'Nunito', 'Manrope', sans-serif",
                fontWeight: 800,
                fontSize: 14,
                lineHeight: "21px",
                color: "#FFFFFF",
              }}
            >
              Connect With Us
            </h4>
            <div className="flex flex-row gap-3 sm:gap-4">
              {[
                { Icon: Facebook, label: "Facebook" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Instagram, label: "Instagram" },
                { Icon: Youtube, label: "Youtube" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="flex items-center justify-center"
                  style={{
                    width: 34,
                    height: 34,
                    background: "#1E2939",
                    borderRadius: "50%",
                  }}
                  aria-label={label}
                >
                  <Icon size={17} color="#D1D5DC" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div
          className="flex items-center justify-center pb-6"
          style={{ borderTop: "0.94px solid rgba(244,244,244,0.2)" }}
        >
          <p
            className="text-center"
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 400,
              fontSize: 12,
              lineHeight: "18px",
              color: "rgba(244,244,244,0.7)",
              marginTop: 16,
            }}
          >
            © 2026 <IndovyaparLogo variant="light" inline style={{ fontSize: 13, lineHeight: "20px" }} />. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
