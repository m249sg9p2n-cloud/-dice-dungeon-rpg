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
    const hits = mult ? [0,.06,.12,.19,.27,.36,.47,.58] : [0,.055,.115,.18,.255,.34,.43];
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
  function hitBus(){
    const c=audio(), comp=c.createDynamicsCompressor(), master=c.createGain();
    comp.threshold.value=-12; comp.knee.value=16; comp.ratio.value=5; comp.attack.value=.003; comp.release.value=.18;
    master.gain.value=.9;
    master.connect(comp); comp.connect(c.destination);
    return {c,master};
  }
  function oscTo(bus, type, f0, f1, dur, vol, delay=0){
    if(muted) return;
    const {c,master}=bus, t=c.currentTime+delay, o=c.createOscillator(), g=c.createGain();
    o.type=type; o.frequency.setValueAtTime(Math.max(25,f0),t);
    o.frequency.exponentialRampToValueAtTime(Math.max(25,f1),t+dur);
    g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+.006);
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t+dur+.02);
  }
  function noiseTo(bus, dur, vol, delay=0, low=70, high=1800){
    if(muted) return;
    const {c,master}=bus, len=Math.max(1,Math.floor(c.sampleRate*dur)), b=c.createBuffer(1,len,c.sampleRate), a=b.getChannelData(0);
    for(let i=0;i<len;i++){ const x=1-i/len; a[i]=(Math.random()*2-1)*x*x; }
    const n=c.createBufferSource(), hp=c.createBiquadFilter(), lp=c.createBiquadFilter(), g=c.createGain(), t=c.currentTime+delay;
    n.buffer=b; hp.type="highpass"; hp.frequency.value=low; lp.type="lowpass"; lp.frequency.value=high;
    g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    n.connect(hp); hp.connect(lp); lp.connect(g); g.connect(master); n.start(t);
  }
  function attackCharge(dmg=0){
    if(muted) return;
    const b=hitBus(), strong=dmg>=55, critical=dmg>=90;
    // restrained rising tension; the reward is saved for the hit
    oscTo(b,"sine",72,strong?128:112,.18,.07,0);
    oscTo(b,"triangle",190,critical?520:strong?410:330,.21,.035,.015);
    noiseTo(b,.19,.025,0,280,1500);
  }
  function playerImpact(dmg=0, lethal=false){
    if(muted) return;
    const b=hitBus(), strong=dmg>=55, critical=dmg>=90;
    // 1. sub-bass body
    oscTo(b,"sine",critical?118:strong?108:98,34,critical?.48:strong?.40:.33,critical?.34:strong?.28:.23,0);
    // 2. punch in the chest
    oscTo(b,"triangle",critical?245:210,58,.16,critical?.22:strong?.18:.14,0);
    // 3. sharp transient / metal crack
    noiseTo(b,.105,critical?.18:strong?.15:.11,0,420,critical?3600:2800);
    oscTo(b,"square",critical?1680:strong?1420:1180,620,.075,critical?.045:.035,.008);
    // 4. a second low "DON" makes big hits feel expensive
    if(strong){
      oscTo(b,"sine",78,38,.30,critical?.20:.14,.075);
      noiseTo(b,.085,critical?.10:.075,.065,110,880);
    }
    // 5. jackpot-like reward tail, musical rather than a beep
    if(strong){
      const chord=critical?[392,523.25,659.25,783.99]:[329.63,440,523.25];
      chord.forEach((f,i)=>oscTo(b,"sine",f,f*.985,critical?.42:.30,critical?.055:.043,.105+i*.026));
      oscTo(b,"triangle",critical?660:520,critical?1320:920,.24,critical?.045:.032,.16);
    }
    if(lethal){
      // finish accent: heavy low stop + short ascending resolution
      oscTo(b,"sine",62,30,.52,.24,.16);
      [523.25,659.25,783.99,1046.5].forEach((f,i)=>oscTo(b,"triangle",f,f*1.01,.19,.035,.20+i*.055));
    }
  }
  function attackFanfare(dmg=0, lethal=false){
    if(muted) return;
    const b=hitBus(), critical=dmg>=90, strong=dmg>=55;
    // "期待 -> 解放 -> ご褒美" as a short musical phrase, not a single beep.
    const base=critical?392:strong?329.63:293.66;
    [1,1.25,1.5].forEach((m,i)=>oscTo(b,"triangle",base*m,base*m*1.02,.15,.032,.02+i*.045));
    if(strong){
      [523.25,659.25,783.99].forEach((f,i)=>oscTo(b,"sine",f,f,.28,.042,.18+i*.045));
      oscTo(b,"sine",88,38,.38,.16,.12);
    }
    if(critical || lethal){
      [659.25,783.99,1046.5,1318.5].forEach((f,i)=>oscTo(b,"triangle",f,f*1.01,.24,.04,.28+i*.055));
      noiseTo(b,.12,.07,.27,650,4200);
    }
  }
  function chestRattle(){
    if(muted) return;
    noise(.055,.045,0,500,2200); tone(180,.06,"square",.025,0,130);
    noise(.045,.035,.075,620,2500); tone(160,.05,"square",.022,.075,120);
  }
  function puchun(){
    if(muted) return;
    const c=audio(), t=c.currentTime;

    // Tiny contact snap.
    tone(155,.032,"square",.055,0,74);

    // Electrical tear.
    noise(.036,.052,.010,850,5200);

    // CRT whine falls brutally into the floor.
    const o=c.createOscillator(), g=c.createGain();
    o.type="sawtooth";
    o.frequency.setValueAtTime(510,t+.018);
    o.frequency.exponentialRampToValueAtTime(44,t+.135);
    g.gain.setValueAtTime(.0001,t+.018);
    g.gain.exponentialRampToValueAtTime(.060,t+.026);
    g.gain.exponentialRampToValueAtTime(.0001,t+.145);
    o.connect(g); g.connect(c.destination);
    o.start(t+.018); o.stop(t+.15);

    // Low "power gone" body. No musical tail.
    tone(72,.115,"sine",.105,.075,30);
  }
  function gradeUp(){
    if(muted) return;
    [392,523.25,659.25,783.99].forEach((f,i)=>tone(f,.17,"triangle",.032,.03+i*.045,f*1.01));
    tone(92,.24,"sine",.07,.02,46);
  }
  function chestOpen(rarity="NORMAL"){
    if(muted) return;
    noise(.10,.06,0,420,3200);
    tone(120,.18,"sine",.08,0,52);
    const high=rarity==="GOD"||rarity==="LEGENDARY";
    [523.25,659.25,783.99].forEach((f,i)=>tone(f*(high?1.25:1),.22,"triangle",.03,.07+i*.045,f));
  }
  function killStinger(){
    if(muted) return;
    const b=hitBus();
    noiseTo(b,.17,.12,0,120,1700);
    oscTo(b,"sine",76,31,.48,.24,0);
    [392,523.25,659.25,783.99].forEach((f,i)=>oscTo(b,"triangle",f,f,.22,.04,.10+i*.06));
  }
  function attack(big=false){ noise(.06,big?.055:.04,0,100,760); tone(big?78:94,.13,"sine",big?.065:.045,0,46); }
  function enemyAttack(){ noise(.10,.065,0,70,600); tone(82,.16,"square",.055,0,42); }
  function defeat(){ tone(450,.07,"triangle",.04); tone(650,.09,"triangle",.045,.07); tone(920,.16,"triangle",.06,.16,1280); }
  function critical666(){ tone(58,.30,"sawtooth",.09); noise(.20,.08,.06,50,500); tone(390,.13,"square",.05,.23,720); tone(760,.20,"triangle",.075,.37,1500); }
  function reward(){ tone(600,.07,"triangle",.035); tone(830,.10,"triangle",.045,.08,1050); }

  window.FX = { audio, rollDie, land, multiplier, attack, attackCharge, attackFanfare, playerImpact, chestRattle, puchun, gradeUp, chestOpen, killStinger, enemyAttack, defeat, critical666, reward };

  if(soundBtn){
    const paint=()=>soundBtn.textContent=muted?"🔇":"🔊"; paint();
    soundBtn.addEventListener("click",()=>{
      muted=!muted; localStorage.setItem("ddMuted", muted?"1":"0"); paint();
      if(!muted){ audio(); tone(520,.08,"triangle",.04,0,700); }
    });
  }
  document.addEventListener("pointerdown",audio,{once:true,capture:true});
})();