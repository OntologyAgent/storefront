"use client";

import { useState, useCallback, useMemo, type FC } from "react";
import { Truck, Clock, Leaf, ChevronLeft, AlertTriangle, Store } from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { cn } from "@/lib/utils";
import {
	getCheckoutCollectionPoints,
	getCustomerPickupRegion,
	setPickupBillingAddress,
	updateCheckoutDeliveryMethod,
} from "@/app/(checkout)/actions";
import { availabilityIssueFromFieldErrors } from "@/checkout/lib/checkout-availability";
import { validateCheckoutFulfillment } from "@/checkout/lib/validate-checkout-fulfillment";
import { useCheckoutAvailability } from "@/checkout/providers/checkout-availability";
import { type CheckoutFragment } from "@/checkout/graphql";
import type { DeliveryOption, ServerCheckout } from "@/checkout/lib/checkout-types";
import { hasDeliveryProblem } from "@/checkout/lib/delivery-problems";
import { resolveSelectedDeliveryId } from "@/checkout/lib/shipping-deliveries";
import {
	CheckoutSummaryContext,
	buildShippingSummaryRows,
	useCheckoutSummaryLabels,
} from "./checkout-summary-context";
import { formatShippingPrice } from "@/checkout/lib/utils/money";
import { MobileStickyAction } from "./mobile-sticky-action";
import { useCheckoutStepNumber } from "@/checkout/hooks/use-checkout-steps";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { PICKUP_ONLY, type PickupPoint } from "@/checkout/lib/pickup";
import { readPickupPreference, writePickupPreference } from "@/checkout/lib/pickup-preference";
import { DEFAULT_PICKUP_REGION, PICKUP_REGIONS } from "@/checkout/lib/regions";
import { LinkWithChannel } from "@/ui/atoms/link-with-channel";
import { readPickupCustomerName } from "@/checkout/lib/pickup-customer";

interface ShippingStepProps {
	checkout: CheckoutFragment;
	deliveries: DeliveryOption[];
	isLoadingDeliveries: boolean;
	onBack: () => void;
	onComplete: (checkout: ServerCheckout) => void;
}

