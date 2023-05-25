// Reload webpage to go home
const reloadLinks = document.querySelectorAll(".reloadLink");
reloadLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    location.reload();
  });
});

// Function to retrieve and display all todos
function fetchTodos() {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://localhost:3000/api/todos', true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const todos = JSON.parse(xhr.responseText);
        const allTodosLength = todos.length;
        displayTodos(todos);
        displayTodoCount(todos, allTodosLength);
        createSublists(todos);
        createCompletedSublists(todos);
      } else {
        alert('Failed to fetch todos.');
      }
    }
  };
  xhr.send();
}

// Function to fetch and display only completed todos
function fetchFilteredTodos() {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://localhost:3000/api/todos', true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const todos = JSON.parse(xhr.responseText);
        const allTodosLength = todos.length;
        const filteredTodos = todos.filter(function(todo) {
          return todo.completed === true;
        });
        clearTodos();
        displayTodos(filteredTodos);
        displayTodoCount(filteredTodos, allTodosLength);
      } else {
        alert('Failed to fetch todos.');
      }
    }
  };
  xhr.send();
}

function clearTodos(){
  const todoList = document.getElementById('todosList');
  const liElements = todoList.querySelectorAll('li');
  liElements.forEach(li => {
    li.remove();
  });
}

function sortTodos(todos){
  todos.sort(function(a, b) {
    // Move completed todos to the bottom
    if (a.completed && !b.completed) { return 1 };
    // Move incomplete todos to the top
    if (!a.completed && b.completed) { return -1 };
    // Maintain order for todos with the same completion status
    return 0;
  });
  return todos;
}

function createCheckbox(todo) {
  const checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.classList.add('todo-checkbox');
  checkbox.checked = todo.completed;

  checkbox.addEventListener('click', function(event) {
    event.stopPropagation();
    const updatedTodo = { completed: !todo.completed };
    updateTodoItem(todo.id, updatedTodo);
  });
  return checkbox;
}

function createDeleteButton(todo){
  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = '<i class="fas fa-trash"></i>'; // Add the trash can icon
  deleteButton.addEventListener('click', function () {
    event.stopPropagation();
    deleteTodoItem(todo.id);
  });
  return deleteButton;
}

function displayTodoCount(todos, allTodosLength){
  const todoCount = document.createElement('span');
  todoCount.textContent = todos.length;
  const todoHeader = document.querySelector('h3');
  todoHeader.appendChild(document.createTextNode(' '));
  todoHeader.appendChild(todoCount);

  const allTodosCount = document.getElementById('allTodosCount');
  const completedTodosCount = document.getElementById('completedTodosCount');

  const completedTodos = todos.filter(todo => todo.completed).length;
  allTodosCount.textContent = `(${allTodosLength})`;
  completedTodosCount.textContent = `(${completedTodos})`;
}

function displayTodos(todos) {
  todos = sortTodos(todos);    

  const todoList = document.createElement('ul');
  todoList.setAttribute('id', 'todosList');

  todos.forEach(function (todo) {
    const listItem = document.createElement('li');
    const title = todo.title;
    const month = todo.month;
    const year = todo.year;
    let dueDate = '';

    if (month === '00' || month === '') {
      dueDate = 'No Due Date';
    } else if (year === '') {
      dueDate = `No Due Date`;
    } else {
      dueDate = `${month}/${year.slice(-2)}`;
    }

    // Create the checkbox element
    let checkbox = createCheckbox(todo);
    listItem.appendChild(checkbox);

    // Create the todo text span
    const todoText = document.createElement('span');
    todoText.classList.add('todo-text');
    todoText.textContent = `${title} - ${dueDate}`;
    listItem.appendChild(todoText);

    // Apply strikethrough if todo is completed
    if (todo.completed) {
      listItem.style.textDecoration = 'line-through';
      checkbox.checked = true;
    }

    listItem.classList.add('todo');
    let deleteButton = createDeleteButton(todo);

    // Add click event listener to open modal with todo details
    todoText.addEventListener('click', function () { openTodoModal(todo) });

    listItem.appendChild(deleteButton);
    todoList.appendChild(listItem);
  });

  const addTodo = document.getElementById('addTodo');
  addTodo.parentNode.insertBefore(todoList, addTodo.nextSibling);
}

