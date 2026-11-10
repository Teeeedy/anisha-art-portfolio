import {defineField, defineType} from 'sanity'
import {SparklesIcon} from '@sanity/icons'

export const makeupLook = defineType({
  name: 'makeupLook',
  title: 'Make up look',
  type: 'document',
  icon: SparklesIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      description: 'Add an image, a video, or both (the image is used as the video poster).',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const doc = context.document as {video?: {asset?: unknown}} | undefined
          if (!value?.asset && !doc?.video?.asset) return 'Add an image or a video'
          return true
        }),
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'file',
      description: 'Short MP4/WebM. Plays muted on hover in the grid.',
      options: {accept: 'video/*'},
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const doc = context.document as {image?: {asset?: unknown}} | undefined
          if (!value?.asset && !doc?.image?.asset) return 'Add a video or an image'
          return true
        }),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort order',
      type: 'number',
      description: 'Lower numbers appear first.',
    }),
  ],
  orderings: [
    {title: 'Sort order', name: 'sortOrderAsc', by: [{field: 'sortOrder', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', media: 'image', caption: 'caption', video: 'video.asset.originalFilename'},
    prepare({title, media, caption, video}) {
      return {title, media, subtitle: caption ?? (video ? `Video: ${video}` : undefined)}
    },
  },
})
