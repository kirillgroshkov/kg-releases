import { store } from '@/store'
import { _createPromiseDecorator } from '@naturalcycles/js-lib'

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
