import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface ProductRowSectionProps {
  title: string;
  ctaLabel: string;
  ctaHref?: string;
  products: { src: string; alt: string; href?: string }[];
  bgColor?: string;
}

export function ProductRowSection({
  title,
  ctaLabel,
  products,
  ctaHref,
  bgColor = "#FFFFFF",
}: ProductRowSectionProps) {
  return (
    <div className="w-full" style={{ background: bgColor }}>
      <div className="mx-auto flex flex-col gap-4 py-8 px-4 sm:px-6 max-w-[1440px]">
        {/* Title */}
        <p
          style={{
            fontFamily: "'Nunito','Manrope',sans-serif",
            fontWeight: 800,
            fontSize: 18,
            lineHeight: "34px",
            color: "#2B2B2B",
          }}
        >
          {title}
        </p>

        {/* 5 product images in a row */}
        <div className="flex flex-row gap-6">
          {products.map((p, i) => (
            <Link
              key={i}
              href={p.href ?? "#"}
              onClick={(e) => {
                if (p.href) return;
                e.preventDefault();
              }}
              className="flex-1 overflow-hidden block"
              style={{ borderRadius: 12, aspectRatio: "1" }}
              aria-label={p.alt}
              title={p.alt}
            >
              <img
                src={p.src}
                alt={p.alt}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                style={{ borderRadius: 12 }}
              />
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link
          href={ctaHref ?? "#"}
          onClick={(e) => {
            if (ctaHref) return;
            e.preventDefault();
          }}
          className="flex flex-row items-center gap-1.5 self-start"
          style={{
            padding: "9px 17px",
            background: "rgba(255,255,255,0.95)",
            boxShadow:
              "0px 9.39px 14.08px -2.82px rgba(0,0,0,0.1), 0px 3.75px 5.63px -3.75px rgba(0,0,0,0.1)",
            borderRadius: 9,
            border: "1px solid #FF6A00",
          }}
        >
          <span
            style={{
              fontFamily: "'Manrope',sans-serif",
              fontWeight: 500,
              fontSize: 18,
              color: "#FF6A00",
            }}
          >
            {ctaLabel}
          </span>
          <ArrowRight size={15} color="#FF6A00" />
        </Link>
      </div>
    </div>
  );
}
