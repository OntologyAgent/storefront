import { type CheckoutAuthorizeStatusEnum } from "@/checkout/graphql";
import { isCheckoutFreeOrder } from "./checkout-pay-amount";
import { isCheckoutReadyToComplete } from "./checkout-payment-status";

/**
 * 到店付款（pay at store）。
 *
 * 现阶段只做「门店自提 + 到店付款」：不接在线支付网关，结账时直接生成一笔
 * **未付款订单**（Saleor channel 需开启 `allowUnpaidOrders`，否则
 * `checkoutComplete` 会返回 CHECKOUT_NOT_FULLY_PAID）。到店收款后在后台
 * 手动标记已付款即可。
 *
 * 与 $0 订单的「免费下单」流程区分：免费订单仍走原有的 FreeOrderCheckout。
 */
export const PAY_AT_STORE = true;

type PayAtStoreCheckoutShape = {
	authorizeStatus: CheckoutAuthorizeStatusEnum;
	totalPrice?: { gross?: { amount: number; currency: string } | null } | null;
	subtotalPrice?: { gross?: { amount: number; currency: string } | null } | null;
	discount?: { amount: number; currency: string } | null;
};

/** 需要到店付款的结账：非 $0、且尚未被授权满额。 */
export function isPayAtStoreCheckout(checkout: PayAtStoreCheckoutShape): boolean {
	if (!PAY_AT_STORE) {
		return false;
	}
	if (isCheckoutReadyToComplete(checkout)) {
		return false;
	}
	return !isCheckoutFreeOrder(checkout);
}
