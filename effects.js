(() => {
  let ctx = null;
  let muted = localStorage.getItem("ddMuted") === "1";
  const soundBtn = document.querySelector("#soundBtn");

  function audio() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function tone(freq, dur=.06, type="sine", vol=.035, delay=0, end=freq) {
    if (muted) return;
    const c=audio(), t=c.currentTime+delay, o=c.createOscillator(), g=c.createGain();
    o.type=type; o.frequency.setValueAtTime(freq,t);
    o.frequency.exponentialRampToValueAtTime(Math.max(30,end),t+dur);
    g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+dur+.01);
  }
  function noise(dur=.04, vol=.02, delay=0, low=160, high=1200) {
    if (muted) return;
    const c=audio(), len=Math.floor(c.sampleRate*dur), b=c.createBuffer(1,len,c.sampleRate), a=b.getChannelData(0);
    for(let i=0;i<len;i++) a[i]=(Math.random()*2-1)*(1-i/len*.5);
    const n=c.createBufferSource(), hp=c.createBiquadFilter(), lp=c.createBiquadFilter(), g=c.createGain(), t=c.currentTime+delay;
    n.buffer=b; hp.type="highpass"; hp.frequency.value=low; lp.type="lowpass"; lp.frequency.value=high;
    g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+dur);
    n.connect(hp); hp.connect(lp); lp.connect(g); g.connect(c.destination); n.start(t);
  }
  function rollDie(mult=false) {
    if (muted) return;
    const hits = mult ? [0,.075,.15,.23,.32,.42,.53,.65,.78] : [0,.07,.145,.225,.315,.42,.54];
    hits.forEach((t,i)=>{
      tone(105+(i%3)*16,.045,"sine",.023,t,78);
      noise(.035,.012,t,120,520);
    });
    const t=hits[hits.length-1]+(mult?.12:.095);
    noise(.06,.03,t,70,330);
    tone(mult?70:82,mult?.20:.15,"sine",mult?.075:.055,t,44);
    tone(mult?145:165,.065,"triangle",.026,t+.01,105);
  }
  function land(mult=false) {
    if (muted) return;
    tone(mult?74:90,.11,"sine",mult?.05:.038,0,48);
    noise(.045,.02,0,70,360);
  }
  function multiplier(v) {
    if(muted) return;
    if(v<=2){ tone(350,.06,"triangle",.025); return; }
    if(v<=4){ tone(480,.07,"triangle",.04); tone(690,.08,"triangle",.035,.06); return; }
    if(v===5){ tone(90,.16,"sine",.05); tone(620,.10,"triangle",.05,.12,900); return; }
    tone(64,.25,"sine",.095,0,36); noise(.16,.07,.05,60,340); tone(420,.12,"square",.04,.2,760); tone(760,.18,"triangle",.065,.32,1320);
  }
  function attack(big=false){ noise(.08,big?.09:.06,0,80,850); tone(big?72:92,.18,"sine",big?.11:.075,0,42); tone(760,.055,"sawtooth",.03,0,230); }
  function enemyAttack(){ noise(.10,.065,0,70,600); tone(82,.16,"square",.055,0,42); }
  function defeat(){ tone(450,.07,"triangle",.04); tone(650,.09,"triangle",.045,.07); tone(920,.16,"triangle",.06,.16,1280); }
  function critical666(){ tone(58,.30,"sawtooth",.09); noise(.20,.08,.06,50,500); tone(390,.13,"square",.05,.23,720); tone(760,.20,"triangle",.075,.37,1500); }
  function reward(){ tone(600,.07,"triangle",.035); tone(830,.10,"triangle",.045,.08,1050); }

  window.FX = { audio, rollDie, land, multiplier, attack, enemyAttack, defeat, critical666, reward };

  if(soundBtn){
    const paint=()=>soundBtn.textContent=muted?"🔇":"🔊"; paint();
    soundBtn.addEventListener("click",()=>{
      muted=!muted; localStorage.setItem("ddMuted", muted?"1":"0"); paint();
      if(!muted){ audio(); tone(520,.08,"triangle",.04,0,700); }
    });
  }
  document.addEventListener("pointerdown",audio,{once:true,capture:true});
})();