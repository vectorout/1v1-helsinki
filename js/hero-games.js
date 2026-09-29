/* Optional local challenges. Models consume active time only; no background timers. */
(function () {
  'use strict';
  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
  var MODES = {
    easy:{speed:.09,maxSpeed:.29,gap:210,minGap:78,deadline:1700,minDeadline:550,wait:160},
    normal:{speed:.115,maxSpeed:.34,gap:185,minGap:64,deadline:1400,minDeadline:440,wait:140},
    hard:{speed:.145,maxSpeed:.39,gap:160,minGap:58,deadline:1100,minDeadline:360,wait:120}
  };
  function setMode(mode) {
    if(this.phase==='running'||!Object.prototype.hasOwnProperty.call(MODES,mode))return false;
    this.mode=mode;return true;
  }
  function settings() {
    var mode=MODES[this.mode],step=Math.floor(this.score/10),decay=Math.pow(.84,step);
    return {speed:mode.maxSpeed-(mode.maxSpeed-mode.speed)*decay,
      gap:mode.minGap+(mode.gap-mode.minGap)*decay,
      deadline:Math.round(mode.minDeadline+(mode.deadline-mode.minDeadline)*decay),wait:mode.wait};
  }
  function createDribble(random) {
    random=random||Math.random;
    return {
      phase:'idle',mode:'normal',score:0,attempts:0,lives:3,x:220,gates:[],result:null,serial:0,
      get level(){return Math.floor(this.score/10)+1;},setMode:setMode,settings:settings,
      next:function(y){
        var last=this.gates[this.gates.length-1],gap=this.settings().gap;
        // Preview each turn, with bounded sideways travel even at the fastest pace.
        var x=last?clamp(last.x+(this.serial%2?1:-1)*(48+random()*36),48+gap/2,392-gap/2):220;
        this.gates.push({id:this.serial++,x:x,y:y,gap:gap,judged:false,result:null});
      },
      start:function(){
        this.phase='running';this.score=0;this.attempts=0;this.lives=3;this.x=220;this.result=null;this.serial=0;this.gates=[];
        this.next(160);this.next(40);this.next(-80);
      },
      move:function(x){if(this.phase==='running'&&Number.isFinite(x))this.x=clamp(x,36,404);},
      tick:function(dt){
        if(this.phase!=='running'||!Number.isFinite(dt)||dt<=0)return;
        // Small active-time steps also keep collision checks sound after a long frame.
        while(dt>0&&this.phase==='running'){
          var step=Math.min(dt,50),distance=step*this.settings().speed;dt-=step;
          for(var i=0;i<this.gates.length;i++){
            var gate=this.gates[i];gate.y+=distance;
            if(!gate.judged&&gate.y>=280){
              gate.judged=true;gate.result=Math.abs(this.x-gate.x)+19<=gate.gap/2;
              this.result=gate.result;this.attempts++;
              if(gate.result)this.score++;else this.lives--;
              if(!this.lives){this.phase='done';break;}
            }
          }
          this.gates=this.gates.filter(function(gate){return gate.y<=370;});
          var tail=this.gates[this.gates.length-1];if(this.phase==='running'&&tail.y>=0)this.next(tail.y-120);
        }
      }
    };
  }
  function createReaction(random) {
    random=random||Math.random;
    return {
      phase:'idle',mode:'normal',score:0,turns:0,lives:3,active:-1,remaining:0,wait:0,result:null,previous:-1,
      get level(){return Math.floor(this.score/10)+1;},setMode:setMode,settings:settings,
      next:function(){var n=Math.floor(random()*5);this.active=this.previous<0?Math.floor(random()*6):(n>=this.previous?n+1:n);this.previous=this.active;this.remaining=this.settings().deadline;this.result=null;},
      start:function(){this.phase='running';this.score=0;this.turns=0;this.lives=3;this.wait=0;this.previous=-1;this.next();},
      finish:function(hit){
        if(this.phase!=='running'||this.active<0)return null;
        this.result=hit;if(hit)this.score++;else this.lives--;this.turns++;this.active=-1;
        if(!this.lives)this.phase='done';else this.wait=this.settings().wait;return hit;
      },
      tap:function(index){if(this.phase!=='running'||this.active<0)return null;return this.finish(index===this.active&&this.remaining>0);},
      tick:function(dt){if(this.phase!=='running'||!Number.isFinite(dt)||dt<=0)return;if(this.wait){this.wait=Math.max(0,this.wait-dt);if(!this.wait)this.next();return;}this.remaining=Math.max(0,this.remaining-dt);if(!this.remaining)this.finish(false);}
    };
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={createDribble:createDribble,createReaction:createReaction};
  if(typeof document==='undefined')return;
  var root=document.querySelector('[data-hero-games]');if(!root)return;
  var fi=document.documentElement.lang==='fi';
  var words=fi?{play:'Aloita',again:'Uudelleen',pause:'Tauko',resume:'Jatka',paused:'Peli tauolla.',score:'Pisteet',level:'Taso',lives:'Yrityksiä',end:'Peli päättyi.',active:'aktiivinen',ball:'Pallo',choose:'Valitse ennen aloitusta.',locked:'Vaikeustaso lukittu pelin ajaksi.'}:{play:'Play',again:'Try again',pause:'Pause',resume:'Resume',paused:'Paused.',score:'Score',level:'Level',lives:'Lives',end:'Game over.',active:'active',ball:'Ball',choose:'Choose before Play.',locked:'Difficulty locked during the run.'};
  var panels=Array.from(root.querySelectorAll('[data-game-panel]')),tabs=Array.from(root.querySelectorAll('[role="tab"]'));
  function select(index,focus){
    panels.forEach(function(panel,i){var active=i===index;panel.dispatchEvent(new CustomEvent('hero-game-visibility',{detail:{active:active}}));panel.hidden=!active;tabs[i].setAttribute('aria-selected',String(active));tabs[i].tabIndex=active?0:-1;});
    if(focus)tabs[index].focus();
  }
  tabs.forEach(function(tab,index){tab.addEventListener('click',function(){select(index,false);});tab.addEventListener('keydown',function(e){var next;if(e.key==='ArrowRight')next=(index+1)%tabs.length;if(e.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;if(e.key==='Home')next=0;if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();select(next,true);}});});
  panels.slice(1).forEach(function(panel){
    var dribble=panel.dataset.gamePanel==='dribbling',model=dribble?createDribble():createReaction();
    var action=panel.querySelector('[data-mini-action]'),pause=panel.querySelector('[data-mini-pause]'),status=panel.querySelector('[data-mini-status]'),count=panel.querySelector('[data-mini-count]'),score=panel.querySelector('[data-mini-score]');
    var field=panel.querySelector('[data-mini-field]'),handle=panel.querySelector('[data-dribble-handle]'),ball=panel.querySelector('[data-dribble-ball]'),gate=panel.querySelector('[data-dribble-gate]'),targets=Array.from(panel.querySelectorAll('[data-reaction-target]'));
    var modes=Array.from(panel.querySelectorAll('[data-mini-mode]')),modeNote=panel.querySelector('[data-mini-mode-note]'),lives=panel.querySelector('[data-mini-lives]'),dots=Array.from(lives.querySelectorAll('i')),gateNodes=[];
    if(dribble){for(var g=0;g<4;g++){var node=g===0?gate:gate.cloneNode(true);if(g)gate.parentNode.insertBefore(node,ball);gateNodes.push({node:node,cones:node.querySelectorAll('[data-cone]')});}}
    var instruction=status.textContent,raf=0,last=0,visible=false,selected=false,paused=false,pageActive=true,drag=null,tap=null,press=null,keyPress=null,previousPhase='idle';
    function runnable(){return selected&&visible&&!document.hidden&&pageActive&&!paused&&model.phase==='running';}
    function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
    function sync(){stop();if(runnable())raf=requestAnimationFrame(frame);}
    function cancel(){tap=null;press=null;keyPress=null;if(!drag)return;var id=drag.id;drag=null;if(handle.hasPointerCapture(id))handle.releasePointerCapture(id);}
    function draw(){
      if(dribble){
        ball.setAttribute('transform','translate('+model.x+' 280)');handle.style.left=(model.x/440*100)+'%';
        gateNodes.forEach(function(view,i){
          var current=model.gates[i]||(model.phase==='idle'&&i<3?{x:220+(i%2?48:0),y:160-i*120,gap:model.settings().gap}:null);
          view.node.style.display=current?'':'none';if(!current)return;
          view.node.setAttribute('transform','translate(0 '+current.y+')');view.node.setAttribute('opacity',current.judged?'.35':'1');
          view.cones[0].setAttribute('transform','translate('+(current.x-current.gap/2)+' 0)');view.cones[1].setAttribute('transform','translate('+(current.x+current.gap/2)+' 0)');
        });
      }else targets.forEach(function(button,i){var active=model.active===i&&model.phase==='running'&&!paused;button.dataset.active=String(active);button.setAttribute('aria-label',words.ball+' '+(i+1)+(active?', '+words.active:''));button.disabled=model.phase!=='running'||paused;});
    }
    function paint(){
      var focused=document.activeElement,wasRunning=previousPhase==='running';previousPhase=model.phase;
      var running=model.phase==='running',done=model.phase==='done';
      panel.dataset.phase=model.phase;panel.dataset.paused=String(paused);action.hidden=running;action.textContent=done?words.again:words.play;pause.hidden=!running;pause.textContent=paused?words.resume:words.pause;
      count.textContent=words.level+' '+model.level;score.textContent=model.score;
      lives.setAttribute('aria-label',words.lives+': '+model.lives+' / 3');dots.forEach(function(dot,i){dot.dataset.available=String(i<model.lives);});
      modes.forEach(function(button){button.disabled=running;button.setAttribute('aria-pressed',String(button.dataset.miniMode===model.mode));});modeNote.textContent=running?words.locked:words.choose;
      var message=done?words.end+' '+words.score+': '+model.score+'.':paused?words.paused:instruction;if(status.textContent!==message)status.textContent=message;
      if(handle)handle.disabled=!running||paused;
      draw();
      if(done&&wasRunning&&selected&&field.contains(focused))action.focus({preventScroll:true});
    }
    function focusGame(){if(dribble)field.focus({preventScroll:true});else targets[model.active<0?0:model.active].focus({preventScroll:true});}
    function frame(now){raf=0;if(!runnable()){last=0;return;}var dt=last?Math.min(now-last,50):0;last=now;var before=dribble?model.attempts:model.turns,old=model.active;model.tick(dt);if(before!==(dribble?model.attempts:model.turns)||old!==model.active)paint();else if(dribble)draw();if(runnable())raf=requestAnimationFrame(frame);else last=0;}
    modes.forEach(function(button){button.addEventListener('click',function(){if(model.setMode(button.dataset.miniMode))paint();});});
    action.addEventListener('click',function(e){cancel();model.start();paused=false;paint();sync();if(e.detail===0)focusGame();});
    pause.addEventListener('click',function(e){paused=!paused;cancel();paint();sync();if(!paused&&e.detail===0)focusGame();});
    panel.addEventListener('hero-game-visibility',function(e){selected=e.detail.active;if(!selected){if(model.phase==='running')paused=true;cancel();}paint();sync();});
    document.addEventListener('visibilitychange',function(){cancel();sync();});
    window.addEventListener('pagehide',function(){pageActive=false;cancel();stop();});window.addEventListener('pageshow',function(){pageActive=true;sync();});
    if('IntersectionObserver'in window)new IntersectionObserver(function(entries){visible=entries[0].isIntersecting;if(!visible)cancel();sync();},{threshold:.1}).observe(panel);else visible=true;
    if(dribble){
      function move(e){if(!runnable())return;var box=field.getBoundingClientRect();model.move((e.clientX-box.left)/box.width*440);draw();}
      field.addEventListener('pointerdown',function(e){if(e.target.closest('[data-dribble-handle]')||!runnable()||tap||!e.isPrimary)return;tap={id:e.pointerId,x:e.clientX,y:e.clientY};});
      field.addEventListener('pointerup',function(e){if(!tap||tap.id!==e.pointerId)return;if(Math.hypot(e.clientX-tap.x,e.clientY-tap.y)<8)move(e);tap=null;});
      field.addEventListener('pointercancel',function(e){if(tap&&tap.id===e.pointerId)tap=null;});
      handle.addEventListener('pointerdown',function(e){if(!runnable()||drag||!e.isPrimary||e.button!==0)return;e.stopPropagation();drag={id:e.pointerId};handle.setPointerCapture(e.pointerId);move(e);});
      handle.addEventListener('pointermove',function(e){if(drag&&drag.id===e.pointerId)move(e);});
      handle.addEventListener('pointerup',function(e){if(drag&&drag.id===e.pointerId){move(e);cancel();}});
      handle.addEventListener('pointercancel',function(e){if(drag&&drag.id===e.pointerId)cancel();});
      handle.addEventListener('lostpointercapture',function(e){if(drag&&drag.id===e.pointerId)cancel();});
      field.addEventListener('keydown',function(e){if(!runnable()||(e.key!=='ArrowLeft'&&e.key!=='ArrowRight'))return;e.preventDefault();model.move(model.x+(e.key==='ArrowLeft'?-14:14));draw();});
    }else {
      function attempt(index,turn){if(!runnable()||turn!==model.turns)return;if(model.tap(index)!==null){paint();sync();}}
      targets.forEach(function(button,index){
        button.addEventListener('pointerdown',function(e){if(!runnable()||model.active<0||!e.isPrimary||e.button!==0||press)return;press={id:e.pointerId,index:index,turn:model.turns};});
        button.addEventListener('pointerup',function(e){
          if(!press||press.id!==e.pointerId)return;var shot=press;press=null;var b=button.getBoundingClientRect();
          if(shot.index===index&&e.clientX>=b.left&&e.clientX<=b.right&&e.clientY>=b.top&&e.clientY<=b.bottom)attempt(index,shot.turn);
        });
        button.addEventListener('pointercancel',function(e){if(press&&press.id===e.pointerId)press=null;});
        button.addEventListener('keydown',function(e){
          if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!e.repeat&&runnable()&&model.active>=0)keyPress={index:index,turn:model.turns};}
          var delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-3,ArrowDown:3}[e.key];
          if(delta!==undefined){e.preventDefault();targets[(index+delta+6)%6].focus();}
        });
        button.addEventListener('keyup',function(e){if(e.key!=='Enter'&&e.key!==' ')return;e.preventDefault();var shot=keyPress;keyPress=null;if(shot&&shot.index===index)attempt(index,shot.turn);});
        button.addEventListener('blur',function(){if(keyPress&&keyPress.index===index)keyPress=null;});
        // Assistive technologies can activate a button without pointer or key events.
        button.addEventListener('click',function(e){if(e.detail===0&&!e.pointerType)attempt(index,model.turns);});
      });
      document.addEventListener('pointerup',function(e){if(press&&press.id===e.pointerId)press=null;});
      document.addEventListener('pointercancel',function(e){if(press&&press.id===e.pointerId)press=null;});
    }
    paint();panel.classList.add('is-ready');
  });
  select(0,false);root.querySelector('[role="tablist"]').hidden=false;root.classList.add('is-ready');
})();
