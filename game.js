(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const wait = ms => new Promise(r => setTimeout(r, ms));

  const base = { maxHp:75, atk:12, def:4 };
  const enemies = [
    {name:"ゴブリン",art:"👺",hp:48,attacks:[8,10,12],gold:25,lv:1},
    {name:"ゴブリン弓兵",art:"🏹",hp:58,attacks:[8,8,16],gold:35,lv:2},
    {name:"ゴブリン戦士",art:"👹",hp:82,attacks:[12,14,14],gold:45,lv:3},
    {name:"ゴブリン隊長",art:"🪓",hp:105,attacks:[12,16,24],gold:60,lv:4},
    {name:"ゴブリンキング",art:"👑",hp:155,attacks:[12,18,12,35],gold:120,lv:5,boss:true}
  ];

  const pipPositions = {
    1:[5], 2:[1,9], 3:[1,5,9], 4:[1,3,7,9],
    5:[1,3,5,7,9], 6:[1,3,4,6,7,9]
  };

  let bank = Number(localStorage.getItem("diceRpgGold") || 0);
  let state = {};
  let busy = false;

  function show(id){
    $$(".screen").forEach(s => s.classList.toggle("active", s.id === id));
    window.scrollTo(0,0);
  }
  function saveBank(){
    localStorage.setItem("diceRpgGold", String(bank));
    $("#bankGold").textContent = bank;
  }
  function currentEnemy(){ return enemies[state.battle]; }
  function currentAttack(){ const e=currentEnemy(); return e.attacks[state.turn % e.attacks.length]; }
  function calcDamage(){
    const [a,b,c]=state.dice;
    if(!a || !b || !c) return null;
    let dmg=(a+b)*c+state.atk;
    if(a===6 && b===6 && c===6) dmg=Math.round(dmg*1.5);
    return dmg;
  }
  function hpColor(p){
    if(p<=.10) return "#e23b35";
    if(p<=.25) return "#f08b2f";
    if(p<=.50) return "#e8cd45";
    return "#39cf73";
  }

  function drawFace(faceEl, value){
    faceEl.dataset.face=String(value||0);
    faceEl.innerHTML="";
    if(!value) return;
    for(const pos of pipPositions[value]){
      const pip=document.createElement("i");
      pip.className=`pip p${pos}`;
      faceEl.appendChild(pip);
    }
  }

  function renderDice(){
    $$(".die").forEach((d,i)=>{
      drawFace(d.querySelector(".die-face"), state.dice[i]);
      const isNext = state.nextDie===i && !busy;
      d.classList.toggle("locked", !isNext);
      d.classList.toggle("ready", isNext);
      d.disabled = !isNext;
    });
    document.body.classList.toggle("mult-dim", state.nextDie===2 && !busy);
  }

  function renderBattle(){
    const e=currentEnemy();
    $("#battleNo").textContent=`BATTLE ${state.battle+1}/5`;
    $("#runGold").textContent=state.runGold;
    $("#enemyArt").textContent=e.art;
    $("#enemyName").textContent=e.name;
    $("#enemyLv").textContent=`Lv.${e.lv}`;
    $("#nextAttack").textContent=currentAttack();

    const enemyPct=Math.max(0,state.enemyHp/e.hp);
    $("#enemyHpText").textContent=`${Math.max(0,state.enemyHp)} / ${e.hp}`;
    $("#enemyHpFill").style.width=`${enemyPct*100}%`;
    $("#enemyHpFill").style.background=`linear-gradient(90deg,${hpColor(enemyPct)},${hpColor(enemyPct)})`;

    const playerPct=Math.max(0,state.hp/state.maxHp);
    $("#playerHpText").textContent=`${Math.max(0,state.hp)} / ${state.maxHp}`;
    $("#playerHpFill").style.width=`${playerPct*100}%`;

    $("#runAtk").textContent=state.atk;
    $("#runDef").textContent=state.def;

    renderDice();

    const [a,b,c]=state.dice;
    $("#formula").textContent=`( ${a??"?"} + ${b??"?"} ) × ${c??"?"} + ATK ${state.atk}`;

    const dmg=calcDamage();
    const forecast=$("#forecast"), ghost=$("#enemyHpForecast"), hpbar=$(".enemy-hp-bar");
    if(dmg!==null){
      const remain=Math.max(0,state.enemyHp-dmg);
      forecast.textContent = remain===0 ? `⚔ KILL!!  ${dmg} DAMAGE` : `予測 ${dmg} DAMAGE → 残り ${remain} HP`;
      forecast.className = remain===0 ? "forecast kill" : "forecast";
      const curPct=Math.max(0,state.enemyHp/e.hp*100);
      const remPct=Math.max(0,remain/e.hp*100);
      ghost.style.left=`${remPct}%`;
      ghost.style.width=`${Math.max(0,curPct-remPct)}%`;
      hpbar.classList.toggle("kill-preview", remain===0);
      $("#attackBtn").disabled=busy;
      $("#instruction").textContent="ダメージ確定！攻撃！";
    }else{
      forecast.textContent="";
      forecast.className="forecast";
      ghost.style.left="100%"; ghost.style.width="0";
      hpbar.classList.remove("kill-preview");
      $("#attackBtn").disabled=true;
      const labels=["①","②","③ 倍率"];
      $("#instruction").textContent=`${labels[state.nextDie]}のダイスをタップ！`;
    }
    $("#critical").classList.add("hidden");
  }

  function newRun(){
    state={hp:base.maxHp,maxHp:base.maxHp,atk:base.atk,def:base.def,runGold:0,battle:0,turn:0,dice:[null,null,null],nextDie:0,enemyHp:0};
    loadEnemy();
    show("battle");
  }
  function loadEnemy(){
    const e=currentEnemy();
    state.turn=0; state.enemyHp=e.hp; state.dice=[null,null,null]; state.nextDie=0; busy=false;
    $("#enemyArt").classList.remove("dead","hit");
    renderBattle();
  }

  async function rollDie(index, btn){
    if(busy || index!==state.nextDie) return;
    busy=true; renderBattle();
    const mult=index===2, duration=mult?920:660;
    btn.classList.remove("land"); void btn.offsetWidth; btn.classList.add("rolling");
    FX.rollDie(mult);

    const face=btn.querySelector(".die-face");
    const start=performance.now();
    while(performance.now()-start < duration-90){
      drawFace(face,1+Math.floor(Math.random()*6));
      await wait(58 + Math.floor((performance.now()-start)/8));
    }
    const value=1+Math.floor(Math.random()*6);
    state.dice[index]=value;
    state.nextDie++;
    btn.classList.remove("rolling");
    btn.classList.add("land"); FX.land(mult);
    setTimeout(()=>btn.classList.remove("land"),220);

    busy=false; renderBattle();

    if(mult){
      const multFx=$("#multFx");
      multFx.textContent=`×${value}`;
      multFx.className=`show-mult${value===6?" x6":""}`;
      FX.multiplier(value);
      document.body.classList.add(value>=5?"big-shake":"shake");
      setTimeout(()=>{ multFx.className=""; document.body.classList.remove("shake","big-shake"); },560);

      if(state.dice.every(v=>v===6)){
        await wait(220);
        $("#critical").classList.remove("hidden");
        FX.critical666();
        await wait(760);
        $("#critical").classList.add("hidden");
      }
    }
  }

  async function attack(){
    const dmg=calcDamage();
    if(busy || dmg===null) return;
    busy=true; renderBattle();

    const e=currentEnemy();
    const before=state.enemyHp;
    const after=Math.max(0,before-dmg);
    $("#damageFx").textContent=dmg;
    $("#damageFx").className="show-damage";
    $("#slashFx").className="show-slash";
    document.body.classList.add(dmg>=45?"big-shake":"shake");
    FX.attack(dmg>=45);

    const art=$("#enemyArt");
    art.classList.remove("hit"); void art.offsetWidth; art.classList.add("hit");
    state.enemyHp=after;
    renderBattle();

    await wait(520);
    $("#damageFx").className=""; $("#slashFx").className="";
    document.body.classList.remove("shake","big-shake");

    if(state.enemyHp<=0){
      $("#killFx").className="show-kill";
      art.classList.add("dead");
      FX.defeat();
      await wait(900);
      $("#killFx").className="";
      await winBattle();
      busy=false;
      return;
    }

    await wait(180);
    const incoming=Math.max(1,currentAttack()-state.def);
    state.hp-=incoming;
    FX.enemyAttack();
    document.body.classList.add("shake");
    await wait(260);
    document.body.classList.remove("shake");
    state.turn++;

    if(state.hp<=0){
      bank+=state.runGold; saveBank();
      $("#deathGold").textContent=`${state.runGold}G`;
      show("gameover");
      busy=false;
      return;
    }

    state.dice=[null,null,null]; state.nextDie=0; busy=false; renderBattle();
  }

  async function winBattle(){
    const e=currentEnemy();
    state.runGold += e.gold;
    if(e.boss){
      showBossBoxes();
    }else{
      FX.reward();
      show("reward");
    }
  }

  function chooseReward(kind){
    if(kind==="heal") state.hp=Math.min(state.maxHp, state.hp+Math.ceil(state.maxHp*.3));
    if(kind==="gold") state.runGold+=40;
    if(kind==="atk") state.atk+=3;
    state.battle++; loadEnemy(); show("battle");
  }

  function showBossBoxes(){
    show("bossReward");
    $("#bossResult").innerHTML="";
    $$(".box").forEach(b=>{b.disabled=false;b.classList.remove("opened");b.innerHTML="🎁<span>BOX</span>";});
  }
  function chooseBox(btn){
    const mult=[1,2,3][Math.floor(Math.random()*3)];
    btn.classList.add("opened");
    btn.innerHTML=`×${mult}<span>BONUS</span>`;
    $$(".box").forEach(b=>b.disabled=true);
    const total=state.runGold*mult;
    bank+=total; saveBank();
    $("#bossResult").innerHTML=`獲得 ${state.runGold}G × ${mult}<br><strong>${total}G</strong><br><button id="bossHome" class="primary" style="margin-top:22px;padding:15px 34px">ホームへ</button>`;
    $("#bossHome").addEventListener("click",()=>show("home"));
  }

  $("#startBtn").addEventListener("click",newRun);
  $$(".die").forEach((b,i)=>b.addEventListener("click",()=>rollDie(i,b)));
  $("#attackBtn").addEventListener("click",attack);
  $$(".reward").forEach(b=>b.addEventListener("click",()=>chooseReward(b.dataset.reward)));
  $$(".box").forEach(b=>b.addEventListener("click",()=>chooseBox(b)));
  $("#deathHome").addEventListener("click",()=>show("home"));

  $("#homeHp").textContent=base.maxHp;
  $("#homeAtk").textContent=base.atk;
  $("#homeDef").textContent=base.def;
  saveBank();
})();