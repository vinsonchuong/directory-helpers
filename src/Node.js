/* @flow */
import {fs} from 'node-promise-es6'
import * as path from 'path'
import * as fse from 'fs-extra-promise-es6'

function parsePathComponent (component: string | Node): string {
  return component instanceof Node
    ? component.path
    : component
}

export default class Node {
  path: string

  constructor (...paths: Array<string | Node>) {
    this.path = path.resolve(...paths.map(parsePathComponent))
  }

  async readStats (): Promise<fs.Stats> {
    return await fs.stat(this.path)
  }

  async exists (): Promise<boolean> {
    try {
      await this.readStats()
      return true
    } catch (error) {
      return false
    }
  }

  async remove (): Promise<void> {
    await fse.remove(this.path)
  }
}
