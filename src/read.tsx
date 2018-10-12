import * as React from 'react'
import { Reader } from './reader'

type Props = {
  from: any
  with?: Function | Function[] | Object
}

export class Read extends React.Component<Props> {
  private _reader: Reader

  constructor(props: Props) {
    super(props)
    this._reader = new Reader()
  }

  componentWillUnmount() {
    this._reader.dispose()
  }
}
