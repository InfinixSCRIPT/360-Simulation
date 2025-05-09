// main.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = {
  x: canvas.width / 2,
  y: canvas.height - 100,
  size: 30,
  speed: 4,
};

let bullets = [];
let zombies = [];
let keys = {};
let score = 0;
let isGameOver = false;
let spawnLineY = 50;
let zombieShootTimers = new Map();

// INPUT EVENTS
document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === "r" && isGameOver) location.reload();
  if (e.code === "Space" && !isGameOver) shoot();
});

document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);
canvas.addEventListener("mousedown", () => { if (!isGameOver) shoot(); });

function shoot() {
  bullets.push({ x: player.x - 10, y: player.y, dx: 0, dy: -8 });
  bullets.push({ x: player.x + 10, y: player.y, dx: 0, dy: -8 });
}

function spawnZombie() {
  let type;
  if (score >= 75) {
    type = ["green", "red", "black"][Math.floor(Math.random() * 3)];
  } else if (score >= 25) {
    type = Math.random() < 0.5 ? "green" : "red";
  } else {
    type = "green";
  }

  let yOffset = type === "red" ? 5 : type === "black" ? 3 : 0;
  let z = {
    x: Math.random() * (canvas.width - 40) + 20,
    y: spawnLineY + yOffset,
    type: type,
    lastShot: Date.now()
  };
  zombies.push(z);
}

function drawStickman(x, y, color, drawGuns = false) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y + 5); ctx.lineTo(x, y + 20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 10, y + 10); ctx.lineTo(x + 10, y + 10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y + 20); ctx.lineTo(x - 5, y + 30); ctx.moveTo(x, y + 20); ctx.lineTo(x + 5, y + 30); ctx.stroke();
  if (drawGuns) {
    ctx.fillStyle = "gray";
    ctx.fillRect(x - 18, y + 6, 8, 4);
    ctx.fillRect(x + 10, y + 6, 8, 4);
  }
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "red";
  ctx.fillRect(0, spawnLineY, canvas.width, 3);

  ctx.fillStyle = "white";
  ctx.font = "20px monospace";
  ctx.fillText("Score: " + score, 10, 30);

  if (isGameOver) {
    ctx.font = "40px monospace";
    ctx.fillText("Game Over! Press R to Restart", canvas.width / 2 - 250, canvas.height / 2);
    return;
  }

  if (keys["w"]) player.y -= player.speed;
  if (keys["s"]) player.y += player.speed;
  if (keys["a"]) player.x -= player.speed;
  if (keys["d"]) player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height, player.y));

  drawStickman(player.x, player.y, "white", true);

  ctx.fillStyle = "orange";
  bullets.forEach((b, i) => {
    b.x += b.dx;
    b.y += b.dy;
    ctx.fillRect(b.x, b.y, 6, 6);

    if (b.y < 0 || b.y > canvas.height) bullets.splice(i, 1);

    if (b.fromZombie && Math.abs(b.x - player.x) < 10 && Math.abs(b.y - player.y) < 20) {
      isGameOver = true;
    }
  });

  let now = Date.now();
  zombies.forEach((z, zi) => {
    if (z.type === "black" || z.type === "red") {
      if (!zombieShootTimers.has(z)) zombieShootTimers.set(z, now);
      if (now - zombieShootTimers.get(z) >= 1500) {
        bullets.push({ x: z.x - 10, y: z.y + 10, dx: 0, dy: 4, fromZombie: true });
        bullets.push({ x: z.x + 10, y: z.y + 10, dx: 0, dy: 4, fromZombie: true });
        zombieShootTimers.set(z, now);
      }
    } else if (z.type === "green") {
      z.y += 1;
    }

    drawStickman(z.x, z.y, z.type, z.type === "black" || z.type === "red");

    if (Math.abs(z.x - player.x) < 20 && Math.abs(z.y - player.y) < 20) isGameOver = true;

    bullets.forEach((b, bi) => {
      if (!b.fromZombie && b.x > z.x - 10 && b.x < z.x + 10 && b.y > z.y && b.y < z.y + 20) {
        zombies.splice(zi, 1);
        bullets.splice(bi, 1);
        score += z.type === "red" ? 4 : z.type === "black" ? 12 : 1;
      }
    });
  });

  requestAnimationFrame(update);
}

setInterval(spawnZombie, 1000);
update();
date();
