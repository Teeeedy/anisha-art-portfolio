import {defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons/User'

export const about = defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          initialValue: 'Portrait of Anisha',
        }),
      ],
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'blockContent',
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube video URL',
      type: 'url',
      description: 'Optional. A process video or reel embedded under the bio.',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),
  ],
  preview: {
    select: {media: 'portrait'},
    prepare({media}) {
      return {title: 'About', media}
    },
  },
})
