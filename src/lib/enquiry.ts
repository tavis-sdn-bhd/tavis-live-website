/** The contact form's field limits, shared by the form's inputs and the server's check (src/middleware.ts). */
export const enquiryLimits = { name: 100, email: 254, phone: 30, message: 2000, page: 200 } as const;

/** One problem with a submission, in the forms plugin's error shape, which the contact form reads. */
export type EnquiryError = { field: string; message: string };

type Field = keyof typeof enquiryLimits;

const required: readonly Field[] = ["name", "email", "message"];
const emailShape = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Control characters, line breaks included: a name goes into notification emails and must stay on one line.
const control = /[\u0000-\u001f\u007f]/;

/** The server's check of the contact form's data. The browser checks the same rules first; this holds for requests that
    skip the form. An empty list means the data may go on to the forms plugin. */
export function enquiryErrors(data: Record<string, unknown>): EnquiryError[] {
  const errors: EnquiryError[] = [];
  for (const field of Object.keys(enquiryLimits) as Field[]) {
    const value = data[field];
    if (value === undefined) {
      if (required.includes(field)) errors.push({ field, message: `Add your ${field}.` });
      continue;
    }
    if (typeof value !== "string") {
      errors.push({ field, message: `Your ${field} must be text.` });
      continue;
    }
    if (required.includes(field) && !value.trim()) errors.push({ field, message: `Add your ${field}.` });
    else if (value.length > enquiryLimits[field]) errors.push({ field, message: `Keep your ${field} under ${enquiryLimits[field]} characters.` });
  }
  const { name, email } = data;
  if (typeof name === "string" && control.test(name)) errors.push({ field: "name", message: "Keep your name on one line." });
  if (typeof email === "string" && email.trim() && !emailShape.test(email.trim())) errors.push({ field: "email", message: "That email doesn\u2019t look right." });
  return errors;
}
