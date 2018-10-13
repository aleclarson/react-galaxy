import { __$observers, __$willChange, Observable } from './observable'
import { $selector, runSelector } from './selector'

const { isArray } = Array
const emptySet = new Set()

export class Derived<T> extends Observable {
  private _args: any[]
  private _selector: (...args: any[]) => T
  private _observed: Set<Observable>
  value: T

  constructor(args: any[], selector: (...args: any[]) => T) {
    super()
    this._args = args
    this._selector = selector
    this._observed = emptySet
    this.value = this.compute()
  }

  dispose() {
    this._observed.forEach(o => o.removeObserver(this))
    this._observed.clear()
  }

  private compute() {
    let lastObserved = this._observed
    this._observed = new Set()

    $selector.observables = this._observed
    let result = runSelector(this._selector, this._args)
    $selector.observables = undefined

    this._observed.forEach(observable => {
      if (lastObserved.has(observable)) return
      observable.addObserver(this)
    })
    lastObserved.forEach(observable => {
      if (this._observed.has(observable)) return
      observable.removeObserver(this)
    })

    return result
  }

  protected [__$willChange]() {
    let value = this.compute()
    if (value !== this.value) {
      let arr = this[__$observers]
      if (arr) for (let obj of arr) obj.observer(this, null, value)

      this.value = value
    }
  }
}
