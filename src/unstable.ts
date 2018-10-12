// tslint:disable:variable-name
import { Frozen, getProto, Hash } from './common'
import { __$observable, __$observers, Observable } from './observable'
import { reactive } from './reactive'

type Observer = {
  prop: string
  observer(observable: any): void
}

const __$origin = Symbol('origin')
const __$observed = Symbol('observed')

const emptyMap = new Map()
const def = Object.defineProperty
const desc: any = { value: undefined, writable: true, configurable: true }

/** An unstable hash is observable, but **not immutable** */
export class UnstableHash<T extends Hash> extends Observable {
  private [__$origin]: Frozen<T>
  private [__$observed]: Map<Observable, string>

  constructor(origin: T) {
    super()

    desc.value = reactive(origin)
    def(this, __$origin, desc)
    desc.value = emptyMap
    def(this, __$observed, desc)
    desc.value = undefined

    this.compute()
    Object.seal(this)
  }

  dispose() {
    this[__$observed].forEach(($1, $2) => $2.removeObserver(this))
    this[__$observed].clear()
  }

  private compute() {
    let lastObserved = this[__$observed]
    this[__$observed] = new Map()

    // Shallow traversal in search of observables
    let target: any = this
    for (let prop in this[__$origin]) {
      let value = this[__$origin][prop]
      target[prop] = value

      let observable = value && value[__$observable]
      if (observable) {
        if (this[__$observed].has(observable)) continue
        this[__$observed].set(observable, prop)
        observable.addObserver(this)
      }
    }

    // Remove the old observables.
    lastObserved.forEach((prop, observable) => {
      if (this[__$observed].has(observable)) return
      observable.removeObserver(this)
    })
  }

  private observer(observable: any, prop: keyof any | null, newValue: any) {
    if (prop !== null) return
    prop = this[__$observed].get(observable)!

    let arr = this[__$observers]
    if (arr) for (let obj of arr) obj.observer(this, prop, newValue)

    let target: any = this
    target[prop] = newValue
  }
}
