import { company, links } from "@/lib/content";
import { siteName, siteUrl } from "@/lib/site";

const organization = {
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: siteName,
  legalName: company.legalName,
  url: siteUrl,
  logo: `${siteUrl}/icon.png`,
  email: links.emailLabel,
  address: {
    "@type": "PostalAddress",
    streetAddress: company.street,
    addressLocality: company.city,
    addressRegion: company.region,
    postalCode: company.postalCode,
    addressCountry: "MY",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    telephone: "+60106536780",
    email: links.emailLabel,
    url: links.whatsapp,
    areaServed: "MY",
  },
  sameAs: [links.facebook, links.instagram, links.tiktok, links.youtube, "https://twitter.com/Tavislive"],
};

const app = {
  "@type": "MobileApplication",
  "@id": `${siteUrl}/#app`,
  name: siteName,
  operatingSystem: "iOS, Android",
  applicationCategory: "EducationalApplication",
  url: siteUrl,
  installUrl: [links.appStore, links.googlePlay],
  sameAs: [links.appStore, links.googlePlay],
  publisher: { "@id": organization["@id"] },
  offers: { "@type": "Offer", price: "0", priceCurrency: "MYR" },
};

/** The site itself, so search results name it "Tavis" rather than its address. */
const website = {
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: siteName,
  url: `${siteUrl}/`,
  publisher: { "@id": organization["@id"] },
};

const json = JSON.stringify({ "@context": "https://schema.org", "@graph": [organization, website, app] }).replace(/</g, "\\u003c");

export function StructuredData() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
