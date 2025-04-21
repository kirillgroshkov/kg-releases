import type { AnyFunction } from '@naturalcycles/js-lib'
import { errorDialog } from '@/error'
import { useStore } from '@/store'

const catchFn = ({ err }: { err: any }): void => errorDialog(err)

export async function withProgress(fn: AnyFunction): Promise<void> {
  const store = useStore()
  store.ghostMode = true

  try {
    await fn()
  } catch (err) {
    catchFn({ err })
  } finally {
    store.ghostMode = false
  }
}
