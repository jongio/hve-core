/* HVE Core Course — Application Logic */

const STORAGE_KEY = "hve-course-progress";
const TOTAL_MODULES = 20;

const MODULE_DATA = [
  { num: 1,  title: "What Is HVE Core?",                     semester: 1, duration: "8 min"  },
  { num: 2,  title: "Installation and First Workflow",        semester: 1, duration: "10 min" },
  { num: 3,  title: "GitHub Copilot Extension Points",        semester: 1, duration: "9 min"  },
  { num: 4,  title: "The RPI Methodology",                    semester: 1, duration: "11 min" },
  { num: 5,  title: "Collections — The Product Boundary",     semester: 1, duration: "10 min" },
  { num: 6,  title: "Agents — Specialized AI Assistants",     semester: 2, duration: "12 min" },
  { num: 7,  title: "Instructions — Auto-Applied Guidelines", semester: 2, duration: "10 min" },
  { num: 8,  title: "Prompts — Reusable Task Templates",      semester: 2, duration: "9 min"  },
  { num: 9,  title: "Skills — Self-Contained Packages",       semester: 2, duration: "11 min" },
  { num: 10, title: "Extension Packaging and Distribution",   semester: 2, duration: "10 min" },
  { num: 11, title: "The Validation Infrastructure",          semester: 2, duration: "12 min" },
  { num: 12, title: "Writing Custom Instructions",            semester: 3, duration: "11 min" },
  { num: 13, title: "Building Custom Agents",                 semester: 3, duration: "12 min" },
  { num: 14, title: "Creating Skills with Scripts and Tests", semester: 3, duration: "11 min" },
  { num: 15, title: "The Design Thinking Framework",          semester: 3, duration: "10 min" },
  { num: 16, title: "Security and RAI Planning Agents",       semester: 3, duration: "12 min" },
  { num: 17, title: "Supply Chain Security Deep Dive",        semester: 4, duration: "11 min" },
  { num: 18, title: "CI/CD Pipeline Architecture",            semester: 4, duration: "10 min" },
  { num: 19, title: "Scaling HVE to Enterprise Teams",        semester: 4, duration: "9 min"  },
  { num: 20, title: "Contributing to HVE Core",               semester: 4, duration: "8 min"  },
];

const SEMESTER_DATA = [
  { num: 1, name: "Foundations",               color: "s1", modules: [1, 2, 3, 4, 5]         },
  { num: 2, name: "Core Components",           color: "s2", modules: [6, 7, 8, 9, 10, 11]    },
  { num: 3, name: "Building and Customizing",  color: "s3", modules: [12, 13, 14, 15, 16]    },
  { num: 4, name: "Mastery",                   color: "s4", modules: [17, 18, 19, 20]        },
];

/* --- Progress Persistence --- */

function getProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function isCompleted(moduleNum) {
  return !!getProgress()[moduleNum];
}

function toggleComplete(moduleNum) {
  const progress = getProgress();
  if (progress[moduleNum]) {
    delete progress[moduleNum];
  } else {
    progress[moduleNum] = Date.now();
  }
  saveProgress(progress);
  return !!progress[moduleNum];
}

function completedCount() {
  return Object.keys(getProgress()).length;
}

function progressPercent() {
  return Math.round((completedCount() / TOTAL_MODULES) * 100);
}

/* --- Module Helpers --- */

function getModule(num) {
  return MODULE_DATA.find((m) => m.num === num) || null;
}

function padNum(n) {
  return String(n).padStart(2, "0");
}

/* --- UI Rendering (Course Page) --- */

function renderProgressBar() {
  const fill = document.querySelector(".progress-fill");
  const text = document.querySelector(".progress-text");
  if (!fill || !text) return;
  const pct = progressPercent();
  fill.style.width = pct + "%";
  text.textContent = completedCount() + " / " + TOTAL_MODULES + " completed (" + pct + "%)";
}

function renderSemesterSections() {
  const container = document.getElementById("semester-sections");
  if (!container) return;

  container.innerHTML = "";
  SEMESTER_DATA.forEach((sem) => {
    const section = document.createElement("div");
    section.className = "semester-section open";
    section.id = "semester-" + sem.num;

    const completed = sem.modules.filter((n) => isCompleted(n)).length;

    section.innerHTML =
      '<div class="semester-header" data-semester="' + sem.num + '">' +
        '<span class="chevron">▶</span>' +
        '<span class="semester-badge ' + sem.color + '">Semester ' + sem.num + "</span>" +
        "<h2>" + sem.name + "</h2>" +
        '<span class="semester-progress">' + completed + " / " + sem.modules.length + "</span>" +
      "</div>" +
      '<div class="semester-body"></div>';

    const body = section.querySelector(".semester-body");
    sem.modules.forEach((num) => {
      const mod = getModule(num);
      if (!mod) return;
      const done = isCompleted(num);
      const card = document.createElement("a");
      card.className = "module-card";
      card.href = "player.html?module=" + padNum(num);
      card.id = "module-" + padNum(num);
      card.innerHTML =
        '<span class="module-num">' + padNum(num) + "</span>" +
        '<div class="module-info">' +
          "<h4>" + mod.title + "</h4>" +
          '<span class="module-meta">' + mod.duration + "</span>" +
        "</div>" +
        '<span class="module-check ' + (done ? "completed" : "") + '">✓</span>';
      body.appendChild(card);
    });

    container.appendChild(section);
  });

  // Accordion toggle
  document.querySelectorAll(".semester-header").forEach((header) => {
    header.addEventListener("click", () => {
      header.parentElement.classList.toggle("open");
    });
  });
}

