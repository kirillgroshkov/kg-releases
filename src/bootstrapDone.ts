import { pDefer } from '@naturalcycles/js-lib'

export const bootstrapDoneDefer = pDefer()
export const bootstrapDone = bootstrapDoneDefer.promise
