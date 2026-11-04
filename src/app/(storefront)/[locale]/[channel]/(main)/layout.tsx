import { type ReactNode, Suspense } from "react";
import { type Metadata } from "next";
import { StorefrontProviders } from "@/ui/components/storefront-providers";
import { brandConfig } from "@/config/brand";
import { AnnouncementBarSkeleton } from "@/ui/sections/announcement-bar/announcement-bar";
import { ScrollToTopOnNavigate } from "@/ui/components/shared/scroll-to-top-on-navigate";
import { AnnouncementBarSlot, CartDrawerSlot } from "./browse-chrome-slots";
import { MainChrome } from "./main-chrome";
import { AgeGate } from "@/ui/components/age-gate";

// Define the title template here so it cascades to every browse page (products, search,
// categories, …) — a plain-string title would not propagate the brand suffix to children.
export const metadata: Metadata = {
	// Brand and domain are the same string, so a bare site name would render as
	// "tobaccolane.shop | tobaccolane.shop". The default is a short line instead.
	title: { default: "Cartons, menthol and vapes", template: brandConfig.titleTemplate },
	description: brandConfig.description,
};

type LayoutProps = {
	children: ReactNode;
	params: Promise<{ locale: string; channel: string }>;
};

export default function RootLayout({ children, params }: LayoutProps) {
	return (
		<>
			{/*
			 * Announcement + scroll restore sit outside the client providers so
			 * instant-shell validation can see their Suspense boundaries. Header /
			 * footer / cart stay inside CartProvider (cart button + drawer).
			 */}
			<Suspense fallback={null}>
				<ScrollToTopOnNavigate />
			</Suspense>
			<Suspense fallback={<AnnouncementBarSkeleton />}>
				<AnnouncementBarSlot params={params} />
			</Suspense>
			<AgeGate />
			<StorefrontProviders>
				<MainChrome params={params}>{children}</MainChrome>
				<Suspense fallback={null}>
					<CartDrawerSlot params={params} />
				</Suspense>
			</StorefrontProviders>
		</>
	);
}
