/* @flow */
import test from 'ava'
import generateUniqueName from 'directory-helpers/test/helpers/generateUniqueName'
import {File, Directory} from 'directory-helpers'

test('listing the contents of a directory', async (t) => {
  const projectDirectory = new Directory('.')

  const contents = await projectDirectory.list()
  t.true(contents.includes('README.md'))
  t.true(contents.includes('LICENSE'))
  t.true(contents.includes('package.json'))
})

test('adding and removing files to/from a directory', async (t) => {
  const projectDirectory = new Directory('.')
  const fileName = generateUniqueName()
  const file = new File(fileName)

  const beforeCreateContents = await projectDirectory.list()
  t.false(beforeCreateContents.includes(fileName))

  await file.write('')
  const afterCreateContents = await projectDirectory.list()
  t.true(afterCreateContents.includes(fileName))

  await file.remove('')
  const afterRemoveContents = await projectDirectory.list()
  t.false(afterRemoveContents.includes(fileName))
})
