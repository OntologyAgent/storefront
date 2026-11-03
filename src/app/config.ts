/**
 * Grid page size. Kept above the current catalogue size (22 SKUs) so the merchandising
 * sort in `config/merchandising` can order the whole catalog in one page instead of
 * only within a page. Lower it again once the catalog outgrows one screen of scrolling.
 */
export const ProductsPerPage = 24;

/**
 * Default channel slug - REQUIRED for the storefront to work.
 *
 * Set via NEXT_PUBLIC_DEFAULT_CHANNEL environment variable.
 * Example: NEXT_PUBLIC_DEFAULT_CHANNEL=default-channel
 */
export const DefaultChannelSlug = process.env.NEXT_PUBLIC_DEFAULT_CHANNEL ?? null;
