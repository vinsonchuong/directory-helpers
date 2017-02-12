/* @flow */
import * as path from 'path'

export default class {
  path: string

  constructor (name: string) {
    this.path = path.resolve(name)
  }
}
