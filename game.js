(() => {
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const screens=$$('.screen');
const base={maxHp:75,atk:12,def:4};
const enemies=[
 {name:'ゴブリン',emoji:'👺',hp:48,attacks:[8,10,12],gold:25,lv:1},
 {name:'ゴブリン弓兵',emoji:'🏹',hp:58,attacks:[8,8,16],gold:35,lv:2},
 {name:'ゴブリン戦士',emoji:'👹',hp:82,attacks:[12,14,14],gold:45,lv:3},
 {name:'ゴブリン隊長',emoji:'🪓',hp:105,attacks:[12,16,24],gold:60,lv:4},
 {name:'ゴブリンキング',emoji:'👑',hp:155,attacks:[12,18,12,35],gold:120,lv:5,boss:true}
];
let bank=Number(localStorage.getItem('diceRpgGold')||0);
let state={};
function show(id){screens.forEach(x=>x.classList.toggle('active',x.id===id));scrollTo(0,0)}
function save(){localStorage.setItem('diceRpgGold',String(bank));$('#bankGold').textContent=bank}
function newRun(){state={hp:base.maxHp,maxHp:base.maxHp,atk:base.atk,def:base.def,runGold:0,battle:0,turn:0,dice:[null,null,null],nextDie:0,enemyHp:0};loadEnemy();show('battle')}
function loadEnemy(){const e=enemies[state.battle];state.turn=0;state.enemyHp=e.hp;state.dice=[null,null,null];state.nextDie=0;renderBattle()}
function currentAttack(){const e=enemies[state.battle];return e.attacks[state.turn%e.attacks.length]}
function renderBattle(){
 const e=enemies[state.battle];
 $('#battleNo').textContent=`BATTLE ${state.battle+1}/5`;
 $('#runGold').textContent=state.runGold;
 $('#enemyEmoji').textContent=e.emoji; $('#enemyName').textContent=e.name; $('#enemyLv').textContent=`Lv.${e.lv}`;
 $('#enemyHpText').textContent=`${Math.max(0,state.enemyHp)} / ${e.hp}`;
 $('#enemyHpBar').style.width=`${Math.max(0,state.enemyHp/e.hp*100)}%`;
 $('#nextAttack').textContent=currentAttack();
 $('#playerHpText').textContent=`${Math.max(0,state.hp)} / ${state.maxHp}`;
 $('#playerHpBar').style.width=`${Math.max(0,state.hp/state.maxHp*100)}%`;
 $$('.die').forEach((d,i)=>{d.querySelector('span').textContent=state.dice[i]??'?';d.classList.toggle('locked',i!==state.nextDie || state.nextDie>=3)});
 const [a,b,c]=state.dice;
 $('#formula').textContent=`( ${a??'?'} + ${b??'?'} ) × ${c??'?'} + ATK ${state.atk}`;
 if(a&&b&&c){const dmg=(a+b)*c+state.atk;$('#damage').textContent=dmg;$('#critical').classList.toggle('hidden',!(a===6&&b===6&&c===6));$('#attackBtn').disabled=false;$('#instruction').textContent='ダメージ確定！攻撃！'}
 else{$('#damage').textContent='—';$('#critical').classList.add('hidden');$('#attackBtn').disabled=true;$('#instruction').textContent=`${['①','②','③ 倍率'][state.nextDie]}のダイスをタップ！`}
}
function roll(i,btn){
 if(i!==state.nextDie)return;
 btn.classList.add('rolling');btn.disabled=true;
 let ticks=0;
 const timer=setInterval(()=>{btn.querySelector('span').textContent=1+Math.floor(Math.random()*6);if(++ticks>7){clearInterval(timer);const v=1+Math.floor(Math.random()*6);state.dice[i]=v;state.nextDie++;btn.classList.remove('rolling');btn.disabled=false;renderBattle()}},35);
}
function attack(){
 const [a,b,c]=state.dice;if(!a||!b||!c)return;
 let dmg=(a+b)*c+state.atk;
 if(a===6&&b===6&&c===6)dmg=Math.round(dmg*1.5);
 state.enemyHp-=dmg;
 if(state.enemyHp<=0){winBattle();return}
 const incoming=Math.max(1,currentAttack()-state.def);
 state.hp-=incoming;state.turn++;
 if(state.hp<=0){bank+=state.runGold;save();$('#deathGold').textContent=`${state.runGold}G`;show('gameover');return}
 state.dice=[null,null,null];state.nextDie=0;renderBattle();
}
function winBattle(){
 const e=enemies[state.battle];state.runGold+=e.gold;
 if(e.boss){showBossBoxes();return}
 show('reward');
}
function chooseReward(kind){
 if(kind==='heal')state.hp=Math.min(state.maxHp,state.hp+Math.ceil(state.maxHp*.3));
 if(kind==='gold')state.runGold+=40;
 if(kind==='atk')state.atk+=3;
 state.battle++;loadEnemy();show('battle');
}
function showBossBoxes(){
 show('bossReward');$('#bossResult').innerHTML='';$$('.box').forEach(b=>{b.disabled=false;b.classList.remove('opened');b.innerHTML='🎁<span>BOX</span>'})
}
function chooseBox(btn){
 const multipliers=[1,2,3].sort(()=>Math.random()-.5);
 const mult=multipliers[0];
 btn.classList.add('opened');btn.innerHTML=`×${mult}<span>BONUS</span>`;
 $$('.box').forEach(b=>b.disabled=true);
 const total=state.runGold*mult;bank+=total;save();
 $('#bossResult').innerHTML=`獲得 ${state.runGold}G × ${mult}<br><strong>${total}G</strong><br><button id="bossHome" class="primary" style="margin-top:22px">ホームへ</button>`;
 $('#bossHome').addEventListener('click',()=>show('home'));
}
$('#startBtn').addEventListener('click',newRun);
$$('.die').forEach((b,i)=>b.addEventListener('click',()=>roll(i,b)));
$('#attackBtn').addEventListener('click',attack);
$$('.reward').forEach(b=>b.addEventListener('click',()=>chooseReward(b.dataset.reward)));
$$('.box').forEach(b=>b.addEventListener('click',()=>chooseBox(b)));
$('#deathHome').addEventListener('click',()=>show('home'));
save();
})();

