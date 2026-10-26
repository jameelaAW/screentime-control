const assert=require('node:assert/strict');
const ts=require('typescript'),fs=require('node:fs'),vm=require('node:vm');
const moduleExports={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(require.resolve('../lib/session-time.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:moduleExports,Date,Math,Number});
const {capRunning,reminderDue,REMIND_EVERY_MINUTES,WARN_BEFORE_LIMIT_MINUTES}=moduleExports;

// A running session counts only up to the daily limit; finished sessions are never reduced.
assert.equal(capRunning(10,5,30),15,'under the limit: everything counts');
assert.equal(capRunning(10,20,30),30,'running time stops at the limit exactly');
assert.equal(capRunning(10,500,30),30,'a long-running timer cannot exceed the limit');
assert.equal(capRunning(30,5,30),30,'already at the limit: running time adds nothing');
assert.equal(capRunning(45,5,30),45,'already over the limit from finished sessions: totals are not reduced');
assert.equal(capRunning(0,0,30),0);
assert.equal(capRunning(0,12,0),0,'a zero limit allows no running time');

// "Still on screen?" reminders come every REMIND_EVERY_MINUTES from the start or the last confirmation.
const min=60000,start=1_000_000_000_000;
assert.equal(REMIND_EVERY_MINUTES,30);
assert.equal(WARN_BEFORE_LIMIT_MINUTES,5);
assert.equal(reminderDue(start,null,start+29*min),false,'not yet');
assert.equal(reminderDue(start,null,start+30*min),true,'due at the interval');
assert.equal(reminderDue(start,start+40*min,start+45*min),false,'confirmed 5 minutes ago');
assert.equal(reminderDue(start,start+40*min,start+70*min),true,'due again 30 minutes after confirming');
assert.equal(reminderDue(start+60*min,start,start+70*min),false,'an old confirmation never shortens a newer session');
assert.equal(reminderDue(start,null,start+10*min,10),true,'custom interval');
console.log('PASS: limit capping and reminder timing.');
