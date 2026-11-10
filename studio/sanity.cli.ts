import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: 'production',
  },
  // `sanity deploy` publishes to <studioHost>.sanity.studio.
  // You will be prompted for a host on first deploy, or hard-code it here:
  // studioHost: 'blends-by-a',
  autoUpdates: true,
})
