"use client";

import { useEffect, useState } from "react";
import { LinkWithChannel } from "@/ui/atoms/link-with-channel";

const STORAGE_KEY = "lt-age-verified";

/**
 * 18+ gate. Rendered as part of the server HTML so restricted catalogue content is
 * never painted before the decision is made; a returning visitor is unblocked on
 * mount once localStorage confirms a previous confirmation.
 *
 * Kept deliberately non-interactive with the rest of the app: no cart, no session
 * touch, no navigation — a decline sends the visitor away from the store.
 */
export function AgeGate() {
	const [decision, setDecision] = useState<"pending" | "accepted">("pending");

	useEffect(() => {
		try {
			if (window.localStorage.getItem(STORAGE_KEY) === "1") {
				setDecision("accepted");
			}
		} catch {
			// Storage blocked (private mode, embedded webview) — keep asking.
		}
	}, []);

	useEffect(() => {
		if (decision !== "pending") return;
		const { overflow } = document.body.style;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = overflow;
		};
	}, [decision]);

	if (decision === "accepted") return null;

	const accept = () => {
		try {
			window.localStorage.setItem(STORAGE_KEY, "1");
		} catch {
			// Ignore — the gate simply shows again next visit.
		}
		setDecision("accepted");
	};

	const decline = () => {
		window.location.replace("https://www.google.com/");
	};

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="age-gate-heading"
			className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/60 px-4 backdrop-blur-[2px]"
		>
			<div className="w-full max-w-md rounded-card border border-border bg-background p-8 text-center shadow-2xl ring-1 ring-black/5">
				<p className="text-eyebrow uppercase text-muted-foreground">Age verification</p>
				<h2 id="age-gate-heading" className="mt-2 text-balance text-h2">
					Are you 18 or older?
				</h2>
				<p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground">
					This store sells tobacco and vaping products to adults only. You must be at least 18 to enter, and
					our staff may ask for photo ID when you collect.
				</p>
				<div className="mt-7 flex flex-col gap-3">
					<button
						type="button"
						onClick={accept}
						className="w-full rounded-md bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
					>
						Yes, I am 18 or older
					</button>
					<button
						type="button"
						onClick={decline}
						className="w-full rounded-md border border-border px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
					>
						No, take me out of here
					</button>
				</div>
				<p className="mt-5 text-xs leading-relaxed text-muted-foreground">
					By continuing you also accept our{" "}
					<LinkWithChannel href="/pages/terms" className="underline underline-offset-2">
						terms of service
					</LinkWithChannel>{" "}
					and{" "}
					<LinkWithChannel href="/pages/privacy" className="underline underline-offset-2">
						privacy policy
					</LinkWithChannel>
					.
				</p>
			</div>
		</div>
	);
}
