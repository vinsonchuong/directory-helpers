import * as path from 'path'
import * as fse from 'fs-extra-promise-es6'

export default class {
  constructor (basePath) {
    this.basePath = path.resolve(basePath)
  }

  path (...components) {
    return path.resolve(this.basePath, ...components)
  }

  async create () {
    await fse.mkdirs(this.basePath)
  }

  async remove (...pathComponents) {
    await fse.remove(this.path(...pathComponents))
  }
}
