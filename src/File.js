/* @flow */
import * as path from 'path'
import {fs} from 'node-promise-es6'

export default class {
  path: string

  constructor (name: string) {
    this.path = path.resolve(name)
  }

  async read (): Promise<string> {
    return await fs.readFile(this.path, 'utf8')
  }

  async write (contents: string): Promise<void> {
    await fs.writeFile(this.path, contents)
  }

  async remove (): Promise<void> {
    await fs.unlink(this.path)
  }
}
