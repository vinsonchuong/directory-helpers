import test from 'ava'
import * as path from 'path'
import {fs} from 'node-promise-es6'
import Directory from 'directory-helpers'

test('creating and removing a directory', async (t) => {
  const directoryName = t.title
  const directory = new Directory(directoryName)

  await directory.create()

  const afterCreateContents = await fs.readdir(path.resolve())
  t.true(afterCreateContents.includes(directoryName))

  await directory.remove()

  const afterRemoveContents = await fs.readdir(path.resolve())
  t.false(afterRemoveContents.includes(directoryName))
})
