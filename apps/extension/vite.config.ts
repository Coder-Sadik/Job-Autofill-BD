import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx, defineManifest } from '@crxjs/vite-plugin'

const manifest = defineManifest({
  manifest_version: 3,
  name: 'Job AutoFill BD',
  version: '1.0.0',
  description: 'Autofill government, university, and private job applications in Bangladesh.',
  action: {
    default_popup: 'index.html',
  },
  permissions: [
    'storage',
    'activeTab',
    'scripting'
  ],
  host_permissions: [
    '*://*.teletalk.com.bd/*',
    '*://*.gov.bd/*',
    '*://*.bdjobs.com/*'
  ],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module'
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.ts']
    }
  ]
})

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
})
