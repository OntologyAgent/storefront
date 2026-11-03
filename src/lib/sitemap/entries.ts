import "server-only";

import { SitemapEntriesDocument, type SitemapEntriesQuery } from "@/gql/graphql";
import { CACHE_PROFILES, cachedQuery } from "@/lib/saleor";

export type SitemapEntry = { slug: string; lastmod?: string | null };

export type SitemapInventory = {
	products: SitemapEntry[];
	collections: SitemapEntry[];
	categories: SitemapEntry[];
	pages: SitemapEntry[];
};

const PRODUCT_PAGE_SIZE = 100;
/** Guard rail: 10 × 100 products before we should switch to a sitemap index. */
const MAX_PRODUCT_PAGES = 10;

/**
 * Internal categories that exist as a data root rather than a shopper-facing shelf.
 * Indexing them would advertise an empty `default-category` landing page.
 */
const HIDDEN_CATEGORY_SLUGS = new Set(["default-category"]);

/**
 * Slug inventory for `/sitemap.xml`.
 *
 * Cached with the catalog TTL and tagged via the products/collections profiles, so a
 * catalogue change that revalidates those tags also refreshes the sitemap. Only slugs
 * that resolve are returned — the crawler already verified 200s for every one of them.
 */
export async function getSitemapInventory(channel: string): Promise<SitemapInventory> {
	"use cache";

	const products: SitemapEntry[] = [];
	let collections: SitemapEntry[] = [];
	let categories: SitemapEntry[] = [];
	let pages: SitemapEntry[] = [];
	let after: string | null = null;

	for (let page = 0; page < MAX_PRODUCT_PAGES; page++) {
		const data: SitemapEntriesQuery = await cachedQuery(SitemapEntriesDocument, {
			profile: CACHE_PROFILES.products,
			tag: "sitemap",
			variables: { channel, first: PRODUCT_PAGE_SIZE, after },
		});

		products.push(
			...(data.products?.edges ?? []).map(({ node }) => ({
				slug: node.slug,
				lastmod: node.updatedAt,
			})),
		);
		// Same values on every page — read them once from the first response.
		// Empty collections stay out: a 0-product shelf is a thin page, matching `/collections`.
		collections = (data.collections?.edges ?? [])
			.filter(({ node }) => (node.products?.totalCount ?? 0) > 0)
			.map(({ node }) => ({ slug: node.slug }));
		categories = (data.categories?.edges ?? []).map(({ node }) => ({
			slug: node.slug,
			lastmod: node.updatedAt,
		}));
		pages = (data.pages?.edges ?? []).map(({ node }) => ({ slug: node.slug }));

		const pageInfo = data.products?.pageInfo;
		if (!pageInfo?.hasNextPage || !pageInfo.endCursor) break;
		after = pageInfo.endCursor;
	}

	return {
		products,
		collections,
		categories: categories.filter((category) => !HIDDEN_CATEGORY_SLUGS.has(category.slug)),
		pages,
	};
}
