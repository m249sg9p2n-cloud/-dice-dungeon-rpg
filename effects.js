
(()=> {
  let ctx;
  let muted = localStorage.getItem("ddMuted")==="1";
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const btn=$("#v03sound"), pop=$("#v03pop"), slash=$("#v03slash"), crit=$("#v03crit");

  function ac(){
    if(!ctx) ctx=new (window.AudioContext||window.webkitAudioContext)();
    if(ctx.state==="suspended") ctx.resume();
    return ctx;
  }
  function tone(freq,dur=.08,type="sine",vol=.05,delay=0,end=freq){
    if(muted) return;
    const c=ac(),t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,t);
    o.frequency.exponentialRampToValueAtTime(Math.max(30,end),t+dur);
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+dur);
  }
  function noise(dur=.05,vol=.03,delay=0,hp=700){
    if(muted) return;
    const c=ac(),len=Math.floor(c.sampleRate*dur),b=c.createBuffer(1,len,c.sampleRate),a=b.getChannelData(0);
    for(let i=0;i<len;i++) a[i]=(Math.random()*2-1)*(1-i/len*.2);
    const n=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),t=c.currentTime+delay;
    n.buffer=b;f.type="highpass";f.frequency.value=hp;
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    n.connect(f);f.connect(g);g.connect(c.destination);n.start(t);
  }
  function replay(el,cls){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)}

  function diceRattle(mult=false){
    if(muted)return;
    // "カラカラカラ..." — little hard clicks, slightly slowing down.
    const gaps = mult ? [0,.045,.093,.145,.202,.264,.333,.410,.500,.605] : [0,.045,.095,.151,.214,.286,.370];
    gaps.forEach((t,i)=>{
      noise(.024, .032, t, 950);
      tone(210 + (i%3)*55, .028, "square", .018, t, 120);
    });
    // "デン!" — low body + impact
    const t = gaps[gaps.length-1] + (mult?.095:.08);
    noise(.09, mult?.11:.085, t, 80);
    tone(mult?72:92, mult?.22:.18, "sine", mult?.14:.11, t, 42);
    tone(mult?185:220, .10, "triangle", .055, t+.015, mult?115:145);
  }
  function playerAttack(){
    noise(.045,.05,0,1200);
    tone(840,.055,"sawtooth",.035,0,240);
    noise(.12,.11,.055,80);
    tone(98,.17,"sine",.12,.055,48);
  }
  function enemyAttack(){
    noise(.11,.09,0,80);
    tone(82,.18,"square",.08,0,43);
  }
  function enemyDefeat(){
    tone(420,.08,"triangle",.05,0,550);
    tone(600,.10,"triangle",.06,.08,760);
    tone(880,.18,"triangle",.075,.18,1150);
  }
  function rewardSound(){
    tone(620,.07,"triangle",.045,0,760);
    tone(820,.09,"triangle",.055,.08,980);
  }
  function criticalSound(){
    tone(66,.25,"sawtooth",.12,0,38);
    noise(.18,.12,.08,80);
    tone(360,.15,"square",.07,.22,720);
    tone(720,.20,"triangle",.09,.38,1440);
  }

  if(btn){
    btn.textContent=muted?"🔇":"🔊";
    btn.onclick=()=>{
      muted=!muted;
      localStorage.setItem("ddMuted",muted?"1":"0");
      btn.textContent=muted?"🔇":"🔊";
      if(!muted){ac();tone(520,.08,"triangle",.05,0,680)}
    };
  }

  document.addEventListener("pointerdown",e=>{
    const d=e.target.closest(".die");
    if(!d || d.classList.contains("locked")) return;
    ac(); replay(d,"rolling");
    const idx=$$(".die").indexOf(d);
    diceRattle(idx===2);
  },true);

  // Watch state changes to trigger attack/defeat/reward sounds.
  let prevEnemyHp=null, prevPlayerHp=null, prevScreen="";
  const readNum = id => {
    const el=$(id); if(!el)return null;
    const m=el.textContent.match(/\d+/); return m?Number(m[0]):null;
  };
  const scan=()=>{
    const enemyHp=readNum("#enemyHpText");
    const playerHp=readNum("#playerHpText");
    const active=document.querySelector(".screen.active")?.id||"";

    if(prevEnemyHp!==null && enemyHp!==null && enemyHp<prevEnemyHp){
      if(pop){pop.textContent=String(prevEnemyHp-enemyHp);replay(pop,"show")}
      replay(slash,"show");playerAttack();
    }
    if(prevPlayerHp!==null && playerHp!==null && playerHp<prevPlayerHp) enemyAttack();
    if(active!==prevScreen){
      if(active==="reward") { enemyDefeat(); setTimeout(rewardSound,180); }
      if(active==="bossReward") enemyDefeat();
    }
    prevEnemyHp=enemyHp;prevPlayerHp=playerHp;prevScreen=active;

    const cr=$("#critical");
    if(cr && !cr.classList.contains("hidden") && crit && !crit.classList.contains("show")){
      replay(crit,"show");criticalSound();
    }
  };
  new MutationObserver(scan).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true});
  scan();

  document.addEventListener("pointerdown",ac,{once:true,capture:true});
})();
