import "server-only";

import type { ListingPayload, ListingSurface } from "@/lib/catalog/listing-query";
import type { ListingViewParams } from "@/lib/catalog/listing-view";
import { loadListing } from "@/lib/listing/policy";
import { toListingPayload } from "@/lib/listing/payload";
import { listingQueryFromInput } from "@/lib/listing/query";
import { sortProductsForDisplay } from "@/config/merchandising";

export async function loadListingView(input: {
	surface: ListingSurface;
	locale: string;
	channel: string;
	slug?: string;
	view: ListingViewParams;
}): Promise<ListingPayload | null> {
	const query = listingQueryFromInput(input);
	if (!query) return null;
	const result = await loadListing(query);
	if (!result) return null;
	const payload = toListingPayload(result);

	// The default grid is the storefront's merchandised surface: push products with
	// unpresentable photography to the end. Explicit customer sorts are left untouched.
	if (!input.view.sort || input.view.sort === "featured") {
		payload.products = sortProductsForDisplay(payload.products);
	}

	return payload;
}
