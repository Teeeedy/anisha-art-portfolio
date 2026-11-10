/**
 * Feature flags. All env values are strings; only the literal "true" enables a flag.
 */
function flag(value: string | undefined, fallback = false): boolean {
  if (value === undefined || value === '') return fallback;
  return value.trim().toLowerCase() === 'true';
}

/** PUBLIC_ENABLE_COMMERCE — false: enquiry form · true: Buy button (Stripe, later). */
export const commerceEnabled: boolean = flag(import.meta.env.PUBLIC_ENABLE_COMMERCE, false);

export function isCommerceEnabled(): boolean {
  return commerceEnabled;
}
