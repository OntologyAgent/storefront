import { STOREFRONT_CONTENT_VERSION, type StorefrontContent } from "@/lib/content/types";

/**
 * Code fallback for all storefront marketing copy.
 * Saleor PageType overrides merge on top when CONTENT_PROVIDER=saleor.
 *
 * English SoT for editorial copy — export to Configurator seed: pnpm content:export-seed
 */
export const defaultStorefrontContent = {
	version: STOREFRONT_CONTENT_VERSION,
	// Single source of truth for channel-wide facts. Copy references these via
	// `{freeShippingThreshold}` / `{returnsWindowDays}` tokens instead of baking the
	// numbers into strings. The store is click & collect only, so the shipping
	// threshold is no longer rendered in any customer-facing copy.
	policies: {
		shipping: {
			freeShippingThreshold: 75,
		},
		returns: {
			windowDays: 30,
		},
	},
	chrome: {
		announcementBar: {
			id: "",
			message: "Free collection at 4 Sydney stores · Discreet packaging · 18+ only",
			href: null,
			linkLabel: null,
			dismissible: true,
		},
		nav: {
			allProductsLabel: "Shop",
			viewAllLabel: "View all {label}",
		},
	},
	surfaces: {
		homepage: {
			hero: {
				eyebrow: "4 Sydney stores · free collection",
				heading: "Cartons, menthol and vapes — collect free.",
				subheading:
					"Factory-sealed cartons from our four Sydney stores. Reserve online and collect free at Narwee, Punchbowl, Concord or Top Ryde — pay when you pick up.",
				primaryCtaLabel: "Shop cartons",
			},
			featuredCollection: {
				heading: "Best sellers",
				collectionSlug: "featured-products",
				limit: 8,
			},
			categories: {
				heading: "Shop by category",
			},
			photoCredits: [],
			brandStory: {
				heading: "An Australian tobacconist, online",
				paragraphs: [
					"Lucky Tobacconist supplies factory-sealed cartons, menthol lines and disposable vapes to adult smokers across Sydney. Every carton is sourced through established suppliers and stored in a temperature-controlled room before it is packed for collection.",
					"Every order is packed in plain, unbranded packaging and handed over the counter when you collect. Collection is always free — no minimum spend — and returns are accepted within {returnsWindowDays} days on unopened items.",
				],
			},
			values: {
				heading: "Why buy from us",
				columns: [
					{
						title: "Genuine stock only",
						text: "Factory-sealed cartons from established suppliers — no repacks, no loose sticks, no substitutes.",
					},
					{
						title: "Collect the same day",
						text: "Reserve online before you head over — most orders are packed and ready within the hour during store hours.",
					},
					{
						title: "30-day returns",
						text: "Damaged, wrong or faulty? Contact us within {returnsWindowDays} days and we replace or refund it.",
					},
				],
				columnsDesktop: 3,
			},
			editorial: {
				heading: "Buying by the carton",
				paragraphs: [
					"A carton is ten packs, factory sealed — the cheapest way to buy and the only way we sell. Mix strengths and flavours in one order; collection is always free.",
				],
				imagePosition: "right",
				ctaLabel: "Browse all cartons",
				image: null,
				imageAlt: "",
			},
		},
		products: {
			title: "Shop all",
			description:
				"Factory-sealed cartons, menthol lines and disposable vapes. Filter by category, strength or brand, and check out with free collection at our four Sydney stores.",
		},
		cart: {
			empty: {
				title: "Your bag is empty",
				body: "Looks like you haven't added anything to your bag yet.",
				ctaLabel: "Start Shopping",
			},
			trust: {
				freeShippingPrefix: "Free collection at 4 Sydney stores",
				returnsLabel: "{returnsWindowDays}-day returns",
			},
			drawer: {
				title: "Your Bag",
				addForFreeShipping: "Free collection at 4 Sydney stores — pay when you collect",
				freeShippingQualified: "Free collection — pay when you collect",
			},
		},
		checkout: {
			emptyCart: {
				title: "Your cart is empty",
				body: "Looks like you haven't added anything to your cart yet.",
				startShoppingLabel: "Start Shopping",
				goBackLabel: "Go back",
			},
			emptySession: {
				title: "Your cart is empty",
				message: "Add items from the store, then return here to complete your purchase.",
			},
			marketingOptInLabel: "Email me with news and offers",
			trust: {
				secureCheckout: "Secure checkout",
				stripeProcessor: "Payments processed by Stripe",
			},
		},
	},
} satisfies StorefrontContent;
