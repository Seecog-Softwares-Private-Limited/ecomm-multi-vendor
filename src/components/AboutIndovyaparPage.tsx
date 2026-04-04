"use client";

import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import {
  ShoppingBag,
  TrendingUp,
  Shield,
  Lock,
  Package,
  Award,
  Check,
  Target,
  Zap,
  Heart,
  Users,
} from "lucide-react";
import { TopBar } from "./TopBar";
import { Navbar } from "./Navbar";
import { CategoryNav } from "./CategoryNav";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

/** Brand orange — aligns with primary UI */
const orange = "#FF6A00";
/** Deep forest for seller CTA band and accent bar */
const forest = "#1B4332";
/** Cream hero “Who we are” */
const cream = "#FFF9F1";
/** Peach section behind Why Choose Us card */
const peach = "#FFF5EC";
const charcoal = "#2B2B2B";
const bodyMuted = "rgba(43,43,43,0.85)";

/** Full hero banner export (copy + CTA in artwork) — `public/about/hero-indo.png` */
const HERO_IMAGE = "/about/hero-indo.png";
/** Who We Are graphic with orange accents + rounded photo — `public/about/who-collaboration.png` */
const WHO_BANNER_IMAGE = "/about/who-collaboration.png";

function DisplayTitle({
  children,
  className = "",
  as: Tag = "h2",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
  style?: React.CSSProperties;
}) {
  return (
    <Tag
      className={`${display.className} font-semibold tracking-tight ${className}`}
      style={style}
    >
      {children}
    </Tag>
  );
}

