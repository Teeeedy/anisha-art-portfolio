import {defineArrayMember, defineField, defineType} from 'sanity'

/** Portable Text used for artwork descriptions and the bio. Kept deliberately small. */
export const blockContent = defineType({
  name: 'blockContent',
  title: 'Rich text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'Heading', value: 'h2'},
        {title: 'Subheading', value: 'h3'},
        {title: 'Quote', value: 'blockquote'},
      ],
      lists: [
        {title: 'Bullet', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              defineField({
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: (Rule) =>
                  Rule.uri({scheme: ['http', 'https', 'mailto', 'tel']}).required(),
              }),
              defineField({
                name: 'blank',
                type: 'boolean',
                title: 'Open in new tab',
                initialValue: true,
              }),
            ],
          }),
        ],
      },
    }),
  ],
})
