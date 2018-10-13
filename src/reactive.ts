import { produce, setHook } from 'immer'
import { Cluster } from './cluster'
import {
  freeze,
  Frozen,
  getProto,
  Hash,
  hop,
  isObject,
  Reactive,
} from './common'
import { Derived } from './derived'
import { __$observable, __$willChange } from './observable'
import { Draft, PatchListener, PatchSpy } from './patches'
import { Slot } from './slot'
import { Star } from './star'
import { UnstableHash } from './unstable'

const { isArray } = Array

export type Reactive = Reactive

/**
 * Check if the given object is reactive.
 */
export function isReactive<T extends Hash>(value: T): boolean {
  return value && value[__$observable] !== undefined
}

/**
 * Make an object/array observable and readonly outside a producer.
 *
 * This function is **recursive.**
 */
export function reactive<T extends Hash>(base: T): Frozen<T> {
  if (base[__$observable]) return base as Frozen<T>
  if (Object.isFrozen(base)) {
    throw Error('Frozen objects cannot be made reactive')
  }

  let visit: (value: any) => any
  return (visit = (value: any) => {
    let array = Array.isArray(value) ? value : null
    if (!(array || isObject(value)) || value[__$observable]) return

    // Pre-frozen objects cannot be made observable.
    if (Object.isFrozen(value)) return
    makeObservable(value)
    freeze(value)

    // Crawl arrays/objects, looking for nested arrays/objects.
    if (array) {
      for (let value of array) if (value) visit(value)
    } else {
      let object = value
      for (let key in object) {
        if (hop(object, key)) {
          let value = object[key]
          if (value) visit(value)
        }
      }
    }

    return value
  })(base)
}

/**
 * Watch every observable in the given object (*not including nested objects*)
 *
 * Arrays are **not** supported.
 */
export function watch<T extends Hash>(context: T): T

/**
 * Watch one property of a reactive object.
 *
 * Arrays are **not** supported.
 */
export function watch<T extends Hash>(context: T, prop: keyof T): Slot<T, P>

/**
 * Watch an observable using a patch listener.
 */
export function watch<T extends Hash>(target: T, call: PatchListener): PatchSpy

/** @internal */
export function watch<T>(
  $1: any,
  $2?: keyof T | PatchListener
): Slot | PatchSpy | T {
  if ($2 == null) {
    if ($1 && typeof $1 == 'object') {
      return new UnstableHash($1) as any
    }
    return $1
  }
  if (typeof $2 == 'function') {
    let observable = $1 && $1[__$observable]
    if (observable) return new PatchSpy(observable, $2)
    throw Error('Expected a reactive object or array')
  }
  // TODO: throw if called in a selector
  if (isObject($1)) {
    let star = $1[__$observable] as Star
    if (star) return star.watch($2)

    throw Error('Expected a reactive object')
  }
  throw Error('Expected a plain object')
}

/** Function that modifies a draft */
export type Producer<
  T extends Hash = any,
  Args extends any[] = any[],
  Result = any
> = (draft: Draft<T>, ...args: Args) => Result

/**
 * Like `produce` in Immer, but observable!
 *
 * Additional arguments are forwarded to the effect function.
 *
 * The reactivity of the returned object is determined by the
 * reactivity of the base object.
 */
export function revise<T extends Hash, Args extends any[]>(
  base: T,
  produce: Producer<T>,
  ...args: Args
): Frozen<T>

/**
 * Clone the first argument and merge the second argument into it.
 *
 * The reactivity of the returned object is determined by the
 * reactivity of the base object.
 */
export function revise<T extends Hash, U extends T>(
  base: T,
  changes: Partial<U>
): Frozen<T>

/** @internal */
export function revise<T extends Hash>(base: T, reviser: any, ...args: any[]) {
  if (!base || typeof base != 'object') {
    throw TypeError('Expected an object or array')
  }
  return typeof reviser == 'object'
    ? copyMerge(base, reviser)
    : produce(base, args.length ? draft => reviser(draft, ...args) : reviser)
}

type DeriveFn<T, U> = T extends any[] ? (...args: T) => U : (arg: T) => U

/**
 * Create a derived value.
 */
export function derive<T, U>(arg: T, selector: DeriveFn<T, U>): Derived<U> {
  let args = Array.isArray(arg) && !hop(arg, __$observable) ? arg : [arg]
  return new Derived(args, selector as any)
}

/**
 * Internal
 */

const def = Object.defineProperty
const desc: any = {
  value: undefined,
  writable: true,
  configurable: true,
}

/**
 * Pair an observable with an object or array
 */
function makeObservable<T extends Hash>(base: T) {
  desc.value = isArray(base) ? new Cluster(base) : new Star(base)
  def(base, __$observable, desc)
  desc.value = undefined
  return freeze(base)
}

/** Swap the state of an observable */
function snapshot(state: any, observable: any) {
  observable[__$willChange](null, state)

  observable.value[__$observable] = undefined
  observable.value = state

  desc.value = observable
  def(state, __$observable, desc)
  desc.value = undefined
}

/**
 * Produce an object using the given base and changes,
 * with support for observable objects.
 */
function copyMerge<T extends Hash>(
  base: Readonly<T>,
  changes: Partial<T>
): Readonly<T> {
  let copy: any
  let observable: any = base[__$observable]
  for (let prop in changes) {
    if (!hop(changes, prop)) continue
    let value = changes[prop]
    let oldValue = base[prop]
    if (value !== oldValue) {
      copy = getProto(value) ? {} : Object.create(null)
      copy[prop] = value
      if (observable) {
        observable[__$willChange](prop, value)
      }
    }
  }
  if (!copy) return base
  for (let prop in base) {
    if (hop(base, prop) && !hop(copy, prop)) copy[prop] = base[prop]
  }
  if (observable) {
    snapshot(copy, observable)
  }
  return copy as any
}

/**
 * Immer hooks
 */

setHook('setProperty', (draft: Hash, prop: string | number, newValue: any) => {
  let observable: any = draft.base[__$observable]
  if (observable) {
    // Shallow changes only.
    if (newValue && observable == newValue[__$observable]) return
    observable[__$willChange](prop, newValue)
  }
})

setHook('copyObject', (draft: Hash) => {
  let observable: any = draft.base[__$observable]
  if (observable) snapshot(draft.copy, observable)
})
