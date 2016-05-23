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
    } catch ({stderr}) {
      throw new Error(stderr.trim());
    }
  }

  execJs(code) {
    return new Promise((resolve, reject) => {
      const child = childProcess.spawn('dist-es6-run', {cwd: this.path()});
      child.stdin.write(code);
      child.stdin.end();

      let stdoutOutput = '';
      child.stdout.on('data', (output) => {
        stdoutOutput += output;
      });

      let stderrOutput = '';
      child.stderr.on('data', (output) => {
        stderrOutput += output;
      });

      child.on('close', (exitCode) => {
        if (exitCode === 0) {
          resolve(stdoutOutput.trim());
        } else {
          reject(stderrOutput.trim());
        }
      });
    });
  }

  path(...components) {
    return path.resolve(this.basePath, ...components);
  }

  async read(filePath) {
    const contents = await fs.readFile(this.path(filePath), 'utf8');
    try {
      return JSON.parse(contents);
    } catch (error) {
      return contents;
    }
  }

  async remove() {
    await fse.remove(this.path());
  }

  spawn(command, params) {
    const child = childProcess.spawn(command, params, {cwd: this.path()});
    const observable = new AwaitableObservable((observer) => {
      child.stdout.on('data', (data) => {
        observer.next(data.toString());
      });
      child.stderr.on('data', (data) => {
        observer.next(data.toString());
      });
    });
    observable.process = child;
    return observable;
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
