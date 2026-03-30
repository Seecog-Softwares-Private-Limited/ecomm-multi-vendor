"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { Space_Grotesk } from "next/font/google";
import { Send, Users, Award, PartyPopper, ChevronRight, X } from "lucide-react";
import { TopBar } from "./TopBar";
import { Navbar } from "./Navbar";
import { CategoryNav } from "./CategoryNav";
import { Footer } from "./Footer";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const orange = "#FF6A00";
const beige = "#FFF3E8";
const forest = "#1E5128";
const charcoal = "#2B2B2B";

const HERO_IMAGE = "/careers-hero.png";

const WHY_MAIN =
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=960&q=80";
const WHY_INSET =
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=640&q=80";

const CAREERS_EMAIL = "careers@indovyapar.com";

export type CareerOpeningCard = {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  /** Plain text from admin; optional. */
  description?: string | null;
};

function DisplayHeading({
  children,
  className = "",
  as: Tag = "h2",
  style,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
  style?: React.CSSProperties;
  id?: string;
}) {
  return (
    <Tag
      id={id}
      className={`${display.className} font-semibold tracking-tight ${className}`}
      style={style}
    >
      {children}
    </Tag>
  );
}

function JobDetailModal({
  email,
  job,
  onClose,
}: {
  email: string;
  job: CareerOpeningCard;
  onClose: () => void;
}) {
  const desc = job.description?.trim() ?? "";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="presentation"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/45" aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-detail-title"
        className="relative z-[1] flex max-h-[min(90vh,700px)] w-full max-w-lg flex-col rounded-2xl border bg-white shadow-xl"
        style={{ borderColor: orange }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b px-5 py-4" style={{ borderColor: `${orange}55` }}>
          <DisplayHeading as="h2" id="job-detail-title" className="text-xl leading-snug text-black md:text-2xl pr-2">
            {job.title}
          </DisplayHeading>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-4 flex flex-col gap-1.5 text-base leading-6 text-black">
            <p>
              <span className="font-medium">Department:</span> {job.department}
            </p>
            <p>
              <span className="font-medium">Location:</span> {job.location}
            </p>
            <p>
              <span className="font-medium">Employment type:</span> {job.employmentType}
            </p>
          </div>
          <DisplayHeading as="h3" className="mb-2 text-lg" style={{ color: orange }}>
            About this role
          </DisplayHeading>
          {desc ? (
            <p className="whitespace-pre-wrap text-base leading-7 text-black" style={{ color: "rgba(43,43,43,0.92)" }}>
              {desc}
            </p>
          ) : (
            <p className="text-base leading-7 text-slate-500">
              No detailed description has been added for this role yet. You can still apply using the button below.
            </p>
          )}
        </div>
        <div className="border-t px-5 py-4" style={{ borderColor: `${orange}55` }}>
          <a
            href={`mailto:${email}?subject=${encodeURIComponent("Application — " + job.title)}`}
            className="inline-flex h-11 w-full items-center justify-center rounded-[10px] border text-lg font-medium transition hover:opacity-95 sm:w-auto sm:min-w-[140px] sm:px-6"
            style={{
              background: "rgba(255,255,255,0.95)",
              borderColor: orange,
              color: orange,
              boxShadow: "2px 4px 5px -2.8px rgba(0,0,0,0.1)",
            }}
          >
            Apply now
          </a>
        </div>
      </div>
    </div>
  );
}

