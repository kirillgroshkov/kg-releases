import envDev from './environment.dev'
import type { Environment } from './environment.prod'
import envProd from './environment.prod'

export let env: Environment

if (location.href.includes('netlify')) {
  env = envProd
} else {
  env = envDev
}

export function logEnvironment(): void {
  console.log(env)
}

export function extendEnvironment(extension: Partial<Environment>): void {
  Object.assign(env, extension)
}
