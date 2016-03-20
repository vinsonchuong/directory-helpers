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
  const output = await project.execFile('node', ['index.js'])
}
main();
```

### Methods
* [constructor](#constructor)
* [create](#create)
* [path](#path)
* [remove](#remove)
* [spawn](#spawn)
* [write](#write)

#### Constructor
```js
import Directory from 'directory-helpers';

const directory = new Directory(basePath)
```
Initializes a directory adapter pointing to the given `basePath`. The given
`basePath` will be passed through `path.resolve`. Note that the directory is
not created by the constructor.

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

#### Path
```js
import Directory from 'directory-helpers';

async function main() {
  const directory = new Directory('./project');
  directory.path('src/lib/helpers.js');
}
```
Resolves paths relative to the `basePath` of the directory.

#### Remove
```js
import Directory from 'directory-helpers';

async function main() {
  const directory = new Directory('./project');
  await directory.create();
  await directory.remove();
}
```
Deletes the directory at `basePath` if it exists.

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
  await server.filter((output) => output.match(/Ready/));
}
```
Spawns a child process from `basePath` and returns an
[`Observable`](https://github.com/vinsonchuong/esnext-async) of text produced
by `stdout` and `stderr`.

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
