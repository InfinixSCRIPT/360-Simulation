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

document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === "r" && isGameOver) location.reload();
});
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

document.addEventListener("keydown", e => {
  if (e.code === "Space" && !isGameOver) shoot();
});

canvas.addEventListener("mousedown", () => {
  if (!isGameOver) shoot();
});

function shoot() {
  bullets.push({ x: player.x - 10, y: player.y, dx: 0, dy: -8 });
  bullets.push({ x: player.x + 10, y: player.y, dx: 0, dy: -8 });
}

function spawnZombie() {
  zombies.push({
    x: Math.random() * canvas.width,
    y: spawnLineY + 5,
    size: 30,
    speed: 1 + Math.random() * 1.5
  });
}

function drawStickman(x, y, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y + 5); ctx.lineTo(x, y + 20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 10, y + 10); ctx.lineTo(x + 10, y + 10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x, y + 20); ctx.lineTo(x - 5, y + 30); ctx.moveTo(x, y + 20); ctx.lineTo(x + 5, y + 30); ctx.stroke();

  // Silah (gri dikdörtgen)
  ctx.fillStyle = "gray";
  ctx.fillRect(x + 6, y + 8, 10, 4); // Sağ eline dikdörtgen çiz
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Kırmızı çizgi
  ctx.fillStyle = "red";
  ctx.fillRect(0, spawnLineY, canvas.width, 3);

  // Skor
  ctx.fillStyle = "white";
  ctx.font = "20px monospace";
  ctx.fillText("Score: " + score, 10, 30);

  // Oyuncu hareket
  if (keys["w"]) player.y -= player.speed;
  if (keys["s"]) player.y += player.speed;
  if (keys["a"]) player.x -= player.speed;
  if (keys["d"]) player.x += player.speed;

  // Oyuncu çiz
  drawStickman(player.x, player.y, "white");

  // Mermiler
  ctx.fillStyle = "orange";
  bullets.forEach((b, i) => {
    b.x += b.dx;
    b.y += b.dy;
    ctx.fillRect(b.x, b.y, 6, 6);
    if (b.y < 0) bullets.splice(i, 1);
  });

  // Zombiler
  zombies.forEach((z, zi) => {
    z.y += z.speed;
    drawStickman(z.x, z.y, "green");

    // Oyuncuya çarparsa
    if (
      Math.abs(z.x - player.x) < 20 &&
      Math.abs(z.y - player.y) < 20
    ) {
      isGameOver = true;
      ctx.fillStyle = "white";
      ctx.font = "40px monospace";
      ctx.fillText("Game Over! Press R to Restart", canvas.width / 2 - 250, canvas.height / 2);
    }

    // Mermiyle çarpışma
    bullets.forEach((b, bi) => {
      if (
        b.x > z.x - 10 && b.x < z.x + 10 &&
        b.y > z.y && b.y < z.y + 20
      ) {
        zombies.splice(zi, 1);
        bullets.splice(bi, 1);
        score += 1;
      }
    });
  });

  if (!isGameOver) requestAnimationFrame(update);
}

setInterval(spawnZombie, 1000);
update();
