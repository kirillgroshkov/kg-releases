import envDev from './environment.dev'
import { Environment } from './environment.prod'
import envProd from './environment.prod'

// const ENV_DEF = 'dev'
const ENVIRONMENTS = {
  prod: envProd,
  dev: envDev,
}

let environment: Environment

if (location.href.includes('netlify')) {
  environment = ENVIRONMENTS['prod']
} else {
  environment = ENVIRONMENTS['dev']
}

export function env (): Environment {
  return environment
}

export function logEnvironment (): void {
  console.log(environment)
}

export function extendEnvironment (extension: Partial<Environment>): void {
  Object.assign(environment, extension)
}
