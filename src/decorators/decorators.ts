import { AnyFunction } from '@naturalcycles/js-lib'
import { errorDialog } from '@/error'
import { store } from '@/store'

const catchFn = ({ err }: any) => errorDialog(err)

export async function withProgress(fn: AnyFunction): Promise<void> {
  store.commit('setGhost')

  try {
    await fn()
  } catch (err) {
    catchFn(err)
  } finally {
    store.commit('setGhost', false)
  }
}
