import { type Metadata } from "next";
import Link from "next/link";
import { buildBrowsePageMetadata } from "@/lib/seo";
import { getCollectionList } from "@/lib/catalog/get-collection-list";
import { buildStorefrontPath } from "@/lib/storefront-path";

type PageProps = {
	params: Promise<{ locale: string; channel: string }>;
};

export const generateMetadata = async (props: PageProps): Promise<Metadata> => {
	const params = await props.params;

	return buildBrowsePageMetadata({
		title: "Collections",
		description:
			"Every brand and merchandised collection we stock — cartons, single packs and disposables, all in one place.",
		locale: params.locale,
		channel: params.channel,
		pathSuffix: "/collections",
	});
};

/**
 * Collection index. Previously a hard 404: nothing linked to it, and there was no route.
 *
 * It is also the internal-linking hub for the ~40 brand landing pages — the ones the
 * channel-scoped collection query used to hide when a collection had no channel listing.
 */
export default async function Page(props: PageProps) {
	const params = await props.params;
	const collections = await getCollectionList(params.channel, params.locale);

	return (
		<main className="container-content py-10 sm:py-14">
			<header className="max-w-2xl">
				<p className="text-eyebrow uppercase text-muted-foreground">Shop</p>
				<h1 className="mt-2 text-balance text-h1 text-foreground">All collections</h1>
				<p className="mt-3 text-muted-foreground">
					Brand shelves and merchandised collections. Every link opens a published collection in
					this store — no empty shelves.
				</p>
			</header>

			{collections.length === 0 ? (
				<p className="mt-10 text-muted-foreground">No collections are published yet.</p>
			) : (
				<ul className="mt-10 grid list-none gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{collections.map((collection) => (
						<li key={collection.slug}>
							<Link
								href={buildStorefrontPath(
									params.locale,
									params.channel,
									`/collections/${collection.slug}`,
								)}
								className="flex h-full items-center justify-between gap-4 rounded-card border border-border bg-secondary/40 px-5 py-4 no-underline transition-colors hover:border-foreground hover:no-underline"
							>
								<span className="text-sm font-medium text-foreground">{collection.name}</span>
								<span className="shrink-0 text-xs text-muted-foreground">
									{collection.productCount} {collection.productCount === 1 ? "product" : "products"}
								</span>
							</Link>
						</li>
					))}
				</ul>
			)}
		</main>
	);
}
