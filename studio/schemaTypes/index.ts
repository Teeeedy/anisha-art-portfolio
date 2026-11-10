import {artwork} from './artwork'
import {variant} from './variant'
import {makeupLook} from './makeupLook'
import {about} from './about'
import {siteSettings} from './siteSettings'
import {blockContent} from './blockContent'

export const schemaTypes = [
  // documents
  artwork,
  makeupLook,
  about,
  siteSettings,
  // objects
  variant,
  blockContent,
]
