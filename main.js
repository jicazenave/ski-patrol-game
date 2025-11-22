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
  visual: {
    bodyAngle: 0,
    skiSeparation: 10,
    headAngle: 0,
    poleAngle: 0,
    crouchOffset: 0,
    headDrop: 0,
    bodyOffsetX: 0,
    legAngle: 0,
    armSpread: 0,
    poleSpread: 0,
    spreadDirection: 0,
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

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function drawPatrol(x, y, scale) {
  // Tamaños base
  const baseX = 0;
  const baseY = 0;
  const bodyHeight = 30;
  const shoulderWidth = 26;
  const waistWidth = 16;
  const bodyWidth = waistWidth;
  const skiSeparation = gameState.visual?.skiSeparation ?? 10;
  const poleAngle = gameState.visual?.poleAngle ?? 0;
  const bodyAngle = gameState.visual?.bodyAngle ?? 0;
  const headAngle = gameState.visual?.headAngle ?? 0;
  const crouchOffset = gameState.visual?.crouchOffset ?? 0;
  const headDrop = gameState.visual?.headDrop ?? 0;
  const bodyOffsetX = gameState.visual?.bodyOffsetX ?? 0;
  const legAngle = gameState.visual?.legAngle ?? 0;
  const armSpread = gameState.visual?.armSpread ?? 0;
  const poleSpread = gameState.visual?.poleSpread ?? 0;
  const spreadDirection = gameState.visual?.spreadDirection ?? 0;
  const torsoTopY = baseY - bodyHeight + crouchOffset + 4;
  const torsoBottomY = baseY + crouchOffset;
  const shoulderHalf = shoulderWidth / 2;
  const waistHalf = waistWidth / 2;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // SOMBRA (debajo de los esquís)
  ctx.save();
  ctx.fillStyle = "rgba(15, 23, 42, 0.35)";
  ctx.beginPath();
  ctx.ellipse(baseX, baseY + 18, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ESQUÍS
  ctx.save();
  if (gameState.keys.up) {
    // Modo cuña: puntas casi juntas (abajo), colas abiertas
    ctx.translate(baseX, baseY + 10);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";

    const tailWidth = 18;
    const tipLength = 22;
    const tipGap = 3; // pequeña separación entre puntas

    // Esquí izquierdo
    ctx.beginPath();
    ctx.moveTo(-tailWidth, 0); // cola abierta
    ctx.lineTo(-tipGap, tipLength); // punta casi al centro (abajo)
    ctx.stroke();

    // Esquí derecho
    ctx.beginPath();
    ctx.moveTo(tailWidth, 0); // cola abierta
    ctx.lineTo(tipGap, tipLength); // punta casi al centro (abajo)
    ctx.stroke();
  } else {
    let skiAngle = 0;
    if (gameState.keys.left) {
      skiAngle = 0.45;
    } else if (gameState.keys.right) {
      skiAngle = -0.45;
    }

    ctx.translate(baseX, baseY + 10);
    ctx.rotate(skiAngle);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";

    // Esquí izquierdo
    ctx.beginPath();
    ctx.moveTo(-skiSeparation, -2);
    ctx.lineTo(-skiSeparation, 26);
    ctx.stroke();

    // Esquí derecho (ligeramente separado)
    ctx.beginPath();
    ctx.moveTo(skiSeparation, -2);
    ctx.lineTo(skiSeparation, 26);
    ctx.stroke();
  }

  ctx.restore();

  // PIERNAS / PANTALÓN (base en esquís, caderas se desplazan)
  ctx.save();
  ctx.rotate(bodyAngle);
  ctx.fillStyle = "#111827";
  const legLength = Math.round(12 * 1.6);
  const legBottomY = baseY + 10 + crouchOffset;
  const legTopY = legBottomY - legLength;

  function drawLeg(footX) {
    const topX = footX + bodyOffsetX + legAngle;
    ctx.beginPath();
    ctx.moveTo(topX - 4, legTopY);
    ctx.lineTo(topX + 4, legTopY);
    ctx.lineTo(footX + 4, legBottomY);
    ctx.lineTo(footX - 4, legBottomY);
    ctx.closePath();
    ctx.fill();
  }

  drawLeg(baseX - 10);
  drawLeg(baseX + 6);
  ctx.restore();

  ctx.save();
  ctx.translate(bodyOffsetX, 0);

  // MOCHILA
  ctx.save();
  ctx.rotate(bodyAngle);
  ctx.fillStyle = "#1e293b";
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(
      baseX - bodyWidth / 2 - 4,
      baseY - bodyHeight - 2 + crouchOffset,
      10,
      18,
      4
    );
    ctx.fill();
  } else {
    ctx.fillRect(
      baseX - bodyWidth / 2 - 4,
      baseY - bodyHeight - 2 + crouchOffset,
      10,
      18
    );
  }
  ctx.restore();

  // CUERPO (chaqueta roja)
  ctx.save();
  ctx.rotate(bodyAngle);
  ctx.fillStyle = "#dc2626";

  ctx.beginPath();
  ctx.moveTo(baseX - shoulderHalf, torsoTopY);
  ctx.lineTo(baseX + shoulderHalf, torsoTopY);
  ctx.lineTo(baseX + waistHalf, torsoBottomY);
  ctx.lineTo(baseX - waistHalf, torsoBottomY);
  ctx.closePath();
  ctx.fill();

  // Cruz de patrulla
  ctx.fillStyle = "#f9fafb";
  const crossWidth = 12;
  const crossThick = 4;
  const cx = baseX;
  const cy = torsoTopY + (torsoBottomY - torsoTopY) / 2;

  ctx.fillRect(cx - crossThick / 2, cy - crossWidth / 2, crossThick, crossWidth);
  ctx.fillRect(cx - crossWidth / 2, cy - crossThick / 2, crossWidth, crossThick);

  ctx.restore();

  // BRAZOS
  const shoulderY = torsoTopY + 2;
  const armLength = 18;
  const armWidth = 12;
  const armTilt = 0.14;
  const baseSpread = armSpread * 0.5;
  const externalBias = 0.18 * armSpread;
  const turnDir = spreadDirection;
  let leftHand = { x: -9, y: -8 + crouchOffset };
  let rightHand = { x: 9, y: -6 + crouchOffset };

  ctx.save();
  ctx.rotate(bodyAngle);
  ctx.fillStyle = "#dc2626";

  function drawArm(shoulderX, angle, side) {
    ctx.save();
    ctx.translate(shoulderX, shoulderY);
    ctx.rotate(angle);
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(-armWidth / 2, 0, armWidth, armLength, 3);
      ctx.fill();
    } else {
      ctx.fillRect(-armWidth / 2, 0, armWidth, armLength);
    }
    ctx.restore();

    const outwardBoost = 4 + armSpread * 5;
    const extraOutward = turnDir * side > 0 ? armSpread * 2 : 0;
    return {
      x:
        shoulderX -
        Math.sin(angle) * armLength +
        side * (outwardBoost + extraOutward),
      y: shoulderY + Math.cos(angle) * armLength - armSpread * 1.2,
    };
  }

  const leftAngle =
    -armTilt - baseSpread - (turnDir > 0 ? externalBias : armSpread * 0.06);
  const rightAngle =
    armTilt + baseSpread + (turnDir < 0 ? externalBias : armSpread * 0.06);

  leftHand = drawArm(-shoulderHalf + 1, leftAngle, -1);
  rightHand = drawArm(shoulderHalf - 1, rightAngle, 1);

  ctx.restore();

  // BASTONES (opcionales, hacia atrás)
  ctx.save();
  ctx.rotate(bodyAngle);
  ctx.strokeStyle = "rgba(15, 23, 42, 0.7)";
  ctx.lineWidth = 2;

  const poleLength = 28;

  function drawPole(hand, extraTilt, side) {
    const lateralTilt = poleSpread * 0.5 * side;
    const backwardTilt = -poleSpread * 0.2;
    const tipLateral = -3 + side * poleSpread * 6;
    const tipDrop = poleLength + poleSpread * 5;
    ctx.save();
    ctx.translate(hand.x, hand.y);
    ctx.rotate(poleAngle + extraTilt + lateralTilt + backwardTilt);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(tipLateral, tipDrop);
    ctx.stroke();
    ctx.restore();
  }

  drawPole(leftHand, -0.06, -1);
  drawPole(rightHand, 0.06, 1);

  ctx.restore();

  // CASCO
  ctx.save();
  ctx.rotate(bodyAngle + headAngle);
  const headRadius = 10;
  const headCenterY = baseY - bodyHeight - 6 + crouchOffset + headDrop;
  const headCenterX = baseX;

  // casco base
  ctx.beginPath();
  ctx.arc(headCenterX, headCenterY, headRadius, Math.PI, 0);
  ctx.closePath();
  ctx.fillStyle = "#0f172a";
  ctx.fill();

  // franja del casco
  ctx.fillStyle = "#dc2626";
  ctx.fillRect(headCenterX - headRadius, headCenterY - 1, headRadius * 2, 4);

  // gafas / visera
  ctx.fillStyle = "#38bdf8";
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(headCenterX - 9, headCenterY + 2, 18, 6, 3);
    ctx.fill();
  } else {
    ctx.fillRect(headCenterX - 9, headCenterY + 2, 18, 6);
  }

  // pequeño brillo
  ctx.fillStyle = "rgba(248, 250, 252, 0.6)";
  ctx.fillRect(headCenterX - 6, headCenterY + 3, 5, 2);

  ctx.restore();
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

  const isDescending = gameState.keys.down;
  const turningDirection = gameState.keys.right
    ? 1
    : gameState.keys.left
      ? -1
      : 0;

  const targetLegAngle = turningDirection * 6;
  const targetBodyAngle = -(targetLegAngle) * (Math.PI / 180);
  const targetHeadAngle = 0;
  const targetSkiSeparation = isDescending ? 7 : 10;
  const targetPoleAngle = isDescending ? 0 : 0;
  const targetCrouchOffset = isDescending ? 10 : 0;
  const targetHeadDrop = isDescending ? 6 : 0;
  const targetBodyOffsetX = gameState.keys.right
    ? 14
    : gameState.keys.left
      ? -14
      : 0;
  const targetArmSpread = turningDirection !== 0 ? 1 : 0;
  const targetPoleSpread = turningDirection !== 0 ? 1.1 : 0;
  const targetSpreadDirection = -turningDirection;

  gameState.visual.bodyAngle = lerp(
    gameState.visual.bodyAngle,
    targetBodyAngle,
    0.2
  );
  gameState.visual.headAngle = lerp(
    gameState.visual.headAngle,
    targetHeadAngle,
    0.2
  );
  gameState.visual.skiSeparation = lerp(
    gameState.visual.skiSeparation,
    targetSkiSeparation,
    0.2
  );
  gameState.visual.poleAngle = lerp(
    gameState.visual.poleAngle,
    targetPoleAngle,
    0.2
  );
  gameState.visual.crouchOffset = lerp(
    gameState.visual.crouchOffset,
    targetCrouchOffset,
    0.2
  );
  gameState.visual.headDrop = lerp(
    gameState.visual.headDrop,
    targetHeadDrop,
    0.2
  );
  gameState.visual.bodyOffsetX = lerp(
    gameState.visual.bodyOffsetX,
    targetBodyOffsetX,
    0.2
  );
  gameState.visual.legAngle = lerp(
    gameState.visual.legAngle,
    targetLegAngle,
    0.2
  );
  gameState.visual.armSpread = lerp(
    gameState.visual.armSpread,
    targetArmSpread,
    0.2
  );
  gameState.visual.poleSpread = lerp(
    gameState.visual.poleSpread,
    targetPoleSpread,
    0.2
  );
  gameState.visual.spreadDirection = lerp(
    gameState.visual.spreadDirection,
    targetSpreadDirection,
    0.25
  );

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
