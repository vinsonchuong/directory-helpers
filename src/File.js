/* @flow */
import {fs} from 'node-promise-es6'
import Node from 'directory-helpers/src/Node'

export default class extends Node {
  async read (): Promise<string> {
    return await fs.readFile(this.path, 'utf8')
  }

  async write (contents: string): Promise<void> {
    await fs.writeFile(this.path, contents)
  }
}
