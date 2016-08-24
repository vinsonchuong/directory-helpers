import * as path from 'path';
import {childProcess, fs, promisify} from 'node-promise-es6';
import * as fse from 'fs-extra-promise-es6';
import {AwaitableObservable} from 'esnext-async';
import dedent from 'dedent';
import resolveModule from 'resolve';
import glob from 'glob';

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

  async glob(pattern, options) {
    return await promisify(glob)(pattern, Object.assign({}, options, {
      cwd: this.path()
    }));
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

  async remove(...pathComponents) {
    await fse.remove(this.path(...pathComponents));
  }

  async resolve(request) {
    return await new Promise((resolve, reject) => {
      resolveModule(request, {basedir: this.path()}, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
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

  async symlink(source, destination) {
    await fse.ensureSymlink(this.path(source), this.path(destination));
  }

  async write(files) {
    for (const [filePath, fileContents] of Object.entries(files)) {
      const absoluteFilePath = this.path(filePath);

      await fse.ensureFile(absoluteFilePath);

      if (typeof fileContents === 'object') {
        await fse.writeJson(absoluteFilePath, fileContents);
      } else {
        await fs.writeFile(absoluteFilePath, `${dedent(fileContents)}\n`);
      }
    }
  }
}
