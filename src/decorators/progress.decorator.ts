import { createPromiseDecorator, PromiseDecoratorCfg } from '@/decorators/decorator.util'

const cfg: PromiseDecoratorCfg = {
  decoratorName: 'Progress',
}

export function initProgressDecorator (_cfg: Partial<PromiseDecoratorCfg>): void {
  Object.assign(cfg, _cfg)
}

export const Progress = (opts?: any) => createPromiseDecorator(cfg, opts)
