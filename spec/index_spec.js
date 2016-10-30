import * as path from 'path';
import {fs} from 'node-promise-es6';
import * as fse from 'fs-extra-promise-es6';
import fetch from 'node-fetch';
import Directory from 'directory-helpers';
import {catchError} from 'jasmine-es6';

describe('Directory', () => {
  afterEach(async () => {
    await new Directory('project').remove();
  });

  describe('#create', () => {
    it('creates the directory', async () => {
      const directory = new Directory('project');
      await directory.create();
      expect(await fs.readdir(path.resolve())).toContain('project');
    });
  });

  describe('#contains', () => {
    it('returns true for file paths within the directory', () => {
      const directory = new Directory('.');

      function assertContains(filePath, contains = true) {
        expect(directory.contains(filePath)).toBe(contains);
      }

      assertContains('package.json');
      assertContains('src/index.js');
      assertContains('../directory-helpers/package.json');

      assertContains('..', false);
      assertContains('/tmp', false);
    });
  });

  describe('#exec', () => {
    it('executes the shell command and returns the output', async () => {
      const directory = new Directory('project');
      await directory.write({
        foo: '',
        bar: '',
        baz: ''
      });
      expect(await directory.exec('ls', ['--reverse']))
        .toEqual('foo\nbaz\nbar');
    });

    it('throws output from stderr if there is no stdout output', async () => {
      const directory = new Directory('project');
      await directory.create();
      expect(await catchError(directory.exec('ls', ['foo'])))
        .toMatch('No such file');
    });
  });

  describe('#execJs', () => {
    it('executes the given ES.next code, returning the output', async () => {
      const directory = new Directory('project');
      await directory.create();

      const output = await directory.execJs(`
        import * as path from 'path';
        console.log(path.resolve());
      `);

      expect(output).toBe(path.resolve('project'));
    });

    it('throws an error when execution is unsuccessful', async () => {
      const directory = new Directory('project');
      await directory.create();

      const output = await catchError(directory.execJs(`
        throw new Error('There was an error here');
      `));

      expect(output).toContain('There was an error here');
    });
  });

  describe('#glob', () => {
    it('returns a list of files matching the given pattern', async () => {
      const directory = new Directory('.');
      expect(await directory.glob('*.json')).toEqual(['package.json']);
    });
  });

  describe('#path', () => {
    it('resolves paths relative to the basePath of the directory', () => {
      const directory = new Directory('project');
      expect(directory.path('src')).toBe(path.resolve('project', 'src'));
    });
  });

  describe('#read', () => {
    it('reads text files', async () => {
      const directory = new Directory('project');
      await directory.write({
        'code.js': `
          console.log("Hello")
        `
      });
      expect(await directory.read('code.js')).toBe('console.log("Hello")\n');
    });

    it('reads JSON files', async () => {
      const directory = new Directory('project');
      await directory.write({
        'package.json': {
          name: 'project',
          version: '0.0.1'
        }
      });
      expect(await directory.read('package.json')).toEqual({
        name: 'project',
        version: '0.0.1'
      });
    });
  });

  describe('#remove', () => {
    it('deletes the given file', async () => {
      const directory = new Directory('project');
      await directory.write({
        foo: '',
        bar: ''
      });
      await directory.remove('foo');
      expect(await fs.readdir(directory.path())).not.toContain('foo');
    });

    it('deletes the directory', async () => {
      const directory = new Directory('project');
      await directory.create();
      await directory.remove();
      expect(await fs.readdir(path.resolve())).not.toContain('project');
    });
  });

  describe('#resolve', () => {
    it('resolves node modules', async () => {
      const directory = new Directory('project');
      await directory.write({
        'node_modules/foo/index.js': ''
      });
      expect(await directory.resolve('foo'))
        .toBe(directory.path('node_modules/foo/index.js'));
    });
  });

  describe('#spawn', () => {
    it('returns an Observable of output', async () => {
      const directory = new Directory('project');
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
                console.log('Data');
              }, 200);
            }, 200);
          }, 0);
        `
      });
      const observable = directory.spawn('npm', ['start']);

      await observable;
      await observable;
      await observable;
      expect(await observable).toMatch(/Data/);
    });

    it('exposes the ChildProcess instance', async () => {
      const directory = new Directory('project');
      await directory.create();
      const server = directory.spawn('ls');
      expect(server.process).toBeDefined();
      expect(server.process.pid).toEqual(jasmine.any(Number));
    });
  });

  describe('#start', () => {
    fit('spawns npm start', async () => {
      const directory = new Directory('project');
      await directory.symlink('../node_modules', 'node_modules');
      await directory.write({
        'package.json': {
          name: 'project',
          private: true,
          scripts: {
            start: 'static'
          }
        }
      });

      await directory.start(/:8080/);

      const response = await fetch('http://127.0.0.1:8080/package.json');
      expect(await response.json()).toEqual({
        name: 'project',
        private: true,
        scripts: {
          start: 'static'
        }
      });

      await directory.stop();

      await directory.start(/:8080/);
      await directory.stop();
    });
  });

  describe('#stat', () => {
    it('returns an fs.Stats for the given file', async () => {
      const directory = new Directory('.');
      const stats = await directory.stat('package.json');
      expect(stats instanceof fs.Stats).toBe(true);
    });
  });

  describe('#symlink', () => {
    it('creates a symbolic link', async () => {
      const directory = new Directory('project');
      await directory.symlink('../package.json', 'package.json');
      expect(await directory.read('package.json'))
        .toEqual(jasmine.objectContaining({name: 'directory-helpers'}));
    });
  });

  describe('#write', () => {
    it('writes JSON files', async () => {
      const directory = new Directory('project');
      await directory.create();
      await directory.write({
        'package.json': {
          name: 'project',
          version: '0.0.1'
        }
      });
      expect(await fse.readJson(path.resolve('project/package.json'))).toEqual({
        name: 'project',
        version: '0.0.1'
      });
    });

    it('writes files with re-indented text', async () => {
      const directory = new Directory('project');
      await directory.create();
      await directory.write({
        'index.js': `
          import * as path from 'path';
          function doStuff() {
            return 42;
          }
          console.log(doStuff());
        `
      });
      const file = await fs.readFile(path.resolve('project/index.js'));
      expect(file.toString().split('\n')).toEqual([
        "import * as path from 'path';",
        'function doStuff() {',
        '  return 42;',
        '}',
        'console.log(doStuff());',
        ''
      ]);
    });

    it('creates any missing directories', async () => {
      const directory = new Directory('project');
      await directory.create();
      await directory.write({
        'src/lib/index.js': "console.log('foo')"
      });
      expect(await fs.readFile(path.resolve('project/src/lib/index.js'), 'utf8'))
        .toBe("console.log('foo')\n");
    });
  });
});
