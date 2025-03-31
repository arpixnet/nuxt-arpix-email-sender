import { defineNuxtModule, addPlugin, addServerImportsDir, createResolver } from '@nuxt/kit'
import type { ModuleOptions } from './types'

const MODULE_NAME = 'nuxt-arpix-email-sender'
const CONFIG_KEY = 'arpixEmailSender'

// Module options TypeScript interface definition
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: MODULE_NAME,
    configKey: CONFIG_KEY,
    compatibility: {
      nuxt: '^3.0.0 || ^4.0.0',
    },
  },
  // Default configuration options of the Nuxt module
  defaults: {
    transport: undefined,
    templates: {
      dir: 'server/emails/templates', // Directory where the templates are located
    },
  },
  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    // 1. Validate essential configuration
    if (!_options.transport || (_options.transport === 'smtp' && !_options.smtp)) {
      console.warn(`[${MODULE_NAME}] The transport configuration ('transport' and 'smtp') is required. The module will not work.`)
      return // Stop if essential configuration is missing
    }

    // 2. Pass configuration to runtime (only server-side)
    // We use nuxt.options.runtimeConfig and not publicRuntimeConfig
    _nuxt.options.runtimeConfig[CONFIG_KEY] = _options

    // 3. Add server utilities directory for auto-import
    // This will make `useMailSender` available in server/api, server/routes, etc.
    const runtimeDir = resolver.resolve('./runtime/server/utils')
    addServerImportsDir(runtimeDir)

    // Optional: We could add here logic to check if the templates directory exists,
    // but it's better to handle it in runtime when trying to read a template.

    console.log(`[${MODULE_NAME}] Module set up with transport: ${_options.transport}`)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'))
  },
})
