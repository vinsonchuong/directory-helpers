import * as path from 'path';
import {fs} from 'node-promise-es6';
import Directory from 'directory-helpers';

describe('Directory', () => {
  describe('#create', () => {
    it('creates the directory', async () => {
      const directory = new Directory('project');
      await directory.create();
      expect(await fs.readdir(path.resolve('project'))).toEqual([]);
    });
  });
});