// v0.4.1: visually mark the third multiplier die when it is the next die.
(() => {
  function markMultiplier() {
    const dice = [...document.querySelectorAll('.die')];
    if (dice.length < 3) return;
    const third = dice[2];
    const ready = !third.classList.contains('locked') && third.querySelector('span')?.textContent.trim() === '?';
    third.classList.toggle('mult-ready', !!ready);
  }
  const mo = new MutationObserver(markMultiplier);
  mo.observe(document.body,{subtree:true,childList:true,attributes:true,characterData:true});
  markMultiplier();
})();

// ===== v0.4.2 FIXED visual feedback layer =====
(() => {
  const $=s=>document.querySelector(s);
  let lastThird=null, lastEnemyHp=null, scheduled=false;

  function num(txt){ const m=String(txt||"").match(/\d+/); return m?Number(m[0]):null; }
  function diceValues(){
    return [...document.querySelectorAll(".die")].slice(0,3).map(d=>{
      const v=num(d.querySelector("span")?.textContent);
      return v>=1&&v<=6?v:null;
    });
  }
  function enemy(){
    const hpText=$("#enemyHpText"), fill=document.querySelector("#battle .hp-line.enemy .bar > i");
    if(!hpText||!fill)return {};
    const m=hpText.textContent.match(/(\d+)\s*\/\s*(\d+)/);
    return {hp:m?+m[1]:num(hpText.textContent),max:m?+m[2]:null,hpText,fill};
  }
  function atk(){
    if (typeof state !== "undefined" && Number.isFinite(state.atk)) return state.atk;
    const txt=[...document.querySelectorAll("#battle .mini-stat")].map(x=>x.textContent).join(" ");
    const m=txt.match(/ATK\s*(\d+)/i); return m?+m[1]:0;
  }
  function ensureForecast(){
    let f=$("#v042forecast");
    if(!f){
      f=document.createElement("div"); f.id="v042forecast";
      const anchor=document.querySelector("#battle .damage");
      (anchor?.parentElement||document.querySelector("#battle .dice-panel"))?.appendChild(f);
    }
    return f;
  }
  function setClass(el, wanted, pool){
    if(!el)return;
    pool.forEach(c=>{ if(c!==wanted && el.classList.contains(c)) el.classList.remove(c); });
    if(wanted && !el.classList.contains(wanted)) el.classList.add(wanted);
  }
  function render(){
    scheduled=false;
    const e=enemy(), vals=diceValues();

    if(e.hp!=null&&e.max){
      const p=e.hp/e.max;
      const barClass=p>.5?"hp-green":p>.25?"hp-yellow":p>.10?"hp-orange":"hp-red";
      const textClass=p>.5?null:p>.25?"hp-mid":p>.10?"hp-low":"hp-critical";
      setClass(e.fill,barClass,["hp-green","hp-yellow","hp-orange","hp-red"]);
      setClass(e.hpText,textClass,["hp-mid","hp-low","hp-critical"]);
    }

    const f=ensureForecast();
    if(f && e.hp!=null){
      let text="", cls="";
      if(vals.every(Boolean)){
        const dmg=(vals[0]+vals[1])*vals[2]+atk();
        if(dmg>=e.hp){ text=`⚔ KILL!!  ${dmg} DAMAGE`; cls="kill"; }
        else {
          const remain=e.hp-dmg;
          text=`予測 ${dmg} DAMAGE  →  残り ${remain} HP`;
          if(e.max && remain<=Math.max(8,e.max*.1)) cls="close";
        }
      }
      if(f.textContent!==text) f.textContent=text;
      if(f.className!==cls) f.className=cls;
    }

    const third=vals[2];
    if(third && third!==lastThird){
      const o=$("#v042mult");
      if(o){
        o.textContent="×"+third; o.className="show"+(third===6?" x6":"");
        document.body.classList.add(third>=5?"v042-bigshake":"v042-shake");
        setTimeout(()=>{o.className="";document.body.classList.remove("v042-shake","v042-bigshake")},560);
      }
    }
    lastThird=third;

    if(lastEnemyHp!==null && e.hp!==null && e.hp<lastEnemyHp){
      const dmg=lastEnemyHp-e.hp, art=document.querySelector("#battle .enemy-emoji");
      if(art){ art.classList.remove("v042-hit"); void art.offsetWidth; art.classList.add("v042-hit"); }
      document.body.classList.add(dmg>=40?"v042-bigshake":"v042-shake");
      if(e.hp<=0){
        const k=$("#v042kill"); if(k){k.classList.remove("show");void k.offsetWidth;k.classList.add("show")}
      }
      setTimeout(()=>document.body.classList.remove("v042-shake","v042-bigshake"),450);
    }
    lastEnemyHp=e.hp;

    const dice=[...document.querySelectorAll(".die")].slice(0,3);
    if(dice.length>=3){
      const thirdReady=!!(vals[0]&&vals[1]&&!vals[2]&&!dice[2].classList.contains("locked"));
      if(document.body.classList.contains("v042-dim")!==thirdReady)
        document.body.classList.toggle("v042-dim",thirdReady);
    }
  }
  function queue(){ if(!scheduled){scheduled=true;requestAnimationFrame(render);} }
  // Important: don't observe attributes; our own class animations would recursively retrigger the observer.
  new MutationObserver(queue).observe(document.body,{subtree:true,childList:true,characterData:true});
  queue();
})();

// v0.5 physical dice motion layer
(() => {
  document.addEventListener("pointerdown", e => {
    const d=e.target.closest(".die");
    if(!d || d.classList.contains("locked")) return;
    d.classList.remove("v05-roll","v05-land"); void d.offsetWidth;
    d.classList.add("v05-roll");
    const isMult=d.dataset.index==="2";
    setTimeout(()=>{
      d.classList.remove("v05-roll"); d.classList.add("v05-land");
      setTimeout(()=>d.classList.remove("v05-land"),220);
    },isMult?880:620);
  },true);
})();
