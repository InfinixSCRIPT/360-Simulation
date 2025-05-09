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
let enemyBullets = [];
let zombies = [];
let keys = {};
let score = 0;
let isGameOver = false;

let spawnLineY = 50;

document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
  if (e.code === "Space" && !isGameOver) shoot(); // Space ile ateş etme
  if (e.key === "r" && isGameOver) location.reload();
});
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);
canvas.addEventListener("mousedown", () => {
  if (!isGameOver) shoot();
});

function shoot() {
  bullets.push({ x: player.x - 10, y: player.y, dx: 0, dy: -8 });
  bullets.push({ x: player.x + 10, y: player.y, dx: 0, dy: -8 });
}

function spawnZombie() {
  const isRed = score >= 25 && Math.random() < 0.5;
  const zombie = {
    x: Math.random() * canvas.width,
    y: spawnLineY + 5,
    size: 30,
    color: isRed ? "red" : "green",
    speed: isRed ? 0 : 1 + Math.random() * 1.5,
    lastShot: Date.now()
  };
  zombies.push(zombie);
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
    ctx.fillStyle = "white";
    ctx.font = "40px monospace";
    ctx.fillText("Game Over! Press R to Restart", canvas.width / 2 - 250, canvas.height / 2);
    return;
  }

  // Oyuncu hareket ve ekran sınırı
  if (keys["w"] && player.y > 0) player.y -= player.speed;
  if (keys["s"] && player.y < canvas.height - 30) player.y += player.speed;
  if (keys["a"] && player.x > 0) player.x -= player.speed;
  if (keys["d"] && player.x < canvas.width) player.x += player.speed;

  drawStickman(player.x, player.y, "white", true);

  // Mermiler
  ctx.fillStyle = "orange";
  bullets.forEach((b, i) => {
    b.y += b.dy;
    ctx.fillRect(b.x, b.y, 6, 6);
    if (b.y < 0) bullets.splice(i, 1);
  });

  // Kırmızı zombilerin mermileri
  ctx.fillStyle = "red";
  enemyBullets.forEach((b, i) => {
    b.y += b.dy;
    ctx.fillRect(b.x, b.y, 5, 5);
    if (b.y > canvas.height) enemyBullets.splice(i, 1);
    if (
      b.x > player.x - 10 && b.x < player.x + 10 &&
      b.y > player.y && b.y < player.y + 20
    ) {
      isGameOver = true;
    }
  });

  // Zombiler
  zombies.forEach((z, zi) => {
    if (z.color === "green") {
      z.y += z.speed;
    } else {
      if (Date.now() - z.lastShot > 3000) {
        enemyBullets.push({
          x: z.x,
          y: z.y + 10,
          dx: 0,
          dy: 4
        });
        z.lastShot = Date.now();
      }
    }

    drawStickman(z.x, z.y, z.color);

    if (
      Math.abs(z.x - player.x) < 20 &&
      Math.abs(z.y - player.y) < 20
    ) {
      isGameOver = true;
    }

    bullets.forEach((b, bi) => {
      if (
        b.x > z.x - 10 && b.x < z.x + 10 &&
        b.y > z.y && b.y < z.y + 20
      ) {
        score += z.color === "red" ? 4 : 1;
        zombies.splice(zi, 1);
        bullets.splice(bi, 1);
      }
    });
  });

  if (!isGameOver) requestAnimationFrame(update);
}

setInterval(spawnZombie, 1000);
update();
