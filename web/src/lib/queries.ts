/**
 * All GROQ queries live here. Projections are shared so the TypeScript types in
 * src/types/ stay in step with what is actually fetched.
 */

const imageProjection = /* groq */ `{
  _key,
  _type,
  alt,
  hotspot,
  crop,
  asset->{
    _id,
    url,
    metadata { lqip, dimensions { width, height, aspectRatio } }
  }
}`;

const fileProjection = /* groq */ `{ _id, url, mimeType, size, originalFilename }`;

/** Commerce fields — fetched everywhere so cart/analytics hooks have what they need. */
const commerceFields = /* groq */ `
  status,
  price,
  currency,
  sku,
  productType,
  quantity,
  variants[]{ _key, name, sku, price, quantity },
  stripeProductId,
  stripePriceId,
  requiresShipping,
  weightGrams,
  packedDimensions
`;

const artworkSummaryFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  images[]${imageProjection},
  medium,
  size,
  year,
  featured,
  sortOrder,
  ${commerceFields}
`;

/** Explicit sortOrder first, then newest year, then title. */
const artworkOrder = /* groq */ `order(coalesce(sortOrder, 1000000) asc, year desc, title asc)`;

export const artworksQuery = /* groq */ `
  *[_type == "artwork" && defined(slug.current)] | ${artworkOrder} {
    ${artworkSummaryFields}
  }
`;

export const artworkBySlugQuery = /* groq */ `
  *[_type == "artwork" && slug.current == $slug][0] {
    ${artworkSummaryFields},
    description
  }
`;

/** All artworks including description — used by getStaticPaths to build every detail page in one request. */
export const artworksWithDescriptionQuery = /* groq */ `
  *[_type == "artwork" && defined(slug.current)] | ${artworkOrder} {
    ${artworkSummaryFields},
    description
  }
`;

export const makeupLooksQuery = /* groq */ `
  *[_type == "makeupLook"] | order(coalesce(sortOrder, 1000000) asc, _createdAt desc) {
    _id,
    title,
    caption,
    sortOrder,
    image${imageProjection},
    "video": video.asset->${fileProjection}
  }
`;

export const aboutQuery = /* groq */ `
  *[_type == "about"][0] {
    portrait${imageProjection},
    bio,
    youtubeUrl
  }
`;

export const siteSettingsQuery = /* groq */ `
  *[_type == "siteSettings"][0] {
    siteTitle,
    heroImage${imageProjection},
    "heroVideo": heroVideo.asset->${fileProjection},
    email,
    instagramUrl,
    youtubeUrl,
    seoDescription
  }
`;
