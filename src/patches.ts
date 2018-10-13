import { Patch } from 'immer'
import { Hash, Reactive } from './common'
import { __$willChange, Observable } from './observable'

// These exports are used often enough.
export { Draft, Patch } from 'immer'

export type PatchListener<T extends Hash = any> = (
  patch: Patch,
  base: T
) => void

export class PatchSpy<T extends Hash = any> {
  // prettier-ignore
  constructor(
    readonly context: Reactive<T>,
    readonly onPatch: PatchListener<T>
  ) {
    context.addObserver(this)
  }

  /** Call this to release memory */
  dispose(): void {
    this.context.removeObserver(this)
  }

  [__$willChange](
    target: Observable,
    prop: string | number | null,
    newValue: any
  ) {
    if (prop !== null) {
      this.onPatch(
        {
          op: 'replace',
          path: [prop],
          value: newValue,
        },
        target.value
      )
    }
  }
}
