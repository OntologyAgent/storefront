/**
 * Click & collect configuration.
 *
 * The storefront runs pickup-only: every checkout line is collected in store, so the
 * shipping-method list is hidden and the delivery method is always a `Warehouse`
 * (`checkoutDeliveryMethodUpdate` accepts a warehouse id exactly like a shipping
 * method id, and Saleor zeroes the shipping price for it).
 *
 * Flip `PICKUP_ONLY` to false to offer delivery and pickup side by side.
 */
export const PICKUP_ONLY = true;

/** A click & collect location as returned by the collection-points query. */
export type PickupPoint = {
	id: string;
	name: string;
	address: {
		streetAddress1?: string | null;
		city?: string | null;
		postalCode?: string | null;
		countryArea?: string | null;
	} | null;
};

/** Human-readable label for a warehouse address, used on the pickup cards. */
export function formatPickupAddress(address: {
	streetAddress1?: string | null;
	city?: string | null;
	postalCode?: string | null;
	countryArea?: string | null;
} | null | undefined): string {
	if (!address) return "";
	const city = [address.city, address.countryArea, address.postalCode].filter(Boolean).join(" ");
	return [address.streetAddress1, city].filter(Boolean).join(", ");
}
