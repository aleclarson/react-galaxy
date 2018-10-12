import { Frozen, getUseProxies } from './common'
import { get } from './context'

export function selectorProxy<T extends object>(state: T): Frozen<T> {
  let ctx = get('selectorContext')
  if (ctx == null) throw Error('Must be in a selector')

  if (getUseProxies()) {
    let unrevoked = new Proxy.revocable(state, traps)
  } else {
  }
}

const traps: ProxyHandler<any> = {
  get(target)
}
