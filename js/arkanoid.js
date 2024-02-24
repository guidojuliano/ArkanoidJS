const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const $bricks = document.querySelector("#bricks");
const $vaus = document.querySelector("#vaus");

canvas.width = 500;
canvas.height = 400;

// Variables del juego

// Variables de la bola
const ballRadius = 4; //Radio de la bola
let x = canvas.width / 2; //Posición inicial de la bola
let y = canvas.height - 30; //Posición inicial de la bola

//Velocidad de la bola
let dx = 2; //Velocidad horizontal
let dy = -2; //Velocidad vertical

// Variables de la pala
const paddleHeight = 8;
const paddleWidth = 48;
const PADDLE_SENSITIVITY = 5; //Sensibilidad de la pala

//Posición inicial de la pala
let paddleX = (canvas.width - paddleWidth) / 2;
let paddleY = canvas.height - paddleHeight - 10;

let rightPressed = false;
let leftPressed = false;

//Variables de los ladrillos
const brickRowsCount = 6;
const brickColumnsCount = 13;
const brickWidth = 30;
const brickHeight = 15;
const brickPadding = 1;
const brickOffsetTop = 80;
const brickOffsetLeft = 50;
const bricks = [];

const BRICK_STATUS = {
  ACTIVE: 1,
  DESTROYED: 0,
};

for (let c = 0; c < brickColumnsCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowsCount; r++) {
    //calculamos la posición de cada ladrillo
    const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
    const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;

    //Guardamos la información de cada ladrillo
    const random = Math.floor(Math.random() * 8);
    bricks[c][r] = {
      x: brickX,
      y: brickY,
      status: BRICK_STATUS.ACTIVE,
      color: random,
    };
  }
}

//Variables de puntuación
let score = 0;

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
}
function drawPaddle() {
  ctx.drawImage(
    $vaus,
    0,
    8,
    paddleWidth,
    paddleHeight,
    paddleX,
    paddleY,
    paddleWidth,
    paddleHeight
  );
}
function drawBricks() {
  for (let c = 0; c < brickColumnsCount; c++) {
    for (let r = 0; r < brickRowsCount; r++) {
      if (bricks[c][r].status === BRICK_STATUS.ACTIVE) {
        const currentBrick = bricks[c][r];
        const clipX = currentBrick.color * 21;

        ctx.drawImage(
          $bricks,
          clipX,
          0,
          20,
          10,
          currentBrick.x,
          currentBrick.y,
          brickWidth,
          brickHeight
        );
      }
    }
  }
}

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Score: " + score, 8, 20);
}

function collisionDetection() {
  for (let c = 0; c < brickColumnsCount; c++) {
    for (let r = 0; r < brickRowsCount; r++) {
      const currentBrick = bricks[c][r];
      if (currentBrick.status === BRICK_STATUS.ACTIVE) {
        const isBallSameXAsBrick =
          x > currentBrick.x && x < currentBrick.x + brickWidth;
        const isBallSameYAsBrick =
          y > currentBrick.y && y < currentBrick.y + brickHeight;

        if (isBallSameXAsBrick && isBallSameYAsBrick) {
          dy = -dy;
          currentBrick.status = BRICK_STATUS.DESTROYED;
          score++;
        }
      }
    }
  }
}

function ballMovement() {
  //Colisiones con las paredes
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }

  //Colisiones con el techo
  if (y + dy < ballRadius) {
    dy = -dy;
  }

  //Colisiones con la pala
  const isBallSameXAsPaddle = x > paddleX && x < paddleX + paddleWidth;
  const isBallTouchingPaddle = y + dy > paddleY;

  if (isBallTouchingPaddle && isBallSameXAsPaddle) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    gameEnded = true;
    return;
  }

  x += dx;
  y += dy;
}

function paddleMovement() {
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += PADDLE_SENSITIVITY;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= PADDLE_SENSITIVITY;
  }
}

function cleanCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function initEvents() {
  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);
  canvas.addEventListener("click", clickHandler);

  function keyDownHandler(e) {
    const { key } = e;
    if (key === "Right" || key === "ArrowRight") {
      rightPressed = true;
    } else if (key === "Left" || key === "ArrowLeft") {
      leftPressed = true;
    }
  }

  function keyUpHandler(e) {
    const { key } = e;
    if (key === "Right" || key === "ArrowRight") {
      rightPressed = false;
    } else if (key === "Left" || key === "ArrowLeft") {
      leftPressed = false;
    }
  }

  function clickHandler() {
    if (gameEnded) {
      restartGame();
      draw();
    }
  }
}

let gameEnded = false;

function restartGame() {
  gameEnded = false;
  score = 0;
  resetBall();
  resetPaddle();
  resetBricks();
}

function resetBall() {
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = 2;
  dy = -2;
}

function resetPaddle() {
  paddleX = (canvas.width - paddleWidth) / 2;
  paddleY = canvas.height - paddleHeight - 10;
}

function drawGameOver() {
  ctx.font = "30px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Game Over", canvas.width / 2 - 80, canvas.height / 2 - 20);
  ctx.font = "20px Arial";
  ctx.fillText(
    "Score: " + score,
    canvas.width / 2 - 40,
    canvas.height / 2 + 20
  );
  ctx.fillText(
    "Click to restart",
    canvas.width / 2 - 70,
    canvas.height / 2 + 60
  );
}

function resetBricks() {
  for (let c = 0; c < brickColumnsCount; c++) {
    for (let r = 0; r < brickRowsCount; r++) {
      bricks[c][r].status = BRICK_STATUS.ACTIVE;
    }
  }
}

function checkGameStatus() {
  let bricksLeft = 0;
  for (let c = 0; c < brickColumnsCount; c++) {
    for (let r = 0; r < brickRowsCount; r++) {
      if (bricks[c][r].status === BRICK_STATUS.ACTIVE) {
        bricksLeft++;
      }
    }
  }
  if (bricksLeft === 0 || y + dy > canvas.height - ballRadius) {
    gameEnded = true;
  }
}

function draw() {
  cleanCanvas();
  //DIBUJAR
  drawBall();
  drawPaddle();
  drawBricks();
  drawScore();

  if (gameEnded) {
    drawGameOver();
    return;
  }

  //COLISIONES Y MOVIMIENTO
  collisionDetection();
  ballMovement();
  paddleMovement();

  window.requestAnimationFrame(draw);
}

draw();
initEvents();
