/**
 * Remembers the last pickup store the customer chose, so the next checkout preselects it.
 * Cookie (not localStorage) on purpose: the checkout step is server-rendered, and a cookie
 * is available on the very first paint after the collection points resolve.
 */
const COOKIE = "lucky_pickup_point";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function readPickupPreference(): string | null {
	if (typeof document === "undefined") return null;
	const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
	return match ? decodeURIComponent(match[1]) : null;
}

export function writePickupPreference(warehouseId: string): void {
	if (typeof document === "undefined") return;
	document.cookie = `${COOKIE}=${encodeURIComponent(warehouseId)}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}
