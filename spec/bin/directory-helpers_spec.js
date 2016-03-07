import {childProcess} from 'node-promise-es6';

describe('directory-helpers', () => {
  it('outputs "3...2...1...Hello World!"', async () => {
    const {stdout} = await childProcess.exec('directory-helpers');
    expect(stdout.trim()).toBe('3...2...1...Hello World!');
  });
});
