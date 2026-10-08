const introScreen = document.getElementById("introScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");

const nameForm = document.getElementById("nameForm");
const guessForm = document.getElementById("guessForm");
const playerNameInput = document.getElementById("playerName");
const guessInput = document.getElementById("guess");

const hackerNameEl = document.getElementById("hackerName");
const timerEl = document.getElementById("timer");
const attemptsEl = document.getElementById("attempts");
const timeBar = document.getElementById("timeBar");
const logEl = document.getElementById("log");
const hintEl = document.getElementById("hint");

const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");
const resultIcon = document.getElementById("resultIcon");
const secretResult = document.getElementById("secretResult");
const attemptResult = document.getElementById("attemptResult");
const scoreResult = document.getElementById("scoreResult");

const restartBtn = document.getElementById("restartBtn");
const showPythonBtn = document.getElementById("showPythonBtn");
const showPythonAsideBtn = document.getElementById("showPythonAsideBtn");
const pythonDialog = document.getElementById("pythonDialog");
const closeDialogBtn = document.getElementById("closeDialogBtn");
const copyPythonBtn = document.getElementById("copyPythonBtn");
const pythonCodeEl = document.getElementById("pythonCode");
const soundBtn = document.getElementById("soundBtn");
const leaderboardBody = document.getElementById("leaderboardBody");
const clearLeaderboardBtn = document.getElementById("clearLeaderboardBtn");

let secretCode = 0;
let attempts = 0;
let timeLeft = 60;
let timerId = null;
let gameActive = false;
let soundEnabled = true;
let audioCtx = null;
let currentPlayerName = "";
let currentHackerName = "";

const LEADERBOARD_KEY = "palfyCyberLabLeaderboardV1";

const pythonSource = `import random
import time

nev = input("Add meg a neved: ")

elotagok = ["Shadow", "Cyber", "Zero", "Byte", "Ghost", "Neo"]
utotagok = ["Fox", "Wolf", "Ninja", "Coder", "Hunter", "404"]

hackernev = random.choice(elotagok) + random.choice(utotagok)
titkos_kod = random.randint(100, 999)
probak = 0

print(f"Üdv, {nev}! A hackerneved: {hackernev}")
print("Törd fel a 3 jegyű titkos kódot!")

while True:
    tipp = int(input("Kód: "))
    probak += 1

    if tipp < titkos_kod:
        print("NAGYOBB kód kell!")
    elif tipp > titkos_kod:
        print("KISEBB kód kell!")
    else:
        print("ACCESS GRANTED")
        print(f"A kód: {titkos_kod}")
        print(f"Próbálkozások: {probak}")
        break`;


pythonCodeEl.textContent = pythonSource;

function getLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveLeaderboard(data) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(data));
  } catch {
    // Privát böngészésben vagy tiltott tárhely esetén a játék ettől még működik.
  }
}

function renderLeaderboard(highlightId = null) {
  const data = getLeaderboard();

  if (!data.length) {
    leaderboardBody.innerHTML = `
      <tr>
        <td colspan="3" class="empty-row">Még nincs eredmény.</td>
      </tr>
    `;
    return;
  }

  leaderboardBody.innerHTML = data.map((entry, index) => `
    <tr class="${entry.id === highlightId ? "new-record" : ""}" title="${entry.hackerName} • ${entry.attempts} próba • ${entry.timeLeft} mp maradt">
      <td>${index + 1}.</td>
      <td class="name-cell">${escapeHtml(entry.playerName)}</td>
      <td class="score-cell">${entry.score}</td>
    </tr>
  `).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function addToLeaderboard(score) {
  const data = getLeaderboard();

  const entry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    playerName: currentPlayerName,
    hackerName: currentHackerName,
    score,
    attempts,
    timeLeft,
    date: new Date().toISOString()
  };

  data.push(entry);

  data.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.attempts !== b.attempts) return a.attempts - b.attempts;
    return b.timeLeft - a.timeLeft;
  });

  const top10 = data.slice(0, 10);
  saveLeaderboard(top10);
  renderLeaderboard(top10.some(item => item.id === entry.id) ? entry.id : null);

  return top10.findIndex(item => item.id === entry.id) + 1;
}


function switchScreen(target) {
  [introScreen, gameScreen, resultScreen].forEach(screen => screen.classList.remove("active"));
  target.classList.add("active");
}

