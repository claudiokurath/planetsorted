import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import Module, { createRequire } from 'node:module'
import ts from 'typescript'
const require = createRequire(import.meta.url)
const filename = fileURLToPath(new URL('../../app/protocols/[slug]/page.tsx', import.meta.url))
const mod = new Module(filename)
mod.require = name => {
  if (name === 'next/navigation') return { notFound: () => { throw Error('NOT_FOUND') }, redirect: href => { throw Error('REDIRECT '+href) } }
  // Old links must not create/check a second website account or send messages.
  if (name.startsWith('@/')) throw Error('Compatibility links must use the Button reader')
  return require(name)
}
mod._compile(ts.transpileModule(readFileSync(filename,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename)
test('old protocol cards open the separate Button reader without staging another send',async()=>{
  await assert.rejects(mod.exports.default({params:Promise.resolve({slug:'fixture-protocol'})}), /REDIRECT https:\/\/www.sor7ed.com\/resource\?context=article&slug=fixture-protocol/)
})
test('invalid protocol paths are refused before redirecting',async()=>{
  await assert.rejects(mod.exports.default({params:Promise.resolve({slug:'../private'})}), /NOT_FOUND/)
})
