import { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { portfolio } from "@/data/portfolio";
import { allNews } from "@/data/news";
import { AdminError, applyRecord, MAX_CONTENT_BYTES, mergeRecords, readContent, validateRecord, writeContent } from "@/lib/admin-core.mjs";
import { adminFailure, adminResponse, boundedJson, requireAdmin } from "@/lib/admin-http";

export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);
    const { document, revision } = await readContent();
    return adminResponse({ revision, companies: mergeRecords(portfolio, document.companies as Partial<(typeof portfolio)[number]>[], true), news: mergeRecords(allNews, document.news, true) });
  } catch (error) { return adminFailure(error); }
}

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request, true);
    const input = await boundedJson(request, MAX_CONTENT_BYTES);
    const { document, revision } = await readContent();
    if (input.revision !== revision) throw new AdminError("Another partner updated the site. Reload the list before saving; your form has been kept.", 409);
    const companies = mergeRecords(portfolio, document.companies as Partial<(typeof portfolio)[number]>[], true);
    const record = validateRecord(input.kind, input.record, companies.filter((company) => !input.record?.published || company.published).map((company) => company.slug));
    const existing = input.kind === "company" ? companies : mergeRecords(allNews, document.news, true);
    if (input.create && existing.some((item) => item.slug === record.slug)) throw new AdminError("That page address is already used. Choose another one.", 409, "slug");
    if (!input.create && !existing.some((item) => item.slug === record.slug)) throw new AdminError("This entry no longer exists. Reload the list before saving.", 409);
    const nextRevision = await writeContent(applyRecord(document, input.kind, record), revision);
    revalidateTag("kofa-content");
    revalidatePath("/", "layout");
    return adminResponse({ revision: nextRevision, record });
  } catch (error) { return adminFailure(error); }
}
