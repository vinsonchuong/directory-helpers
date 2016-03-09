import * as path from 'path';
import {fs} from 'node-promise-es6';
import * as fse from 'fs-extra-promise-es6';
import Directory from 'directory-helpers';

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

  describe('#path', () => {
    it('resolves paths relative to the basePath of the directory', () => {
      const directory = new Directory('project');
      expect(directory.path('src')).toBe(path.resolve('project', 'src'));
    });
  });

  describe('#remove', () => {
    it('deletes the directory', async () => {
      const directory = new Directory('project');
      await directory.create();
      await directory.remove();
      expect(await fs.readdir(path.resolve())).not.toContain('project');
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
