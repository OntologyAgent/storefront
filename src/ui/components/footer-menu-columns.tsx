import Link from "next/link";
import type { MenuItem } from "@/lib/menus/get-menu-data";
import { getMenuItemHref, getMenuItemLabel } from "@/lib/menus/menu-item-utils";
import { LinkWithChannel } from "@/ui/atoms/link-with-channel";
import { NavHrefLink } from "@/ui/atoms/nav-href-link";

/**
 * Fallback columns used until a `footer` menu exists in the Dashboard
 * (Configuration → Navigation → Menus). Every href points at a real CMS page under
 * `/pages/*` or a real catalog route, so nothing 404s out of the box.
 */
const defaultFooterLinks: readonly { heading: string; links: readonly { label: string; href: string }[] }[] = [
	{
		heading: "Shop",
		links: [
			{ label: "Cartons (10 packs)", href: "/categories/cigarettes-cartons" },
			{ label: "Disposables", href: "/categories/vapes-disposable" },
			{ label: "All products", href: "/products" },
		],
	},
	{
		heading: "Support",
		links: [
			{ label: "Contact us", href: "/pages/contact" },
			{ label: "FAQs", href: "/pages/faq" },
			{ label: "Collection & pickup", href: "/pages/shipping" },
			{ label: "Returns & refunds", href: "/pages/returns" },
		],
	},
	{
		heading: "Company",
		links: [
			{ label: "About us", href: "/pages/about" },
			{ label: "Privacy policy", href: "/pages/privacy" },
			{ label: "Terms of service", href: "/pages/terms" },
		],
	},
];

function FooterMenuChildLink({ child }: { child: MenuItem }) {
	const href = getMenuItemHref(child);
	const label = getMenuItemLabel(child);
	if (!href || !label) return null;

	if (child.category || child.collection || child.page) {
		return (
			<LinkWithChannel
				href={href}
				prefetch={false}
				className="text-sm text-inverse-subtle transition-colors hover:text-inverse"
			>
				{label}
			</LinkWithChannel>
		);
	}

	return (
		<NavHrefLink
			href={href}
			prefetch={false}
			className="text-sm text-inverse-subtle transition-colors hover:text-inverse"
		>
			{label}
		</NavHrefLink>
	);
}

export function FooterMenuColumns({ items }: { items: MenuItem[] }) {
	if (items.length === 0) {
		return (
			<>
				{defaultFooterLinks.map((column) => (
					<div key={column.heading}>
						<h4 className="mb-4 text-sm font-medium text-inverse">{column.heading}</h4>
						<ul className="space-y-3">
							{column.links.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										prefetch={false}
										className="text-sm text-inverse-subtle transition-colors hover:text-inverse"
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				))}
			</>
		);
	}

	return (
		<>
			{items.map((item) => (
				<div key={item.id}>
					<h4 className="mb-4 text-sm font-medium text-inverse">{item.name}</h4>
					<ul className="space-y-3">
						{item.children?.map((child) => (
							<li key={child.id}>
								<FooterMenuChildLink child={child} />
							</li>
						))}
					</ul>
				</div>
			))}
		</>
	);
}
