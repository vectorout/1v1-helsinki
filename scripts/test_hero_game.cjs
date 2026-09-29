const test=require('node:test');
const assert=require('node:assert/strict');
const {createRound,targetAt,gestureAim,clampAim}=require('../js/hero-game.js');
test('accuracy is evaluated at arrival rather than launch',()=>{
 const r=createRound();r.start();
 assert.ok(r.shoot({x:220,y:106},0,false));
 assert.equal(r.finish().hit,false);
 r.start();r.shoot({x:263.5,y:115.1},0,false);
 assert.equal(r.finish().hit,true);
});
test('flight locks duplicate shots, results require advance, and only three count',()=>{
 const r=createRound();assert.equal(r.shoot({x:220,y:106},0),null);r.start();
 for(let i=0;i<3;i++){
  assert.ok(r.shoot({x:0,y:0},0,false));assert.equal(r.shoot({x:220,y:106},0),null);
  const result=r.finish();assert.equal(result.hit,false);assert.equal(r.finish(),null);
  assert.equal(r.shoot({x:220,y:106},0),null);r.advance();
 }
 assert.equal(r.phase,'done');assert.equal(r.shots,3);assert.equal(r.score,0);
 r.start();assert.equal(r.shots,0);assert.equal(r.score,0);
});
test('targets stay inside goal and become smaller each shot',()=>{
 for(let t=0;t<20000;t+=17)for(let i=0;i<3;i++){
  const p=targetAt(t,i);assert.ok(p.x-p.r>=100&&p.x+p.r<=340);assert.ok(p.y-p.r>=60&&p.y+p.r<=151);
 }
 assert.ok(targetAt(0,0).r>targetAt(0,1).r);assert.ok(targetAt(0,1).r>targetAt(0,2).r);
});
test('thumb pullback reverses direction, small gestures cancel, and aim is bounded',()=>{
 assert.equal(gestureAim(4,3),null);
 assert.deepEqual(gestureAim(20,30),{x:156,y:97});
 assert.deepEqual(gestureAim(-20,30),{x:284,y:97});
 assert.deepEqual(clampAim({x:-900,y:1000}),{x:65,y:185});
});
test('reduced motion uses the static displayed target with the same accuracy radius',()=>{
 const r=createRound();r.start();const p=targetAt(760,0);
 r.shoot({x:p.x,y:p.y},1900,true);assert.equal(r.finish().hit,true);
 r.start();r.shoot({x:p.x+p.r+1,y:p.y},1900,true);assert.equal(r.finish().hit,false);
});
