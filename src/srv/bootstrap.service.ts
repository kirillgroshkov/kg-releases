import { memo } from '@/decorators/memo.decorator'
import { env, logEnvironment } from '@/environment/environment'

class BootstrapService {
  @memo()
  async init (): Promise<void> {
    if (!env().dev) logEnvironment()
  }
}

export const bootstrapService = new BootstrapService()
