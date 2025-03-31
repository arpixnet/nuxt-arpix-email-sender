import type { ModuleOptions } from '../../../types'
import { useRuntimeConfig } from '#imports'

export function getModuleOptions(): ModuleOptions {
  // Access Nuxt config with proper type checking
  const config = useRuntimeConfig().arpixEmailSender || {}
  return config as ModuleOptions
}
