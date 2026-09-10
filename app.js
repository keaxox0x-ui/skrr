const STORAGE_KEY = "studyDashboardData";

const defaultData = {
  ddays: [],
  todos: [],
  studies: [],
  schedule: [],
  notes: []
};

let data = loadData();

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultData, ...JSON.parse(saved) } : { ...defaultData };
  } catch {
    return { ...defaultData };
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(new Date(`${dateString}T00:00:00`));
}

function calculateDday(dateString) {
  const today = new Date(`${todayISO()}T00:00:00`);
  const target = new Date(`${dateString}T00:00:00`);
  const diff = Math.round((target - today) / 86400000);

  if (diff === 0) return "D-DAY";
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function getNearestDday() {
  if (!data.ddays.length) return null;

  const today = todayISO();

  return data.ddays
    .filter(item => item.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0] || null;
}

function renderHeroDday() {
  const el = document.querySelector("#heroDday");
  const dday = getNearestDday();

  if (!dday) {
    el.innerHTML = `
      <span class="hero-dday-label">NEXT D-DAY</span>
      <strong class="hero-dday-empty">등록된 예정 D-Day가 없습니다.</strong>
    `;
    return;
  }

  el.innerHTML = `
    <span class="hero-dday-label">${escapeHTML(dday.name)}</span>
    <strong class="hero-dday-number">${calculateDday(dday.date)}</strong>
    <span class="hero-dday-date">${formatDate(dday.date)}</span>
  `;
}

function renderDdays() {
  const el = document.querySelector("#ddayList");
  const items = [...data.ddays].sort((a, b) => a.date.localeCompare(b.date));

  if (!items.length) {
    el.innerHTML = '<div class="empty">아직 등록된 D-Day가 없습니다.</div>';
    return;
  }

  el.innerHTML = items.map(item => `
    <div class="item">
      <div class="item-main">
        <div class="item-name">${escapeHTML(item.name)}</div>
        <div class="item-sub">${formatDate(item.date)}</div>
      </div>
      <div class="item-actions">
        <span class="dday-number">${calculateDday(item.date)}</span>
        <button class="delete-btn" data-action="delete-dday" data-id="${item.id}">삭제</button>
      </div>
    </div>
  `).join("");
}

function renderTodos() {
  const el = document.querySelector("#todoList");
  if (!data.todos.length) {
    el.innerHTML = '<div class="empty">할 일이 없습니다. 꽤 평화롭군요.</div>';
    return;
  }

  // 완료된 항목은 아래로 보내고, 가장 최근에 체크된 항목일수록 더 아래에 표시합니다.
  const sortedTodos = [...data.todos].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (a.done && b.done) {
      return Number(a.completedAt || 0) - Number(b.completedAt || 0);
    }
    return 0;
  });

  el.innerHTML = sortedTodos.map(item => `
    <div class="item ${item.done ? "done" : ""}">
      <div class="item-main" style="display:flex;align-items:center;gap:9px;">
        <input class="todo-check" type="checkbox" data-action="toggle-todo" data-id="${item.id}" ${item.done ? "checked" : ""}>
        <div class="item-name">${escapeHTML(item.text)}</div>
      </div>
      <button class="delete-btn" data-action="delete-todo" data-id="${item.id}">삭제</button>
    </div>
  `).join("");
}

function renderStudies() {
  const el = document.querySelector("#studyList");
  const today = todayISO();
  const items = data.studies.filter(item => item.date === today);

  if (!items.length) {
    el.innerHTML = '<div class="empty">오늘 공부 기록이 없습니다.</div>';
  } else {
    el.innerHTML = items.map(item => `
      <div class="item">
        <div class="item-name">${escapeHTML(item.subject)}</div>
        <div class="item-actions">
          <strong>${item.minutes}분</strong>
          <button class="delete-btn" data-action="delete-study" data-id="${item.id}">삭제</button>
        </div>
      </div>
    `).join("");
  }

  const total = items.reduce((sum, item) => sum + Number(item.minutes), 0);
  document.querySelector("#todayStudyTotal").textContent = `${total}분`;
}

function renderSchedule() {
  const el = document.querySelector("#scheduleList");
  const days = ["월", "화", "수", "목", "금"];

  el.innerHTML = days.map(day => {
    const classes = data.schedule.filter(item => item.day === day);
    return `
      <div class="day-column">
        <div class="day-name">${day}</div>
        ${classes.length ? classes.map(item => `
          <div class="class-item">
            ${escapeHTML(item.subject)}
            <button class="delete-btn" data-action="delete-schedule" data-id="${item.id}">×</button>
          </div>
        `).join("") : '<div class="item-sub">-</div>'}
      </div>
    `;
  }).join("");
}

