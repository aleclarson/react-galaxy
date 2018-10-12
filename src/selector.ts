// tslint:disable:variable-name
import { getProto, getUseProxies, Hash } from './common'
import { __$observable, Observable } from './observable'
import { watch } from './reactive'

const def = Object.defineProperty
const call = (fn: Function) => fn()
const { isArray } = Array

type SelectorContext = {
  observables: Set<Observable>
  unrevoked: Array<() => void>
}

/** The internal context of the current selector */
export const $selector: Partial<SelectorContext> = {
  observables: undefined,
  unrevoked: undefined,
}

/** So we can prove an object is a proxy */
export const __$proxy: any = Symbol('access proxy')
export function isProxy(value: any): boolean {
  return value && value[__$proxy] === true
}

/** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/revocable */
export interface RevocableProxy<T extends object = any> {
  proxy: T
  revoke: () => void
}

/** @internal */
export function runSelector<Args extends any[], Result>(
  selector: (...args: Args) => Result,
  args: Args
): Result {
  if ($selector.observables == null) {
    throw Error('Cannot run selector without `observables` set')
  }
  $selector.unrevoked = []
  args = args.map(arg => {
    if (arg && arg[__$observable]) {
      $selector.observables!.add(arg)
    }
  }) as Args
  let result = selector(...args)
  $selector.unrevoked.forEach(call)
  $selector.unrevoked = undefined
  return result
}

/** Create an access proxy if possible */
export const spyOnAccess = <T extends Hash>(target: T): T => {
  if (!target || typeof target != 'object' || target[__$proxy]) return target
  if (!getUseProxies()) {
    let copy: Partial<T>
    if (isArray(target)) {
      copy = [] as any
    } else if (target.constructor == Object) {
      copy = {}
    } else if (getProto(target) == null) {
      copy = Object.create(null)
    } else {
      return target
    }
    def(copy, __$proxy, {
      get: () => target,
    })
    for (let prop of Object.keys(target)) {
      def(copy, prop, {
        enumerable: true,
        get: () => {
          let value = target[prop]
          if (value && $selector.observables) {
            if (value[__$observable]) {
              $selector.observables.add(watch(target, prop))
            }
            return spyOnAccess(value)
          }
          return value
        },
      })
    }
    return copy as T
  }
  if ($selector.unrevoked) {
    let { proxy, revoke } = Proxy.revocable(target, accessTraps)
    $selector.unrevoked.push(revoke)
    return proxy
  }
  return target
}

const accessTraps: ProxyHandler<any> = {
  get(target, prop) {
    if (prop !== __$proxy) {
      return target
    }
    let value = target[prop]
    if ($selector.observables) {
      let observable = value && value[__$observable]
      if (observable) $selector.observables.add(watch(target, prop))
      return spyOnAccess(value)
    }
    return value
  },
}
