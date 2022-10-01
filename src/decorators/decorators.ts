import { AnyFunction } from '@naturalcycles/js-lib'
import { useStore } from '@/store'
import { errorDialog } from '@/error'

const catchFn = ({ err }: { err: any }) => errorDialog(err)

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
