const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const statusText = document.getElementById("statusText");

const gameState = {
  running: false,
  patrol: { x: canvas.width / 2 - 15, y: 60, width: 30, height: 30 },
  target: { x: canvas.width / 2 - 12, y: canvas.height - 120, size: 24 },
};

function drawPlaceholderScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Pista
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.fillRect(40, 0, canvas.width - 80, canvas.height);

  // Líneas de nieve
  ctx.strokeStyle = "#d6e7f5";
  ctx.lineWidth = 3;
  for (let y = 30; y < canvas.height; y += 60) {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(canvas.width - 40, y + 20);
    ctx.stroke();
  }

  // Patrulla (placeholder simple)
  ctx.fillStyle = "#e63946";
  ctx.fillRect(gameState.patrol.x, gameState.patrol.y, gameState.patrol.width, gameState.patrol.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(gameState.patrol.x + 8, gameState.patrol.y + 12, 14, 6);

  // Accidentado (placeholder)
  ctx.beginPath();
  ctx.arc(gameState.target.x, gameState.target.y, gameState.target.size, 0, Math.PI * 2);
  ctx.fillStyle = "#1d3557";
  ctx.fill();
  ctx.fillStyle = "#f1faee";
  ctx.font = "14px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SOS", gameState.target.x, gameState.target.y + 5);

  // Texto de depuración
  ctx.fillStyle = "#0b2545";
  ctx.font = "16px sans-serif";
  ctx.fillText("Placeholder gráfico listo", canvas.width / 2, 32);
}

function startGame() {
  if (gameState.running) return;
  gameState.running = true;
  statusText.textContent = "Juego iniciado. Placeholder dibujado en el canvas.";
  drawPlaceholderScene();
}

startButton.addEventListener("click", startGame);

// Dibuja el placeholder inicial para mostrar el canvas
statusText.textContent = "Canvas inicializado. Haz clic en \"Iniciar juego\".";
drawPlaceholderScene();
