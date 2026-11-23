// Writes the Malay site: a twin of src under src/ms with every user-facing string swapped from i18n/ms.json.
//   node scripts/i18n/generate.ts            write src/ms and src/pages/ms
//   node scripts/i18n/generate.ts --check    also fail on untranslated copy and unused dictionary entries
// The English site is the source. A string is swapped only when the dictionary has it word for word, so code strings
// (classes, ids, paths) are never touched unless someone adds them to the dictionary. Runs before dev and build.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import ts from "typescript";
import { twinned } from "../../src/lib/locale.ts";

const root = path.resolve(import.meta.dirname, "../..");
const src = path.join(root, "src");
const out = path.join(src, "ms");
const pagesOut = path.join(src, "pages", "ms");
const { values: args } = parseArgs({ options: { check: { type: "boolean", default: false } } });

type Dictionary = {
  /** English → Malay, for every file. A template literal's key is its source between the backticks. */
  translations: Record<string, string>;
  /** English strings that stay English in Malay: names, brands, subjects. */
  keep: string[];
  /** Per-file English → Malay, for a string that needs a different Malay there. Keys are paths from src. */
  files: Record<string, Record<string, string>>;
};
const raw: unknown = JSON.parse(readFileSync(path.join(root, "i18n", "ms.json"), "utf8"));
const dictionary = parseDictionary(raw);
const keep = new Set(dictionary.keep);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((v) => typeof v === "string");
}

/** i18n/ms.json, checked: it is edited by hand, and a wrong shape should fail here, by name. */
function parseDictionary(value: unknown): Dictionary {
  if (!isRecord(value)) throw new Error("i18n/ms.json: expected an object");
  const { translations, keep, files } = value;
  if (!isStringRecord(translations)) throw new Error("i18n/ms.json: translations must map English strings to Malay strings");
  if (!Array.isArray(keep) || !keep.every((k): k is string => typeof k === "string")) throw new Error("i18n/ms.json: keep must be a list of strings");
  if (!isRecord(files)) throw new Error("i18n/ms.json: files must be an object");
  const perFile: Record<string, Record<string, string>> = {};
  for (const [file, entries] of Object.entries(files)) {
    if (!isStringRecord(entries)) throw new Error(`i18n/ms.json: files["${file}"] must map English strings to Malay strings`);
    perFile[file] = entries;
  }
  return { translations, keep, files: perFile };
}

/** src paths mirrored as they are, untranslated: the coded app's own screens, which show the real app's UI. */
const untranslated = [
  "components/phone-app/",
  "components/stageshow/",
  "components/app-demos/",
  "components/v2/lesson.tsx",
  "components/bacteriophage.tsx",
  "lib/questions.ts",
  // The blog is English-only; its views are mirrored only because the twin is mirrored whole.
  "views/ba/blog/",
  "lib/blog.ts",
  // EmDash's timetable: its content is already in Malay, and its own strings are errors and Malay month names.
  "lib/timetable-data.ts",
  "lib/timetable-dates.ts",
];
/** src paths the Malay site doesn't get its own copy of. Pages are written separately, below. */
const notMirrored = ["ms/", "pages/", "styles/", "middleware.ts", "worker.ts", "live.config.ts"];
/** The pages with a Malay twin, by file under src/pages, from the list the site's links use. */
const localizedPages = twinned.map((route) => (route === "/" ? "index.astro" : `${route.slice(1)}.astro`));

/** JSX attributes whose strings are never copy. */
const codeAttributes = new Set(["className", "class", "id", "href", "src", "key", "type", "rel", "target", "role", "lang", "hrefLang", "htmlFor", "name", "autoComplete", "inputMode", "d", "viewBox", "fill", "stroke", "method", "action", "slot", "loading", "decoding", "fetchPriority", "sizes", "srcSet", "data-motion"]);

const used = new Set<string>();
const missing = new Map<string, Set<string>>();

function lookup(file: string, english: string): string | null {
  const own = dictionary.files[file]?.[english];
  if (own !== undefined) {
    used.add(`${file}::${english}`);
    return own;
  }
  const shared = dictionary.translations[english];
  if (shared !== undefined) {
    used.add(english);
    return shared;
  }
  if (keep.has(english)) used.add(`keep::${english}`);
  return null;
}

