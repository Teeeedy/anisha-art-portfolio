/**
 * Props for the BuyButton component. Defined here (not inside the .astro file)
 * so future cart / checkout code can import and reuse the contract.
 */
export interface BuyButtonProps {
  /** Sanity document _id of the artwork. */
  artworkId: string;
  title: string;
  /** Integer, smallest currency unit (cents). */
  priceInCents: number;
  /** ISO 4217 code. Defaults to "AUD". */
  currency?: string | null;
  sku?: string | null;
  /** When buying a print variant rather than the original. */
  variantSku?: string | null;
  /** Units available; defaults to 1 (original). */
  quantity?: number | null;
  /** Override the button text. */
  label?: string;
  class?: string;
}

/** Shape the future POST /api/checkout endpoint will accept. */
export interface CheckoutLineItem {
  artworkId: string;
  sku: string;
  variantSku?: string;
  quantity: number;
}
