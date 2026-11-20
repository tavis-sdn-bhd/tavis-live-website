// What scripts/blog/inventory.ts writes and scripts/blog/import.ts reads.

/** The live site the posts come from. */
export const sourceSite = "https://www.tavis.live";

/** Repository paths, from the root. */
export const inventoryPath = "seed/blog-inventory.json";
export const mediaDir = "seed/blog/media";

/** Where tavis.live served a post. public/_redirects sends it to the post's new page. */
export const oldPostPath = (slug: string) => `/tavis-blog/${slug}`;

/** A downloaded image: the original file in `mediaDir`, byte for byte. */
export type BlogMedia = {
  sourceUrl: string;
  /** Its file in `mediaDir`, named by its Webflow asset id. */
  file: string;
  /** The name it was uploaded to Webflow under, which the media library shows. */
  filename: string;
  /** Null: no image on the source has alt text. */
  alt: string | null;
  width: number;
  height: number;
  bytes: number;
  sha256: string;
};

export type BlogSpan = { _type: "span"; _key: string; text: string; marks: string[] };
export type BlogBlock = { _type: "block"; _key: string; style: "normal" | "h2"; markDefs: []; children: BlogSpan[] };

export type BlogSourcePost = {
  slug: string;
  sourceUrl: string;
  /** Its place on /blog, newest first; null if only the sitemap lists it. */
  indexPosition: number | null;
  /** The post page's heading. */
  title: string;
  htmlTitle: string;
  indexTitle: string | null;
  /** The sentence under the post's card on /blog. */
  excerpt: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  /** Not on the source. */
  author: null;
  /** Not on the source; see `derived`. */
  publishedAt: null;
  derived: {
    /** When the post's page was created in Webflow, from the timestamp in its page id. */
    pageCreatedAt: string;
    webflowPageId: string;
    sitemapLastmod: string | null;
  };
  cover: BlogMedia;
  listingImage: BlogMedia | null;
  inlineImages: BlogMedia[];
  wordCount: number;
  /** The body as the source serves it: the inner HTML of each of its paragraphs. */
  bodyHtml: string[];
  /** The body as Portable Text, as it is imported. */
  body: BlogBlock[];
};

export type BlogInventory = {
  source: {
    site: string;
    index: string;
    sitemap: string;
    fetchedAt: string;
    postsInSitemap: number;
    postsOnIndex: number;
    onlyInSitemap: string[];
    onlyInIndex: string[];
    paginated: boolean;
    taxonomies: string;
  };
  /** Slugs of the posts each field is missing from on the source. */
  missing: Record<string, string[]>;
  notes: string[];
  posts: BlogSourcePost[];
};
