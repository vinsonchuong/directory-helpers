/* @flow */
import {fs} from 'node-promise-es6'

export default class {
  name: string

  constructor (name: string) {
    this.name = name
  }

  async read (): Promise<string> {
    return await fs.readFile(this.name, 'utf8')
  }

  async write (contents: string): Promise<void> {
    await fs.writeFile(this.name, contents)
  }

  async remove (): Promise<void> {
    await fs.unlink(this.name)
  }
}
