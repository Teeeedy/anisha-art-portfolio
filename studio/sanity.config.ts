import {defineConfig, type WorkspaceOptions} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

import {schemaTypes} from './schemaTypes'
import {structure, singletonTypes, singletonActions} from './structure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
if (!projectId) {
  throw new Error(
    'Missing SANITY_STUDIO_PROJECT_ID. Copy studio/.env.example to studio/.env and fill it in.',
  )
}

/**
 * One Studio, two workspaces, one per dataset.
 *  - `production`  is the live content used by the `main` branch
 *  - `development` is used by the `dev` branch / Cloudflare Pages preview
 */
function workspace(dataset: 'production' | 'development', title: string): WorkspaceOptions {
  return {
    name: dataset,
    title,
    basePath: `/${dataset}`,
    projectId: projectId as string,
    dataset,
    plugins: [structureTool({structure}), visionTool()],
    schema: {
      types: schemaTypes,
      // Singletons cannot be created from the "new document" menu.
      templates: (templates) =>
        templates.filter(({schemaType}) => !singletonTypes.has(schemaType)),
    },
    document: {
      // Singletons: no create / delete / duplicate / unpublish actions.
      actions: (input, context) =>
        singletonTypes.has(context.schemaType)
          ? input.filter(({action}) => action !== undefined && singletonActions.has(action))
          : input,
    },
  }
}

export default defineConfig([
  workspace('production', 'Blends by A (production)'),
  workspace('development', 'Blends by A (development)'),
])
