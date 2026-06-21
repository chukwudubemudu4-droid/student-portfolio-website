const taskStorageKey = "cos106AcademicTasks";

const sampleTasks = [
  {
    id: "task-html-revision",
    title: "Revise semantic HTML elements",
    category: "Revision",
    dueDate: "2026-06-24",
    completed: false
  },
  {
    id: "task-project-upload",
    title: "Prepare portfolio project for upload",
    category: "Project",
    dueDate: "2026-06-27",
    completed: false
  }
];

let tasks = loadTasks();

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initPlanner();
  initContactForm();
  setCurrentYear();
});

function initNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-links");

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });
}

function loadTasks() {
  let savedTasks = null;

  try {
    savedTasks = localStorage.getItem(taskStorageKey);
  } catch (error) {
    return [...sampleTasks];
  }

  if (!savedTasks) {
    return [...sampleTasks];
  }

  try {
    return JSON.parse(savedTasks);
  } catch (error) {
    return [...sampleTasks];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(taskStorageKey, JSON.stringify(tasks));
  } catch (error) {
    showMessage(document.querySelector("#planner-feedback"), "Tasks work in this page, but this browser did not save them.", true);
  }
}

function initPlanner() {
  const form = document.querySelector("#task-form");
  const list = document.querySelector("#task-list");

  if (!form || !list) {
    return;
  }

  const titleInput = document.querySelector("#task-title");
  const categoryInput = document.querySelector("#task-category");
  const dateInput = document.querySelector("#task-date");
  const feedback = document.querySelector("#planner-feedback");

  renderTasks();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = titleInput.value.trim();

    if (!title) {
      showMessage(feedback, "Please enter a task name.", true);
      titleInput.focus();
      return;
    }

    const newTask = {
      id: createTaskId(),
      title,
      category: categoryInput.value,
      dueDate: dateInput.value,
      completed: false
    };

    tasks = [newTask, ...tasks];
    saveTasks();
    renderTasks();
    form.reset();
    showMessage(feedback, "Task added successfully.", false);
  });

  list.addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-toggle-task]");

    if (!checkbox) {
      return;
    }

    tasks = tasks.map((task) => {
      if (task.id === checkbox.dataset.toggleTask) {
        return { ...task, completed: checkbox.checked };
      }
      return task;
    });

    saveTasks();
    renderTasks();
  });

  list.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-task]");

    if (!button) {
      return;
    }

    tasks = tasks.filter((task) => task.id !== button.dataset.deleteTask);
    saveTasks();
    renderTasks();
    showMessage(feedback, "Task deleted.", false);
  });
}

function renderTasks() {
  const list = document.querySelector("#task-list");
  const emptyState = document.querySelector("#empty-state");
  const totalTasks = document.querySelector("#total-tasks");
  const completedTasks = document.querySelector("#completed-tasks");

  if (!list || !emptyState || !totalTasks || !completedTasks) {
    return;
  }

  list.innerHTML = "";
  const completedCount = tasks.filter((task) => task.completed).length;

  totalTasks.textContent = tasks.length;
  completedTasks.textContent = completedCount;
  emptyState.hidden = tasks.length > 0;

  tasks.forEach((task) => {
    list.appendChild(createTaskElement(task));
  });
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = task.completed ? "task-item completed" : "task-item";

  const checkbox = document.createElement("input");
  checkbox.className = "task-check";
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.dataset.toggleTask = task.id;
  checkbox.setAttribute("aria-label", `Mark ${task.title} as completed`);

  const details = document.createElement("div");

  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = task.title;

  const meta = document.createElement("span");
  meta.className = "task-meta";
  meta.textContent = task.dueDate
    ? `${task.category} - Due ${formatDate(task.dueDate)}`
    : `${task.category} - No date set`;

  const deleteButton = document.createElement("button");
  deleteButton.className = "icon-button";
  deleteButton.type = "button";
  deleteButton.textContent = "x";
  deleteButton.dataset.deleteTask = task.id;
  deleteButton.setAttribute("aria-label", `Delete ${task.title}`);

  details.append(title, meta);
  item.append(checkbox, details, deleteButton);

  return item;
}

function createTaskId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `task-${Date.now()}`;
}

function formatDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function initContactForm() {
  const form = document.querySelector("#contact-form");

  if (!form) {
    return;
  }

  const feedback = document.querySelector("#contact-feedback");
  const fieldRules = [
    {
      id: "contact-name",
      message: "Name is required.",
      validate: (value) => value.length > 0
    },
    {
      id: "contact-email",
      message: "Email is required and must be valid.",
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    },
    {
      id: "contact-phone",
      message: "Phone number is required and must contain digits only.",
      validate: (value) => /^\d+$/.test(value)
    },
    {
      id: "contact-message",
      message: "Message is required.",
      validate: (value) => value.length > 0
    }
  ];

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let isValid = true;

    fieldRules.forEach((rule) => {
      const input = document.querySelector(`#${rule.id}`);
      const value = input.value.trim();

      if (!rule.validate(value)) {
        setFieldError(rule.id, rule.message);
        isValid = false;
      } else {
        setFieldError(rule.id, "");
      }
    });

    if (!isValid) {
      showMessage(feedback, "Please correct the highlighted fields.", true);
      return;
    }

    showMessage(feedback, "Message validated successfully. Thank you for reaching out.", false);
    form.reset();
  });
}

function setFieldError(fieldId, message) {
  const input = document.querySelector(`#${fieldId}`);
  const error = document.querySelector(`#${fieldId}-error`);
  const wrapper = input.closest(".form-field");

  error.textContent = message;
  wrapper.classList.toggle("invalid", Boolean(message));
}

function showMessage(element, message, isError) {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.classList.toggle("error", isError);
}

function setCurrentYear() {
  document.querySelectorAll("[data-year]").forEach((yearElement) => {
    yearElement.textContent = new Date().getFullYear();
  });
}
