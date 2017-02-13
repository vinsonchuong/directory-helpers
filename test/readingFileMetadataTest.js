/* @flow */
import test from 'ava'
import {File, Directory} from 'directory-helpers'

test('reading stats for a file and directory', async (t) => {
  const directory = new Directory('.')
  const file = new File('package.json')
  const fileContents = await file.read()

  const directoryStats = await directory.readStats()
  t.is(directoryStats.size, 4096)

  const fileStats = await file.readStats()
  t.is(fileStats.size, fileContents.length)
})

test('determining if a file or directory exists', async (t) => {
  const directory = new Directory('.')
  t.true(await directory.exists())

  const file = new File('package.json')
  t.true(await file.exists())

  const missingDirectory = new Directory('does not exist')
  t.false(await missingDirectory.exists())

  const missingFile = new File('does not exist')
  t.false(await missingFile.exists())
})
