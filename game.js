(() => {
  "use strict";

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const wait = ms => new Promise(r => setTimeout(r, ms));

  const SAVE_KEY = "diceRpgSaveV1";
  const LEGACY_GOLD_KEY = "diceRpgGold";

  const BASE_STATS = { maxHp:75, atk:12, def:4 };

  const UPGRADES = {
    hp:{baseCost:100, growth:1.35, maxLv:20, perLv:5},
    atk:{baseCost:120, growth:1.40, maxLv:20, perLv:1},
    def:{baseCost:150, growth:1.45, maxLv:15, perLv:1}
  };

  const EQUIPMENT = {
    weapon:{
      training_sword:{id:"training_sword",name:"訓練用の剣",rarity:"NORMAL",atk:0,def:0,desc:"冒険者が最初に持つ剣。"},
      iron_sword:{id:"iron_sword",name:"鉄の剣",rarity:"NORMAL",atk:3,def:0,desc:"扱いやすい鉄製の剣。"},
      bronze_axe:{id:"bronze_axe",name:"青銅の斧",rarity:"NORMAL",atk:4,def:0,desc:"重さを活かした素朴な斧。"},
      soldier_spear:{id:"soldier_spear",name:"兵士の槍",rarity:"NORMAL",atk:4,def:0,desc:"標準的な長槍。"},
      heavy_blade:{id:"heavy_blade",name:"重鉄の大剣",rarity:"NORMAL",atk:5,def:0,desc:"振りは遅いが威力は高い。"},

      hunter_blade:{id:"hunter_blade",name:"狩人の刃",rarity:"RARE",atk:6,def:0,desc:"軽く鋭い実戦向けの刃。"},
      knight_sword:{id:"knight_sword",name:"騎士の剣",rarity:"RARE",atk:7,def:0,desc:"騎士団で使われる上質な剣。"},
      berserk_axe:{id:"berserk_axe",name:"狂戦士の斧",rarity:"RARE",atk:8,def:0,desc:"攻撃に特化した巨大斧。"},
      moon_spear:{id:"moon_spear",name:"月影の槍",rarity:"RARE",atk:9,def:0,desc:"淡い光を宿す細身の槍。"},

      flame_dragon:{id:"flame_dragon",name:"炎竜剣",rarity:"EPIC",atk:11,def:0,skill:"龍炎",desc:"③が6ならダイス部分をもう一度加算。"},
      triple_star:{id:"triple_star",name:"三連星",rarity:"EPIC",atk:10,def:0,skill:"TRIPLE",desc:"111〜555のゾロ目で最終ダメージ×2.5。"},
      adversity_blade:{id:"adversity_blade",name:"逆境の魔剣",rarity:"EPIC",atk:12,def:0,skill:"反転",desc:"③が1なら6として扱う。"},

      fate_eater:{id:"fate_eater",name:"運命喰らい",rarity:"LEGENDARY",atk:15,def:0,skill:"DOUBLE",desc:"①=②なら③を2回振り高い方を採用、最終×1.5。"},
      heavenly_greatsword:{id:"heavenly_greatsword",name:"天命の大剣",rarity:"LEGENDARY",atk:17,def:0,skill:"HIGH ROLL",desc:"全ダイス4以上で最終×2。"},

      divine_dice_sword:{id:"divine_dice_sword",name:"神骰剣・天命",rarity:"GOD",atk:22,def:0,skill:"DIVINE STRAIGHT",desc:"123/234/345/456で最終ダメージ×3。"}
    },
    armor:{
      traveler_clothes:{id:"traveler_clothes",name:"旅人の服",rarity:"NORMAL",atk:0,def:0,desc:"冒険者の基本装備。"},
      leather_armor:{id:"leather_armor",name:"革の鎧",rarity:"NORMAL",atk:0,def:2,desc:"軽量な革製防具。"},
      iron_mail:{id:"iron_mail",name:"鉄の鎧",rarity:"NORMAL",atk:0,def:3,desc:"頑丈な鉄製防具。"},
      soldier_mail:{id:"soldier_mail",name:"兵士の鎧",rarity:"NORMAL",atk:0,def:3,desc:"兵士向けの標準防具。"},
      tower_armor:{id:"tower_armor",name:"重装甲",rarity:"NORMAL",atk:0,def:4,desc:"重いが防御力に優れる。"},

      guard_mail:{id:"guard_mail",name:"守備隊の鎧",rarity:"RARE",atk:0,def:5,desc:"守備隊で使われる堅牢な鎧。"},
      silver_mail:{id:"silver_mail",name:"白銀の鎧",rarity:"RARE",atk:0,def:6,desc:"白銀に輝く上質な防具。"},
      thorn_armor:{id:"thorn_armor",name:"荊棘の鎧",rarity:"RARE",atk:0,def:7,desc:"鋭い棘で覆われた鎧。"},
      magic_coat:{id:"magic_coat",name:"魔導外套",rarity:"RARE",atk:0,def:8,desc:"魔力を編み込んだ外套。"},

      indomitable:{id:"indomitable",name:"不屈の鎧",rarity:"EPIC",atk:0,def:10,skill:"不屈",desc:"致死ダメージをHP1で耐える。1戦1回。"},
      purification:{id:"purification",name:"浄化の聖衣",rarity:"EPIC",atk:0,def:9,skill:"浄化",desc:"最初のデバフを無効化しHPを回復。"},
      gambler_cloak:{id:"gambler_cloak",name:"賭博師の外套",rarity:"EPIC",atk:0,def:9,skill:"LUCKY SIX",desc:"③が6なら最大HPの15%回復。"},

      fate_armor:{id:"fate_armor",name:"運命の鎧",rarity:"LEGENDARY",atk:0,def:13,skill:"運命改変",desc:"敵に固定されたダイスを6へ変える。"},
      phoenix_armor:{id:"phoenix_armor",name:"不死鳥の鎧",rarity:"LEGENDARY",atk:0,def:14,skill:"REBIRTH",desc:"1ランに1度、HP50%で復活。"},

      aegis:{id:"aegis",name:"神護・アイギス",rarity:"GOD",atk:0,def:18,skill:"AEGIS",desc:"致死攻撃を無効化し、次の③を6にする。"}
    }
  };

  const DUNGEONS = {
    "1-1": {
      id:"1-1",
      name:"ゴブリンの森",
      enemies:[
        {name:"ゴブリン", image:"enemy_01_goblin.png", hp:48, attacks:[8,10,12], gold:25, lv:1},
        {name:"ゴブリン弓兵", image:"enemy_02_goblin_archer.png", hp:58, attacks:[8,8,16], gold:35, lv:2},
        {name:"ゴブリン戦士", image:"enemy_03_goblin_warrior.png", hp:82, attacks:[12,14,14], gold:45, lv:3},
        {name:"ゴブリン隊長", image:"enemy_04_goblin_captain.png", hp:105, attacks:[12,16,24], gold:60, lv:4},
        {name:"ゴブリンキング", image:"enemy_05_goblin_king.png", hp:155, attacks:[12,18,12,35], gold:120, lv:5, boss:true}
      ]
    }
  };

  const pipPositions = {
    1:[5], 2:[1,9], 3:[1,5,9], 4:[1,3,7,9],
    5:[1,3,5,7,9], 6:[1,3,4,6,7,9]
  };

  function defaultSave(){
    const legacyGold = Number(localStorage.getItem(LEGACY_GOLD_KEY) || 0);
    return {
      version:1,
      gold:Number.isFinite(legacyGold) ? legacyGold : 0,
      base:{...BASE_STATS},
      upgrades:{hp:0,atk:0,def:0},
      inventory:{
        weapon:["training_sword"],
        armor:["traveler_clothes"]
      },
      duplicates:{},
      equipped:{weapon:"training_sword",armor:"traveler_clothes"},
      clears:{"1-1":0},
      records:{"1-1":{bestRunGold:0}},
      unlocked:["1-1"]
    };
  }

  function loadSave(){
    try{
      const raw=localStorage.getItem(SAVE_KEY);
      if(!raw) return defaultSave();
      const parsed=JSON.parse(raw);
      return {
        ...defaultSave(),
        ...parsed,
        base:{...BASE_STATS,...(parsed.base||{})},
        upgrades:{hp:0,atk:0,def:0,...(parsed.upgrades||{})},
        inventory:{
          weapon:["training_sword"],
          armor:["traveler_clothes"],
          ...(parsed.inventory||{})
        },
        duplicates:{...(parsed.duplicates||{})},
        equipped:{weapon:"training_sword",armor:"traveler_clothes",...(parsed.equipped||{})},
        clears:{"1-1":0,...(parsed.clears||{})},
        records:{"1-1":{bestRunGold:0},...(parsed.records||{})},
        unlocked:Array.isArray(parsed.unlocked) ? parsed.unlocked : ["1-1"]
      };
    }catch{
      return defaultSave();
    }
  }

  let save = loadSave();
  let selectedDungeonId = "1-1";
  let state = null;
  let busy = false;
  let lastClear = null;

  function persist(){
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    localStorage.setItem(LEGACY_GOLD_KEY, String(save.gold));
  }

  function show(id){
    $$(".screen").forEach(s => s.classList.toggle("active", s.id===id));
    window.scrollTo(0,0);
  }

  const GACHA = {
    normal:{cost:300, rates:[["NORMAL",55],["RARE",28],["EPIC",12],["LEGENDARY",4],["GOD",1]]},
    rare:{cost:900, rates:[["RARE",70],["EPIC",22],["LEGENDARY",7],["GOD",1]]},
    epic:{cost:2500, rates:[["EPIC",78],["LEGENDARY",19],["GOD",3]]}
  };

  function allEquipment(){
    return [
      ...Object.values(EQUIPMENT.weapon).map(item=>({slot:"weapon",item})),
      ...Object.values(EQUIPMENT.armor).map(item=>({slot:"armor",item}))
    ];
  }

  function rollRarity(rates){
    const n=Math.random()*100;
    let acc=0;
    for(const [rarity,rate] of rates){
      acc+=rate;
      if(n<acc) return rarity;
    }
    return rates[rates.length-1][0];
  }

  function openGacha(){
    $("#gachaGold").textContent=save.gold;
    $("#gachaResult").classList.add("hidden");
    $("#gachaResult").innerHTML="";
    show("gacha");
  }

  function pullGacha(tier){
    const cfg=GACHA[tier];
    if(!cfg || save.gold<cfg.cost){
      const btn=document.querySelector(`.gacha-pull[data-tier="${tier}"]`);
      btn?.classList.add("cant-buy");
      setTimeout(()=>btn?.classList.remove("cant-buy"),420);
      return;
    }

    save.gold-=cfg.cost;
    const rarity=rollRarity(cfg.rates);
    const pool=allEquipment().filter(x=>x.item.rarity===rarity);
    const result=pool[Math.floor(Math.random()*pool.length)];
    const owned=save.inventory[result.slot] || (save.inventory[result.slot]=[]);
    const isDuplicate=owned.includes(result.item.id);

    if(!isDuplicate){
      owned.push(result.item.id);
      save.duplicates[result.item.id]=1;
    }else{
      save.duplicates[result.item.id]=(save.duplicates[result.item.id]||1)+1;
    }

    persist();
    $("#gachaGold").textContent=save.gold;
    renderHome();

    const el=$("#gachaResult");
    const stat=result.slot==="weapon" ? `ATK +${result.item.atk}` : `DEF +${result.item.def}`;
    const count=save.duplicates[result.item.id]||1;
    el.className=`gacha-result ${rarityClass(rarity)}`;
    el.innerHTML=`
      <div class="result-rarity">${rarity}</div>
      <div class="result-icon">${result.slot==="weapon"?"⚔️":"🛡️"}</div>
      <h2>${result.item.name}</h2>
      <b>${stat}</b>
      ${result.item.skill?`<strong>《${result.item.skill}》</strong>`:""}
      <small>${isDuplicate?`DUPLICATE ×${count}`:"NEW!"}</small>
    `;
  }

  function equippedItem(slot){
    const id=save.equipped?.[slot];
    return EQUIPMENT[slot]?.[id] || Object.values(EQUIPMENT[slot])[0];
  }

  function totalStats(){
    const weapon=equippedItem("weapon");
    const armor=equippedItem("armor");
    return {
      maxHp:save.base.maxHp,
      atk:save.base.atk + (weapon?.atk||0) + (armor?.atk||0),
      def:save.base.def + (weapon?.def||0) + (armor?.def||0)
    };
  }

  function rarityClass(rarity){
    return `rarity-${String(rarity||"NORMAL").toLowerCase()}`;
  }

  function openEquipment(slot){
    const title=slot==="weapon" ? "武器を選択" : "防具を選択";
    $("#equipmentTitle").textContent=title;
    $("#equipment").dataset.slot=slot;
    $("#equipmentGold").textContent=save.gold;

    const totals=totalStats();
    $("#equipTotalHp").textContent=totals.maxHp;
    $("#equipTotalAtk").textContent=totals.atk;
    $("#equipTotalDef").textContent=totals.def;

    const list=$("#equipmentList");
    list.innerHTML="";
    const owned=save.inventory?.[slot] || [];
    for(const id of owned){
      const item=EQUIPMENT[slot]?.[id];
      if(!item) continue;
      const equipped=save.equipped?.[slot]===id;
      const btn=document.createElement("button");
      btn.className=`inventory-item ${rarityClass(item.rarity)} ${equipped?"equipped":""}`;
      btn.innerHTML=`
        <div class="inv-top">
          <span class="rarity-label">${item.rarity}</span>
          <b>${item.name}</b>
          ${equipped?'<em>装備中</em>':""}
        </div>
        <div class="inv-stats">
          ${slot==="weapon"?`ATK +${item.atk}`:`DEF +${item.def}`}
        </div>
        <small>${item.desc}</small>
      `;
      btn.addEventListener("click",()=>equipItem(slot,id));
      list.appendChild(btn);
    }
    show("equipment");
  }

  function equipItem(slot,id){
    if(!(save.inventory?.[slot]||[]).includes(id)) return;
    if(!EQUIPMENT[slot]?.[id]) return;
    save.equipped[slot]=id;
    persist();
    renderHome();
    openEquipment(slot);
  }

  function upgradeCost(type){
    const cfg=UPGRADES[type];
    const lv=save.upgrades[type]||0;
    if(lv>=cfg.maxLv) return null;
    return Math.round(cfg.baseCost * Math.pow(cfg.growth, lv) / 10) * 10;
  }

  function recalcBase(){
    save.base.maxHp=BASE_STATS.maxHp + save.upgrades.hp*UPGRADES.hp.perLv;
    save.base.atk=BASE_STATS.atk + save.upgrades.atk*UPGRADES.atk.perLv;
    save.base.def=BASE_STATS.def + save.upgrades.def*UPGRADES.def.perLv;
  }

  function buyUpgrade(type){
    const cfg=UPGRADES[type];
    const lv=save.upgrades[type]||0;
    const cost=upgradeCost(type);
    if(cost===null || lv>=cfg.maxLv) return;
    if(save.gold<cost){
      const card=document.querySelector(`.upgrade-card[data-upgrade="${type}"]`);
      card?.classList.add("cant-buy");
      setTimeout(()=>card?.classList.remove("cant-buy"),420);
      return;
    }
    save.gold-=cost;
    save.upgrades[type]=lv+1;
    recalcBase();
    persist();
    renderHome();
  }

  function renderHome(){
    $("#bankGold").textContent=save.gold;
    const totals=totalStats();
    $("#homeHp").textContent=totals.maxHp;
    $("#homeAtk").textContent=totals.atk;
    $("#homeDef").textContent=totals.def;

    const weapon=equippedItem("weapon");
    const armor=equippedItem("armor");
    $("#weaponName").textContent=weapon.name;
    $("#weaponBonus").textContent=`ATK +${weapon.atk}`;
    $("#armorName").textContent=armor.name;
    $("#armorBonus").textContent=`DEF +${armor.def}`;

    for(const type of ["hp","atk","def"]){
      const cfg=UPGRADES[type];
      const lv=save.upgrades[type]||0;
      const cost=upgradeCost(type);
      const lvEl=$(`#${type}Lv`);
      const costEl=$(`#${type}Cost`);
      const card=document.querySelector(`.upgrade-card[data-upgrade="${type}"]`);
      if(lvEl) lvEl.textContent=`Lv.${lv}/${cfg.maxLv}`;
      if(costEl) costEl.textContent=cost===null ? "MAX" : `${cost}G`;
      if(card){
        card.disabled=cost===null;
        card.classList.toggle("maxed",cost===null);
        card.classList.toggle("affordable",cost!==null && save.gold>=cost);
      }
    }

    const clears=save.clears["1-1"]||0;
    $("#clearCount").textContent=clears;
    $("#bestRunGold").textContent=`${save.records["1-1"]?.bestRunGold||0}G`;
    const badge=$("#clearBadge");
    badge.textContent=clears>0 ? `CLEAR ×${clears}` : "未CLEAR";
    badge.classList.toggle("cleared",clears>0);
  }

  function currentDungeon(){ return DUNGEONS[state.dungeonId]; }
  function currentEnemy(){ return currentDungeon().enemies[state.battle]; }
  function currentAttack(){
    const e=currentEnemy();
    return e.attacks[state.turn % e.attacks.length];
  }

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

  function drawFace(faceEl,value){
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
      const value=state.dice[i];
      drawFace(d.querySelector(".die-face"),value);
      const label=document.querySelector(`.roll-number[data-result="${i}"]`);
      if(label){
        label.textContent=value||"";
        label.classList.toggle("visible",Boolean(value));
        label.classList.toggle("six",i===2 && value===6);
      }
    });

    const ready=state.nextDie===0 && !busy;
    $("#pairRollBtn").disabled=!ready;
    $("#pairRollBtn").classList.toggle("locked",!ready);
    $("#pairRollBtn").classList.toggle("ready",ready);

    $("#multRollBtn").classList.toggle("auto-wait",busy && state.nextDie===2);
    $("#multRollBtn").classList.add("locked");
    document.body.classList.toggle("mult-dim",state.nextDie===2 && busy);
  }

  function renderEnemyArt(enemy){
    const art=$("#enemyArt");
    art.innerHTML=enemy.image
      ? `<img class="enemy-img" src="${enemy.image}" alt="${enemy.name}">`
      : "";
  }

  function renderBattle(){
    const e=currentEnemy();
    const dungeon=currentDungeon();

    $("#battleNo").textContent=`BATTLE ${state.battle+1}/5`;
    $(".battle-head small").textContent=`${dungeon.id} ${dungeon.name}`;
    $("#runGold").textContent=state.runGold;
    renderEnemyArt(e);
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
    const forecast=$("#forecast");
    const ghost=$("#enemyHpForecast");
    const hpbar=$(".enemy-hp-bar");

    if(dmg!==null){
      const remain=Math.max(0,state.enemyHp-dmg);
      forecast.textContent=remain===0 ? `⚔ KILL!!  ${dmg} DAMAGE` : `予測 ${dmg} DAMAGE → 残り ${remain} HP`;
      forecast.className=remain===0 ? "forecast kill" : "forecast";
      const curPct=Math.max(0,state.enemyHp/e.hp*100);
      const remPct=Math.max(0,remain/e.hp*100);
      ghost.style.left=`${remPct}%`;
      ghost.style.width=`${Math.max(0,curPct-remPct)}%`;
      hpbar.classList.toggle("kill-preview",remain===0);
      $("#attackBtn").disabled=busy;
      $("#instruction").textContent="ダメージ確定！攻撃！";
    }else{
      forecast.textContent="";
      forecast.className="forecast";
      ghost.style.left="100%";
      ghost.style.width="0";
      hpbar.classList.remove("kill-preview");
      $("#attackBtn").disabled=true;
      if(state.nextDie===0) $("#instruction").textContent="タップしてROLL！";
      else if(state.nextDie===2) $("#instruction").textContent="倍率チャージ…";
      else $("#instruction").textContent="ROLLING…";
    }
    $("#critical").classList.add("hidden");
  }

  function startRun(){
    const base=totalStats();
    state={
      dungeonId:selectedDungeonId,
      hp:base.maxHp,
      maxHp:base.maxHp,
      atk:base.atk,
      def:base.def,
      runGold:0,
      battle:0,
      turn:0,
      dice:[null,null,null],
      nextDie:0,
      enemyHp:0
    };
    loadEnemy();
    show("battle");
  }

  function loadEnemy(){
    const e=currentEnemy();
    state.turn=0;
    state.enemyHp=e.hp;
    state.dice=[null,null,null];
    state.nextDie=0;
    busy=false;
    $("#enemyArt").classList.remove("dead","hit");
    renderBattle();
  }

  async function animateOneDie(index, visualDie, mult=false, extraDelay=0){
    if(extraDelay) await wait(extraDelay);
    const duration=mult?900:560;
    visualDie.classList.remove("land");
    void visualDie.offsetWidth;
    visualDie.classList.add("rolling");
    FX.rollDie(mult);
    const face=visualDie.querySelector(".die-face");
    const resultLabel=document.querySelector(`.roll-number[data-result="${index}"]`);
    if(resultLabel){
      resultLabel.textContent="";
      resultLabel.classList.remove("visible","six");
    }
    const start=performance.now();
    let step=0;
    while(performance.now()-start < duration-55){
      drawFace(face,1+Math.floor(Math.random()*6));
      step++;
      await wait(Math.min(76,38+step*4));
    }
    const value=1+Math.floor(Math.random()*6);
    state.dice[index]=value;
    drawFace(face,value);
    if(resultLabel){
      resultLabel.textContent=value;
      resultLabel.classList.add("visible");
      if(mult && value===6) resultLabel.classList.add("six");
    }
    await wait(38);
    visualDie.classList.remove("rolling");
    visualDie.classList.add("land");
    FX.land(mult);
    setTimeout(()=>visualDie.classList.remove("land"),160);
    return value;
  }

  function multiplierTone(value){
    return {
      1:{cls:"impact-1",label:"×1"},
      2:{cls:"impact-2",label:"×2"},
      3:{cls:"impact-3",label:"×3"},
      4:{cls:"impact-4",label:"×4"},
      5:{cls:"impact-5",label:"×5"},
      6:{cls:"impact-6",label:"×6"}
    }[value];
  }

  async function showRollImpact(value){
    const tone=multiplierTone(value);
    const box=$("#rollImpact");
    const num=$("#impactNumber");

    box.className=`roll-impact show ${tone.cls}`;
    num.textContent=tone.label;

    document.body.classList.add(`screen-hit-${value}`);
    if(value>=4) document.body.classList.add("impact-shake");
    if(value>=5) document.body.classList.add("impact-heavy");

    try{
      if(navigator.vibrate){
        if(value===6) navigator.vibrate([30,30,70]);
        else if(value>=4) navigator.vibrate(35);
        else navigator.vibrate(18);
      }
    }catch(_){}

    await wait(value===6?700:value>=4?520:400);

    document.body.classList.remove(
      "screen-hit-1","screen-hit-2","screen-hit-3",
      "screen-hit-4","screen-hit-5","screen-hit-6",
      "impact-shake","impact-heavy"
    );
    box.className="roll-impact";
  }

  async function rollPair(){
    if(busy || state.nextDie!==0) return;

    busy=true;
    state.dice=[0,0,0];
    renderBattle();
    $("#instruction").textContent="ROLL!";

    const dice=$$(".die");

    // First tap rolls ① and ② automatically.
    const [a,b]=await Promise.all([
      animateOneDie(0,dice[0],false,0),
      animateOneDie(1,dice[1],false,105)
    ]);

    state.nextDie=2;

    const sum=$("#sumBurst");
    sum.textContent=`${a} + ${b} = ${a+b}`;
    sum.className="sum-burst show";
    document.body.classList.add("pair-impact");
    FX.attack(false);

    await wait(210);
    document.body.classList.remove("pair-impact");
    setTimeout(()=>sum.className="sum-burst",500);

    // The third die is automatic, but gets a deliberate suspense pause.
    $("#instruction").textContent="倍率チャージ…";
    $("#multRollBtn").classList.add("charge","auto-wait");
    document.body.classList.add("mult-focus","mult-charge-screen");

    await wait(420);

    $("#multRollBtn").classList.remove("charge");
    $("#instruction").textContent="倍率抽選！";

    const value=await animateOneDie(2,dice[2],true,0);
    state.nextDie=3;

    $("#multRollBtn").classList.remove("auto-wait");
    document.body.classList.remove("mult-charge-screen");

    const multFx=$("#multFx");
    multFx.textContent=`×${value}`;
    multFx.className=`show-mult${value===6?" x6":""}`;
    FX.multiplier(value);

    // Large, color-coded "DEN!" result hit.
    await showRollImpact(value);

    if(state.dice.every(v=>v===6)){
      await wait(80);
      $("#critical").classList.remove("hidden");
      FX.critical666();
      document.body.classList.add("critical-flash");
      await wait(760);
      document.body.classList.remove("critical-flash");
      $("#critical").classList.add("hidden");
    }

    multFx.className="";
    document.body.classList.remove("mult-focus");

    busy=false;
    renderBattle();
  }

  async function attack(){
    const dmg=calcDamage();
    if(busy || dmg===null) return;
    busy=true;
    renderBattle();

    const before=state.enemyHp;
    state.enemyHp=Math.max(0,before-dmg);

    $("#damageFx").textContent=dmg;
    $("#damageFx").className="show-damage";
    $("#slashFx").className="show-slash";
    document.body.classList.add(dmg>=45?"big-shake":"shake");
    FX.attack(dmg>=45);

    const art=$("#enemyArt");
    art.classList.remove("hit");
    void art.offsetWidth;
    art.classList.add("hit");
    renderBattle();

    await wait(520);
    $("#damageFx").className="";
    $("#slashFx").className="";
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
      finishDefeat();
      busy=false;
      return;
    }

    state.dice=[null,null,null];
    state.nextDie=0;
    busy=false;
    renderBattle();
  }

  async function winBattle(){
    const e=currentEnemy();
    state.runGold+=e.gold;

    if(e.boss){
      showBossBoxes();
      return;
    }

    $("#rewardBattleText").textContent=`BATTLE ${state.battle+1} CLEAR`;
    $("#rewardGoldText").textContent=`+${e.gold}G`;
    FX.reward();
    show("reward");
  }

  function chooseReward(kind){
    if(kind==="heal") state.hp=Math.min(state.maxHp,state.hp+Math.ceil(state.maxHp*.3));
    if(kind==="gold") state.runGold+=40;
    if(kind==="atk") state.atk+=3;

    state.battle++;
    loadEnemy();
    show("battle");
  }

  function showBossBoxes(){
    $("#bossBaseGold").textContent=`${state.runGold}G`;
    $("#bossResult").innerHTML="";
    $$(".box").forEach(b=>{
      b.disabled=false;
      b.classList.remove("opened");
      b.innerHTML="🎁<span>BOX</span>";
    });
    show("bossReward");
  }

  function chooseBox(btn){
    if(!state) return;

    // provisional equal rates; isolated here so probabilities can be tuned later.
    const mult=[1,2,3][Math.floor(Math.random()*3)];

    btn.classList.add("opened");
    btn.innerHTML=`×${mult}<span>BONUS</span>`;
    $$(".box").forEach(b=>b.disabled=true);

    const runGold=state.runGold;
    const total=runGold*mult;

    save.gold+=total;
    save.clears[state.dungeonId]=(save.clears[state.dungeonId]||0)+1;
    const record=save.records[state.dungeonId] || {bestRunGold:0};
    record.bestRunGold=Math.max(record.bestRunGold,total);
    save.records[state.dungeonId]=record;
    persist();

    lastClear={runGold,mult,total,dungeonId:state.dungeonId};
    $("#bossResult").innerHTML=`<strong>×${mult}</strong><span>${total}G GET!</span>`;

    setTimeout(()=>{
      $("#resultRunGold").textContent=`${runGold}G`;
      $("#resultMultiplier").textContent=`×${mult}`;
      $("#resultTotalGold").textContent=`${total}G`;
      show("runResult");
    },850);
  }

  function finishDefeat(){
    const earned=state.runGold;
    save.gold+=earned;
    persist();
    $("#deathGold").textContent=`${earned}G`;
    show("gameover");
  }

  function returnHome(){
    state=null;
    busy=false;
    document.body.classList.remove("mult-dim","shake","big-shake");
    renderHome();
    show("home");
  }

  $$(".upgrade-card").forEach(b=>b.addEventListener("click",()=>buyUpgrade(b.dataset.upgrade)));
  $("#gachaEntry").addEventListener("click",openGacha);
  $("#gachaBack").addEventListener("click",()=>{renderHome();show("home");});
  $$(".gacha-pull").forEach(b=>b.addEventListener("click",()=>pullGacha(b.dataset.tier)));
  $$(".equip-button").forEach(b=>b.addEventListener("click",()=>openEquipment(b.dataset.slot)));
  $("#equipmentBack").addEventListener("click",()=>{renderHome();show("home");});
  $("#startBtn").addEventListener("click",startRun);
  $("#pairRollBtn").addEventListener("click",rollPair);
  $("#attackBtn").addEventListener("click",attack);
  $$(".reward").forEach(b=>b.addEventListener("click",()=>chooseReward(b.dataset.reward)));
  $$(".box").forEach(b=>b.addEventListener("click",()=>chooseBox(b)));
  $("#deathHome").addEventListener("click",returnHome);
  $("#resultHome").addEventListener("click",returnHome);

  recalcBase();
  persist();
  renderHome();
})();
