(() => {
  "use strict";
  const $ = (s, parent=document) => parent.querySelector(s);
  const $$ = (s, parent=document) => [...parent.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intro = $('#intro'), main = $('#main'), topbar = $('#topbar');
  const openGift = $('#open-gift');
  let unlocked = false, soundOn = false, audioCtx, lastSpark = 0;
  function tone(freq=660, length=.13, delay=0) {
    if (!soundOn) return;
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
      osc.type='sine'; osc.frequency.setValueAtTime(freq,audioCtx.currentTime+delay);
      gain.gain.setValueAtTime(.0001,audioCtx.currentTime+delay);
      gain.gain.exponentialRampToValueAtTime(.045,audioCtx.currentTime+delay+.015);
      gain.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+delay+length);
      osc.connect(gain);gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime+delay);osc.stop(audioCtx.currentTime+delay+length+.03);
    } catch(e) {}
  }
  function chime() {tone(523,.22);tone(659,.22,.11);tone(784,.35,.22)}
  function petalBurst(n=24) {
    if(reduce)return;
    const layer=$('#petals');
    const chars=['♡','♥','✦','✿','❀'];
    for(let i=0;i<n;i++){
      const e=document.createElement('span');e.className='petal';e.textContent=chars[Math.floor(Math.random()*chars.length)];
      e.style.left=Math.random()*100+'vw';
      e.style.fontSize=(12+Math.random()*24)+'px';
      e.style.color=['#d87598','#e5a1b4','#f1b7a7','#b986bd'][Math.floor(Math.random()*4)];
      e.style.setProperty('--drift',(Math.random()*240-120)+'px');
      e.style.animationDuration=(3.4+Math.random()*3)+'s';
      e.style.animationDelay=(Math.random()*.6)+'s';
      layer.append(e);setTimeout(()=>e.remove(),7600);
    }
  }
  function unlock(){
    if(unlocked)return;unlocked=true;
    $('#envelope').classList.add('opening');chime();
    setTimeout(()=>{
      intro.classList.add('dismissed');main.inert=false;topbar.classList.add('visible');
      document.body.style.overflow='';petalBurst(35);
      setTimeout(()=>{intro.setAttribute('aria-hidden','true');$('#home').setAttribute('tabindex','-1');$('#home').focus({preventScroll:true})},850);
    },reduce?100:650);
  }
  document.body.style.overflow='hidden';
  openGift.addEventListener('click',unlock);
  $('#sound-toggle').addEventListener('click',()=>{
    soundOn=!soundOn;const b=$('#sound-toggle');
    b.setAttribute('aria-pressed',String(soundOn));
    b.setAttribute('aria-label',soundOn?'Turn soft sounds off':'Turn soft sounds on');
    $('span',b).textContent=soundOn?'sound on':'sound off';
    if(soundOn)chime();
  });
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');io.unobserve(entry.target)}});
  },{threshold:.08,rootMargin:'0px 0px -25px 0px'}) : null;
  $$('.reveal').forEach((el,i)=>{if(io)io.observe(el);else el.classList.add('in-view')});
  let opened=0;
  $$('.reason-card').forEach(card=>{
    card.addEventListener('click',()=>{
      if(card.classList.contains('open'))return;
      card.classList.add('open');card.setAttribute('aria-expanded','true');
      opened++;$('#reasons-progress').textContent=`${opened} of 6 love notes opened ♡`;
      tone(660,.16);tone(880,.2,.09);
      if(opened===6){$('#reasons-progress').textContent='You found every little piece of my heart ♡';petalBurst(24)}
    });
  });
  const cards=$$('.gallery-card'),lightbox=$('#lightbox'),lightImg=$('#lightbox-img'),lightCaption=$('#lightbox-caption');
  let selected=0,lastFocus=null;
  function showPhoto(i){
    selected=(i+cards.length)%cards.length;
    lightImg.src=cards[selected].dataset.full;
    lightImg.alt=$('img',cards[selected]).alt;
    lightCaption.textContent=cards[selected].dataset.caption;
  }
  function openPhoto(i){
    lastFocus=document.activeElement;showPhoto(i);
    lightbox.classList.add('active');lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';$('#lightbox-close').focus();tone(700,.14);
  }
  function closePhoto(){
    lightbox.classList.remove('active');lightbox.setAttribute('aria-hidden','true');
    document.body.style.overflow='';if(lastFocus)lastFocus.focus();
  }
  cards.forEach((card,i)=>card.addEventListener('click',()=>openPhoto(i)));
  $('#lightbox-close').addEventListener('click',closePhoto);
  $('#lightbox-prev').addEventListener('click',()=>showPhoto(selected-1));
  $('#lightbox-next').addEventListener('click',()=>showPhoto(selected+1));
  lightbox.addEventListener('click',e=>{if(e.target===lightbox)closePhoto()});
  document.addEventListener('keydown',e=>{
    if(!lightbox.classList.contains('active'))return;
    if(e.key==='Escape')closePhoto();
    if(e.key==='ArrowRight')showPhoto(selected+1);
    if(e.key==='ArrowLeft')showPhoto(selected-1);
    if(e.key==='Tab'){
      const buttons=$$('button',lightbox);
      const idx=buttons.indexOf(document.activeElement);
      if(e.shiftKey&&idx===0){e.preventDefault();buttons[buttons.length-1].focus()}
      else if(!e.shiftKey&&idx===buttons.length-1){e.preventDefault();buttons[0].focus()}
    }
  });
  $('#final-surprise').addEventListener('click',()=>{
    $('#final-message').classList.add('visible');
    $('#final-surprise').textContent='Forever my favorite ♡';
    chime();petalBurst(65);
    $('#final-message').scrollIntoView({behavior:reduce?'instant':'smooth',block:'nearest'});
  });
  if(!reduce){
    document.addEventListener('pointermove',e=>{
      if(e.pointerType==='touch'||!unlocked||Date.now()-lastSpark<95)return;
      lastSpark=Date.now();
      if(Math.random()>.55)return;
      const s=document.createElement('span');s.className='spark';s.textContent=Math.random()>.5?'✧':'♡';
      s.style.left=e.clientX+'px';s.style.top=e.clientY+'px';s.style.fontSize=(12+Math.random()*9)+'px';
      $('#cursor-sparkles').append(s);setTimeout(()=>s.remove(),900);
    },{passive:true});
  }
})();