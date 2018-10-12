// tslint:disable:variable-name
import { Hash, Reactive } from './common'

const def = Object.defineProperty
const desc: any = { value: undefined, configurable: true, writable: true }

/** Unique symbol for the observer array */
export const __$observers = Symbol('observers')

/** Unique symbol for the raw observable */
export const __$observable: any = Symbol('observable')

/** Returns an observable (if the given value is reactive) */
export function $observable<T extends Hash>(value: T): Reactive<T> | undefined {
  return value ? value[__$observable] : undefined
}

/**
 * Observable base class
 */
export class Observable {
  value: any
  // prettier-ignore
  [__$observers]?: Hash[]

  constructor() {
    desc.value = undefined
    def(this, __$observers, desc)
    desc.value = this
    def(this, __$observable, desc)
    desc.value = undefined
  }

  /** @internal */
  hasObserver(observer: Hash) {
    let observers = this[__$observers]
    return observers !== undefined && observers.indexOf(observer) !== -1
  }

  /** @internal */
  addObserver<T extends Hash>(observer: T): T {
    let observers = this[__$observers]
    if (observers) observers.push(observer)
    else this[__$observers] = [observer]
    return observer
  }

  /** @internal */
  removeObserver(observer: Hash) {
    let observers = this[__$observers]
    if (observers) {
      let index = observers.indexOf(observer)
      if (index == -1) return
      if (observers.length > 1) observers.splice(index, 1)
      else this[__$observers] = undefined
    }
  }
}

// Observables are plain objects
Object.setPrototypeOf(Observable.prototype, null)
