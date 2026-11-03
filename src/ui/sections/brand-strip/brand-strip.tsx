import { brandLinks } from "@/config/merchandising";
import { LinkWithChannel } from "@/ui/atoms/link-with-channel";
import { Section } from "@/ui/sections/section";
import { SectionHeader } from "@/ui/sections/section-header";

/**
 * Text-only brand strip. Brands live on product attributes rather than their own
 * landing pages, so each pill is a search shortcut (`/search?query=…`). Swap for
 * collection links once per-brand collections exist.
 */
export function BrandStrip() {
	if (brandLinks.length === 0) return null;

	return (
		<Section tone="muted" width="content" spacing="md" aria-labelledby="brand-strip-heading">
			<SectionHeader id="brand-strip-heading" heading="Shop by brand" align="center" className="mb-8" />
			<ul className="flex flex-wrap items-center justify-center gap-2.5">
				{brandLinks.map((brand) => (
					<li key={brand.label}>
						<LinkWithChannel
							href={`/collections/${brand.slug}`}
							className="inline-flex items-center rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/40 hover:bg-secondary"
						>
							{brand.label}
						</LinkWithChannel>
					</li>
				))}
			</ul>
		</Section>
	);
}
