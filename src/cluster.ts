import { __$observers, Observable } from './observable'

/** @internal Observable immutable array */
export class Cluster<T = any> extends Observable {
  value: ReadonlyArray<T>

  constructor(base?: T[]) {
    super()
    this.value = base || []
  }

  willChange(index: number | null, newValue: any) {
    let arr = this[__$observers]
    if (arr) for (let obj of arr) obj.observer(this, index, newValue)
  }
}