function renderSidebarNav() {
  const nav = document.getElementById("sidebar-nav");
  if (!nav) return;

  nav.innerHTML = "";
  SEMESTER_DATA.forEach((sem) => {
    const li = document.createElement("li");
    li.innerHTML =
      '<a href="#semester-' + sem.num + '">' +
        '<span class="semester-dot ' + sem.color + '"></span>' +
        "S" + sem.num + ": " + sem.name +
      "</a>";
    nav.appendChild(li);
  });
}

/* --- UI Rendering (Player Page) --- */

function getQueryModule() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("module");
  return raw ? parseInt(raw, 10) : 1;
}

function renderPlayer() {
  const num = getQueryModule();
  const mod = getModule(num);
  if (!mod) return;

  const sem = SEMESTER_DATA.find((s) => s.modules.includes(num));

  // Title and breadcrumb
  const titleEl = document.getElementById("player-title");
  const breadcrumbEl = document.getElementById("player-breadcrumb");
  if (titleEl) titleEl.textContent = mod.title;
  if (breadcrumbEl && sem) {
    breadcrumbEl.textContent = "Semester " + sem.num + ": " + sem.name + " → Module " + padNum(num);
  }

  // Page title
  document.title = "Module " + padNum(num) + ": " + mod.title + " — HVE Core";

  // Video source
  const video = document.getElementById("player-video");
  const placeholder = document.getElementById("video-placeholder");
  if (video) {
    const src = "videos/module-" + padNum(num) + ".mp4";
    video.src = src;
    video.load();
    video.addEventListener("error", () => {
      video.style.display = "none";
      if (placeholder) placeholder.style.display = "flex";
    });
    video.addEventListener("loadeddata", () => {
      video.style.display = "block";
      if (placeholder) placeholder.style.display = "none";
    });
  }

  // Mark complete button
  const completeBtn = document.getElementById("btn-complete");
  if (completeBtn) {
    updateCompleteBtn(completeBtn, num);
    completeBtn.addEventListener("click", () => {
      toggleComplete(num);
      updateCompleteBtn(completeBtn, num);
      renderPlayerSidebar();
    });
  }

  // Navigation buttons
  const prevBtn = document.getElementById("btn-prev");
  const nextBtn = document.getElementById("btn-next");
  if (prevBtn) {
    if (num > 1) {
      prevBtn.href = "player.html?module=" + padNum(num - 1);
      prevBtn.classList.remove("disabled");
    } else {
      prevBtn.removeAttribute("href");
      prevBtn.classList.add("disabled");
      prevBtn.style.opacity = "0.3";
      prevBtn.style.pointerEvents = "none";
    }
  }
  if (nextBtn) {
    if (num < TOTAL_MODULES) {
      nextBtn.href = "player.html?module=" + padNum(num + 1);
      nextBtn.classList.remove("disabled");
    } else {
      nextBtn.removeAttribute("href");
      nextBtn.classList.add("disabled");
      nextBtn.style.opacity = "0.3";
      nextBtn.style.pointerEvents = "none";
    }
  }

  renderPlayerSidebar();
}

function updateCompleteBtn(btn, num) {
  if (isCompleted(num)) {
    btn.textContent = "✓ Completed";
    btn.className = "btn btn-sm btn-secondary";
  } else {
    btn.textContent = "Mark as Complete";
    btn.className = "btn btn-sm btn-primary";
  }
}

function renderPlayerSidebar() {
  const list = document.getElementById("player-module-list");
  if (!list) return;

  const currentNum = getQueryModule();
  list.innerHTML = "";

  MODULE_DATA.forEach((mod) => {
    const li = document.createElement("li");
    const active = mod.num === currentNum ? " active" : "";
    const done = isCompleted(mod.num);
    li.innerHTML =
      '<a class="sidebar-module' + active + '" href="player.html?module=' + padNum(mod.num) + '">' +
        '<span class="sidebar-num">' + padNum(mod.num) + "</span>" +
        "<span>" + mod.title + "</span>" +
        '<span class="sidebar-check ' + (done ? "visible" : "") + '">✓</span>' +
      "</a>";
    list.appendChild(li);
  });
}

/* --- Keyboard Navigation --- */

function initKeyboardNav() {
  document.addEventListener("keydown", (e) => {
    // Ignore when typing in inputs
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    const onPlayer = !!document.getElementById("player-video");

    if (onPlayer) {
      const num = getQueryModule();
      switch (e.key) {
        case "ArrowLeft":
          if (num > 1) window.location.href = "player.html?module=" + padNum(num - 1);
          break;
        case "ArrowRight":
          if (num < TOTAL_MODULES) window.location.href = "player.html?module=" + padNum(num + 1);
          break;
        case " ": {
          e.preventDefault();
          const video = document.getElementById("player-video");
          if (video && video.style.display !== "none") {
            video.paused ? video.play() : video.pause();
          }
          break;
        }
      }
    }
  });
}

/* --- Hash Navigation (Course Page) --- */

function initHashNav() {
  function scrollToHash() {
    const hash = window.location.hash;
    if (!hash) return;
    const el = document.querySelector(hash);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Open parent semester if it's a module
      const parent = el.closest(".semester-section");
      if (parent) parent.classList.add("open");
    }
  }
  window.addEventListener("hashchange", scrollToHash);
  if (window.location.hash) setTimeout(scrollToHash, 100);
}

/* --- Init --- */

document.addEventListener("DOMContentLoaded", () => {
  // Course page init
  if (document.getElementById("semester-sections")) {
    renderSemesterSections();
    renderSidebarNav();
    renderProgressBar();
    initHashNav();
  }

  // Player page init
  if (document.getElementById("player-video")) {
    renderPlayer();
  }

  initKeyboardNav();
});
