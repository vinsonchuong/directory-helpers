import * as path from 'path';
import {childProcess, fs} from 'node-promise-es6';
import * as fse from 'fs-extra-promise-es6';
import {AwaitableObservable} from 'esnext-async';

export default class {
  constructor(basePath) {
    this.basePath = path.resolve(basePath);
  }

  async create() {
    await fse.mkdirs(this.basePath);
  }

  async exec(command, params) {
    try {
      const {stdout} = await childProcess.execFile(command, params, {
        cwd: this.path()
      });
      return stdout.trim();
    } catch (error) {
      throw new Error(error.message.trim());
    }
  }

  path(...components) {
    return path.resolve(this.basePath, ...components);
  }

  async remove() {
    await fse.remove(this.path());
  }

  spawn(command, params) {
    const child = childProcess.spawn(command, params, {cwd: this.path()});
    return new AwaitableObservable((observer) => {
      child.stdout.on('data', (data) => {
        observer.next(data.toString());
      });
      child.stderr.on('data', (data) => {
        observer.next(data.toString());
      });
    });
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
