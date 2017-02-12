/* @flow */
import * as path from 'path'
import {fs} from 'node-promise-es6'

export default class {
  path: string

  constructor (name: string) {
    this.path = path.resolve(name)
  }

  async list (): Promise<string[]> {
    return await fs.readdir(this.path)
  }
}
