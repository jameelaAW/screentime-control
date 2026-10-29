const assert=require('node:assert/strict');
const ts=require('typescript'),fs=require('node:fs'),vm=require('node:vm');
const moduleExports={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(require.resolve('../lib/export-csv.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:moduleExports,Date,Math,Number,String,Map,Object,Intl,Array,RegExp});
const {csvCell,localParts,buildCsv,exportFilename}=moduleExports;

// Cells are always quoted, quotes are doubled, and formula starters are neutralised.
assert.equal(csvCell('Talha'),'"Talha"');
assert.equal(csvCell('say "hi", ok'),'"say ""hi"", ok"');
assert.equal(csvCell(null),'""');
assert.equal(csvCell(42),'"42"');
for(const bad of ['=1+1','+1','-2','@SUM(A1)','\tx','\rx'])assert.equal(csvCell(bad),`"'${bad}"`,`formula starter ${JSON.stringify(bad)}`);
assert.equal(csvCell('a=b'),'"a=b"','an equals sign in the middle is fine');
assert.equal(csvCell('2026-10-28'),'"2026-10-28"','dates are not touched');

// Local date/time in the caregiver's zone (Singapore is UTC+8): 23:30 UTC is 07:30 the next day.
assert.deepEqual({...localParts('2026-10-28T23:30:00Z','Asia/Singapore')},{date:'2026-10-29',time:'07:30'});
assert.deepEqual({...localParts('2026-10-28T23:30:00Z','UTC')},{date:'2026-10-28',time:'23:30'});
assert.deepEqual({...localParts('2026-10-28T23:30:00Z','Not/AZone')},{date:'2026-10-28',time:'23:30'},'unknown zone falls back to UTC');
assert.deepEqual({...localParts('not a date','UTC')},{date:'',time:''});

const children=[
 {id:'c2',name:'Zed',age:null,daily_limit_minutes:30,notes:null},
 {id:'c1',name:'Amy',age:7,daily_limit_minutes:60,notes:'=cmd'},
 {id:'c3',name:'Bo, Jr.',age:5,daily_limit_minutes:45,notes:'uses "tablet"'},
];
const now=Date.parse('2026-10-29T02:00:00Z');
const sessions=[
 {child_id:'c1',started_at:'2026-10-28T10:00:00Z',ended_at:'2026-10-28T10:30:00Z',duration_minutes:30,device_type:'tv',activity_type:'video',notes:null},
 {child_id:'c1',started_at:'2026-10-28T09:00:00Z',ended_at:'2026-10-28T09:10:00Z',duration_minutes:10,device_type:'tablet',activity_type:'game',notes:'after "lunch"'},
 {child_id:'c2',started_at:'2026-10-29T01:00:00Z',ended_at:null,duration_minutes:0,device_type:'phone',activity_type:'social',notes:null},
 {child_id:'c2',started_at:'2026-10-28T01:00:00Z',ended_at:null,duration_minutes:0,device_type:'tv',activity_type:'video',notes:null}, // forgotten timer: capped at 180
];
const csv=buildCsv(children,sessions,'Asia/Singapore',now);
assert.ok(csv.startsWith('﻿'),'byte-order mark for Excel');
const lines=csv.split('\r\n');
assert.equal(lines.pop(),'','ends with a line break');
assert.equal(lines.length,1+2+1+2,'header + Amy x2 + Bo (no sessions) + Zed x2');
assert.equal(lines[0],'﻿"Child","Age","Daily limit (minutes)","Child notes","Date","Start time","End time","Minutes","Device","Activity","Session notes","Status"');
assert.match(lines[1],/^"Amy","7","60","'=cmd","2026-10-28","17:00","17:10","10","tablet","game","after ""lunch""","Finished"$/,'oldest session first, local time, notes escaped, formula neutralised');
assert.match(lines[2],/"2026-10-28","18:00","18:30","30","tv","video","","Finished"$/);
assert.match(lines[3],/^"Bo, Jr\.","5","45","uses ""tablet""","","","","","","","","No sessions"$/,'a child with no sessions still appears');
assert.match(lines[4],/^"Zed","","30","","2026-10-28","09:00","","180","tv","video","","Running"$/,'a forgotten timer shows at most 180 minutes');
assert.match(lines[5],/^"Zed","","30","","2026-10-29","09:00","","60","phone","social","","Running"$/,'a running timer shows elapsed minutes');

assert.equal(buildCsv([],[],'UTC',now),'﻿'+'"Child","Age","Daily limit (minutes)","Child notes","Date","Start time","End time","Minutes","Device","Activity","Session notes","Status"\r\n','empty account still gives a valid file with headers');
assert.equal(exportFilename('2026-10-29'),'screen-time-control-2026-10-29.csv');
console.log('export-csv ok');
