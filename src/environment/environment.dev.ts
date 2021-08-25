import { EnvironmentProd } from './environment.prod'

export class EnvironmentDev extends EnvironmentProd {
  override name = 'dev'
  override prod = false
  override dev = true

  // loginUrl = 'http://localhost:8000/login'
  // apiUrl = 'http://localhost:8080/releases'

  override sentryDsn = undefined
  // sentryEnabled = false

  override hotjarId = undefined
  override gaId = undefined
}

export default new EnvironmentDev()
