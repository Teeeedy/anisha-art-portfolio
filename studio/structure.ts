import type {StructureResolver} from 'sanity/structure'
import {CogIcon} from '@sanity/icons/Cog'
import {UserIcon} from '@sanity/icons/User'
import {ImagesIcon} from '@sanity/icons/Images'
import {SparklesIcon} from '@sanity/icons/Sparkles'

/** Document types that exist exactly once. */
export const singletonTypes = new Set(['siteSettings', 'about'])

/** Document actions still allowed on singletons. */
export const singletonActions = new Set(['publish', 'discardChanges', 'restore'])

const handledTypes = new Set(['siteSettings', 'about', 'artwork', 'makeupLook'])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site settings')
        .id('siteSettings')
        .icon(CogIcon)
        .child(
          S.document().schemaType('siteSettings').documentId('siteSettings').title('Site settings'),
        ),
      S.listItem()
        .title('About')
        .id('about')
        .icon(UserIcon)
        .child(S.document().schemaType('about').documentId('about').title('About')),
      S.divider(),
      S.documentTypeListItem('artwork').title('Artworks').icon(ImagesIcon),
      S.documentTypeListItem('makeupLook').title('Make up looks').icon(SparklesIcon),
      S.divider(),
      // Any future document types land here automatically.
      ...S.documentTypeListItems().filter((item) => !handledTypes.has(item.getId() ?? '')),
    ])
