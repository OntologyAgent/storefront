import "server-only";

import { ProductListByCollectionDocument, ProductOrderField, OrderDirection } from "@/gql/graphql";
import { graphqlLanguageCodeVariables } from "@/lib/graphql-locale";
import { sortProductsForDisplay } from "@/config/merchandising";
import { CACHE_PROFILES, cachedQuery } from "@/lib/saleor";

/**
 * Products from a collection for the homepage featured section.
 * A Saleor failure throws so the outage is not cached as an empty grid.
 */
export async function getFeaturedProducts(
	channel: string,
	localeSlug: string,
	limit = 12,
	collectionSlug = "featured-products",
) {
	"use cache";

	// Over-fetch so deprioritised products (see config/merchandising) can be sorted to
	// the end without shortening the homepage grid below `limit`.
	const fetchLimit = Math.min(limit * 3, 48);

	const data = await cachedQuery(ProductListByCollectionDocument, {
		profile: CACHE_PROFILES.collections,
		tag: collectionSlug,
		variables: {
			slug: collectionSlug,
			channel,
			first: fetchLimit,
			sortBy: { field: ProductOrderField.Collection, direction: OrderDirection.Asc },
			...graphqlLanguageCodeVariables(localeSlug),
		},
	});

	const products = data.collection?.products?.edges.map(({ node }) => node) ?? [];

	return sortProductsForDisplay(products).slice(0, limit);
}
