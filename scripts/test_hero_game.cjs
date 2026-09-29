const test = require('node:test');
const assert = require('node:assert/strict');
const { createRound, keeperAt } = require('../js/hero-game.js');
test('round locks shots until advance and finishes after three', () => {
 const r=createRound(); assert.equal(r.shoot('tl',{x:336,y:170}),null); r.start();
 assert.equal(r.shoot('tl',{x:336,y:170}),true);
 assert.equal(r.shoot('tr',{x:336,y:170}),null); assert.equal(r.shots,1);
 r.advance(); assert.equal(r.shoot('br',{x:336,y:170}),false);
 r.advance(); assert.equal(r.shoot('bl',{x:336,y:170}),true);
 r.advance(); assert.equal(r.phase,'done'); assert.equal(r.score,2);
 assert.equal(r.shoot('tl',{x:336,y:170}),null); assert.equal(r.shots,3);
 r.start(); assert.equal(r.shots,0); assert.equal(r.score,0);
});
test('position determines saves and invalid targets do not consume shots', () => {
 const r=createRound(); r.start(); assert.equal(r.shoot('unknown',{x:104,y:85}),null);
 assert.equal(r.shots,0); assert.equal(r.shoot('tl',{x:104,y:85}),false);
 r.advance(); assert.equal(r.shoot('tr',{x:104,y:85}),true);
});
test('patrol is repeatable, bounded and elapsed-time based', () => {
 assert.deepEqual(keeperAt(750,0),keeperAt(750,0));
 assert.notDeepEqual(keeperAt(0,0),keeperAt(500,0));
 for(let ms=0;ms<20000;ms+=19){const p=keeperAt(ms,1);assert.ok(p.x>=108&&p.x<=332);assert.ok(p.y>=105&&p.y<=155);}
});
test('height matters when a keeper covers one side of the goal', () => {
 const r=createRound(); r.start();
 assert.equal(r.shoot('tl',{x:200,y:100}),false);
 r.advance(); assert.equal(r.shoot('bl',{x:200,y:100}),true);
});
