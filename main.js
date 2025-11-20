// main.js
// Versión con pista hacia abajo y "scroll" vertical desde abajo hacia arriba.

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startButton = document.getElementById("startButton");
const statusText = document.getElementById("statusText");

// Estado del juego
const gameState = {
  running: false,
  patrolX: canvas.width * 0.5,
  patrolY: canvas.height * 0.75, // un poco más abajo para que se vea la pista
  patrolSpeed: 5,
  keys: {
    left: false,
    right: false,
  },
  // fondo
  scrollOffset: 0,
  scrollSpeed: 3,
  stars: [],
};

// --------- INICIALIZACIÓN FONDO (estrellas estáticas) --------- //

function initBackground() {
  gameState.stars = [];
  const { width, height } = canvas;
  for (let i = 0; i < 60; i++) {
    gameState.stars.push({
      x: Math.random() * width,
      y: Math.random() * (height * 0.4),
    });
  }
}

// --------- DIBUJO DE ESCENA --------- //

function drawBackground() {
  const { width, height } = canvas;

  // cielo
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#020617");
  sky.addColorStop(0.5, "#0f172a");
  sky.addColorStop(1, "#1f2937");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // estrellas (ya no cambian de posición en cada frame)
  ctx.fillStyle = "rgba(248, 250, 252, 0.7)";
  for (const star of gameState.stars) {
    ctx.fillRect(star.x, star.y, 2, 2);
  }

  // montañas de fondo (estáticas, solo decorativas)
  drawMountain(width * 0.25, height * 0.7, width * 0.5, height * 0.3);
  drawMountain(width * 0.75, height * 0.8, width * 0.6, height * 0.35);

  // pista principal (trapezoide que va hacia abajo)
  drawSlope();
}

function drawMountain(centerX, baseY, width, height) {
  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.moveTo(centerX, baseY - height);
  ctx.lineTo(centerX - width / 2, baseY);
  ctx.lineTo(centerX + width / 2, baseY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f9fafb";
  ctx.beginPath();
  ctx.moveTo(centerX, baseY - height);
  ctx.lineTo(centerX - width * 0.18, baseY - height * 0.65);
  ctx.lineTo(centerX, baseY - height * 0.55);
  ctx.lineTo(centerX + width * 0.16, baseY - height * 0.7);
  ctx.closePath();
  ctx.fill();
}

function drawSlope() {
  const { width, height } = canvas;

  // Tramo de nieve: más angosto arriba, más ancho abajo (perspectiva).
  ctx.fillStyle = "#e5e7eb";
  ctx.b
