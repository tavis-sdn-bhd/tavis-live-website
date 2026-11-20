import { env } from "cloudflare:workers";
import { defineMiddleware } from "astro:middleware";
import { type EnquiryError, enquiryErrors, tooManyMessages } from "@/lib/enquiry";
// The Malay site's copy of the same module (scripts/i18n/generate.ts), so the Malay comes from i18n/ms.json.
import { tooManyMessages as tooManyMessagesMalay } from "@/ms/lib/enquiry";

/** The forms plugin's public endpoint, which the contact form posts to. */
const submitPath = "/_emdash/api/plugins/emdash-forms/submit";

/** The form the contact form submits, whose data has a shape this site knows. */
const contactFormId = "contact";

/** What public/_headers gives static files, for the responses the Worker renders. */
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

function rejected(status: number, errors: EnquiryError[]) {
  return Response.json({ success: false, errors }, { status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Rate-limits form submissions and checks the contact form's data before the forms plugin stores it and emails Tavis.
    Null lets the request through. */
async function guardSubmission(request: Request): Promise<Response | null> {
  const visitor = request.headers.get("cf-connecting-ip") ?? "unknown";
  const [perVisitor, siteWide] = await Promise.all([
    env.ENQUIRIES_PER_VISITOR.limit({ key: visitor }),
    env.ENQUIRIES_SITE_WIDE.limit({ key: "all" }),
  ]);
  if (!perVisitor.success || !siteWide.success) {
    // The form posts from a page; a Malay page's visitor gets the answer in Malay.
    const malay = /^https?:\/\/[^/]+\/ms(?:[/?#]|$)/.test(request.headers.get("referer") ?? "");
    return rejected(429, [{ field: "", message: malay ? tooManyMessagesMalay : tooManyMessages }]);
  }

  const body: unknown = await request.clone().json().catch(() => null);
  if (!isRecord(body) || !isRecord(body.data)) return rejected(400, [{ field: "", message: "That message couldn\u2019t be read." }]);
  if (body.formId !== contactFormId) return null;
  const errors = enquiryErrors(body.data);
  return errors.length ? rejected(400, errors) : null;
}

/** A copy of the response with the security headers, and `noindex` until a design goes live at /. A copy because a
    redirect or a fetched response has immutable headers. A WebSocket upgrade (co-editing) passes as it is. */
function secured(response: Response): Response {
  if (response.status === 101) return response;
  const copy = new Response(response.body, response);
  for (const [name, value] of Object.entries(securityHeaders)) if (!copy.headers.has(name)) copy.headers.set(name, value);
  copy.headers.set("X-Robots-Tag", "noindex, nofollow");
  return copy;
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.request.method === "POST" && context.url.pathname === submitPath) {
    const blocked = await guardSubmission(context.request);
    if (blocked) return secured(blocked);
  }
  return secured(await next());
});
