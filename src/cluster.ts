import { __$observers, __$willChange, Observable } from './observable'

/** @internal Observable immutable array */
export class Cluster<T = any> extends Observable {
  value: ReadonlyArray<T>

  constructor(base?: T[]) {
    super()
    this.value = base || []
  }

  [__$willChange](index: number | null, newValue: any) {
    let arr = this[__$observers]
    let method = __$willChange as any
    if (arr) for (let obj of arr) obj[method](this, index, newValue)
  }
}
