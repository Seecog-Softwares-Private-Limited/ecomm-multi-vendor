"use client";

import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import {
  LayoutGrid,
  BadgeCheck,
  IndianRupee,
  ShieldCheck,
  Truck,
  Headphones,
  Check,
  Target,
  Eye,
  Heart,
  Shield,
  Lightbulb,
  TrendingUp,
  Scale,
} from "lucide-react";
import { TopBar } from "./TopBar";
import { Navbar } from "./Navbar";
import { CategoryNav } from "./CategoryNav";
import { Footer } from "./Footer";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const orange = "#FF6A00";
const forest = "#1E5128";
const beige = "#FFF3E8";
const charcoal = "#2B2B2B";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1920&q=80";

const WHO_IMAGE =
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1240&q=80";

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

      {/* Hero */}
      <section className="relative flex min-h-[420px] items-center justify-center sm:min-h-[500px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 mx-auto flex max-w-[777px] flex-col items-center gap-6 px-4 py-16 text-center sm:gap-8">
          <h1
            className={`${display.className} flex flex-col gap-2 text-[2.5rem] font-semibold leading-none tracking-tight sm:text-5xl md:text-[4.5rem] md:leading-none sm:gap-2.5`}
          >
            <span className="text-white">Everything You Need.</span>
            <span style={{ color: orange }}>All in One Marketplace.</span>
          </h1>
          <p className="max-w-[643px] text-base leading-7 text-white sm:text-xl sm:leading-7">
            Welcome to Indovyapar – where quality meets convenience. Shop trusted sellers, fast delivery, and
            secure checkout across electronics, fashion, home, and more.
          </p>
          <Link
            href="/category/deals"
            className="inline-flex items-center justify-center rounded-[10px] px-5 py-2.5 text-lg font-medium shadow transition hover:opacity-95"
            style={{
              background: "rgba(255,255,255,0.95)",
              color: orange,
              boxShadow:
                "0px 9.39px 14.08px -2.82px rgba(0,0,0,0.1), 0px 3.75px 5.63px -3.75px rgba(0,0,0,0.1)",
            }}
          >
            Explore Products
          </Link>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-[#F4F4F4] py-14 md:py-16">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-4 md:flex-row md:justify-center md:gap-10">
          <article
            className="flex-1 rounded-2xl bg-white p-8 shadow-md md:max-w-[620px]"
            style={{
              boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)",
            }}
          >
            <div className="mb-5 flex flex-col gap-5">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, #1E5128 0%, #256532 50%, #2D7A3D 100%)",
                }}
              >
                <Target className="h-8 w-8 text-white" strokeWidth={2} />
              </div>
              <div className="flex flex-col gap-5">
                <DisplayTitle as="h3" className="text-2xl leading-9 md:text-[30px] md:leading-9" style={{ color: orange }}>
                  Our Mission
                </DisplayTitle>
                <p className="text-lg leading-7" style={{ color: "rgba(43,43,43,0.8)" }}>
                  To empower millions of buyers and sellers by providing a transparent, reliable marketplace
                  with fair prices, verified partners, and support you can count on.
                </p>
              </div>
            </div>
          </article>

          <article
            className="flex-1 rounded-2xl bg-white p-8 shadow-md md:max-w-[620px]"
            style={{
              boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)",
            }}
          >
            <div className="mb-5 flex flex-col gap-5">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, #2F6BFF 0%, #457BFF 50%, #5A8AFF 100%)",
                }}
              >
                <Eye className="h-8 w-8 text-white" strokeWidth={2} />
              </div>
              <div className="flex flex-col gap-5">
                <DisplayTitle as="h3" className="text-2xl leading-9 md:text-[30px] md:leading-9" style={{ color: orange }}>
                  Our Vision
                </DisplayTitle>
                <p className="text-lg leading-7" style={{ color: "rgba(43,43,43,0.8)" }}>
                  To become India&apos;s most trusted digital commerce platform—where every purchase feels
                  simple, every seller feels supported, and communities grow together.
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Who we are */}
      <section className="py-14 md:py-20" style={{ background: beige }}>
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-10 px-4 lg:flex-row lg:gap-10">
          <div className="flex max-w-[620px] flex-1 flex-col gap-8 lg:gap-10">
            <DisplayTitle as="h2" className="text-4xl leading-none text-[#FF6A00] md:text-5xl">
              Who We Are
            </DisplayTitle>
            <div className="flex flex-col gap-2.5 text-lg leading-7 text-black">
              <p>
                Indovyapar is a next-generation digital marketplace built for how India shops today—from
                metro cities to growing towns. We connect customers with curated sellers across categories,
                with clear policies and technology that puts you first.
              </p>
              <p>
                Our team is focused on selection, speed, and service: easy discovery, secure payments, and
                help when you need it—so you spend less time worrying and more time enjoying what you buy.
              </p>
            </div>
          </div>

          <div className="relative w-full max-w-[620px] flex-1">
            <div
              className="pointer-events-none absolute -left-8 -top-8 hidden h-40 w-40 rounded-full md:block"
              style={{ background: orange }}
            />
            <div
              className="pointer-events-none absolute -bottom-10 -right-6 hidden h-40 w-40 rounded-full md:block"
              style={{ background: orange, transform: "scaleY(-1)" }}
            />
            <div
              className="relative z-[1] aspect-[31/18] w-full overflow-hidden rounded-[32px] border border-black/5 bg-gray-200 shadow-lg"
              style={{ minHeight: 200 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={WHO_IMAGE} alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-[720px] px-4 text-center lg:max-w-[682px]">
          <DisplayTitle as="h2" className="mb-8 text-4xl leading-none text-[#FF6A00] md:mb-10 md:text-5xl">
            What We Offer
          </DisplayTitle>
          <div className="flex flex-col gap-8 md:gap-10">
            <div className="flex flex-wrap justify-center gap-4 md:gap-5">
              {[
                { icon: LayoutGrid, title: "Wide Product Range" },
                { icon: BadgeCheck, title: "Verified Sellers" },
                { icon: IndianRupee, title: "Competitive Pricing" },
              ].map(({ icon: Icon, title }) => (
                <div
                  key={title}
                  className="flex w-[200px] flex-col items-center gap-4 rounded-2xl border border-[#CDCDCD] bg-white p-3 sm:w-[214px]"
                >
                  <div className="flex flex-col items-center gap-4 py-1">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-[14px]"
                      style={{ background: orange }}
                    >
                      <Icon className="h-7 w-7 text-white" strokeWidth={2} />
                    </div>
                    <DisplayTitle as="h3" className="text-lg leading-7 text-center" style={{ color: charcoal }}>
                      {title}
                    </DisplayTitle>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-5">
              {[
                { icon: ShieldCheck, title: "Secure Transactions" },
                { icon: Truck, title: "Fast & Reliable Delivery" },
                { icon: Headphones, title: "Dedicated Customer Support" },
              ].map(({ icon: Icon, title }) => (
                <div
                  key={title}
                  className="flex w-[200px] flex-col items-center gap-4 rounded-2xl border border-[#CDCDCD] bg-white p-3 sm:w-[214px]"
                >
                  <div className="flex flex-col items-center gap-4 py-1">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-[14px]"
                      style={{ background: orange }}
                    >
                      <Icon className="h-7 w-7 text-white" strokeWidth={2} />
                    </div>
                    <DisplayTitle as="h3" className="text-lg leading-7 text-center" style={{ color: charcoal }}>
                      {title}
                    </DisplayTitle>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-14 md:py-16" style={{ background: beige }}>
        <div className="mx-auto max-w-[660px] px-4">
          <div
            className="rounded-2xl bg-white px-6 py-10 shadow-lg sm:px-10 sm:py-12"
            style={{
              boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -4px rgba(0,0,0,0.1)",
            }}
          >
            <div className="flex flex-col items-center gap-8 md:gap-10">
              <DisplayTitle as="h2" className="text-center text-4xl leading-none text-[#FF6A00] md:text-5xl">
                Why Choose Us
              </DisplayTitle>
              <div className="flex w-full flex-col gap-6 md:flex-row md:justify-center md:gap-16 lg:gap-20">
                <ul className="flex flex-col gap-4 md:gap-5">
                  {[
                    "One platform for multiple categories",
                    "Easy returns & support",
                    "Continuous innovation",
                  ].map((text) => (
                    <li key={text} className="flex items-center gap-2.5">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{
                          background:
                            "linear-gradient(135deg, #1E5128 0%, #246231 50%, #2D7A3D 100%)",
                        }}
                      >
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                      </span>
                      <span className="text-base leading-6" style={{ color: charcoal }}>
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
                <ul className="flex flex-col gap-4 md:gap-5">
                  {["Trusted seller network", "Transparent pricing"].map((text) => (
                    <li key={text} className="flex items-center gap-2.5">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                        style={{
                          background:
                            "linear-gradient(135deg, #1E5128 0%, #246231 50%, #2D7A3D 100%)",
                        }}
                      >
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                      </span>
                      <span className="text-base leading-6" style={{ color: charcoal }}>
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

      {/* Grow your business */}
      <section className="py-16 md:py-20" style={{ background: forest }}>
        <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-5 px-4 text-center">
          <div className="flex flex-col gap-4 md:gap-5">
            <DisplayTitle as="h2" className="text-4xl leading-none text-white md:text-5xl">
              Grow Your Business With Us
            </DisplayTitle>
            <p className="text-lg leading-7 text-white">
              List your catalogue, reach new buyers, and scale with tools built for modern sellers on
              Indovyapar.
            </p>
          </div>
          <Link
            href="/vendor/register"
            className="inline-flex items-center justify-center rounded-[14px] px-5 py-2.5 text-lg font-medium"
            style={{
              background: "rgba(255,255,255,0.95)",
              color: orange,
              boxShadow:
                "0px 9.39px 14.08px -2.82px rgba(0,0,0,0.1), 0px 3.75px 5.63px -3.75px rgba(0,0,0,0.1)",
            }}
          >
            Start Selling
          </Link>
        </div>
      </section>

      {/* Core values */}
      <section className="py-14 md:py-16">
        <div className="mx-auto max-w-[1280px] px-4">
          <DisplayTitle
            as="h2"
            className="mb-8 text-center text-4xl leading-none text-[#FF6A00] md:mb-10 md:text-5xl"
          >
            Our Core Values
          </DisplayTitle>
          <div className="flex flex-wrap justify-center gap-4 md:justify-between md:gap-5">
            {[
              { icon: Heart, label: "Customer First" },
              { icon: Shield, label: "Trust & Transparency" },
              { icon: Lightbulb, label: "Innovation" },
              { icon: TrendingUp, label: "Growth for All" },
              { icon: Scale, label: "Accountability" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex w-[200px] flex-col items-center gap-4 rounded-[14px] py-6 sm:w-[234px]"
                style={{ background: beige }}
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-white shadow-md"
                  style={{
                    boxShadow: "0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)",
                  }}
                >
                  <Icon className="h-7 w-7" style={{ color: orange }} strokeWidth={2} />
                </div>
                <DisplayTitle as="h3" className="text-center text-lg leading-7" style={{ color: charcoal }}>
                  {label}
                </DisplayTitle>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join CTA gradient */}
      <section
        className="py-16 md:py-20"
        style={{
          background:
            "linear-gradient(135deg, #FF6A00 0%, #FF812F 45%, #FFA03C 75%, #FFC247 100%)",
        }}
      >
        <div className="mx-auto flex max-w-[711px] flex-col items-center gap-5 px-4 text-center">
          <div className="flex flex-col gap-4 md:gap-5">
            <DisplayTitle as="h2" className="text-4xl leading-none text-white md:text-5xl">
              Join Our Growing Marketplace
            </DisplayTitle>
            <p className="text-lg leading-7 text-white">
              Whether you shop or sell, Indovyapar is built to help you win—every day.
            </p>
          </div>
          <Link
            href="/vendor/register"
            className="inline-flex items-center justify-center rounded-[14px] px-5 py-2.5 text-lg font-medium"
            style={{
              background: "rgba(255,255,255,0.95)",
              color: orange,
              boxShadow:
                "0px 9.39px 14.08px -2.82px rgba(0,0,0,0.1), 0px 3.75px 5.63px -3.75px rgba(0,0,0,0.1)",
            }}
          >
            Become a Seller
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
