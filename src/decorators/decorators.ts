import type { AnyFunction } from '@naturalcycles/js-lib/types'
import { errorDialog } from '#src/error.js'
import { store } from '#src/store.js'

const catchFn = ({ err }: { err: any }): void => errorDialog(err)

export async function withProgress(fn: AnyFunction): Promise<void> {
  store.ghostMode.value = true

  try {
    await fn()
  } catch (err) {
    catchFn({ err })
  } finally {
    store.ghostMode.value = false
  }
}
