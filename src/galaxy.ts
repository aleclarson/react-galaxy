import { Hash } from './common'
import { __$observable } from './observable'
import { reactive } from './reactive'
import { $selector, spyOnAccess } from './selector'
import { Star } from './star'

/** Put stars in a galaxy to guarantee freshness */
export class Galaxy<T extends Hash = any> {
  private _keyof: (value: any) => string
  private _keys: string[]
  private _values: any[]

  /**
   * Create an empty galaxy.
   *
   * The key returned by `keyof` is assumed to be unique and immutable.
   *
   * The `keyof` selector defaults to grabbing the `id` property.
   */
  constructor(keyof?: (value: T) => string) {
    this._keyof = keyof || selectId
    this._keys = []
    this._values = []
  }

  add(value: T) {
    let key = this._keyof(value)
    if (typeof key != 'string') {
      throw Error('Object has no key: ' + JSON.stringify(value))
    } else if (this._keys.indexOf(key) != -1) {
      return false
    }

    // Observe the new value.
    reactive(value)[__$observable].addObserver(this)

    this._keys.push(key)
    this._values.push(value)
    return true
  }

  delete(key: string) {
    let index = this._keys.indexOf(key)
    if (index == -1) return false

    // Stop observing the old value.
    this._values[index][__$observable].removeObserver(this)

    this._keys.splice(index, 1)
    this._values.splice(index, 1)

    return true
  }

  get(key: string) {
    let index = this._keys.indexOf(key)
    let result = index == -1 ? undefined : this._values[index]
    if ($selector.observables) {
      $selector.observables.add(result[__$observable])
      return spyOnAccess(result)
    }
    return result
  }

  toArray() {
    return this._values.slice()
  }

  forEach(fn: (value: T, index: number) => void) {
    this._values.forEach(fn)
  }

  [Symbol.iterator](): IterableIterator<any> {
    return this._values[Symbol.iterator]()
  }

  /** @internal */
  private observer(star: Star<T>, prop: string | null, newValue: any) {
    if (prop == null) {
      let index = this._values.indexOf(star.value)
      let nextKey = this._keyof(newValue)
      if (typeof nextKey != 'string') {
        throw Error('Primary key cannot be found: ' + JSON.stringify(newValue))
      }
      let prevKey = this._keys[index]
      if (prevKey !== nextKey) {
        if (this._keys.indexOf(nextKey) != -1) {
          throw Error('Primary key already in use: ' + JSON.stringify(newValue))
        }
        this._keys[index] = nextKey
      }
      this._values[index] = newValue
    }
  }
}

/** The default `keyof` getter */
function selectId<T extends Hash>(value: T): T['id'] {
  return value.id
}
