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
  // Oyuncunun silahları
  bullets.push({ x: player.x - 10, y: player.y, dx: 0, dy: -8 });
  bullets.push({ x: player.x + 10, y: player.y, dx: 0, dy: -8 });
}

function spawnZombie() {
  const isRed = score >= 50 && Math.random() < 0.5; // 50 skor sonrası %50 kırmızı zombi
  zombies.push({
    x: Math.random() * canvas.width,
    y: spawnLineY + 5,
    size: 30,
    speed: isRed ? 0 : 1 + Math.random() * 1.5,
    type: isRed ? "red" : "green",
    cooldown: 0
  });
}

function drawStickman(x, y, color, drawGuns = false) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.stroke();
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

  // Kırmızı çizgi
  ctx.fillStyle = "red";
  ctx.fillRect(0, spawnLineY, canvas.width, 3);

  // Skor
  ctx.fillStyle = "white";
  ctx.font = "20px monospace";
  ctx.fillText("Score: " + score, 10, 30);

  // Game Over
  if (isGameOver) {
    ctx.fillStyle = "white";
    ctx.font = "40px monospace";
    ctx.fillText("Game Over! Press R to Restart", canvas.width / 2 - 250, canvas.height / 2);
    return;
  }

  // Hareket
  if (keys["w"]) player.y -= player.speed;
  if (keys["s"]) player.y += player.speed;
  if (keys["a"]) player.x -= player.speed;
  if (keys["d"]) player.x += player.speed;

  // Ekran dışına çıkışı engelle
  player.x = Math.max(player.size / 2, Math.min(canvas.width - player.size / 2, player.x));
  player.y = Math.max(player.size / 2, Math.min(canvas.height - player.size / 2, player.y));

  drawStickman(player.x, player.y, "white", true);

  // Mermiler
  bullets.forEach((b, i) => {
    b.x += b.dx;
    b.y += b.dy;
    ctx.fillStyle = b.hostile ? "red" : "orange";
    ctx.fillRect(b.x, b.y, 6, 6);

    // Düşman mermisi oyuncuya çarparsa
    if (b.hostile && Math.abs(b.x - player.x) < 10 && Math.abs(b.y - player.y) < 20) {
      isGameOver = true;
    }

    if (b.y < 0 || b.y > canvas.height || b.x < 0 || b.x > canvas.width) {
      bullets.splice(i, 1);
    }
  });

  // Zombiler
  zombies.forEach((z, zi) => {
    if (z.type === "green") {
      z.y += z.speed;
    }

    drawStickman(z.x, z.y, z.type);

    if (z.type === "red") {
      if (z.cooldown <= 0) {
        const angle = Math.atan2(player.y - z.y, player.x - z.x);
        bullets.push({
          x: z.x,
          y: z.y,
          dx: Math.cos(angle) * 4,
          dy: Math.sin(angle) * 4,
          hostile: true
        });
        z.cooldown = 100;
      } else {
        z.cooldown--;
      }
    }

    // Zombi çarpması
    if (
      Math.abs(z.x - player.x) < 20 &&
      Math.abs(z.y - player.y) < 20
    ) {
      isGameOver = true;
    }

    // Oyuncu mermisiyle zombi çarpışması
    bullets.forEach((b, bi) => {
      if (!b.hostile && b.x > z.x - 10 && b.x < z.x + 10 && b.y > z.y && b.y < z.y + 20) {
        zombies.splice(zi, 1);
        bullets.splice(bi, 1);
        score += 1;
      }
    });
  });

  requestAnimationFrame(update);
}

setInterval(spawnZombie, 1000);
update();
