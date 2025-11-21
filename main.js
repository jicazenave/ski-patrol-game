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
  patrolMinY: slopeConfig.topY + 40,
  patrolMaxY: slopeConfig.bottomY - 20,
  keys: {
    left: false,
    right: false,
    up: false,
    down: false,
  },
  scrollOffset: 0,
  scrollSpeed: 3,
  stars: [],
  snowLines: [],
  visual: {
    bodyAngle: 0,
    bobOffset: 0,
    jitterX: 0,
    jitterY: 0,
    speed: 0,
    skiAngle: 0,
    skiSpread: 0,
    time: 0,
  },
  lastPatrolY: canvas.height * 0.82,
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

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function drawPatrol(x, y, scale) {
  const bodyWidth = 22;
  const bodyHeight = 28;
  const baseX = 0;
  const baseY = 0;
  const visual = gameState.visual;

  const basePosX = x + visual.jitterX;
  const basePosY = y + visual.bobOffset + visual.jitterY;

  ctx.save();
  ctx.translate(basePosX, basePosY);
  ctx.scale(scale, scale);

  // Sombra sin rotación para mantenerla anclada al suelo
  ctx.save();
  ctx.fillStyle = "rgba(15, 23, 42, 0.35)";
  ctx.beginPath();
  ctx.ellipse(baseX, baseY + 18, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Rotación e inclinación del cuerpo
  ctx.rotate(visual.bodyAngle);

  // ESQUÍS
  ctx.save();
  ctx.translate(baseX, baseY + 10);
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";

  const leftSkiAngle = visual.skiAngle - visual.skiSpread;
  const rightSkiAngle = visual.skiAngle + visual.skiSpread;

  const drawSki = (offsetX, angle) => {
    ctx.save();
    ctx.translate(offsetX, 0);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(0, 26);
    ctx.stroke();
    ctx.restore();
  };

  drawSki(-8 - Math.sin(visual.bodyAngle) * 2, leftSkiAngle);
  drawSki(8 - Math.sin(visual.bodyAngle) * 2, rightSkiAngle);
  ctx.restore();

  // BASTONES
  ctx.save();
  ctx.strokeStyle = "rgba(15, 23, 42, 0.75)";
  ctx.lineWidth = 2;

  let poleBaseAngle = -0.5; // hacia atrás por defecto
  if (gameState.keys.down) poleBaseAngle = -1.1;
  if (gameState.keys.up) poleBaseAngle = -0.1;

  const lateralPoleLean = gameState.keys.left
    ? -0.35
    : gameState.keys.right
    ? 0.35
    : 0;

  const poleDistance = 14;
  const poleHeight = 18;

  const drawPole = (offsetX, extraAngle) => {
    ctx.save();
    ctx.translate(offsetX, baseY + 2);
    ctx.rotate(poleBaseAngle + extraAngle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -poleHeight);
    ctx.stroke();
    ctx.restore();
  };

  drawPole(-poleDistance, lateralPoleLean - 0.1);
  drawPole(poleDistance, lateralPoleLean + 0.1);
  ctx.restore();

  // MOCHILA
  ctx.save();
  ctx.fillStyle = "#1e293b";
  const packOffset = gameState.keys.down ? 3 : 0;
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(
      baseX - bodyWidth / 2 - 4,
      baseY - bodyHeight - 2 + packOffset,
      10,
      18,
      4
    );
    ctx.fill();
  } else {
    ctx.fillRect(
      baseX - bodyWidth / 2 - 4,
      baseY - bodyHeight - 2 + packOffset,
      10,
      18
    );
  }
  ctx.restore();

  // CUERPO (chaqueta roja)
  ctx.save();
  ctx.fillStyle = "#dc2626";
  const torsoLean = gameState.keys.down ? 5 : 0;
  const torsoLift = gameState.keys.up ? -2 : 0;
  const torsoY = baseY - bodyHeight + torsoLean + torsoLift;
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(baseX - bodyWidth / 2, torsoY, bodyWidth, bodyHeight, 6);
    ctx.fill();
  } else {
    ctx.fillRect(baseX - bodyWidth / 2, torsoY, bodyWidth, bodyHeight);
  }

  // Cruz de patrulla
  ctx.fillStyle = "#f9fafb";
  const crossWidth = 12;
  const crossThick = 4;
  const cx = baseX;
  const cy = torsoY + bodyHeight / 2;

  ctx.fillRect(cx - crossThick / 2, cy - crossWidth / 2, crossThick, crossWidth);
  ctx.fillRect(cx - crossWidth / 2, cy - crossThick / 2, crossWidth, crossThick);

  ctx.restore();

  // PIERNAS / PANTALÓN
  ctx.save();
  ctx.fillStyle = "#111827";
  const crouch = gameState.keys.down ? 4 : 0;
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(baseX - 10, baseY - 4 + crouch, 8, 12, 3);
    ctx.roundRect(baseX + 2, baseY - 4 + crouch, 8, 12, 3);
    ctx.fill();
  } else {
    ctx.fillRect(baseX - 10, baseY - 4 + crouch, 8, 12);
    ctx.fillRect(baseX + 2, baseY - 4 + crouch, 8, 12);
  }
  ctx.restore();

  // CASCO
  ctx.save();
  const headRadius = 10;
  const headLean = gameState.keys.down ? 6 : gameState.keys.up ? -2 : 0;
  const headCenterY = baseY - bodyHeight - 8 + headLean + torsoLift;

  ctx.beginPath();
  ctx.arc(baseX, headCenterY, headRadius, Math.PI, 0);
  ctx.closePath();
  ctx.fillStyle = "#0f172a";
  ctx.fill();

  ctx.fillStyle = "#dc2626";
  ctx.fillRect(baseX - headRadius, headCenterY - 1, headRadius * 2, 4);

  ctx.fillStyle = "#38bdf8";
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(baseX - 9, headCenterY + 2, 18, 6, 3);
    ctx.fill();
  } else {
    ctx.fillRect(baseX - 9, headCenterY + 2, 18, 6);
  }

  ctx.fillStyle = "rgba(248, 250, 252, 0.6)";
  ctx.fillRect(baseX - 6, headCenterY + 3, 5, 2);

  ctx.restore();
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
  const t = clamp(
    (gameState.patrolY - gameState.patrolMinY) /
      (gameState.patrolMaxY - gameState.patrolMinY),
    0,
    1
  );
  const scale = lerp(0.7, 1.1, t);
  drawPatrol(gameState.patrolX, gameState.patrolY, scale);
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

  if (gameState.keys.up) {
    gameState.patrolY -= gameState.patrolSpeed;
  }
  if (gameState.keys.down) {
    gameState.patrolY += gameState.patrolSpeed;
  }

  gameState.patrolY = clamp(
    gameState.patrolY,
    gameState.patrolMinY,
    gameState.patrolMaxY
  );

  const depthT = clamp(
    (gameState.patrolY - gameState.patrolMinY) /
      (gameState.patrolMaxY - gameState.patrolMinY),
    0,
    1
  );

  const { leftX, rightX } = getSlopeBoundsAtY(gameState.patrolY);
  const widthAdjustment = lerp(0.75, 1, depthT);
  const adjustedHalfRange = ((rightX - leftX) / 2) * widthAdjustment;
  const centerX = slopeConfig.centerX;
  const adjustedLeft = centerX - adjustedHalfRange;
  const adjustedRight = centerX + adjustedHalfRange;

  const halfWidth = gameState.patrolWidth / 2;
  if (gameState.patrolX - halfWidth < adjustedLeft) {
    gameState.patrolX = adjustedLeft + halfWidth;
  }
  if (gameState.patrolX + halfWidth > adjustedRight) {
    gameState.patrolX = adjustedRight - halfWidth;
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

  // Animaciones visuales (sin afectar la lógica de movimiento)
  const visual = gameState.visual;
  const now = performance.now() / 1000;
  visual.time = now;

  let targetBodyAngle = 0;
  if (gameState.keys.down) {
    targetBodyAngle = 0;
  } else if (gameState.keys.up) {
    targetBodyAngle = -0.05;
  } else if (gameState.keys.left) {
    targetBodyAngle = -0.25;
  } else if (gameState.keys.right) {
    targetBodyAngle = 0.25;
  }

  visual.bodyAngle = lerp(visual.bodyAngle, targetBodyAngle, 0.2);

  const deltaY = gameState.patrolY - gameState.lastPatrolY;
  const targetSpeed = Math.abs(gameState.scrollSpeed + deltaY);
  visual.speed = lerp(visual.speed, targetSpeed, 0.12);

  let targetSkiAngle = 0;
  let targetSkiSpread = 0;
  if (gameState.keys.up) {
    targetSkiSpread = 0.55;
    targetSkiAngle = -0.05;
  } else if (gameState.keys.left) {
    targetSkiAngle = 0.35;
  } else if (gameState.keys.right) {
    targetSkiAngle = -0.35;
  } else if (gameState.keys.down) {
    targetSkiAngle = 0;
    targetSkiSpread = 0.05;
  }

  visual.skiAngle = lerp(visual.skiAngle, targetSkiAngle, 0.18);
  visual.skiSpread = lerp(visual.skiSpread, targetSkiSpread, 0.18);

  const bobFrequency = 6;
  const bobAmplitude = 3.2;
  const speedFactor = clamp(visual.speed / 8, 0, 1.4);
  visual.bobOffset =
    Math.sin(now * bobFrequency) * bobAmplitude * (0.3 + speedFactor * 0.7);

  const jitterThreshold = 7;
  const jitterAmount = 2.2;
  const jitterFactor = Math.max(0, (visual.speed - jitterThreshold) / jitterThreshold);
  if (jitterFactor > 0) {
    visual.jitterX = (Math.random() - 0.5) * jitterAmount * jitterFactor;
    visual.jitterY = (Math.random() - 0.5) * jitterAmount * jitterFactor;
  } else {
    visual.jitterX = lerp(visual.jitterX, 0, 0.2);
    visual.jitterY = lerp(visual.jitterY, 0, 0.2);
  }

  gameState.lastPatrolY = gameState.patrolY;
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
  if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
    gameState.keys.up = true;
  }
  if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
    gameState.keys.down = true;
  }
}

function handleKeyUp(event) {
  if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
    gameState.keys.left = false;
  }
  if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
    gameState.keys.right = false;
  }
  if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
    gameState.keys.up = false;
  }
  if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
    gameState.keys.down = false;
  }
}

startButton.addEventListener("click", () => {
  gameState.running = true;
  statusText.textContent =
    "¡Rescate en curso! Usa ← → / A D y ↑ ↓ / W S para moverte";
});

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

initBackground();
drawScene();
requestAnimationFrame(gameLoop);
