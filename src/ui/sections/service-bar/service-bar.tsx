import { Package, ShieldCheck, Store } from "lucide-react";
import { type ServiceHighlight, serviceHighlights } from "@/config/merchandising";
import { Section } from "@/ui/sections/section";

function HighlightIcon({ icon }: { icon: ServiceHighlight["icon"] }) {
	const className = "h-5 w-5";
	if (icon === "store") return <Store className={className} aria-hidden="true" />;
	if (icon === "package") return <Package className={className} aria-hidden="true" />;
	if (icon === "shield") return <ShieldCheck className={className} aria-hidden="true" />;
	return (
		<span
			aria-hidden="true"
			className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px] font-semibold leading-none"
		>
			18+
		</span>
	);
}

/**
 * Slim service strip under the hero: the four facts that answer "can I trust this shop"
 * before the shopper reaches the product grid. Server Component, no client JS.
 */
export function ServiceBar({ items = serviceHighlights }: { items?: readonly ServiceHighlight[] }) {
	if (items.length === 0) return null;

	return (
		<Section tone="default" width="content" spacing="none" className="border-b border-border">
			<ul className="grid grid-cols-2 gap-x-6 gap-y-6 py-7 md:grid-cols-4">
				{items.map((item) => (
					<li key={item.title} className="flex items-start gap-3">
						<span className="mt-0.5 text-foreground">
							<HighlightIcon icon={item.icon} />
						</span>
						<span className="min-w-0">
							<span className="block text-sm font-medium text-foreground">{item.title}</span>
							<span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{item.text}</span>
						</span>
					</li>
				))}
			</ul>
		</Section>
	);
}
