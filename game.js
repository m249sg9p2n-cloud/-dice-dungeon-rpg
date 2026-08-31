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

      fate_eater:{id:"fate_eater",name:"運命喰らい",rarity:"LEGENDARY",atk:15,def:0,skill:"DOUBLE",desc:"①=②なら最終ダメージ×1.5。"},
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
      purification:{id:"purification",name:"浄化の聖衣",rarity:"EPIC",atk:0,def:9,skill:"浄化",desc:"各戦闘開始時に最大HPの10%回復。"},
      gambler_cloak:{id:"gambler_cloak",name:"賭博師の外套",rarity:"EPIC",atk:0,def:9,skill:"LUCKY SIX",desc:"③が6なら最大HPの15%回復。"},

      fate_armor:{id:"fate_armor",name:"運命の鎧",rarity:"LEGENDARY",atk:0,def:13,skill:"運命改変",desc:"1戦1回、致死攻撃を半減して運命をずらす。"},
      phoenix_armor:{id:"phoenix_armor",name:"不死鳥の鎧",rarity:"LEGENDARY",atk:0,def:14,skill:"REBIRTH",desc:"1ランに1度、HP50%で復活。"},

      aegis:{id:"aegis",name:"神護・アイギス",rarity:"GOD",atk:0,def:18,skill:"AEGIS",desc:"致死攻撃を無効化し、次の③を6にする。"}
    }
  };

  const DUNGEONS = {
    "1-1":{id:"1-1",name:"ゴブリンの森",recommended:220,theme:"FOREST",mission:"序章から容赦なし。ゴブリンキングを撃破せよ。",enemies:[
      {name:"ゴブリン",image:"enemy_01_goblin.png",hp:125,attacks:[18,24,32],gold:45,lv:1},
      {name:"ゴブリン弓兵",image:"enemy_02_goblin_archer.png",hp:155,attacks:[20,20,38],gold:60,lv:2},
      {name:"ゴブリン戦士",image:"enemy_03_goblin_warrior.png",hp:210,attacks:[28,34,42],gold:80,lv:3},
      {name:"ゴブリン隊長",image:"enemy_04_goblin_captain.png",hp:285,attacks:[30,44,62],gold:110,lv:4},
      {name:"ゴブリンキング",image:"enemy_05_goblin_king.png",hp:450,attacks:[36,52,42,86],gold:220,lv:5,boss:true}]},
    "1-2":{id:"1-2",name:"毒蜘蛛の洞窟",recommended:300,theme:"VENOM",mission:"毒と高火力の連戦。強化と装備なしでは突破困難。",enemies:[
      {name:"洞窟コウモリ",image:"enemy_06_cave_bat.png",hp:230,attacks:[28,34,42],gold:80,lv:6},
      {name:"子蜘蛛",image:"enemy_07_baby_spider.png",hp:280,attacks:[32,42,48],gold:100,lv:7},
      {name:"毒蜘蛛",image:"enemy_08_poison_spider.png",hp:345,attacks:[38,48,58],gold:125,lv:8},
      {name:"大蜘蛛",image:"enemy_09_giant_spider.png",hp:425,attacks:[42,58,76],gold:160,lv:9},
      {name:"大毒蜘蛛",image:"enemy_10_queen_spider.png",hp:650,attacks:[50,66,54,105],gold:310,lv:10,boss:true}]},
    "1-3":{id:"1-3",name:"呪われた墓地",recommended:390,theme:"CURSE",mission:"亡者の群れを超え、スケルトンロードを撃破せよ。",enemies:[
      {name:"スケルトン",image:"enemy_11_skeleton.png",hp:360,attacks:[40,52,62],gold:120,lv:11},
      {name:"ゾンビ",image:"enemy_12_zombie.png",hp:430,attacks:[46,56,72],gold:145,lv:12},
      {name:"スケルトン騎士",image:"enemy_13_skeleton_knight.png",hp:520,attacks:[50,68,82],gold:175,lv:13},
      {name:"ネクロマンサー",image:"enemy_14_necromancer.png",hp:620,attacks:[56,74,96],gold:215,lv:14},
      {name:"スケルトンロード",image:"enemy_15_skeleton_lord.png",hp:900,attacks:[62,82,68,132],gold:420,lv:15,boss:true}]},
    "1-4":{id:"1-4",name:"灼熱の火山",recommended:500,theme:"VOLCANO",mission:"極悪難度。火力と耐久を育て切って挑め。",enemies:[
      {name:"ファイアスライム",image:"enemy_16_fire_slime.png",hp:520,attacks:[58,70,84],gold:170,lv:16},
      {name:"ファイアリザード",image:"enemy_17_fire_lizard.png",hp:620,attacks:[64,78,94],gold:205,lv:17},
      {name:"炎戦士",image:"enemy_18_flame_warrior.png",hp:750,attacks:[70,88,108],gold:250,lv:18},
      {name:"マグマゴーレム",image:"enemy_19_magma_golem.png",hp:920,attacks:[78,102,126],gold:320,lv:19},
      {name:"火山の暴君",image:"enemy_20_volcano_tyrant.png",hp:1350,attacks:[90,118,96,165],gold:600,lv:20,boss:true}]}
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
      forgeLevels:{},
      equipped:{weapon:"training_sword",armor:"traveler_clothes"},
      clears:{"1-1":0,"1-2":0,"1-3":0,"1-4":0},
      records:{"1-1":{bestRunGold:0},"1-2":{bestRunGold:0},"1-3":{bestRunGold:0},"1-4":{bestRunGold:0}},
      unlocked:["1-1"],
      gachaStats:{pulls:0,sinceEpic:0,sinceGod:0,history:[]},
      lifetime:{kills:0,bossKills:0,bestDamage:0,maxCombo:0,totalRuns:0,deaths:0},
      mastery:{"1-1":0,"1-2":0,"1-3":0,"1-4":0}
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
        forgeLevels:{...(parsed.forgeLevels||{})},
        equipped:{weapon:"training_sword",armor:"traveler_clothes",...(parsed.equipped||{})},
        clears:{"1-1":0,"1-2":0,"1-3":0,"1-4":0,...(parsed.clears||{})},
        records:{"1-1":{bestRunGold:0},"1-2":{bestRunGold:0},"1-3":{bestRunGold:0},"1-4":{bestRunGold:0},...(parsed.records||{})},
        unlocked:Array.isArray(parsed.unlocked) ? parsed.unlocked : ["1-1"],
        gachaStats:{pulls:0,sinceEpic:0,sinceGod:0,history:[],...(parsed.gachaStats||{})},
        lifetime:{kills:0,bossKills:0,bestDamage:0,maxCombo:0,totalRuns:0,deaths:0,...(parsed.lifetime||{})},
        mastery:{"1-1":0,"1-2":0,"1-3":0,"1-4":0,...(parsed.mastery||{})}
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
  let pendingGacha = null;
  let gachaBusy = false;
  let equipmentPage = 0;
  let forgeSelection=null;
  const EQUIPMENT_PAGE_SIZE = 4;

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

  const RARITY_ORDER=["NORMAL","RARE","EPIC","LEGENDARY","GOD"];

  function openGacha(){
    $("#gachaGold").textContent=save.gold;
    if($("#gachaInfoGold")) $("#gachaInfoGold").textContent=save.gold;
    $("#gachaResult").classList.add("hidden");
    $("#gachaResult").innerHTML="";
    $("#gachaTheater")?.classList.add("hidden");
    pendingGacha=null;
    gachaBusy=false;
    renderGachaMeta();
    show("gacha");
  }

  function renderGachaMeta(){
    const gs=save.gachaStats||(save.gachaStats={pulls:0,sinceEpic:0,sinceGod:0,history:[]});
    const pulls=$("#gachaPulls"), ep=$("#epicPity"), god=$("#godPity");
    if(pulls) pulls.textContent=gs.pulls||0;
    if(ep) ep.textContent=Math.max(1,10-(gs.sinceEpic||0));
    if(god) god.textContent=Math.max(1,50-(gs.sinceGod||0));
    const hist=$("#gachaHistory");
    if(hist){
      const rows=(gs.history||[]).slice(0,5);
      hist.innerHTML=rows.length ? rows.map(x=>{
        const [r,...rest]=x.split(":");
        return `<span class="hist-${String(r).toLowerCase()}"><b>${r}</b>${rest.join(":")}</span>`;
      }).join("") : "<small>召喚履歴はまだありません</small>";
    }
  }

  function gachaBaseRarity(tier){
    return tier==="epic"?"EPIC":tier==="rare"?"RARE":"NORMAL";
  }

  function setChestRarity(rarity){
    const chest=$("#gachaChest");
    const grade=$("#gachaGrade");
    const theater=$("#gachaTheater");
    const title=$("#summonRarityTitle");
    if(!chest) return;
    const key=rarity.toLowerCase();
    chest.className=`gacha-chest chest-${key}`;
    if(theater) theater.dataset.rarity=key;
    if(grade) grade.textContent=rarity;
    if(title) title.textContent=rarity;
  }

  function storeGachaResult(result){
    const owned=save.inventory[result.slot] || (save.inventory[result.slot]=[]);
    const isDuplicate=owned.includes(result.item.id);
    if(!isDuplicate){
      owned.push(result.item.id);
      save.duplicates[result.item.id]=1;
    }else{
      save.duplicates[result.item.id]=(save.duplicates[result.item.id]||1)+1;
    }
    return {isDuplicate,count:save.duplicates[result.item.id]||1};
  }

  function pullGacha(tier){
    const cfg=GACHA[tier];
    if(gachaBusy || pendingGacha) return;
    if(!cfg || save.gold<cfg.cost){
      const btn=document.querySelector(`.gacha-pull[data-tier="${tier}"]`);
      btn?.classList.add("cant-buy");
      setTimeout(()=>btn?.classList.remove("cant-buy"),420);
      return;
    }

    save.gold-=cfg.cost;
    let rarity=rollRarity(cfg.rates);
    const gs=save.gachaStats||(save.gachaStats={pulls:0,sinceEpic:0,sinceGod:0,history:[]});

    // Player-friendly pity: EPIC+ within 10 pulls, GOD within 50 pulls.
    if((gs.sinceGod||0)>=49) rarity="GOD";
    else if((gs.sinceEpic||0)>=9 && ["NORMAL","RARE"].includes(rarity)) rarity="EPIC";

    gs.pulls=(gs.pulls||0)+1;
    gs.sinceGod = rarity==="GOD" ? 0 : (gs.sinceGod||0)+1;
    gs.sinceEpic = ["EPIC","LEGENDARY","GOD"].includes(rarity) ? 0 : (gs.sinceEpic||0)+1;

    const pool=allEquipment().filter(x=>x.item.rarity===rarity);
    const result=pool[Math.floor(Math.random()*pool.length)];
    gs.history=[`${rarity}:${result.item.name}`,...(gs.history||[])].slice(0,8);
    pendingGacha={
      tier,
      result,
      finalRarity:rarity,
      currentRarity:gachaBaseRarity(tier)
    };
    persist();
    $("#gachaGold").textContent=save.gold;
    renderGachaMeta();
    renderHome();

    $("#gachaResult").classList.add("hidden");
    $("#gachaResult").innerHTML="";
    const theater=$("#gachaTheater");
    theater?.classList.remove("hidden","summon-ready");
    theater?.classList.add("summon-enter");
    $("#gachaPrompt").textContent="召喚陣を展開中…";
    setChestRarity(pendingGacha.currentRarity);
    $("#gachaChest")?.classList.remove("ready");
    FX.chestRattle();
    setTimeout(()=>{
      theater?.classList.remove("summon-enter");
      theater?.classList.add("summon-ready");
      $("#gachaPrompt").textContent="CHESTをタップ";
      $("#gachaChest")?.classList.add("ready");
      try{if(navigator.vibrate) navigator.vibrate([10,18,24])}catch(_){}
    },620);
  }

  async function gachaChestTap(){
    if(!pendingGacha || gachaBusy || !$("#gachaTheater")?.classList.contains("summon-ready")) return;
    gachaBusy=true;
    const chest=$("#gachaChest");
    chest?.classList.remove("ready");
    chest?.classList.add("rattle","overdrive");
    $("#gachaTheater")?.classList.add("tension");
    FX.chestTension(pendingGacha.currentRarity);
    FX.chestRattle();
    try{if(navigator.vibrate) navigator.vibrate([16,24,16,30,18])}catch(_){}
    await wait(520);
    chest?.classList.remove("rattle");
    $("#gachaTheater")?.classList.remove("tension");

    const cur=RARITY_ORDER.indexOf(pendingGacha.currentRarity);
    const fin=RARITY_ORDER.indexOf(pendingGacha.finalRarity);

    if(cur<fin){
      await playGachaPuchun(RARITY_ORDER[cur+1]);
      await playRarityCutInV4(RARITY_ORDER[cur+1]);
      pendingGacha.currentRarity=RARITY_ORDER[cur+1];
      setChestRarity(pendingGacha.currentRarity);
      $("#gachaPrompt").textContent="昇格成功 ─ さらに上位へ…";
      chest?.classList.add("ready","graded","overdrive");
      $("#gachaTheater")?.classList.add("grade-celebrate");
      setTimeout(()=>$("#gachaTheater")?.classList.remove("grade-celebrate"),700);
      gachaBusy=false;
      return;
    }

    await revealGachaResult();
    gachaBusy=false;
  }

  async function playGachaPuchun(nextRarity){
    document.querySelector("#gachaPuchun")?.remove();

    const layer=document.createElement("div");
    layer.id="gachaPuchun";
    layer.className=`puchun-${nextRarity.toLowerCase()} exact-video-puchun`;
    layer.innerHTML=`
      <video class="exact-puchun-video" src="puchun_exact.mp4?v=4000" preload="auto" playsinline muted></video>
      <div class="exact-grade">
        <div class="grade-rays"></div>
        <div class="grade-hex"></div>
        <div class="grade-ring a"></div>
        <div class="grade-ring b"></div>
        <small>GRADE UP</small>
        <strong>${nextRarity}</strong>
        <em>昇 格</em>
      </div>`;
    document.body.appendChild(layer);

    const video=layer.querySelector(".exact-puchun-video");

    // Exact reproduction: play the licensed 3.0s / 30fps source itself.
    // This avoids browser-frame skipping and CSS approximation entirely.
    try{
      video.currentTime=0;
      const playPromise=video.play();
      if(playPromise) await playPromise;
    }catch(_){}

    // Original material is silent; synchronize the game's power-cut SE to its first flash.
    await wait(30);
    FX.puchun();
    try{if(navigator.vibrate) navigator.vibrate([8,12,24])}catch(_){}

    // Wait for the exact source animation to finish. Fallback protects iOS edge cases.
    await Promise.race([
      new Promise(resolve=>video.addEventListener("ended",resolve,{once:true})),
      wait(3200)
    ]);

    // Keep a short true-black beat before the rarity payoff.
    layer.classList.add("source-ended");
    await wait(nextRarity==="GOD"?360:260);

    layer.classList.add("grade-on");
    FX.gradeUp();
    try{
      if(navigator.vibrate){
        navigator.vibrate(nextRarity==="GOD"?[24,20,70,26,95]:[20,18,60]);
      }
    }catch(_){}
    await wait(nextRarity==="GOD"?1180:900);

    layer.classList.add("grade-out");
    await wait(180);
    layer.remove();
  }

  async function revealGachaResult(){
    const {result,finalRarity}=pendingGacha;
    const chest=$("#gachaChest");
    chest?.classList.add("opening");
    FX.chestOpen(finalRarity);
    try{if(navigator.vibrate) navigator.vibrate(finalRarity==="GOD"?[28,16,70]:[24,14,42])}catch(_){}
    await wait(520);

    const stored=storeGachaResult(result);
    persist();
    renderHome();

    // Hide the small inline result and use a full-screen showcase.
    $("#gachaResult")?.classList.add("hidden");
    document.querySelector("#gachaRewardFull")?.remove();

    const stat=result.slot==="weapon" ? `ATK +${result.item.atk}` : `DEF +${result.item.def}`;
    const skill=result.item.skill ? `《${result.item.skill}》` : "";
    const rarity=finalRarity.toLowerCase();

    const layer=document.createElement("div");
    layer.id="gachaRewardFull";
    layer.className=`reward-${rarity}`;
    layer.innerHTML=`
      <div class="reward-bg"></div>
      <div class="reward-stars">${Array.from({length:30},(_,i)=>`<i style="--x:${(i*37)%100}%;--y:${(i*61)%100}%;--d:${(i%7)*90}ms;--s:${3+(i%5)}px"></i>`).join("")}</div>
      <div class="reward-burst"></div>
      <div class="reward-rings"><b></b><b></b><b></b></div>
      <div class="reward-content">
        <div class="reward-rarity">${finalRarity}</div>
        <div class="reward-rank-copy">${finalRarity==="GOD"?"DIVINE ACQUISITION":finalRarity==="LEGENDARY"?"LEGEND DESCENDS":finalRarity==="EPIC"?"EPIC DROP":"ITEM GET"}</div>
        <div class="reward-new">${stored.isDuplicate?`DUPLICATE ×${stored.count}`:"NEW!"}</div>
        <div class="reward-artifact">
          <span class="artifact-corner c1"></span><span class="artifact-corner c2"></span>
          <span class="artifact-corner c3"></span><span class="artifact-corner c4"></span>
          <div class="reward-icon">${result.slot==="weapon"?"⚔️":"🛡️"}</div>
        </div>
        <small class="reward-type">${result.slot==="weapon"?"WEAPON":"ARMOR"}</small>
        <h1>${result.item.name}</h1>
        <div class="reward-stat">${stat}</div>
        ${skill?`<div class="reward-skill">${skill}</div>`:""}
        <button id="rewardCloseBtn" type="button">TAP TO CONTINUE</button>
      </div>`;
    document.body.appendChild(layer);

    await wait(40);
    layer.classList.add("show");
    FX.chestBurst(finalRarity);
    try{
      if(navigator.vibrate){
        navigator.vibrate(finalRarity==="GOD" ? [28,18,70,25,90] :
                          finalRarity==="LEGENDARY" ? [24,16,65] :
                          finalRarity==="EPIC" ? [18,14,50] : [14,10,34]);
      }
    }catch(_){}

    await new Promise(resolve=>{
      $("#rewardCloseBtn")?.addEventListener("click",resolve,{once:true});
      layer.addEventListener("click",e=>{
        if(e.target===layer || e.target.classList.contains("reward-bg")) resolve();
      },{once:true});
    });

    layer.classList.add("hide-out");
    await wait(220);
    layer.remove();

    $("#gachaPrompt").textContent="召喚完了！";
    $("#gachaTheater")?.classList.add("finished");
    pendingGacha=null;
    chest?.classList.remove("opening","graded");
    $("#gachaTheater")?.classList.add("hidden");
  }


  function enhancementLevel(id){
    return Math.max(0,Math.min(2,Number(save.forgeLevels?.[id]||0)));
  }

  function enhancementLabel(id){
    const lv=enhancementLevel(id);
    return lv===2 ? "++" : lv===1 ? "+" : "";
  }

  function enhancedValue(item,key){
    if(!item) return 0;
    const base=Number(item[key]||0);
    const lv=enhancementLevel(item.id);
    const mult=lv===2 ? 2.25 : lv===1 ? 1.5 : 1;
    return Math.round(base*mult);
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
      atk:save.base.atk + enhancedValue(weapon,"atk") + enhancedValue(armor,"atk"),
      def:save.base.def + enhancedValue(weapon,"def") + enhancedValue(armor,"def")
    };
  }

  function playerPower(){
    const s=totalStats();
    return Math.round(s.maxHp + s.atk*5 + s.def*8);
  }

  function collectionCount(){
    return new Set([...(save.inventory.weapon||[]),...(save.inventory.armor||[])]).size;
  }

  function adventurerRank(){
    const clears=Object.values(save.clears||{}).reduce((a,b)=>a+(Number(b)||0),0);
    if(clears>=20) return "MYTHIC";
    if(clears>=10) return "LEGEND";
    if(clears>=5) return "CONQUEROR";
    if(clears>=2) return "SLAYER";
    if(clears>=1) return "HUNTER";
    return "ROOKIE";
  }

  function rarityClass(rarity){
    return `rarity-${String(rarity||"NORMAL").toLowerCase()}`;
  }

  function openEquipment(slot, page=0){
    const title=slot==="weapon" ? "武器を選択" : "防具を選択";
    $("#equipmentTitle").textContent=title;
    $("#equipment").dataset.slot=slot;
    $("#equipmentGold").textContent=save.gold;
    $("#weaponTab")?.classList.toggle("active",slot==="weapon");
    $("#armorTab")?.classList.toggle("active",slot==="armor");

    const totals=totalStats();
    $("#equipTotalHp").textContent=totals.maxHp;
    $("#equipTotalAtk").textContent=totals.atk;
    $("#equipTotalDef").textContent=totals.def;

    const list=$("#equipmentList");
    list.innerHTML="";
    const owned=save.inventory?.[slot] || [];
    const totalPages=Math.max(1,Math.ceil(owned.length/EQUIPMENT_PAGE_SIZE));
    equipmentPage=Math.max(0,Math.min(Number(page)||0,totalPages-1));
    const visible=owned.slice(equipmentPage*EQUIPMENT_PAGE_SIZE,(equipmentPage+1)*EQUIPMENT_PAGE_SIZE);
    const current=equippedItem(slot);

    for(const id of visible){
      const item=EQUIPMENT[slot]?.[id];
      if(!item) continue;
      const equipped=save.equipped?.[slot]===id;
      const value=slot==="weapon"?enhancedValue(item,"atk"):enhancedValue(item,"def");
      const curValue=slot==="weapon"?enhancedValue(current,"atk"):enhancedValue(current,"def");
      const delta=value-curValue;
      const count=save.duplicates[item.id]||1;
      const lv=enhancementLevel(item.id);
      const progress=lv>=2?"合成 MAX":count>=3?"合成可能":"合成素材 "+count+"/3";
      const btn=document.createElement("button");
      btn.className=`inventory-item ${rarityClass(item.rarity)} ${equipped?"equipped":""}`;
      btn.innerHTML=`
        <div class="inv-top">
          <span class="rarity-label">${item.rarity}</span>
          <b>${item.name}${enhancementLabel(item.id)}</b>
          ${equipped?'<em>装備中</em>':""}
        </div>
        <div class="inv-stats">${slot==="weapon"?`ATK +${value}`:`DEF +${value}`}</div>
        <small>${item.desc}</small>
        <small class="copy-count">所持 ×${count} • ${progress}</small>
        <small class="power-delta">${equipped?"CURRENT":delta>=0?`▲ ${slot==="weapon"?"ATK":"DEF"} +${delta}`:`▼ ${slot==="weapon"?"ATK":"DEF"} ${delta}`}</small>
      `;
      btn.addEventListener("click",()=>{
        equipItem(slot,id);
        forgeSelection={slot,id};
        updateForgeDock();
      });
      list.appendChild(btn);
    }

    if(!visible.length){
      list.innerHTML='<div class="equip-empty">この種類の装備はまだありません</div>';
    }
    if($("#equipPage")) $("#equipPage").textContent=`${equipmentPage+1} / ${totalPages}`;
    if($("#equipPrev")) $("#equipPrev").disabled=equipmentPage<=0;
    if($("#equipNext")) $("#equipNext").disabled=equipmentPage>=totalPages-1;
    show("equipment");
  }

  function equipItem(slot,id){
    if(!(save.inventory?.[slot]||[]).includes(id)) return;
    if(!EQUIPMENT[slot]?.[id]) return;
    save.equipped[slot]=id;
    persist();
    renderHome();
    openEquipment(slot,equipmentPage);
  }


  function updateForgeDock(){
    const btn=$("#forgeBtn"), hint=$("#forgeHint");
    if(!btn||!hint) return;
    if(!forgeSelection){btn.disabled=true;hint.textContent="装備を選んで合成";return;}
    const {slot,id}=forgeSelection;
    const item=EQUIPMENT[slot]?.[id];
    const count=Number(save.duplicates?.[id]||0);
    const lv=enhancementLevel(id);
    if(!item){btn.disabled=true;hint.textContent="装備を選んで合成";return;}
    if(lv>=2){btn.disabled=true;hint.textContent=`${item.name}：MAX ++`;return;}
    btn.disabled=count<3;
    hint.textContent=count>=3?`${item.name} ×3 → ${lv===0?"+":"++"}`:`${item.name}　素材 ${count}/3`;
  }

  async function playForgeCinematic(item,newLv){
    const o=$("#synthesisCinematic");
    if(!o) return;
    $("#forgeItemName").textContent=`${item.name} ${newLv===2?"++":"+"}`;
    o.classList.remove("hidden","play"); void o.offsetWidth; o.classList.add("play");
    FX?.puchun?.();
    navigator.vibrate?.([30,50,90,70,150]);
    await wait(2350);
    o.classList.add("hidden"); o.classList.remove("play");
  }

  async function synthesizeSelected(){
    if(!forgeSelection) return;
    const {slot,id}=forgeSelection;
    const item=EQUIPMENT[slot]?.[id];
    const count=Number(save.duplicates?.[id]||0);
    const lv=enhancementLevel(id);
    if(!item||lv>=2||count<3){updateForgeDock();return;}
    save.duplicates[id]=count-3;
    save.forgeLevels[id]=lv+1;
    persist();
    await playForgeCinematic(item,lv+1);
    renderHome();
    openEquipment(slot,equipmentPage);
    forgeSelection={slot,id};
    updateForgeDock();
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

  function showUpgradeToast(message, good=false){
    const el=$("#upgradeToast");
    if(!el) return;
    el.textContent=message;
    el.className=`upgrade-toast show ${good?"good":"bad"}`;
    clearTimeout(showUpgradeToast.timer);
    showUpgradeToast.timer=setTimeout(()=>{ el.className="upgrade-toast"; },1500);
  }

  function buyUpgrade(type){
    const cfg=UPGRADES[type];
    const lv=save.upgrades[type]||0;
    const cost=upgradeCost(type);
    if(cost===null || lv>=cfg.maxLv) return;
    if(save.gold<cost){
      const card=document.querySelector(`.upgrade-card[data-upgrade="${type}"]`);
      const need=cost-save.gold;
      card?.classList.add("cant-buy");
      setTimeout(()=>card?.classList.remove("cant-buy"),420);
      showUpgradeToast(`GOLD不足！ あと ${need}G 必要`);
      try{ if(navigator.vibrate) navigator.vibrate([18,30,18]); }catch(_){}
      return;
    }
    save.gold-=cost;
    save.upgrades[type]=lv+1;
    showUpgradeToast(`${cfg.label||type.toUpperCase()} Lv.${lv+1}！`,true);
    recalcBase();
    persist();
    renderHome();
    const upGold=$("#upgradeGold");
    if(upGold) upGold.textContent=save.gold;
  }

  function renderHome(){
    $("#bankGold").textContent=save.gold;
    const mr=$("#metaRank"), mp=$("#metaPower"), mc=$("#metaCollection");
    if(mr) mr.textContent=adventurerRank();
    if(mp) mp.textContent=playerPower();
    if(mc) mc.textContent=`${collectionCount()} / ${allEquipment().length}`;
    const totals=totalStats();
    $("#homeHp").textContent=totals.maxHp;
    $("#homeAtk").textContent=totals.atk;
    $("#homeDef").textContent=totals.def;

    const weapon=equippedItem("weapon");
    const armor=equippedItem("armor");
    const equipSummary=$("#equipmentSummary");
    if(equipSummary) equipSummary.textContent=`${weapon.name} / ${armor.name}`;
    const upSummary=$("#upgradeSummary");
    if(upSummary) upSummary.textContent=`HP Lv.${save.upgrades.hp} / ATK Lv.${save.upgrades.atk} / DEF Lv.${save.upgrades.def}`;
    const upGold=$("#upgradeGold");
    if(upGold) upGold.textContent=save.gold;

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
        card.classList.toggle("insufficient",cost!==null && save.gold<cost);
      }
      const needEl=$(`#${type}Need`);
      if(needEl){
        if(cost===null) needEl.textContent="MAX";
        else if(save.gold>=cost) needEl.textContent="強化できます";
        else needEl.textContent=`あと ${cost-save.gold}G`;
      }
    }

    if(!save.unlocked.includes(selectedDungeonId)) selectedDungeonId="1-1";
    const selected=DUNGEONS[selectedDungeonId] || DUNGEONS["1-1"];
    $("#missionTitle").textContent=`${selected.id} ${selected.name}`;
    $("#missionText").textContent=selected.mission||"全5戦を突破せよ。";
    $("#startBtn").textContent=`${selected.id}へ出撃`;
    if($("#homeMissionSummary")) $("#homeMissionSummary").textContent=`${selected.id} ${selected.name}`;
    if($("#dungeonGold")) $("#dungeonGold").textContent=save.gold;
    if($("#recordGold")) $("#recordGold").textContent=save.gold;

    $$(".dungeon-card[data-dungeon]").forEach(card=>{
      const id=card.dataset.dungeon;
      const unlocked=save.unlocked.includes(id);
      card.disabled=!unlocked;
      card.classList.toggle("locked",!unlocked);
      card.classList.toggle("selected",id===selectedDungeonId);
      const badge=card.querySelector(".clear-badge,.dungeon-badge");
      if(badge){
        const c=save.clears[id]||0;
        badge.textContent=!unlocked?"🔒":c>0?`CLEAR ×${c}`:"未CLEAR";
        badge.classList.toggle("cleared",unlocked && c>0);
      }
    });

    if($("#recordKills")) $("#recordKills").textContent=save.lifetime.kills||0;
    if($("#recordBossKills")) $("#recordBossKills").textContent=save.lifetime.bossKills||0;
    if($("#recordBestDamage")) $("#recordBestDamage").textContent=save.lifetime.bestDamage||0;
    if($("#recordMaxCombo")) $("#recordMaxCombo").textContent=save.lifetime.maxCombo||0;
    const milestone=nextRankProgress();
    if($("#milestoneText")) $("#milestoneText").textContent=milestone.text;
    if($("#milestoneFill")) $("#milestoneFill").style.width=`${Math.max(0,Math.min(100,milestone.pct))}%`;
    const selectedCard=document.querySelector(`.dungeon-card[data-dungeon="${selectedDungeonId}"]`);
    if(selectedCard){
      selectedCard.dataset.mastery=`${"★".repeat(masteryStars(selectedDungeonId))}${"☆".repeat(3-masteryStars(selectedDungeonId))}`;
      selectedCard.dataset.power=`推奨POWER ${selected.recommended}`;
    }

    const clears=save.clears[selectedDungeonId]||0;
    $("#clearCount").textContent=clears;
    $("#bestRunGold").textContent=`${save.records[selectedDungeonId]?.bestRunGold||0}G`;
    const badge=$("#clearBadge");
    if(badge){
      badge.textContent=clears>0 ? `CLEAR ×${clears}` : "未CLEAR";
      badge.classList.toggle("cleared",clears>0);
    }
  }


  const ENEMY_INTENTS={
    "ゴブリン":["小突き","悪だくみ","強打"],"ゴブリン弓兵":["狙い撃ち","連射","ヘッドショット"],
    "ゴブリン戦士":["斬撃","踏み込み","大振り"],"ゴブリン隊長":["号令斬り","猛攻","処刑斬り"],
    "ゴブリンキング":["王の一撃","暴君ラッシュ","威圧","キングクラッシュ"],
    "洞窟コウモリ":["急降下","噛みつき","超音波突進"],"子蜘蛛":["噛みつき","糸絡め","毒牙"],
    "毒蜘蛛":["毒牙","飛びかかり","猛毒刺し"],"大蜘蛛":["捕食","強襲","大毒牙"],
    "大毒蜘蛛":["女王の牙","猛毒散布","捕食","デッドリーバイト"],
    "スケルトン":["骨斬り","連撃","死者の一太刀"],"ゾンビ":["腐食打","掴み","怪力"],
    "スケルトン騎士":["騎士斬り","シールドバッシュ","処刑剣"],"ネクロマンサー":["呪弾","死霊術","暗黒波"],
    "スケルトンロード":["冥府斬","王の呪い","死者召喚","デスブリンガー"],
    "ファイアスライム":["火花","灼熱体当たり","爆ぜる"],"ファイアリザード":["火炎爪","灼熱突進","フレイムバイト"],
    "炎戦士":["炎斬","連炎撃","業火斬"],"マグマゴーレム":["岩砕き","溶岩拳","地殻粉砕"],
    "火山の暴君":["獄炎爪","暴君の咆哮","灼熱突進","終焉火山"]
  };

  function enemyIntent(enemy, turn){
    const arr=ENEMY_INTENTS[enemy.name]||["攻撃"];
    return arr[turn%arr.length];
  }
  function momentumMultiplier(){
    return [1,1.05,1.10,1.18,1.30][state?.momentum||0]||1;
  }
  function currentRunBlessing(){
    const b=state?.blessings||{};
    const parts=[];
    if(b.fury) parts.push(`FURY +${b.fury}`);
    if(b.guard) parts.push(`GUARD +${b.guard}`);
    if(b.fortune) parts.push(`FORTUNE ${b.fortune}`);
    if(b.vital) parts.push(`VITAL ${b.vital}`);
    return parts[0]||"NO BLESSING";
  }
  function masteryStars(id){ return Math.max(0,Math.min(3,Number(save.mastery?.[id]||0))); }
  function nextRankProgress(){
    const clears=Object.values(save.clears||{}).reduce((a,b)=>a+(Number(b)||0),0);
    const thresholds=[["HUNTER",1],["SLAYER",2],["CONQUEROR",5],["LEGEND",10],["MYTHIC",20]];
    const next=thresholds.find(([,n])=>clears<n);
    if(!next) return {text:"MYTHIC到達 — 伝説は続く",pct:100};
    const prev=[0,1,2,5,10].filter(n=>n<next[1]).pop()||0;
    return {text:`${next[0]}まで CLEAR ${clears}/${next[1]}`,pct:(clears-prev)/(next[1]-prev)*100};
  }

  function currentDungeon(){ return DUNGEONS[state.dungeonId]; }
  function currentEnemy(){ return currentDungeon().enemies[state.battle]; }
  function currentAttack(){
    const e=currentEnemy();
    return e.attacks[state.turn % e.attacks.length];
  }

  function calcDamage(){
    const [a,b,c0]=state.dice;
    if(!a || !b || !c0) return null;
    const weapon=equippedItem("weapon");
    let c=c0;
    let skill="";

    if(weapon?.id==="adversity_blade" && c===1){
      c=6;
      skill="反転";
    }

    const dicePart=(a+b)*c;
    let dmg=dicePart+state.atk;

    if(weapon?.id==="flame_dragon" && c===6){
      dmg+=dicePart;
      skill="龍炎";
    }
    if(weapon?.id==="triple_star" && a===b && b===c && c<6){
      dmg=Math.round(dmg*2.5);
      skill="TRIPLE";
    }
    if(weapon?.id==="fate_eater" && a===b){
      dmg=Math.round(dmg*1.5);
      skill="DOUBLE";
    }
    if(weapon?.id==="heavenly_greatsword" && a>=4 && b>=4 && c>=4){
      dmg=Math.round(dmg*2);
      skill="HIGH ROLL";
    }
    if(weapon?.id==="divine_dice_sword" && ["123","234","345","456"].includes(`${a}${b}${c}`)){
      dmg=Math.round(dmg*3);
      skill="DIVINE STRAIGHT";
    }

    if(a===6 && b===6 && c0===6){
      dmg=Math.round(dmg*1.5);
      skill=skill ? `${skill} + 666` : "CRITICAL 666";
    }
    dmg=Math.round(dmg*momentumMultiplier());
    if(state?.blessings?.fury) dmg+=state.blessings.fury;
    state.lastSkill=skill;
    return dmg;
  }

  function rawDiceDamage(){
    const [a,b,c0]=state.dice;
    if(!a || !b || !c0) return null;
    const weapon=equippedItem("weapon");
    const c=(weapon?.id==="adversity_blade" && c0===1)?6:c0;
    return (a+b)*c;
  }

  function renderReadyDamage(){
    const box=$("#readyDamage");
    const num=$("#readyDamageNumber");
    const dmg=calcDamage();
    if(!box || !num) return;
    if(dmg===null){
      box.classList.remove("show","armed");
      num.textContent="0";
      return;
    }
    num.textContent=dmg;
    box.classList.add("show","armed");
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
    const shownEnemyAtk=currentAttack();
    $("#nextAttack").textContent=shownEnemyAtk;
    if($("#enemyIntent")) $("#enemyIntent").textContent=enemyIntent(e,state.turn);
    const battleEl=$("#battle");
    if(battleEl) battleEl.dataset.stage=state.dungeonId;
    battleEl?.classList.toggle("boss-battle",!!e.boss || state.battle===4);
    const projected=Math.max(1,shownEnemyAtk-state.def-(state?.blessings?.guard||0));
    const ratio=projected/Math.max(1,state.hp);
    const danger=ratio>=1?"deadly":ratio>=.60?"high":ratio>=.32?"mid":"low";
    if(battleEl) battleEl.dataset.danger=danger;
    const dangerLabel=$("#dangerLabel");
    if(dangerLabel) dangerLabel.textContent=danger==="deadly"?"DANGER!":danger==="high"?"HIGH":danger==="mid"?"CAUTION":"WATCH";

    const enemyPct=Math.max(0,state.enemyHp/e.hp);
    $("#enemyHpText").textContent=`${Math.max(0,state.enemyHp)} / ${e.hp}`;
    $("#enemyHpFill").style.width=`${enemyPct*100}%`;
    $("#enemyHpFill").style.background=`linear-gradient(90deg,${hpColor(enemyPct)},${hpColor(enemyPct)})`;

    const playerPct=Math.max(0,state.hp/state.maxHp);
    $("#playerHpText").textContent=`${Math.max(0,state.hp)} / ${state.maxHp}`;
    $("#playerHpFill").style.width=`${playerPct*100}%`;

    $("#runAtk").textContent=state.atk;
    $("#runDef").textContent=state.def;
    if($("#runTrait")) $("#runTrait").textContent=currentRunBlessing();
    renderDice();
    renderReadyDamage();

    const [a,b,c]=state.dice;
    const weapon=equippedItem("weapon");
    const cText=(weapon?.id==="adversity_blade" && c===1) ? "1→6" : (c??"?");
    const mm=momentumMultiplier();
    $("#formula").textContent=`( ${a??"?"} + ${b??"?"} ) × ${cText} + ATK ${state.atk}${mm>1?` ×MOM ${mm.toFixed(2)}`:""}`;

    const dmg=calcDamage();
    const skillText=$("#activeSkillText");
    if(skillText) skillText.textContent=state.lastSkill||weapon?.skill||"NONE";
    const momentum=$("#momentumText");
    if(momentum){
      const r=state.momentum||0;
      momentum.textContent=r>=4?"OVERDRIVE":r>=3?"FEVER":r>=2?"HOT":r>=1?"CHAIN":"READY";
      momentum.dataset.level=String(r);
    }
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
      $("#attackBtn").textContent="攻撃する！";
      $("#attackBtn").classList.remove("roll-mode");
      $("#attackBtn").classList.add("attack-mode");
      $("#instruction").textContent="ダメージ確定！攻撃！";
    }else{
      forecast.textContent="";
      forecast.className="forecast";
      ghost.style.left="100%";
      ghost.style.width="0";
      hpbar.classList.remove("kill-preview");
      $("#attackBtn").disabled=busy;
      $("#attackBtn").textContent=busy ? "ROLLING…" : "サイコロを振る！";
      $("#attackBtn").classList.add("roll-mode");
      $("#attackBtn").classList.remove("attack-mode");
      if(state.nextDie===0) $("#instruction").textContent="下のボタンでROLL！";
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
      enemyHp:0,
      momentum:0,
      lastSkill:"",
      indomitableUsed:false,
      aegisUsed:false,
      fateArmorUsed:false,
      phoenixUsed:false,
      forceThirdSix:false,
      blessings:{fury:0,guard:0,vital:0,fortune:0},
      turnsTaken:0,bestHit:0,combo:0,maxCombo:0
    };
    save.lifetime.totalRuns=(save.lifetime.totalRuns||0)+1;
    persist();
    loadEnemy();
    show("battle");
  }

  function showBossIntro(enemy){
    document.querySelector("#bossIntroV2")?.remove();
    const layer=document.createElement("div");
    layer.id="bossIntroV2";
    layer.innerHTML=`<small>WARNING</small><b>BOSS BATTLE</b><strong>${enemy.name}</strong>`;
    document.body.appendChild(layer);
    try{if(navigator.vibrate) navigator.vibrate([20,20,55])}catch(_){}
    setTimeout(()=>layer.classList.add("show"),30);
    setTimeout(()=>{layer.classList.add("out");setTimeout(()=>layer.remove(),260)},1050);
  }

  function loadEnemy(){
    const e=currentEnemy();
    state.turn=0;
    state.enemyHp=e.hp;
    state.dice=[null,null,null];
    state.nextDie=0;
    state.lastSkill="";
    state.indomitableUsed=false;
    state.aegisUsed=false;
    state.fateArmorUsed=false;
    busy=false;

    // Purification now has a real battle-start benefit until debuffs arrive.
    if(equippedItem("armor")?.id==="purification"){
      state.hp=Math.min(state.maxHp,state.hp+Math.ceil(state.maxHp*.10));
    }

    $("#enemyArt").classList.remove("dead","hit");
    renderBattle();
    if(e.boss) showBossIntro(e);
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
    let value=1+Math.floor(Math.random()*6);
    if(index===2 && state.forceThirdSix){
      value=6;
      state.forceThirdSix=false;
      state.lastSkill="AEGIS";
    }else if(index===2 && state?.blessings?.fortune){
      const chance=Math.min(.30,state.blessings.fortune*.08);
      if(Math.random()<chance && value<6) value++;
    }
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

  function faceColorClass(value){
    return `face-${Math.max(1,Math.min(6,value||1))}`;
  }

  async function showEquationImpact(step, a, b=null, c=null){
    const box=$("#equationImpact");
    const text=$("#equationText");
    const sub=$("#equationSub");

    let markup="";
    if(step===1){
      markup=`<span class="eq-num ${faceColorClass(a)}">${a}</span><span class="eq-bang">!</span>`;
      sub.textContent="FIRST";
    }else if(step===2){
      markup=`<span class="eq-num ${faceColorClass(a)}">${a}</span><span class="eq-op">＋</span><span class="eq-num ${faceColorClass(b)}">${b}</span><span class="eq-bang">!</span>`;
      sub.textContent="SECOND";
    }else{
      markup=`<span class="eq-num ${faceColorClass(a)}">${a}</span><span class="eq-op">＋</span><span class="eq-num ${faceColorClass(b)}">${b}</span><span class="eq-op mult">×</span><span class="eq-num ${faceColorClass(c)} hot">${c}</span><span class="eq-bang">!</span>`;
      sub.textContent=`( ${a} + ${b} ) × ${c}`;
    }

    text.innerHTML=markup;
    box.className=`equation-impact show step-${step} ${step===3?faceColorClass(c):faceColorClass(step===1?a:b)}`;

    document.body.classList.remove("eq-hit-1","eq-hit-2","eq-hit-3");
    void document.body.offsetWidth;
    document.body.classList.add(`eq-hit-${step}`);

    try{
      if(navigator.vibrate){
        navigator.vibrate(step===3 ? [24,18,42] : step===2 ? 24 : 16);
      }
    }catch(_){}

    await wait(step===3 ? 520 : 330);
    box.className="equation-impact";
    document.body.classList.remove(`eq-hit-${step}`);
  }

  async function showAttackAddition(raw, atk, total){
    const box=$("#attackCalcImpact");
    const text=$("#attackCalcText");
    const label=$("#attackCalcLabel");

    text.innerHTML=`
      <span class="calc-raw">${raw}</span>
      <span class="calc-plus">＋</span>
      <span class="calc-atk">ATK ${atk}</span>
    `;
    label.textContent="ATTACK BONUS";
    box.className="attack-calc-impact show add";
    try{ if(navigator.vibrate) navigator.vibrate(22); }catch(_){}
    await wait(520);

    text.innerHTML=`
      <span class="calc-eq">＝</span>
      <span class="calc-total">${total}</span>
    `;
    label.textContent="FINAL DAMAGE";
    box.className="attack-calc-impact show total";
    try{ if(navigator.vibrate) navigator.vibrate([25,18,45]); }catch(_){}
    await wait(650);

    box.className="attack-calc-impact";
  }

  function attackTier(dmg){
    if(dmg>=90) return "critical";
    if(dmg>=55) return "strong";
    return "normal";
  }

  async function playSlotRushPrelude(dmg, lethal=false){
    const tier=attackTier(dmg);
    document.querySelector("#slotRushPrelude")?.remove();
    const layer=document.createElement("div");
    layer.id="slotRushPrelude";
    layer.className=`rush-${tier}${lethal?" rush-lethal":""}`;
    const title=lethal?"FINISH CHANCE":tier==="critical"?"OVER DRIVE":tier==="strong"?"BURST ATTACK":"ATTACK";
    const sub=lethal?"決着の一撃":tier==="critical"?"MAXIMUM IMPACT":tier==="strong"?"POWER CHARGE":"LOCK ON";
    layer.innerHTML=`
      <div class="rush-vignette"></div>
      <div class="rush-speedlines"></div>
      <div class="rush-band band1"></div><div class="rush-band band2"></div>
      <div class="rush-title"><small>${sub}</small><strong>${title}</strong></div>
      <div class="rush-count"><span>3</span><span>2</span><span>1</span></div>
    `;
    document.body.appendChild(layer);
    FX.attackFanfare(dmg,lethal);
    try{if(navigator.vibrate) navigator.vibrate(tier==="critical"||lethal?[10,55,10,55,16]:[10,45,10])}catch(_){}
    await wait(tier==="critical"||lethal?410:tier==="strong"?315:205);
    layer.classList.add("rush-release");
    await wait(90);
    layer.remove();
  }

  async function playAttackJuice(dmg, lethal=false){
    document.querySelector("#attackJuice")?.remove();
    const tier=attackTier(dmg);
    const layer=document.createElement("div");
    layer.id="attackJuice";
    layer.className=`tier-${tier}${lethal?" lethal":""}`;

    const sparks=Array.from({length:tier==="critical"?24:tier==="strong"?18:14},(_,i)=>{
      const a=Math.round(i*(360/(tier==="critical"?24:tier==="strong"?18:14)));
      const len=44+(i%5)*11;
      return `<i style="--a:${a}deg;--len:${len}px;--d:${(i%4)*12}ms"></i>`;
    }).join("");

    layer.innerHTML=`
      <div class="impact-vignette"></div>
      <div class="impact-aura"></div>
      <div class="impact-cross cross-a"></div>
      <div class="impact-cross cross-b"></div>
      <div class="impact-ring ring-a"></div>
      <div class="impact-ring ring-b"></div>
      <div class="impact-sparks">${sparks}</div>
      <div class="impact-kanji">${lethal?"撃破":tier==="critical"?"激震":tier==="strong"?"炸裂":"衝撃"}</div>
      <div class="impact-number">${dmg}</div>
      <div class="impact-word">${lethal?"FINISH!!":tier==="critical"?"CRUSH!!":tier==="strong"?"SMASH!!":"HIT!"}</div>
      <div class="impact-bonus">${tier==="critical"?"MAXIMUM!!":tier==="strong"?"EXCELLENT!":""}</div>
    `;
    document.body.appendChild(layer);

    const stage=document.querySelector(".enemy-stage");
    const art=document.querySelector("#enemyArt");
    const battle=document.querySelector("#battle");
    stage?.classList.remove("attack-hit-v8");
    art?.classList.remove("attack-knock-v8");
    battle?.classList.remove("attack-screen-v8");
    void stage?.offsetWidth;
    stage?.classList.add("attack-hit-v8");
    art?.classList.add("attack-knock-v8");
    battle?.classList.add("attack-screen-v8");

    FX.playerImpact(dmg,lethal);
    try{
      if(navigator.vibrate){
        navigator.vibrate(
          lethal ? [26,16,54,26,85] :
          tier==="critical" ? [24,14,48,20,70] :
          tier==="strong" ? [20,12,42] : [16,10,26]
        );
      }
    }catch(_){}

    // very short hit-stop: the frame "sticks" at contact instead of flashing white
    document.body.classList.add("impact-hitstop");
    await wait(tier==="critical"||lethal ? 92 : tier==="strong" ? 72 : 54);
    document.body.classList.remove("impact-hitstop");

    await wait(tier==="critical"||lethal ? 500 : tier==="strong" ? 410 : 330);
    stage?.classList.remove("attack-hit-v8");
    art?.classList.remove("attack-knock-v8");
    battle?.classList.remove("attack-screen-v8");
    layer.remove();
  }

  async function launchDamageToEnemy(dmg){
    const source=$("#readyDamageNumber");
    const enemy=$("#enemyArt");
    if(!source || !enemy) return;

    const lethal=dmg>=state.enemyHp;
    const tier=attackTier(dmg);
    const sr=source.getBoundingClientRect();
    const er=enemy.getBoundingClientRect();

    // pachislot-inspired "期待 -> 解放" beat before the projectile launches
    await playSlotRushPrelude(dmg,lethal);

    // anticipation: compress the damage number for one beat before releasing it
    $("#readyDamage")?.classList.add("attack-primed",`tier-${tier}`);
    FX.attackCharge(dmg);
    try{ if(navigator.vibrate) navigator.vibrate(tier==="critical"?18:12); }catch(_){}
    await wait(tier==="critical"?155:tier==="strong"?125:105);

    const flyer=document.createElement("div");
    flyer.className=`damage-flyer-v8 tier-${tier}${lethal?" lethal":""}`;
    flyer.innerHTML=`<span>${dmg}</span><b></b>`;
    flyer.style.left=`${sr.left + sr.width/2}px`;
    flyer.style.top=`${sr.top + sr.height/2}px`;
    document.body.appendChild(flyer);

    const sx=sr.left+sr.width/2, sy=sr.top+sr.height/2;
    const tx=er.left+er.width/2, ty=er.top+er.height*.48;
    const dx=tx-sx, dy=ty-sy;
    const arcY=Math.min(-62,dy*.20-34);

    $("#readyDamage")?.classList.add("launching");
    await wait(22);

    // two-stage arc: lift, then accelerate violently into the monster
    flyer.style.transform=`translate(${dx*.28}px, ${dy*.28+arcY}px) scale(${tier==="critical"?1.20:1.10}) rotate(-5deg)`;
    await wait(105);
    flyer.classList.add("dash");
    flyer.style.transform=`translate(${dx}px, ${dy}px) scale(.54) rotate(2deg)`;
    await wait(tier==="critical"?245:tier==="strong"?225:205);

    flyer.classList.add("contact");
    await playAttackJuice(dmg,lethal);

    flyer.remove();
    $("#readyDamage")?.classList.remove("launching","attack-primed","tier-normal","tier-strong","tier-critical");
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

    const dice=$$(".die");

    $("#instruction").textContent="1st ROLL";
    const a=await animateOneDie(0,dice[0],false,0);
    await showEquationImpact(1,a);

    await wait(90);
    $("#instruction").textContent="2nd ROLL";
    const b=await animateOneDie(1,dice[1],false,0);
    await showEquationImpact(2,a,b);

    state.nextDie=2;
    const sum=$("#sumBurst");
    sum.textContent=`${a} + ${b} = ${a+b}`;
    sum.className="sum-burst show";
    FX.attack(false);
    setTimeout(()=>sum.className="sum-burst",520);

    // The multiplier gets its own suspense beat.
    $("#instruction").textContent="倍率チャージ…";
    $("#multRollBtn").classList.add("charge","auto-wait");
    document.body.classList.add("mult-focus","mult-charge-screen");
    await wait(480);

    $("#multRollBtn").classList.remove("charge");
    $("#instruction").textContent="MULTIPLIER!";
    const c=await animateOneDie(2,dice[2],true,0);
    state.nextDie=3;

    $("#multRollBtn").classList.remove("auto-wait");
    document.body.classList.remove("mult-charge-screen");

    // Third die gets sound/weight only. Do NOT layer the old giant multiplier
    // overlay over the completed equation.
    FX.multiplier(c);
    $("#multFx").className="";
    $("#sumBurst").className="sum-burst";

    // Final die: show one clean completed equation, and nothing on top of it.
    await showEquationImpact(3,a,b,c);

    // Then explicitly add ATK and reveal the final damage.
    const raw=(a+b)*c;
    const total=calcDamage();
    await showAttackAddition(raw,state.atk,total);

    if(state.dice.every(v=>v===6)){
      await wait(80);
      $("#critical").classList.remove("hidden");
      FX.critical666();
      document.body.classList.add("critical-flash");
      await wait(760);
      document.body.classList.remove("critical-flash");
      $("#critical").classList.add("hidden");
    }

    document.body.classList.remove("mult-focus");
    busy=false;
    renderBattle();
  }

  async function attack(){
    const dmg=calcDamage();
    if(busy || dmg===null) return;
    if(state.lastSkill){
      const r=equippedItem("weapon")?.rarity?.toLowerCase()||"epic";
      FX.skillProc(r);
    }
    busy=true;
    renderBattle();

    // Keep the confirmed damage on screen, then fire that exact number into the enemy.
    await launchDamageToEnemy(dmg);

    const before=state.enemyHp;
    state.enemyHp=Math.max(0,before-dmg);
    save.lifetime.bestDamage=Math.max(save.lifetime.bestDamage||0,dmg);
    state.bestHit=Math.max(state.bestHit||0,dmg);
    state.turnsTaken=(state.turnsTaken||0)+1;
    if(dmg>=60) state.combo=(state.combo||0)+1; else state.combo=0;
    state.maxCombo=Math.max(state.maxCombo||0,state.combo||0);
    save.lifetime.maxCombo=Math.max(save.lifetime.maxCombo||0,state.maxCombo||0);

    // Momentum rewards repeated strong turns and creates visible escalation.
    if(dmg>=100) state.momentum=Math.min(4,(state.momentum||0)+2);
    else if(dmg>=60) state.momentum=Math.min(4,(state.momentum||0)+1);
    else state.momentum=Math.max(0,(state.momentum||0)-1);

    // LUCKY SIX: heal immediately when multiplier die is 6.
    if(equippedItem("armor")?.id==="gambler_cloak" && state.dice[2]===6){
      state.hp=Math.min(state.maxHp,state.hp+Math.ceil(state.maxHp*.15));
      state.lastSkill="LUCKY SIX";
    }

    $("#damageFx").textContent=dmg;
    $("#damageFx").className="show-damage impact-only";
    $("#slashFx").className="show-slash";
    document.body.classList.add(dmg>=45?"big-shake":"shake");
    const art=$("#enemyArt");
    art.classList.remove("hit");
    void art.offsetWidth;
    art.classList.add("hit");
    renderBattle();

    await wait(460);
    $("#damageFx").className="";
    $("#slashFx").className="";
    document.body.classList.remove("shake","big-shake");

    if(state.enemyHp<=0){
      save.lifetime.kills=(save.lifetime.kills||0)+1;
      if(currentEnemy().boss) save.lifetime.bossKills=(save.lifetime.bossKills||0)+1;
      persist();
      $("#killFx").className="show-kill";
      art.classList.add("dead");
      FX.killStinger();
      await wait(1050);
      $("#killFx").className="";
      await winBattle();
      busy=false;
      return;
    }

    await wait(180);
    const incoming=Math.max(1,currentAttack()-state.def-(state?.blessings?.guard||0));
    const armor=equippedItem("armor");
    const fatal=incoming>=state.hp;

    if(fatal && armor?.id==="aegis" && !state.aegisUsed){
      state.aegisUsed=true;
      state.forceThirdSix=true;
      state.lastSkill="AEGIS";
      state.momentum=Math.min(4,(state.momentum||0)+1);
    }else if(fatal && armor?.id==="fate_armor" && !state.fateArmorUsed){
      state.fateArmorUsed=true;
      state.hp-=Math.max(1,Math.floor(incoming*.5));
      state.lastSkill="運命改変";
    }else if(fatal && armor?.id==="indomitable" && !state.indomitableUsed){
      state.indomitableUsed=true;
      state.hp=1;
      state.lastSkill="不屈";
    }else{
      state.hp-=incoming;
    }

    FX.enemyAttack();
    document.body.classList.add("shake");
    await wait(260);
    document.body.classList.remove("shake");
    state.turn++;

    if(state.hp<=0 && armor?.id==="phoenix_armor" && !state.phoenixUsed){
      state.phoenixUsed=true;
      state.hp=Math.ceil(state.maxHp*.5);
      state.lastSkill="REBIRTH";
      state.momentum=4;
      const revive=document.createElement("div");
      revive.className="revive-v2";
      revive.innerHTML="<small>LEGENDARY SKILL</small><b>REBIRTH</b><strong>HP 50% 復活</strong>";
      document.body.appendChild(revive);
      setTimeout(()=>revive.remove(),1050);
      try{if(navigator.vibrate) navigator.vibrate([25,20,65])}catch(_){}
    }

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
    renderRewardChoices();
    show("reward");
  }

  const RUN_REWARDS={
    heal:{icon:"❤️",name:"生命の雫",desc:"最大HPの35%回復",tag:"RECOVER",cls:"reward-heal",tier:"NORMAL"},
    gold:{icon:"🪙",name:"黄金の祝福",desc:"追加で80G獲得",tag:"BONUS",cls:"reward-gold",tier:"NORMAL"},
    fury:{icon:"⚔️",name:"烈火の加護",desc:"このラン中 全攻撃 +6",tag:"FURY",cls:"reward-atk",tier:"RARE"},
    guard:{icon:"🛡️",name:"鉄壁の加護",desc:"このラン中 被ダメージ -4",tag:"GUARD",cls:"reward-def",tier:"RARE"},
    vital:{icon:"💎",name:"生命覚醒",desc:"最大HP +18 & HP18回復",tag:"VITAL",cls:"reward-vital",tier:"EPIC"},
    fortune:{icon:"🎲",name:"幸運の骰子",desc:"③の出目が上振れする確率UP",tag:"FORTUNE",cls:"reward-fortune",tier:"EPIC"},
    momentum:{icon:"🔥",name:"闘気解放",desc:"次戦をMOMENTUM HOTで開始",tag:"HOT START",cls:"reward-momentum",tier:"LEGENDARY"}
  };

  function weightedRewardKeys(){
    const entries=Object.entries(RUN_REWARDS), weight={NORMAL:30,RARE:20,EPIC:10,LEGENDARY:3}, picked=[];
    while(picked.length<3){
      const pool=entries.filter(([k])=>!picked.includes(k));
      let roll=Math.random()*pool.reduce((s,[,r])=>s+(weight[r.tier]||1),0);
      let chosen=pool[0][0];
      for(const [k,r] of pool){ roll-=weight[r.tier]||1; if(roll<=0){chosen=k;break;} }
      picked.push(chosen);
    }
    return picked;
  }

  function renderRewardChoices(){
    const grid=$("#rewardChoices"); if(!grid) return;
    grid.innerHTML=weightedRewardKeys().map(k=>{
      const r=RUN_REWARDS[k];
      return `<button class="reward ${r.cls} reward-tier-${r.tier.toLowerCase()}" data-reward="${k}">
        <span class="reward-rarity-tag">${r.tier}</span>
        <span class="reward-icon">${r.icon}</span>
        <span class="reward-copy"><b>${r.name}</b><span>${r.desc}</span></span>
        <em>${r.tag}</em>
      </button>`;
    }).join("");
    grid.querySelectorAll("[data-reward]").forEach(b=>b.addEventListener("click",()=>chooseReward(b.dataset.reward)));
  }

  async function chooseReward(kind){
    const chosen=document.querySelector(`[data-reward="${kind}"]`);
    document.querySelectorAll("#rewardChoices .reward").forEach(x=>x.disabled=true);
    chosen?.classList.add("reward-chosen"); FX.reward(); await wait(330);
    if(kind==="heal") state.hp=Math.min(state.maxHp,state.hp+Math.ceil(state.maxHp*.35));
    if(kind==="gold") state.runGold+=80;
    if(kind==="fury") state.blessings.fury=(state.blessings.fury||0)+6;
    if(kind==="guard") state.blessings.guard=(state.blessings.guard||0)+4;
    if(kind==="vital"){ state.blessings.vital=(state.blessings.vital||0)+1; state.maxHp+=18; state.hp=Math.min(state.maxHp,state.hp+18); }
    if(kind==="fortune") state.blessings.fortune=(state.blessings.fortune||0)+1;
    if(kind==="momentum") state.momentum=Math.max(2,state.momentum||0);
    state.battle++; loadEnemy(); show("battle");
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

    const r=Math.random();
    const mult=r<.05?5:r<.18?3:r<.48?2:r<.72?1.5:1;

    btn.classList.add("opened",mult>=3?"jackpot":"");
    btn.innerHTML=`×${mult}<span>${mult===5?"JACKPOT!!":"BONUS"}</span>`;
    if(mult>=3){
      FX.jackpot?.(mult);
      document.body.classList.add("boss-jackpot");
      try{if(navigator.vibrate) navigator.vibrate(mult===5?[35,25,80,30,110]:[28,20,70])}catch(_){}
      setTimeout(()=>document.body.classList.remove("boss-jackpot"),950);
    }
    $$(".box").forEach(b=>b.disabled=true);

    const runGold=state.runGold;
    const total=Math.round(runGold*mult);

    save.gold+=total;
    save.clears[state.dungeonId]=(save.clears[state.dungeonId]||0)+1;
    const nextUnlock={"1-1":"1-2","1-2":"1-3","1-3":"1-4"}[state.dungeonId];
    if(nextUnlock && !save.unlocked.includes(nextUnlock)) save.unlocked.push(nextUnlock);
    const record=save.records[state.dungeonId] || {bestRunGold:0};
    record.bestRunGold=Math.max(record.bestRunGold,total);
    save.records[state.dungeonId]=record;
    const hpRatio=state.hp/Math.max(1,state.maxHp), turns=state.turnsTaken||99;
    const stars=(hpRatio>=.70 && turns<=12)?3:(hpRatio>=.35 && turns<=18)?2:1;
    save.mastery[state.dungeonId]=Math.max(save.mastery[state.dungeonId]||0,stars);
    persist();

    lastClear={runGold,mult,total,dungeonId:state.dungeonId,stars,bestHit:state.bestHit||0,turns,hpRatio};
    $("#bossResult").innerHTML=`<strong>×${mult}</strong><span>${total}G GET!</span>`;

    setTimeout(()=>{
      $("#resultRunGold").textContent=`${runGold}G`;
      $("#resultMultiplier").textContent=`×${mult}`;
      $("#resultTotalGold").textContent=`${total}G`;
      if($("#resultBestHit")) $("#resultBestHit").textContent=state.bestHit||0;
      const grade=stars===3?"S":stars===2?"A":"B";
      if($("#clearGradeLetter")) $("#clearGradeLetter").textContent=grade;
      if($("#clearGradeText")) $("#clearGradeText").textContent=grade==="S"?"DOMINATING CLEAR":grade==="A"?"GREAT RUN":"HARD FOUGHT";
      $("#clearGrade")?.setAttribute("data-grade",grade);
      const nextUnlock={"1-1":"1-2","1-2":"1-3","1-3":"1-4"}[state.dungeonId];
      const nextBtn=$("#resultNext");
      if(nextBtn){ nextBtn.hidden=!nextUnlock; nextBtn.dataset.dungeon=nextUnlock||""; nextBtn.textContent=nextUnlock?`${nextUnlock}へ進む`:""; }
      show("runResult");
    },850);
  }

  function finishDefeat(){
    const earned=state.runGold;
    save.gold+=earned;
    save.lifetime.deaths=(save.lifetime.deaths||0)+1;
    persist();
    $("#deathGold").textContent=`${earned}G`;
    if($("#deathReached")) $("#deathReached").textContent=`BATTLE ${state.battle+1} / 5`;
    if($("#deathBestHit")) $("#deathBestHit").textContent=state.bestHit||0;
    show("gameover");
  }

  function retryCurrentDungeon(){
    selectedDungeonId=state?.dungeonId||selectedDungeonId;
    startRun();
  }

  function returnHome(){
    state=null;
    busy=false;
    document.body.classList.remove("mult-dim","shake","big-shake");
    renderHome();
    show("home");
  }

  let devTapCount=0, devTapTimer=null, devHoldTimer=null;
  function openDevMode(){
    devTapCount=0;
    clearTimeout(devTapTimer);
    clearTimeout(devHoldTimer);
    try{ if(navigator.vibrate) navigator.vibrate([35,30,80]); }catch(_){}
    const dev=$("#devMode");
    dev?.classList.remove("hidden");
    show("devMode");
    dev?.classList.add("active");
  }
  function devTap(){
    devTapCount++;
    clearTimeout(devTapTimer);
    devTapTimer=setTimeout(()=>devTapCount=0,5000);
    if(devTapCount>=10) openDevMode();
  }
  function devHoldStart(){
    clearTimeout(devHoldTimer);
    devHoldTimer=setTimeout(openDevMode,2000);
  }
  function devHoldCancel(){
    clearTimeout(devHoldTimer);
  }
  function giveAllItems(){
    for(const slot of ["weapon","armor"]){
      Object.values(EQUIPMENT[slot]).forEach(item=>{
        if(!save.inventory[slot].includes(item.id)) save.inventory[slot].push(item.id);
        save.duplicates[item.id]=Math.max(save.duplicates[item.id]||0,1);
      });
    }
  }
  function devAction(type){
    if(type==="gold") save.gold+=10000;
    if(type==="unlock") save.unlocked=["1-1","1-2","1-3","1-4"];
    if(type==="items") giveAllItems();
    if(type==="god"){
      save.gold+=10000; persist(); renderHome(); openGacha();
      const gods=allEquipment().filter(x=>x.item.rarity==="GOD");
      const result=gods[Math.floor(Math.random()*gods.length)];
      pendingGacha={tier:"epic",result,finalRarity:"GOD",currentRarity:"EPIC"};
      $("#gachaGold").textContent=save.gold; $("#gachaResult").classList.add("hidden"); $("#gachaTheater")?.classList.remove("hidden");
      $("#gachaPrompt").textContent="DEV GOD TEST — CHESTをタップ"; setChestRarity("EPIC"); $("#gachaChest")?.classList.add("ready"); return;
    }
    persist(); renderHome();
  }

  $$(".upgrade-card").forEach(b=>b.addEventListener("click",()=>buyUpgrade(b.dataset.upgrade)));
  $("#upgradeEntry").addEventListener("click",()=>{renderHome();show("upgrade");});
  $("#upgradeBack").addEventListener("click",()=>{renderHome();show("home");});
  $("#gachaEntry").addEventListener("click",openGacha);
  $("#gachaBack").addEventListener("click",()=>{renderHome();show("home");});
  $("#gachaInfoEntry")?.addEventListener("click",()=>{renderGachaMeta(); if($("#gachaInfoGold")) $("#gachaInfoGold").textContent=save.gold; show("gachaInfo");});
  $("#gachaInfoBack")?.addEventListener("click",()=>show("gacha"));
  $("#dungeonEntry")?.addEventListener("click",()=>{renderHome();show("dungeonSelect");});
  $("#dungeonBack")?.addEventListener("click",()=>{renderHome();show("home");});
  $("#recordEntry")?.addEventListener("click",()=>{renderHome();show("records");});
  $("#recordBack")?.addEventListener("click",()=>{renderHome();show("home");});
  $$(".gacha-pull").forEach(b=>b.addEventListener("click",()=>pullGacha(b.dataset.tier)));
  $("#gachaChest")?.addEventListener("click",gachaChestTap);
  const devTarget=$("#devTapTarget");
  if(devTarget){
    devTarget.addEventListener("click",devTap);
    devTarget.addEventListener("touchstart",devHoldStart,{passive:true});
    devTarget.addEventListener("touchend",devHoldCancel,{passive:true});
    devTarget.addEventListener("touchcancel",devHoldCancel,{passive:true});
    devTarget.addEventListener("pointerdown",devHoldStart);
    devTarget.addEventListener("pointerup",devHoldCancel);
    devTarget.addEventListener("pointercancel",devHoldCancel);
  }
  $$(".dev-action").forEach(b=>b.addEventListener("click",()=>devAction(b.dataset.dev)));
  $$(".dungeon-card[data-dungeon]").forEach(card=>card.addEventListener("click",()=>{
    const id=card.dataset.dungeon;
    if(!save.unlocked.includes(id)) return;
    selectedDungeonId=id;
    renderHome();
  }));
  $("#equipmentEntry").addEventListener("click",()=>{equipmentPage=0;openEquipment("weapon",0);});
  $("#weaponTab").addEventListener("click",()=>{equipmentPage=0;openEquipment("weapon",0);});
  $("#armorTab").addEventListener("click",()=>{equipmentPage=0;openEquipment("armor",0);});
  $("#equipmentBack").addEventListener("click",()=>{renderHome();show("home");});
  $("#equipPrev")?.addEventListener("click",()=>openEquipment($("#equipment").dataset.slot||"weapon",equipmentPage-1));
  $("#equipNext")?.addEventListener("click",()=>openEquipment($("#equipment").dataset.slot||"weapon",equipmentPage+1));
  $("#startBtn").addEventListener("click",startRun);
  $("#attackBtn").addEventListener("click",()=>{
    if(busy) return;
    if(calcDamage()===null) rollPair();
    else attack();
  });
  $$(".box").forEach(b=>b.addEventListener("click",()=>chooseBox(b)));
  $("#deathHome").addEventListener("click",returnHome);
  $("#deathRetry")?.addEventListener("click",retryCurrentDungeon);
  $("#resultRetry")?.addEventListener("click",retryCurrentDungeon);
  $("#resultNext")?.addEventListener("click",()=>{
    const id=$("#resultNext")?.dataset.dungeon;
    if(id && save.unlocked.includes(id)){ selectedDungeonId=id; startRun(); }
  });
  $("#resultHome").addEventListener("click",returnHome);

  recalcBase();
  persist();
  renderHome();

  $("#forgeBtn")?.addEventListener("click",()=>synthesizeSelected());

  async function playRarityCutInV4(rarity){
    const o=$("#rarityCinematic"), box=$("#rarityLetters"), final=$("#rarityFinal");
    if(!o||!box||!final) return;
    rarity=String(rarity||"RARE").toUpperCase();
    o.dataset.rarity=rarity; box.innerHTML=""; final.textContent=rarity;
    [...rarity].forEach((c,i)=>{const s=document.createElement("span");s.textContent=c;s.style.setProperty("--i",i);box.appendChild(s);});
    o.classList.remove("hidden","play"); void o.offsetWidth; o.classList.add("play");
    await wait(2100+rarity.length*135);
    o.classList.add("hidden"); o.classList.remove("play");
  }

})();
