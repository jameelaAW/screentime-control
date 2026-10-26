const assert=require('node:assert/strict');
const ts=require('typescript'),fs=require('node:fs'),vm=require('node:vm');
const moduleExports={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(require.resolve('../lib/license-key.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:moduleExports,JSON});
const {normalizeKey,isValidKeyFormat,parsePayhipVerify}=moduleExports;

// Normalising: trim, upper-case, drop all whitespace.
assert.equal(normalizeKey('  wtkp4-66nl5-hmkqw-gfscz \n'),'WTKP4-66NL5-HMKQW-GFSCZ');
assert.equal(normalizeKey('WTKP4 66NL5 HMKQW GFSCZ'),'WTKP466NL5HMKQWGFSCZ');

// Format: Payhip-style keys pass; anything that could be abused or is clearly not a key fails.
assert.equal(isValidKeyFormat('WTKP4-66NL5-HMKQW-GFSCZ'),true);
assert.equal(isValidKeyFormat('ABCDEFGH'),true);
for (const bad of ['','A','SHORT','-ABCDEFGH','ABCDEFGH-','AB CD EF GH','KEY&license_key=other','KEY/../x','KEY\n123456','<script>alert(1)</script>','A'.repeat(65)])
  assert.equal(isValidKeyFormat(bad),false,`rejects ${JSON.stringify(bad)}`);

// Payhip responses: only data.enabled === true is valid.
assert.equal(parsePayhipVerify('{"data":{"enabled":true,"license_key":"X","uses":0}}'),'valid');
assert.equal(parsePayhipVerify('{"data":{"enabled":false}}'),'invalid','refunded/disabled key');
assert.equal(parsePayhipVerify(''),'invalid','empty response = unknown key');
assert.equal(parsePayhipVerify('   \n'),'invalid');
assert.equal(parsePayhipVerify('not json'),'invalid');
assert.equal(parsePayhipVerify('{}'),'invalid');
assert.equal(parsePayhipVerify('{"data":null}'),'invalid');
assert.equal(parsePayhipVerify('{"data":{"enabled":"true"}}'),'invalid','must be the boolean true');
assert.equal(parsePayhipVerify('{"data":{"enabled":1}}'),'invalid');
console.log('PASS: licence key normalising, format checks and Payhip response parsing.');
