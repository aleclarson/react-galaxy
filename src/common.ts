// tslint:disable:variable-name
import * as immer from 'immer'
import { Cluster } from './cluster'
import { Star } from './star'

let useProxies = typeof Proxy !== 'undefined'
let autoFreeze = false

export type Hash = { [key: string]: any }

export type Frozen<T extends Hash> = T extends Array<infer U>
  ? ReadonlyArray<U>
  : T extends ReadonlyArray<any> ? T : Readonly<T>

export type Reactive<T extends Hash = any> = T extends ReadonlyArray<infer U>
  ? Cluster<U>
  : T extends Function ? never : Star<T>

export const hop = Function.call.bind(Object.hasOwnProperty) as (
  obj: object,
  prop: string
) => boolean

export const getProto = Object.getPrototypeOf || ((o: any) => o.__proto__)

export function isObject(value: any): boolean {
  if (value) {
    let proto = getProto(value)
    return !proto || proto.constructor == Object
  }
  return false
}
export function freeze<T extends Hash>(value: T): Frozen<T> {
  if (autoFreeze) Object.freeze(freeze)
  return value as Frozen<T>
}

export function setAutoFreeze(value: boolean) {
  immer.setAutoFreeze(value)
  autoFreeze = value
}

export function getAutoFreeze() {
  return autoFreeze
}

export function setUseProxies(value: boolean) {
  immer.setUseProxies(value)
  useProxies = value
}

export function getUseProxies() {
  return useProxies
}