// Call the fetchTodos function when the webpage loads
window.addEventListener('load', function() {
  fetchTodos();
});

// group todos by mm/yy combination
function createSublists(todos) {
  const sublists = {};

  todos.forEach(function (todo) {
    const month = todo.month;
    const year = todo.year;
    const dueDate = (month === '00' || year === '00') ? 'No Due Date' : (month && year) ? `${month}/${year.slice(-2)}` : 'No Due Date';

    if (!sublists[dueDate]) {
      sublists[dueDate] = [];
    }
    sublists[dueDate].push(todo);
  });

  displaySublistsOnSidebar(sublists);
  displaySublistsOnContent(sublists);
}

function displaySublistsOnSidebar(sublists) {
  const sidebar = document.getElementById('sidebar');
  const allTodosLabel = sidebar.querySelector('h4');

  // Clear existing sublists
  const existingSublists = sidebar.querySelectorAll('.sublist');
  existingSublists.forEach((sublist) => { sublist.remove() });

  // Order sublists by month/year combination
  const orderedSublists = Object.keys(sublists).sort((a, b) => {
    if (a === 'No Due Date') return 1; // 'No Due Date' sublist should always be at the top
    const [monthA, yearA] = a.split('/');
    const [monthB, yearB] = b.split('/');
    const dateA = new Date(Number(yearA), Number(monthA) - 1, 1);
    const dateB = new Date(Number(yearB), Number(monthB) - 1, 1);
    return dateB - dateA;
  });

  // Display sublists
  orderedSublists.forEach((sublistKey) => {
    const sublist = sublists[sublistKey];
    const sublistItem = document.createElement('h6');
    sublistItem.textContent = `${sublistKey} - (${sublist.length})`;
    sublistItem.classList.add('sublist');
    allTodosLabel.parentNode.insertBefore(sublistItem, allTodosLabel.nextSibling);
  });
}

function displaySublistsOnContent(sublists) {
  const sidebar = document.getElementById('sidebar');
  const sublistItems = sidebar.querySelectorAll('.sublist');

  sublistItems.forEach(function(sublistItem) {
    sublistItem.addEventListener('click', function() {
      const parts = sublistItem.textContent.split('-');
      const selectedSublist = parts[0].trim();
      const todos = sublists[selectedSublist];
      clearTodos();
      displayTodos(todos);
    });
  });
}

// group completed todos by mm/yy combination
function createCompletedSublists(todos) {
  const sublists = {};

  todos.forEach(function (todo) {
    if (todo.completed) {
      const month = todo.month;
      const year = todo.year;
      const dueDate = (month === '00' || year === '00') ? 'No Due Date' : (month && year) ? `${month}/${year.slice(-2)}` : 'No Due Date';

      if (!sublists[dueDate]) { sublists[dueDate] = []; }
      sublists[dueDate].push(todo);
    }
  });
  displayCompletedSublistsOnSidebar(sublists);
  displayCompletedSublistsOnContent(sublists);
  return sublists;
}

function displayCompletedSublistsOnSidebar(sublists) {
  const sidebar = document.getElementById('sidebar');
  const completedTodosLabel = sidebar.querySelector('#completedTodos');

  // Clear existing completed sublists
  const existingSublists = sidebar.querySelectorAll('.completed-sublist');
  existingSublists.forEach((sublist) => { sublist.remove(); });

   // Order sublists by month/year combination
  const orderedSublists = Object.keys(sublists).sort((a, b) => {
    if (a === 'No Due Date') return 1; // 'No Due Date' sublist should always be at the top
    const [monthA, yearA] = a.split('/');
    const [monthB, yearB] = b.split('/');
    const dateA = new Date(Number(yearA), Number(monthA) - 1, 1);
    const dateB = new Date(Number(yearB), Number(monthB) - 1, 1);
    return dateB - dateA;
  });

  // Display completed sublists
  orderedSublists.forEach((sublistKey) => {
    const sublist = sublists[sublistKey];
    const sublistItem = document.createElement('h6');
    sublistItem.textContent = `${sublistKey} - (${sublist.length})`;
    sublistItem.classList.add('completed-sublist');
    completedTodosLabel.parentNode.insertBefore(sublistItem, completedTodosLabel.nextSibling);
  });
}

