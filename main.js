// main.js
// Primer prototipo de gameplay:
// - Dibuja fondo, patrulla y banderas.
// - Con el botón "Iniciar juego" se activa un loop.
// - Con las flechas ← → mueves al patrulla.

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startButton = document.getElementById("startButton");
const statusText = document.getElementById("statusText");

// Estado del juego
const gameState = {
  running: false,
  patrolX: canvas.width * 0.3,
  patrolY: canvas.height * 0.55,
  patrolSpeed: 5,
  keys: {
    left: false,
    right: false,
  },
};

// --------- DIBUJO DE ESCENA --------- //

function drawMountain(centerX, baseY, width, height) {
  // montaña
  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.moveTo(centerX, baseY - height);
  ctx.lineTo(centerX - width / 2, baseY);
  ctx.lineTo(centerX + width / 2, baseY);
  ctx.closePath();
  ctx.fill();

  // nieve en la cima
  ctx.fillStyle = "#f9fafb";
  ctx.beginPath();
  ctx.moveTo(centerX, baseY - height);
  ctx.lineTo(centerX - width * 0.18, baseY - height * 0.65);
  ctx.lineTo(centerX, baseY - height * 0.55);
  ctx.lineTo(centerX + width * 0.16, baseY - height * 0.7);
  ctx.closePath();
  ctx.fill();
}

function drawBackground() {
  const { width, height } = canvas;

  // cielo
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#020617");
  sky.addColorStop(0.5, "#0f172a");
  sky.addColorStop(1, "#1f2937");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // estrellas (semi fijas, no importa mucho para prototipo)
  ctx.fillStyle = "rgba(248, 250, 252, 0.7)";
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * width;
    const y = Math.random() * (height * 0.4);
    ctx.fillRect(x, y, 2, 2);
  }

  // montañas
  drawMountain(width * 0.2, height * 0.85, width * 0.5, height * 0.25);
  drawMountain(width * 0.7, height * 0.9, width * 0.55, height * 0.3);

  // nieve en primer plano (pista)
  ctx.fillStyle = "#e5e7eb";
  ctx.beginPath();
  ctx.moveTo(0, height * 0.55);
  ctx.quadraticCurveTo(width * 0.3, height * 0.5, width * 0.6, height * 0.6);
  ctx.quadraticCurveTo(width * 0.85, height * 0.68, width, height * 0.63);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fill();
}

function drawPatrol(x, y) {
  // cuerpo
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(x - 12, y - 20, 24, 24);

  // cruz
  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(x - 3, y - 18, 6, 18);
  ctx.fillRect(x - 9, y - 12, 18, 6);

  // casco
  ctx.beginPath();
  ctx.arc(x, y - 24, 10, Math.PI, 0);
  ctx.fillStyle = "#0f172a";
  ctx.fill();

  // esquís
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 18, y + 8);
  ctx.lineTo(x + 22, y + 18);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x - 22, y + 14);
  ctx.lineTo(x + 18, y + 24);
  ctx.stroke();
}

function drawFlag(x, y, color = "#38bdf8") {
  // poste
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 40);
  ctx.stroke();

  // bandera
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 20, y + 6);
  ctx.lineTo(x, y + 12);
  ctx.closePath();
  ctx.fill();
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  // patrulla (posición tomada del estado)
  drawPatrol(gameState.patrolX, gameState.patrolY);

  // banderas estáticas por ahora
  drawFlag(canvas.width * 0.55, canvas.height * 0.55, "#22c55e");
  drawFlag(canvas.width * 0.7, canvas.height * 0.6, "#38bdf8");
  drawFlag(canvas.width * 0.85, canvas.height * 0.65, "#f97316");

  // mensaje solo cuando el juego no está corriendo
  if (!gameState.running) {
    ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
    ctx.fillRect(
      canvas.width * 0.1,
      canvas.height * 0.12,
      canvas.width * 0.8,
      40
    );

    ctx.fillStyle = "#e5e7eb";
    ctx.font = "16px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(
      "Listo para el rescate. Presiona “Iniciar juego”.",
      canvas.width * 0.5,
      canvas.height * 0.38
    );
  }
}

// --------- LOOP DE JUEGO --------- //

function update() {
  if (!gameState.running) return;

  // mover patrulla según teclas presionadas
  if (gameState.keys.left) {
    gameState.patrolX -= gameState.patrolSpeed;
  }
  if (gameState.keys.right) {
    gameState.patrolX += gameState.patrolSpeed;
  }

  // limitar dentro del canvas
  const margin = 20;
  if (gameState.patrolX < margin) gameState.patrolX = margin;
  if (gameState.patrolX > canvas.width - margin)
    gameState.patrolX = canvas.width - margin;
}

function gameLoop() {
  update();
  drawScene();
  requestAnimationFrame(gameLoop);
}

// --------- INPUT (TECLADO) --------- //

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") {
    gameState.keys.left = true;
  }
  if (e.key === "ArrowRight" || e.key === "d") {
    gameState.keys.right = true;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") {
    gameState.keys.left = false;
  }
  if (e.key === "ArrowRight" || e.key === "d") {
    gameState.keys.right = false;
  }
});

// --------- INICIO --------- //

startButton.addEventListener("click", () => {
  if (!gameState.running) {
    gameState.running = true;
    statusText.textContent = "¡Rescate en curso! Usa ← → para moverte.";
  }
});

// dibujar escena inicial y arrancar loop
drawScene();
gameLoop();
