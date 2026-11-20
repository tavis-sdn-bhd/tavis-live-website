/**
 * Appends each contact form enquiry to the Google Sheet this script is bound to.
 *
 * EmDash's forms plugin POSTs every submission to the `contact` form's Webhook URL as JSON:
 *   { event: "form.submission", formId: "contact", submissionId, submittedAt, data: { name, email, phone, message, page } }
 * Setup is in README.md, "Leads in Google Sheets".
 */

const HEADERS = ["Received", "Name", "Email", "Phone", "Message", "Page", "Submission ID"];

function doPost(e) {
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply(400, "Body is not JSON");
  }
  if (payload.event !== "form.submission" || payload.formId !== "contact") return reply(200, "Ignored");

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    const data = payload.data || {};
    // A leading = + - or @ would make Sheets read a visitor's text as a formula.
    const cell = (value) => {
      const text = value == null ? "" : String(value);
      return /^[=+\-@]/.test(text) ? "'" + text : text;
    };
    sheet.appendRow([
      payload.submittedAt ? new Date(payload.submittedAt) : new Date(),
      cell(data.name),
      cell(data.email),
      cell(data.phone),
      cell(data.message),
      cell(data.page),
      cell(payload.submissionId),
    ]);
  } finally {
    lock.releaseLock();
  }
  return reply(200, "Saved");
}

function reply(status, message) {
  return ContentService.createTextOutput(JSON.stringify({ status, message })).setMimeType(ContentService.MimeType.JSON);
}
