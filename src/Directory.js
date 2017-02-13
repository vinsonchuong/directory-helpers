/* @flow */
import {fs} from 'node-promise-es6'
import Node from 'directory-helpers/src/Node'

export default class extends Node {
  async list (): Promise<Array<string>> {
    return await fs.readdir(this.path)
  }

  async create (): Promise<void> {
    await fs.mkdir(this.path)
  }
}