export const ShippingStep: FC<ShippingStepProps> = ({
	checkout,
	deliveries,
	isLoadingDeliveries,
	onBack,
	onComplete,
}) => {
	const t = useTranslations("checkout");
	const tActions = useTranslations("checkout.actions");
	const shippingStep = useCheckoutStepNumber("SHIPPING", true);
	const summaryLabels = useCheckoutSummaryLabels();
	const summaryRows = useMemo(
		() => buildShippingSummaryRows(checkout, summaryLabels),
		[checkout, summaryLabels],
	);
	const hasShippingAddress = !!checkout.shippingAddress;
	const savedDeliveryId = checkout.delivery?.id;
	const [collectionPoints, setCollectionPoints] = useState<PickupPoint[]>([]);
	const [savedPickupId, setSavedPickupId] = useState<string | null>(null);
	const [regionSlug, setRegionSlug] = useState<string | null>(null);
	const [regionKnown, setRegionKnown] = useState(false);
	const hasPickup = collectionPoints.length > 0;
	const pickupOnly = PICKUP_ONLY && hasPickup;

	useEffect(() => {
		let cancelled = false;
		void (async () => {
			const result = await getCheckoutCollectionPoints(checkout.id);
			if (cancelled || !result.ok) return;
			setCollectionPoints(result.points);
			setSavedPickupId(result.selectedId);

			// Region comes from the account (set at sign-up), then the cookie from a
			// previous visit, then the default store. Checkout never asks again.
			const accountRegion = await getCustomerPickupRegion();
			const rememberedRegion = readPickupPreference();
			const region = accountRegion ?? rememberedRegion ?? DEFAULT_PICKUP_REGION;
			const isKnown = Boolean(accountRegion ?? rememberedRegion);
			setRegionSlug(region);
			setRegionKnown(isKnown);

			if (!result.selectedId) {
				const match =
					result.points.find((point) => point.slug === region) ?? result.points[0] ?? null;
				if (match) {
					setUserPickupId(match.id);
					writePickupPreference(region);
				}
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [checkout.id]);

	const [userSelectedMethod, setUserSelectedMethod] = useState<string | undefined>();
	const [userPickupId, setUserPickupId] = useState<string | undefined>();
	const selectedMethod = resolveSelectedDeliveryId(userSelectedMethod, deliveries, savedDeliveryId);
	const selectedPickupId = userPickupId ?? savedPickupId ?? undefined;
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { availabilityIssue, setAvailabilityIssue } = useCheckoutAvailability();

	const showInvalidWarning =
		hasDeliveryProblem(checkout, "CheckoutProblemDeliveryMethodInvalid") &&
		selectedMethod === savedDeliveryId;

	const handleSubmit = useCallback(
		async (event?: React.FormEvent) => {
			event?.preventDefault();
			if (isSubmitting) return;

			const deliveryChoice = selectedPickupId ?? selectedMethod;
			if (!deliveryChoice) {
				setError(pickupOnly ? "Select a store to collect from." : t("errors.selectShippingMethod"));
				(document.querySelector('input[name="shipping"]') as HTMLElement | null)?.focus();
				return;
			}

			setIsSubmitting(true);
			setError(null);
			setAvailabilityIssue(null);

			try {
				let nextCheckout = checkout;
				const currentChoice = savedPickupId ?? savedDeliveryId;

				if (deliveryChoice !== currentChoice) {
					const result = await updateCheckoutDeliveryMethod(nextCheckout.id, deliveryChoice);
					if (!result.ok) {
						const issue = result.fieldErrors?.length
							? availabilityIssueFromFieldErrors(checkout.lines, result.fieldErrors)
							: null;
						if (issue) {
							setAvailabilityIssue(issue);
						} else {
							setError(
								result.error ?? result.fieldErrors?.[0]?.message ?? t("errors.updateShippingMethodFailed"),
							);
						}
						setIsSubmitting(false);
						return;
					}
					nextCheckout = result.checkout;
				}

				const fulfillment = await validateCheckoutFulfillment(
					nextCheckout,
					t("errors.fulfillmentCheckFailed"),
					{ skipAddressResubmit: pickupOnly },
				);
				if (!fulfillment.ok) {
					if (fulfillment.reason === "availability") {
						setAvailabilityIssue(fulfillment.issue);
					} else {
						setError(fulfillment.error);
					}
					setIsSubmitting(false);
					return;
				}

				// 自提订单不用客户填地址：Saleor 选了仓库后会自带收货地址，
				// 这里只补一个账单地址（checkoutComplete 强制要求）。
				if (pickupOnly && selectedPickupId) {
					const point = collectionPoints.find((p) => p.id === selectedPickupId);
					if (point) {
						const billingResult = await setPickupBillingAddress(
							nextCheckout.id,
							point,
							readPickupCustomerName(),
						);
						if (!billingResult.ok) {
							setError(billingResult.error ?? t("errors.fulfillmentCheckFailed"));
							setIsSubmitting(false);
							return;
						}
						nextCheckout = billingResult.checkout;
					}
				}

				onComplete(nextCheckout);
			} catch {
				setError(t("errors.fulfillmentCheckFailed"));
				setIsSubmitting(false);
			}
		},
		[
			selectedMethod,
			selectedPickupId,
			savedDeliveryId,
			savedPickupId,
			pickupOnly,
			collectionPoints,
			selectedPickupId,
			onComplete,
			checkout,
			isSubmitting,
			setAvailabilityIssue,
			t,
		],
	);

	const showSpinner = isLoadingDeliveries && !isSubmitting && deliveries.length === 0;
	const canContinue =
		!isSubmitting &&
		!availabilityIssue &&
		(selectedPickupId || (deliveries.length > 0 && !!selectedMethod)) &&
		(!showSpinner || pickupOnly);
	const buttonText = isSubmitting
		? tActions("saving")
		: showSpinner
			? tActions("loading")
			: tActions("continueToPayment");

	return (
		<form className="space-y-8" onSubmit={handleSubmit}>
			<CheckoutSummaryContext checkout={checkout} rows={summaryRows} onGoToStep={onBack} />

			{showInvalidWarning ? (
				<div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
					<AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
					<p className="text-sm text-amber-800">
						Your previously selected shipping method is no longer available. Please select a new one.
					</p>
				</div>
			) : null}

			{hasPickup ? (
				<section className="space-y-4">
					<h2 className="text-lg font-semibold">Collect in store</h2>

					{error ? <p className="text-sm text-destructive">{error}</p> : null}

					<div className="rounded-lg border border-foreground/20 bg-secondary/40 p-4">
						<div className="flex items-start gap-3">
							<Store className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
							<div className="min-w-0 flex-1">
								<p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
									Your pickup region
								</p>
								<p className="mt-1 text-xl font-semibold">
									{collectionPoints.find((point) => point.id === selectedPickupId)?.name ??
										PICKUP_REGIONS.find((region) => region.slug === regionSlug)?.label ??
										"—"}
								</p>
								<p className="mt-2 text-sm text-muted-foreground">
									Free collection. We email you when the order is packed — bring photo ID that matches
									the order name.
								</p>
							</div>
							<span className="font-medium text-green-600">Free</span>
						</div>
					</div>

					<p className="text-sm text-muted-foreground">
						{regionKnown ? (
							<>
								Pickup region is set in your account.{" "}
								<LinkWithChannel href="/account/settings" className="underline underline-offset-4">
									Change region
								</LinkWithChannel>
							</>
						) : (
							<>
								Using the default region.{" "}
								<LinkWithChannel href="/signup" className="underline underline-offset-4">
									Sign up
								</LinkWithChannel>{" "}
								or{" "}
								<LinkWithChannel href="/login" className="underline underline-offset-4">
									sign in
								</LinkWithChannel>{" "}
								to choose your own.
							</>
						)}
					</p>
				</section>
			) : null}

			{!pickupOnly ? (
			<section className="space-y-4">
				<h2 className="text-lg font-semibold">{t("shipping.methodTitle")}</h2>

				{error ? <p className="text-sm text-destructive">{error}</p> : null}

				{showSpinner ? (
					<div className="flex items-center gap-3 rounded-lg border border-border p-4">
						<div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
						<p className="text-sm text-muted-foreground">{t("shipping.loadingMethods")}</p>
					</div>
				) : deliveries.length === 0 ? (
					<div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
						<p className="text-sm text-amber-800">
							{!hasShippingAddress
								? t("shipping.noAddressYet")
								: `No shipping methods available for ${
										checkout.shippingAddress?.country?.country || "your address"
									}. Please check your address or contact support.`}
						</p>
					</div>
				) : (
					<div className={cn("space-y-3", isSubmitting && "pointer-events-none opacity-60")}>
						{deliveries.map((delivery) => {
							const method = delivery.shippingMethod;
							if (!method) return null;

							const isSelected = selectedMethod === delivery.id;
							const name = method.name.toLowerCase();
							const Icon =
								name.includes("express") || name.includes("fast")
									? Clock
									: name.includes("eco") || name.includes("green")
										? Leaf
										: Truck;
							const isEco = name.includes("eco") || name.includes("green");
							const isFree = method.price?.amount === 0;

							return (
								<label
									key={delivery.id}
									className={cn(
										"flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors",
										"focus-within:ring-2 focus-within:ring-foreground focus-within:ring-offset-2",
										isSelected
											? "border-foreground bg-secondary/50"
											: "border-border hover:border-muted-foreground/50",
									)}
								>
									<input
										type="radio"
										name="shipping"
										value={delivery.id}
										checked={isSelected}
										onChange={() => {
											setUserSelectedMethod(delivery.id);
											setError(null);
										}}
										className="sr-only"
									/>
									<div
										className={cn(
											"flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
											isSelected ? "border-foreground" : "border-muted-foreground/50",
										)}
									>
										{isSelected ? <div className="h-2.5 w-2.5 rounded-full bg-foreground" /> : null}
									</div>
									<Icon className={cn("h-5 w-5", isEco ? "text-green-600" : "text-muted-foreground")} />
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<span className="font-medium">{method.name}</span>
											{isEco ? (
												<span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
													Eco
												</span>
											) : null}
										</div>
										{method.minimumDeliveryDays && method.maximumDeliveryDays ? (
											<p className="text-sm text-muted-foreground">
												{method.minimumDeliveryDays}-{method.maximumDeliveryDays} business days
											</p>
										) : null}
									</div>
									<span className={cn("font-medium", isFree && "text-green-600")}>
										{formatShippingPrice(method.price)}
									</span>
								</label>
							);
						})}
					</div>
				)}
			</section>
			) : null}

			<div className="flex items-center justify-between">
				<button
					type="button"
					onClick={onBack}
					className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					<ChevronLeft className="h-4 w-4" />
					{tActions("returnToInformation")}
				</button>
				<Button type="submit" disabled={!canContinue} className="hidden h-12 px-8 md:flex">
					{buttonText}
				</Button>
			</div>

			<MobileStickyAction
				step={shippingStep}
				isShippingRequired={true}
				type="submit"
				isLoading={showSpinner || isSubmitting}
				disabled={!canContinue}
				loadingText={isSubmitting ? tActions("saving") : tActions("loading")}
			/>
		</form>
	);
};
