// ===== GÜNLÜK ÇALIŞMA RESET =====
let dailyStudy = Number(localStorage.getItem("dailyStudy")) || 0;

const today = new Date().toISOString().slice(0, 10);
let lastStudyDate = localStorage.getItem("lastStudyDate");

if (lastStudyDate !== today) {
  dailyStudy = 0;
  localStorage.setItem("lastStudyDate", today);
}
// ===== KAYITLI VERİLER =====
let freeBreaks = Number(localStorage.getItem("freeBreaks"));
if (isNaN(freeBreaks)) freeBreaks = 2;
let xp = Number(localStorage.getItem("xp")) || 0;
let level = Number(localStorage.getItem("level")) || 1;
let totalStudy = Number(localStorage.getItem("totalStudy")) || 0;
let totalVideo = Number(localStorage.getItem("totalVideo")) || 0;

// ===== UI =====
function updateUI() {
  xp = Math.max(0, xp);

  document.getElementById("xp").innerText = xp;
  document.getElementById("level").innerText = level;
  document.getElementById("totalStudy").innerText = totalStudy.toFixed(2);
  document.getElementById("totalVideo").innerText = totalVideo.toFixed(2);

  document.getElementById("dailyStudy").innerText = dailyStudy.toFixed(2);
}

function save() {
  localStorage.setItem("xp", xp);
  localStorage.setItem("level", level);
  localStorage.setItem("totalStudy", totalStudy);
  localStorage.setItem("totalVideo", totalVideo);

  localStorage.setItem("dailyStudy", dailyStudy);
  localStorage.setItem("freeBreaks", freeBreaks);
  localStorage.setItem("lastBreakDate", today);
  localStorage.setItem("lastStudyDate", today);
}

// ===== LEVEL =====
function checkLevel() {
  if (xp >= level * 500) {
    level++;
    alert("Level atladın!");
  }
}

function addXP(val) {
  xp += val;
  checkLevel();
  save();
  updateUI();
}

// ===== DERS / VIDEO =====
function study() {
  totalStudy += 1;
  dailyStudy += 1;
  addXP(100);
}

function video1() {
  totalVideo += 1;
  totalStudy += 1;
  dailyStudy += 1;
  addXP(80);
}

function video2() {
  totalVideo += 1.5;
  totalStudy += 1.5;
  dailyStudy += 1.5;
  addXP(140);
}

// ===== TEST =====
function test40() {
  totalStudy += 0.66;
  dailyStudy += 0.66;
  addXP(100);
}

function test60() {
  totalStudy += 1;
  dailyStudy += 1;
  addXP(120);
}

function test90() {
  totalStudy += 1.5;
  dailyStudy += 1.5;
  addXP(160);
}

// ===== CEZA =====
function smoke() {
  addXP(-20);
}

// ===== KRONOMETRE =====
let sec = 0;
let timerInt = null;

function startTimer() {
  if (timerInt) return;
  timerInt = setInterval(() => {
    sec++;
    renderTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInt);
  timerInt = null;
}

function resetTimer() {
  stopTimer();
  sec = 0;
  renderTimer();
}

function renderTimer() {
  let h = String(Math.floor(sec / 3600)).padStart(2, "0");
  let m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  let s = String(sec % 60).padStart(2, "0");
  document.getElementById("timer").innerText = `${h}:${m}:${s}`;
}

// ===== MOLA =====
let onBreak = false;
let breakSeconds = 0;
let breakInt = null;
let overtimeSeconds = 0;
let overtimeInt = null;

function startBreak(min) {
  if (onBreak) return;

  onBreak = true;
  breakSeconds = min * 60;
  overtimeSeconds = 0;

  // 👉 ÜCRETSİZ MOLA KONTROLÜ
  if (freeBreaks > 0) {
    freeBreaks--;
  } else {
    // ❌ ÜCRETSİZ BİTTİ → ANINDA CEZA
    if (min === 10) addXP(-40);
    if (min === 30) addXP(-80);
  }

  save();
  renderBreak();

  breakInt = setInterval(() => {
    breakSeconds--;
    renderBreak();
    if (breakSeconds <= 0) {
      clearInterval(breakInt);
      startOvertime();
    }
  }, 1000);
}

function startOvertime() {
  overtimeInt = setInterval(() => {
    overtimeSeconds++;
    renderBreak();
    if (overtimeSeconds % (10 * 60) === 0) {
      addXP(-40);
    }
  }, 1000);
}

function endBreak() {
  clearInterval(breakInt);
  clearInterval(overtimeInt);
  onBreak = false;
  document.getElementById("breakStatus").innerText = "Mola yok";
  document.getElementById("overtimeStatus").innerText = "";
}

function renderBreak() {
  if (breakSeconds > 0) {
    let m = String(Math.floor(breakSeconds / 60)).padStart(2, "0");
    let s = String(breakSeconds % 60).padStart(2, "0");
    document.getElementById("breakStatus").innerText = `⏸️ Mola: ${m}:${s}`;
  } else {
    document.getElementById("breakStatus").innerText = "⚠️ Mola süresi doldu";
    let om = String(Math.floor(overtimeSeconds / 60)).padStart(2, "0");
    let os = String(overtimeSeconds % 60).padStart(2, "0");
    document.getElementById("overtimeStatus").innerText =
      `⛔ Ceza süresi: ${om}:${os} (her 10 dk -40 XP)`;
  }
}

// ===== PLAN =====
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function addTask() {
  const input = document.getElementById("taskInput");
  if (!input.value) return;
  tasks.push({ text: input.value, done: false });
  input.value = "";
  saveTasks();
  renderTasks();
}

function toggleTask(i) {
  tasks[i].done = !tasks[i].done;
  saveTasks();
  renderTasks();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  const ul = document.getElementById("taskList");
  ul.innerHTML = "";
  tasks.forEach((t, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<input type="checkbox" ${t.done ? "checked" : ""} onclick="toggleTask(${i})"> ${t.text}`;
    ul.appendChild(li);
  });
}

// ===== BAŞLAT =====
renderTimer();
renderTasks();
updateUI();
