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
  // Tamaños base
  const bodyWidth = 22;
  const bodyHeight = 28;

  // SOMBRA (debajo de los esquís)
  ctx.save();
  ctx.fillStyle = "rgba(15, 23, 42, 0.35)";
  ctx.beginPath();
  ctx.ellipse(x, y + 18, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ESQUÍS
  ctx.save();
  let skiAngle = 0;
  if (gameState.keys.left) {
    skiAngle = -0.35;
  } else if (gameState.keys.right) {
    skiAngle = 0.35;
  }

  ctx.translate(x, y + 10);
  ctx.rotate(skiAngle);
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 3;

  // Esquí izquierdo
  ctx.beginPath();
  ctx.moveTo(-8, -2);
  ctx.lineTo(-8, 18);
  ctx.stroke();

  // Esquí derecho (ligeramente separado)
  ctx.beginPath();
  ctx.moveTo(8, -2);
  ctx.lineTo(8, 18);
  ctx.stroke();

  ctx.restore();

  // BASTONES (opcionales, hacia atrás)
  ctx.save();
  ctx.strokeStyle = "rgba(15, 23, 42, 0.7)";
  ctx.lineWidth = 2;

  // bastón izquierdo
  ctx.beginPath();
  ctx.moveTo(x - 8, y + 2);
  ctx.lineTo(x - 18, y - 20);
  ctx.stroke();

  // bastón derecho
  ctx.beginPath();
  ctx.moveTo(x + 8, y + 4);
  ctx.lineTo(x + 18, y - 18);
  ctx.stroke();

  ctx.restore();

  // MOCHILA
  ctx.save();
  ctx.fillStyle = "#1e293b";
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x - bodyWidth / 2 - 4, y - bodyHeight - 2, 10, 18, 4);
    ctx.fill();
  } else {
    ctx.fillRect(x - bodyWidth / 2 - 4, y - bodyHeight - 2, 10, 18);
  }
  ctx.restore();

  // CUERPO (chaqueta roja)
  ctx.save();
  ctx.fillStyle = "#dc2626";
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(
      x - bodyWidth / 2,
      y - bodyHeight,
      bodyWidth,
      bodyHeight,
      6
    );
    ctx.fill();
  } else {
    ctx.fillRect(
      x - bodyWidth / 2,
      y - bodyHeight,
      bodyWidth,
      bodyHeight
    );
  }

  // Cruz de patrulla
  ctx.fillStyle = "#f9fafb";
  const crossWidth = 12;
  const crossThick = 4;
  const cx = x;
  const cy = y - bodyHeight / 2;

  // vertical
  ctx.fillRect(
    cx - crossThick / 2,
    cy - crossWidth / 2,
    crossThick,
    crossWidth
  );
  // horizontal
  ctx.fillRect(
    cx - crossWidth / 2,
    cy - crossThick / 2,
    crossWidth,
    crossThick
  );

  ctx.restore();

  // PIERNAS / PANTALÓN
  ctx.save();
  ctx.fillStyle = "#111827";
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x - 10, y - 4, 8, 12, 3); // pierna izq
    ctx.roundRect(x + 2, y - 4, 8, 12, 3); // pierna der
    ctx.fill();
  } else {
    ctx.fillRect(x - 10, y - 4, 8, 12);
    ctx.fillRect(x + 2, y - 4, 8, 12);
  }
  ctx.restore();

  // CASCO
  ctx.save();
  const headRadius = 10;
  const headCenterY = y - bodyHeight - 8;

  // casco base
  ctx.beginPath();
  ctx.arc(x, headCenterY, headRadius, Math.PI, 0);
  ctx.closePath();
  ctx.fillStyle = "#0f172a";
  ctx.fill();

  // franja del casco
  ctx.fillStyle = "#dc2626";
  ctx.fillRect(x - headRadius, headCenterY - 1, headRadius * 2, 4);

  // gafas / visera
  ctx.fillStyle = "#38bdf8";
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x - 9, headCenterY + 2, 18, 6, 3);
    ctx.fill();
  } else {
    ctx.fillRect(x - 9, headCenterY + 2, 18, 6);
  }

  // pequeño brillo
  ctx.fillStyle = "rgba(248, 250, 252, 0.6)";
  ctx.fillRect(x - 6, headCenterY + 3, 5, 2);

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
