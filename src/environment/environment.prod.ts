export class EnvironmentProd {
  name = 'prod'
  prod = true
  dev = false

  apiUrl = 'https://kg-backend3.appspot.com/releases'

  sentryDsn: string | undefined = 'https://f15980b092a741ff8e903824cf2769fe@sentry.io/1214161'
  // sentryEnabled = true

  hotjarId: number | undefined = 894902

  gaId: string | undefined = 'UA-6342858-21'
}

export type Environment = EnvironmentProd

export default new EnvironmentProd()
