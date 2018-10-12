import { Hash } from './common'
import { __$observers, Observable } from './observable'
import { Slot } from './slot'

/** @internal Observable immutable object */
export class Star<T extends Hash = any> extends Observable {
  value: Readonly<T>
  private _slots?: Map<keyof T, Slot<T, keyof T>>

  constructor(base?: T) {
    super()
    this.value = base || Object.create(null)
    this._slots = undefined
  }

  willChange(prop: string | null, newValue: any) {
    if (prop !== null) {
      // Notify slots first
      let slot = this._slots && this._slots.get(prop)
      if (slot) slot.willChange(newValue)
    }

    let arr = this[__$observers]
    if (arr) for (let obj of arr) obj.observer(this, prop, newValue)
  }

  /** Returns an observable for the given property name */
  watch<P extends keyof T>(prop: P): Slot<T, P> {
    let slots = this._slots
    if (!slots) this._slots = slots = new Map()
    let slot = slots.get(prop) as Slot<T, P>
    if (!slot) slots.set(prop, (slot = new Slot(this, prop)))
    return slot
  }

  /** @internal Remove an unused `Slot` instance */
  removeSlot(slot: Slot<T, keyof T>) {
    let slots = this._slots
    if (slots && slots.get(slot.prop) == slot) {
      slots.delete(slot.prop)
      if (slots.size == 0) {
        this._slots = undefined
      }
    }
  }
}
