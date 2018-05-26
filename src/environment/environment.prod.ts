export class EnvironmentProd {
  name = 'prod'
  prod = true
  dev = false

  loginUrl = 'https://kg-backend.now.sh/login'
  apiUrl = 'https://kg-backend.now.sh/releases'

  sentryDsn: string | undefined = 'https://f15980b092a741ff8e903824cf2769fe@sentry.io/1214161'
  // sentryEnabled = true
}

export type Environment = EnvironmentProd

export default new EnvironmentProd()
