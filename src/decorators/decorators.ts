import { _createPromiseDecorator } from '@naturalcycles/js-lib'
import { store } from '@/store'

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Progress = (): MethodDecorator =>
  _createPromiseDecorator({
    decoratorName: 'Progress',
    beforeFn: () => store.commit('setGhost'),
    thenFn: r => {
      let cls: string = r?.target?.constructor?.name
      if (cls) cls += '.'
      const args: string = r.args?.length ? JSON.stringify(r.args) + ' ' : ''
      console.log(`@${r.decoratorName} ${cls}${r.key}() ${args}`)
      // app.$Progress.finish()
      return r.res
    },
    finallyFn: () => store.commit('setGhost', false),
  })
