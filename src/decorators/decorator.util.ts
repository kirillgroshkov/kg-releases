type PromiseDecoratorFunction = (target: any, propertyKey: string, pd: PropertyDescriptor) => PropertyDescriptor

export interface PromiseDecoratorCfg {
  decoratorName: string
  beforeFn?: (r: PromiseDecoratorResp) => any
  okFn?: (r: PromiseDecoratorResp) => any
  errorFn?: (r: PromiseDecoratorResp) => any
  // finallyFn?: (r: PromiseDecoratorResp) => any
}

export interface PromiseDecoratorResp {
  err?: any
  res?: any
  decoratorParams?: any
  args?: any[]
  millis?: number
  target: any
  propertyKey: string
  decoratorName: string
}

export function createPromiseDecorator (cfg: PromiseDecoratorCfg, decoratorParams?: any): PromiseDecoratorFunction {
  return function DecoratorFunction (target: any, propertyKey: string, pd: PropertyDescriptor): PropertyDescriptor {
    // console.log(`@Decorator.${cfg.decoratorName} called: ` + propertyKey, pd, target)
    const originalMethod = pd.value!

    pd.value = function (...args: any[]): Promise<any> {
      // console.log(`@Decorator.${cfg.decoratorName} called inside function`)
      const started = Date.now()

      return (
        Promise.resolve()
          // Before function
          .then(() => {
            // console.log(`@Decorator.${cfg.decoratorName} Before`)
            if (cfg.beforeFn) {
              return cfg.beforeFn({
                decoratorParams,
                args,
                propertyKey,
                target,
                decoratorName: cfg.decoratorName,
              })
            }
          })
          // Original function
          // tslint:disable-next-line:no-invalid-this
          .then(() => originalMethod.apply(this, args))
          .then(res => {
            // console.log(`@Decorator.${cfg.decoratorName} After`)
            if (cfg.okFn) {
              return cfg.okFn({
                res,
                decoratorParams,
                args,
                propertyKey,
                target,
                decoratorName: cfg.decoratorName,
                millis: Date.now() - started,
              })
            }
            return res
          })
          .catch(err => {
            console.log(`@Decorator.${cfg.decoratorName} Catch`)
            if (cfg.errorFn) {
              return cfg.errorFn({
                err,
                decoratorParams,
                args,
                propertyKey,
                target,
                decoratorName: cfg.decoratorName,
                millis: Date.now() - started,
              })
            }
            throw err // otherwise - rethrow
          })
        // tada: finally
      )
    }

    return pd
  }
}
