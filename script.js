let currentScreen = 1;
let nextScreenAfterPopup = null;

const musicMain = document.getElementById("musicMain");
const musicFinal = document.getElementById("musicFinal");
const popup = document.getElementById("popup");
const popupText = document.getElementById("popupText");

/* LOADING */
window.addEventListener("load", () => {
  let dots = 0;
  const loadingText = document.getElementById("loadingText");

  const loadingAnim = setInterval(() => {
    dots = (dots + 1) % 4;
    loadingText.innerText = "Loading" + ".".repeat(dots);
  }, 400);

  setTimeout(() => {
    clearInterval(loadingAnim);
    document.getElementById("loading").style.display = "none";
    goToScreen(1);
  }, 3000);
});

/* PINDAH HALAMAN */
function goToScreen(number) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  document.getElementById(`screen-${number}`).classList.add("active");
  currentScreen = number;

  if (number >= 2 && number <= 8) {
    musicFinal.pause();
    musicMain.play().catch(() => {});
  }

  if (number === 9) {
    musicMain.pause();
    musicMain.currentTime = 0;
    musicFinal.play().catch(() => {});
  }

  if (number === 4) startMemoryGame();
  if (number === 5) startBoxGame();
  if (number === 6) resetHeartGame();
  if (number === 7) startSnakeGame();
  if (number === 8) resetDifferenceGame();
}

/* POPUP */
function showPopup(text, nextScreen) {
  popupText.innerText = text;
  nextScreenAfterPopup = nextScreen;
  popup.classList.add("show");
}

function closePopup() {
  popup.classList.remove("show");

  if (nextScreenAfterPopup) {
    goToScreen(nextScreenAfterPopup);
    nextScreenAfterPopup = null;
  }
}

/* TOMBOL KABUR */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".runaway").forEach(button => {
    button.addEventListener("mouseover", moveButton);
    button.addEventListener("touchstart", moveButton);
  });

  const pumpButton = document.getElementById("pumpButton");
  pumpButton.addEventListener("mousedown", startPump);
  pumpButton.addEventListener("mouseup", stopPump);
  pumpButton.addEventListener("mouseleave", stopPump);
  pumpButton.addEventListener("touchstart", startPump);
  pumpButton.addEventListener("touchend", stopPump);
});

function moveButton(e) {
  const button = e.target;
  const x = Math.random() * (window.innerWidth - 120);
  const y = Math.random() * (window.innerHeight - 80);

  button.style.position = "fixed";
  button.style.left = `${x}px`;
  button.style.top = `${y}px`;
}

/* SURAT */
function openEnvelope() {
  document.getElementById("questLetter").classList.toggle("show");
}

/* LEVEL 1 - PIN */
let pinInput = "";
const correctPin = "200604";

function pressPin(num) {
  if (pinInput.length >= 6) return;
  pinInput += num;
  renderPin();
}

function deletePin() {
  pinInput = pinInput.slice(0, -1);
  renderPin();
}

function renderPin() {
  const dots = document.querySelectorAll("#pinDisplay span");

  dots.forEach((dot, i) => {
    dot.style.background = i < pinInput.length ? "#ff4fa1" : "transparent";
  });
}

function checkPin() {
  if (pinInput === correctPin) {
    pinInput = "";
    renderPin();
    showPopup("Selamat 😂", 4);
  } else {
    document.getElementById("pinMessage").innerText = "PIN salah";
    pinInput = "";
    renderPin();
  }
}

/* LEVEL 2 - MEMORY */
let memoryTimerInterval;
let memoryCards = [];
let firstCard = null;
let secondCard = null;
let matchedCards = 0;
let memoryLocked = false;

