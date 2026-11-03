/**
 * Merchandising configuration for the storefront.
 *
 * Two jobs:
 *  1. Deprioritise products whose photography is not good enough for a hero slot
 *     (graphic-warning packshots, marketing posters, watermarked reseller photos).
 *     These still sell — they are just pushed to the end of every grid.
 *     Delete a slug from `deferredProductSlugs` as soon as a proper packshot is uploaded.
 *  2. Small pieces of homepage merchandising that are not (yet) editable in the
 *     Dashboard content models: the service bar, the brand strip and the FAQ.
 */

/** Slugs whose thumbnail is not presentable in a merchandised slot. Order-insensitive. */
export const deferredProductSlugs: readonly string[] = [
	// Graphic health-warning packshots
	"jps-classic-original",
	"dunhill-red-10mg",
	"manchester-sapphire-blue-5mg",
	"marlboro-ice-blast",
	// Marketing posters / watermarked reseller photos
	"crown-bar-15000",
	"alibarbar-ingot-9000",
	"seven-stars-charcoal-filter",
	"nanyang-double-happiness",
	"marlboro-double-blast",
	// Low quality / badly cropped packshots
	"double-happiness-soft",
	"kent-switch",
	"iget-moon",
];

const deferred = new Set(deferredProductSlugs);

type MaybeSlug = { slug?: string | null } | null | undefined;

/**
 * Stable partition: presentable products keep their server order, deferred ones move
 * to the end. Input order is never otherwise changed, so a Saleor sort still wins.
 */
export function sortProductsForDisplay<T extends MaybeSlug>(items: readonly T[]): T[] {
	const leading: T[] = [];
	const trailing: T[] = [];
	for (const item of items) {
		if (!item) continue;
		if (item.slug && deferred.has(item.slug)) trailing.push(item);
		else leading.push(item);
	}
	return [...leading, ...trailing];
}

export function isDeferredProduct(slug: string | null | undefined): boolean {
	return Boolean(slug && deferred.has(slug));
}

export type ServiceHighlight = {
	title: string;
	text: string;
	icon: "store" | "package" | "shield" | "age";
};

export const serviceHighlights: readonly ServiceHighlight[] = [
	{
		icon: "store",
		title: "Free store collection",
		text: "Narwee · Punchbowl · Concord · Top Ryde",
	},
	{
		icon: "package",
		title: "Discreet packaging",
		text: "Plain outer bag, no product names",
	},
	{
		icon: "shield",
		title: "Sealed stock",
		text: "Factory cartons, temperature controlled",
	},
	{
		icon: "age",
		title: "18+ only",
		text: "ID may be requested at collection",
	},
];

/**
 * Homepage brand strip. Each pill links to the brand collection created alongside the
 * catalogue import (`brand-<slug>`), so the landing page can be merchandised in the
 * Dashboard instead of dumping the shopper into a search results page.
 */
export const brandLinks: readonly { label: string; slug: string }[] = [
	{ label: "Marlboro", slug: "brand-marlboro" },
	{ label: "Mevius", slug: "brand-mevius" },
	{ label: "ESSE", slug: "brand-esse" },
	{ label: "Manchester", slug: "brand-manchester" },
	{ label: "Chunghwa", slug: "brand-chunghwa" },
	{ label: "Dunhill", slug: "brand-dunhill" },
	{ label: "Kent", slug: "brand-kent" },
	{ label: "Disposables", slug: "brand-iget" },
];

export type HomepageFaqItem = { question: string; answer: string };

export const homepageFaq: readonly HomepageFaqItem[] = [
	{
		question: "How do I get my order — do you deliver?",
		answer:
			"No delivery: we are click & collect only. Reserve online, then pick your order up at one of our four Sydney stores — Narwee Newsagency, Punchbowl Convenience Store, Concord Tobacconist or Top Ryde Convenience Store. Most orders are ready the same day during opening hours.",
	},
	{
		question: "Is collection really free?",
		answer:
			"Yes. Collection is free on every order, with no minimum spend and no delivery fee. You only pay for the products — at the store, when you pick them up.",
	},
	{
		question: "Is the packaging discreet?",
		answer:
			"Always. Your order is packed in a plain outer bag with no product names or branding on the outside, and handed over the counter at collection.",
	},
	{
		question: "What is a carton?",
		answer:
			"A carton is ten packs, factory sealed — 200 cigarettes. It is the cheapest way to buy, and mixing strengths or flavours in one carton order is fine.",
	},
	{
		question: "Do I need to prove my age?",
		answer:
			"This store is for adults 18 and over. You confirm your age before browsing, and our staff may ask for ID when you collect.",
	},
];

/**
 * Editorial slides for the homepage hero panel.
 *
 * Photos are Pexels stock (Pexels License — free for commercial use, no attribution
 * required), chosen so each slide actually shows the category:
 *  - pexels.com/photo/14174943 — stockman lighting a cigarette, horse and hills behind
 *  - pexels.com/photo/15422250 — hoodie + cap, exhaling vapour in neon light
 * Cropped to 2000×2000 WebP; `objectPosition` keeps the subject in frame when the panel
 * crops on mobile.
 *
 * Swap `src` for real brand photography when it exists — use a NEW filename, because
 * `/public` is served with a 30-day cache header.
 */
export type HeroSlide = {
	src: string;
	alt: string;
	kicker: string;
	caption?: string;
	/** Category (or any catalog path) the whole slide links to. */
	href: string;
	/** Label for the in-slide link, e.g. "Shop cartons". */
	hrefLabel: string;
	/** CSS object-position for the cover crop. Defaults to `center`. */
	objectPosition?: string;
};

export const heroSlides: readonly HeroSlide[] = [
	{
		src: "/hero/cigarette-outback.webp",
		alt: "A stockman in a wide-brim hat lighting a cigarette, with a horse and hills behind him",
		kicker: "Golden hour · open country",
		caption: "Old-school stockmen, sealed cartons, no rush.",
		href: "/categories/cigarettes-cartons",
		hrefLabel: "Shop cartons",
		objectPosition: "50% 42%",
	},
	{
		src: "/hero/vape-night.webp",
		alt: "A young man in a cap and hoodie exhaling vapour under purple and green neon",
		kicker: "After dark · night city",
		caption: "Neon streets, late queues, a vape in hand.",
		href: "/categories/vapes-disposable",
		hrefLabel: "Shop disposables",
		objectPosition: "50% 42%",
	},
];
