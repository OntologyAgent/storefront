import "server-only";

import { CollectionListDocument } from "@/gql/graphql";
import { graphqlLanguageCodeVariables } from "@/lib/graphql-locale";
import { CACHE_PROFILES, cachedQuery } from "@/lib/saleor";

export type CollectionSummary = {
	slug: string;
	name: string;
	productCount: number;
};

/**
 * Every collection published in the channel — powers the `/collections` index.
 *
 * `"use cache"` + the collections profile, so a publish/unpublish in the Dashboard
 * revalidates the index through the existing Saleor webhook (shared `collections` tag).
 * Empty collections are dropped: a 0-product landing page is a thin page, not a shelf.
 */
export async function getCollectionList(
	channel: string,
	localeSlug: string,
): Promise<CollectionSummary[]> {
	"use cache";

	const data = await cachedQuery(CollectionListDocument, {
		profile: CACHE_PROFILES.collections,
		tag: "collections-index",
		variables: {
			channel,
			first: 100,
			...graphqlLanguageCodeVariables(localeSlug),
		},
	});

	return (data.collections?.edges ?? [])
		.map(({ node }) => ({
			slug: node.slug,
			name: node.translation?.name || node.name,
			productCount: node.products?.totalCount ?? 0,
		}))
		.filter((collection) => collection.productCount > 0)
		.sort((a, b) => a.name.localeCompare(b.name));
}