function displayCompletedSublistsOnContent(sublists) {
  const sidebar = document.getElementById('sidebar');
  const sublistItems = sidebar.querySelectorAll('.completed-sublist');

  sublistItems.forEach(function (sublistItem) {
    sublistItem.addEventListener('click', function () {
      const parts = sublistItem.textContent.split('-');
      const selectedSublist = parts[0].trim();
      const todos = sublists[selectedSublist];
      clearTodos();
      displayTodos(todos);
    });
  });
}

// Function to delete a todo item
function deleteTodoItem(todoId) {
  const xhr = new XMLHttpRequest();
  xhr.open('DELETE', `http://localhost:3000/api/todos/${todoId}`, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 204) {
        alert('Todo deleted successfully.');
        // Refresh page after deletion
        location.reload();
      } else {
        alert('Failed to delete todo.');
      }
    }
  };
  xhr.send();
}

// Show modal when "+ Add new todo" is clicked
const addTodo = document.getElementById('addTodo');
const modalOverlay = document.getElementById('modal-overlay');
const modal = document.getElementById('modal');
const cancelButton = document.getElementById('cancelButton');
const newSaveButton = document.getElementById('new-saveButton');

// Close modal when click is outside
window.onclick = function(event){
  if (event.target === modalOverlay){ modalOverlay.style.display = 'none' };
  if (event.target === modal){ modal.style.display = 'none'; };
}

// Hide edit save button and display new save button
const hideEditSaveButton = document.getElementById('edit-saveButton');
hideEditSaveButton.style.display = "none";
const showNewSaveButton = document.getElementById('new-saveButton');
showNewSaveButton.style.display = "block";
// Hide Mark As Complete and Mark As Incomplete buttons
const hideMarkCompleteButton = document.getElementById('markCompleteButton');
hideMarkCompleteButton.style.display = "none";
const hideMarkIncompleteButton = document.getElementById('markIncompleteButton');
hideMarkIncompleteButton.style.display = "none";

addTodo.addEventListener('click', function() {
  modalOverlay.style.display = 'block';
  modal.style.display = 'block';
});

cancelButton.addEventListener('click', function() {
  modalOverlay.style.display = 'none';
  modal.style.display = 'none';
  location.reload();
});

newSaveButton.addEventListener('click', function() {
  const title = document.getElementById('title').value.trim();
  if (title.length < 3) {
    alert('Title must be at least 3 characters long.');
    return;
  }

  const dueDay = document.getElementById('dueDay').selectedIndex;
  const dueMonth = document.getElementById('dueMonth').selectedIndex;
  const dueYear = document.getElementById('dueYear').value;
  const completed = false;
  const description = document.getElementById('description').value.trim();

  const todoData = {
    title,
    day: dueDay.toString().padStart(2, '0'),
    month: dueMonth.toString().padStart(2, '0'),
    year: dueYear,
    completed,
    description,
  };

  const xhr = new XMLHttpRequest();

  xhr.open('POST', 'http://localhost:3000/api/todos', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 201) {
        const response = JSON.parse(xhr.responseText);
        alert('Todo saved successfully!');
        modalOverlay.style.display = 'none';
        modal.style.display = 'none';
        // Refresh page after adding new todo
        location.reload();
      } else {
        alert('Todo cannot be saved.');
      }
    }
  };
  xhr.send(JSON.stringify(todoData));
});

function updateTodoItem(todoId, updatedTodo) {
  const xhr = new XMLHttpRequest();
  xhr.open('PUT', `http://localhost:3000/api/todos/${todoId}`, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        alert('Todo updated successfully.');
        // Refresh page after update
        location.reload();
      } else {
        alert('Failed to update todo.');
      }
    }
  };
  xhr.send(JSON.stringify(updatedTodo));
}

