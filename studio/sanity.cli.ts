import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: 'production',
  },
  // `sanity deploy` publishes to https://blends-by-a.sanity.studio
  studioHost: 'blends-by-a',
  deployment: {
    appId: 'cnryr1hkbs5w4ormdip2t013',
  },
  autoUpdates: true,
})
