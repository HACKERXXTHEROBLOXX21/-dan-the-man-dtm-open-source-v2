const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let mode = "play";

const playerImg = new Image();
playerImg.src = "assets/sprites/dan_idle.png";

const enemyImg = new Image();
enemyImg.src = "assets/sprites/baton_guard_enemy_idle.png";

const coinImg = new Image();
coinImg.src = "assets/sprites/coin.png";

const groundImg = new Image();
groundImg.src = "assets/sprites/title_ground.png";

const player = {
  x: 200,
  y: 360,
  w: 32,
  h: 32,
  coins: 0
};

let coins = [];
for (let i = 0; i < 20; i++) {
  coins.push({
    x: 100 + Math.random() * 700,
    y: 200 + Math.random() * 150,
    taken: false
  });
}

/* ---------- UI ---------- */
document.getElementById("playBtn").onclick = () => mode = "play";
document.getElementById("buildBtn").onclick = () => mode = "build";

document.getElementById("exportBtn").onclick = () => {
  const data = JSON.stringify({ coins });
  const blob = new Blob([data], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "dtmcustomlevel1.dtm";
  a.click();
};

/* ---------- MIDI (placeholder hook) ---------- */
document.getElementById("playMidiBtn").onclick = () => {
  alert("MIDI loaded (SoundFont hookup next)");
};

/* ---------- Controls ---------- */
const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

/* ---------- Game Loop ---------- */
function update() {
  if (mode === "play") {
    if (keys["ArrowLeft"]) player.x -= 3;
    if (keys["ArrowRight"]) player.x += 3;

    coins.forEach(c => {
      if (!c.taken &&
        player.x < c.x + 16 &&
        player.x + 32 > c.x &&
        player.y < c.y + 16 &&
        player.y + 32 > c.y
      ) {
        c.taken = true;
        player.coins++;
      }
    });
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ground
  ctx.drawImage(groundImg, 0, 420, canvas.width, 32);

  // coins
  coins.forEach(c => {
    if (!c.taken) ctx.drawImage(coinImg, c.x, c.y, 16, 16);
  });

  // player
  ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);

  // enemy demo
  ctx.drawImage(enemyImg, 500, 360, 32, 32);

  // HUD
  ctx.font = "10px PressStart";
  ctx.fillStyle = "#000";
  ctx.fillText(`COINS: ${player.coins}`, 12, 20);
  ctx.fillText(`MODE: ${mode.toUpperCase()}`, 12, 36);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