function startMemoryGame() {
  clearInterval(memoryTimerInterval);

  const icons = ["❤", "⭐", "🌙", "📷", "🌻", "✉"];
  memoryCards = [...icons, ...icons].sort(() => Math.random() - 0.5);

  firstCard = null;
  secondCard = null;
  matchedCards = 0;
  memoryLocked = false;

  const grid = document.getElementById("memoryGrid");
  const timer = document.getElementById("memoryTimer");
  const message = document.getElementById("memoryMessage");

  grid.innerHTML = "";
  message.innerText = "";
  timer.innerText = "60";

  memoryCards.forEach(icon => {
    const card = document.createElement("button");
    card.className = "memory-card";
    card.dataset.icon = icon;
    card.innerText = "";
    card.onclick = () => flipCard(card);
    grid.appendChild(card);
  });

  let timeLeft = 60;

  memoryTimerInterval = setInterval(() => {
    timeLeft--;
    timer.innerText = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(memoryTimerInterval);
      message.innerText = "Waktu habis";
      setTimeout(startMemoryGame, 1000);
    }
  }, 1000);
}

function flipCard(card) {
  if (memoryLocked || card.classList.contains("open")) return;

  card.classList.add("open");
  card.innerText = card.dataset.icon;

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  memoryLocked = true;

  if (firstCard.dataset.icon === secondCard.dataset.icon) {
    matchedCards += 2;
    firstCard = null;
    secondCard = null;
    memoryLocked = false;

    if (matchedCards === 12) {
      clearInterval(memoryTimerInterval);
      showPopup("Ciee hampir berhasil nih kurang dikit lagi.", 5);
    }
  } else {
    setTimeout(() => {
      firstCard.classList.remove("open");
      secondCard.classList.remove("open");
      firstCard.innerText = "";
      secondCard.innerText = "";
      firstCard = null;
      secondCard = null;
      memoryLocked = false;
    }, 700);
  }
}

/* LEVEL 3 - PILIH KOTAK */
let correctBox = 0;
let boxClicked = false;

function startBoxGame() {
  correctBox = Math.floor(Math.random() * 3);
  boxClicked = false;

  document.getElementById("boxMessage").innerText = "";

  document.querySelectorAll(".mystery-box").forEach(box => {
    box.innerText = "";
    box.disabled = false;
  });
}

function chooseBox(index) {
  if (boxClicked) return;
  boxClicked = true;

  const boxes = document.querySelectorAll(".mystery-box");

  if (index === correctBox) {
    boxes[index].innerText = "🎟";
    showPopup("Yeyyy kamu berhasil, dikit lagi nih", 6);
  } else {
    boxes[index].innerText = "💣";
    document.getElementById("boxMessage").innerText = "Salah, ulangi lagi";
    setTimeout(startBoxGame, 1000);
  }
}

/* LEVEL 4 - POMPA HATI */
let heartPercent = 0;
let pumpInterval = null;

function resetHeartGame() {
  heartPercent = 0;
  clearInterval(pumpInterval);
  pumpInterval = null;
  updateHeart();
  document.getElementById("heartMessage").innerText = "";
}

function startPump(e) {
  e.preventDefault();

  if (pumpInterval) return;

  pumpInterval = setInterval(() => {
    heartPercent += 2;
    updateHeart();

    if (heartPercent >= 100) {
      heartPercent = 100;
      updateHeart();
      clearInterval(pumpInterval);
      pumpInterval = null;
      showPopup("Ayooo dikit lagi kok", 7);
    }
  }, 60);
}

function stopPump() {
  if (heartPercent > 0 && heartPercent < 100) {
    resetHeartGame();
    document.getElementById("heartMessage").innerText = "Jangan dilepas";
  }
}

function updateHeart() {
  document.getElementById("heartFill").style.height = `${heartPercent}%`;
  document.getElementById("heartPercent").innerText = `${heartPercent}%`;
}

/* LEVEL 5 - SNAKE */
/* LEVEL 5 - SNAKE */
let snakeInterval = null;
let snakeRestartTimeout = null;
let snake = [];
let food = null;
let direction = null;
let nextDirection = null;
let snakeScore = 0;

const snakeTarget = 10;
const snakeGrid = 20;
const canvas = document.getElementById("snakeCanvas");
const ctx = canvas.getContext("2d");
const boxSize = canvas.width / snakeGrid;

