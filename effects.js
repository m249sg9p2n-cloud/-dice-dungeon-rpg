
(()=> {
  let ctx;
  let muted = localStorage.getItem("ddMuted")==="1";
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const btn=$("#v03sound"), pop=$("#v03pop"), slash=$("#v03slash"), crit=$("#v03crit");
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  function ac(){
    if(!ctx) ctx=new (window.AudioContext||window.webkitAudioContext)();
    if(ctx.state==="suspended") ctx.resume();
    return ctx;
  }
  function gainNode(vol, when=0, dur=.1){
    const c=ac(),g=c.createGain(),t=c.currentTime+when;
    g.gain.setValueAtTime(vol,t);
    g.gain.exponentialRampToValueAtTime(.001,t+dur);
    g.connect(c.destination);
    return {g,t,c};
  }
  function tone(freq,dur=.09,type="sine",vol=.05,delay=0,endFreq=freq){
    if(muted)return;
    const {g,t,c}=gainNode(vol,delay,dur),o=c.createOscillator();
    o.type=type;o.frequency.setValueAtTime(freq,t);
    o.frequency.exponentialRampToValueAtTime(Math.max(30,endFreq),t+dur);
    o.connect(g);o.start(t);o.stop(t+dur);
  }
  function noise(dur=.06,vol=.035,delay=0,highpass=0){
    if(muted)return;
    const c=ac(),len=Math.max(1,Math.floor(c.sampleRate*dur)),b=c.createBuffer(1,len,c.sampleRate),a=b.getChannelData(0);
    for(let i=0;i<len;i++)a[i]=(Math.random()*2-1)*(1-i/len*.25);
    const n=c.createBufferSource(),g=c.createGain(),t=c.currentTime+delay;
    n.buffer=b;
    if(highpass){
      const f=c.createBiquadFilter();f.type="highpass";f.frequency.value=highpass;n.connect(f);f.connect(g);
    } else n.connect(g);
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    g.connect(c.destination);n.start(t);
  }
  function replay(el,cls){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)}
  function rattle(mult=false){
    if(muted)return;
    const steps=mult?10:7;
    for(let i=0;i<steps;i++){
      const delay=i*(mult?.055:.045);
      noise(.032,.025,delay,700);
      tone(150+Math.random()*180,.035,"square",.018,delay,100+Math.random()*120);
    }
    const end=steps*(mult?.055:.045)+.02;
    tone(mult?82:105,.16,"sine",.11,end,mult?55:70);
    noise(.11,mult?.09:.065,end,120);
    tone(mult?260:210,.10,"triangle",.055,end+.025,mult?180:150);
  }
  function slashHit(){
    noise(.055,.045,0,1000);
    tone(680,.055,"sawtooth",.03,0,220);
    noise(.13,.09,.065,80);
    tone(105,.18,"sine",.10,.065,52);
  }
  function enemyHit(){
    tone(85,.16,"square",.07,0,48); noise(.12,.065,0,80);
  }
  function defeat(){
    tone(520,.09,"triangle",.05,0,620);
    tone(660,.11,"triangle",.06,.10,780);
    tone(880,.18,"triangle",.075,.22,1040);
  }
  function reward(){
    tone(620,.08,"triangle",.045,0,760);
    tone(820,.10,"triangle",.055,.09,980);
  }
  function boss(){
    tone(72,.35,"sawtooth",.075,0,48);
    noise(.22,.08,.05,50);
    tone(145,.32,"square",.05,.22,90);
  }
  function criticalSound(){
    tone(72,.24,"sawtooth",.10,0,42);
    noise(.18,.10,.08,80);
    tone(330,.16,"square",.07,.22,660);
    tone(660,.20,"triangle",.08,.39,1320);
    tone(1320,.26,"triangle",.08,.58,1760);
  }
  if(btn){
    btn.textContent=muted?"🔇":"🔊";
    btn.onclick=()=>{muted=!muted;localStorage.setItem("ddMuted",muted?"1":"0");btn.textContent=muted?"🔇":"🔊";if(!muted){ac();tone(520,.08,"triangle",.05,0,650)}};
  }

  document.addEventListener("pointerdown",e=>{
    const d=e.target.closest(".die"); if(!d)return;
    ac(); replay(d,"rolling");
    const dice=$$(".die"), idx=dice.indexOf(d);
    rattle(idx===2);
  },true);

  let lastText="";
  let lastEnemyHP="";
  new MutationObserver(ms=>{
    const all=document.body.innerText||"";
    for(const m of ms){
      const t=(m.target.textContent||"").trim();
      if(!t||t===lastText)continue;
      if(/BOSS/i.test(t) && /BATTLE|KING|ボス/i.test(all)) boss();
      if(/報酬|REWARD|CLEAR/i.test(t)) reward();
      if(/撃破|倒した|DEFEAT|CLEAR/i.test(t)) defeat();
      const dm=t.match(/(\d+)\s*(?:ダメージ|damage)/i)||t.match(/(?:ダメージ|DAMAGE)[^\d]*(\d+)/i);
      if(dm){
        lastText=t;
        if(pop){pop.textContent=dm[1];replay(pop,"show")}
        replay(slash,"show"); slashHit();
      }
    }
    if(/666/.test(all)&&/CRITICAL/i.test(all)&&crit&&!crit.classList.contains("show")){
      replay(crit,"show");criticalSound();
    }
  }).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true});

  document.addEventListener("pointerdown",ac,{once:true,capture:true});
})();
