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
// v0.4 multiplier emphasis helper
(() => {
  const refreshMultiplierState = () => {
    const dice = [...document.querySelectorAll('.die')];
    if (dice.length < 3) return;
    const third = dice[2];
    const firstDone = dice[0].textContent.trim() !== '?' && !dice[0].disabled;
    const secondDone = dice[1].textContent.trim() !== '?' && !dice[1].disabled;
    const thirdReady = !third.disabled && third.textContent.trim() === '?';
    third.classList.toggle('mult-ready', thirdReady);
  };
  new MutationObserver(refreshMultiplierState).observe(document.body,{subtree:true,childList:true,attributes:true,characterData:true});
  refreshMultiplierState();
})();
