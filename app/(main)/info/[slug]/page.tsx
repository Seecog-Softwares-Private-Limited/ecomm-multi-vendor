import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCmsFooterPageMeta, isValidCmsFooterSlug } from "@/lib/cms-footer-pages";
import { isLikelyHtmlContent } from "@/lib/cms-content-render";

/** Always load from DB at request time (empty/missing DB rows must not 404 after deploy). */
export const dynamic = "force-dynamic";

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
        {title}
      </h1>
      {inner}
    </div>
  );
}
