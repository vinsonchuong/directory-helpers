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
    for (const [filePath, fileContents] of Object.entries(files)) {
      const absoluteFilePath = this.path(filePath);

      await fse.ensureFile(absoluteFilePath);

      if (typeof fileContents === 'object') {
        await fse.writeJson(absoluteFilePath, fileContents);
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
        await fs.writeFile(absoluteFilePath, reindentedFileContents);
      }
    }
  }
}
