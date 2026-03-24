import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isValidCmsFooterSlug } from "@/lib/cms-footer-pages";
import { isLikelyHtmlContent } from "@/lib/cms-content-render";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug || !isValidCmsFooterSlug(slug)) {
    notFound();
  }

  const row = await prisma.cmsFooterPage.findUnique({
    where: { slug },
    select: { title: true, content: true },
  });

  if (!row) {
    notFound();
  }

  const trimmed = row.content.trim();
  const inner =
    trimmed.length > 0 ? (
      isLikelyHtmlContent(row.content) ? (
        <div
          className="cms-footer-content text-slate-700 text-[15px] leading-relaxed space-y-4 [&_a]:text-amber-800 [&_a]:underline [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
          dangerouslySetInnerHTML={{ __html: row.content }}
        />
      ) : (
        <div className="cms-footer-content text-slate-700 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {row.content}
        </div>
      )
    ) : (
      <p className="text-slate-600">Content will appear here once it is published from the admin CMS.</p>
    );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <Link
        href="/"
        className="text-sm font-medium text-amber-800 hover:text-amber-900 hover:underline mb-8 inline-block"
      >
        ← Back to home
      </Link>
      <h1
        className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8"
        style={{ fontFamily: "'Nunito', 'Manrope', sans-serif" }}
      >
        {row.title}
      </h1>
      {inner}
    </div>
  );
}
