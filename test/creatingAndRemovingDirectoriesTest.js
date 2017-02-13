/* @flow */
import test from 'ava'
import generateUniqueName from 'directory-helpers/test/helpers/generateUniqueName'
import {File, Directory} from 'directory-helpers'

test('creating and removing a directory', async (t) => {
  const projectDirectory = new Directory('.')
  const directoryName = generateUniqueName()

  const newDirectory = new Directory(projectDirectory, directoryName)
  await newDirectory.create()
  const afterCreateContents = await projectDirectory.list()
  t.true(afterCreateContents.includes(directoryName))

  await newDirectory.remove()
  const afterRemoveContents = await projectDirectory.list()
  t.false(afterRemoveContents.includes(directoryName))
})

test('removing a directory containing files', async (t) => {
  const projectDirectory = new Directory('.')
  const directoryName = generateUniqueName()
  const fileName = generateUniqueName()

  const newDirectory = new Directory(projectDirectory, directoryName)
  await newDirectory.create()
  const newFile = new File(newDirectory, fileName)
  await newFile.write('')

  await newDirectory.remove()
  const afterRemoveContents = await projectDirectory.list()
  t.false(afterRemoveContents.includes(directoryName))
})