function generateHackerName(realName) {
  const prefixes = ["Shadow", "Cyber", "Zero", "Byte", "Ghost", "Neo", "Dark", "Pixel", "Quantum", "Root"];
  const suffixes = ["Fox", "Wolf", "Ninja", "Coder", "Hunter", "404", "Byte", "X", "Node", "Bot"];
  const clean = realName.trim().replace(/\s+/g, "").slice(0, 4);
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const number = Math.floor(Math.random() * 90) + 10;
  return `${prefix}${clean || suffix}${number}`;
}

function addLog(message, className = "") {
  const p = document.createElement("p");
  p.textContent = message;
  if (className) p.classList.add(className);
  logEl.appendChild(p);
  logEl.scrollTop = logEl.scrollHeight;
}

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
}

function beep(freq = 520, duration = 0.06, type = "square", volume = 0.035) {
  if (!soundEnabled) return;
  initAudio();
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = freq;
  gain.gain.value = volume;
  oscillator.connect(gain);
  gain.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
}

function successSound() {
  [440, 660, 880, 1100].forEach((freq, index) => {
    setTimeout(() => beep(freq, 0.12, "square", 0.04), index * 110);
  });
}

function failSound() {
  [220, 180, 140].forEach((freq, index) => {
    setTimeout(() => beep(freq, 0.16, "sawtooth", 0.035), index * 130);
  });
}

function startGame(playerName) {
  secretCode = Math.floor(Math.random() * 900) + 100;
  attempts = 0;
  timeLeft = 60;
  gameActive = true;

  const hackerName = generateHackerName(playerName);
  currentPlayerName = playerName;
  currentHackerName = hackerName;
  hackerNameEl.textContent = hackerName;
  attemptsEl.textContent = "0";
  timerEl.textContent = "01:00";
  timeBar.style.width = "100%";
  timeBar.style.background = "var(--green)";
  hintEl.textContent = "A rendszer figyeli a próbálkozásaidat...";

  logEl.innerHTML = "";
  addLog(`[SYSTEM] Azonosítás sikeres: ${playerName}.`, "good");
  addLog(`[SYSTEM] Hackerazonosító létrehozva: ${hackerName}.`, "good");
  addLog("[SYSTEM] Célpont elérve. Háromjegyű kód szükséges.");
  addLog("[SYSTEM] 60 másodperces biztonsági ablak megnyitva.", "warn");

  switchScreen(gameScreen);
  guessInput.value = "";
  guessInput.focus();
  beep(700, .08);

  clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft -= 1;
    updateTimer();

    if (timeLeft <= 0) {
      clearInterval(timerId);
      endGame(false);
    }
  }, 1000);
}

function updateTimer() {
  const seconds = String(Math.max(0, timeLeft)).padStart(2, "0");
  timerEl.textContent = `00:${seconds}`;
  timeBar.style.width = `${Math.max(0, timeLeft) / 60 * 100}%`;

  if (timeLeft <= 15) {
    timeBar.style.background = "var(--danger)";
    timerEl.style.color = "var(--danger)";
    if (timeLeft > 0) beep(290, 0.03, "square", 0.018);
  } else {
    timerEl.style.color = "var(--green)";
  }
}

function calculateScore() {
  const base = 1000;
  const timeBonus = timeLeft * 12;
  const attemptPenalty = Math.max(0, attempts - 1) * 55;
  return Math.max(100, base + timeBonus - attemptPenalty);
}

function endGame(success) {
  gameActive = false;
  clearInterval(timerId);

  secretResult.textContent = secretCode;
  attemptResult.textContent = attempts;

  if (success) {
    const score = calculateScore();
    const rank = addToLeaderboard(score);
    resultScreen.classList.remove("denied");
    resultIcon.textContent = "✓";
    resultTitle.textContent = "ACCESS GRANTED";
    resultText.textContent = rank > 0
      ? `Sikerült feltörnöd a rendszert! ${timeLeft} másodperc maradt. Felkerültél a TOP 10-be: ${rank}. hely!`
      : `Sikerült feltörnöd a rendszert! ${timeLeft} másodperc maradt a biztonsági ablakból.`;
    scoreResult.textContent = score;
    successSound();
  } else {
    resultScreen.classList.add("denied");
    resultIcon.textContent = "×";
    resultTitle.textContent = "ACCESS DENIED";
    resultText.textContent = "Lejárt az idő. A rendszer lezárta a kapcsolatot. Próbáld meg újra!";
    scoreResult.textContent = "0";
    failSound();
  }

  switchScreen(resultScreen);
}

