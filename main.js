// main.js
// Juego prototipo de patrulla de ski con pista en perspectiva y control horizontal.

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startButton = document.getElementById("startButton");
const statusText = document.getElementById("statusText");

const slopeConfig = {
  centerX: canvas.width / 2,
  topY: canvas.height * 0.12,
  bottomY: canvas.height * 0.95,
  topWidth: canvas.width * 0.26,
  bottomWidth: canvas.width * 0.85,
};

const gameState = {
  running: false,
  patrolX: canvas.width / 2,
  patrolY: canvas.height * 0.82,
  patrolSpeed: 5,
  patrolWidth: 28,
  patrolHeight: 42,
  keys: {
    left: false,
    right: false,
  },
  scrollOffset: 0,
  scrollSpeed: 3,
  stars: [],
  snowLines: [],
};

function initBackground() {
  gameState.stars = [];
  const { width, height } = canvas;
  const starCount = 70;
  for (let i = 0; i < starCount; i += 1) {
    gameState.stars.push({
      x: Math.random() * width,
      y: Math.random() * height * 0.35,
      size: Math.random() * 2 + 1,
    });
  }

  initSnowLines();
}

function initSnowLines() {
  gameState.snowLines = [];
  const lines = 22;
  const range = slopeConfig.bottomY - slopeConfig.topY;
  for (let i = 0; i < lines; i += 1) {
    const y = slopeConfig.topY + (range / lines) * i;
    gameState.snowLines.push({
      y,
      offset: Math.random(),
      length: 18 + Math.random() * 20,
    });
  }
}

function getSlopeBoundsAtY(y) {
  const t = Math.min(Math.max((y - slopeConfig.topY) / (slopeConfig.bottomY - slopeConfig.topY), 0), 1);
  const widthAtY = slopeConfig.topWidth + (slopeConfig.bottomWidth - slopeConfig.topWidth) * t;
  const leftX = slopeConfig.centerX - widthAtY / 2;
  const rightX = slopeConfig.centerX + widthAtY / 2;
  return { leftX, rightX, widthAtY };
}

function drawBackground() {
  const { width, height } = canvas;

  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#0b1224");
  sky.addColorStop(0.5, "#101a33");
  sky.addColorStop(1, "#1d2a44");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  for (const star of gameState.stars) {
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }

  drawMountains();
  drawSlope();
}

function drawMountains() {
  const { width, height } = canvas;
  drawMountain(width * 0.2, height * 0.75, width * 0.45, height * 0.28);
  drawMountain(width * 0.6, height * 0.78, width * 0.6, height * 0.32);
  drawMountain(width * 0.9, height * 0.72, width * 0.4, height * 0.25);
}

