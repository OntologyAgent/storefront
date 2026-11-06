/**
 * Pickup regions.
 *
 * The business moved from "pick the shop at checkout" to "pick your region once, at
 * sign-up". The region is stored on the customer as metadata `pickup_region` = warehouse
 * slug, and checkout resolves it to the matching collection point without asking again.
 */
export const PICKUP_REGIONS = [
	{ slug: "narwee", label: "Narwee" },
	{ slug: "punchbowl", label: "Punchbowl" },
	{ slug: "concord", label: "Concord" },
	{ slug: "top-ryde", label: "Top Ryde" },
] as const;

export type PickupRegionSlug = (typeof PICKUP_REGIONS)[number]["slug"];

/** Fallback when a guest has no region yet (the original store). */
export const DEFAULT_PICKUP_REGION: PickupRegionSlug = "narwee";

export const PICKUP_REGION_METADATA_KEY = "pickup_region";

export function isPickupRegionSlug(value: string | null | undefined): value is PickupRegionSlug {
	return !!value && PICKUP_REGIONS.some((region) => region.slug === value);
}

export function pickupRegionLabel(slug: string | null | undefined): string {
	return PICKUP_REGIONS.find((region) => region.slug === slug)?.label ?? "";
}

/** Reads `pickup_region` from a Saleor metadata array. */
export function regionFromMetadata(
	metadata: ReadonlyArray<{ key: string; value: string }> | null | undefined,
): PickupRegionSlug | null {
	const entry = metadata?.find((item) => item.key === PICKUP_REGION_METADATA_KEY);
	return isPickupRegionSlug(entry?.value) ? entry.value : null;
}
