import { bindings, defineConfig, exports, triggers } from "cf/config";

// The site's Worker: Astro renders the pages (src/worker.ts wraps EmDash's handler), EmDash keeps content in D1 and
// media in R2. Deploys to the Tavis-owned account.
export default defineConfig({
	accountId: "27640b0421c0fa25376a1892ad12f2d8",
	worker: {
		name: "tavis-live-website",
		compatibilityDate: "2026-11-18",
		compatibilityFlags: [
			"nodejs_compat",
		],
		entrypoint: "./src/worker.ts",
		// Needs the tavis.live zone on this account; a deploy fails until it is there.
		domains: [
			"www.tavis.live",
		],
		// EmDash's maintenance cron.
		triggers: [
			triggers.scheduled({
				schedule: "* * * * *",
			}),
		],
		env: {
			DB: bindings.d1({
				name: "tavis-live-website",
			}),
			MEDIA: bindings.r2({
				name: "tavis-live-media",
			}),
			// Co-editing rooms, one Durable Object per entry being edited.
			EMDASH_ROOMS: bindings.durableObject({
				worker: "tavis-live-website",
				exportName: "EmDashRoom",
			}),
			// Contact form submissions, per visitor and across the site (src/middleware.ts). Periods can only be 10 or 60 seconds.
			ENQUIRIES_PER_VISITOR: bindings.rateLimit({
				namespace: "1001",
				simple: {
					limit: 3,
					period: 60,
				},
			}),
			ENQUIRIES_SITE_WIDE: bindings.rateLimit({
				namespace: "1002",
				simple: {
					limit: 20,
					period: 60,
				},
			}),
		},
		exports: {
			EmDashRoom: exports.durableObject({
				storage: "sqlite",
			}),
		},
	},
});