function drawMountain(centerX, baseY, mountainWidth, mountainHeight) {
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.moveTo(centerX, baseY - mountainHeight);
  ctx.lineTo(centerX - mountainWidth / 2, baseY);
  ctx.lineTo(centerX + mountainWidth / 2, baseY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.moveTo(centerX, baseY - mountainHeight);
  ctx.lineTo(centerX - mountainWidth * 0.2, baseY - mountainHeight * 0.65);
  ctx.lineTo(centerX, baseY - mountainHeight * 0.55);
  ctx.lineTo(centerX + mountainWidth * 0.18, baseY - mountainHeight * 0.68);
  ctx.closePath();
  ctx.fill();
}

function drawSlope() {
  ctx.fillStyle = "#f1f5f9";
  ctx.beginPath();
  ctx.moveTo(slopeConfig.centerX - slopeConfig.topWidth / 2, slopeConfig.topY);
  ctx.lineTo(slopeConfig.centerX + slopeConfig.topWidth / 2, slopeConfig.topY);
  ctx.lineTo(slopeConfig.centerX + slopeConfig.bottomWidth / 2, slopeConfig.bottomY);
  ctx.lineTo(slopeConfig.centerX - slopeConfig.bottomWidth / 2, slopeConfig.bottomY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawSnowLines() {
  ctx.strokeStyle = "rgba(148, 163, 184, 0.65)";
  ctx.lineWidth = 2;
  for (const line of gameState.snowLines) {
    const bounds = getSlopeBoundsAtY(line.y);
    const x = bounds.leftX + bounds.widthAtY * line.offset;
    const length = line.length * (0.6 + 0.4 * ((line.y - slopeConfig.topY) / (slopeConfig.bottomY - slopeConfig.topY)));
    ctx.beginPath();
    ctx.moveTo(x - length * 0.3, line.y);
    ctx.lineTo(x + length * 0.7, line.y - 6);
    ctx.stroke();
  }
}

function drawPatrol(x, y) {
  const bodyWidth = gameState.patrolWidth;
  const bodyHeight = gameState.patrolHeight;
  const skiLength = bodyHeight * 0.9;

  ctx.save();
  ctx.translate(x, y);

  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-bodyWidth * 0.6, bodyHeight * 0.5);
  ctx.lineTo(-bodyWidth * 0.2, bodyHeight * 0.5 - skiLength);
  ctx.moveTo(bodyWidth * 0.6, bodyHeight * 0.5);
  ctx.lineTo(bodyWidth * 0.2, bodyHeight * 0.5 - skiLength);
  ctx.stroke();

  ctx.fillStyle = "#dc2626";
  ctx.strokeStyle = "#991b1b";
  ctx.lineWidth = 2;
  ctx.fillRect(-bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight);
  ctx.strokeRect(-bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight);

  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-bodyWidth * 0.35, 0);
  ctx.lineTo(bodyWidth * 0.35, 0);
  ctx.moveTo(0, -bodyHeight * 0.35);
  ctx.lineTo(0, bodyHeight * 0.35);
  ctx.stroke();

  ctx.restore();
}

function drawOverlay() {
  if (gameState.running) return;
  ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "22px 'Helvetica Neue', Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Listo para el rescate. Presiona 'Iniciar juego'.", canvas.width / 2, canvas.height / 2);
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawSnowLines();
  drawPatrol(gameState.patrolX, gameState.patrolY);
  drawOverlay();
}

function update() {
  if (!gameState.running) return;

  if (gameState.keys.left) {
    gameState.patrolX -= gameState.patrolSpeed;
  }
  if (gameState.keys.right) {
    gameState.patrolX += gameState.patrolSpeed;
  }

  const { leftX, rightX } = getSlopeBoundsAtY(gameState.patrolY);
  const halfWidth = gameState.patrolWidth / 2;
  if (gameState.patrolX - halfWidth < leftX) {
    gameState.patrolX = leftX + halfWidth;
  }
  if (gameState.patrolX + halfWidth > rightX) {
    gameState.patrolX = rightX - halfWidth;
  }

  gameState.scrollOffset = (gameState.scrollOffset + gameState.scrollSpeed) % (slopeConfig.bottomY - slopeConfig.topY);

  for (const line of gameState.snowLines) {
    line.y -= gameState.scrollSpeed;
    if (line.y < slopeConfig.topY - 10) {
      line.y = slopeConfig.bottomY + Math.random() * 20;
      line.offset = Math.random();
      line.length = 18 + Math.random() * 20;
    }
  }
}

function gameLoop() {
  update();
  drawScene();
  requestAnimationFrame(gameLoop);
}

function handleKeyDown(event) {
  if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
    gameState.keys.left = true;
  }
  if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
    gameState.keys.right = true;
  }
}

function handleKeyUp(event) {
  if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
    gameState.keys.left = false;
  }
  if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
    gameState.keys.right = false;
  }
}

startButton.addEventListener("click", () => {
  gameState.running = true;
  statusText.textContent = "¡Rescate en curso! Usa ← → para moverte";
});

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

initBackground();
drawScene();
requestAnimationFrame(gameLoop);
