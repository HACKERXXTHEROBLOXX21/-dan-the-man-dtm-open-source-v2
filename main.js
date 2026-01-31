const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
addEventListener("resize", resize);
resize();

const keys = {};
addEventListener("keydown", e => keys[e.key]=true);
addEventListener("keyup", e => keys[e.key]=false);

function img(src){ const i=new Image(); i.src=src; return i; }

const sprites = {
  dan: img("assets/sprites/dan_walk.png"),
  enemy: img("assets/sprites/baton_guard_enemy_run.png"),
  enemyDead: img("assets/sprites/baton_guard_enemy_died.png"),
  ground: img("assets/sprites/title_ground.png"),
  coin: img("assets/sprites/coin.png")
};

let mode = "play";

const player = {x:100,y:0,w:48,h:48,vx:0,vy:0,facing:1,onGround:false};
const gravity = 0.8;

let level = {
  groundY: 500,
  coins: [{x:300,y:460}],
  enemies: [{x:600,y:452,dead:false}]
};

document.getElementById("buildBtn").onclick=()=>mode="build";
document.getElementById("playBtn").onclick=()=>mode="play";

document.getElementById("exportBtn").onclick=()=>{
  const data = JSON.stringify(level);
  const blob = new Blob([data], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "dtmcustomlevel1.dtm";
  a.click();
};

document.getElementById("importBtn").onchange=e=>{
  const r=new FileReader();
  r.onload=()=>level=JSON.parse(r.result);
  r.readAsText(e.target.files[0]);
};

canvas.onclick=e=>{
  if(mode!=="build")return;
  level.coins.push({x:e.offsetX,y:e.offsetY});
};

function update(){
  if(mode==="play"){
    player.vx=0;
    if(keys["ArrowLeft"]){player.vx=-5;player.facing=-1;}
    if(keys["ArrowRight"]){player.vx=5;player.facing=1;}
    if(keys["x"]&&player.onGround){player.vy=-14;player.onGround=false;}
    player.vy+=gravity;
    player.x+=player.vx;
    player.y+=player.vy;

    if(player.y+player.h>=level.groundY){
      player.y=level.groundY-player.h;
      player.vy=0;
      player.onGround=true;
    }

    if(keys["z"]){
      level.enemies.forEach(e=>{
        if(!e.dead && Math.abs(player.x-e.x)<50) e.dead=true;
      });
    }
  }
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(sprites.ground,0,level.groundY,canvas.width,120);

  level.coins.forEach(c=>ctx.drawImage(sprites.coin,c.x,c.y,24,24));

  level.enemies.forEach(e=>{
    const s=e.dead?sprites.enemyDead:sprites.enemy;
    ctx.drawImage(s,e.x,e.y,48,48);
  });

  ctx.save();
  ctx.translate(player.x+24,player.y);
  ctx.scale(player.facing,1);
  ctx.drawImage(sprites.dan,-24,0,48,48);
  ctx.restore();

  if(mode==="build"){
    ctx.fillStyle="black";
    ctx.fillText("BUILD MODE: click to add coins",20,80);
  }
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
