const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GRAVITY = 0.6;
let MODE = "PLAY";

const images = {};
const loadImage = (name, src) => {
  const img = new Image();
  img.src = src;
  images[name] = img;
};

loadImage("dan", "assets/sprites/dan_idle.png");
loadImage("coin", "assets/sprites/coin.png");
loadImage("ground", "assets/sprites/title_ground.png");
loadImage("enemyIdle", "assets/sprites/baton_guard_enemy_idle.png");
loadImage("enemyRun", "assets/sprites/baton_guard_enemy_run.png");
loadImage("enemyDead", "assets/sprites/baton_guard_enemy_died.png");

const player = {
  x: 100,
  y: 300,
  w: 32,
  h: 32,
  vx: 0,
  vy: 0,
  onGround: false
};

let coins = [];
let enemies = [];
let groundY = 420;
let coinCount = 0;

// DEFAULT LEVEL
function resetLevel() {
  coins = [];
  enemies = [];

  for (let i = 0; i < 15; i++) {
    coins.push({ x: 200 + i * 40, y: 300 });
  }

  enemies.push({
    x: 600,
    y: 388,
    state: "run",
    alive: true
  });
}

resetLevel();

// INPUT
const keys = {};
window.addEventListener("keydown", e => (keys[e.key] = true));
window.addEventListener("keyup", e => (keys[e.key] = false));

// GAME LOOP
function update() {
  if (MODE === "PLAY") {
    player.vx = 0;
    if (keys["ArrowLeft"]) player.vx = -3;
    if (keys["ArrowRight"]) player.vx = 3;
    if (keys["z"] && player.onGround) {
      player.vy = -12;
      player.onGround = false;
    }

    player.vy += GRAVITY;
    player.x += player.vx;
    player.y += player.vy;

    if (player.y + player.h >= groundY) {
      player.y = groundY - player.h;
      player.vy = 0;
      player.onGround = true;
    }

    // COINS
    coins = coins.filter(c => {
      const hit =
        player.x < c.x + 16 &&
        player.x + player.w > c.x &&
        player.y < c.y + 16 &&
        player.y + player.h > c.y;
      if (hit) coinCount++;
      return !hit;
    });

    // ENEMY
    enemies.forEach(e => {
      if (!e.alive) return;
      e.x -= 1.5;

      const hit =
        player.x < e.x + 32 &&
        player.x + player.w > e.x &&
        player.y < e.y + 32 &&
        player.y + player.h > e.y;

      if (hit && keys["x"]) {
        e.alive = false;
        e.state = "dead";
      }
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // GROUND
  for (let x = 0; x < canvas.width; x += 64) {
    ctx.drawImage(images.ground, x, groundY, 64, 32);
  }

  // PLAYER
  ctx.drawImage(images.dan, player.x, player.y, 32, 32);

  // COINS
  coins.forEach(c =>
    ctx.drawImage(images.coin, c.x, c.y, 16, 16)
  );

  // ENEMY
  enemies.forEach(e => {
    let img =
      e.state === "dead"
        ? images.enemyDead
        : images.enemyRun;
    ctx.drawImage(img, e.x, e.y, 32, 32);
  });
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();

// UI
document.getElementById("playBtn").onclick = () => {
  MODE = "PLAY";
  document.getElementById("modeText").textContent = "PLAY";
};

document.getElementById("buildBtn").onclick = () => {
  MODE = "BUILD";
  document.getElementById("modeText").textContent = "BUILD";
};

// EXPORT .DTM
document.getElementById("exportBtn").onclick = () => {
  const data = {
    coins,
    enemies
  };
  const blob = new Blob([JSON.stringify(data)], {
    type: "application/json"
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "dtmcustomlevel1.dtm";
  a.click();
};

// IMPORT .DTM
document.getElementById("importDTM").onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  file.text().then(t => {
    const data = JSON.parse(t);
    coins = data.coins || [];
    enemies = data.enemies || [];
  });
};

// MIDI PLAYER
let audioCtx = new AudioContext();
let sfInstrument;

Soundfont.instrument(
  audioCtx,
  "assets/audio/Super_Nintendo_Unofficial_Soundfont.sf2"
).then(inst => (sfInstrument = inst));

document.getElementById("playMidiBtn").onclick = () => {
  const file = document.getElementById("midiInput").files[0];
  if (!file || !sfInstrument) return;

  file.arrayBuffer().then(buf => {
    const midi = new Midi(buf);
    midi.tracks.forEach(track => {
      track.notes.forEach(n => {
        sfInstrument.play(n.name, audioCtx.currentTime + n.time, {
          duration: n.duration
        });
      });
    });
  });
};
