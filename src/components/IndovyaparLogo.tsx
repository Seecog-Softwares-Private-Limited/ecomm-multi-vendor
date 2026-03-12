"use client";

const LOGO_ORANGE = "#FF5400";
const LOGO_GREEN_DARK = "#166534";
const LOGO_GREEN_LIGHT = "#22c55e";

export type IndovyaparLogoProps = {
  /** Use "light" on dark/gradient backgrounds so "vyapar" is visible */
  variant?: "default" | "light";
  /** Inline for use inside a paragraph (e.g. footer copyright) */
  inline?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Override font size; default from style or 26 */
  fontSize?: number;
};

export function IndovyaparLogo({
  variant = "default",
  inline = false,
  className,
  style,
  fontSize,
}: IndovyaparLogoProps) {
  const green = variant === "light" ? LOGO_GREEN_LIGHT : LOGO_GREEN_DARK;
  const baseStyle: React.CSSProperties = {
    fontFamily: "'Katibeh', cursive",
    fontWeight: 400,
    lineHeight: "32px",
    ...(fontSize !== undefined && { fontSize }),
    ...style,
  };

  const content = (
    <>
      <span style={{ ...baseStyle, color: LOGO_ORANGE }}>Indo</span>
      <span style={{ ...baseStyle, color: green }}>vyapar</span>
    </>
  );

  if (inline) {
    return (
      <span className={className} style={baseStyle}>
        {content}
      </span>
    );
  }

  return (
    <span className={className} style={baseStyle}>
      {content}
    </span>
  );
}
