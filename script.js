let timer = null;
let timeLeft = 25 * 60;
let totalTime = 25 * 60;
let isRunning = false;
let tasks = JSON.parse(localStorage.getItem('pomodoroTasks')) || [];

const timerDisplay = document.getElementById("timerDisplay");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const status = document.getElementById("status");
const progressFill = document.getElementById("progressFill");
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);

  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  progressFill.style.width = progress + "%";
}

function startTimer() {
  if (timeLeft <= 0) {
    timeLeft = totalTime;
  }

  isRunning = true;
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  status.textContent = "Minuteur en cours...";

  timer = setInterval(() => {
    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
      clearInterval(timer);
      isRunning = false;
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      status.textContent = "Temps écoulé ! 🎉";

      if ("Notification" in window) {
        new Notification("Pomodoro terminé !", {
          body: "Votre session de 25 minutes est terminée.",
          icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIgMmMtNS41MjIgMC0xMCA0LjQ3OC0xMCAxMHM0LjQ3OCAxMCAxMCAxMCAxMC00LjQ3OCAxMC0xMC00LjQ3OC0xMC0xMC0xMHptMCAxOGMtNC40MTEgMC04LTMuNTg5LTgtOHMzLjU4OS04IDgtOCA4IDMuNTg5IDggOC0zLjU4OSA4LTggOHptMS0xM2gtMnY2bDUuMjUgMy4xNS43NS0xLjIzLTQuNS0yLjY3di01LjI4eiIvPjwvc3ZnPg==",
        });
      }

      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhCjOF0fPTgC4AJnvK7+OVSQwTY7zx+qNDFwotjNn+4K1XIwklc8T6t2QVECl6yvXQdjEELYPL8+GQSA=="
      );
      audio.play().catch((e) => console.log("Audio not supported"));
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  status.textContent = "Minuteur en pause";
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  timeLeft = totalTime;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  status.textContent = "Prêt à commencer";
  updateDisplay();
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

document.addEventListener("DOMContentLoaded", () => {
  updateDisplay();
  displayTasks();

  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  } else if (e.code === "Escape") {
    resetTimer();
  }
});

function addTask() {
  const taskDescription = taskInput.value.trim();
  if (taskDescription === "") {
    alert("Veuillez entrer une description de tâche");
    return;
  }
  
  const now = new Date();
  const task = {
    id: Date.now(),
    description: taskDescription,
    timestamp: now.toLocaleString('fr-FR'),
    completed: false
  };
  
  tasks.unshift(task);
  localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
  taskInput.value = "";
  displayTasks();
}

function deleteTask(taskId) {
  tasks = tasks.filter(task => task.id !== taskId);
  localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
  displayTasks();
}

function displayTasks() {
  if (tasks.length === 0) {
    taskList.innerHTML = '<div class="empty-history">Aucune tâche enregistrée</div>';
    return;
  }
  
  taskList.innerHTML = tasks.map(task => `
    <div class="task-item">
      <div class="task-time">${task.timestamp}</div>
      <div class="task-description">${task.description}</div>
      <button class="task-delete" onclick="deleteTask(${task.id})">×</button>
    </div>
  `).join('');
}

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    addTask();
  }
});