nameForm.addEventListener("submit", event => {
  event.preventDefault();
  const playerName = playerNameInput.value.trim();
  if (!playerName) return;
  startGame(playerName);
});

guessForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!gameActive) return;

  const guess = Number(guessInput.value);

  if (!Number.isInteger(guess) || guess < 100 || guess > 999) {
    hintEl.textContent = "Csak 100 és 999 közötti egész számot írj be!";
    addLog("[ERROR] Hibás kódformátum.", "bad");
    beep(170, .12, "sawtooth");
    guessInput.select();
    return;
  }

  attempts += 1;
  attemptsEl.textContent = attempts;
  addLog(`[TRY ${String(attempts).padStart(2, "0")}] Kódpróba: ${guess}`);

  if (guess < secretCode) {
    hintEl.textContent = "▲ NAGYOBB kódot keress!";
    addLog("[SYSTEM] Elutasítva. A titkos kód ennél NAGYOBB.", "warn");
    beep(430, .05);
  } else if (guess > secretCode) {
    hintEl.textContent = "▼ KISEBB kódot keress!";
    addLog("[SYSTEM] Elutasítva. A titkos kód ennél KISEBB.", "warn");
    beep(360, .05);
  } else {
    hintEl.textContent = "✓ KÓD ELFOGADVA!";
    addLog("[SYSTEM] Hozzáférési kód elfogadva.", "good");
    addLog("[SYSTEM] ACCESS GRANTED", "good");
    document.querySelector(".terminal-card").classList.add("flash");
    setTimeout(() => document.querySelector(".terminal-card").classList.remove("flash"), 550);
    endGame(true);
    return;
  }

  guessInput.value = "";
  guessInput.focus();
});

restartBtn.addEventListener("click", () => {
  clearInterval(timerId);
  timerEl.style.color = "var(--green)";
  playerNameInput.value = "";
  guessInput.value = "";
  switchScreen(introScreen);
  setTimeout(() => playerNameInput.focus(), 50);
});

function openPythonDialog() {
  if (typeof pythonDialog.showModal === "function") {
    pythonDialog.showModal();
  } else {
    pythonDialog.setAttribute("open", "");
  }
}

showPythonBtn.addEventListener("click", openPythonDialog);
showPythonAsideBtn.addEventListener("click", openPythonDialog);
closeDialogBtn.addEventListener("click", () => pythonDialog.close());

copyPythonBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(pythonSource);
    copyPythonBtn.textContent = "MÁSOLVA ✓";
    beep(740, .08);
    setTimeout(() => copyPythonBtn.textContent = "KÓD MÁSOLÁSA", 1400);
  } catch {
    copyPythonBtn.textContent = "NEM SIKERÜLT";
    setTimeout(() => copyPythonBtn.textContent = "KÓD MÁSOLÁSA", 1400);
  }
});

soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundBtn.textContent = soundEnabled ? "🔊" : "🔇";
  if (soundEnabled) beep(600, .06);
});

// Matrix háttér
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");
let drops = [];
const chars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ<>[]{}#$%&*+-";

function resizeMatrix() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const fontSize = 16;
  const columns = Math.ceil(window.innerWidth / fontSize);
  drops = Array.from({ length: columns }, () => Math.random() * -50);
}

function drawMatrix() {
  const fontSize = 16;
  ctx.fillStyle = "rgba(2, 7, 5, 0.11)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  ctx.fillStyle = "rgba(56, 255, 136, 0.42)";
  ctx.font = `${fontSize}px Consolas`;

  drops.forEach((y, i) => {
    const text = chars[Math.floor(Math.random() * chars.length)];
    const x = i * fontSize;
    ctx.fillText(text, x, y * fontSize);

    if (y * fontSize > window.innerHeight && Math.random() > 0.975) {
      drops[i] = 0;
    } else {
      drops[i] += 1;
    }
  });

  requestAnimationFrame(drawMatrix);
}

window.addEventListener("resize", resizeMatrix);
resizeMatrix();
drawMatrix();


clearLeaderboardBtn.addEventListener("click", () => {
  const confirmed = confirm("Biztosan törlöd a teljes TOP 10 ranglistát ezen a gépen?");
  if (!confirmed) return;

  localStorage.removeItem(LEADERBOARD_KEY);
  renderLeaderboard();
  beep(240, .08, "square", .025);
});

renderLeaderboard();

playerNameInput.focus();

