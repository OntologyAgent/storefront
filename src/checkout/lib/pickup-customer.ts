/**
 * The name the customer wants on the pickup voucher.
 *
 * Collected once on the contact step, kept in localStorage so the shipping step (a
 * different client component) can put it on the billing address. Saleor forces the
 * shipping address to the warehouse for click & collect, so the billing name is what
 * shows up in the dashboard's Customer column.
 */
const KEY = "lucky_pickup_customer_name";

export function readPickupCustomerName(): string {
	if (typeof window === "undefined") return "";
	try {
		return window.localStorage.getItem(KEY) ?? "";
	} catch {
		return "";
	}
}

export function writePickupCustomerName(name: string): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(KEY, name.trim());
	} catch {
		// private mode / storage disabled: the name simply falls back to "Click & Collect"
	}
}