/** Copy a reader would see, for the untranslated report: words, not classes, paths or identifiers. */
function looksLikeCopy(text: string) {
  if (keep.has(text)) return false;
  const prose = text.replace(/\$\{[^}]*\}/g, " ").trim();
  if (!/\p{L}{2,}/u.test(prose) || /^[A-Z0-9]{1,3}$/.test(prose)) return false;
  if (/^(\/|#|https?:|mailto:|tel:|\.\/|\.\.\/|@\/)/.test(prose)) return false;
  if (/^[Mm][\d\s.,-]|^(translate|rotate|scale|matrix)\(|\d(px|rem|ms|s|deg|%|cqw|vw|w)\b|calc\(|var\(|gradient\(|^inset\b|\.(webp|png|svg)\b/.test(prose)) return false;
  const tokens = prose.split(/\s+/);
  const classLike = tokens.every((t) => /^[!a-z0-9:[\]\-_./%#()>&=*@~+,'"]+$/.test(t)) && tokens.some((t) => /[-:[\]]/.test(t));
  if (classLike) return false;
  // A template's words sit around its ${…}, so one real word is enough to count it.
  if (text.includes("${") && /\p{L}{3,}/u.test(prose)) return true;
  return /^\P{L}*\p{Lu}/u.test(prose) || /\s/.test(prose);
}

function report(file: string, english: string, markup = false) {
  // Text between tags is always for a reader, however short; elsewhere a string has to look like copy.
  if (markup ? !/\p{L}/u.test(english) || keep.has(english) : !looksLikeCopy(english)) return;
  if (!missing.has(file)) missing.set(file, new Set());
  missing.get(file)?.add(english);
}

/** Whether a string node sits where it can't be copy: an import, a key, a type, a code attribute. */
function isCodePosition(node: ts.Node) {
  const parent = node.parent;
  if (!parent) return true;
  if (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent) || ts.isExternalModuleReference(parent)) return true;
  if (ts.isLiteralTypeNode(parent) || ts.isImportTypeNode(parent)) return true;
  if ((ts.isPropertyAssignment(parent) || ts.isPropertySignature(parent) || ts.isMethodDeclaration(parent)) && parent.name === node) return true;
  if (ts.isElementAccessExpression(parent) && parent.argumentExpression === node) return true;
  if (ts.isCallExpression(parent) && ts.isIdentifier(parent.expression) && parent.expression.text === "require") return true;
  if (ts.isCallExpression(parent) && parent.expression.kind === ts.SyntaxKind.ImportKeyword) return true;
  if (ts.isJsxAttribute(parent) && codeAttributes.has(parent.name.getText())) return true;
  if (ts.isCaseClause(parent)) return true;
  if (ts.isExpressionStatement(parent) && ts.isSourceFile(parent.parent)) return true;
  if (ts.isPropertyAssignment(parent) && /^"?@/.test(parent.name.getText())) return true;
  if (ts.isBinaryExpression(parent) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken].includes(parent.operatorToken.kind)) return true;
  return false;
}

function isComparison(node: ts.Node) {
  const parent = node.parent;
  if (!parent) return false;
  if (ts.isCaseClause(parent)) return true;
  return ts.isBinaryExpression(parent) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken].includes(parent.operatorToken.kind);
}

type Edit = { start: number; end: number; text: string };

/** The Malay text of a TS or TSX source, plus its imports pointed at the Malay twin. */
function translateCode(file: string, text: string, kind: ts.ScriptKind, translate: boolean): string {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
  const edits: Edit[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isStringLiteral(node) && isModuleSpecifier(node)) {
      const target = node.text.startsWith(".") ? relativeTarget(file, node.text) : mirroredTarget(node.text);
      if (target) edits.push({ start: node.getStart(), end: node.getEnd(), text: JSON.stringify(target) });
    } else if (translate && ts.isStringLiteral(node) && isComparison(node) && node.text in dictionary.translations) {
      // A comparison stays English while the copy it compares against turns Malay, so it would never match.
      throw new Error(`${file}: "${node.text}" is compared against in code and also translated. Compare an id instead, or keep the string.`);
    } else if (translate && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && !isCodePosition(node)) {
      const malay = lookup(file, node.text);
      if (malay !== null) edits.push({ start: node.getStart(), end: node.getEnd(), text: ts.isStringLiteral(node) ? JSON.stringify(malay) : `\`${malay}\`` });
      else report(file, node.text);
    } else if (translate && ts.isTemplateExpression(node) && !isCodePosition(node)) {
      const raw = node.getText().slice(1, -1);
      const malay = lookup(file, raw);
      if (malay !== null) {
        const expressions = (t: string) => [...t.matchAll(/\$\{([^}]*)\}/g)].map((m) => m[1]).sort().join("\u0000");
        if (expressions(malay) !== expressions(raw)) throw new Error(`${file}: the Malay for \`${raw}\` must use the same \${…} expressions`);
        edits.push({ start: node.getStart(), end: node.getEnd(), text: `\`${malay}\`` });
        return;
      }
      report(file, raw);
    } else if (translate && ts.isJsxText(node)) {
      const english = node.text.replace(/\s+/g, " ").trim();
      if (english) {
        const malay = lookup(file, english);
        if (malay !== null) {
          const lead = node.text.match(/^\s*/)?.[0] ?? "";
          const trail = node.text.match(/\s*$/)?.[0] ?? "";
          edits.push({ start: node.getStart(), end: node.getEnd(), text: lead + malay.replace(/[{}<>]/g, (c) => `{"${c}"}`) + trail });
        } else report(file, english, true);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return applyEdits(text, edits);
}

function isModuleSpecifier(node: ts.StringLiteral) {
  const parent = node.parent;
  if (!parent) return false;
  if ((ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) && parent.moduleSpecifier === node) return true;
  if (ts.isCallExpression(parent) && parent.expression.kind === ts.SyntaxKind.ImportKeyword) return true;
  if (ts.isLiteralTypeNode(parent) && ts.isImportTypeNode(parent.parent)) return true;
  return false;
}

function applyEdits(text: string, edits: Edit[]) {
  let result = text;
  for (const edit of [...edits].sort((a, b) => b.start - a.start)) result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
  return result;
}

const mirrored = (rel: string) => !notMirrored.some((p) => rel === p || rel.startsWith(p));

/** "@/lib/site" → "@/ms/lib/site" when that module is part of the Malay twin. */
function mirroredTarget(specifier: string): string | null {
  if (!specifier.startsWith("@/")) return null;
  const rel = specifier.slice(2);
  if (!mirrored(rel)) return null;
  const candidates = [rel, `${rel}.ts`, `${rel}.tsx`, `${rel}/index.ts`, `${rel}/index.tsx`];
  return candidates.some((c) => existsSync(path.join(src, c)) && statSync(path.join(src, c)).isFile()) ? `@/ms/${rel}` : null;
}

/** A relative import that leaves the mirrored files ("../../emdash-env" from lib/blog.ts) pointed back at the
    original, one folder further up. One that stays inside them is left as it is. */
function relativeTarget(file: string, specifier: string): string | null {
  const target = path.resolve(path.dirname(path.join(src, file)), specifier);
  const rel = path.relative(src, target);
  if (!rel.startsWith("..") && mirrored(rel)) return null;
  const from = path.dirname(path.join(file.startsWith("pages/") ? pagesOut : out, file.startsWith("pages/") ? path.basename(file) : file));
  const back = path.relative(from, target);
  return back.startsWith(".") ? back : `./${back}`;
}

/** An .astro file: its frontmatter as TypeScript, its markup's text nodes from the dictionary. */
function translateAstro(file: string, text: string, translate: boolean) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  const front = match ? translateCode(file, match[1], ts.ScriptKind.TS, translate) : "";
  let markup = match ? text.slice(match[0].length) : text;
  if (translate) {
    markup = markup.replace(/>([^<>{}]+)</g, (whole, inner: string) => {
      const english = inner.replace(/\s+/g, " ").trim();
      if (!english) return whole;
      const malay = lookup(file, english);
      if (malay === null) {
        report(file, english, true);
        return whole;
      }
      return `>${inner.match(/^\s*/)?.[0] ?? ""}${malay}${inner.match(/\s*$/)?.[0] ?? ""}<`;
    });
  }
  return match ? `---\n${front}\n---\n${markup}` : markup;
}

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

function translateFile(rel: string, text: string) {
  const translate = !untranslated.some((p) => rel.startsWith(p));
  if (rel.endsWith(".astro")) return translateAstro(rel, text, translate);
  if (rel.endsWith(".tsx")) return translateCode(rel, text, ts.ScriptKind.TSX, translate);
  if (rel.endsWith(".ts")) return translateCode(rel, text, ts.ScriptKind.TS, translate);
  return null;
}

rmSync(out, { recursive: true, force: true });
rmSync(pagesOut, { recursive: true, force: true });

for (const file of walk(src)) {
  const rel = path.relative(src, file);
  if (!mirrored(rel)) continue;
  const target = path.join(out, rel);
  mkdirSync(path.dirname(target), { recursive: true });
  const text = readFileSync(file, "utf8");
  const translated = translateFile(rel, text);
  if (translated === null) cpSync(file, target);
  else writeFileSync(target, rel === "lib/locale.ts" ? swapLocale(translated) : translated);
}

for (const name of localizedPages) {
  const rel = `pages/${name}`;
  const translated = translateFile(rel, readFileSync(path.join(src, rel), "utf8"));
  if (translated === null) throw new Error(`Not a page: ${rel}`);
  mkdirSync(pagesOut, { recursive: true });
  writeFileSync(path.join(pagesOut, name), translated);
}

function swapLocale(text: string) {
  const from = 'export const locale: Locale = "en";';
  if (!text.includes(from)) throw new Error(`lib/locale.ts no longer has: ${from}`);
  return text.replace(from, 'export const locale: Locale = "ms";');
}

const unused = [
  ...Object.keys(dictionary.translations).filter((k) => !used.has(k)),
  ...Object.entries(dictionary.files).flatMap(([file, entries]) => Object.keys(entries).filter((k) => !used.has(`${file}::${k}`)).map((k) => `${file}: ${k}`)),
  ...dictionary.keep.filter((k) => !used.has(`keep::${k}`)).map((k) => `keep: ${k}`),
];
const untranslatedCount = [...missing.values()].reduce((n, set) => n + set.size, 0);

if (args.check) {
  for (const [file, strings] of missing) for (const s of strings) console.log(`untranslated  ${file}: ${JSON.stringify(s)}`);
  for (const k of unused) console.log(`unused        ${JSON.stringify(k)}`);
}
console.log(`i18n: src/ms written, ${used.size} dictionary entries used, ${untranslatedCount} untranslated, ${unused.length} unused.`);
if (args.check && (untranslatedCount || unused.length)) process.exitCode = 1;
