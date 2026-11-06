"use client";

import { useCallback, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Store } from "lucide-react";
import { Button } from "@/ui/components/ui/button";
import { Label } from "@/ui/components/ui/label";
import { updatePickupRegion } from "@/app/(storefront)/[locale]/[channel]/(main)/account/actions";
import { PICKUP_REGIONS, regionFromMetadata } from "@/checkout/lib/regions";
import { resolveAccountActionError } from "@/ui/components/account/account-action-result";
import { useTranslations } from "next-intl";

type Props = {
	metadata: ReadonlyArray<{ key: string; value: string }>;
};

/**
 * Pickup region lives on the customer, chosen once. Checkout reads it and never asks
 * again — this is the only place it can be changed after sign-up.
 */
export function PickupRegionForm({ metadata }: Props) {
	const t = useTranslations("account");
	const router = useRouter();
	const current = regionFromMetadata(metadata);
	const [isPending, startTransition] = useTransition();
	const [error, setError] = useState("");

	const handleSubmit = useCallback(
		(formData: FormData) => {
			setError("");
			startTransition(async () => {
				const result = await updatePickupRegion(formData);
				if (!result.success) {
					setError(resolveAccountActionError(t, result));
				} else {
					router.refresh();
				}
			});
		},
		[router, t],
	);

	return (
		<form action={handleSubmit} className="space-y-3">
			<div className="flex items-start gap-3">
				<Store className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
				<div className="min-w-0 flex-1">
					<p className="text-sm text-muted-foreground">Pickup region</p>
					<p className="text-sm text-muted-foreground">
						Orders are collected from this area. Checkout does not ask again.
					</p>
				</div>
			</div>

			<div className="flex flex-wrap items-end gap-3">
				<div className="min-w-[200px] flex-1 space-y-1.5">
					<Label htmlFor="pickupRegion">Region</Label>
					<select
						id="pickupRegion"
						name="pickupRegion"
						defaultValue={current ?? PICKUP_REGIONS[0].slug}
						className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
					>
						{PICKUP_REGIONS.map((region) => (
							<option key={region.slug} value={region.slug}>
								{region.label}
							</option>
						))}
					</select>
				</div>
				<Button type="submit" disabled={isPending} className="h-10">
					{isPending ? "Saving…" : "Save region"}
				</Button>
			</div>

			{error ? <p className="text-sm text-destructive">{error}</p> : null}
		</form>
	);
}
