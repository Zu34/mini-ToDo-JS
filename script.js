
let tasks = [];
let deletedTasks = [];
let currentFilter = "all";

// Start the app
document.addEventListener("DOMContentLoaded", function () {
  loadStoredTasks();
  document.getElementById("add-task-btn").addEventListener("click", createTask);
  document.getElementById("task-input").addEventListener("keypress", function (e) {
    if (e.key === "Enter") createTask();
  });
  document.getElementById("trash-bin-icon").addEventListener("click", toggleTrashBin);
});

// Create a new task
function createTask() {
  const taskInput = document.getElementById("task-input");
  const taskDate = document.getElementById("task-date").value;
  const taskTime = document.getElementById("task-time").value;
  const reminderCheckbox = document.getElementById("reminder-checkbox").checked;

  const newTaskText = taskInput.value.trim();
  if (newTaskText) {
    const taskDateTime = taskDate && taskTime ? new Date(`${taskDate}T${taskTime}`) : null;

    const newTask = {
      id: Date.now(),
      text: newTaskText,
      completed: false,
      deleted: false,
      date: taskDateTime,
      reminder: reminderCheckbox,
    };

    tasks.push(newTask);
    taskInput.value = "";
    document.getElementById("task-date").value = "";
    document.getElementById("task-time").value = "";
    document.getElementById("reminder-checkbox").checked = false;

    storeTasks();
    filterTasks(currentFilter);
  }
}

// Filter tasks
function filterTasks(status) {
  currentFilter = status;
  let filteredTasks = tasks;

  if (status === "completed") {
    filteredTasks = tasks.filter(task => task.completed);
  } else if (status === "pending") {
    filteredTasks = tasks.filter(task => !task.completed);
  }

  displayTasks(filteredTasks);
}

// Display tasks
function displayTasks(filteredTasks) {
  const taskContainer = document.getElementById("task-container");
  taskContainer.innerHTML = "";

  if (filteredTasks.length === 0) {
    taskContainer.textContent = "No tasks to display.";
    return;
  }

  filteredTasks.forEach(task => {
    const card = document.createElement("div");
    card.classList.add("task-card");
    if (task.completed) card.classList.add("completed");

    const taskText = document.createElement("div");
    taskText.textContent = task.text;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("click", () => toggleTaskCompletion(task.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    card.appendChild(taskText);
    card.appendChild(checkbox);
    card.appendChild(deleteBtn);
    taskContainer.appendChild(card);
  });
}

// Toggle task completion
function toggleTaskCompletion(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    storeTasks();
    filterTasks(currentFilter);
  }
}

// Delete a task
function deleteTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    tasks = tasks.filter(t => t.id !== taskId);
    deletedTasks.push(task);
    storeTasks();
    filterTasks(currentFilter);
    updateTrashBinCount();
  }
}

// Show or hide the trash bin
function toggleTrashBin() {
  const trashContainer = document.getElementById("trash-container");
  trashContainer.style.display = trashContainer.style.display === "none" ? "block" : "none";

  trashContainer.innerHTML = "<h2>Deleted Tasks</h2>";

  // Add "Empty All Trash" button
  const emptyAllButton = document.createElement("button");
  emptyAllButton.textContent = "Empty All Trash";
  emptyAllButton.classList.add("empty-trash-btn");
  emptyAllButton.addEventListener("click", emptyTrashBin);
  trashContainer.appendChild(emptyAllButton);

  if (deletedTasks.length === 0) {
    trashContainer.innerHTML += "<div>No deleted tasks.</div>";
    return;
  }

  deletedTasks.forEach(task => {
    const card = document.createElement("div");
    card.classList.add("task-card", "deleted");

    const taskText = document.createElement("div");
    taskText.textContent = task.text;

    const restoreBtn = document.createElement("button");
    restoreBtn.textContent = "Restore";
    restoreBtn.addEventListener("click", () => restoreTask(task.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete Permanently";
    deleteBtn.addEventListener("click", () => permanentlyDeleteTask(task.id));

    card.appendChild(taskText);
    card.appendChild(restoreBtn);
    card.appendChild(deleteBtn);
    trashContainer.appendChild(card);
  });
}

// Empty- bin
function emptyTrashBin() {
  if (deletedTasks.length > 0 && confirm("Are you sure you want to permanently delete all tasks in the trash?")) {
    deletedTasks = [];
    storeTasks();
    toggleTrashBin();
    updateTrashBinCount();
  }
}

// Restore a task
function restoreTask(taskId) {
  const task = deletedTasks.find(t => t.id === taskId);
  if (task) {
    deletedTasks = deletedTasks.filter(t => t.id !== taskId);
    tasks.push(task);
    storeTasks();
    toggleTrashBin();
    filterTasks(currentFilter);
    updateTrashBinCount();
  }
}

// Permanently delete a task
function permanentlyDeleteTask(taskId) {
  deletedTasks = deletedTasks.filter(t => t.id !== taskId);
  storeTasks();
  toggleTrashBin();
  updateTrashBinCount();
}

// Update the trash bin count
function updateTrashBinCount() {
  const trashBin = document.getElementById("trash-bin-icon");
  trashBin.textContent = `Trash (${deletedTasks.length})`;
}

// Local Storage Functions
function storeTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("deletedTasks", JSON.stringify(deletedTasks));
}

function loadStoredTasks() {
  tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  deletedTasks = JSON.parse(localStorage.getItem("deletedTasks")) || [];
  filterTasks(currentFilter);
  updateTrashBinCount();
}
