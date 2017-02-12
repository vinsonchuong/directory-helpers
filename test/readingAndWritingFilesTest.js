/* @flow */
import test from 'ava'
import {File} from 'directory-helpers'
import generateUniqueName from 'directory-helpers/test/helpers/generateUniqueName'

test('reading a file in the current directory', async (t) => {
  const readmeFile = new File('README.md')
  const readmeContents = await readmeFile.read()
  t.true(readmeContents.includes('# directory-helpers'))

  const licenseFile = new File('LICENSE')
  const licenseContents = await licenseFile.read()
  t.true(licenseContents.includes('The MIT License'))
})

test('reading a file that does not exist', async (t) => {
  const missingFile = new File('does not exist')
  try {
    await missingFile.read()
    t.fail()
  } catch (error) {
    t.is(error.code, 'ENOENT')
    t.pass()
  }
})

test('creating and modifying a file', async (t) => {
  const fileName = generateUniqueName()
  const fileContents = 'contents'

  const newFile = new File(fileName)
  await newFile.write(fileContents)
  t.is(await newFile.read(), fileContents)

  const newFileContents = 'new contents'
  await newFile.write(newFileContents)
  t.is(await newFile.read(), newFileContents)

  await newFile.remove()
})
