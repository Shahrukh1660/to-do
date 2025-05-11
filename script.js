const API_BASE = 'http://localhost:5000/tasks';
const form     = document.getElementById('todo-form');
const input    = document.getElementById('todo-input');
const list     = document.getElementById('todo-list');

let tasks = [];

async function loadTasks() {
  try {
    const res = await fetch(API_BASE);
    tasks = await res.json();
    renderTasks();
  } catch (err) {
    console.error('Failed to load tasks:', err);
  }
}

function renderTasks() {
  list.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between p-3 bg-gray-50 rounded shadow';

    const label = document.createElement('label');
    const cb    = document.createElement('input');
    cb.type     = 'checkbox';
    cb.checked  = task.done;
    cb.className = 'mr-2';
    cb.addEventListener('change', () => toggleDone(task.id, cb.checked));

    const span = document.createElement('span');
    span.textContent = task.text;
    if (task.done) span.classList.add('line-through', 'text-gray-400');

    label.append(cb, span);

    const delBtn = document.createElement('button');
    delBtn.innerHTML = '&times;';
    delBtn.className = 'text-red-500 hover:text-red-700';
    delBtn.addEventListener('click', () => deleteTask(task.id));

    li.append(label, delBtn);
    list.append(li);
  });
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  try {
    await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    input.value = '';
    await loadTasks();
  } catch (err) {
    console.error('Failed to add task:', err);
  }
});

async function toggleDone(id, done) {
  try {
    await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done })
    });
    await loadTasks();
  } catch (err) {
    console.error('Failed to update task:', err);
  }
}

async function deleteTask(id) {
  try {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    await loadTasks();
  } catch (err) {
    console.error('Failed to delete task:', err);
  }
}

loadTasks();
