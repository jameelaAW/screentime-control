const assert=require('node:assert/strict');
const ts=require('typescript'),fs=require('node:fs'),vm=require('node:vm');
const moduleExports={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(require.resolve('../lib/export-data.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:moduleExports,Date,Math,Number,String,Map,Object,Intl,Array,RegExp});
const {csvCell,localParts,sessionMinutes,buildCsv,buildReport,exportFilename,deviceLabel,activityLabel}=moduleExports;

// CSV cells: quotes only when needed, quotes doubled, formula starters neutralised.
assert.equal(csvCell('Talha'),'Talha','plain text stays plain');
assert.equal(csvCell(42),'42');
assert.equal(csvCell(null),'');
assert.equal(csvCell('a, b'),'"a, b"');
assert.equal(csvCell('say "hi"'),'"say ""hi"""');
assert.equal(csvCell('two\nlines'),'"two\nlines"');
assert.equal(csvCell(' padded'),'" padded"');
for(const bad of ['=1+1','+1','-2','@SUM(A1)'])assert.equal(csvCell(bad),`'${bad}`,`formula starter ${bad}`);
assert.equal(csvCell('=a,b'),`"'=a,b"`,'neutralised and quoted when it also has a comma');
assert.equal(csvCell('a=b'),'a=b','an equals sign in the middle is fine');
assert.equal(csvCell('2026-10-28'),'2026-10-28','dates are not touched');

// Local date/time (Singapore is UTC+8): 23:30 UTC is 07:30 the next day.
assert.deepEqual({...localParts('2026-10-28T23:30:00Z','Asia/Singapore')},{date:'2026-10-29',time:'07:30'});
assert.deepEqual({...localParts('2026-10-28T23:30:00Z','Not/AZone')},{date:'2026-10-28',time:'23:30'},'unknown zone falls back to UTC');
assert.deepEqual({...localParts('not a date','UTC')},{date:'',time:''});

// Friendly labels, with a safe fallback for anything unexpected.
assert.equal(deviceLabel('game-console'),'Game console');
assert.equal(deviceLabel('tv'),'TV');
assert.equal(activityLabel('educational'),'Educational');
assert.equal(deviceLabel('toaster'),'toaster');

const children=[
 {id:'c2',name:'Zed',age:null,daily_limit_minutes:30,notes:null},
 {id:'c1',name:'Amy',age:7,daily_limit_minutes:60,notes:'=cmd'},
 {id:'c3',name:'Bo, Jr.',age:5,daily_limit_minutes:45,notes:'uses "tablet"'},
];
const now=Date.parse('2026-10-29T02:00:00Z');
const sessions=[
 {child_id:'c1',started_at:'2026-10-28T10:00:00Z',ended_at:'2026-10-28T10:30:00Z',duration_minutes:30,device_type:'tv',activity_type:'video',notes:null},
 {child_id:'c1',started_at:'2026-10-28T09:00:00Z',ended_at:'2026-10-28T09:10:00Z',duration_minutes:10,device_type:'tablet',activity_type:'game',notes:'after "lunch"'},
 {child_id:'c1',started_at:'2026-10-27T09:00:00Z',ended_at:'2026-10-27T10:10:00Z',duration_minutes:70,device_type:'game-console',activity_type:'game',notes:null},
 {child_id:'c2',started_at:'2026-10-29T01:00:00Z',ended_at:null,duration_minutes:0,device_type:'phone',activity_type:'social',notes:null},
 {child_id:'c2',started_at:'2026-10-28T01:00:00Z',ended_at:null,duration_minutes:0,device_type:'tv',activity_type:'video',notes:null}, // forgotten timer: capped at 180
];
assert.equal(sessionMinutes(sessions[0],now),30);
assert.equal(sessionMinutes(sessions[3],now),60,'a running timer shows the time so far');
assert.equal(sessionMinutes(sessions[4],now),180,'a forgotten timer is capped at 3 hours');

const csv=buildCsv(children,sessions,'Asia/Singapore',now);
assert.ok(csv.startsWith('﻿'),'byte-order mark for Excel');
const lines=csv.split('\r\n');
assert.equal(lines.pop(),'','ends with a line break');
assert.equal(lines.length,1+3+1+2,'header + Amy x3 + Bo (no sessions) + Zed x2');
assert.equal(lines[0],'﻿Child,Age,Daily limit (min),Child notes,Date,Start,End,Minutes,Device,Activity,Session notes,Status');
assert.equal(lines[1],"Amy,7,60,'=cmd,2026-10-27,17:00,18:10,70,Game console,Game,,Finished",'oldest first, labels, formula neutralised');
assert.equal(lines[2],'Amy,7,60,\'=cmd,2026-10-28,17:00,17:10,10,Tablet,Game,"after ""lunch""",Finished');
assert.equal(lines[4],'"Bo, Jr.",5,45,"uses ""tablet""",,,,,,,,No sessions','a child with no sessions still appears');
assert.equal(lines[5],'Zed,,30,,2026-10-28,09:00,,180,TV,Video,,Running');
assert.equal(lines[6],'Zed,,30,,2026-10-29,09:00,,60,Phone,Social,,Running');
assert.equal(buildCsv([],[],'UTC',now),'﻿Child,Age,Daily limit (min),Child notes,Date,Start,End,Minutes,Device,Activity,Session notes,Status\r\n','empty account still gives a valid file');
assert.equal(exportFilename('2026-10-29'),'screen-time-control-2026-10-29.csv');

// The readable report.
const report=buildReport(children,sessions,'Asia/Singapore',now);
assert.equal(report.generatedDate,'2026-10-29');assert.equal(report.generatedTime,'10:00');
assert.deepEqual([...report.children.map(c=>c.name)],['Amy','Bo, Jr.','Zed']);
const amy=report.children[0];
assert.equal(amy.sessionCount,3);assert.equal(amy.totalMinutes,110);
assert.deepEqual([...amy.days.map(d=>({...d}))],[
 {date:'2026-10-28',minutes:40,sessions:2,over:false},
 {date:'2026-10-27',minutes:70,sessions:1,over:true},
],'days newest first; 70 minutes is over a 60 minute limit');
assert.equal(amy.sessions[0].date,'2026-10-28');assert.equal(amy.sessions[0].start,'18:00');assert.equal(amy.sessions[0].end,'18:30','sessions newest first');
assert.equal(report.children[1].sessions.length,0);assert.equal(report.children[1].days.length,0);
const zed=report.children[2];
assert.equal(zed.sessions[0].running,true);assert.equal(zed.sessions[0].end,'');
assert.equal(zed.days[1].over,true,'a forgotten 180 minute timer is over a 30 minute limit');
assert.equal(buildReport([],[],'UTC',now).children.length,0);
console.log('export-data ok');