function openTodoModal(todo) {
  const titleInput = document.getElementById('title');
  const dueDaySelect = document.getElementById('dueDay');
  const dueMonthSelect = document.getElementById('dueMonth');
  const dueYearSelect = document.getElementById('dueYear');
  const descriptionTextarea = document.getElementById('description');
  const editSaveButton = document.getElementById('edit-saveButton');

  // Hide new save button and show edit save button
  const hideNewSaveButton = document.getElementById('new-saveButton');
  hideNewSaveButton.style.display = "none";
  const showEditSaveButton = document.getElementById('edit-saveButton');
  showEditSaveButton.style.display = "block";

  if (todo.completed === false){
    // Show Mark As Complete button
    const markCompleteButton = document.getElementById('markCompleteButton');
    markCompleteButton.style.display = "block";

    // mark todo as complete
    markCompleteButton.addEventListener('click', function() {
      const updatedTodo = {
        completed: true
      };
      updateTodoItem(todo.id, updatedTodo);
    });
  } else {
    // Show Mark As Incomplete button
    const markIncompleteButton = document.getElementById('markIncompleteButton');
    markIncompleteButton.style.display = 'block';
    // mark todo as incomplete
    markIncompleteButton.addEventListener('click', function() {
      const updatedTodo = {
        completed: false
      };
      updateTodoItem(todo.id, updatedTodo);
    });
  }

  // Populate the modal with todo data
  titleInput.value = todo.title;
  dueDaySelect.value = todo.day.replace(/^0+/, ''); // Remove leading zero if it exists
  dueMonthSelect.value = convertMonthIndexToName(todo.month);
  dueYearSelect.value = todo.year;
  descriptionTextarea.value = todo.description;

  modalOverlay.style.display = 'block';
  modal.style.display = 'block';

  // Update todo on save button click
  editSaveButton.addEventListener('click', function() {
    const updatedTitle = titleInput.value.trim();
    if (updatedTitle.length < 3) {
      alert('Title must be at least 3 characters long.');
      return;
    }

    const updatedDueDay = dueDaySelect.value;
    const updatedDueMonth = dueMonthSelect.selectedIndex;
    const updatedDueYear = dueYearSelect.value;
    const updatedDescription = descriptionTextarea.value.trim();

    const updatedTodo = {
      title: updatedTitle,
      day: updatedDueDay.toString().padStart(2, '0'),
      month: updatedDueMonth.toString().padStart(2, '0'),
      year: updatedDueYear,
      description: updatedDescription,
    };

    updateTodoItem(todo.id, updatedTodo);
  });
}

// Get references to the required elements
const allTodosList = document.getElementById('allTodos');
const completedTodosList = document.getElementById('completedTodos');
const todosHeader = document.getElementById('listHeader');

// Add click event listener to the 'Completed Todos' list item
completedTodosList.addEventListener('click', function() {
  // Change the header text to 'Completed Todos'
  todosHeader.textContent = 'Completed Todos - ';
  fetchFilteredTodos();
});

// Function to convert month index to name
function convertMonthIndexToName(monthIndex) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[parseInt(monthIndex) - 1];
}

// Generate options for day dropdown
const dueDaySelect = document.getElementById('dueDay');
for (let day = 1; day <= 31; day++) {
  const option = document.createElement('option');
  option.value = day;
  option.textContent = day;
  dueDaySelect.appendChild(option);
}

// Generate options for month dropdown
const dueMonthSelect = document.getElementById('dueMonth');
const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];
for (let i = 0; i < months.length; i++) {
  const option = document.createElement('option');
  option.value = months[i];
  option.textContent = months[i];
  dueMonthSelect.appendChild(option);
}

// Generate options for year dropdown
const dueYearSelect = document.getElementById('dueYear');
const currentYear = new Date().getFullYear();
const nextDecade = currentYear + 10;
for (let year = currentYear; year <= nextDecade; year++) {
  const option = document.createElement('option');
  option.value = year;
  option.textContent = year;
  dueYearSelect.appendChild(option);
}