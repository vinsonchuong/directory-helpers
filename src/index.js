import * as path from 'path';
import * as fse from 'fs-extra-promise-es6';

export default class {
  constructor(basePath) {
    this.basePath = path.resolve(basePath);
  }

  async create() {
    await fse.mkdirs(this.basePath);
  }
}
