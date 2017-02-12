/* @flow */
import {fs} from 'node-promise-es6'
import Node from 'directory-helpers/src/Node.js'

export default class extends Node {
  async list (): Promise<string[]> {
    return await fs.readdir(this.path)
  }
}
