import * as path from 'path';
import {fs} from 'node-promise-es6';
import * as fse from 'fs-extra-promise-es6';

export default class {
  constructor(basePath) {
    this.basePath = path.resolve(basePath);
  }

  async create() {
    await fse.mkdirs(this.basePath);
  }

  path(...components) {
    return path.resolve(this.basePath, ...components);
  }

  async remove() {
    await fse.remove(this.path());
  }

  async write(files) {
    for (const file of Object.keys(files)) {
      const filePath = this.path(file);
      const fileContents = files[file];

      await fse.ensureFile(filePath);

      if (typeof fileContents === 'object') {
        await fse.writeJson(filePath, fileContents);
      } else {
        const reindentedFileContents = fileContents
          .split('\n')
          .filter((line, index, array) =>
            index !== 0 && index !== array.length - 1 || line.trim() !== '')
          .reduce(({indentation, contents}, line) => {
            const whitespaceToRemove = Number.isInteger(indentation) ?
              indentation :
              line.match(/^\s*/)[0].length;
            return {
              indentation: whitespaceToRemove,
              contents: `${contents}${line.slice(whitespaceToRemove)}\n`
            };
          }, {contents: ''}).contents;
        await fs.writeFile(filePath, reindentedFileContents);
      }
    }
  }
}