export function AboutIndovyaparPage() {
  return (
    <div className="min-h-screen w-full bg-white" style={{ fontFamily: "var(--font-manrope), sans-serif" }}>
      <TopBar />
      <Navbar />
      <CategoryNav />

      {/* 1. Hero — supplied full-width asset (headline, subcopy & button are in the artwork) */}
      <section className="relative w-full bg-neutral-900">
        <h1 className="sr-only">
          Everything You Need. All in One Marketplace. Connecting buyers and sellers through a seamless,
          trusted, and scalable digital platform.
        </h1>
        <Link
          href="/category/deals"
          className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
          aria-label="Explore products — Indovyapar marketplace"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGE}
            alt="Indovyapar — Everything You Need. All in One Marketplace."
            className="block h-auto w-full"
            loading="eager"
            decoding="async"
          />
        </Link>
      </section>

      {/* 2. Who We Are — supplied graphic includes orange circles + rounded photo treatment */}
      <section className="py-16 md:py-24" style={{ background: cream }}>
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-4 lg:grid-cols-2 lg:gap-x-14 lg:gap-y-12">
          <div className="order-2 flex max-w-xl flex-col gap-8 lg:order-1 lg:justify-center">
            <DisplayTitle as="h2" className="text-4xl leading-none md:text-5xl" style={{ color: orange }}>
              Who We Are
            </DisplayTitle>
            <div className="flex flex-col gap-5 text-base leading-7 sm:text-lg sm:leading-8" style={{ color: charcoal }}>
              <p style={{ color: bodyMuted }}>
                We are a modern online marketplace built to simplify the way people buy and sell. Our platform
                brings together a wide range of products from trusted sellers, offering customers convenience,
                variety, and competitive pricing — all in one place.
              </p>
              <p style={{ color: bodyMuted }}>
                We aim to empower businesses of all sizes by providing them with the tools and reach needed to
                grow in a digital-first world.
              </p>
            </div>
          </div>

          <div className="order-1 flex w-full justify-center lg:order-2 lg:justify-end">
            <div className="w-full max-w-[min(100%,560px)] lg:max-w-[600px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={WHO_BANNER_IMAGE}
                alt="Two colleagues collaborating at a modern office desk"
                className="block h-auto w-full"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mission & Vision — light gray */}
      <section className="bg-[#F4F4F4] py-16 md:py-20">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-4 md:flex-row md:justify-center md:gap-10">
          <article
            className="flex-1 rounded-[20px] bg-white p-8 shadow-md md:max-w-[620px]"
            style={{
              boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.08), 0px 4px 6px -4px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex flex-col gap-6">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-[14px] sm:h-16 sm:w-16"
                style={{ background: "#166534" }}
              >
                <Target className="h-8 w-8 text-white" strokeWidth={2} />
              </div>
              <DisplayTitle as="h3" className="text-2xl md:text-[1.75rem]" style={{ color: orange }}>
                Our Mission
              </DisplayTitle>
              <p className="text-base leading-7 sm:text-lg sm:leading-8" style={{ color: bodyMuted }}>
                To create a reliable and accessible marketplace that connects customers with quality products
                while enabling sellers to scale their businesses efficiently.
              </p>
            </div>
          </article>

          <article
            className="flex-1 rounded-[20px] bg-white p-8 shadow-md md:max-w-[620px]"
            style={{
              boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.08), 0px 4px 6px -4px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex flex-col gap-6">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-[14px] sm:h-16 sm:w-16"
                style={{ background: "#2563EB" }}
              >
                <Zap className="h-8 w-8 text-white" strokeWidth={2} />
              </div>
              <DisplayTitle as="h3" className="text-2xl md:text-[1.75rem]" style={{ color: orange }}>
                Our Vision
              </DisplayTitle>
              <p className="text-base leading-7 sm:text-lg sm:leading-8" style={{ color: bodyMuted }}>
                To become a leading marketplace platform known for trust, innovation, and a seamless shopping
                experience across categories.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* 4. What We Offer — white, 2×3 grid */}
      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-[1100px] px-4">
          <DisplayTitle
            as="h2"
            className="mb-12 text-center text-4xl leading-none md:mb-14 md:text-5xl"
            style={{ color: orange }}
          >
            What We Offer
          </DisplayTitle>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {[
              { icon: ShoppingBag, title: "Wide Product Range" },
              { icon: TrendingUp, title: "Verified Sellers" },
              { icon: Shield, title: "Competitive Pricing" },
              { icon: Lock, title: "Secure Transactions" },
              { icon: Package, title: "Fast & Reliable Delivery" },
              { icon: Award, title: "Dedicated Customer Support" },
            ].map(({ icon: Icon, title }) => (
              <div
                key={title}
                className="flex flex-col items-center gap-5 rounded-2xl border border-neutral-200 bg-white px-6 py-8 text-center shadow-sm transition hover:border-neutral-300"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-[14px]"
                  style={{ background: orange }}
                >
                  <Icon className="h-7 w-7 text-white" strokeWidth={2} />
                </div>
                <DisplayTitle as="h3" className="max-w-[220px] text-lg leading-snug" style={{ color: charcoal }}>
                  {title}
                </DisplayTitle>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Choose Us — peach outer, white card */}
      <section className="py-16 md:py-20" style={{ background: peach }}>
        <div className="mx-auto max-w-[720px] px-4">
          <div
            className="rounded-[20px] bg-white px-6 py-10 shadow-md sm:px-10 sm:py-14"
            style={{
              boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.08), 0px 4px 6px -4px rgba(0,0,0,0.06)",
            }}
          >
            <div className="flex flex-col items-center gap-10">
              <DisplayTitle as="h2" className="text-center text-3xl md:text-4xl" style={{ color: orange }}>
                Why Choose Us
              </DisplayTitle>
              <div className="grid w-full max-w-[540px] gap-x-10 gap-y-5 sm:grid-cols-2 sm:gap-y-6">
                <ul className="flex flex-col gap-5">
                  {[
                    "One platform for multiple categories",
                    "Easy returns & support",
                    "Continuous innovation",
                  ].map((text) => (
                    <li key={text} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{ background: "#166534" }}
                      >
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                      </span>
                      <span className="text-left text-base leading-6" style={{ color: charcoal }}>
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
                <ul className="flex flex-col gap-5">
                  {["Trusted seller network", "Transparent pricing"].map((text) => (
                    <li key={text} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{ background: "#166534" }}
                      >
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                      </span>
                      <span className="text-left text-base leading-6" style={{ color: charcoal }}>
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Grow Your Business — forest green (large display type + readable subcopy) */}
      <section className="py-20 md:py-28" style={{ background: forest }}>
        <div className="mx-auto flex max-w-[920px] flex-col items-center gap-10 px-4 text-center md:gap-12">
          <DisplayTitle
            as="h2"
            className="text-[2rem] font-bold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.25rem]"
          >
            Grow Your Business With Us
          </DisplayTitle>
          <p
            className={`${display.className} max-w-[720px] text-lg font-medium leading-relaxed text-white/95 sm:text-xl md:text-2xl md:leading-snug`}
          >
            Join our marketplace and reach a larger audience. We provide tools, insights, and support to help
            you scale your business and maximize your potential.
          </p>
          <Link
            href="/vendor/register"
            className={`${display.className} inline-flex items-center justify-center rounded-[14px] px-10 py-4 text-lg font-semibold shadow-lg transition hover:opacity-95 md:px-12 md:py-4 md:text-xl`}
            style={{
              background: "rgba(255,255,255,0.98)",
              color: "#D97706",
              boxShadow: "0px 10px 25px -5px rgba(0,0,0,0.2)",
            }}
          >
            Start Selling
          </Link>
        </div>
      </section>

      {/* 7. Our Core Values — white section, cream value tiles */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <DisplayTitle
            as="h2"
            className="mb-14 text-center text-[2rem] font-bold leading-[1.1] sm:text-4xl md:mb-16 md:text-5xl lg:text-[3.25rem]"
            style={{ color: orange }}
          >
            Our Core Values
          </DisplayTitle>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-5">
            {[
              { icon: Heart, label: "Customer First" },
              { icon: Target, label: "Trust & Transparency" },
              { icon: Users, label: "Innovation" },
              { icon: Shield, label: "Growth for All" },
              { icon: Zap, label: "Accountability" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex min-h-[200px] flex-col items-center justify-center gap-6 rounded-2xl px-6 py-10 sm:min-h-[220px] md:py-12"
                style={{ background: cream }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md md:h-[72px] md:w-[72px]">
                  <Icon className="h-8 w-8 md:h-9 md:w-9" style={{ color: orange }} strokeWidth={2} />
                </div>
                <DisplayTitle
                  as="h3"
                  className="text-center text-lg font-semibold leading-snug md:text-xl"
                  style={{ color: charcoal }}
                >
                  {label}
                </DisplayTitle>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Join marketplace — gradient + forest strip (before footer) */}
      <section className="overflow-hidden">
        <div
          className="py-20 md:py-28"
          style={{
            background: "linear-gradient(90deg, #FF6A00 0%, #FF7A1A 35%, #FF9A3C 70%, #FFB84D 100%)",
          }}
        >
          <div className="mx-auto flex max-w-[920px] flex-col items-center gap-10 px-4 text-center md:gap-12">
            <DisplayTitle
              as="h2"
              className="text-[2rem] font-bold leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.25rem]"
            >
              Join Our Growing Marketplace
            </DisplayTitle>
            <p
              className={`${display.className} max-w-[680px] text-lg font-medium leading-relaxed text-white/95 sm:text-xl md:text-2xl md:leading-snug`}
            >
              Whether you&apos;re here to shop or sell, we&apos;re here to make your experience seamless.
            </p>
            <Link
              href="/vendor/register"
              className={`${display.className} inline-flex items-center justify-center rounded-[14px] px-10 py-4 text-lg font-semibold shadow-lg transition hover:opacity-95 md:text-xl`}
              style={{
                background: "rgba(255,255,255,0.98)",
                color: orange,
              }}
            >
              Become a Seller
            </Link>
          </div>
        </div>
        <div className="h-3 w-full shrink-0" style={{ background: forest }} aria-hidden />
      </section>
    </div>
  );
}
