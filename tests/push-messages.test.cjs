const assert=require('node:assert/strict');
const ts=require('typescript'),fs=require('node:fs'),vm=require('node:vm');
const moduleExports={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(require.resolve('../lib/push/messages.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:moduleExports});
const {alertPayload}=moduleExports;

const base={child_name:'Talha',minutes_left:5,limit_minutes:60,ran_minutes:30,session_id:'s1'};

const warn=alertPayload({...base,kind:'warn'});
assert.equal(warn.title,'Almost at the limit');
assert.match(warn.body,/Talha has about 5 minutes left today\./);
assert.equal(alertPayload({...base,kind:'warn',minutes_left:1}).body,'Talha has about 1 minute left today.','singular minute');

const limit=alertPayload({...base,kind:'limit'});
assert.equal(limit.title,'Daily limit reached');
assert.match(limit.body,/stopped at the limit of 60 minutes/);

const maxrun=alertPayload({...base,kind:'maxrun',ran_minutes:180});
assert.match(maxrun.body,/ran for 180 minutes and was stopped/);

const remind=alertPayload({...base,kind:'remind',ran_minutes:60});
assert.equal(remind.title,'Still on screen?');
assert.match(remind.body,/running for 60 minutes/);

// A tag per kind and session lets a repeated alert replace the earlier one instead of piling up.
const tags=new Set(['warn','limit','maxrun','remind'].map(kind=>alertPayload({...base,kind}).tag));
assert.equal(tags.size,4);
assert.notEqual(alertPayload({...base,kind:'warn'}).tag,alertPayload({...base,kind:'warn',session_id:'s2'}).tag);
console.log('push-messages ok');
