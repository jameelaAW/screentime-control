const assert=require('node:assert/strict');
const ts=require('typescript'),fs=require('node:fs'),vm=require('node:vm');
const moduleExports={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(require.resolve('../lib/safe-redirect.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:moduleExports});
const {safeNext}=moduleExports;
assert.equal(safeNext('/reset-password'),'/reset-password');
assert.equal(safeNext('/'),'/');
assert.equal(safeNext(null),'/');
assert.equal(safeNext(undefined),'/');
assert.equal(safeNext(''),'/');
const backslash=String.fromCharCode(92);
for (const bad of ['https://evil.example','//evil.example','/'+backslash+'evil.example','javascript:alert(1)','evil.example','/ok\nhttps://evil.example'])
  assert.equal(safeNext(bad),'/',`blocks ${JSON.stringify(bad)}`);
console.log('PASS: safeNext only allows same-site paths.');
