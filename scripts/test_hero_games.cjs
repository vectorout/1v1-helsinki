const test = require('node:test');
const assert = require('node:assert/strict');
const {createDribble, createReaction} = require('../js/hero-games.js');
test('dribbling never starts itself and scores each of eight gates once', () => {
 const r=createDribble(); r.tick(10000); assert.equal(r.phase,'idle'); r.start();
 for(let i=0;i<8;i++){r.move(r.gate.x); r.tick(10000); assert.equal(r.attempts,i+1); const score=r.score; r.tick(1); assert.equal(r.score,score); r.tick(500);}
 assert.equal(r.phase,'done'); assert.equal(r.score,8); r.tick(10000); assert.equal(r.attempts,8);
 r.start(); assert.equal(r.score,0); assert.equal(r.attempts,0);
});
test('dribbling misses keep the round going and ball radius must fit the gap', () => {
 const r=createDribble(); r.start(); r.move(r.gate.x+r.gate.gap/2); r.tick(10000);
 assert.equal(r.score,0); assert.equal(r.attempts,1); assert.equal(r.phase,'running');
 r.tick(500); r.move(r.gate.x); r.tick(10000); assert.equal(r.score,1);
});
test('reactions require Play, expire at deadline and cannot double-score a turn', () => {
 const r=createReaction(()=>0); r.tick(10000); assert.equal(r.phase,'idle'); assert.equal(r.tap(0),null);
 r.start(); const target=r.active; r.tick(1399); assert.equal(r.turns,0); r.tick(1); assert.equal(r.turns,1); assert.equal(r.score,0);
 assert.equal(r.tap(target),null); r.tick(380); const next=r.active;
 assert.equal(r.tap(next),true); assert.equal(r.tap(next),null); assert.equal(r.score,1);
});
test('wrong reaction taps consume a turn, rounds cap at ten, replay fully resets', () => {
 const r=createReaction(()=>.5); r.start(); assert.equal(r.tap((r.active+1)%6),false);
 for(let i=1;i<10;i++){r.tick(380); r.tap(r.active);}
 assert.equal(r.phase,'done'); assert.equal(r.score,9); assert.equal(r.turns,10); r.tick(20000); assert.equal(r.turns,10);
 r.start(); assert.equal(r.phase,'running'); assert.equal(r.turns,0); assert.equal(r.score,0); assert.equal(r.remaining,1400);
});