function renderNotes() {
  const el = document.querySelector("#noteList");
  if (!data.notes.length) {
    el.innerHTML = '<div class="empty">메모가 없습니다.</div>';
    return;
  }

  el.innerHTML = data.notes.map(item => `
    <div class="item">
      <div class="item-main">
        <div class="item-name">${escapeHTML(item.text)}</div>
        <div class="item-sub">${formatDate(item.date)}</div>
      </div>
      <button class="delete-btn" data-action="delete-note" data-id="${item.id}">삭제</button>
    </div>
  `).join("");
}

function renderCalendar() {
  const date = document.querySelector("#calendarDate").value || todayISO();
  const info = document.querySelector("#calendarInfo");

  const ddays = data.ddays.filter(item => item.date === date);
  const todos = data.todos.filter(item => item.dueDate === date);

  const lines = [`<strong>${formatDate(date)}</strong>`];

  if (ddays.length) {
    lines.push(`📌 D-Day: ${ddays.map(x => escapeHTML(x.name)).join(", ")}`);
  }

  if (todos.length) {
    lines.push(`☑ 할 일: ${todos.map(x => escapeHTML(x.text)).join(", ")}`);
  }

  if (lines.length === 1) {
    lines.push("이 날짜에 연결된 정보가 없습니다.");
  }

  info.innerHTML = lines.join("<br>");
}

function renderAll() {
  renderDdays();
  renderTodos();
  renderStudies();
  renderSchedule();
  renderNotes();
  renderCalendar();
  renderHeroDday();
}

document.querySelector("#todayText").textContent = formatDate(todayISO());
document.querySelector("#heroDate").textContent = formatDate(todayISO());
document.querySelector("#calendarDate").value = todayISO();

document.querySelector("#ddayForm").addEventListener("submit", e => {
  e.preventDefault();
  data.ddays.push({
    id: crypto.randomUUID(),
    name: document.querySelector("#ddayName").value.trim(),
    date: document.querySelector("#ddayDate").value
  });
  saveData();
  e.target.reset();
  renderAll();
});

document.querySelector("#todoForm").addEventListener("submit", e => {
  e.preventDefault();
  data.todos.push({
    id: crypto.randomUUID(),
    text: document.querySelector("#todoText").value.trim(),
    done: false,
    dueDate: todayISO()
  });
  saveData();
  e.target.reset();
  renderAll();
});

document.querySelector("#studyForm").addEventListener("submit", e => {
  e.preventDefault();
  data.studies.push({
    id: crypto.randomUUID(),
    subject: document.querySelector("#studySubject").value.trim(),
    minutes: Number(document.querySelector("#studyMinutes").value),
    date: todayISO()
  });
  saveData();
  e.target.reset();
  renderAll();
});

document.querySelector("#scheduleForm").addEventListener("submit", e => {
  e.preventDefault();
  data.schedule.push({
    id: crypto.randomUUID(),
    day: document.querySelector("#scheduleDay").value,
    subject: document.querySelector("#scheduleSubject").value.trim()
  });
  saveData();
  e.target.reset();
  renderAll();
});

document.querySelector("#noteForm").addEventListener("submit", e => {
  e.preventDefault();
  data.notes.unshift({
    id: crypto.randomUUID(),
    text: document.querySelector("#noteText").value.trim(),
    date: todayISO()
  });
  saveData();
  e.target.reset();
  renderAll();
});

document.querySelector("#calendarDate").addEventListener("change", renderCalendar);

document.addEventListener("click", e => {
  const button = e.target.closest("[data-action]");
  if (!button) return;

  // 체크박스는 change 이벤트에서 처리하므로 click 이벤트에서는 건드리지 않습니다.
  if (button.dataset.action === "toggle-todo") return;

  const { action, id } = button.dataset;

  if (action === "delete-dday") data.ddays = data.ddays.filter(x => x.id !== id);
  if (action === "delete-todo") data.todos = data.todos.filter(x => x.id !== id);
  if (action === "delete-study") data.studies = data.studies.filter(x => x.id !== id);
  if (action === "delete-schedule") data.schedule = data.schedule.filter(x => x.id !== id);
  if (action === "delete-note") data.notes = data.notes.filter(x => x.id !== id);

  saveData();
  renderAll();
});

document.addEventListener("change", e => {
  const checkbox = e.target;

  if (!checkbox.matches('[data-action="toggle-todo"]')) return;

  const item = data.todos.find(
    x => String(x.id) === String(checkbox.dataset.id)
  );

  if (!item) return;

  item.done = checkbox.checked;

  // 체크한 시각을 저장해 두어 최근 완료 항목이 가장 아래로 가게 합니다.
  if (checkbox.checked) {
    item.completedAt = Date.now();
  } else {
    delete item.completedAt;
  }

  saveData();
  renderTodos();
});

renderAll();
