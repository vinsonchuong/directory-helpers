# directory-helpers
[![Build Status](https://travis-ci.org/vinsonchuong/directory-helpers.svg?branch=master)](https://travis-ci.org/vinsonchuong/directory-helpers)

A collection of helper methods for working with directories

## Installing
`directory-helpers` is available as an
[npm package](https://www.npmjs.com/package/directory-helpers).

## Usage
`directory-helpers` is best used in an ES.next environment with async/await
enabled.

```js
import Directory from 'directory-helpers';

async main() {
  const directory = new Directory('./project');
  await directory.writeFiles({
    'package.json': {
      name: 'project',
      version: '0.0.1'
    },
    'index.js': `
      process.stdout.write('Hello World!');
    `
  });
  const output = await project.exec('node', ['index.js'])
}
main();
```

### Methods
* [constructor](#constructor)
* [contains](#contains)
* [create](#create)
* [exec](#exec)
* [execJs](#execJs)
* [glob](#glob)
* [path](#path)
* [read](#read)
* [remove](#remove)
* [resolve](#resolve)
* [spawn](#spawn)
* [start](#start)
* [stat](#stat)
* [stop](#stop)
* [symlink](#symlink)
* [write](#write)

#### Constructor
```js
import Directory from 'directory-helpers';

const directory = new Directory(basePath)
```
Initializes a directory adapter pointing to the given `basePath`. The given
`basePath` will be passed through `path.resolve`. Note that the directory is
not created by the constructor.

#### Contains
```js
import Directory from 'directory-helpers';

async function main() {
  const directory = new Directory('/tmp/project');
  const fileInDirectory = await directory.contains('/tmp/project/package.json');
}
```

Determines whether the given path is contained within the `basePath` of the
directory. Note that `#contains` does not determine whether a file actually
exists at the given path.

#### Create
```js
import Directory from 'directory-helpers';

async function main() {
  const basePath = './project';
  const directory = new Directory(basePath);
  await directory.create();
}
```
Creates the directory at the `basePath` given to the constructor if it does not
already exist.

#### Exec
```js
import Directory from 'directory-helpers';

async function main() {
  const directory = new Directory('./project');
  await directory.create();
  const output = await directory.exec('ls', ['-la']);
}
```
Executes the given shell command from `basePath`, returning the contents of
`stdout` after the process exits. If the process exits unsuccessfully, the
contents of `stderr` are thrown as an `Error`.

#### ExecJs
```js
import Directory from 'directory-helpers';

async function main() {
  const directory = new Directory('./project');
  await directory.create();
  const output = await directory.execJs(`
    import * as path from path;
    console.log(path.resolve());
  `);
}
```
Executes the given JavaScript (ES.next supported) code from `basePath`,
returning the output of `stdout`. If execution fails, an error is thrown with
the contents of `stderr`.

#### Glob
```js
import Directory from 'directory-helpers';

async function main() {
  const directory = new Directory('./project');
  await directory.create();
  const files = await directory.glob('**/*.js');
}
```
Evaluates a glob using [`glob`](https://github.com/isaacs/node-glob),
exposing the same interface. Note that `options.cwd` is set to the `basePath`
of the directory.

#### Path
```js
import Directory from 'directory-helpers';

async function main() {
  const directory = new Directory('./project');
  directory.path('src/lib/helpers.js');
}
```
Resolves paths relative to the `basePath` of the directory.

#### Read
```js
import Directory from 'directory-helpers';

async function main() {
  const directory = new Directory('./project');
  await directory.write({
    'code.js': `
      console.log('Hello World!')
    `,
    'data.json': {
      hello: 'world'
    }
  });
  const code = await directory.read('file.js');
  const data = await directory.read('data.json');
}
```
Reads the contents of a file at the path relative to the `basePath` of the
directory. The file contents are parsed using `JSON.parse()` when possible.

#### Remove
```js
import Directory from 'directory-helpers';

async function main() {
  const directory = new Directory('./project');
  await directory.write({
    foo: '',
    bar: '',
    baz: ''
  });
  await directory.remove('foo');
  await directory.remove();
}
```
Deletes a file at path relative to the `basePath` of the directory. If no file
is given, deletes the directory at `basePath` if it exists.

#### Resolve
```js
import Directory from 'directory-helpers';

async function main() {
  const directory = new Directory('./project');
  await directory.resolve('npm-package');
}
```
Resolves the absolute path to a Node.js module using the `require.resolve`
algorithm.

#### Spawn
```js
import Directory from 'directory-helpers';

async function main() {
  const directory = new Directory('./project');
  await directory.write({
    'package.json': {
      name: 'project'
    },
    'server.js': `
      setTimeout(() => {
        console.log('Loading...');
        setTimeout(() => {
          console.log('Ready');
          setTimeout(() => {
            console.log('Result');
          }, 100);
        }, 100);
      }, 100);
    `
  });
  const server = directory.spawn('npm', ['start']);
  await server.filter((output) => output.match(/Listening/));
  server.process.kill();
}
```
Spawns a child process from `basePath` and returns an
[`Observable`](https://github.com/vinsonchuong/esnext-async) of text produced
by `stdout` and `stderr`. The `ChildProcess` instance can be accessed from the
`process` attribute. The command is spawned in its own process group using
`setsid` so that when `ChildProcess#kill` is called, it kills the spawned
process and all of its subprocesses.

#### Start
```js
import Directory from 'directory-helpers';

async function main() {
  const directory = new Directory('./project');
  await directory.write({
    'package.json': {
      name: 'project',
      scripts: {
        start: 'serve'
      }
    }
  });
  await directory.start(/Listening/);
  // ...
  await directory.stop();
}
```
Spawns `npm start` with `basePath` as the working directory. If a regular
expression is given, `#start` waits and resolves after reading a matching line
from STDOUT. The process is spawned in its own process group, making it easier
to kill the process and all of its descendent processes.

#### Stat
```js
import Directory from 'directory-helpers';

async function main() {
  const directory = new Directory('./project');
  const stats = await directory.stat('package.json');
}
```
Reads the file status for the file at the given path relative to `basePath`,
returning an instance of `fs.Stats`.

#### Stop
```js
import Directory from 'directory-helpers';

async function main() {
  const directory = new Directory('./project');
  await directory.write({
    'package.json': {
      name: 'project',
      scripts: {
        start: 'serve'
      }
    }
  });
  await directory.start(/Listening/);
  // ...
  await directory.stop();
}
```
Stops the process group spawned by `#start`.

#### Symlink
```js
import Directory from 'directory-helpers';

async function main() {
  const directory = new Directory('./project');
  await directory.symlink('../sourcePath', 'destinationPath');
}
```
Creates a symbolic link at `destinationPath` pointing to the `sourcePath`. Both
paths are relative to the `basePath`. If any of the directories in the
`destinationPath` do not exist, they are created.

#### Write
```js
import Directory from 'directory-helpers';

async function main() {
  const directory = new Directory('./project');
  await directory.create();
  await directory.write({
    'package.json': {
      name: 'project',
      version: '0.0.1'
    },
    'src/index.js': `
      import * as path from 'path';
      console.log(path.resolve());
    `
  });
}
```
Creates or overwrites files at paths relative to the `basePath` of the
directory. If the file contents are an object or array, it will be
converted to a string using `JSON.stringify(contents, null, 2)`. If the file
contents are a string, that string will be re-indented so that there is no
leading space on the first line. Any missing directories will be created.

## Development
### Getting Started
The application requires the following external dependencies:
* Node.js

The rest of the dependencies are handled through:
```bash
npm install
```

Run tests with:
```bash
npm test
```
