import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/TopBar";
import { Navbar } from "@/components/Navbar";
import { CategoryNav } from "@/components/CategoryNav";
import { getCmsFooterPageMeta, isValidCmsFooterSlug } from "@/lib/cms-footer-pages";
import { isLikelyHtmlContent } from "@/lib/cms-content-render";
import type { ComponentType } from "react";
import { AboutIndovyaparPage } from "@/components/AboutIndovyaparPage";
import { CareersPage, type CareerOpeningCard } from "@/components/CareersPage";

const STATIC_INFO_PAGES: Record<string, ComponentType> = {
  "about-indovyapar": AboutIndovyaparPage,
};

/** Always load from DB at request time (empty/missing DB rows must not 404 after deploy). */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!slug || !isValidCmsFooterSlug(slug)) {
    return { title: "Page" };
  }
  const meta = getCmsFooterPageMeta(slug);
  if (!meta) {
    return { title: "Page" };
  }
  return {
    title: `${meta.label} | Indovyapar`,
    description:
      slug === "about-indovyapar"
        ? "Learn who we are, what we offer, and why shoppers and sellers choose Indovyapar."
        : slug === "careers"
          ? "Build your career at Indovyapar — openings, hiring process, and how to apply."
          : undefined,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug || !isValidCmsFooterSlug(slug)) {
    notFound();
  }

  const meta = getCmsFooterPageMeta(slug);
  if (!meta) {
    notFound();
  }

  if (slug === "careers") {
    let openings: CareerOpeningCard[] = [];
    try {
      openings = await prisma.careerOpening.findMany({
        where: { published: true },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        select: {
          id: true,
          title: true,
          department: true,
          location: true,
          employmentType: true,
          description: true,
        },
      });
    } catch {
      openings = [];
    }
    return <CareersPage openings={openings} />;
  }

  const StaticInfoPage = STATIC_INFO_PAGES[slug];
  if (StaticInfoPage) {
    return <StaticInfoPage />;
  }

  let title = meta.label;
  let body = "";

  try {
    const row = await prisma.cmsFooterPage.findUnique({
      where: { slug },
      select: { title: true, content: true },
    });
    if (row) {
      title = row.title || meta.label;
      body = row.content ?? "";
    }
  } catch {
    // Missing table (migrate not run) or DB unreachable — still show a valid page with footer title.
    body = "";
  }

  const trimmed = body.trim();
  const inner =
    trimmed.length > 0 ? (
      isLikelyHtmlContent(body) ? (
        <div
          className="cms-footer-content text-slate-700 text-[15px] leading-relaxed space-y-4 [&_a]:text-amber-800 [&_a]:underline [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      ) : (
        <div className="cms-footer-content text-slate-700 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {body}
        </div>
      )
    ) : (
      <p className="text-slate-600">
        Content will appear here once it is published from the admin CMS. If you are the site owner, run{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">npx prisma migrate deploy</code> on the
        server and open <strong>Admin → CMS</strong> to add text for this page.
      </p>
    );

  return (
    <>
      <header className="sticky top-0 z-[80]">
        <TopBar tone="onBrand" />
        <Navbar surface="solid" />
        <CategoryNav />
      </header>
      <div
        className="min-h-[50vh] bg-slate-100 pb-12 pt-6 sm:pt-10"
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <article className="rounded-lg border border-slate-200/90 bg-white px-5 py-8 shadow-sm sm:px-10 sm:py-12">
            <h1
              className="mb-8 text-2xl font-bold text-slate-900 sm:text-3xl"
              style={{ fontFamily: "'Nunito', 'Manrope', sans-serif" }}
            >
              {title}
            </h1>
            {inner}
          </article>
        </div>
      </div>
    </>
  );
}