function startSnakeGame() {
  clearInterval(snakeInterval);
  clearTimeout(snakeRestartTimeout);

  snakeInterval = null;
  snakeRestartTimeout = null;

  snake = [{ x: 10, y: 10 }];
  food = randomFood();
  direction = null;
  nextDirection = null;
  snakeScore = 0;

  document.getElementById("snakeScore").innerText = snakeScore;
  document.getElementById("snakeMessage").innerText = "";

  drawSnakeBoard();

  snakeInterval = setInterval(drawSnakeGame, 140);
}

function drawSnakeGame() {
  if (!snake.length || !food) return;

  // Snake tidak langsung jalan sebelum tombol arah ditekan
  if (!nextDirection) {
    drawSnakeBoard();
    return;
  }

  direction = nextDirection;

  const head = { ...snake[0] };

  if (direction === "right") head.x++;
  if (direction === "left") head.x--;
  if (direction === "up") head.y--;
  if (direction === "down") head.y++;

  const hitWall =
    head.x < 0 ||
    head.x >= snakeGrid ||
    head.y < 0 ||
    head.y >= snakeGrid;

  const hitBody = snake.some(part => part.x === head.x && part.y === head.y);

  if (hitWall || hitBody) {
    gameOverSnake();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    snakeScore++;
    document.getElementById("snakeScore").innerText = snakeScore;
    food = randomFood();

    if (snakeScore >= snakeTarget) {
      clearInterval(snakeInterval);
      snakeInterval = null;
      showPopup("Sabar yaa, dikit lagiii", 8);
      return;
    }
  } else {
    snake.pop();
  }

  drawSnakeBoard();
}

function drawSnakeBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#050505";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ular
  ctx.fillStyle = "#ff4fa1";
  snake.forEach(part => {
    ctx.fillRect(
      part.x * boxSize + 1,
      part.y * boxSize + 1,
      boxSize - 2,
      boxSize - 2
    );
  });

  // Food
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(
    food.x * boxSize + boxSize / 2,
    food.y * boxSize + boxSize / 2,
    boxSize / 2.8,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function gameOverSnake() {
  clearInterval(snakeInterval);
  snakeInterval = null;

  document.getElementById("snakeMessage").innerText = "Ulangi lagi";
  drawSnakeBoard();

  snakeRestartTimeout = setTimeout(() => {
    startSnakeGame();
  }, 800);
}

function randomFood() {
  let newFood;

  do {
    newFood = {
      x: Math.floor(Math.random() * snakeGrid),
      y: Math.floor(Math.random() * snakeGrid)
    };
  } while (snake.some(part => part.x === newFood.x && part.y === newFood.y));

  return newFood;
}

function changeDirection(dir) {
  const activeDirection = nextDirection || direction;

  if (dir === "up" && activeDirection !== "down") nextDirection = "up";
  if (dir === "down" && activeDirection !== "up") nextDirection = "down";
  if (dir === "left" && activeDirection !== "right") nextDirection = "left";
  if (dir === "right" && activeDirection !== "left") nextDirection = "right";
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowUp") {
    e.preventDefault();
    changeDirection("up");
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();
    changeDirection("down");
  }

  if (e.key === "ArrowLeft") {
    e.preventDefault();
    changeDirection("left");
  }

  if (e.key === "ArrowRight") {
    e.preventDefault();
    changeDirection("right");
  }
});

/* LEVEL 6 - CARI PERBEDAAN */
let foundDiffs = [];

function resetDifferenceGame() {
  foundDiffs = [];
  document.getElementById("diffMessage").innerText = "";

  document.querySelectorAll(".diff-progress span").forEach(dot => {
    dot.classList.remove("done");
  });

  document.querySelectorAll(".diff-point").forEach(point => {
    point.disabled = false;
    point.classList.remove("found");
  });
}

function findDifference(num) {
  if (foundDiffs.includes(num)) return;

  foundDiffs.push(num);

  document.querySelectorAll(".diff-progress span")[foundDiffs.length - 1]
    .classList.add("done");

  const selectedPoint = document.querySelector(`.p${num}`);
  selectedPoint.disabled = true;
  selectedPoint.classList.add("found");

  if (foundDiffs.length === 5) {
    showPopup("Dikit lagi yaaa", 9);
  }
}
