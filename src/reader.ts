import { ReactNode } from 'react'
import { Hash } from './common'
import { Derived } from './derived'
import { __$observable, __$observers, Observable } from './observable'

const { isArray } = Array

type AnyFn = (...args: any[]) => any

type Props = {
  from: any
  with: AnyFn | AnyFn[] | Hash
  onUpdate: () => void
}

/**
 * The internal state of the `<Read>` component
 */
export class Reader extends Observable {
  private _derived: Observable[]
  props: Props
  value: any[]

  constructor(props: Props) {
    super()
    this.update(props)
  }

  update(props: Props): void {
    let oldProps = this.props || {}

    let args: any[]
    if (props.from) {
      args =
        isArray(props.from) && !props.from[__$observable]
          ? props.from
          : [props.from]
    } else {
      throw Error('Cannot read from nothing')
    }

    let derived: any[] = []
    let results: any[] = []

    if (props.with) {
      if (isArray(props.with)) {
        props.with.forEach(selector => {
          let result = new Derived(args, selector)
          derived.push(result)
          result.addObserver(this)
          results.push(result.value)
        })
      } else if (typeof props.with == 'function') {
        let result = new Derived(args, props.with as AnyFn)
        derived.push(result)
        result.addObserver(this)
        results.push(result.value)
      } else {
        // TODO: selector maps
      }
    } else {
      // TODO: no selectors
    }

    this._derived = derived
    this.value = results
  }

  dispose(): void {
    this._derived.forEach(observable => observable.removeObserver(this))
    this._derived.length = 0
  }

  [__$willChange](target: any) {
    let index = this._derived.indexOf(target)
    if (index > -1) {
      this.value[index] = target.value

      let arr = this[__$observers]
      let method = __$willChange as any
      if (arr) for (let obj of arr) obj[method](this, index, target.value)
    }
  }
}
