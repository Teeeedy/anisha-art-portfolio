import {defineArrayMember, defineField, defineType, type ValidationContext} from 'sanity'
import {ImageIcon} from '@sanity/icons/Image'

export const ARTWORK_STATUSES = [
  {title: 'Available', value: 'available'},
  {title: 'Sold', value: 'sold'},
  {title: 'Reserved', value: 'reserved'},
  {title: 'Not for sale', value: 'not-for-sale'},
] as const

export const PRODUCT_TYPES = [
  {title: 'Original', value: 'original'},
  {title: 'Print', value: 'print'},
  {title: 'Digital', value: 'digital'},
] as const

/** SKU must be unique across all artworks (drafts and published versions of the same doc excluded). */
async function isUniqueSku(sku: string | undefined, context: ValidationContext) {
  if (!sku) return true
  const id = context.document?._id?.replace(/^drafts\./, '')
  if (!id) return true
  const client = context.getClient({apiVersion: '2025-02-19'})
  const query = `!defined(*[_type == "artwork" && !(_id in [$draft, $published]) && sku == $sku][0]._id)`
  const unique = await client.fetch<boolean>(query, {draft: `drafts.${id}`, published: id, sku})
  return unique ? true : 'This SKU is already used by another artwork'
}

export const artwork = defineType({
  name: 'artwork',
  title: 'Artwork',
  type: 'document',
  icon: ImageIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'commerce', title: 'Commerce'},
  ],
  fields: [
    // ---------------------------------------------------------------- Content
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      description: 'Used in the URL: /art/<slug>',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      group: 'content',
      description: 'The first image is used for the grid tile. Set the hotspot so the square crop looks right.',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              description: 'Describe the image for screen readers and search engines.',
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'medium',
      title: 'Medium',
      type: 'string',
      group: 'content',
      description: 'e.g. "Acrylic on canvas"',
    }),
    defineField({
      name: 'size',
      title: 'Size',
      type: 'string',
      group: 'content',
      description: 'e.g. "60×90cm"',
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      group: 'content',
      validation: (Rule) => Rule.integer().min(1900).max(2100),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
      group: 'content',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      group: 'content',
      initialValue: false,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort order',
      type: 'number',
      group: 'content',
      description: 'Lower numbers appear first. Leave empty to sort by year.',
    }),

    // --------------------------------------------------------------- Commerce
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'commerce',
      options: {list: [...ARTWORK_STATUSES], layout: 'radio', direction: 'horizontal'},
      initialValue: 'available',
    }),
    defineField({
      name: 'price',
      title: 'Price (cents)',
      type: 'number',
      group: 'commerce',
      description: 'Whole number in the smallest currency unit, e.g. 45000 = $450.00',
      validation: (Rule) => Rule.integer().min(0),
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      group: 'commerce',
      initialValue: 'AUD',
      description: 'ISO 4217 code, e.g. AUD',
      validation: (Rule) => Rule.uppercase().length(3),
    }),
    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
      group: 'commerce',
      description: 'Unique product code, e.g. BBA-0001',
      validation: (Rule) => Rule.custom(isUniqueSku),
    }),
    defineField({
      name: 'productType',
      title: 'Product type',
      type: 'string',
      group: 'commerce',
      options: {list: [...PRODUCT_TYPES], layout: 'radio', direction: 'horizontal'},
      initialValue: 'original',
    }),
    defineField({
      name: 'quantity',
      title: 'Quantity',
      type: 'number',
      group: 'commerce',
      description: 'Originals are 1. Prints/digital may be higher (or use variants).',
      initialValue: 1,
      validation: (Rule) => Rule.integer().min(0),
    }),
    defineField({
      name: 'variants',
      title: 'Variants',
      type: 'array',
      group: 'commerce',
      description: 'For prints: each size/edition that can be bought separately.',
      of: [defineArrayMember({type: 'variant'})],
    }),
    defineField({
      name: 'stripeProductId',
      title: 'Stripe product ID',
      type: 'string',
      group: 'commerce',
      readOnly: true,
      description: 'Filled automatically later',
    }),
    defineField({
      name: 'stripePriceId',
      title: 'Stripe price ID',
      type: 'string',
      group: 'commerce',
      readOnly: true,
      description: 'Filled automatically later',
    }),
    defineField({
      name: 'requiresShipping',
      title: 'Requires shipping',
      type: 'boolean',
      group: 'commerce',
      initialValue: true,
    }),
    defineField({
      name: 'weightGrams',
      title: 'Weight (grams)',
      type: 'number',
      group: 'commerce',
      hidden: ({document}) => document?.requiresShipping === false,
      validation: (Rule) => Rule.integer().min(0),
    }),
    defineField({
      name: 'packedDimensions',
      title: 'Packed dimensions',
      type: 'string',
      group: 'commerce',
      description: 'e.g. "95 × 65 × 8 cm"',
      hidden: ({document}) => document?.requiresShipping === false,
    }),
  ],
  orderings: [
    {
      title: 'Sort order',
      name: 'sortOrderAsc',
      by: [
        {field: 'sortOrder', direction: 'asc'},
        {field: 'year', direction: 'desc'},
      ],
    },
    {title: 'Year, newest first', name: 'yearDesc', by: [{field: 'year', direction: 'desc'}]},
    {title: 'Title', name: 'titleAsc', by: [{field: 'title', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', media: 'images.0', status: 'status', price: 'price', year: 'year'},
    prepare({title, media, status, price, year}) {
      const parts: string[] = []
      if (year) parts.push(String(year))
      if (status) parts.push(status)
      if (typeof price === 'number') parts.push(`$${(price / 100).toFixed(2)}`)
      return {title, media, subtitle: parts.join(' / ')}
    },
  },
})