export function CareersPage({ openings }: { openings: CareerOpeningCard[] }) {
  const [detailJob, setDetailJob] = useState<CareerOpeningCard | null>(null);
  const closeDetail = useCallback(() => setDetailJob(null), []);

  return (
    <div className="min-h-screen w-full bg-white" style={{ fontFamily: "var(--font-manrope), sans-serif" }}>
      <TopBar />
      <Navbar />
      <CategoryNav />

      {/* Hero — full-width supplied artwork (type + CTA in the image) */}
      <section className="relative w-full bg-neutral-900">
        <h1 className="sr-only">
          Build Your Career With Us. Be part of a growing marketplace that&apos;s shaping the future of online
          commerce.
        </h1>
        <a
          href="#openings"
          className="block w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
          aria-label="View open positions"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGE}
            alt="Build your career with us at Indovyapar"
            className="block h-auto w-full"
            loading="eager"
            decoding="async"
          />
        </a>
      </section>

      {/* Why work with us */}
      <section className="py-14 md:py-20" style={{ background: beige }}>
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-10 px-4 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="relative h-[360px] w-full max-w-[620px] shrink-0 lg:h-[438px]">
            <div
              className="pointer-events-none absolute right-8 top-1/3 hidden h-[150px] w-[150px] rounded-full md:block lg:right-12"
              style={{ background: orange }}
            />
            <div
              className="pointer-events-none absolute bottom-10 left-1/3 hidden h-[150px] w-[150px] rounded-full md:block"
              style={{ background: orange, transform: "scaleY(-1)" }}
            />
            <div
              className="absolute left-0 top-0 z-[1] h-[220px] w-[85%] max-w-[478px] overflow-hidden rounded-2xl border sm:h-[240px]"
              style={{ borderColor: orange }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={WHY_MAIN} alt="" className="h-full w-full object-cover" />
            </div>
            <div
              className="absolute bottom-0 right-0 z-[2] h-[160px] w-[55%] max-w-[294px] overflow-hidden rounded-2xl border sm:h-[220px]"
              style={{ borderColor: orange, transform: "scaleX(-1)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={WHY_INSET} alt="" className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="flex max-w-[620px] flex-1 flex-col gap-8 lg:gap-10">
            <DisplayHeading className="text-4xl leading-none md:text-5xl" style={{ color: orange }}>
              Why Work With Us
            </DisplayHeading>
            <div className="flex flex-col gap-2.5 text-lg leading-7 text-black">
              <p>
                Indovyapar is a next-generation digital marketplace solving real problems for buyers and
                sellers. You&apos;ll work with people who care about craft, ownership, and measurable impact.
              </p>
              <p>
                We invest in learning, equip you with modern tools, and celebrate diverse perspectives—because
                great products are built by teams that feel supported and challenged in the right ways.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Current openings */}
      <section id="openings" className="scroll-mt-24 py-14 md:py-20">
        <div className="mx-auto max-w-[1280px] px-4">
          <DisplayHeading
            className="mb-8 text-center text-4xl leading-none md:mb-10 md:text-5xl"
            style={{ color: orange }}
          >
            Current Openings
          </DisplayHeading>
          <div className="grid grid-cols-1 justify-items-center gap-8 md:grid-cols-2 xl:grid-cols-3">
            {openings.map((job) => (
              <article
                key={job.id}
                className="relative flex w-full max-w-[400px] flex-col rounded-[14px] border bg-white p-2.5"
                style={{ borderColor: orange }}
              >
                <button
                  type="button"
                  onClick={() => setDetailJob(job)}
                  className="mb-3 min-h-[200px] w-full cursor-pointer rounded-xl px-5 py-5 text-left transition hover:ring-2 hover:ring-offset-2 sm:min-h-[205px]"
                  style={{ background: "#DFF3FE", outlineColor: orange }}
                >
                  <DisplayHeading
                    as="h3"
                    className="mb-5 text-2xl leading-9 text-black md:text-[30px] md:leading-9"
                  >
                    {job.title}
                  </DisplayHeading>
                  <div className="flex flex-col gap-2.5 text-lg leading-6 text-black">
                    <p>
                      <span className="font-medium">Department:</span> {job.department}
                    </p>
                    <p>
                      <span className="font-medium">Location:</span> {job.location}
                    </p>
                    <p>
                      <span className="font-medium">Employment type:</span> {job.employmentType}
                    </p>
                  </div>
                  <p className="mt-4 text-base font-medium" style={{ color: orange }}>
                    View role details →
                  </p>
                </button>
                <a
                  href={`mailto:${CAREERS_EMAIL}?subject=${encodeURIComponent("Application — " + job.title)}`}
                  className="mx-2.5 mb-2 inline-flex h-11 max-w-[140px] items-center justify-center rounded-[10px] border text-lg font-medium transition hover:opacity-95"
                  style={{
                    background: "rgba(255,255,255,0.95)",
                    borderColor: orange,
                    color: orange,
                    boxShadow: "2px 4px 5px -2.8px rgba(0,0,0,0.1)",
                  }}
                >
                  Apply Now
                </a>
              </article>
            ))}

            {/* General application (always shown) */}
            <article
              className="relative flex w-full max-w-[400px] flex-col rounded-[14px] border bg-white p-2.5"
              style={{ borderColor: orange }}
            >
              <div
                className="mb-3 min-h-[200px] rounded-xl px-5 py-5 sm:min-h-[205px]"
                style={{ background: "#FFE1CC" }}
              >
                <DisplayHeading as="h3" className="mb-4 text-2xl leading-9 text-black md:text-[30px] md:leading-9">
                  {openings.length === 0 ? "No Current Openings" : "General application"}
                </DisplayHeading>
                <p className="text-lg leading-6 text-black">
                  We&apos;re always looking for talented individuals. Share your profile with us.
                </p>
              </div>
              <a
                href={`mailto:${CAREERS_EMAIL}?subject=General%20application%20%E2%80%94%20Resume`}
                className="mx-2.5 mb-2 inline-flex h-11 max-w-[190px] items-center justify-center gap-2 rounded-[10px] border text-lg font-medium transition hover:opacity-95"
                style={{
                  background: "rgba(255,255,255,0.95)",
                  borderColor: orange,
                  color: orange,
                  boxShadow: "2px 4px 5px -2.8px rgba(0,0,0,0.1)",
                }}
              >
                Send Resume
                <Send className="h-5 w-5 shrink-0" aria-hidden />
              </a>
            </article>
          </div>
        </div>
      </section>

      {detailJob ? <JobDetailModal email={CAREERS_EMAIL} job={detailJob} onClose={closeDetail} /> : null}

      {/* Hiring process */}
      <section className="bg-[#F4F4F4] py-14 md:py-20">
        <div className="mx-auto max-w-[1095px] px-4">
          <DisplayHeading
            className="mb-10 text-center text-4xl leading-none md:mb-12 md:text-5xl"
            style={{ color: orange }}
          >
            Our Hiring Process
          </DisplayHeading>

          <div className="flex flex-col items-center gap-8 md:flex-row md:flex-wrap md:justify-center lg:flex-nowrap lg:gap-2">
            {[
              {
                step: 1,
                icon: Send,
                title: "Apply Online",
                desc: "Submit your application through our portal.",
              },
              {
                step: 2,
                icon: Users,
                title: "Interview",
                desc: "Meet with our team and showcase your skills.",
              },
              {
                step: 3,
                icon: Award,
                title: "Final Selection",
                desc: "Final round with leadership team.",
              },
              {
                step: 4,
                icon: PartyPopper,
                title: "Offer & onboarding",
                desc: "Receive your offer and join the team.",
              },
            ].map((item, idx, arr) => (
              <Fragment key={item.step}>
                <div className="relative isolate w-full max-w-[280px] sm:max-w-[231px]">
                  <div
                    className="relative rounded-2xl bg-white p-8 shadow-md"
                    style={{
                      boxShadow: "0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -2px rgba(0,0,0,0.1)",
                    }}
                  >
                    <span
                      className={`${display.className} absolute -left-3 -top-3 flex h-12 w-12 items-center justify-center rounded-full text-lg text-white shadow-lg`}
                      style={{
                        background:
                          "linear-gradient(135deg, #FF6A00 0%, #FF7217 40%, #FF8534 100%)",
                        boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)",
                      }}
                    >
                      {item.step}
                    </span>
                    <div className="flex flex-col gap-5 pt-1">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-[14px]"
                        style={{
                          background:
                            "linear-gradient(135deg, #FFF3E8 0%, #FFECDC 50%, #FFE8D6 100%)",
                        }}
                      >
                        <item.icon className="h-7 w-7" style={{ color: orange }} strokeWidth={2} />
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <DisplayHeading as="h3" className="text-xl leading-7" style={{ color: charcoal }}>
                          {item.title}
                        </DisplayHeading>
                        <p className="text-sm leading-5" style={{ color: "rgba(43,43,43,0.7)" }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {idx < arr.length - 1 ? (
                  <div className="hidden shrink-0 self-center lg:flex" aria-hidden>
                    <ChevronRight className="m-6 h-8 w-8" style={{ color: forest }} strokeWidth={2.5} />
                  </div>
                ) : null}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
