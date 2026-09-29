/* Precision shooting: SVG only, independent of site animation libraries. */
(function () {
  'use strict';
  var FLIGHT = 650;
  function clampAim(p) { return { x: Math.max(65, Math.min(375, p.x)), y: Math.max(35, Math.min(185, p.y)) }; }
  function targetAt(ms, shot) { return { x: 220 + Math.sin(ms / 1100 + shot * 1.9) * 78, y: 106 + Math.sin(ms / 1450 + shot * 1.1) * 21, r: 18 - shot * 3 }; }
  function gestureAim(dx, dy) { return Math.hypot(dx, dy) < 8 ? null : clampAim({ x: 220 - dx * 3.2, y: 145 - dy * 1.6 }); }
  function createRound() {
    return {
      phase: 'idle', shots: 0, score: 0, flight: null,
      start: function () { this.phase = 'aim'; this.shots = 0; this.score = 0; this.flight = null; },
      shoot: function (aim, time, reduced) {
        if (this.phase !== 'aim' || !aim || !Number.isFinite(aim.x) || !Number.isFinite(aim.y)) return null;
        var target = targetAt(reduced ? 760 : time + FLIGHT, this.shots);
        var end = clampAim(aim), distance = Math.hypot(end.x - target.x, end.y - target.y);
        this.flight = { end: end, target: target, hit: distance <= target.r, distance: distance, started: time };
        this.phase = 'flight'; this.shots += 1; return this.flight;
      },
      finish: function () {
        if (this.phase !== 'flight') return null;
        var result = this.flight; this.score += result.hit ? 1 : 0; this.phase = 'result'; this.flight = null; return result;
      },
      advance: function () { if (this.phase === 'result') this.phase = this.shots === 3 ? 'done' : 'aim'; }
    };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { createRound: createRound, targetAt: targetAt, gestureAim: gestureAim, clampAim: clampAim };
  if (typeof document === 'undefined') return;
  var card = document.querySelector('[data-hero-game]');
  if (!card) return;
  var fi = document.documentElement.lang === 'fi';
  var w = fi ? {
    start: 'Aloita', next: 'Seuraava', replay: 'Uudelleen', pause: 'Tauko', resume: 'Jatka', shoot: 'Laukaise',
    idle: 'Kolme laukausta. Osu liikkuvaan kohteeseen.', mouse: 'Liikuta hiirtä, tähtää ja klikkaa. Ennakoi kohteen liike.', touch: 'Vedä palloa taaksepäin ja päästä irti. Tai napauta maalia ja laukaise.',
    keys: 'Tähtää nuolilla. Laukaise Enterillä tai välilyönnillä.', paused: 'Peli tauolla.', flight: 'Laukaus…', hit: 'Osuma.', miss: 'Ohi kohteen.', close: 'Läheltä piti.', static: 'Tähtää kohteeseen ja laukaise.',
    end: function(n){return 'Osumat: '+n+'/3.';}, shot: 'Laukaus', ready: '3 laukausta'
  } : {
    start: 'Play', next: 'Next shot', replay: 'Try again', pause: 'Pause', resume: 'Resume', shoot: 'Shoot',
    idle: 'Three shots. Hit the moving target.', mouse: 'Move to aim. Click to shoot. Lead the target.', touch: 'Pull back from the ball, then release. Or tap the goal and shoot.',
    keys: 'Arrow keys to aim. Enter or Space to shoot.', paused: 'Paused.', flight: 'In flight…', hit: 'On target.', miss: 'Missed the target.', close: 'Just off target.', static: 'Aim for the target and shoot.',
    end: function(n){return 'Targets hit: '+n+'/3.';}, shot: 'Shot', ready: '3 shots'
  };
  var round = createRound(), motion = matchMedia('(prefers-reduced-motion: reduce)');
  var field = card.querySelector('[data-game-field]'), handle = card.querySelector('[data-ball-handle]');
  var target = card.querySelector('[data-target-ring]'), marker = card.querySelector('[data-aim]');
  var ball = card.querySelector('[data-ball]'), shadow = card.querySelector('[data-ball-shadow]'), arc = card.querySelector('[data-arc]');
  var status = card.querySelector('[data-game-status]'), count = card.querySelector('[data-game-count]');
  var action = card.querySelector('[data-game-action]'), shoot = card.querySelector('[data-game-shoot]'), pause = card.querySelector('[data-game-pause]');
  var dots = Array.from(card.querySelectorAll('[data-shot-dot]'));
  var aim = {x:220,y:106}, elapsed = 0, flightElapsed = 0, last = 0, raf = 0, paused = false, visible = true;
  var input = matchMedia('(pointer: coarse)').matches ? 'touch' : 'mouse', drag = null, tap = null, origin = null;
  function setTarget(p) { target.setAttribute('cx',p.x); target.setAttribute('cy',p.y); target.setAttribute('r',p.r); }
  function setBall(x,y,s,angle) { ball.setAttribute('transform','translate('+x+' '+y+') scale('+s+') rotate('+angle+')'); }
  function updateAim(p) {
    aim=clampAim(p); marker.setAttribute('transform','translate('+aim.x+' '+aim.y+')');
    arc.setAttribute('d','M220 299 Q'+(220+(aim.x-220)*.6)+' '+(aim.y-15)+' '+aim.x+' '+aim.y);
  }
  function instruction() {
    if(motion.matches&&input==='mouse')return fi?'Liikuta hiirtä, tähtää ja klikkaa.':'Move to aim. Click to shoot.';
    return w[input === 'keyboard' ? 'keys' : input];
  }
  function paint() {
    var active=round.phase==='aim', flying=round.phase==='flight';
    card.dataset.phase=round.phase; card.dataset.input=input; card.dataset.paused=String(paused);
    action.hidden=active||flying; shoot.hidden=!active; shoot.disabled=paused;
    pause.hidden=(!active&&!flying)||motion.matches; pause.textContent=paused?w.resume:w.pause;
    action.textContent=round.phase==='idle'?w.start:round.phase==='done'?w.replay:w.next;
    handle.disabled=!active||paused; field.tabIndex=active?0:-1;
    count.textContent=round.phase==='idle'?w.ready:w.shot+' '+Math.min(round.shots+(active?1:0),3)+'/3';
    if(active)status.textContent=paused?w.paused:instruction();
    else if(flying)status.textContent=paused?w.paused:w.flight;
  }
  function resetVisual() {
    card.removeAttribute('data-outcome'); flightElapsed=0; setBall(220,299,1,0); shadow.setAttribute('opacity','.25');
    shadow.setAttribute('transform','translate(220 312)'); updateAim({x:220,y:106});
    setTarget(targetAt(motion.matches?760:elapsed,round.shots));
  }
  function stop() { cancelAnimationFrame(raf); raf=0; last=0; }
  function sync() {
    stop();
    if(!document.hidden&&visible&&!paused&&!motion.matches&&(round.phase==='aim'||round.phase==='flight'))raf=requestAnimationFrame(frame);
  }
  function finish() {
    var result=round.finish(); if(!result)return;
    setTarget(result.target); setBall(result.end.x,result.end.y,.28,210); shadow.setAttribute('opacity','0');
    dots[round.shots-1].dataset.result=result.hit?'hit':'miss';
    dots[round.shots-1].textContent=result.hit?'●':'×'; card.dataset.outcome=result.hit?'hit':'miss';
    var feedback=result.hit?w.hit:result.distance<result.target.r*2?w.close:w.miss;
    if(round.shots===3){round.advance();feedback+=' '+w.end(round.score);}
    paint();status.textContent=feedback;stop();
    if(document.activeElement===origin||document.activeElement===document.body)action.focus({preventScroll:true});
  }
  function frame(now) {
    raf=0;var dt=last?Math.min(now-last,50):0;last=now;elapsed+=dt;
    if(round.phase==='flight') {
      flightElapsed+=dt;var t=Math.min(flightElapsed/FLIGHT,1),u=1-t,p=round.flight.end;
      var x=u*u*220+2*u*t*(220+(p.x-220)*.6)+t*t*p.x;
      var y=u*u*299+2*u*t*(p.y-15)+t*t*p.y;
      setBall(x,y,1-t*.72,t*210);shadow.setAttribute('transform','translate('+x+' '+(312+(p.y-312)*t)+') scale('+(1-t*.75)+')');
      setTarget(targetAt(round.flight.started+Math.min(flightElapsed,FLIGHT),round.shots-1));
      if(t===1){finish();return;}
    }else setTarget(targetAt(elapsed,round.shots));
    raf=requestAnimationFrame(frame);
  }
  function fire(source) {
    if(paused||round.phase!=='aim'||drag)return;
    origin=source; if(!round.shoot(aim,elapsed,motion.matches))return;
    flightElapsed=0;paint(); if(motion.matches)finish();else sync();
  }
  function point(e) {var r=field.getBoundingClientRect();return{x:(e.clientX-r.left)*440/r.width,y:(e.clientY-r.top)*350/r.height};}
  function changeInput(type) {if(input!==type){input=type;paint();}}
  action.addEventListener('click',function(){
    if(round.phase==='idle'||round.phase==='done'){round.start();elapsed=0;dots.forEach(function(d){d.removeAttribute('data-result');d.textContent='○';});}else round.advance();
    paused=false;resetVisual();paint();sync();if(input==='keyboard')field.focus({preventScroll:true});
  });
  action.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' ')input='keyboard';});
  shoot.addEventListener('click',function(){fire(shoot);});
  pause.addEventListener('click',function(){paused=!paused;cancelDrag();paint();sync();});
  field.addEventListener('pointermove',function(e){
    if(round.phase!=='aim'||paused||drag||e.pointerType!=='mouse')return;
    changeInput('mouse');updateAim(point(e));
  });
  field.addEventListener('click',function(e){
    if(e.target.closest('[data-ball-handle]')||e.detail===0||(e.pointerType?e.pointerType!=='mouse':input!=='mouse'))return;
    changeInput('mouse');
    updateAim(point(e));fire(field);
  });
  field.addEventListener('pointerdown',function(e){
    if(e.target.closest('[data-ball-handle]')||e.pointerType==='mouse'||round.phase!=='aim'||paused)return;
    changeInput('touch');tap={x:e.clientX,y:e.clientY,id:e.pointerId};
  });
  field.addEventListener('pointerup',function(e){
    if(tap&&tap.id===e.pointerId&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)<8)updateAim(point(e));tap=null;
  });
  field.addEventListener('pointercancel',function(){tap=null;});
  field.addEventListener('focus',function(){if(field.matches(':focus-visible'))changeInput('keyboard');});
  field.addEventListener('keydown',function(e){
    if(e.target!==field||round.phase!=='aim'||paused)return;
    var delta={ArrowLeft:[-4,0],ArrowRight:[4,0],ArrowUp:[0,-4],ArrowDown:[0,4]}[e.key];
    if(delta){e.preventDefault();changeInput('keyboard');updateAim({x:aim.x+delta[0],y:aim.y+delta[1]});}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();changeInput('keyboard');fire(field);}
  });
  function cancelDrag() {
    if(!drag)return;
    var id=drag.id;drag=null;
    if(handle.hasPointerCapture(id))handle.releasePointerCapture(id);
    card.removeAttribute('data-dragging');setBall(220,299,1,0);
  }
  handle.addEventListener('pointerdown',function(e){
    if(drag||round.phase!=='aim'||paused||e.button!==0)return;
    e.stopPropagation();changeInput(e.pointerType==='mouse'?'mouse':'touch');
    drag={id:e.pointerId,x:e.clientX,y:e.clientY};handle.setPointerCapture(e.pointerId);card.dataset.dragging='true';
  });
  handle.addEventListener('pointermove',function(e){
    if(!drag||e.pointerId!==drag.id)return;
    var scale=440/field.getBoundingClientRect().width,dx=(e.clientX-drag.x)*scale,dy=(e.clientY-drag.y)*scale,p=gestureAim(dx,dy);
    if(p)updateAim(p);setBall(220+Math.max(-24,Math.min(24,dx*.3)),299+Math.max(-8,Math.min(19,dy*.3)),1,dx*.4);
  });
  handle.addEventListener('pointerup',function(e){
    if(!drag||e.pointerId!==drag.id)return;
    var scale=440/field.getBoundingClientRect().width,dx=e.clientX-drag.x,dy=e.clientY-drag.y,p=Math.hypot(dx,dy)>=8?gestureAim(dx*scale,dy*scale):null;
    cancelDrag();if(p){updateAim(p);fire(handle);}
  });
  handle.addEventListener('pointercancel',function(e){if(drag&&e.pointerId===drag.id)cancelDrag();});
  handle.addEventListener('lostpointercapture',function(e){if(drag&&e.pointerId===drag.id)cancelDrag();});
  document.addEventListener('visibilitychange',function(){cancelDrag();sync();});
  motion.addEventListener('change',function(){cancelDrag();if(motion.matches){paused=false;if(round.phase==='flight')finish();}if(round.phase==='aim')setTarget(targetAt(motion.matches?760:elapsed,round.shots));paint();sync();});
  if('IntersectionObserver'in window)new IntersectionObserver(function(entries){visible=entries[0].isIntersecting;if(!visible)cancelDrag();sync();},{threshold:.1}).observe(card);
  window.addEventListener('pagehide',function(){cancelDrag();stop();});window.addEventListener('pageshow',sync);
  status.textContent=motion.matches?w.static:w.idle;resetVisual();paint();card.classList.add('is-ready');card.closest('.hero').classList.add('has-hero-game');
})();
