const test = require('node:test');
const assert = require('node:assert/strict');
const {createDribble, createReaction} = require('../js/hero-games.js');
function passGate(r,hit=true){const before=r.attempts;for(let ticks=0;r.attempts===before&&ticks<2000;ticks++){const gate=r.gates.find(g=>!g.judged);r.move(hit?gate.x:gate.x<220?404:36);r.tick(10);}assert.equal(r.attempts,before+1);}
function hitReaction(r){if(r.wait)r.tick(r.wait);assert.equal(r.tap(r.active),true);}
test('dribbling continues beyond 100, scores each gate once, and cleans up its moving queue',()=>{
 const r=createDribble();r.tick(10000);assert.equal(r.phase,'idle');r.start();
 assert.ok(Array.isArray(r.gates),'continuous queue exists');
 for(let i=0;i<125;i++){passGate(r);assert.equal(r.score,i+1);assert.equal(r.phase,'running');assert.ok(r.gates.length>=2&&r.gates.length<=4);assert.ok(r.gates.every(g=>g.y<=370));const scored=r.gates.find(g=>g.judged);if(scored){const y=scored.y;r.tick(1);assert.ok(scored.y>y,'passed gate keeps moving');assert.equal(r.score,i+1);}}
 assert.equal(r.level,13);assert.equal(r.lives,3);
});
test('dribbling requires ball clearance, ends after three misses, and replay resets while preserving mode',()=>{
 const r=createDribble();assert.equal(r.setMode('hard'),true);r.start();assert.equal(r.setMode('easy'),false);
 for(let i=0;i<3;i++){passGate(r,false);assert.equal(r.lives,2-i);assert.equal(r.score,0);assert.equal(r.phase,i===2?'done':'running');}
 const n=r.attempts;r.tick(10000);assert.equal(r.attempts,n);r.start();assert.equal(r.mode,'hard');assert.equal(r.lives,3);assert.equal(r.score,0);assert.equal(r.attempts,0);
 const gate=r.gates[0];r.move(gate.x+gate.gap/2-18);while(!r.attempts)r.tick(10);assert.equal(r.score,0,'the full 19px ball radius must fit');
});
test('dribbling difficulty changes at ten correct points with bounded reachable gates in every mode',()=>{
 let previous;
 for(const mode of ['easy','normal','hard']){const r=createDribble(()=>.99);r.setMode(mode);r.start();const initial=r.settings();if(previous){assert.ok(initial.speed>previous.speed);assert.ok(initial.gap<previous.gap);}previous=initial;
 for(let i=0;i<9;i++)passGate(r);assert.deepEqual(r.settings(),initial);passGate(r);assert.equal(r.level,2);assert.ok(r.settings().speed>initial.speed);assert.ok(r.settings().gap<initial.gap);
 for(let i=10;i<120;i++)passGate(r);assert.ok(r.settings().speed>initial.speed*1.7);assert.ok(r.settings().gap>38);assert.ok(r.settings().speed<.4);assert.equal(r.phase,'running');
 for(let i=1;i<r.gates.length;i++)assert.ok(Math.abs(r.gates[i].x-r.gates[i-1].x)<=90,'successive gates have bounded lateral shifts');}
});
test('reactions require Play, expire exactly at deadline, and cannot double-score',()=>{
 const r=createReaction(()=>0);r.tick(10000);assert.equal(r.phase,'idle');assert.equal(r.tap(0),null);r.start();const target=r.active;r.tick(1399);assert.equal(r.turns,0);r.tick(1);assert.equal(r.turns,1);assert.equal(r.lives,2);assert.equal(r.tap(target),null);r.tick(r.wait);assert.notEqual(r.active,target);const next=r.active;assert.equal(r.tap(next),true);assert.equal(r.tap(next),null);assert.equal(r.score,1);
});
test('reactions run beyond 100 with exact ten-point progression, mode order and bounded deadlines',()=>{
 let previous;
 for(const mode of ['easy','normal','hard']){const r=createReaction(()=>.5);r.setMode(mode);r.start();const deadline=r.remaining;if(previous)assert.ok(deadline<previous);previous=deadline;
 for(let i=0;i<9;i++){hitReaction(r);r.tick(r.wait);assert.equal(r.remaining,deadline);}hitReaction(r);r.tick(r.wait);assert.equal(r.level,2);assert.ok(r.remaining<deadline);
 for(let i=10;i<125;i++)hitReaction(r);r.tick(r.wait);assert.equal(r.score,125);assert.equal(r.phase,'running');assert.ok(r.remaining>=360);assert.ok(r.remaining<800);assert.equal(r.lives,3);}
});
test('reaction misses do not increase difficulty and three misses end the run; replay preserves mode',()=>{
 const r=createReaction(()=>.5);r.setMode('hard');r.start();assert.equal(r.setMode('easy'),false);
 assert.equal(r.tap((r.active+1)%6),false);r.tick(r.wait);r.tick(r.remaining);r.tick(r.wait);assert.equal(r.level,1);assert.equal(r.score,0);assert.equal(r.lives,1);r.tap((r.active+1)%6);assert.equal(r.phase,'done');assert.equal(r.lives,0);const turns=r.turns;r.tick(10000);assert.equal(r.turns,turns);
 r.start();assert.equal(r.mode,'hard');assert.equal(r.turns,0);assert.equal(r.score,0);assert.equal(r.lives,3);assert.equal(r.remaining,1100);assert.equal(r.setMode('invalid'),false);
});
