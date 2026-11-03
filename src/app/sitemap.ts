import type { MetadataRoute } from "next";
import { getStaticStorefrontChannelSlugs } from "@/config/channels";
import { getStorefrontLocaleSlugs } from "@/config/locale";
import { getBaseUrl } from "@/lib/seo";
import { getSitemapInventory } from "@/lib/sitemap/entries";
import { buildStorefrontPath } from "@/lib/storefront-path";

/** Static browse pages, relative to the `/{locale}/{channel}` prefix. */
const BROWSE_SUFFIXES = ["", "/products", "/collections"] as const;

/**
 * `/sitemap.xml` — one file because this catalogue is ~120 URLs (42 collections,
 * 63 products, 8 categories, 7 pages). paper docs warn against a monolithic dump at
 * scale; if the catalogue crosses a few thousand URLs, switch to
 * `generateSitemaps()` + cursor-paginated chunks.
 *
 * Never emits a URL that was not verified: only published collections and the
 * non-empty category tree are listed. Transactional surfaces (cart, checkout,
 * account, search) stay out, matching `robots.ts`.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = getBaseUrl().replace(/\/+$/, "");
	const locales = getStorefrontLocaleSlugs();
	const channels = getStaticStorefrontChannelSlugs();
	const entries: MetadataRoute.Sitemap = [];

	for (const channel of channels) {
		const inventory = await getSitemapInventory(channel);

		for (const locale of locales) {
			const toUrl = (suffix: string) => `${baseUrl}${buildStorefrontPath(locale, channel, suffix)}`;
			const withLastmod = (slug: string, lastmod?: string | null, prefix = "") => ({
				url: toUrl(`${prefix}/${slug}`),
				...(lastmod ? { lastModified: new Date(lastmod) } : {}),
			});

			for (const suffix of BROWSE_SUFFIXES) {
				entries.push({ url: toUrl(suffix) });
			}
			for (const collection of inventory.collections) {
				entries.push(withLastmod(collection.slug, collection.lastmod, "/collections"));
			}
			for (const category of inventory.categories) {
				entries.push(withLastmod(category.slug, category.lastmod, "/categories"));
			}
			for (const product of inventory.products) {
				entries.push(withLastmod(product.slug, product.lastmod, "/products"));
			}
			for (const page of inventory.pages) {
				entries.push(withLastmod(page.slug, page.lastmod, "/pages"));
			}
		}
	}

	return entries;
}
