import { type CheckoutFragment } from "@/checkout/graphql";
import { isCheckoutFreeOrder } from "@/checkout/lib/payment/checkout-pay-amount";
import { isCheckoutReadyToComplete } from "@/checkout/lib/payment/checkout-payment-status";
import { isPayAtStoreCheckout } from "@/checkout/lib/payment/pay-at-store";

type CheckoutPaymentUiState = Pick<
	CheckoutFragment,
	"authorizeStatus" | "totalPrice" | "subtotalPrice" | "discount"
>;

/**
 * Paid checkouts hide the PSP form once authorizeStatus is FULL.
 * $0 totals also reach FULL without a transaction but still need FreeOrderCheckout.
 */
export function shouldShowPaymentMethodArea(checkout: CheckoutPaymentUiState): boolean {
	// 到店付款模式：不展示任何 PSP 表单，直接「确认下单」。
	if (isPayAtStoreCheckout(checkout)) {
		return false;
	}

	if (isCheckoutFreeOrder(checkout)) {
		return true;
	}

	return !isCheckoutReadyToComplete(checkout);
}
