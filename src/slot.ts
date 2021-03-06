import { Hash } from './common'
import {
  __$observable,
  __$observers,
  __$willChange,
  Observable,
} from './observable'
import { Star } from './star'

const def = Object.defineProperty

/**
 * The `Slot` class observes one property of a `Star` or `Cluster`.
 * The constructor is only called internally.
 */
export class Slot<
  T extends Hash = any,
  P extends keyof T = keyof T
> extends Observable {
  readonly context: Star<T>
  readonly prop: P

  constructor(context: Star<T>, prop: P) {
    super()
    this.context = context
    this.prop = prop
    def(this, __$observable, {
      value: this,
      configurable: true,
      writable: true,
    })
  }

  /** Get the current slot value */
  get value(): T[P] {
    return this.context.value[this.prop]
  }

  /** @internal */
  removeObserver(observer: any) {
    super.removeObserver(observer)
    if (!this[__$observers]) {
      this.context.removeSlot(this)
    }
  }

  /** @internal */
  [__$willChange](newValue: any) {
    let arr = this[__$observers]
    let method = __$willChange as any
    if (arr) for (let obj of arr) obj[method](this, null, newValue)
  }
}
