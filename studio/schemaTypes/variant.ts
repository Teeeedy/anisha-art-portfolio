import {defineField, defineType} from 'sanity'

/** A purchasable variation of an artwork, e.g. "A3 print". Used for prints later. */
export const variant = defineType({
  name: 'variant',
  title: 'Variant',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'e.g. "A3 print", "A2 print"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price (cents)',
      type: 'number',
      description: 'Whole number in the smallest currency unit, e.g. 4500 = $45.00',
      validation: (Rule) => Rule.required().integer().min(0),
    }),
    defineField({
      name: 'quantity',
      title: 'Quantity available',
      type: 'number',
      validation: (Rule) => Rule.integer().min(0),
    }),
  ],
  preview: {
    select: {title: 'name', sku: 'sku', price: 'price'},
    prepare({title, sku, price}) {
      const dollars = typeof price === 'number' ? (price / 100).toFixed(2) : '-'
      return {title: title ?? 'Variant', subtitle: `${sku ?? 'no SKU'} / ${dollars}`}
    },
  },
})
